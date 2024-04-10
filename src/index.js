import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

// Mongo
import { mongoConnect } from "./database/mongo.js"

// Configs
import { corsOptions } from "./config/corsOptions.js"

// Middlewares
import { credentials } from "./middlewares/credentials.js"

// Routes
import routes from "./routes/index.js"

// app
import { app, server } from "./socket/socket.js"

dotenv.config()

mongoConnect()

app.use(credentials)

app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use("/", routes)
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint não encontrado" })
})

server.listen(process.env.PORT)
