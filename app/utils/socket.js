import io from "socket.io-client";

let socket;

export const initSocket = (restaurantId) => {
  socket = io("http://localhost:5000", {
    query: { restaurantId },
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
