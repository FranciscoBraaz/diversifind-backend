import { connect } from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export async function mongoConnect() {
  try {
    await connect(process.env.MONGO_URL)
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
  } catch (error) {
    console.log("Erro ao conectar com o MongoDB: ", error)
  }
}
