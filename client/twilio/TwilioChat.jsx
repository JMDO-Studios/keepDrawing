import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Lobby from './Lobby';
import Room from './Room';

const TwilioChat = () => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState(null);

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const body = {
        identity: username,
        room: roomName,
      };
      const { data } = await axios.post('twilio/token', body);
      setToken(data.token);
    },
    [roomName, username],
  );

  const handleLogout = useCallback((event) => {
    event.preventDefault();
    setToken(null);
  }, []);

  let render;
  if (token) {
    render = (
      <Room roomName={roomName} token={token} handleLogout={handleLogout} />
    );
  } else {
    render = (
      <Lobby
        username={username}
        roomName={roomName}
        handleUsernameChange={handleUsernameChange}
        handleRoomNameChange={handleRoomNameChange}
        handleSubmit={handleSubmit}
      />
    );
  }
  return render;
};

export default TwilioChat;
