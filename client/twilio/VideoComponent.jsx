import React, { Component } from 'react';
import Video from 'twilio-video';
import axios from 'axios';

export default class VideoComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      identity: null,
      roomName: '',
      roomNameErr: false,
      previewTracks: null,
      localMediaAvailable: false,
      hasJoinedRoom: false,
      activeRoom: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
  }

  componentDidMount() {
    axios.get('/token').then((results) => {
      const { identity, token } = results.data;
      this.setState({ identity, token });
    });
  }

  handleChange(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }

  joinRoom() {
    // const { roomJoined, state } = this;
    const { roomName, previewTracks, token } = this.state;
    if (!roomName.trim()) {
      this.setState({ roomNameErr: true });
      return;
    }
    console.log(`Joining room '${roomName}'...`);
    const connectOptions = {
      name: roomName,
    };
    if (previewTracks) {
      connectOptions.tracks = previewTracks;
    }
    Video.connect(token, connectOptions).then(this.roomJoined, (error) => {
      alert(`Could not connect to Twilio:  ${error.message}`);
    });
  }

  attachTracks(tracks, container) {
		tracks.forEach(track => {
			container.appendChild(track.attach());
		});
  };
  
  attachParticipantTracks(participant, container) {
		var tracks = Array.from(participant.tracks.values());
		this.attachTracks(tracks, container);
  };
  
  detachTracks(tracks) {
		tracks.forEach(track => {
			track.detach().forEach(detachedElement => {
				detachedElement.remove();
			});
		});
  };
  
  detachParticipantTracks(participant) {
		var tracks = Array.from(participant.tracks.values());
		this.detachTracks(tracks);
  };
  
  roomJoined(room) {
		// Called when a participant joins a room
		console.log("Joined as '" + this.state.identity + "'");
		this.setState({
			activeRoom: room,
			localMediaAvailable: true,
			hasJoinedRoom: true
		});

		// Attach LocalParticipant's Tracks, if not already attached.
		var previewContainer = this.refs.localMedia;
		if (!previewContainer.querySelector('video')) {
			this.attachParticipantTracks(room.localParticipant, previewContainer);
		};

		// Attach the Tracks of the Room's Participants.
		room.participants.forEach(participant => {
			console.log("Already in Room: '" + participant.identity + "'");
			var previewContainer = this.refs.remoteMedia;
			this.attachParticipantTracks(participant, previewContainer);
		});

		// When a Participant joins the Room, log the event.
		room.on('participantConnected', participant => {
			console.log("Joining: '" + participant.identity + "'");
		});

		// When a Participant adds a Track, attach it to the DOM.
		room.on('trackAdded', (track, participant) => {
			console.log(participant.identity + ' added track: ' + track.kind);
			var previewContainer = this.refs.remoteMedia;
			this.attachTracks([track], previewContainer);
		});

		// When a Participant removes a Track, detach it from the DOM.
		room.on('trackRemoved', (track, participant) => {
			console.log(participant.identity + ' removed track: ' + track.kind);
			this.detachTracks([track]);
		});

		// When a Participant leaves the Room, detach its Tracks.
		room.on('participantDisconnected', participant => {
			console.log("Participant '" + participant.identity + "' left the room");
			this.detachParticipantTracks(participant);
		});

		// Once the LocalParticipant leaves the room, detach the Tracks
		// of all Participants, including that of the LocalParticipant.
		room.on('disconnected', () => {
			if (this.state.previewTracks) {
				this.state.previewTracks.forEach(track => {
					track.stop();
				});
			}
			this.detachParticipantTracks(room.localParticipant);
			room.participants.forEach(this.detachParticipantTracks);
			this.state.activeRoom = null;
			this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
		});
  };
  
  leaveRoom() {
		this.state.activeRoom.disconnect();
		this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
	};

  render() {
    const {
      state, joinRoom, leaveRoom, handleChange,
    } = this;
    const {
      localMediaAvailable, hasJoinedRoom, roomName,
    } = state;
    const showLocalTrack = localMediaAvailable ? (
      <div className="flex-item"><div ref="localMedia" /> </div>) : '';
    const joinOrLeaveRoomButton = hasJoinedRoom ? (
      <button label="Leave Room" onClick={leaveRoom}>Leave Room</button>) : (
      <button label="Join Room" onClick={joinRoom}>Join Room</button>); 
    return (
      <div>
        <div>Video Component</div>
        <div className="flex-container">
          {showLocalTrack}
          <div className="flex-item">
            <label htmlFor="roomName">Room Name:</label>
            <input name="roomName" type="text" value={roomName} onChange={handleChange} />
            <br />
            {joinOrLeaveRoomButton}
          </div>
        </div>
      </div>
    );
  }
}
