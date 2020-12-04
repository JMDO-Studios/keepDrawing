import React, { Component } from 'react';
import TwilioChat from './TwilioChat';

export default class ChatRoom extends Component {
  render() {
    return (
      <div className="app">
        <header>
          <h1>Test Chat</h1>
        </header>
        <main>
          <TwilioChat />
        </main>
      </div>
    );
  }
}
