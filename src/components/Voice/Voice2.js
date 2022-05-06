import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, update, remove, get, child, push } from 'firebase/database';


// 2 Main Responsibilities
// [ ] Establish Peer Connection
// [ ] Push data via stream with peer connection

// How to use config for peer connection 
// const pc = new RTCPeerConnection([config]);

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
  const [isHost, setIsHost] = useState(false);
  const [peerConnections, setPeerConnections] = useState({});
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // mounting
    enterSession(user);
  }, []);

  useEffect(() => {
    console.log('IS HOST?', isHost);

    if (isHost) {
      // make offers
    }
  }, [isHost]);

  const enterSession = async user => {
    setData(lobby + `/${user.uid}`, user.uid);

    let peers;
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, lobby));
    if (response.exists()) {
      peers = Object.keys(response.val()).filter(e => e !== user.uid);
    } else {
      console.log("Can't get session");
    }

    // check if host
    if (peers.length === 0) {
      // if host clear session on unload
      setIsHost(true);
      window.addEventListener('beforeunload', event => {
        removeData(lobby + `/${user.uid}`);
      });
    }

    // first resolve all connection requests from peers
    console.log('peers:', peers);
    peers.forEach(p => {
      onValue(ref(getDatabase(), session + `/${p}/${user.id}/offer`), async snapshot => {
        if (!snapshot.val()) {
          console.log('/p/id/offer');
        } else {
          console.log('/p/id/offer giving answer');
          // if there is offer -> then give answer
          peerConnections[p] = new RTCPeerConnection(iceServers);

          const offer = snapshot.val().data;
          await peerConnections[p].setRemoteDescription(offer);

          const answer = peerConnections[p].createAnswer();
          await peerConnections[p].setLocalDescription(answer);
          setData(session + `/${p}/${user.uid}/answer`, answer);
        }
      });
    });

    // then start listening for NEW peers entering lobby
    // listening for session/lobby changes
    onValue(ref(getDatabase(), lobby), async snapshot => {
      if (!snapshot.val()) {
        console.log('[ Lobby ] No value though');
        return;
      };

      // get peers
      const peers = Object.values(snapshot.val())
                          .map(e => e.data)
                          .filter(e => e !== user.uid);

      // if HOST clear session on unload
      if (peers.length === 0) {
        setIsHost(true);
        window.addEventListener('beforeunload', event => {
          removeData(lobby + `/${user.uid}`);
        });
      }

      // peers you haven't connected with yet
      const newPeers = peers.filter(e => !connections.includes(e));
      console.log('newPeers', newPeers);

      // commence connection sequence for each new peer
      newPeers.forEach(async p => {
        peerConnections[p] = new RTCPeerConnection(iceServers);

        // answer
        onValue(ref(getDatabase(), session + `/${p}/${user.uid}/answer`), async snapshot => {
          if (!snapshot.val()) {
            console.log('[ Lobby ] No value though');
          } else {
            console.log('const answer = ',  snapshot.val().data);
            const answer = snapshot.val().data
            await peerConnections[p].setRemoteDescription(answer);
          }
        });

        
        // offer
        const offer = await peerConnections[p].createOffer(offerOptions);
        await peerConnections[p].setLocalDescription(offer);
        setData(session + `/${user.uid}/${p}/offer`, offer);

        // addTrack local track
        // getTrack get remote track
      });
    });
  }

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
      <p>{ isHost ? 'Host: Yes' : 'Host: No'}</p>
      <button type="button" onClick={()=>call(user)}>Call</button>
    </div>
  );
}
