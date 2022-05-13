import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, remove, push } from 'firebase/database';

import AgoraRTC from 'agora-rtc-sdk-ng'

// Database cleanup
function removeData(path, data) {
  console.log('Removing data');
  try {
    const baseRef = ref(getDatabase(), path);
    remove(baseRef);
  } catch (err) {
    console.error('removeData:', err);
  }
}

// This function is here to allow 'adding to database path'
// instead of overwriting the data at the location this
// function APPENDS to the database entry.
// Necessary for handling (adding) ice candidates, offers, answers
function addData(path, data) {
  try {
    const baseRef = ref(getDatabase(), path);
    push(baseRef, {
      data
    });
  } catch (err) {
    console.error('addData:', err);
  }
}

// Like addData but overwrites the data at the path instead
function setData(path, data) {
  try {
    const baseRef = ref(getDatabase(), path);
    set(baseRef, {
      data
    });
  } catch (err) {
    console.error('setData:', err);
  }
}

const APPID = process.env.REACT_APP_AGORA_APPID
const TOKEN = process.env.REACT_APP_AGORA_TOKEN
const CHANNEL = process.env.REACT_APP_AGORA_CHANNEL

// Lobby UID to Agora UID
const luidToAuid = {};

let localTrack;
let uid;
const remoteUsers = {};
let client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
let deaf = false;

export const join = async () => {
  // clean up and disconnect on unload
  console.log('CLIENT', client);
  window.addEventListener('beforeunload', async () => {
    await leaveAndRemoveLocalStream();
  });

  console.log('Joined stream');

  client.on('user-published', handleNewUser);
  client.on('user-left', handleUserLeft);

  uid = await client.join(APPID, CHANNEL, TOKEN, null);
  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish(localTrack);

  return uid;
};

export const setVol = async (auid, vol) => {
  remoteUsers[auid].audioTrack.setVolume(vol);
};

export const mute = async (e) => {
  console.log('localtrack in mute', localTrack);
  console.log(e);
  if (localTrack.muted) {
    await localTrack.setMuted(false)
  } else {
    await localTrack.setMuted(true)
  }
};

export const deafen = async (e) => {
  if (deaf) {
    deaf = false;
    const keys = Object.keys(remoteUsers); 
    keys.forEach(k => {
      console.log(k);
      remoteUsers[k].audioTrack.setVolume(100);
    });
  } else {
    deaf = true;
    const keys = Object.keys(remoteUsers); 
    keys.forEach(k => {
      console.log(k);
      remoteUsers[k].audioTrack.setVolume(0);
    });
  }
};

export const handleNewUser = async (user, mediaType) => {
  console.log('NEW USER ENTERED THE CHANNEL');
  if (user) {
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType);

    if (mediaType === 'audio') {
      user.audioTrack.play();
    } }
}; 

export const handleUserLeft = async (user) => {
  delete remoteUsers[user];
}; 

export const leaveAndRemoveLocalStream = async () => {
  client.leave();
  localTrack.stop();
  localTrack.close();
};

export default function Voice2({ user }) {
  return (
    <StyledAnchor></StyledAnchor>
  );
}

const StyledAnchor = styled.span`
  display: none;
`;
