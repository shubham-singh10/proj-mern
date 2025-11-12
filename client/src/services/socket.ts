import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export const createSocket = () => {
    return io(SOCKET_URL, {
        withCredentials: true,
    });
}