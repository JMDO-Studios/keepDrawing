import React, { useState, useEffect, useRef } from 'react';

const Participant = ({ participant }) => {
  const [audioTracks, setAudioTracks] = useState([]);

  const audioRef = useRef();

  const trackpubsToTracks = (trackMap) => Array.from(trackMap.values())
    .map((publication) => publication.track)
    .filter((track) => track !== null);

  useEffect(() => {
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    const trackSubscribed = (track) => {
      if (track.kind === 'audio') {
        setAudioTracks(() => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = (track) => {
      if (track.kind === 'audio') {
        setAudioTracks(() => audioTracks.filter((a) => a !== track));
      }
    };

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);

    return () => {
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
    return null;
  }, [audioTracks]);

  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      <audio ref={audioRef} autoPlay={true} muted={false} />
    </div>
  );
};

export default Participant;
