const fs = require('fs');
const path = require('path');

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split('\n');

function getPoints(wirePath) {
  const dX = { L: -1, R: 1, U: 0, D: 0 };
  const dY = { L: 0, R: 0, U: 1, D: -1 };
  const points = {};
  let x = 0;
  let y = 0;
  let length = 0;

  const cmdList = wirePath.split(',');
  cmdList.forEach(cmd => {
    const dir = cmd[0];
    const n = Number(cmd.slice(1));
    if (!dX.hasOwnProperty(dir)) {
      throw new Error(`Direction "${dir}" not found`);
    }

    for (let i = 1; i <= n; i++) {
      x += dX[dir];
      y += dY[dir];
      length++;
      const key = `${x},${y}`;
      if (!points.hasOwnProperty(key)) {
        points[key] = length;
      }
    }
  });

  return points;
}

function intersection(pA, pB) {
  const pointsA = new Set(Object.keys(pA));
  const pointsB = new Set(Object.keys(pB));
  return [...pointsA].filter(p => pointsB.has(p));
}

function closestIntersection(wires) {
  const [a, b] = wires.map(wire => getPoints(wire));
  const intersections = intersection(a, b);
  return Math.min(
    ...intersections.map(p => {
      const [x, y] = p.split(',');
      return Math.abs(x) + Math.abs(y);
    })
  );
}

function fewestCombinedSteps(wires) {
  const [a, b] = wires.map(wire => getPoints(wire));
  const intersections = intersection(a, b);
  return Math.min(...intersections.map(p => a[p] + b[p]));
}

// Part 1
console.log(closestIntersection(input));
// Part 2
console.log(fewestCombinedSteps(input));
