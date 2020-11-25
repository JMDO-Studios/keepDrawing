const express = require('express');

const app = express();

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/waitingroom.html'));
});

module.exports = app;
