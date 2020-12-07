const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  express,
  app,
  http,
  io,
} = require('../serverbuild');
// const { getDiffTestSocket } = require('../imageCompare/getDiff');
const { bombGameSettings } = require('../../gameSettings');

function getIdsOfSocketsInRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName);
}

function generateURLArray(directoryPath) {
  const urls = [];
  const fileNames = fs.readdirSync(directoryPath);
  fileNames.forEach((file) => {
    const bitmap = fs.readFileSync(path.join(directoryPath, file), { encoding: 'base64' });
    urls.push(`data:image/png;base64,${bitmap}`);
  });
  return urls;
}

function generateRandomURL(urlArray) {
  const rIdx = Math.floor(Math.random() * urlArray.length);
  return urlArray[rIdx];
}

const clueDirectoryPath = path.join(__dirname, '../assets/clues');
const clueURLs = generateURLArray(clueDirectoryPath);
const activeGames = {};

function createActiveGameObject(gameName, lobbyRoster) {
  activeGames[gameName] = { time: bombGameSettings.startClockinSec };
  const game = activeGames[gameName];

  const rosterIterator = lobbyRoster.values();

  // loop to create the teams
  for (let teamNum = 0; teamNum < lobbyRoster.size / bombGameSettings.teamSize; teamNum += 1) {
    const teamName = uuidv4();
    game[teamName] = {
      members: [],
      drawer: null,
      clueGiver: null,
      currentClueURL: generateRandomURL(clueURLs),
      submittedClues: [],
      points: 0,
    };

    for (let member = 0; member < bombGameSettings.teamSize; member += 1) {
      const socketId = rosterIterator.next();
      const { value } = socketId;
      const socket = io.of('/').sockets.get(value);
      game[teamName].members.push(socket.id);
      if (member === 0) {
        game[teamName].drawer = socket.id;
        socket.role = 'drawer';
      } else {
        game[teamName].clueGiver = socket.id;
        socket.role = 'clueGiver';
      }
      socket.gameRoom = gameName;
      socket.teamRoom = teamName;

      try {
        socket.join(gameName);
        socket.join(teamName);
        console.log(`Socket ${socket.id} is in team ${teamName} in game ${gameName}`);
        socket.leave('lobby');
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function deleteGame(gameName) {
  // we should make any remaining sockets leave the game room and their team rooms before deleting the object
  delete activeGames[gameName];
}

async function websocketLogic(socket) {
  socket.join('lobby');
  const lobbyRoster = getIdsOfSocketsInRoom('lobby');

  if (lobbyRoster.size >= bombGameSettings.gameSize) {
    const gameRoomName = uuidv4();
    createActiveGameObject(gameRoomName, lobbyRoster);

    Object.keys(activeGames[gameRoomName]).forEach((teamName) => {
      io.to(teamName).emit('initialize', {
        teamName,
        gameName: gameRoomName,
        drawer: activeGames[gameRoomName][teamName].drawer,
        clueGiver: activeGames[gameRoomName][teamName].clueGiver,
      });
    });

    io.to(gameRoomName).emit('startClock', activeGames[gameRoomName]);
  }

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    socket.leave('lobby');
  });
  socket.on('chat message', (message) => {
    io.emit('chat message', message);
  });
  socket.on('drawingChanged', (payLoad) => {
    // commented out resemblejs test to speed up communication.
    //  will need to be added back in on drawing submission
    // Promise.resolve(getDiffTestSocket(imageData.data,
    // './public/testAssets/rightblack.jpg')).then((percent) => {
    //   socket.to(socket.teamRoom).emit('imageClicked',
    //  { data: imageData.data, percent: 100 - percent.misMatchPercentage });
    socket.to(socket.teamRoom).emit('drawingChanged', { drawingURL: payLoad.imageData });
  });
}

module.exports = {
  express, app, http, io, websocketLogic,
};
