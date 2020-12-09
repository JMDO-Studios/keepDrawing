const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { compareImages } = require('resemblejs/compareImages');
const {
  express,
  app,
  http,
  io,
} = require('../serverbuild');
// const { getDiffFinal } = require('../imageCompare/getDiff');
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
  activeGames[gameName] = {
    time: bombGameSettings.startClockinSec,
    teams: {},
  };
  const game = activeGames[gameName];

  const rosterIterator = lobbyRoster.values();

  // loop to create the teams
  for (let teamNum = 0; teamNum <= lobbyRoster.size / bombGameSettings.teamSize; teamNum += 1) {
    const teamName = uuidv4();
    game.teams[teamName] = {
      members: [],
      drawer: null,
      clueGiver: null,
      currentClueURL: generateRandomURL(clueURLs),
      submittedClues: [],
      points: 0,
    };

    for (let member = 0; member < bombGameSettings.teamSize; member += 1) {
      const { value } = rosterIterator.next();
      const socket = io.of('/').sockets.get(value);
      const team = game.teams[teamName];
      const { id, name } = socket;
      team.members.push({ id, name });
      if (member === 0) {
        team.drawer = { id, name };
        socket.role = 'drawer';
      } else {
        game.teams[teamName].clueGiver = { id, name };
        socket.role = 'clueGiver';
      }
      socket.gameRoom = gameName;
      socket.teamRoom = teamName;

      try {
        socket.join(gameName);
        socket.join(teamName);
        io.to(id).emit('goToGame');
        console.log(`Socket ${id} is in team ${teamName} in game ${gameName}`);
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

function joinLobby(socket) {
  socket.join('lobby');
  const lobbyRoster = getIdsOfSocketsInRoom('lobby');

  if (lobbyRoster.size >= bombGameSettings.gameSize) {
    const gameRoomName = uuidv4();
    createActiveGameObject(gameRoomName, lobbyRoster);
    socket.leave('lobby');

    Object.keys(activeGames[gameRoomName].teams).forEach((teamName) => {
      const allTeams = activeGames[gameRoomName].teams;
      const team = allTeams[teamName];
      io.to(teamName).emit('initialize', {
        teamName,
        gameName: gameRoomName,
        members: team.members,
        drawer: team.drawer,
        clueGiver: team.clueGiver,
        teams: allTeams,
      });
    });

    io.to(gameRoomName).emit('startClock', activeGames[gameRoomName]);
  }
}
async function websocketLogic(socket) {
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    socket.leave('lobby');
  });
  socket.on('change name', ({ name }) => {
    socket.name = name;
    joinLobby(socket);
  });
  socket.on('chat message', (message) => {
    io.to('lobby').emit('chat message', message);
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
  socket.on('submitComparison', (payload) => {
  //   Promise.resolve(getDiffFinal(payload.drawing, payload.clue)).then((percent) => {
  //     socket.to(socket.teamRoom).emit('comparisonResults',
  //       { percent: 100 - percent.misMatchPercentage });
  //   });
  });
}
// socket.on('drawingSubmit', (clue, drawing) => {
//   Promise.resolve(getDiffTestSocket(clue, drawing)).then((percent) => {
//     socket.to(socket.teamRoom).emit('resultsReturned',
//     { data: imageData.data, percent: 100 - percent.misMatchPercentage });
// }))

module.exports = {
  express, app, http, io, websocketLogic,
};
