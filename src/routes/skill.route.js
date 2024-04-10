import express from "express"

// Controllers
import * as skillController from "../controllers/skill.controller.js"

// Midlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = express.Router()

router.post(
  "/add",
  requiredParams(["skillName", "professionalAreaId"]),
  skillController.addSkill,
)
router.post(
  "/create-many",
  requiredParams(["skills", "professionalAreaId"]),
  skillController.addManySkills,
)
router.get(
  "/get-by-professional-area/:professionalAreaId",
  skillController.getSkillByProfessinalArea,
)

export default router
