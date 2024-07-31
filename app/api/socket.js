import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    return res.end();
  }

  console.log("Socket is initializing");

  const io = new Server(res.socket.server, {
    cors: {
      origin: "*", // Adjust according to your needs
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("newOrder", (order) => {
      console.log("New order received:", order);
      socket.broadcast.emit("newOrder", order);
    });

    socket.on("orderServed", ({ tableId }) => {
      console.log(`Order for table ${tableId} served`);
      socket.broadcast.emit("orderServed", { tableId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  res.end();
};

export default SocketHandler;
