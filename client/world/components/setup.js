AFRAME.registerComponent('setup', {
  init() {
    const scene = this.el;
    console.log('registered setup');
    // create assets and append to scene

    const sky = document.createElement('a-sky');
    sky.setAttribute('color', '#6EBAA7');
    scene.appendChild(sky);

    const torus = document.createElement('a-torus-knot');
    torus.setAttribute('color', '#B84A39');
    torus.setAttribute('arc', '180');
    torus.setAttribute('p', '2');
    torus.setAttribute('q', '7');
    torus.setAttribute('radius', '5');
    torus.setAttribute('radius-tubular', '0.1');
    torus.setAttribute('position', '0 2 -5');
    torus.setAttribute('scale', '1 1 1');

    scene.appendChild(torus);

    const text = document.createElement('a-text');
    text.setAttribute('value', 'HELLO WORLD');
    torus.appendChild(text);
  },
});
