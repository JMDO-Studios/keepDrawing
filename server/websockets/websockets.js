const fs = require('fs');
const path = require('path');
const scale = require('scale-number-range');
const { v4: uuidv4 } = require('uuid');
const {
  express,
  app,
  http,
  io,
} = require('../serverbuild');
const { getDiff } = require('../imageCompare/getDiff');
const { bombGameSettings } = require('../../gameSettings');

function getIdsOfSocketsInRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName);
}

function generateURLArray(directoryPath, emptyCanvasURL) {
  const urls = [];
  const fileNames = fs.readdirSync(directoryPath);
  fileNames.forEach((file) => {
    const bitmap = fs.readFileSync(path.join(directoryPath, file), { encoding: 'base64' });
    const data = { data: `data:image/png;base64,${bitmap}` };
    data.differenceFromBlank = parseFloat(getDiff(emptyCanvasURL, data.data).misMatchPercentage);
    urls.push(data);
  });
  return urls;
}

function generateRandomURL(urlArray) {
  const rIdx = Math.floor(Math.random() * urlArray.length);
  return urlArray[rIdx];
}

const clueDirectoryPath = path.join(__dirname, '../assets/clues');
const emptyCanvasURL = 'data:image/png;base64,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';
const clueURLs = generateURLArray(clueDirectoryPath, emptyCanvasURL);
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

function joinLobby(socket, name) {
  socket.join('lobby');
  const lobbyRoster = getIdsOfSocketsInRoom('lobby');
  io.to('lobby').emit('joined lobby', { name, size: lobbyRoster.size, total: bombGameSettings.gameSize });

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
    console.log('a user disconnected', socket.id);
    socket.to(socket.teamRoom).emit('teammate disconnected');
  });

  socket.on('leave game', () => {
    socket.leave(socket.gameRoom);
    socket.leave(socket.teamRoom);
  });

  socket.on('change name', ({ name }) => {
    socket.name = name;
    joinLobby(socket, name);
  });

  socket.on('chat message', ({ message, name }) => {
    io.to('lobby').emit('chat message', {message, name});
  });
  socket.on('drawingChanged', (payLoad) => {
    socket.to(socket.teamRoom).emit('drawingChanged', { drawingURL: payLoad.imageData });
  });
  socket.on('submitDrawing', ({ gameRoom, teamRoom, drawing }) => {
    const teamState = activeGames[gameRoom].teams[teamRoom];
    const currentClue = teamState.currentClueURL;
    const difference = parseFloat(getDiff(drawing, currentClue.data).misMatchPercentage);
    const scaledDifference = scale(100 - difference, 100 - currentClue.differenceFromBlank, 100, 0, 100);
    console.log('scaled difference', scaledDifference);
    const clueURL = generateRandomURL(clueURLs);
    teamState.currentClueURL = clueURL;
    if (scaledDifference > 0) {
      teamState.points += Math.round(scaledDifference);
      io.to(gameRoom).emit('update score', { teamName: teamRoom, score: teamState.points });
    }
    io.to(teamRoom).emit('new clue', { clueURL: clueURL.data });
  });
}

module.exports = {
  express, app, http, io, websocketLogic,
};
