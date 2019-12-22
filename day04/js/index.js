const input = '272091-815432';

function satisfiesConditions(num) {
  const numStr = num.toString();
  let hasRepeatDigit = false;
  for (let i = 0; i < numStr.length - 1; i++) {
    const currChar = numStr[i];
    if (currChar === numStr[i+1]) {
      if (numStr[i+2] !== currChar) {
        hasRepeatDigit = true;
      } else {
        while (numStr[i+1] === currChar) {
          i++;
        }
      }
    };
    if (currChar > numStr[i+1]) return false;
  }
  return hasRepeatDigit;
}

function findNumberOfPasswords(range) {
  let [min, max] = range.split('-').map(Number);
  let numPasswords = 0;
  for (; min <= max; min++) {
    if (satisfiesConditions(min)) numPasswords++;
  }
  return numPasswords;
}

console.log(findNumberOfPasswords(input));
