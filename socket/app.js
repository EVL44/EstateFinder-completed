import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("newComment", (data) => {
    io.emit("receiveComment", data);
  });

  socket.on("newReply", (data) => {
    io.emit("receiveReply", data);
  });

  socket.on("deleteComment", (commentId) => {
    io.emit("commentDeleted", commentId);
  });

  socket.on("deleteReply", (replyId, commentId) => {
    io.emit("replyDeleted", { replyId, commentId });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });

  socket.on("deleteReply", (data) => {
    io.emit("receiveDeleteReply", data);
  });

  // Inside your socket.io connection handler
  socket.on("likeComment", (commentId) => {
    io.emit("likeComment", commentId);
  });

  socket.on("unlikeComment", (commentId) => {
    io.emit("unlikeComment", commentId);
  });


});

io.listen(4000);
