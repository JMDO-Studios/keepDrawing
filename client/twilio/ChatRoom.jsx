import React, { Component } from 'react';
import axios from 'axios';
import { Twilio } from 'twilio';
import ChatItem from './ChatItem';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      messages: [],
      channel: null,
    };
    this.handleMessageAdded = this.handleMessageAdded.bind(this);
    this.changeText = this.changeText.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getToken = this.getToken.bind(this);
    this.joinChannel = this.joinChannel.bind(this);
  }

  async componentDidMount() {
    const { getToken } = this;
    const token = await getToken();
    const client = await Twilio.Chat.Client.create(token);
    client.on('channelJoined', async (channel) => {
      console.log('You joined channel: ', channel);
      const messages = await channel.getMessages();
      this.setState({ messages: messages.items || [] });
    });
  }

  handleMessageAdded(message) {
    const { messages } = this.state;
    this.setState({
      messages: [...messages, message],
    });
  }

  changeText(ev) {
    this.setState({
      text: ev.value,
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

  async getToken() {
    try {
      const { socket } = this.props;
      const { data } = await axios.post('/twilio/chat/token', { identity: socket.name });
      return data.token;
    } catch (err) {
      console.error('Twilio chatroom could not load: ', err);
    }
  }

  async joinChannel(channel) {
    if (channel.channelState.status !== 'joined') {
      await channel.join();
    }
    this.setState({
      channel,
    });
    channel.on('messageAdded', this.handleMessageAdded);
  }

  render() {
    const {
      joinChannel, changeText, sendMessage, props, state,
    } = this;
    const { socket, status } = props;
    const { messages } = state;
    if (status) {
      joinChannel(status);
    }
    return (
      <div className="chat-window">
        <div className="message-list">
          {messages ? messages.map((message) => <ChatItem key={message.index} message={message} participant={socket.name} />)
            : null}
        </div>
        <div className="textEntry">
          <textarea rows={2} onChange={changeText} placeholder="Type message here" />
        </div>
      </div>
    );
  }
}
