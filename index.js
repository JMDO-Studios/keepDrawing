const express = require('express');

const app = express();

const path = require('path');

const http = require('http').createServer(app);

const io = require('socket.io')(http);



app.use(express.static(path.join(__dirname, '/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

io.on('connection', (socket) => {
  //once the client/site is open this console message should appear
  console.log('a user is connected');
  //the following line listens for 'message' event type and the function(console message) allows testing connectivity for now
  socket.on('message', (message)=>{
    console.log(message)
  })
})


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
  http.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });
};

init();
