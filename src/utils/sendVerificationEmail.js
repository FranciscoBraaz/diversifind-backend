import { createTransporter } from "./createTransporter.js"
import dotenv from "dotenv"

dotenv.config()

export async function sendVerificationEmail(user) {
  const transporter = createTransporter()
  const url =
    process.env.NODE_ENV === "production"
      ? "https://diversifind.netlify.app"
      : "http://localhost:3000"

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Confirmação de email",
    html: `
      <h1>Olá ${user.name}</h1>
      <p>Para confirmar seu email, clique no link abaixo:</p>
      <a href="${url}/verificar-email?token=${user.emailToken}">Confirmar email</a>
    `,
  }

  return await transporter.sendMail(mailOptions)
}
