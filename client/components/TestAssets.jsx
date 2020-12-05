import React from 'react';

export default () => (
  <div>
    <img alt="testasset" id="targetImage" src="testAssets/rightblack.jpg" style={{ height: '200px', width: '200px' }} />
    <hr />
    <div id="srcImages" style={{ backgroundColor: 'beige' }}>
      <img alt="testasset" className="clickable" src="testAssets/black.jpg" style={{ height: '200px', width: '200px' }} />
      <img alt="testasset" className="clickable" src="testAssets/white.jpg" style={{ height: '200px', width: '200px' }} />
      <img alt="testasset" className="clickable" src="testAssets/leftblack.jpg" style={{ height: '200px', width: '200px' }} />
      <img alt="testasset" className="clickable" src="testAssets/rightblack.jpg" style={{ height: '200px', width: '200px' }} />
      <img alt="testasset" className="clickable" src="testAssets/topblack.jpg" style={{ height: '200px', width: '200px' }} />
      <img alt="testasset" className="clickable" src="testAssets/bottomblack.jpg" style={{ height: '200px', width: '200px' }} />
    </div>
  </div>
);
