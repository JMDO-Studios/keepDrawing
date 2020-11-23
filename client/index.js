require('aframe');
require('./world/components/setup');

const root = document.getElementById('root');

// the embedded component comes standard and fixes some css styling conflicts
// and setup is custom component that builds the scene state for us
const scene = document.createElement('a-scene');
scene.setAttribute('embedded');
scene.setAttribute('setup', '');

const camera = document.createElement('a-entity');
camera.setAttribute('camera');
camera.setAttribute('wasd-controls');
camera.setAttribute('look-controls');

scene.appendChild(camera);
root.appendChild(scene);
