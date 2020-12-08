import React from 'react';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import {
  AdvancedDynamicTexture, Button, TextBlock, Rectangle,
} from '@babylonjs/gui';
import {
  Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, FreeCamera, DynamicTexture, Texture,
} from '@babylonjs/core';

function createGUI() {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  const x = new TextBlock('TextBlock', 'Get Ready!');
  const rect1 = new Rectangle();
  rect1.width = 0.05;
  rect1.horizontalAlignment = 0;
  rect1.verticalAlignment = 0;
  rect1.height = '40px';
  rect1.cornerRadius = 10;
  rect1.color = 'black';
  rect1.thickness = 4;
  rect1.background = 'grey';
  advancedTexture.addControl(rect1);
  rect1.addControl(x);

  return x;
}

function initializeScene(canvas) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;

  return [engine, scene];
}

function createGround(scene) {
  const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 });
  ground.checkCollisions = true;
  const groundMat = new StandardMaterial('groundMat');
  groundMat.diffuseTexture = new Texture('https://www.babylonjs-playground.com/textures/grass.dds', scene);
  ground.material = groundMat;

  return ground;
}

function initalizeCamera(canvas, scene) {
  const camera = new FreeCamera('FreeCamera', new Vector3(0, 1, 0), scene);
  camera.ellipsoid = new Vector3(1, 1, 1);
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.cameraAcceleration = 0.005;
  camera.maxCameraSpeed = 1;

  camera.inputs.clear();
  camera.inputs.addMouse();
  camera.attachControl(canvas, true);

  return camera;
}

function createTeammate(scene) {
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 0.5 }, scene);
  sphere.checkCollisions = true;
  sphere.position = new Vector3(0, 1, 2);

  return sphere;
}

function createImagePlane(type, sphere, scene) {
  const mesh = MeshBuilder.CreatePlane(type,
    { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(type === 'clue' ? sphere.position.x - 0.5 : sphere.position.x + 0.5,
    sphere.position.y + 0.5,
    sphere.position.z);
  const material = new StandardMaterial(`${type}Image`, scene);
  material.opacityTexture = new DynamicTexture('DynamicTexture', { width: mesh.width, height: mesh.height }, scene);
  material.opacityTexture.hasAlpha = true;
  mesh.material = material;

  return mesh;
}

function createButton (type, sphere, scene) {
  const mesh = MeshBuilder.CreatePlane(type, 
    { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(
    sphere.position.x - 0.5,
    sphere.position.y,
    sphere.position.z
  );
  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
  const button1 = Button.CreateSimpleButton("but1", "Click Me", scene);
    button1.width = 1;
    button1.height = 0.4;
    button1.color = "white";
    button1.fontSize = 50;
    button1.background = "green";
    button1.onPointerUpObservable.add(function() {
        alert("you did it!");
    });
    advancedTexture.addControl(button1)
}

function redrawTexture(mesh, newURL, currentURL) {
  currentURL = newURL;
  mesh.material.opacityTexture.updateURL(newURL);
}

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = { socket: props.socket };
  }

  componentDidMount() {
    const { socket } = this.state;

    // get canvas element
    this.canvas = document.getElementById('gameCanvas');
    const { canvas } = this;

    // create babylon engine, build and customize scene
    [this.engine, this.scene] = initializeScene(canvas);
    const { engine, scene } = this;

    this.light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
    const { light1 } = this;

    // create ground plane and assign it a texture
    this.ground = createGround(scene);
    const { ground } = this;
    // create camera object and initalize customize functionality
    this.camera = initalizeCamera(canvas, scene);
    const { camera } = this;

    // create scene objects
    this.teammate = createTeammate(scene);
    const { teammate } = this;
    this.clueMesh = createImagePlane('clue', teammate, scene);
    this.drawingMesh = createImagePlane('drawing', teammate, scene);
    const { clueMesh, drawingMesh } = this;
    this.submitButton = createButton('submit', teammate, scene);
    const { submitButton } = this;

    // initialize plane texture URLs
    this.currentClueURL = '';
    this.lastSentDrawingURL = '';
    this.lastReceivedDrawingURL = '';

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
      // hide/show the Inspector
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // send the handtrack canvas to teammate every frame. in the future this should be optimized to emit on canvas change instead of every frame
    scene.onBeforeRenderObservable.add(() => {
      const handImage = document.getElementById('drawingCanvas');
      const imageURL = handImage.toDataURL();
      if (imageURL !== this.lastSentDrawingURL) {
        this.lastSentDrawingURL = imageURL;
        socket.emit('drawingChanged', {
          imageData: imageURL,
        });
      }
    });

    // create GUI
    const countdown = createGUI();

    /// register socket events /////////////

    socket.on('initialize', ({
      teamName, gameName, members, drawer, clueGiver,
    }) => {
      socket.teamName = teamName;
      socket.gameName = gameName;
      const [teamMate] = members.filter((member) => member.id !== socket.id);
      socket.teamMate = teamMate.name;
      socket.role = drawer.name === socket.name ? 'drawer' : 'clueGiver';
      // change your player role and chose with objects to render accordingly
    });

    // change texture of plane when receiving image data
    socket.on('drawingChanged', ({ drawingURL }) => {
      if (drawingURL !== this.lastReceivedDrawingURL) {
        redrawTexture(drawingMesh, drawingURL, this.lastReceivedDrawingURL);
      }
    });

    // change texture of clue when receiving image data
    socket.on('newClue', ({ clueURL }) => {
      if (clueURL !== this.currentClueURL) {
        redrawTexture(clueMesh, clueURL, this.currentClueURL);
      }
    });

    // start clock
    socket.on('startClock', (gameState) => {
      const { time } = gameState;
      const teamInfo = gameState[socket.teamName];
      const { currentClueURL } = teamInfo;

      redrawTexture(clueMesh, currentClueURL, this.currentClueURL);

      let count = time;
      scene.onBeforeRenderObservable.add((thisScene) => {
        if (!thisScene.deltaTime) return;

        // countdown timer
        if (count > 0) {
          count -= (thisScene.deltaTime / 1000);
          countdown.text = String(Math.round(count));
        } else countdown.text = 'BOOM!';
      });
    });

    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  render() {
    return (
      <canvas id="gameCanvas" style={{ width: '100%', height: '100%' }} />
    );
  }
}
