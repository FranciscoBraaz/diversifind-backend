import dotenv from "dotenv"

dotenv.config()

export const allowedOrigins = [
  process.env.FRONTEND_LOCAL,
  process.env.FRONTEND_PROD,
]
