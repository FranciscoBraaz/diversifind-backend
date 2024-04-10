import { Router } from "express"

// Controllers
import * as vacancyController from "../controllers/vacancy.controller.js"

const router = Router()

router.get(
  "/get-external-vacancy/:id?",
  vacancyController.getExternalVacancyById,
)
router.post("/create-external-vacancy", vacancyController.createExternalVacancy)

export default router
