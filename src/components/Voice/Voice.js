import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, onValue, update, remove, get, child, push } from 'firebase/database';
import { useRef, useEffect } from 'react';

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

// global states
const pc = new RTCPeerConnection([config]);

let localStream = null;
let remoteStream = null;

function addToList(path, data) {
  try {
    const baseRef = ref(getDatabase(), path);
    set(baseRef, {
      data
    });
  } catch (err) {
    console.log('addToList:', err);
  }
}

export default function Voice() {
  const callPath = 'calls/';
  const offerPath = 'calls/0/offer';
  const answerPath = 'calls/0/answer';
  const answerCandidatesPath = 'calls/0/answerCandidates';
  const offerCandidatesPath = 'calls/0/offerCandidates';

  const audioRef = useRef(null);

  // enable audio for device (getUserMedia())
  const enableAudio = async () => {
    try {
      // setting local stream to the audio
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
    } catch (err) {
      console.log(err);
    }

    // initialize remote server to media stream
    remoteStream = new MediaStream();

    // push tracks from local stream to peerConnection
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = event => {
      event.streams[0].getTracks(track => {
        remoteStream.addTrack(track);
      });
    };
  };

  const call = async () => {
    // enable audio devices
    await enableAudio();

    // get candidates for caller and save to db
    pc.onicecandidate = event => {
      console.log('Caller: pushing ice offer candidates');
      event.candidate && addToList(offerCandidatesPath, event.candidate.toJSON());
    };

    // create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    // config for offer
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type
    };

    addToList(offerPath, offer);

    // listening to changes in db and update the streams accordingly
    onValue(ref(getDatabase(), 'calls/'), snapshot => {
      const data = snapshot.val();

      if (!pc.currentRemoteDescription && data.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);

        // if answered add candidates to peer connection
        onValue(ref(getDatabase(), answerCandidatesPath), snapshot => {
          if (!snapshot.val()) return;

          const candidate = new RTCIceCandidate(snapshot.val().data);
          pc.addIceCandidate(candidate);
        });
      }
    });

  };

  const answer = async () => {
    const callId = 0;

    pc.onicecandidate = event => {
      console.log('Caller: pushing ice answer candidates');
      event.candidate && addToList(answerCandidatesPath, event.candidate.toJSON());
    };

    try {
      const snapshot = await get(child(ref(getDatabase()), callPath + callId.toString())); 
      const callData = snapshot.val();
      const offerDescription = callData.offer.data;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    } catch (err) {
      console.log('answer remoteDescription', err);
    }

    try {
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(new RTCSessionDescription(answerDescription));

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp
      };

      addToList(answerPath, answer);

    } catch (err) {
      console.log('answer localDescription', err);
    }

    onValue(ref(getDatabase(), offerCandidatesPath), snapshot => {
      if (!snapshot.val()) return;

      const data = snapshot.val().data;
      console.log(data);
      pc.addIceCandidate(new RTCIceCandidate(data));
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = remoteStream;
    }
  }, []);

  return (
    <main>
      <audio ref={audioRef}></audio>
      <button type="button" onClick={call}>Call</button>
      <button type="button" onClick={answer}>answer</button>
    </main>
  );

}
