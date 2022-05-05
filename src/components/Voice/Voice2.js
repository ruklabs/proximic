import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, update, remove, get, child, push } from 'firebase/database';


// 2 Main Responsibilities
// [ ] Establish Peer Connection
// [ ] Push data via stream with peer connection

// How to use config for peer connection 
// const pc = new RTCPeerConnection([config]);

// PATHS
const session = '/session'
const offers = '/session/offers'
const answers = '/session/answers'

const iceCandidates = '/session/ice'

const iceServers = [
    {
      urls: "turn:159.223.72.61:3478?transport=tcp",
      username: "proximic",
      credential: "proximic192",
    },
]; 

const offerPC = new RTCPeerConnection({
  iceServers
});

const answerPC = new RTCPeerConnection({
  iceServers
});

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


// Component
export default function Voice2() {
  const [called, setCalled] = useState(false);
  const [answered, setAnswered] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // on mounting

    // Check if peer connection done
    offerPC.addEventListener('connectionstatechange', event => {
      if (offerPC.connectionState === 'connected') {
        console.log('Connected');
      }
    });
    
    setInterval(() => {
      console.log('offer', offerPC.connectionState);
      console.log('answer', answerPC.connectionState);
    }, 5000)
    
    // session cleanup before new session
    removeData(session);

  }, []);

  async function makeCall() {
    // function guard
    if (called) return;

    setCalled(true);

    console.log('Called');

    const peerConnection = offerPC;

    // SIGNALLING (on 'answer' set the remote description)
    // Look out for the 'answers' path and see if something changed
    onValue(ref(getDatabase(), answers), async snapshot => {
      // MOUNTED offer signaling
      console.log('MOUNTED: offer signaling')

      if (!snapshot.val()) {
        console.log('[ Database Update ] Answers changed, No value though');
        return;
      };

      // unpack data
      const data = Object.values(snapshot.val())[0].data.answer;
      const answer = data;

      console.log('Data added to ANSWERS', answer);

      // if answered set remote description of peer connection
      const remoteDescription = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDescription);
    });
      
    // Send offer to signaling channel for answerer to find
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Signaling offers description
    addData(offers, {'offer': offer});


    // SIGNALING
    // Listen for local ICE candidates on local RTCPeerConnection
    // Add to ICE candidates list
    // TRICKLE ICE implementation
    peerConnection.addEventListener('icecandidate', event => {
      if (event.candidate) {
        console.log('[ Local ICE candidate ] Adding to database');
        addData(iceCandidates, event.candidate);
      }
    });

  
    // OFFER TRACKS
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      console.log('adding tracks');

      localStream.getTracks().forEach(track => {
        offerPC.addTrack(track, localStream);
      });
    } catch (err) {
      console.error('In makeCall():', err);
      alert('In makeCall():', err);
    }
  }


  async function answerCall() {
    // function guard
    if (answered) return;
    
    console.log('Answered');

    setAnswered(true);

    const peerConnection = answerPC;

    // SIGNALLING (on 'offers' set the remote description)
    // Look out for the 'offers' path and see if something changed
    onValue(ref(getDatabase(), offers), async snapshot => {
      // MOUNTED answer signaling
      console.log('MOUNTED: answer signaling')

      if (!snapshot.val()) {
        console.log('[ Database Update ] Offers changed, No value though');
        return;
      };

      // unpack data
      const data = Object.values(snapshot.val())[0].data.offer;

      const offer = data;
      console.log('Data added to OFFERS', offer);

      // if offered set remote description of peer connection
      const remoteDescription = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteDescription);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Signaling offers description
      addData(answers, {'answer': answer});
    });


    // SIGNALING
    // Listen for remote ICE candidates on remote RTCPeerConnection
    // Add to ICE candidates list
    // TRICKLE ICE implementation
    onValue(ref(getDatabase(), offers), async snapshot => {
      if (!snapshot.val()) {
        console.log('[ Remote ICE candidate ] No value though');
        return;
      };

      // unpack data
      const data = Object.values(snapshot.val())[0].data;

      try {
        await peerConnection.addIceCandidate(data);
      } catch (err) {
        console.log('[ Remote ICE candidate ] Failed to receive');
      }
    });

    // ANSWER TRACKS
    answerPC.addEventListener('track', async (event) => {
      console.log('answering track');
      const [remoteStream] = event.streams;
      audioRef.current.srcObject = remoteStream;
    });
    
  }

  return (
    <StyledDiv>
      <audio ref={audioRef} />
      <button type="button" onClick={async () => {await makeCall()}}>Call</button>
      <button type="button" onClick={async () => {await answerCall()}}>Answer</button>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    margin: 0 2vw;
    font-size: 50px;
  }
`;
