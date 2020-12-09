const compareImages = require('resemblejs/compareImages');
// const fs = require('fs');

// async function getDiff(path1, path2) {
//   try {
//     const img1 = fs.readFileSync(path1);
//     const img2 = fs.readFileSync(path2);

//     const data = await compareImages(img1, img2);
//     return data;
//   } catch (error) {
//     console.log('ERROR', error);
//     return error;
//   }
// }
// async function getDiffTestSocket(clientImg, imgPath) {
//   try {
//     const serverImg = fs.readFileSync(imgPath);
//     const data = await compareImages(clientImg, serverImg);
//     return data;
//   } catch (error) {
//     console.log('ERROR', error);
//     return error;
//   }
// }
async function getDiffFinal(drawing, clue) {
  try {
    const data = await compareImages(drawing, clue);
    return data;
  } catch (error) {
    console.log('ERROR', error);
    return error;
  }
}
module.exports = { getDiff, getDiffTestSocket, getDiffFinal };
