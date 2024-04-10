import { createTransporter } from "./createTransporter.js"
import dotenv from "dotenv"

dotenv.config()

export async function sendChangeEmailCode({ name, email, code }) {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Código para alteração de e-mail",
    html: `
      <h1>Olá ${name}</h1>
      <p>Este é o seu código:</p>
      <p>${code}</p>
    `,
  }

  return await transporter.sendMail(mailOptions)
}
