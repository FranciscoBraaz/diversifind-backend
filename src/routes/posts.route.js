import express from "express"

import * as postsController from "../controllers/posts.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"
import { upload } from "../middlewares/upload.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Publicações" })
})
router.post(
  "/create",
  upload.single("file"),
  requiredParams(["content"]),
  postsController.createPost,
)
router.put(
  "/edit",
  upload.single("file"),
  requiredParams(["postId", "content"]),
  postsController.editPost,
)
router.get("/get-feed", postsController.getFeed)
router.get("/get-post", postsController.getPost)
router.delete("/remove-post", postsController.deletePost)

export default router
