import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  let success = false

  if (req.headers.authorization) {
    const [authType, token] = req.headers.authorization.split(" ")
    if (authType === "Bearer") {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (typeof decoded === "object") {
          req.userId = decoded._id
        }
        success = true
      } catch (error) {
        console.log(error)
      }
    }
  }

  if (success) {
    next()
  } else {
    res.status(401).json({ message: "Não autorizado" })
  }
}
