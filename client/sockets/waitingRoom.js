import io from 'socket.io-client';

export default function waitingRoomLogic() {
  const socket = io();

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
