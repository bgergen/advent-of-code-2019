const fs = require('fs');
const path = require('path');

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split('\n')
  .map(Number);

function calculate(mass) {
  return Math.floor(mass / 3) - 2;
}

function calculateModFuelReq(remaining) {
  const fuel = calculate(remaining);
  if (fuel <= 0) return 0;
  return fuel + calculateModFuelReq(fuel);
}

function findTotalFuelReq(massList) {
  return massList.reduce((acc, curr) => {
    return acc + calculateModFuelReq(curr);
  }, 0);
}

console.log(findTotalFuelReq(input));
