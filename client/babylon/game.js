import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
// import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import {
  Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, Color3, FreeCamera, DynamicTexture,
} from '@babylonjs/core';

import io from 'socket.io-client';

function getBase64Image(img) {
  const c = document.createElement('canvas');
  c.height = img.naturalHeight;
  c.width = img.naturalWidth;
  const ctx = c.getContext('2d');

  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL();
}

export default class Game {
  constructor() {
    // create the canvas html element and attach it to the webpage
    this.canvas = document.createElement('canvas');
    const { canvas } = this;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);
    // initialize babylon scene and engine
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    const { scene } = this;
    scene.gravity = new Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;

    this.light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    this.ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 });
    const { ground } = this;
    ground.checkCollisions = true;
    const groundMat = new StandardMaterial('groundMat');
    groundMat.diffuseColor = new Color3(0, 1, 0);
    ground.material = groundMat;

    this.camera = new FreeCamera('FreeCamera', new Vector3(0, 1, 0), scene);
    const { camera } = this;
    camera.ellipsoid = new Vector3(1, 1, 1);
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.cameraAcceleration = 0.005;
    camera.maxCameraSpeed = 1;

    camera.inputs.clear();
    camera.inputs.addMouse();
    camera.attachControl(canvas, true);

    this.sphere = MeshBuilder.CreateSphere('sphere', { diameter: 0.5 }, scene);
    const { sphere } = this;
    sphere.checkCollisions = true;
    sphere.position = new Vector3(0, 1, 2);

    const clue = MeshBuilder.CreatePlane('clue', { size: 0.5, sideOrientation: Mesh.DOUBLESIDE }, scene);
    clue.position = new Vector3(sphere.position.x, sphere.position.y + 0.5, sphere.position.z);
    const clueImage = new StandardMaterial('clueImage', scene);
    clueImage.diffuseTexture = new DynamicTexture('DynamicTexture', { width: clue.width, height: clue.height }, scene);
    clue.material = clueImage;

    // hide/show the Inspector
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    window.addEventListener('keydown', (ev) => {
      // prevent scrolling
      switch (ev.keyCode) {
        case 37:
        case 39:
        case 38:
        case 40: // Arrow key codes
          ev.preventDefault();
          break; // prevent window scroll
        default:
          break; // do not block other keys
      }
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // set up socket
    const socket = io();

    // set up test image clicking functionality
    const clickableImages = Array.from(document.getElementsByClassName('clickable'));
    // const receivedImage = document.getElementById('received');
    const matchResult = document.getElementById('matchResult');

    // send to image data to server on click
    clickableImages.forEach((image) => {
      image.addEventListener('click', (event) => {
        socket.emit('imageClicked', {
          data: getBase64Image(event.target),
        });
      });
    });

    // change texture of plane when receiving image data
    socket.on('imageClicked', (data) => {
      // console.log(data);
      // receivedImage.src = data.data;
      matchResult.innerText = `Match percentage: ${data.percent}%`;

      clueImage.diffuseTexture.updateURL(data.data);
    });

    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
