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
  this.relBase = 0;
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
        this.input(inputs.shift(), params[0]);
        break;
      case IntComp.opcodeVals.OUTPUT:
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
      case IntComp.opcodeVals.ADJUST_BASE:
        this.adjustBase(params[0]);
        break;
      case IntComp.opcodeVals.END:
        return null;
      default:
        throw new Error(`Something went wrong at opcode ${opcode}, params: ${params}`);
    }

    this.pointer += numAdvance;
  }
};

IntComp.prototype.getParams = function(opcode, paramModes) {
  const arithmetic = [IntComp.opcodeVals.ADD, IntComp.opcodeVals.MULTIPLY];
  const io = [IntComp.opcodeVals.INPUT, IntComp.opcodeVals.OUTPUT, IntComp.opcodeVals.ADJUST_BASE];
  const jump = [IntComp.opcodeVals.JUMP_TRUE, IntComp.opcodeVals.JUMP_FALSE];
  const compare = [IntComp.opcodeVals.LESS_THAN, IntComp.opcodeVals.EQUALS];

  const params = [];
  let shouldJump = false;
  let numAdvance;
  if (arithmetic.includes(opcode) || compare.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(this.getVal(paramModes[paramModes.length - i], i));
    }
    params.push(this.getTarget(paramModes[paramModes.length - 3], 3));
    numAdvance = 4;
  } else if (io.includes(opcode)) {
    if (opcode === IntComp.opcodeVals.INPUT) {
      params.push(this.getTarget(paramModes, 1));
    } else {
      params.push(this.getVal(paramModes, 1));
    }
    numAdvance = 2;
  } else if (jump.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(this.getVal(paramModes[paramModes.length - i], i));
    }
    shouldJump = opcode === IntComp.opcodeVals.JUMP_TRUE
      ? params[0] !== 0
      : params[0] === 0;
    numAdvance = shouldJump ? 0 : 3;
  }

  return { params, numAdvance, shouldJump };
};

IntComp.prototype.getTarget = function(paramMode = 0, i) {
  let val = this.program[this.pointer + i];
  switch (Number(paramMode)) {
    case IntComp.paramModeVals.POSITION:
      break;
    case IntComp.paramModeVals.RELATIVE:
      val += this.relBase;
      break;
    default:
      throw new Error('Invalid parameter mode');
  }
  return val || 0;
};

IntComp.prototype.getVal = function(paramMode = 0, i) {
  let val = this.program[this.pointer + i];
  switch (Number(paramMode)) {
    case IntComp.paramModeVals.POSITION:
      val = this.program[val];
      break;
    case IntComp.paramModeVals.IMMEDIATE:
      break;
    case IntComp.paramModeVals.RELATIVE:
      val = this.program[val + this.relBase];
      break;
    default:
      throw new Error('Invalid parameter mode');
  }
  return val || 0;
};

IntComp.prototype.add = function(opA, opB, target) {
  this.program[target] = opA + opB;
};

IntComp.prototype.multiply = function(opA, opB, target) {
  this.program[target] = opA * opB;
};

IntComp.prototype.input = function(n, target) {
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

IntComp.prototype.adjustBase = function(param) {
  this.relBase += param;
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
  ADJUST_BASE: 9,
  END: 99,
};

IntComp.paramModeVals = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2,
};

function runTest(program, n) {
  if (n == undefined) {
    return program.slice();
  }
  const prog = new IntComp(program);
  return prog.runDiagnostic([n]);
}


// Part 1
console.log(runTest(input, 1));

// Part 2
console.log(runTest(input, 2));
