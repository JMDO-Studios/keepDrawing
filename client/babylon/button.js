import {
    AdvancedDynamicTexture, Button,
  } from '@babylonjs/gui';
  import {
    Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder,
    StandardMaterial, FreeCamera, DynamicTexture, Texture,
  } from '@babylonjs/core';

export default function createButton (type, parent, scene) {
    const mesh = MeshBuilder.CreatePlane(type, 
      { size: 0.5, sideOrientation: Mesh.DOUBLESIDE },
      scene);
    mesh.position = new Vector3(
      parent.position.x,
      parent.position.y - 0.3,
      parent.position.z
    );
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
    if (type === 'submit') {
    const submitButton = Button.CreateSimpleButton("but1", "Submit", scene);
      submitButton.width = 0.5;
      submitButton.height = 0.1;
      submitButton.color = "white";
      submitButton.fontSize = 50;
      submitButton.background = "green";
      submitButton.onPointerUpObservable.add(function() {
          alert("you did it!");
      });
      advancedTexture.addControl(submitButton)
    }
  }
