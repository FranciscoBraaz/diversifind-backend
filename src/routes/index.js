import express from "express"

// Middlewares
import { verifyAccessToken } from "../middlewares/verifyAccesstoken.js"

// Routes
import userRoutes from "./user.route.js"
import postRoutes from "./posts.route.js"
import likeRoutes from "./like.route.js"
import commentRoutes from "./comment.route.js"
import professionalAreaRoutes from "./professionalArea.route.js"
import skillRoutes from "./skill.route.js"
import vacancyExternalRoutes from "./vacancyExternal.route.js"
import vacancyRoutes from "./vacancy.route.js"
import communityRoutes from "./community.route.js"
import conversationRoutes from "./conversation.route.js"
import messageRoutes from "./message.route.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Bem-vindo(a)" })
})
router.use("/users", userRoutes)
router.use("/vacancy-external", vacancyExternalRoutes)
router.use("/posts", verifyAccessToken, postRoutes)
router.use("/likes", verifyAccessToken, likeRoutes)
router.use("/comments", verifyAccessToken, commentRoutes)
router.use("/professional-area", verifyAccessToken, professionalAreaRoutes)
router.use("/skill", verifyAccessToken, skillRoutes)
router.use("/vacancy", verifyAccessToken, vacancyRoutes)
router.use("/community", verifyAccessToken, communityRoutes)
router.use("/conversation", verifyAccessToken, conversationRoutes)
router.use("/message", verifyAccessToken, messageRoutes)

export default router
