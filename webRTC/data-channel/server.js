const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

const io = new Server(server);

const PORT = 3000;
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("A user connected :)");
  socket.on("msg", console.log);

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
  socket.on("error", (e) => console.log(e));

  socket.join("data_channel");

  socket.on("offer", (sdp) => {
    socket.to("data_channel").emit("offer", sdp);
  });

  socket.on("answer", (sdp) => {
    socket.to("data_channel").emit("answer", sdp);
  });

  socket.on("candidate", (candidate) => {
    socket.to("data_channel").emit("candidate", candidate);
  });
});

io.on("error", (e) => console.log(e));

server.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
