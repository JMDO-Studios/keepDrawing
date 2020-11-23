const compareImages = require('resemblejs/compareImages');
const fs = require('fs');

const express = require('express');

const app = express();

const assetUrls = ['testAssets/black.jpg',
  'testAssets/white.jpg',
  'testAssets/leftblack.jpg',
  'testAssets/rightblack.jpg',
  'testAssets/topblack.jpg',
  'testAssets/bottomblack.jpg',
];

async function getDiff(path1, path2) {
  try {
    const img1 = fs.readFileSync(path1);
    const img2 = fs.readFileSync(path2);

    const data = await compareImages(img1, img2);
    console.log('DATA', data);
    return data;
  } catch (error) {
    console.log('ERROR=========================', error);
    return error;
  }
}

app.get('/', (req, res) => {
  const promises = [];

  assetUrls.forEach((asset) => {
    assetUrls.forEach((compareAsset) => {
      promises.push(getDiff(`./public/${asset}`, `./public/${compareAsset}`));
    });
  });

  Promise.all(promises).then((percentages) => {
    res.send(`
    <html>
     <head>
       <title>My site</title>
     </head>
     <body>
       <h1>ResembleJs tests</h1>
    ${assetUrls.map((asset, idx1) => (`
      <div style='background-color:grey;'>
      ${assetUrls.map((compareAsset, idx2) => (`
        <img src=${asset}></img>
        <img src=${compareAsset}></img>
        <h5>Percent Match: ${100 - percentages[(idx1 * 5) + idx2].misMatchPercentage}</h5>
        `))}
        </div>`
  ))}
     </body>
    </html>
  `);
  });
});

module.exports = app;
