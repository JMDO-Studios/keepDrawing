import React from 'react';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import {
  AdvancedDynamicTexture, Button, TextBlock, Control, Grid,
} from '@babylonjs/gui';
import {
  Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, FreeCamera, DynamicTexture, Texture, VideoTexture, Color3, HighlightLayer,
} from '@babylonjs/core';

function createTextBox(initialText, parent) {
  const canvasHeight = document.getElementById('gameCanvas').height;
  const text = new TextBlock('TextBlock', `${initialText}:`);
  text.color = 'gold';
  text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  text.width = 1;
  parent.addRowDefinition(canvasHeight / 2 / parent.rowCount, true);
  for (let row = 0; row < parent.rowCount - 1; row += 1) {
    parent.setRowDefinition(row, canvasHeight / 2 / parent.rowCount, true);
  }
  const row = parent.rowCount - 1;
  parent.addControl(text, row, 0);
  return [text, row];
}

function addText(initialText, parent) {
  const text = new TextBlock('TextBlock', initialText);
  text.color = 'gold';
  text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  text.width = 1;
  const row = parent.rowCount - 1;
  parent.addControl(text, row, 1);
  return text;
}

function createGUI() {
  const grid = new Grid();
  grid.width = 0.2;
  grid.addColumnDefinition(0.8, false);
  grid.addColumnDefinition(0.3, false);
  grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  advancedTexture.addControl(grid);

  // create timer
  createTextBox('Your teammate is', grid);
  const teamMateName = addText('0', grid);

  createTextBox('Time Left', grid);
  const timer = addText('Get Ready!', grid);

  createTextBox('Images submitted', grid);
  const clueCount = addText('0', grid);

  return {
    grid, timer, clueCount, teamMateName,
  };
}

function createScoreDisplay(teamNames, parent) {
  createTextBox(teamNames, parent);
  const score = addText('0', parent);
  return score;
}

function initializeScores(labelText, scores, teamName, parent) {
  scores[teamName] = { score: 0, names: labelText };
  scores[teamName].scoreDisplay = createScoreDisplay(scores[teamName].names, parent);
}

function updateScore(teamName, newScore, scores) {
  const teamScore = scores[teamName];
  teamScore.score = newScore;
  teamScore.scoreDisplay.text = `${newScore}`;
}

function initializeScene(canvas) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;
  scene.ambientColor = new Color3(1, 1, 1);

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

