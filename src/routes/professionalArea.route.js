import express from "express"

// Controllers
import * as professionalAreaController from "../controllers/professionalArea.controller.js"

// Midlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = express.Router()

router.post(
  "/create",
  requiredParams(["name"]),
  professionalAreaController.addProfessionalArea,
)
router.get("/list", professionalAreaController.listProfessionalAreas)

export default router
