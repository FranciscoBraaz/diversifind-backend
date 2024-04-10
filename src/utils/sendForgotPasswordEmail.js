import { createTransporter } from "./createTransporter.js"
import dotenv from "dotenv"

dotenv.config()

export async function sendForgotPasswordEmail(user) {
  const transporter = createTransporter()
  const url =
    process.env.NODE_ENV === "production"
      ? "https://diversifind.netlify.app"
      : "http://localhost:3000"

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Resetar senha",
    html: `
      <h1>Olá ${user.name}</h1>
      <p>Resetar sua senha, clique no link abaixo:</p>
      <a href="${url}/alterar-senha?token=${user.forgotPasswordToken}">Resetar senha</a>
    `,
  }

  return await transporter.sendMail(mailOptions)
}