function createImagePlane(type, sphere, scene, highlightLayer) {
  const { width, height } = document.getElementById('drawingCanvas');
  const meshWidth = 1; // change this value to adjust the mesh size
  const scaledHeight = meshWidth * (height / width);
  const mesh = MeshBuilder.CreatePlane(type,
    { width: meshWidth, height: meshWidth * scaledHeight, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(type === 'drawing' ? sphere.position.x + meshWidth / 2 + 0.1 : sphere.position.x - meshWidth / 2 - 0.1,
    sphere.position.y + scaledHeight,
    sphere.position.z);
  const material = new StandardMaterial(`${type}Image`, scene);
  if (type === 'clue' || type === 'drawing') {
    material.opacityTexture = new DynamicTexture('DynamicTexture', { width: mesh.width, height: mesh.height }, scene);
    material.opacityTexture.hasAlpha = true;
  } else {
    mesh.rotation.y = Math.PI; // rotate the mesh so that the back is showing to the player and video mirrors horizontally
    const video = document.getElementById('myVideo');
    const webcamTexture = new VideoTexture('video', video, scene, false, false);
    material.emissiveTexture = webcamTexture;
    material.diffuseTexture = webcamTexture; // same texture must be assigned to both emissive and diffuse, diffuse only is too dark and emissive only is too bright and washed out
  }
  // mesh.outlineColor = Color3.Red();
  // mesh.outlineWidth = 0.1;
  // mesh.renderOutline = true;
  highlightLayer.addMesh(mesh, Color3.Red());
  mesh.material = material;
  return mesh;
}

function createButtonPlane(type, parent, scene) {
  const mesh = MeshBuilder.CreatePlane(type,
    { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(
    parent.position.x,
    parent.position.y - 0.4,
    parent.position.z,
  );
  return mesh;
}

function createButton(mesh, instance, socket, scene) {
  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
  const button = Button.CreateSimpleButton('but1', 'Submit', scene);
  button.width = 0.5;
  button.height = 0.1;
  button.color = 'white';
  button.fontSize = 50;
  button.background = 'green';
  button.onPointerUpObservable.add(() => {
    socket.emit('submitDrawing', { gameRoom: socket.gameName, teamRoom: socket.teamName, drawing: instance.lastReceivedDrawingURL });
  });
  advancedTexture.addControl(button);
}

function redrawTexture(mesh, newURL) {
  mesh.material.opacityTexture.updateURL(newURL);
}

function addDrawingObservable(instance, scene, drawingMesh, socket) {
  instance.drawingObservable = scene.onBeforeRenderObservable.add(() => {
    const drawingImage = document.getElementById('drawingCanvas');
    const drawingImageURL = drawingImage.toDataURL();
    if (drawingImageURL !== instance.lastSentDrawingURL) {
      redrawTexture(drawingMesh, drawingImageURL);
      instance.lastSentDrawingURL = drawingImageURL;
      socket.emit('drawingChanged', {
        imageData: drawingImageURL,
      });
    }
  });
}

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: props.socket,
    };
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

    this.highlightLayer = new HighlightLayer("hl1", scene);

    // create ground plane and assign it a texture
    this.ground = createGround(scene);

    // create camera object and initalize customize functionality
    this.camera = initalizeCamera(canvas, scene);

    // create scene objects
    this.teammate = createTeammate(scene);
    const { teammate } = this;
    this.drawingMesh = createImagePlane('drawing', teammate, scene, this.highlightLayer);
    const { drawingMesh } = this;

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

    // create GUI
    const {
      grid, timer, clueCount, teamMateName,
    } = createGUI();

    const scores = {};

    /// register socket events /////////////

    socket.on('initialize', ({
      teamName, gameName, members, drawer, clueGiver, teams,
    }) => {
      socket.teamName = teamName;
      socket.gameName = gameName;
      const [teamMate] = members.filter((member) => member.id !== socket.id);
      socket.teamMate = teamMate.name;
      socket.role = drawer.name === socket.name ? 'drawer' : 'clueGiver';
      teamMateName.text = teamMate.name;

      // send the handtrack canvas to teammate every frame. in the future this should be optimized to emit on canvas change instead of every frame
      if (socket.role === 'drawer') {
        this.clueMesh = createImagePlane('hand', teammate, scene, this.highlightLayer);
        addDrawingObservable(this, scene, drawingMesh, socket);
      } else {
        this.clueMesh = createImagePlane('clue', teammate, scene, this.highlightLayer);
        this.buttonMesh = createButtonPlane('submit', drawingMesh, scene);
        this.submitButton = createButton(this.buttonMesh, this, socket, scene);
      }
      // create your team first so that it always shows up first in list
      console.log('grid is', grid);
      initializeScores('Your Score', scores, teamName, grid);

      // for each team, add their names, score, and submitted clues to HUD
      Object.keys(teams).forEach((team) => {
        if (team !== teamName) {
          const label = `${teams[team].members[0].name} & ${teams[team].members[1].name}`;
          initializeScores(label, scores, team, grid);
        }
      });
    });

    // change texture of plane when receiving image data
    socket.on('drawingChanged', ({ drawingURL }) => {
      redrawTexture(drawingMesh, drawingURL);
      this.lastReceivedDrawingURL = drawingURL;
    });

    // share resemblejs results with team
    socket.on('comparisonResults', (payload) => console.log(payload.percent));

    // change a team's score and display
    socket.on('update score', ({ teamName, score }) => {
      updateScore(teamName, score, scores);
    });

    // change texture of clue when receiving image data
    socket.on('new clue', ({ clueURL }) => {
      if (socket.role === 'clueGiver') {
        socket.role = 'drawer';
        this.buttonMesh.dispose(true, true);
        this.clueMesh.dispose(true, true);
        this.clueMesh = createImagePlane('hand', teammate, scene, this.highlightLayer);
        addDrawingObservable(this, scene, drawingMesh, socket);
      } else {
        socket.role = 'clueGiver';
        // delete mesh, replace it with appropriate version, add observable
        scene.onBeforeRenderObservable.remove(this.drawingObservable);
        this.clueMesh.dispose(true, true);
        this.clueMesh = createImagePlane('clue', teammate, scene, this.highlightLayer);
        redrawTexture(this.clueMesh, clueURL);
        this.buttonMesh = createButtonPlane('submit', drawingMesh, scene);
        this.submitButton = createButton(this.buttonMesh, this, socket, scene);
      }
    });

    // start clock
    socket.on('startClock', (gameState) => {
      const { time } = gameState;
      const teamInfo = gameState.teams[socket.teamName];
      const { currentClueURL } = teamInfo;

      if (socket.role === 'clueGiver') redrawTexture(this.clueMesh, currentClueURL.data);

      let count = time;
      scene.onBeforeRenderObservable.add((thisScene) => {
        if (!thisScene.deltaTime) return;

        // countdown timer
        if (count > 0) {
          count -= (thisScene.deltaTime / 1000);
          timer.text = String(Math.round(count));
        } else timer.text = 'BOOM!';
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
