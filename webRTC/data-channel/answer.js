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

    let dc = null;
    let socket = await getSocket();

    pc.onicecandidate = function (e) {
      if (e.candidate) socket.emit("candidate", JSON.stringify(e.candidate));
      log("onicecandidate");
    };

    socket.on("candidate", async function (candidate) {
      await pc.addIceCandidate(JSON.parse(candidate));
    });

    pc.ondatachannel = function (e) {
      dc = e.channel;

      dc.onopen = function () {
        log("Channel Opened");
      };

      dc.onmessage = function (msg) {
        // add sent text to the output chat box
        let opt = document.getElementById("output");
        opt.innerText = opt.innerText + "\n" + msg.data;

        // scroll to the bottom pre
        opt.scrollTop = 100000000;

        log("Received :=> " + msg.data);
      };
    };

    socket.on("offer", async function (sdp) {
      log("Received :=> offer");
      await pc.setRemoteDescription(JSON.parse(sdp));
      let ans = await pc.createAnswer();
      pc.setLocalDescription(ans);
      log("Sent :=> answer");
      socket.emit("answer", JSON.stringify(ans));
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

          // send message
          dc.send(e.target.value);

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
