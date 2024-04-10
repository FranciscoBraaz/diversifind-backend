import { Router } from "express"

import * as conversationController from "../controllers/conversation.controller.js"

const router = Router()

router.get(
  "/getConversations/:keyword?",
  conversationController.listConversations,
)
router.get(
  "/getMessages/:conversationId/:page/:limit",
  conversationController.getConversationMessages,
)

export default router
