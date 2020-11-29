import io from 'socket.io-client';

function getBase64Image(img) {
  const c = document.createElement('canvas');
  c.height = img.naturalHeight;
  c.width = img.naturalWidth;
  const ctx = c.getContext('2d');

  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL();
}

export default function imageGameLogic() {
  const socket = io();

  const clickableImages = Array.from(document.getElementsByClassName('clickable'));
  const receivedImage = document.getElementById('received');
  const matchResult = document.getElementById('matchResult');

  clickableImages.forEach((image) => {
    image.addEventListener('click', (event) => {
      socket.emit('imageClicked', {
        data: getBase64Image(event.target),
      });
    });
  });

  socket.on('imageClicked', (data) => {
    console.log(data);
    receivedImage.src = data.data;
    matchResult.innerText = `Match percentage: ${data.percent}%`;
  });
}
