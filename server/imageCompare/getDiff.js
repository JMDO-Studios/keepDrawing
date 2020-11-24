const compareImages = require('resemblejs/compareImages');
const fs = require('fs');

async function getDiff(path1, path2) {
  try {
    const img1 = fs.readFileSync(path1);
    const img2 = fs.readFileSync(path2);

    const data = await compareImages(img1, img2);
    console.log('DATA', data);
    return data;
  } catch (error) {
    console.log('ERROR', error);
    return error;
  }
}

module.exports = getDiff;
