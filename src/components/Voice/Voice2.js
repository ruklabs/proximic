import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, onDelete, update, remove, get, child, push } from 'firebase/database';


// 2 Main Responsibilities
// [ ] Establish Peer Connection
// [ ] Push data via stream with peer connection

// PATHS
const session = '/session'
const lobby = '/session/lobby'

const iceServers = [
  {
    urls: "turn:159.223.72.61:3478?transport=tcp",
    username: "proximic",
    credential: "proximic192",
  }
]; 

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

// global af
let localStream;
let remoteStream;
const offerOptions = { offerToReceiveAudio: 1 };

export async function deviceInit() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream = stream;
    return true;
  } catch (err) {
    console.log('Invalid: Device permission is required.', err);
    return false;
  }
}

// Method of resolving peers is simple
// Newly added peers won't give offers
// The already part of the network of peers
// will send their offers to the new peer
// and then establish a connection
// when that's done. It's time to LISTEN
// for new connections then send them offers


export default function Voice2({ user }) {
  const [peerConnections, setPeerConnections] = useState({});
  const [connections, setConnections] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    // mounting
    enterSession(user);

    window.addEventListener('beforeunload', event => {
      console.log('UNLOADING');
      removeData(lobby + `/${user.uid}`);
      removeData(session + `/${user.uid}`);
    });


    return () => {
      // on dismount
      console.log('DISMOUNTING');
      removeData(lobby + `/${user.uid}`);
      removeData(session + `/${user.uid}`);
    };
  }, []);


  const enterSession = async user => {
    await deviceInit();

    setData(lobby + `/${user.uid}`, user.uid);

    let peers;
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, lobby));
    if (response.exists()) {
      peers = Object.keys(response.val()).filter(e => e !== user.uid);
    } else {
      console.log("Can't get session");
    }

    console.log('peers', peers);
    // send offers to peers
    peers.forEach(async p => {
      await offer(p);
    });

    // respond to offers
    onValue(ref(getDatabase(), session + `/${user.uid}/receivedOffersFrom`), async snapshot => {
        if (!snapshot.val()) {
          console.log('Initial /id/receivedFrom/p');
        } else {
          for (const [k, v] of Object.entries(snapshot.val())) {
            console.log(`Got offer from ${k}`);
            peerConnections[k] = new RTCPeerConnection(iceServers);
            await peerConnections[k].setRemoteDescription(v.data);

            const answer = await peerConnections[k].createAnswer();
            await peerConnections[k].setLocalDescription(answer);
            setData(session + `/${k}/receivedAnswersFrom/${user.uid}`, answer);
          }

          // time to get 'em ice candidates from remote
          onValue(ref(getDatabase(), session + `/${user.uid}/iceReceivedFrom/`), async snapshot => {
              if (!snapshot.val()) {
                console.log('Initial /id/iceReceivedFrom/p');
              } else {
                for (const [k, v] of Object.entries(snapshot.val())) {
                  console.log(`Got ice from ${k}`);
                  try {
                    console.log(v.data);
                    peerConnections[k].addIceCandidate(v.data);
                  } catch (err) {
                    console.err('Adding ICE:', err);
                  }

                  // time to get 'em tracks
                  peerConnections[k].addEventListener('track', async event => {
                    const [remoteStream] = event.streams;
                    audioRef.current.srcObject = remoteStream;
                  });
                }
              }
          });
        }
    });
  };



  const offer = async (peer) => {
    peerConnections[peer] = new RTCPeerConnection(iceServers);

    // wait for answer
    onValue(ref(getDatabase(), session + `/${user.uid}/receivedAnswersFrom/${peer}`), async snapshot => {
        if (!snapshot.val()) {
          console.log('Waiting for /id/p/answer');
        } else {
          console.log(`Got answer from ${peer}`);

          const answer = snapshot.val().data;
          console.log('answer', answer);
          await peerConnections[peer].setRemoteDescription(answer);

          // listen for local ice candidates
          peerConnections[peer].addEventListener('icecandidate', event => {
            if (event.candidate) {
              console.log(event.candidate);
              setData(session + `/${peer}/iceReceivedFrom/${user.uid}`);
            }
          });

          localStream.getAudioTracks().forEach(track => peerConnections[peer].addTrack(track, localStream));
        }
    });

    console.log('peer', peer);

    // signal offer
    console.log('Sending offer to', peer);
    const offer = await peerConnections[peer].createOffer(offerOptions);
    await peerConnections[peer].setLocalDescription(offer);
    setData(session + `/${peer}/receivedOffersFrom/${user.uid}`, offer);
  };

  const call = async user => {
    // run deviceInit() just incase
    await deviceInit();

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }
  }

  return (
    <div>
      <audio ref={audioRef} />
      <button type="button" onClick={()=>call(user)}>Call</button>
    </div>
  );
}
