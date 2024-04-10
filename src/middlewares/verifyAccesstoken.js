import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export async function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: "Não autorizado" })
  }

  const accessToken = authHeader.split(" ")[1]

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).json({ message: "Acesso não autorizado" })
    }

    req.userEmail = decoded.email
    req.userId = decoded._id
    next()
  })
}
