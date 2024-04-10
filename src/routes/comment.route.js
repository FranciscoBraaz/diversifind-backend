import express from "express"

import * as commentController from "../controllers/comment.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Publicações" })
})
router.post(
  "/add-comment",
  requiredParams(["postId", "content"]),
  commentController.newComment,
)
router.post(
  "/get-comments",
  requiredParams(["postId"]),
  commentController.getCommentsFromPost,
)
router.post(
  "/remove-comment",
  requiredParams(["postId", "commentId"]),
  commentController.removeComment,
)
router.put(
  "/edit-comment",
  requiredParams(["commentId", "content"]),
  commentController.editComment,
)

export default router
