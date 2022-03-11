window.addEventListener("DOMContentLoaded", init);

function log(data) {
  var log = document.querySelector(".log");
  log.innerText = log.innerText + "\n" + data;
  log.scrollTop = 100000000;
}

// return socket.io  instance
function getSocket() {
  return new Promise(function (resolve, reject) {
    log("Connecting Socket...");
    const socket = io("http://localhost:3000", { transports: ["websocket"] });
    socket.on("connect", () => {
      log("Connected socket +++");
      resolve(socket);
    });
    socket.on("error", (e) => {
      console.log(e);
      log("Socket connection error");
      reject();
    });
  });
}

async function init() {
  log("Init Called");
  try {
    let pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun2.l.google.com:19302",
        },
      ],
    });

    let socket = await getSocket();
    await navigator.mediaDevices
      .getDisplayMedia({video:true})
      .then((stream) => {
        log("Added local Video");
        document.getElementById("input").srcObject = stream;
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      });

    pc.ontrack = function (track) {
      document.getElementById("output").srcObject = track.streams[0];
      log("Added remote Track");
    };

    pc.onicecandidate = function (e) {
      if (e.candidate) socket.emit("candidate", JSON.stringify(e.candidate));
      log("onicecandidate");
    };

    socket.on("candidate", async function (candidate) {
      await pc.addIceCandidate(JSON.parse(candidate));
    });

    socket.on("offer", async function (sdp) {
      log("Received :=> offer");
      await pc.setRemoteDescription(JSON.parse(sdp));
      let ans = await pc.createAnswer();
      pc.setLocalDescription(ans);
      log("Sent :=> answer");
      socket.emit("answer", JSON.stringify(ans));
    });
  } catch (e) {
    console.log(e);
    log("Some error occured\nPlease check the console");
  }
}
