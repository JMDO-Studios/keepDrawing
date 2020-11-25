import io from 'socket.io-client';

const socket = io();

if (window.location.pathname === '/waitingroom') {
  const form = document.getElementById('form');

  form.onsubmit = (e) => {
    const m = document.getElementById('m');
    e.preventDefault(); // prevents page reloading
    console.log('message', m.value);
    socket.emit('chat message', m.value);
    m.value = '';
    return false;
  };

  socket.on('chat message', (msg) => {
    const message = document.createElement('li');
    message.innerText = msg;
    document.getElementById('messages').append(message);
  });
}

if (window.location.pathname === '/imagegame') {
  const clickableImages = Array.from(document.getElementsByClassName('clickable'));
  const receivedImage = document.getElementById('received');

  clickableImages.forEach((image) => {
    image.addEventListener('click', (event) => {
      socket.emit('imageClicked', {
        data: getBase64Image(event.target),
      });
    });
  });

  socket.on('imageClicked', (data) => {
    receivedImage.src = data.data;
  });
}

function getBase64Image(img) {
  const c = document.createElement('canvas');
  c.height = img.naturalHeight;
  c.width = img.naturalWidth;
  const ctx = c.getContext('2d');

  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL();
}
