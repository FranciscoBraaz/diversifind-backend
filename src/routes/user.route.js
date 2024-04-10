import express from "express"

// Controller
import * as userController from "../controllers/user.controller.js"

// Middlewares
import { requiredParams } from "../middlewares/requiredParams.js"
import { verifyAccessToken } from "../middlewares/verifyAccesstoken.js"
import { upload } from "../middlewares/upload.js"

const router = express.Router()

router.get("/", userController.getAllUsers)
router.post(
  "/sign-up-person",
  requiredParams(["name", "email", "password"]),
  userController.signUpPerson,
)
router.post(
  "/sign-up-company",
  requiredParams([
    "name",
    "email",
    "password",
    "city",
    "stateUf",
    "occupationArea",
    "companyType",
  ]),
  userController.signUpCompany,
)
router.post(
  "/sign-in",
  requiredParams(["email", "password"]),
  userController.signIn,
)
router.get("/sign-out", userController.signOut)
router.get("/refresh-token", userController.refreshAccessToken)
router.post(
  "/resend-confirmation-email",
  userController.resendConfirmationEmail,
)
router.post("/confirm-email", userController.confirmEmail)
router.post("/forgot-password", userController.forgotPassword)
router.post("/reset-password", userController.resetPassword)
router.patch(
  "/update-about",
  verifyAccessToken,
  requiredParams(["about"]),
  userController.updateAbout,
)
router.get("/get-user", verifyAccessToken, userController.getUser)
router.patch(
  "/update-basic-info",
  verifyAccessToken,
  requiredParams(["name"]),
  userController.updateBasicInfo,
)
router.patch(
  "/update-avatar",
  verifyAccessToken,
  upload.single("file"),
  userController.updateAvatar,
)
router.post(
  "/create-experience",
  verifyAccessToken,
  requiredParams([
    "occupation",
    "company",
    "startDateMonth",
    "startDateYear",
    "type",
  ]),
  userController.addExperience,
)
router.patch(
  "/edit-experience",
  verifyAccessToken,
  requiredParams([
    "experienceId",
    "occupation",
    "company",
    "startDateMonth",
    "startDateYear",
    "type",
  ]),
  userController.editExperience,
)
router.delete(
  "/delete-experience",
  verifyAccessToken,
  userController.deleteExperience,
)
router.post(
  "/create-academic-education",
  verifyAccessToken,
  requiredParams([
    "name",
    "institution",
    "degree",
    "startDateMonth",
    "startDateYear",
    "endDateMonth",
    "endDateYear",
  ]),
  userController.addAcademicEducation,
)
router.patch(
  "/edit-academic-education",
  verifyAccessToken,
  requiredParams([
    "academicEducationId",
    "name",
    "institution",
    "degree",
    "startDateMonth",
    "startDateYear",
    "endDateMonth",
    "endDateYear",
  ]),
  userController.editAcademicEducation,
)
router.delete(
  "/delete-academic-education",
  verifyAccessToken,
  userController.deleteAcademicEducation,
)
router.post(
  "/create-certificate",
  verifyAccessToken,
  requiredParams(["name", "institution", "issueMonth", "issueYear", "url"]),
  userController.addCertificate,
)
router.patch(
  "/edit-certificate",
  verifyAccessToken,
  requiredParams([
    "certificateId",
    "name",
    "institution",
    "issueMonth",
    "issueYear",
    "url",
  ]),
  userController.editCertificate,
)
router.delete(
  "/delete-certificate",
  verifyAccessToken,
  userController.deleteCertificate,
)
router.patch(
  "/update-resume",
  verifyAccessToken,
  upload.single("file"),
  userController.updateResume,
)
router.get("/get-suggestions", verifyAccessToken, userController.getSuggestions)
router.post(
  "/getNetworkUsers",
  verifyAccessToken,
  requiredParams(["page", "limit"]),
  userController.getNetworkUsers,
)
router.get(
  "/get-network-user-info",
  verifyAccessToken,
  userController.getNetworkingUserInfo,
)
router.post("/follow", verifyAccessToken, userController.addFollower)
router.post("/unfollow", verifyAccessToken, userController.removeFollower)
router.post(
  "/sendCodeToEmail",
  verifyAccessToken,
  requiredParams(["currentEmail", "newEmail"]),
  userController.sendCodeToEmail,
)
router.post(
  "/updateEmail",
  verifyAccessToken,
  requiredParams(["currentEmail", "newEmail", "code"]),
  userController.changeEmail,
)
router.post(
  "/updatePassword",
  verifyAccessToken,
  requiredParams(["currentPassword", "newPassword"]),
  userController.changePassword,
)
router.delete("/deleteAccount", verifyAccessToken, userController.removeAccount)

export default router
