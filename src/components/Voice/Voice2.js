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
  const [peerConnections, setPeerConnections] = useState({});
  const [connections, setConnections] = useState([]);

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
    setData(lobby + `/${user.uid}`, user.uid);

    let peers;
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, lobby));
    if (response.exists()) {
      peers = Object.keys(response.val()).filter(e => e !== user.uid);
    } else {
      console.log("Can't get session");
    }

    // first resolve all connection requests from peers
    console.log('peers:', peers);
    peers.forEach(p => {
      onValue(ref(getDatabase(), session + `/${user.uid}/${p}/offer`), async snapshot => {
        if (!snapshot.val()) {
          console.log('/p/id/offer');
        } else {
          console.log(`Got offer from ${user.uid}`);
          // if there is offer -> then give answer
          peerConnections[p] = new RTCPeerConnection(iceServers);

          const offer = snapshot.val().data;
          console.log('p', p);
          console.log('offer', offer);
          await peerConnections[p].setRemoteDescription(offer);

          const answer = peerConnections[p].createAnswer();
          await peerConnections[p].setLocalDescription(answer);
          setData(session + `/${user.uid}/${p}/answer`, answer);

          // update connections
          connections.push(p);
        }
      });
    });

    listenToNewPeers();
  }

  const listenToNewPeers = () => {
    // then start listening for NEW peers entering lobby
    // listening for session/lobby changes
    onValue(ref(getDatabase(), lobby), async snapshot => {
      if (!snapshot.val()) {
        return;
      };

      // get peers
      const peers = Object.values(snapshot.val())
                          .map(e => e.data)
                          .filter(e => e !== user.uid);

      // peers you haven't connected with yet
      const newPeers = peers.filter(e => !connections.includes(e));
      // console.log('newPeers', newPeers);

      // commence connection sequence for each new peer
      newPeers.forEach(async p => {
        peerConnections[p] = new RTCPeerConnection(iceServers);

        // answer
        // onValue(ref(getDatabase(), session + `/${p}/${user.uid}/answer`), async snapshot => {
        //   if (!snapshot.val()) {
        //     console.log('[ Lobby ] No value though');
        //   } else {
        //     console.log('const answer = ',  snapshot.val().data);
        //     const answer = snapshot.val().data
        //     await peerConnections[p].setRemoteDescription(answer);
        //   }
        // });

        
        console.log(`Offering to new kid in town: ${p}`);

        // offer
        const offer = await peerConnections[p].createOffer(offerOptions);
        await peerConnections[p].setLocalDescription(offer);
        setData(session + `/${user.uid}/${p}/offer`, offer);

        // addTrack local track
        // getTrack get remote track
      });
    });
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
      <button type="button" onClick={()=>call(user)}>Call</button>
    </div>
  );
}
