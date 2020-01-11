const fs = require('fs');
const path = require('path');

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split(',')
  .map(Number);

function IntComp(program) {
  this.program = program.slice();
  this.pointer = 0;
}

IntComp.prototype.runDiagnostic = function(inputs) {
  while (true) {
    const instruction = this.program[this.pointer];
    const codes = String(instruction);
    const opcode = Number(codes.slice(-2));
    const paramModes = codes.slice(0, -2);

    const { params, shouldJump, numAdvance } = this.getParams(opcode, paramModes);
    switch (opcode) {
      case IntComp.opcodeVals.ADD:
        this.add(...params);
        break;
      case IntComp.opcodeVals.MULTIPLY:
        this.multiply(...params);
        break;
      case IntComp.opcodeVals.INPUT:
        this.input(inputs.shift());
        break;
      case IntComp.opcodeVals.OUTPUT:
        this.pointer += numAdvance;
        return params[0];
      case IntComp.opcodeVals.JUMP_TRUE:
      case IntComp.opcodeVals.JUMP_FALSE:
        if (shouldJump) {
          this.jump(params[1]);
        }
        break;
      case IntComp.opcodeVals.LESS_THAN:
        this.lessThan(...params);
        break;
      case IntComp.opcodeVals.EQUALS:
        this.equals(...params);
        break;
      case IntComp.opcodeVals.END:
        return IntComp.HALT;
      default:
        throw new Error(`Something went wrong at opcode ${opcode}`);
    }

    this.pointer += numAdvance;
  }
};

IntComp.prototype.getParams = function(opcode, paramModes) {
  const arithmetic = [IntComp.opcodeVals.ADD, IntComp.opcodeVals.MULTIPLY];
  const io = [IntComp.opcodeVals.INPUT, IntComp.opcodeVals.OUTPUT];
  const jump = [IntComp.opcodeVals.JUMP_TRUE, IntComp.opcodeVals.JUMP_FALSE];
  const compare = [IntComp.opcodeVals.LESS_THAN, IntComp.opcodeVals.EQUALS];

  const params = [];
  let shouldJump = false;
  let numAdvance;
  if (arithmetic.includes(opcode) || compare.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(
        Number(paramModes[paramModes.length - i]) === IntComp.paramModeVals.IMMEDIATE
          ? this.program[this.pointer + i]
          : this.program[this.program[this.pointer + i]]
      );
    }
    params.push(this.program[this.pointer + 3]);
    numAdvance = 4;
  } else if (io.includes(opcode)) {
    params.push(
      Number(paramModes) === IntComp.paramModeVals.IMMEDIATE
        ? this.program[this.pointer + 1]
        : this.program[this.program[this.pointer + 1]]
    );
    numAdvance = 2;
  } else if (jump.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(
        Number(paramModes[paramModes.length - i]) === IntComp.paramModeVals.IMMEDIATE
          ? this.program[this.pointer + i]
          : this.program[this.program[this.pointer + i]]
      );
    }
    shouldJump = opcode === IntComp.opcodeVals.JUMP_TRUE
      ? params[0] !== 0
      : params[0] === 0;
    numAdvance = shouldJump ? 0 : 3;
  }

  return { params, numAdvance, shouldJump };
};

IntComp.prototype.add = function(opA, opB, target) {
  this.program[target] = opA + opB;
};

IntComp.prototype.multiply = function(opA, opB, target) {
  this.program[target] = opA * opB;
};

IntComp.prototype.input = function(n) {
  const target = this.program[this.pointer + 1];
  this.program[target] = n;
};

IntComp.prototype.jump = function(pointer) {
  this.pointer = pointer;
};

IntComp.prototype.lessThan = function(opA, opB, target) {
  this.program[target] = opA < opB ? 1 : 0;
};

IntComp.prototype.equals = function(opA, opB, target) {
  this.program[target] = opA === opB ? 1 : 0;
};

IntComp.opcodeVals = {
  ADD: 1,
  MULTIPLY: 2,
  INPUT: 3,
  OUTPUT: 4,
  JUMP_TRUE: 5,
  JUMP_FALSE: 6,
  LESS_THAN: 7,
  EQUALS: 8,
  END: 99,
};

IntComp.paramModeVals = {
  POSITION: 0,
  IMMEDIATE: 1,
};

IntComp.HALT = 'HALT';

// See https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/permutations/permutateWithoutRepetitions.js
function getPhaseSettings(permOpts) {
  if (permOpts.length === 1) return [permOpts];

  const perms = [];
  const smallerPerms = getPhaseSettings(permOpts.slice(1));
  const firstOpt = permOpts[0];
  for (let permIdx = 0; permIdx < smallerPerms.length; permIdx++) {
    const smallerPerm = smallerPerms[permIdx];

    for (let posIdx = 0; posIdx <= smallerPerm.length; posIdx++) {
      const prefix = smallerPerm.slice(0, posIdx);
      const suffix = smallerPerm.slice(posIdx);
      perms.push([...prefix, firstOpt, ...suffix]);
    }
  }

  return perms;
}

function findMaxOuput(program, start, stop) {
  const length = stop - start + 1;
  const initSettings = Array.from({ length }, (_, i) => start + i);
  const phaseSettings = getPhaseSettings(initSettings);

  return phaseSettings.reduce((max, settings) => {
    const amps = Array.from({ length }, _ => new IntComp(program));
    const output = amps.reduce((output, amp, i) => {
      return amp.runDiagnostic([settings[i], output]);
    }, 0);

    return Math.max(output, max);
  }, 0);
}

function findMaxOuputFeedbackLoop(program, start, stop) {
  const length = stop - start + 1;
  const initSettings = Array.from({ length }, (_, i) => start + i);
  const phaseSettings = getPhaseSettings(initSettings);
  
  return phaseSettings.reduce((max, settings) => {
    const amps = Array.from({ length }, _ => new IntComp(program));
    const inputs = Array.from({ length }, (_, i) => {
      return [settings[i], ...(i === 0 ? [0] : [])];
    });

    let halt = false;
    let i = 0;
    let latestOutput;
    while (!halt) {
      const result = amps[i].runDiagnostic(inputs[i]);
      if (result === IntComp.HALT) {
        halt = true;
      } else {
        if (i === length - 1) latestOutput = result;
        const nextAmpIdx = (i + 1) % length;
        inputs[nextAmpIdx].push(result);
        i = nextAmpIdx;
      }
    }

    return Math.max(latestOutput, max);
  }, 0);
}

// Part 1
console.log(findMaxOuput(input, 0, 4));
// Part 2
console.log(findMaxOuputFeedbackLoop(input, 5, 9));
