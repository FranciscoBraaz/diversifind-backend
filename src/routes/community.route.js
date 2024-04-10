import { Router } from "express"

// Controllers
import * as communityController from "../controllers/community.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = Router()

router.post(
  "/create",
  requiredParams(["name", "link", "platform", "professionalArea"]),
  communityController.createCommunity,
)
router.post(
  "/edit",
  requiredParams(["name", "link", "platform", "professionalArea"]),
  communityController.editCommunity,
)
router.post(
  "/list",
  requiredParams(["page", "filters"]),
  communityController.listCommunities,
)
router.post(
  "/list-by-author",
  requiredParams(["page", "filters"]),
  communityController.listCommunitiesByAuthor,
)
router.post(
  "/rate",
  requiredParams(["rating", "communityId"]),
  communityController.rateCommunity,
)
router.delete("/delete/:communityId", communityController.deleteCommunity)

export default router
