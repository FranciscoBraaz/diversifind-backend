import express from "express"
import { Server } from "socket.io"
import http from "http"

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://diversifind.netlify.app"],
    methods: ["GET", "POST"],
  },
})

const userSocketMap = {} // { userId: socketId }
export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId

  if (userId) {
    userSocketMap[userId] = socket.id
  }

  io.emit("onlineUsers", Object.keys(userSocketMap))

  socket.on("disconnect", () => {
    delete userSocketMap[userId]
    io.emit("onlineUsers", Object.keys(userSocketMap))
  })
})

export { app, io, server }
