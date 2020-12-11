import React from 'react';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import {
  AdvancedDynamicTexture, Button, TextBlock, Rectangle, StackPanel, Control,
} from '@babylonjs/gui';
import {
  Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, FreeCamera, DynamicTexture, Texture, VideoTexture, Color3,
} from '@babylonjs/core';

function createTextBox(initialText, parent) {
  const text = new TextBlock('TextBlock', `${initialText}:`);
  text.paddingLeft = '5px';
  text.color = 'gold';
  const rect1 = new Rectangle();
  rect1.width = 1;
  rect1.height = '40px';
  rect1.thickness = 0;
  text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  parent.addControl(rect1);
  rect1.addControl(text);

  return rect1;
}

function addText(initialText, textBox) {
  const text = new TextBlock('TextBlock', initialText);
  text.color = 'gold';
  text.paddingRight = '5px';
  text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  textBox.addControl(text);
  return text;
}

function createGUI() {
  const stackPanel = new StackPanel();
  stackPanel.width = 0.2;
  stackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  advancedTexture.addControl(stackPanel);

  // create timer
  const teamMateBox = createTextBox('Your teammate is', stackPanel);
  const timeBox = createTextBox('Time Left', stackPanel);
  const countBox = createTextBox('Images submitted', stackPanel);

  const timer = addText('Get Ready!', timeBox);
  const clueCount = addText('0', countBox);
  const teamMateName = addText('', teamMateBox);

  return {
    stackPanel, timer, clueCount, teamMateName,
  };
}

function createScoreDisplay(teamNames, parent) {
  const scoreBox = createTextBox(teamNames, parent);
  const score = addText('0', scoreBox);
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

function createImagePlane(type, sphere, scene) {
  const { width, height } = document.getElementById('drawingCanvas');
  const meshWidth = 1; // change this value to adjust the mesh size
  const scaledHeight = meshWidth * (height / width);
  const mesh = MeshBuilder.CreatePlane(type,
    { width: meshWidth, height: meshWidth * scaledHeight, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(type === 'drawing' ? sphere.position.x + meshWidth / 2 : sphere.position.x - meshWidth / 2,
    sphere.position.y + scaledHeight,
    sphere.position.z);
  const material = new StandardMaterial(`${type}Image`, scene);
  if (type === 'clue' || type === 'drawing') {
    material.opacityTexture = new DynamicTexture('DynamicTexture', { width: mesh.width, height: mesh.height }, scene);
    material.opacityTexture.hasAlpha = true;
  } else {
    const video = document.getElementById('myVideo');
    material.emissiveTexture = new VideoTexture('video', video, scene, false, false);

    // theoretically we can mix and match textures, levels, and colors until we find the brightness we like.
    // this is going to take trial and error
    material.emissiveTexture.level = 0.5;
    // material.diffuseColor = new Color3(1, 1, 1);
    // material.specularColor = new Color3(0, 0, 0);
  }
  mesh.material = material;
  return mesh;
}

function createButtonPlane(type, parent, scene, instance, socket) {
  const mesh = MeshBuilder.CreatePlane(type,
    { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
    scene);
  mesh.position = new Vector3(
    parent.position.x,
    parent.position.y - 0.3,
    parent.position.z,
  );
  return mesh;
}

function createButton(mesh, instance, socket, scene) {
  // const mesh = MeshBuilder.CreatePlane(type,
  //   { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
  //   scene);
  // mesh.position = new Vector3(
  //   parent.position.x,
  //   parent.position.y - 0.3,
  //   parent.position.z,
  // );
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

    // create ground plane and assign it a texture
    this.ground = createGround(scene);

    // create camera object and initalize customize functionality
    this.camera = initalizeCamera(canvas, scene);

    // create scene objects
    this.teammate = createTeammate(scene);
    const { teammate } = this;
    this.drawingMesh = createImagePlane('drawing', teammate, scene);
    const { drawingMesh } = this;
    this.buttonMesh = createButtonPlane('submit', drawingMesh, scene);
    const { buttonMesh } = this;

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
      stackPanel, timer, clueCount, teamMateName,
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
        this.clueMesh = createImagePlane('hand', teammate, scene);
        addDrawingObservable(this, scene, drawingMesh, socket);
        this.buttonMesh.dispose(true, true);
      } else {
        this.clueMesh = createImagePlane('clue', teammate, scene);
        this.submitButton = createButton(buttonMesh, this, socket, scene);
      }
      // create your team first so that it always shows up first in list
      initializeScores('Your Score', scores, teamName, stackPanel);

      // for each team, add their names, score, and submitted clues to HUD
      Object.keys(teams).forEach((team) => {
        if (team !== teamName) {
          const label = `${teams[team].members[0].name} & ${teams[team].members[1].name}`;
          initializeScores(label, scores, team, stackPanel);
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
        this.clueMesh = createImagePlane('hand', teammate, scene);
        addDrawingObservable(this, scene, drawingMesh, socket);
      } else {
        socket.role = 'clueGiver';
        // delete mesh, replace it with appropriate version, add observable
        scene.onBeforeRenderObservable.remove(this.drawingObservable);
        this.clueMesh.dispose(true, true);
        this.clueMesh = createImagePlane('clue', teammate, scene);
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

      if (socket.role === 'clueGiver') redrawTexture(this.clueMesh, currentClueURL);

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
