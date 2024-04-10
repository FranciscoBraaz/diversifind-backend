import { Router } from "express"

// Controllers
import * as messageController from "../controllers/message.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = Router()

router.post(
  "/sendMessage",
  requiredParams(["content", "receiverId"]),
  messageController.sendMessage,
)

export default router
