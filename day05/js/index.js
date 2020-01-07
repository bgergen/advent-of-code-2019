const fs = require('fs');
const path = require('path');

const myInput = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split(',')
  .map(Number);

const opcodeVals = {
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

const paramModeVals = {
  POSITION: 0,
  IMMEDIATE: 1,
};

function runIntcode(input, inputInstr) {
  const program = input.slice();
  const arithmetic = [opcodeVals.ADD, opcodeVals.MULTIPLY];
  const io = [opcodeVals.INPUT, opcodeVals.OUTPUT];
  const jump = [opcodeVals.JUMP_TRUE, opcodeVals.JUMP_FALSE];
  const compare = [opcodeVals.LESS_THAN, opcodeVals.EQUALS];

  let i = 0;
  while (i < program.length) {
    const instruction = program[i];
    const codes = String(instruction);
    const opcode = Number(codes.slice(-2));
    const paramModes = codes.slice(0, -2);

    const params = [];
    let shouldJump;
    let numAdvance;
    if (arithmetic.includes(opcode) || compare.includes(opcode)) {
      for (let j = 1; j < 3; j++) {
        params.push(
          Number(paramModes[paramModes.length - j]) === paramModeVals.IMMEDIATE
            ? program[i+j]
            : program[program[i+j]]
        );
      }
      params.push(program[i+3]);
      numAdvance = 4;
    } else if (io.includes(opcode)) {
      params.push(
        Number(paramModes) === paramModeVals.IMMEDIATE
          ? program[i+1]
          : program[program[i+1]]
      );
      numAdvance = 2;
    } else if (jump.includes(opcode)) {
      for (let j = 1; j < 3; j++) {
        params.push(
          Number(paramModes[paramModes.length - j]) === paramModeVals.IMMEDIATE
            ? program[i+j]
            : program[program[i+j]]
        );
      }
      shouldJump = opcode === opcodeVals.JUMP_TRUE
        ? params[0] !== 0
        : params[0] === 0;
      numAdvance = shouldJump ? 0 : 3;
    }

    const [operandA, operandB, targetIdx] = params;
    switch (opcode) {
      case opcodeVals.ADD:
        program[targetIdx] = operandA + operandB;
        break;
      case opcodeVals.MULTIPLY:
        program[targetIdx] = operandA * operandB;
        break;
      case opcodeVals.INPUT:
        program[program[i+1]] = inputInstr;
        break;
      case opcodeVals.OUTPUT:
        const output = params[0];
        if (program[i+2] === opcodeVals.END) return output;
        if (output !== 0) {
          throw new Error(`Received non-zero output of ${output}`);
        }
        break;
      case opcodeVals.JUMP_TRUE:
      case opcodeVals.JUMP_FALSE:
        if (shouldJump) {
          i = params[1];
        }
        break;
      case opcodeVals.LESS_THAN:
        program[targetIdx] = operandA < operandB ? 1 : 0;
        break;
      case opcodeVals.EQUALS:
        program[targetIdx] = operandA === operandB ? 1 : 0;
        break;
      default:
        throw new Error(`Something went wrong at opcode ${opcode}, index ${i}`);
    }

    i += numAdvance;
  }

  throw new Error('Did not receive end code');
}


// Part 1
console.log(runIntcode(myInput, 1));
// Part 2
console.log(runIntcode(myInput, 5));
