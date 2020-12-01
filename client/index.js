<<<<<<< HEAD
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
camera.setAttribute('wasd-controls', {acceleration:100});
camera.setAttribute('look-controls');

scene.appendChild(camera);
root.appendChild(scene);
=======
import imageGameLogic from './sockets/imageGame';
import waitingRoomLogic from './sockets/waitingRoom';

if (window.location.pathname === '/waitingroom') {
  waitingRoomLogic();
}

if (window.location.pathname === '/imagegame') {
  imageGameLogic();
}
>>>>>>> d002d01e2ce3f0dba86fd69e38a320bbc2af51e6
