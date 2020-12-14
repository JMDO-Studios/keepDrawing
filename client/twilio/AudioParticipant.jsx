import React, { Component, createRef } from 'react';

export default class AudioParticipant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioTracks: null,
      activeTrack: null,
      audioRef: createRef(),
    };
    this.convertTracksToArray = this.convertTracksToArray.bind(this);
    this.setActiveTrack = this.setActiveTrack.bind(this);
  }

  componentDidMount() {
    const { convertTracksToArray, props } = this;
    const { participant } = props;
    convertTracksToArray();
    participant.on('trackSubscribed', convertTracksToArray);
    participant.on('trackUnsubscribed', convertTracksToArray);
  }

  componentWillUnmount() {
    const { props, state } = this;
    const { participant } = props;
    const { activeTrack } = state;
    const audioTracks = null;
    this.setState({
      audioTracks,
    });
    if (activeTrack) {
      activeTrack.detach();
    }
    participant.removeAllListeners();
  }

  setActiveTrack() {
    const { audioTracks, audioRef } = this.state;
    if (audioTracks && audioTracks[0]) {
      const activeTrack = audioTracks[0];
      activeTrack.attach(audioRef.current);
      this.setState({
        activeTrack,
      });
    }
  }

  convertTracksToArray() {
    const { setActiveTrack, props } = this;
    const { participant } = props;
    const audioTracks = Array.from(participant.audioTracks.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);
    this.setState({
      audioTracks,
    });
    setActiveTrack();
  }

  render() {
    const { audioRef } = this.state;
    return (
      <div className="participant">
        <audio ref={audioRef} autoPlay={true} />
      </div>
    );
  }
}
