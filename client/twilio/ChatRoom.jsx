import React, { Component } from 'react';
import axios from 'axios';
import { Client } from 'twilio-chat/lib';
import ChatItem from './ChatItem';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      messages: [],
      client: null,
      channel: null,
    };
    this.handleMessageAdded = this.handleMessageAdded.bind(this);
    this.changeText = this.changeText.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getToken = this.getToken.bind(this);
    this.joinChannel = this.joinChannel.bind(this);
    this.leaveChannel = async (channel) => {
      await channel.leave();
    };
  }

  async componentDidMount() {
    const {
      getToken, joinChannel, leaveChannel, props,
    } = this;
    const { socket } = props;
    const { name } = socket;
    const token = await getToken();
    const client = await Client.create(token);
    this.setState({
      client,
    });
    const channels = await client.getSubscribedChannels();
    channels.items.forEach((channel) => leaveChannel(channel));
    client.on('channelJoined', async (channel) => {
      const messages = await channel.getMessages();
      this.setState({ messages: messages.items || [] });
    });
    try {
      const generalChannel = await client.getChannelByUniqueName('general');
      joinChannel(generalChannel);
    } catch (err) {
      console.error('Chatroom could not load: ', err);
    }
    socket.on('createTeamChatRoom', async ({ teamName, drawer }) => {
      try {
        await client.getChannelByUniqueName(teamName);
        socket.emit('teamChatReady', { teamName, drawer });
        joinChannel(channel);
      } catch {
        try {
          const channel = await client.createChannel({
            uniqueName: teamName,
          });
          socket.emit('teamChatReady', { teamName, drawer });
          joinChannel(channel);
        } catch (err) {
          console.error('Chatroom could not load: ', err);
        }
      }
    });
    socket.on('joinTeamChat', async (teamName) => {
      const channel = await client.getChannelByUniqueName(teamName);
      joinChannel(channel);
    });
  }

  async componentWillUnmount() {
    const { leaveChannel, state } = this;
    const { client } = state;
    const channels = await client.getSubscribedChannels();
    channels.items.forEach((channel) => leaveChannel(channel));
  }

  handleMessageAdded(message) {
    const { messages } = this.state;
    this.setState({
      messages: [...messages, message],
    });
  }

  async getToken() {
    try {
      const { socket } = this.props;
      const { name } = socket;
      const { data } = await axios.post('/twilio/chat/token', { identity: name });
      return data.token;
    } catch (err) {
      console.error('Chatroom could not load: ', err);
    }
    return null;
  }

  changeText(ev) {
    this.setState({
      text: ev.target.value,
    });
  }

  sendMessage() {
    const { text, channel } = this.state;
    if (text) {
      channel.sendMessage(String(text).trim());
      this.setState({
        text: '',
      });
    }
  }

  async joinChannel(channel) {
    const { leaveChannel, handleMessageAdded, state } = this;
    const { client } = state;
    try {
      const channels = await client.getSubscribedChannels();
      channels.items.forEach((oldChannel) => leaveChannel(oldChannel));
      if (channel.channelState.status !== 'joined') {
        await channel.join();
      }
      this.setState({
        channel,
      });
      this.state.channel.on('messageAdded', handleMessageAdded);
    } catch (err) {
      console.error('Chatroom could not load: ', err);
    }
  }

  render() {
    const {
      changeText, sendMessage, props, state,
    } = this;
    const { socket } = props;
    const { name } = socket;
    const { text, messages } = state;
    return (
      <div id="chat-window">
        <div id="chat-title">Chat Room</div>
        <div id="message-list">
          {messages ? messages.map((message) => <ChatItem key={message.index} message={message} participant={name} />)
            : null}
        </div>
        <div id="create-message">
          <input type="text" id="message-draft" rows={2} value={text} onChange={changeText} placeholder="Type message here" />
          <button id="message-send" type="submit" aria-label="Send message">Send</button>
        </div>
      </div>
    );
  }
}
