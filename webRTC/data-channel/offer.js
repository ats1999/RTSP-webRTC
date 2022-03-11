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

    pc.onicecandidate = function (e) {
      if (e.candidate) socket.emit("candidate", JSON.stringify(e.candidate));
      log("onicecandidate");
    };

    pc.ontrack = function (track) {
      document.getElementById("output").srcObject = track.streams[0];
      log("Added remote Track")
    };
    socket.on("candidate", async function (candidate) {
      await pc.addIceCandidate(JSON.parse(candidate));
    });

    await navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        log("Added local Video");
        document.getElementById("input").srcObject = stream;
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      });

    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    log("Offer Created");

    socket.emit("offer", JSON.stringify(pc.localDescription));

    socket.on("answer", function (sdp) {
      log("Received :=> answer");
      pc.setRemoteDescription(JSON.parse(sdp));
    });
  } catch (e) {
    console.log(e);
    log("Some error occured\nPlease check the console");
  }
}
