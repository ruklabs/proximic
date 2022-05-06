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
const sessionHost = '/session/host'
const offers = '/session/offers'
const answers = '/session/answers'

const iceCandidates = '/session/ice'

const iceServers = [
  {
    urls: "turn:159.223.72.61:3478?transport=tcp",
    username: "proximic",
    credential: "proximic192",
  }
]; 

let pc1;
let pc2;
let localStreamOG;


function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

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
let otherPeers = [];
let outPeerConnections = {};
let inPeerConnections = {};
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

export function sessionCleanup() {
  removeData(session);
}

export async function enterSession(user) {
  // update session lobby 
  setData(lobby + `/${user.uid}`, user.uid);

  let peers;
  const dbRef = ref(getDatabase());
  const response = await get(child(dbRef, lobby));

  if (response.exists()) {
    peers =  response.val();
  } else {
    console.log("Can't get session");
  }

  otherPeers = Object.keys(peers).filter(e => e !== user.uid);
  console.log(otherPeers);

  // listening for session/lobby changes
  onValue(ref(getDatabase(), lobby), async snapshot => {
    if (!snapshot.val()) {
      console.log('[ Lobby Updated ] No value though');
      return;
    };

    console.log('[ Lobby Updating ]');

    // update other peers
    const data = Object.values(snapshot.val()).map(e => e.data);
    otherPeers = data.filter(e => e !== user.uid);
    console.log('otherPeers', otherPeers);
  });
}

export async function call(user) {
  // run deviceInit() just incase
  await deviceInit();

  enterSession(user);

  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }

  // OUTBOUND   /owner/other
  // generate local peer connections for each peer in lobby
  otherPeers.forEach(async other => {

    // create peer connection
    outPeerConnections[other] = new RTCPeerConnection(iceServers);

    // make offer for each
    const offer = await outPeerConnections[other].createOffer(offerOptions);
    outPeerConnections[other].setLocalDescription(offer);

    // signal made offer for other peers
    setData(session + `/${user.uid}/${other}/offer`, offer);

    // add ICE listeners
    outPeerConnections[other].addEventListener('icecandidate', event => {
      if (event.candidate) {
        // signal ice in database (offer)
        setData(session + `/${user.uid}/${other}/ice`, event.candidate);
      }
    });

    // add ICE listeners
    outPeerConnections[other].addEventListener('icecandidate', event => {
      if (event.candidate) {
        // signal ice in database (offer)
        setData(session + `/${user.uid}/${other}/ice`, event.candidate);
      }
    });


    // INBOUND  /other/owner
    // listen for offers (from other peers) from database
    // use that as remote description
    onValue(ref(getDatabase(), session + `/${other}/${user.uid}/offer`), async snapshot => {
      if (!snapshot.val()) {
        console.log(`[ Updated /session/${other}/${user.uid}/offer No value though`);
        return;
      };

      const data = snapshot.val().data; 
      console.log(`session/${other}/${user.uid}/offer`, data);
      // set as remote description
      inPeerConnections[other].setRemoteDescription(data);

      // create Answer
      const answer = await inPeerConnections[other].createAnswer();
      inPeerConnections[other].setLocalDescription(answer);

      // signal the answer
      setData(session + `/${other}/${user.id}/answer`, answer);
    });

    // listen for answers (sdp replies) from database
    // use that as remote description
    onValue(ref(getDatabase(), session + `/${other}/${user.uid}/answer`), async snapshot => {
      if (!snapshot.val()) {
        console.log(`[ Updated /session/${other}/${user.uid}/answer No value though`);
        return;
      };

      const data = snapshot.val().data; 
      console.log(`session/${other}/${user.uid}/answer`, data);

      // set as remote description
      outPeerConnections[other].setRemoteDescription(data);
    });

    // listen for inbound ICE candidates from database
    // Use that for peer connection
    onValue(ref(getDatabase(), session + `/${other}/${user.uid}/ice`), async snapshot => {
      if (!snapshot.val()) {
        console.log(`[ Updated /session/${other}/${user.uid}/ice No value though`);
        return;
      };

      // update other peers
      const data = snapshot.val().data;
      console.log('sheeshj', data);
      outPeerConnections[other].addIceCandidate(data);

      console.log(`[ Updated /session/${other}/${user.uid}/ice with ${data}`);
    });
  });

  // pc1 = new RTCPeerConnection(iceServers);
  // pc1.addEventListener('icecandidate', event => onIceCandidate(pc1, event));
  // pc2 = new RTCPeerConnection(iceServers);
  // pc2.addEventListener('icecandidate', event => onIceCandidate(pc2, event));
  // async function onIceCandidate(pc, event) {
  //   try {
  //     await (getOtherPc(pc).addIceCandidate(event.candidate));
  //     onAddIceCandidateSuccess(pc);
  //   } catch (err) {
  //     onAddIceCandidateError(pc, err);
  //   }
  // }
}

