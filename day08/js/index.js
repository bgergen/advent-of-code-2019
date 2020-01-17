const fs = require('fs');
const path = require('path');

const colors = {
  BLACK: 0,
  WHITE: 1,
  TRANSPARENT: 2,
};

const input = fs
  .readFileSync(path.join(__dirname, '../input.txt'))
  .toString();

function checkFidelity(transmission, width, height) {
  const layers = getSlices(transmission, width * height);
  const numZeroes = layers.map(layer => {
    let total = 0;
    for (i = 0; i < layer.length; i++) {
      if (Number(layer[i]) === 0) total++;
    }
    return total;
  });

  let fewestZeroes = Infinity;
  let idx = 0;
  numZeroes.forEach((num, i) => {
    if (num < fewestZeroes) {
      fewestZeroes = num;
      idx = i;
    }
  });

  const layer = layers[idx];
  let numOnes = 0;
  let numTwos = 0;
  for (let i = 0; i < layer.length; i++) {
    const digit = Number(layer[i]);
    if (digit === 1) numOnes++;
    else if (digit === 2) numTwos++;
  }

  return numOnes * numTwos;
}

function decodeImage(transmission, width, height) {
  const layers = getSlices(transmission, width * height);
  const layersByRows = layers.map(layer => getSlices(layer, width));

  const decodedImg = Array.from({ length: height }, () => []);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      for (let k = 0, pixelFound = false; k < layersByRows.length, !pixelFound; k++) {
        const pixelVal = Number(layersByRows[k][j][i]);
        if (pixelVal !== colors.TRANSPARENT) {
          decodedImg[j][i] = pixelVal;
          pixelFound = true;
        }
      }
    }
  }

  return decodedImg;
}

function translateDecoding(img) {
  return img.reduce((fullTranslation, row) => {
    const translatedRow = row.reduce((rowTranslation, pixel) => {
      const translatedPixel = pixel === colors.BLACK ? '\u25A0' : '\u25A1';
      return rowTranslation + translatedPixel;
    }, '');
    return fullTranslation + translatedRow + '\n';
  }, '');
}

function getSlices(str, lenSlice) {
  const layers = [];
  let i = 0;
  while (i < str.length) {
    const j = i + lenSlice;
    layers.push(str.slice(i, j));
    i = j;
  }
  return layers;
}

// Part 1
console.log(checkFidelity(input, 25, 6));
// Part 2
console.log(translateDecoding(decodeImage(input, 25, 6)));
