const fs = require('fs');
const path = require('path');

const myInput = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split(',')
  .map(Number);

const output = Number(fs.readFileSync(path.join(__dirname, '../output.txt')));

const opcodes = {
  ADD: 1,
  MULTIPLY: 2,
  END: 99,
};

const limit = 99;

function runIntcode(input) {
  const program = input.slice();
  for (let i = 0; i < program.length; i += 4) {
    const operands = [program[program[i+1]], program[program[i+2]]];
    const targetIdx = program[i+3];
    switch (program[i]) {
      case opcodes.ADD:
        program[targetIdx] = operands[0] + operands[1];
        break;
      case opcodes.MULTIPLY:
        program[targetIdx] = operands[0] * operands[1];
        break;
      case opcodes.END:
        return program[0];
      default:
        throw new Error('Something went wrong');
    }
  }
  throw new Error('Did not receive end code');
}

function getState(input, noun, verb) {
  input[1] = noun;
  input[2] = verb;
  return input;
}

function restoreState(input) {
  return getState(input, 12, 2);
}

function findNounAndVerb(input, output) {
  for (let noun = 0; noun <= limit; noun++) {
    for (let verb = 0; verb <= limit; verb++) {
      const program = getState(input.slice(), noun, verb);
      if (runIntcode(program) === output) {
        console.log({ noun, verb });
        return 100 * noun + verb;
      }
    }
  }
  throw new Error('No noun + verb combination could be found');
}

// Part 1
console.log(runIntcode(restoreState(myInput)));

// Part 2
console.log(findNounAndVerb(myInput, output));
