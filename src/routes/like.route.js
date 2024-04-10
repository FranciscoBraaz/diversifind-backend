import express from "express"

import * as likeController from "../controllers/like.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Publicações" })
})
router.post("/add-like", requiredParams(["postId"]), likeController.likePost)
router.post(
  "/remove-like",
  requiredParams(["postId"]),
  likeController.unlikePost,
)

export default router
