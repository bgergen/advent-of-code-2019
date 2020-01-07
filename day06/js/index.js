const fs = require('fs');
const path = require('path');

const CENTER_OF_MASS = 'COM';
const SANTA = 'SAN';
const ME = 'YOU';

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString()
  .split('\n')
  .map(n => n.split(')'));

const directOrbitMap = input.reduce((orbits, orbit) => {
  const [orbited, orbiting] = orbit;
  if (orbits.hasOwnProperty(orbiting)) {
    throw new Error(`Object ${orbiting} cannot orbit > 1 other object`);
  }
  orbits[orbiting] = orbited;
  return orbits;
}, {});

function calcTotalOrbits(orbitMap) {
  return Object.values(getTotalOrbitsMap(orbitMap))
    .reduce((acc, curr) => acc + curr);
}

function getTotalOrbitsMap(orbitMap) {
  return Object.keys(orbitMap)
    .reduce((acc, curr) => {
      if (acc.hasOwnProperty(curr)) return acc;
      acc[curr] = calcNumOrbits(curr, acc);
      return acc;
    }, {});
}

function calcNumOrbits(orbiting, totalOrbitsMap) {
  const directOrbit = directOrbitMap[orbiting];
  if (directOrbit === CENTER_OF_MASS) return 1;
  if (!totalOrbitsMap.hasOwnProperty(directOrbit)) {
    totalOrbitsMap[directOrbit] = calcNumOrbits(directOrbit, totalOrbitsMap);
  }
  return totalOrbitsMap[directOrbit] + 1;
}

function getPath(orbit, orbitMap) {
  const directOrbit = orbitMap[orbit];
  if (directOrbit === CENTER_OF_MASS) return [];
  return [directOrbit, ...getPath(directOrbit, orbitMap)];
}

function findFarthestCommonOrbit(orbitMap, totalOrbitsMap, orbitPair) {
  const [santaOrbit, myOrbit] = orbitPair;

  const santaPath = getPath(santaOrbit, orbitMap);
  const myPath = new Set(getPath(myOrbit, orbitMap));

  return Math.max(
    ...santaPath
      .filter(orb => myPath.has(orb))
      .map(orb => totalOrbitsMap[orb])
  );
}

function findClosestDistance(orbitMap) {
  const totalOrbitsMap = getTotalOrbitsMap(orbitMap);
  const orbitPair = [orbitMap[SANTA], orbitMap[ME]];
  const farthestCommonOrbit = findFarthestCommonOrbit(orbitMap, totalOrbitsMap, orbitPair);

  return totalOrbitsMap[SANTA] + totalOrbitsMap[ME] - farthestCommonOrbit * 2 - 2;
}

// Part 1
console.log(calcTotalOrbits(directOrbitMap));
// Part 2
console.log(findClosestDistance(directOrbitMap));
