/// this is just a page to check the comparison function lcoated in getDiff.js
/// we can delete this for production

const express = require('express');
const getDiff = require('./getDiff.js');

const app = express();

const assetUrls = ['testAssets/black.jpg',
  'testAssets/white.jpg',
  'testAssets/leftblack.jpg',
  'testAssets/rightblack.jpg',
  'testAssets/topblack.jpg',
  'testAssets/bottomblack.jpg',
];

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
