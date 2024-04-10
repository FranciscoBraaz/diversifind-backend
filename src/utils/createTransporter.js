import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export function createTransporter() {
  // console.log(process.env.EMAIL, process.env.EMAIL_PASSWORD)
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  return transporter
}