async function onIceCandidate(owner, other, event) {
  try {
    // get the other peer connection via database
    // to change add ice candidate
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, session + `/${other}/${owner}`));

    let peer;
    if (response.exists()) {
      peer =  response.val();
    }

    // addIceCandidate to retrieved peer
    peer.addIceCandidate(event.candidate)

    // then update peer on server
    setData(`/${other}/${owner}`, peer)

    console.log('add ice success');
    // onAddIceCandidateSuccess(owner);
  } catch (err) {
    console.log('add ice error');
    // onAddIceCandidateError(other, err);
  }
}

// Component
export default function Voice2() {
  const [called, setCalled] = useState(false);
  const [answered, setAnswered] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // on mounting

    // OFFER TRACKS
    (async () => {
    })();

    // on unload 
    window.addEventListener('beforeunload', (event) => {
    })
  }, []);

  async function onIceCandidate(owner, other, event) {
    try {
      // get the other peer connection via database
      // to change add ice candidate
      const dbRef = ref(getDatabase());
      const response = await get(child(dbRef, session + `/${other}/${owner}`));

      let peer;
      if (response.exists()) {
        peer =  response.val();
      }

      // addIceCandidate to retrieved peer
      peer.addIceCandidate(event.candidate)

      // then update peer on server
      setData(`/${other}/${owner}`, peer)

      onAddIceCandidateSuccess(owner);
    } catch (err) {
      onAddIceCandidateError(other, err);
    }

    // try {
    //   await (getOtherPc(pc).addIceCandidate(event.candidate));
    //   onAddIceCandidateSuccess(pc);
    // } catch (err) {
    //   onAddIceCandidateError(pc, err);
    // }
  }

  function onAddIceCandidateError(other, err) {
    console.error(`${other} failed to add ICE Candidate: ${err.toString()}`);
  }

  function onAddIceCandidateSuccess(owner) {
    console.log(`${owner} addIceCandidate success`);
  }

  function oneIceStateChange(pc, event) {
    if (pc) {
      console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
      console.log('ICE state change event: ', event);
    }
  }

  function gotRemoteStream(event) {
    if (audioRef.current.srcObject !== event.streams[0]) {
      audioRef.current.srcObject = event.streams[0];
      console.log('pc2 received remote stream');
    }
  }

  async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
      await pc1.setLocalDescription(desc);
      // addData(offers, desc);
      onSetLocalSuccess(pc1);
    } catch (err) {
      onSetSessionDescriptionError(err);
    }

    console.log('pc2 setRemoteDescription start');
    try {
      console.log(desc);
      await pc2.setRemoteDescription(desc);
      onSetRemoteSuccess(pc2);
    } catch (err) {
      onSetSessionDescriptionError(err);
    }

    console.log('pc2 createAnswer start');

    try {
      const answer = await pc2.createAnswer();
      await onCreateAnswerSuccess(answer);
    } catch (err) {
      onCreateSessionDescriptionError(answer);
    }
  }

  async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc2:\n${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    try {
      await pc2.setLocalDescription(desc);
      // addData(answers, desc);
      onSetLocalSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
    console.log('pc1 setRemoteDescription start');
    try {
      await pc1.setRemoteDescription(desc);
      onSetRemoteSuccess(pc1);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
  }

  function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
  }

  function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
  }

  function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
  }

  function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }

  async function makeCall() {
    // function guard
    if (called) return;

    setCalled(true);

    console.log('Called');

    const audioTracks = localStreamOG.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }


    // create peer connections and give ice candidates to each other
    pc1 = new RTCPeerConnection(iceServers);
    pc1.addEventListener('icecandidate', event => onIceCandidate(pc1, event));
    pc2 = new RTCPeerConnection(iceServers);
    pc2.addEventListener('icecandidate', event => onIceCandidate(pc2, event));
    
    // watching for iceconnection state change
    pc1.addEventListener('iceconnectionstatechange', event => oneIceStateChange(pc1, event));
    pc2.addEventListener('iceconnectionstatechange', event => oneIceStateChange(pc2, event));


    // getting remoteStream
    pc2.addEventListener('track', gotRemoteStream);

    // add localstream to pc1
    localStreamOG.getTracks().forEach(track => pc1.addTrack(track, localStreamOG))
    console.log('Added local stream to pc1');

    // time to create the offer
    try {
      const offer = await pc1.createOffer(offerOptions);
      await onCreateOfferSuccess(offer);
    } catch (err) {
      onSetSessionDescriptionError(err);
    }
  }


  async function answer() {
    // function guard
    if (answered) return;

    console.log('Answered');

    setAnswered(true);
  }

  return (
    <StyledDiv>
      <audio ref={audioRef} />
      <button type="button" onClick={async () => {await makeCall()}}>Call</button>
      <button type="button" onClick={async () => {await answer()}}>Answer</button>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    margin: 0 2vw;
  }
