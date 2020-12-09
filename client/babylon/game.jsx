import React from 'react';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import {
  AdvancedDynamicTexture, Button, TextBlock, Rectangle, StackPanel, Control,
} from '@babylonjs/gui';
import {
  Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, FreeCamera, DynamicTexture, Texture,
} from '@babylonjs/core';
import createButton from './button';

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

function redrawTexture(mesh, newURL, currentURL) {
  currentURL = newURL;
  mesh.material.opacityTexture.updateURL(newURL);
}

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: props.socket,
      clientClueURL: '',
      lastSentDrawingURL: '',
      lastReceivedDrawingURL: '',
    };
    this.compareImages = this.compareImages.bind(this);
  }

  componentDidMount() {
    const {
      socket, clientClueURL, lastSentDrawingURL, lastReceivedDrawingURL,
    } = this.state;

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
    this.clueMesh = createImagePlane('clue', teammate, scene);
    this.drawingMesh = createImagePlane('drawing', teammate, scene);
    const { clueMesh, drawingMesh } = this;

    // create submit button
    const mesh = MeshBuilder.CreatePlane('submit',
      { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
      scene);
    mesh.position = new Vector3(
      drawingMesh.position.x,
      drawingMesh.position.y - 0.3,
      drawingMesh.position.z,
    );
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
    const submitButton = Button.CreateSimpleButton('but1', 'Submit', scene);
    submitButton.width = 0.5;
    submitButton.height = 0.1;
    submitButton.color = 'white';
    submitButton.fontSize = 50;
    submitButton.background = 'green';
    submitButton.onPointerUpObservable.add(() => this.compareImages());
    advancedTexture.addControl(submitButton);

    socket.on('comparisonResults', (payload) => console.log(payload.percent));
    // initialize plane texture URLs
    // this.currentClueURL = '';
    // this.lastSentDrawingURL = '';
    // this.lastReceivedDrawingURL = '';

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
      if (imageURL !== lastSentDrawingURL) {
        this.setState({
          lastSentDrawingURL: imageURL,
        });
        // this.lastSentDrawingURL = imageURL;
        socket.emit('drawingChanged', {
          imageData: imageURL,
        });
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

      // create your team first so that it always shows up first in list
      initializeScores('Your Score', scores, teamName, stackPanel);

      // for each team, add their names, score, and submitted clues to HUD
      Object.keys(teams).forEach((team) => {
        console.log(team);
        if (team !== teamName) {
          const label = `${teams[team].members[0].name} & ${teams[team].members[1].name}`;
          initializeScores(label, scores, team, stackPanel);
        }
      });

      // change your player role and chose with objects to render accordingly
    });

    // change texture of plane when receiving image data
    socket.on('drawingChanged', ({ drawingURL }) => {
      if (drawingURL !== lastReceivedDrawingURL) {
        redrawTexture(drawingMesh, drawingURL, lastReceivedDrawingURL);
      }
    });

    // change a team's score and display
    socket.on('updateScore', ({ teamName, score }) => {
      updateScore(teamName, score, scores);
    });

    // change texture of clue when receiving image data
    socket.on('newClue', ({ clueURL }) => {
      if (clueURL !== clientClueURL) {
        redrawTexture(clueMesh, clueURL, clientClueURL);
      }
    });

    // start clock
    socket.on('startClock', (gameState) => {
      const { time } = gameState;
      const teamInfo = gameState.teams[socket.teamName];
      const { currentClueURL } = teamInfo;

      redrawTexture(clueMesh, currentClueURL, this.currentClueURL);

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

  compareImages() {
    const { socket } = this.state,
    socket.emit('submitComparison', {
      drawing: lastReceivedDrawingURL,
      clue: clientClueURL,
    })
  }

  render() {
    return (
      <canvas id="gameCanvas" style={{ width: '100%', height: '100%' }} />
    );
  }
}
