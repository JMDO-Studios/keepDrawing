const {
  express,
  app,
  http,
  io,
} = require('../serverbuild');
const { getDiffTestSocket } = require('../imageCompare/getDiff');
const { bombGameSettings } = require('../../gameSettings');

function assignUserstoGame(lobbyRoster, gameRoomName) {
  const rosterIterator = lobbyRoster.values();

  // teamName is declared outside the for loop
  // so it can persist across iterations in the assignUser function
  const teamName = null;

  for (let rosterIdx = 0; rosterIdx < bombGameSettings.gameSize; rosterIdx += 1) {
    const socketId = rosterIterator.next();
    const { value } = socketId;
    const socket = io.of('/').sockets.get(value);

    // first x users join game room, that room gets added as a property to the socket
    socket.join(gameRoomName);
    socket.gameRoom = gameRoomName;

    // every two users join their own team room, that room also gets added as property to the socket

    assignUsertoTeam(socket, gameRoomName, rosterIdx);
    // all x users leave lobby
    socket.leave('lobby');
  }
}

function createGameRoomName(name = '', offset = 0) {
  // creates a game room name, if that name already exists, adds a digit and check again.
  // there is probably a smoother way of doing this
  let gameRoomName = name === '' ? `GAME${Math.floor(Math.random() * 100) + offset}` : name + offset;
  if (io.sockets.adapter.rooms.has(gameRoomName)) {
    gameRoomName = createGameRoomName(gameRoomName, offset + 1);
  }
  return gameRoomName;
}

function createTeamRoomName(gameRoomName, idOfFirstTeamMate) {
  return gameRoomName + idOfFirstTeamMate;
}

function assignUsertoTeam(socket, gameRoomName, rosterIdx) {
  // teamName is initialized in AssignUserstoGame
  teamName = rosterIdx % bombGameSettings.teamSize === 0
    ? createTeamRoomName(gameRoomName, socket.id)
    : teamName;

  console.log(`Socket ${socket.id} is in team ${teamName} in game ${gameRoomName}`);

  try {
    socket.join(teamName);
    socket.teamRoom = teamName;
  } catch (error) {
    console.log(error);
  }
}

function getIdsOfSocketsInRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName);
}

async function websocketLogic(socket) {
  socket.join('lobby');
  const lobbyRoster = getIdsOfSocketsInRoom('lobby');

  if (lobbyRoster.size >= bombGameSettings.gameSize) {
    const gameRoomName = createGameRoomName();
    assignUserstoGame(lobbyRoster, gameRoomName);
    io.to(gameRoomName).emit('startClock', { time: bombGameSettings.startClockinSec });
  }

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    socket.leave('lobby');
  });
  socket.on('chat message', (message) => {
    io.emit('chat message', `RECEIVED:${message}`);
  });
  socket.on('imageClicked', (imageData) => {
    Promise.resolve(getDiffTestSocket(imageData.data, './public/testAssets/rightblack.jpg')).then((percent) => {
      socket.to(socket.teamRoom).emit('imageClicked', { data: imageData.data, percent: 100 - percent.misMatchPercentage });
    });
  });
}

module.exports = {
  express, app, http, io, websocketLogic,
};
