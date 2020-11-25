const express = require('express');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

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

app.use((err, req, res, next) => {
  console.error(err, err.stack);
  res.status(err.status || 500);
  res.send(`Something wrong: ${err.message}`);
});

const init = () => {
  const PORT = process.env.PORT || 3000;

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });
    socket.on('chat message', (message) => {
      io.emit('chat message', `RECEIVED:${message}`);
    });
    socket.on('imageClicked', (imageData) => {
      io.emit('imageClicked', imageData);
    });
  });

  http.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });
};

init();