`;

export function Voice() {
}



    // // SIGNALLING (on 'answer' set the remote description)
    // // Look out for the 'answers' path and see if something changed
    // onValue(ref(getDatabase(), answers), async snapshot => {
    //   // MOUNTED offer signaling
    //   console.log('MOUNTED: offer signaling')
    //
    //   if (!snapshot.val()) {
    //     console.log('[ Database Update ] Answers changed, No value though');
    //     return;
    //   };
    //
    //   // unpack data
    //   const data = Object.values(snapshot.val())[0].data.answer;
    //   const answer = data;
    //
    //   console.log('Data added to ANSWERS', answer.sdp);
    //
    //   // if answered set remote description of peer connection
    //   const remoteDescription = new RTCSessionDescription(answer);
    //   await peerConnection.setRemoteDescription(remoteDescription);
    // });
    //   
    // // Send offer to signaling channel for answerer to find
    // const offer = await peerConnection.createOffer({ offerToReceiveAudio: true });
    // await peerConnection.setLocalDescription(offer);
    //
    // // Signaling offers description
    // addData(offers, {'offer': offer});
    //
    //
    // // SIGNALING
    // // Listen for local ICE candidates on local RTCPeerConnection
    // // Add to ICE candidates list
    // // TRICKLE ICE implementation
    // peerConnection.onicecandidate = event => {
    //   if (event.candidate) {
    //     console.log('[ Local ICE candidate ] Adding to database');
    //     console.log(event.candidate);
    //     try {
    //       addData(iceCandidates, event.candidate);
    //     } catch (err) {
    //       console.log('[ Local ICE candidate ]', err);
    //     }
    //   }
    // };


    //
    // // SIGNALLING (on 'offers' set the remote description)
    // // Look out for the 'offers' path and see if something changed
    // onValue(ref(getDatabase(), offers), async snapshot => {
    //   // MOUNTED answer signaling
    //   console.log('MOUNTED: answer signaling')
    //
    //   if (!snapshot.val()) {
    //     console.log('[ Database Update ] Offers changed, No value though');
    //     return;
    //   };
    //
    //   // unpack data
    //   const data = Object.values(snapshot.val())[0].data.offer;
    //
    //   const offer = data;
    //   console.log('Data added to OFFERS', offer.sdp);
    //
    //   // if offered set remote description of peer connection
    //   const remoteDescription = new RTCSessionDescription(offer);
    //   await peerConnection.setRemoteDescription(remoteDescription);
    //
    //   const answer = await peerConnection.createAnswer();
    //   await peerConnection.setLocalDescription(answer);
    //
    //   // Signaling offers description
    //   addData(answers, {'answer': answer});
    // });
    //
    //
    // // SIGNALING
    // // Listen for remote ICE candidates on remote RTCPeerConnection
    // // Add to ICE candidates list
    // // TRICKLE ICE implementation
    // onValue(ref(getDatabase(), offers), async snapshot => {
    //   if (!snapshot.val()) {
    //     console.log('[ Remote ICE candidate ] No value though');
    //     return;
    //   };
    //
    //   // unpack data
    //   const data = Object.values(snapshot.val())[0].data;
    //
    //   try {
    //     console.log('[ Remote ICE candidate ] Adding ice candidate');
    //     await peerConnection.addIceCandidate(data);
    //   } catch (err) {
    //     console.log('[ Remote ICE candidate ] Failed to receive');
    //   }
    // });
    //
    
