import { Router } from "express"

// Controllers
import * as vacancyController from "../controllers/vacancy.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"

const router = Router()

router.post(
  "/create",
  requiredParams([
    "occupation",
    "company",
    "description",
    "typeLocation",
    "occupationArea",
    "skills",
    "employmentType",
    "contractType",
  ]),
  vacancyController.createVacancy,
)
router.put(
  "/edit",
  requiredParams([
    "vacancyId",
    "occupation",
    "company",
    "description",
    "typeLocation",
    "occupationArea",
    "skills",
    "employmentType",
    "contractType",
  ]),
  vacancyController.editVacancy,
)
router.post(
  "/list-vacancies",
  requiredParams(["page", "filters"]),
  vacancyController.listVacancies,
)
router.post(
  "/list-vacancies-by-author",
  requiredParams(["page"]),
  vacancyController.listVacanciesByAuthor,
)
router.post(
  "/list-applications-by-user",
  requiredParams(["page"]),
  vacancyController.listApplicationsByUser,
)
router.get("/:vacancyId", vacancyController.getVacancyInfo)
router.post(
  "/apply",
  requiredParams(["vacancyId", "contactEmail"]),
  vacancyController.applyVacancy,
)
router.post(
  "/candidates",
  requiredParams(["vacancyId", "page"]),
  vacancyController.getVacancyCandidates,
)
router.delete("/delete/:vacancyId", vacancyController.deleteVacancy)
router.delete(
  "/delete-external-vacancies",
  vacancyController.removeExternalVacancies,
)

export default router
