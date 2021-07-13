const cors = require("cors");
const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { ...cors() } });
const port = 8080;

require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});

http.listen(process.env.URL || port, () => {
  console.log(`listening on *:${process.env.URL || port}`);
});

connectedUsers = [];

io.on("connection", (socket) => {
  console.log("new client connected");
  socket.emit("connection", null);

  socket.on("sendName", (data) => {
    connectedUsers.push({ id: socket.id, name: data.name });
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
    socket.broadcast.emit("update-user-list", { users: connectedUsers });
  });

  socket.on("mediaOffer", (data) => {
    socket.to(data.to).emit("mediaOffer", {
      from: data.from,
      offer: data.offer,
    });
  });

  socket.on("mediaAnswer", (data) => {
    socket.to(data.to).emit("mediaAnswer", {
      from: data.from,
      answer: data.answer,
    });
  });

  socket.on("iceCandidate", (data) => {
    socket.to(data.to).emit("remotePeerIceCandidate", {
      candidate: data.candidate,
    });
  });

  socket.on("requestUserList", () => {
    socket.emit("update-user-list", { users: connectedUsers });
    socket.broadcast.emit("update-user-list", { users: connectedUsers });
  });
});

module.exports = app;
