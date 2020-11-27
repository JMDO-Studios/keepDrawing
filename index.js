const express = require('express');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { getDiffTestSocket } = require('./server/imageCompare/getDiff');
const { bombGameSettings } = require('./gameSettings');

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// this is just to test the image comparison functions
app.use('/compareimage', require('./server/imageCompare'));

app.use('/waitingroom', require('./server/rooms'));

app.get('/imagegame', (req, res) => {
  res.sendFile(path.join(__dirname, './public/imagegame.html'));
});

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

app.use((err, req, res) => {
  console.error(err, err.stack);
  res.status(err.status || 500);
  res.send(`Something wrong: ${err.message}`);
});

const init = () => {
  const PORT = process.env.PORT || 3000;

  io.on('connection', async (socket) => {
    socket.join('lobby');
    const lobbyRoster = io.sockets.adapter.rooms.get('lobby');

    if (lobbyRoster.size >= bombGameSettings.gameSize) {
      const gameRoomName = createGameRoomName();
      assignUserstoGame(lobbyRoster, gameRoomName);
    }

    console.log(`socket ${socket.id} has gameRoom  of`, socket.rooms);

    socket.on('disconnect', () => {
      console.log('a user disconnected');
      socket.leave('lobby');
    });
    socket.on('chat message', (message) => {
      io.emit('chat message', `RECEIVED:${message}`);
    });
    socket.on('imageClicked', (imageData) => {
      Promise.resolve(getDiffTestSocket(imageData.data, './public/testAssets/rightblack.jpg')).then((percent) => {
        io.emit('imageClicked', { data: imageData.data, percent: 100 - percent.misMatchPercentage });
      });
    });
  });

  http.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });
};

init();

function assignUserstoGame(lobbyRoster, gameRoomName) {
  const rosterIterator = lobbyRoster.values();

  // teamName is declared outside the for loop
  // so it can persist across iterations in the assignUser function
  let teamName = null;

  for (let rosterIdx = 0; rosterIdx < bombGameSettings.gameSize; rosterIdx += 1) {
    const socketId = rosterIterator.next();
    const { value } = socketId;
    const socket = io.of('/').sockets.get(value);

    // first x users join game room, that room gets added as a property to the socket
    socket.join(gameRoomName);
    socket.gameRoom = socket.rooms;

    // every two users join their own team room, that room also gets added as property to the socket

    assignUsertoTeam(socket, gameRoomName, rosterIdx);
    // all x users leave lobby
    socket.leave('lobby');
  }
}

function createGameRoomName() {
  return `GAME${Math.floor(Math.random() * 100)}`;
}

function createTeamRoomName(gameRoomName, idOfFirstTeamMate) {
  return gameRoomName + idOfFirstTeamMate;
}

function assignUsertoTeam(socket, gameRoomName, rosterIdx) {
  teamName = rosterIdx % bombGameSettings.teamSize === 0
    ? createTeamRoomName(gameRoomName, socket.id)
    : teamName;

  console.log(teamName);
  console.log(`Socket ${socket.id} is member of ${teamName}`);
  try {
    socket.join(teamName);
  } catch (error) {
    console.log(error);
  }
}
