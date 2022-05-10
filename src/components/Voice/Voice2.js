import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, remove, push } from 'firebase/database';

import AgoraRTC from 'agora-rtc-sdk-ng'

const APPID = process.env.REACT_APP_AGORA_APPID
const TOKEN = process.env.REACT_APP_AGORA_TOKEN
const CHANNEL = process.env.REACT_APP_AGORA_CHANNEL

let localTrack;
let remoteUsers = {};

export default function Voice2({ user }) {
  const [uid, setUid] = useState("");
  const [joined, setJoined] = useState(false);

  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8'})

  useEffect(() => {
    // on mount
    // if (!joined) {
    //   (async () => {
    //     await joinStream();
    //     setJoined(true);
    //   })();
    // }

    // on dismount
    return () => {
      (async () => {
        await leaveAndRemoveLocalStream();
      })();
    };
  }, []);

  useEffect(() => {
    console.log('Adding audio to local track');
    (async () => {
      let localTrack = await AgoraRTC.createMicrophoneAudioTrack();
    })();
  }, [localTrack]);

  const joinStream = async () => {
    console.log('Joined stream');

    client.on('user-published', handleNewUser);
    client.on('user-left', handleUserLeft);

    setUid(await client.join(APPID, CHANNEL, TOKEN, null));

    console.log(localTrack);
    await client.publish(localTrack);
  };

  const toggleMic = async (e) => {
    if (localTrack.muted) {
      await localTrack.setMuted(false)
      e.target.innerText = 'Mic on';
    }
  };

  const handleNewUser = async (user, mediaType) => {
    console.log('NEW USER ENTERED THE CHANNEL');
    if (user) {
      remoteUsers[user] = user;
      await client.subscribe(user, mediaType);

      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    }
  }; 

  const handleUserLeft = async (user) => {
    delete remoteUsers[user];
  }; 

  const leaveAndRemoveLocalStream = async () => {
    localTrack.stop();
    localTrack.close();
  };

  return (
    <div>
      <button type="button" onClick={async () => await joinStream()}>Join</button>
      <button type="button" onClick={async () => await toggleMic()}>Mic</button>
    </div>
  );
}
