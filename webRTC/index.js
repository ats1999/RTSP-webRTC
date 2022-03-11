window.addEventListener("DOMContentLoaded", init);

const addLog = (log) => {
  const logEl = document.getElementById("log");
  logEl.innerText = logEl.innerText + log + "\n";
};

const logError = (err) => {
  console.log(err);
  addLog(err.toString());
};

function createPeerConnection() {
  let myConn = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun2.l.google.com:19302",
      },
    ],
  });

  addLog("Created local peer");
  myConn.onicecandidate = function (candidate) {
    addLog("Event : onicecandidate");
    console.log(candidate);
  };

  myConn.ontrack = function (track) {
    addLog("Event : ontrack");
  };

  myConn.onnegotiationneeded = function (_) {
    console.log("Event : onnegotiationneeded");
  };

//   myConn
//     .createOffer()
//     .then((offer) => {
//       return myConn.setLocalDescription(offer);
//     })
//     .then(() => {
//       console.log({ sdp: myConn.localDescription });
//       addLog(JSON.stringify(myConn.localDescription))
//     })
//     .catch(logError);
}

function addLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((localStream) => {
      addLog("Added local media stream");
      document.getElementById("local_video").srcObject = localStream;
    })
    .catch(logError);
}
function init() {
//   addLog("Page Loaded..");
//   createPeerConnection();
//   addLocalStream();
}
