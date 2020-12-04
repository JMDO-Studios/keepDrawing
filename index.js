const path = require('path');

// express and app are being passed the websockets files so that the websocket logic
// can be stored separately but share the same app object with the express routes,
// otherwise the client has trobule connecting to the server-side sockets
const {
  express, app, http, io, websocketLogic,
} = require('./server/websockets/websockets');

app.use(express.json());

app.use(express.static(path.join(__dirname, '/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// just a quick chat room to test socket.io
app.use('/waitingroom', require('./server/rooms'));

app.use('/twilio', require('./server/twilio'));

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

  io.on('connection', (socket) => websocketLogic(socket));

  http.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });
};

init();
