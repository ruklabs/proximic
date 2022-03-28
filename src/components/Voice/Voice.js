
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

const peerConnection = new RTCPeerConnection([config]);
let localStream = null;
let remoteStream = null;

const handleClick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({audio: true});
  remoteStream = new MediaStream();
  
  // push tracks from local stream to peer connection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // pull tracks from remote stream, add to video stream
  peerConnection.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };
};

const initiateCall = async () => {
  // create offer from caller
  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  };
};

export default function Voice() {
  return (
    <>
      <p>voice</p>
      <button type="button" onClick={handleClick}>turn on voice</button>
      <button type="button" onClick={initiateCall}>call</button>
      <audio>
        <source src={remoteStream} />
        Your browser does not support the audio tag
      </audio>
    </>
  );
}
