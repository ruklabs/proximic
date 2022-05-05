import { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, update, remove, get, child, push } from 'firebase/database';


// 2 Main Responsibilities
// [ ] Establish Peer Connection
// [ ] Push data via stream with peer connection

// How to use config for peer connection 
// const pc = new RTCPeerConnection([config]);

// PATHS
const offers = '/session/offers'
const answers = '/session/answers'

const iceCandidates = '/session/ice'

const config = { iceServers: [{
      urls: [
        "stun1.l.google.com:19302",
        "stun2.l.google.com:19302",
        "stun3.l.google.com:19302",
        "stun4.l.google.com:19302"
      ]
  }],
  iceCandidatePoolSize: 10
};

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


export default function Voice2() {
  useEffect(() => {
    // on mounting

  }, []);

  async function makeCall() {
    console.log('Called');
    // session cleanup before new session
    removeData(offers);

    const peerConnection = new RTCPeerConnection([config]);

    // SIGNALLING (on 'answer' set the remote description)
    // Look out for the 'answers' path and see if something changed
    onValue(ref(getDatabase(), answers), async snapshot => {
      // MOUNTED offer signaling
      console.log('MOUNTER: offer signaling')

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
  }


  async function answerCall() {
    console.log('Answered');
    // database cleanup for new session
    removeData(answers);

    const peerConnection = new RTCPeerConnection([config]);

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
  }

  return (
    <StyledDiv>
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
