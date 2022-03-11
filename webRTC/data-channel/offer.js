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

    let dc = pc.createDataChannel("msg");
    let socket = await getSocket();

    pc.onicecandidate = function (e) {
      if (e.candidate)
        try {
          //   pc.addIceCandidate(e.candidate);
        } catch (e) {}
      log("onicecandidate");
    };

    dc.onopen = function (e) {
      console.log("Channel Opened", e);
      log("Channel Opened");
    };
    dc.onclose = function (e) {
      console.log("Channel closed");
      log("Channel closed");
    };

    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    log("Offer Created");

    socket.emit("offer", JSON.stringify(pc.localDescription));

    socket.on("answer", function (sdp) {
      log("Received :=> answer");
      pc.setRemoteDescription(JSON.parse(sdp));
    });
    // add event listener to input box
    // send message when user presses ENTER
    document
      .querySelector(".input-box")
      .addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
          log("Sent :=> " + e.target.value);

          // add sent text to the input chat box
          let inp = document.getElementById("input");
          inp.innerText = inp.innerText + "\n" + e.target.value;

          // clear input box
          e.target.value = "";

          // scroll to the bottom pre
          inp.scrollTop = 100000000;
        }
      });
  } catch (e) {
    console.log(e);
    log("Some error occured\nPlease check the console");
  }
}
