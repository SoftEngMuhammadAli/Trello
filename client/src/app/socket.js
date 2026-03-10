import { io } from 'socket.io-client';

let socket;

export function connectSocket(accessToken) {
  if (!accessToken) return null;
  if (socket && socket.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030', {
    auth: { token: accessToken },
    transports: ['websocket'],
    withCredentials: true,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
