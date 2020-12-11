// const compareImages = require('resemblejs/compareImages');
const resemble = require('resemblejs');

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
// async function getDiffFinal(drawing, clue) {
//   try {
//     const options = {
//       output: {
//         largeImageThreshold: 0,
//         useCrossOrigins: false,
//         outputDiff: false,
//       },
//       ignore: 'nothing',
//     };
//     const data = await compareImages(drawing, clue, options);
//     return data;
//   } catch (error) {
//     console.log('ERROR', error);
//     return error;
//   }
// }

resemble.outputSettings({ useCrossOrigin: false });

function getDiff(drawing, clue) {
  let diff;
  resemble(drawing).compareTo(clue).ignoreNothing()
    .onComplete(function(data) { diff = data });
  return diff;
}

module.exports = { getDiff };
