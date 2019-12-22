const fs = require('fs');
const path = require('path');
const IntcodeComputer = require('../../IntcodeComputer');

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split(',')
  .map(Number);

const intcodeComputer = new IntcodeComputer(input);

// Part 1
console.log(intcodeComputer.runDiagnostic(1));
// Part 2
console.log(intcodeComputer.runDiagnostic(5));
