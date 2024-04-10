import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { unlink } from "fs/promises"
import { ObjectId } from "mongodb"
import randomize from "randomatic"

// Models
import * as User from "../models/user.model.js"
import * as Post from "../models/post.model.js"
import * as Comment from "../models/comment.model.js"
import * as Application from "../models/applicationVacancy.model.js"
import * as Like from "../models/like.model.js"
import * as Conversation from "../models/conversation.model.js"
import * as Message from "../models/message.model.js"

// Middlewares
import cloudinary from "../middlewares/cloudinary.js"

// Utils
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js"
import { sendForgotPasswordEmail } from "../utils/sendForgotPasswordEmail.js"
import {
  sortCertificates,
  sortExperiences,
  sortFormation,
} from "../utils/index.js"
import { sendChangeEmailCode } from "../utils/sendChangeEmailCode.js"

dotenv.config()

export async function getAllUsers(req, res) {
  try {
    const users = await User.listAll()

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.query

    const user = await User.getById(id)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function signUpPerson(req, res) {
  try {
    const { name, email, password } = req.body

    const foundUser = await User.findByEmail(email)

    if (foundUser) {
      return res.status(409).json({ message: "Usuário já cadastrado" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const emailToken = jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET, {
      expiresIn: "5m",
    })

    await User.create({
      name,
      email,
      password: hashedPassword,
      profileType: "person",
      emailToken,
    })
    await sendVerificationEmail({ name, email, emailToken })

    res
      .status(201)
      .json({ message: "Enviamos um link de confirmação para o seu e-mail" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function signUpCompany(req, res) {
  try {
    const {
      name,
      email,
      password,
      city,
      stateUf,
      occupationArea,
      companyType,
      website,
    } = req.body

    const foundUser = await User.findByEmail(email)

    if (foundUser) {
      return res.status(409).json({ message: "Usuário já cadastrado" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const emailToken = jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET, {
      expiresIn: "5m",
    })

    await User.create({
      name,
      email,
      password: hashedPassword,
      city,
      stateUf,
      occupationArea,
      companyType,
      website,
      profileType: "company",
      emailToken,
    })
    await sendVerificationEmail({ name, email, emailToken })

    res
      .status(201)
      .json({ message: "Enviamos um link de confirmação para o seu e-mail" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function signIn(req, res) {
  try {
    const { email, password } = req.body

    const foundUser = await User.findByEmail(email)

    if (!foundUser) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" })
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password)

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" })
    }

    if (foundUser && !foundUser.active) {
      let expiresTime = 0
      if (foundUser.emailToken) {
        expiresTime = jwt.decode(
          foundUser.emailToken,
          process.env.EMAIL_TOKEN_SECRET,
        ).exp
      }
      return res.status(403).json({ message: "Usuário inativo", expiresTime })
    }

    /* Create access token */
    const accessToken = jwt.sign(
      { email: foundUser.email, _id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    )

    const refreshToken = jwt.sign(
      { userId: foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    )

    await User.update(foundUser.email, { refreshToken })

    res.cookie("rf-jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    })
    const {
      name,
      email: userEmail,
      avatar,
      headline,
      followers,
      following,
      resumeUrl,
      _id,
    } = foundUser

    res.json({
      name,
      email: userEmail,
      headline,
      resumeUrl,
      followers: followers.length,
      following: following.length,
      _id,
      avatar,
      accessToken,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function signOut(req, res) {
  try {
    const cookies = req.cookies

    if (!cookies ?? !cookies["rf-jwt"]) {
      return res.sendStatus(204)
    }

    const refreshToken = cookies["rf-jwt"]

    const foundUser = await User.findByRefreshToken(refreshToken)

    if (!foundUser) {
      res.clearCookie("rf-jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
      return res.sendStatus(204)
    }

    await User.update(foundUser.email, { refreshToken: "" })

    res.clearCookie("rf-jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
    res.sendStatus(204)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function refreshAccessToken(req, res) {
  const cookies = req.cookies
  if (!cookies || !cookies["rf-jwt"]) {
    return res.status(401).json({ message: "Não autorizado" })
  }

  const refreshToken = cookies["rf-jwt"]

  const foundUser = await User.findByRefreshToken(refreshToken)

  if (!foundUser) {
    return res.status(401).json({ message: "Acesso não autorizado" })
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err || payload.userId !== foundUser._id.toString()) {
      return res.status(401).json({ message: "Acesso não autorizado" })
    }

    const accessToken = jwt.sign(
      { email: foundUser.email, _id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    )

    res.json({ accessToken })
  })
}

export async function resendConfirmationEmail(req, res) {
  try {
    const { email } = req.body

    const foundUser = await User.findByEmail(email)

    if (foundUser) {
      const emailToken = jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET, {
        expiresIn: "30000ms",
      })

      await User.update(foundUser.email, { emailToken })
      await sendVerificationEmail({ name: foundUser.name, email, emailToken })
    }

    res.status(200).json({
      message: "Enviamos um novo link de confirmação para o seu e-mail",
    })
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function confirmEmail(req, res) {
  try {
    const { token } = req.body

    const { email } = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET)

    const foundUser = await User.findByEmail(email)

    if (!foundUser) {
      return res
        .status(400)
        .json({ message: "Não foi possível confirmar o e-mail" })
    }

    const { emailToken } = foundUser

    if (token !== emailToken) {
      return res
        .status(400)
        .json({ message: "Não foi possível confirmar o e-mail" })
    }

    await User.update(foundUser.email, { active: true, emailToken: "" })

    res.status(200).json({ message: "E-mail confirmado com sucesso" })
  } catch (error) {
    if (error.message !== "jwt expired") console.log(error)

    if (error.message === "jwt expired") {
      return res.status(400).json({
        message:
          "Código de confirmação expirado. Envie um novo e-mail de confirmação",
      })
    }

    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body

    const foundUser = await User.findByEmail(email)

    if (!foundUser) {
      return res.status(200).json({
        message:
          "Se o e-mail estiver vinculado à sua conta, você receberá instruções para redefinir a senha.",
      })
    }

    if (foundUser.forgotPasswordToken) {
      const { iat } = jwt.decode(
        foundUser.forgotPasswordToken,
        process.env.FORGOT_PASSWORD_SECRET,
      )
      const createdAt = iat * 1000
      const now = new Date().getTime()

      const diffInMinutes = Math.abs(now - createdAt) / (1000 * 60) // 1000ms * 60s = 1min

      if (diffInMinutes < 2) {
        const timeToResend = createdAt + 120000
        return res.status(400).json({
          message: "Aguarde para enviar um novo e-mail de redefinição de senha",
          timeToResend,
        })
      }
    }

    const forgotPasswordToken = jwt.sign(
      { email },
      process.env.FORGOT_PASSWORD_SECRET,
      {
        expiresIn: "5m",
      },
    )

    await User.update(foundUser.email, { forgotPasswordToken })
    await sendForgotPasswordEmail({
      name: foundUser.name,
      email,
      forgotPasswordToken,
    })

    res.status(200).json({
      message:
        "Se o e-mail estiver vinculado à sua conta, você receberá instruções para redefinir a senha.",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body

    const { email } = jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET)

    const foundUser = await User.findByEmail(email)

    if (!foundUser) {
      return res
        .status(400)
        .json({ message: "Não foi possível redefinir a senha" })
    }

    if (token !== foundUser.forgotPasswordToken) {
      return res
        .status(400)
        .json({ message: "Não foi possível redefinir a senha" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.update(foundUser.email, {
      password: hashedPassword,
      forgotPasswordToken: "",
    })

    res.status(200).json({
      message:
        "Senha redefinida com sucesso. Você será redirecionado para a página de login",
    })
  } catch (error) {
    if (error.message !== "jwt expired") console.log(error)

    if (error.message === "jwt expired") {
      return res.status(400).json({
        message: "Código expirado. Envie um novo e-mail para alterar a senha",
      })
    }

    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function addFollower(req, res) {
  try {
    const { userId } = req
    const { followerId } = req.body

    await User.addNewFollowing(userId, followerId)
    await User.addNewFollower(followerId, userId)
    res.status(200).json({ message: "Seguindo" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function removeFollower(req, res) {
  try {
    const { userId } = req
    const { followerId } = req.body

    await User.removeFollower(userId, followerId)
    res.status(200).json({ message: "Seguidor removido" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function updateBasicInfo(req, res) {
  try {
    const { userId } = req
    const { name, headline, stateUf, city } = req.body

    const updatedUser = await User.updateById(userId, {
      name,
      headline,
      stateUf,
      city,
    })
    const { email: userEmail, avatar, followers, following, _id } = updatedUser

    res.status(200).json({
      message: "Informações atualizadas",
      user: {
        name,
        email: userEmail,
        avatar,
        headline,
        followers: followers.length,
        following: following.length,
        _id,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function updateAvatar(req, res) {
  try {
    const { file, userId } = req

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    if (foundedUser.avatarCloudinaryId) {
      await cloudinary.uploader.destroy(foundedUser.avatarCloudinaryId)
    }

    let avatarInfo = {}
    const result = await cloudinary.uploader.upload(file.path)
    avatarInfo["avatar"] = result.secure_url
    avatarInfo["avatarCloudinaryId"] = result.public_id

    const updatedUser = await User.updateById(userId, avatarInfo)
    const {
      name,
      email: userEmail,
      avatar,
      headline,
      followers,
      following,
      _id,
    } = updatedUser
    await unlink(file.path)

    res.status(200).json({
      message: "Foto atualizada",
      user: {
        name,
        email: userEmail,
        avatar,
        headline,
        followers: followers.length,
        following: following.length,
        _id,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export function updateAbout(req, res) {
  try {
    const { userId } = req
    const { about } = req.body

    const foundedUser = User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    User.updateById(userId, { about })

    res.status(200).json({ message: "Descrição atualizada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function addExperience(req, res) {
  try {
    const { userId } = req
    const {
      occupation,
      company,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
      current = false,
      type,
      description,
    } = req.body
    let endMonth = endDateMonth
    let endYear = endDateYear

    if (current) {
      endMonth = null
      endYear = null
    }

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevExperiences = foundedUser.experience
    let newExperience = {
      _id: new ObjectId(),
      occupation,
      company,
      startDateMonth,
      startDateYear,
      endDateMonth: endMonth,
      endDateYear: endYear,
      current,
      type,
      description,
      createdAt: new Date(),
    }
    prevExperiences.push(newExperience)

    let newExperiences = sortExperiences(prevExperiences)

    await User.updateExperience(userId, newExperiences)

    res.status(200).json({ message: "Experiência adicionada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function editExperience(req, res) {
  try {
    const { userId } = req
    const {
      experienceId,
      occupation,
      company,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
      current = false,
      type,
      description,
    } = req.body
    let endMonth = endDateMonth
    let endYear = endDateYear

    if (current) {
      endMonth = null
      endYear = null
    }

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevExperiences = foundedUser.experience
    let newExperiences = prevExperiences.map((experience) => {
      if (experience._id.toString() === experienceId) {
        return {
          _id: experience._id,
          occupation,
          company,
          startDateMonth,
          startDateYear,
          endDateMonth: endMonth,
          endDateYear: endYear,
          current,
          type,
          description,
          createdAt: experience.createdAt,
        }
      }
      return experience
    })

    newExperiences = sortExperiences(newExperiences)

    await User.updateExperience(userId, newExperiences)

    res.status(200).json({ message: "Experiência atualizada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function deleteExperience(req, res) {
  try {
    const { userId } = req
    const { experienceId } = req.query

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevExperiences = foundedUser.experience
    let newExperiences = prevExperiences.filter(
      (experience) => experience._id.toString() !== experienceId,
    )

    await User.updateExperience(userId, newExperiences)

    res.status(200).json({ message: "Experiência removida" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function addAcademicEducation(req, res) {
  try {
    const { userId } = req
    const {
      name,
      institution,
      degree,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
    } = req.body

    const foundedUser = await User.getById(userId)

    let prevFormations = foundedUser.academicEducation
    let newFormation = {
      _id: new ObjectId(),
      name,
      institution,
      degree,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
      createdAt: new Date(),
    }
    prevFormations.push(newFormation)

    let newFormations = sortFormation(prevFormations)
    await User.updateAcademicEducation(userId, newFormations)

    res.status(200).json({ message: "Formação adicionada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function editAcademicEducation(req, res) {
  try {
    const { userId } = req
    const {
      academicEducationId,
      name,
      institution,
      degree,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
    } = req.body

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevFormations = foundedUser.academicEducation
    let newFormations = prevFormations.map((formation) => {
      if (formation._id.toString() === academicEducationId) {
        return {
          _id: formation._id,
          name,
          institution,
          degree,
          startDateMonth,
          startDateYear,
          endDateMonth,
          endDateYear,
          createdAt: formation.createdAt,
        }
      }
      return formation
    })

    newFormations = sortFormation(newFormations)

    await User.updateAcademicEducation(userId, newFormations)

    res.status(200).json({ message: "Formação atualizada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function deleteAcademicEducation(req, res) {
  try {
    const { userId } = req
    const { academicEducationId } = req.query

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevFormations = foundedUser.academicEducation
    let newFormations = prevFormations.filter(
      (formation) => formation._id.toString() !== academicEducationId,
    )

    await User.updateAcademicEducation(userId, newFormations)

    res.status(200).json({ message: "Experiência removida" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function addCertificate(req, res) {
  try {
    const { userId } = req
    const { name, institution, issueMonth, issueYear, url } = req.body

    const foundedUser = await User.getById(userId)

    let prevCertificates = foundedUser.certificates
    let newCertificate = {
      _id: new ObjectId(),
      name,
      institution,
      issueMonth,
      issueYear,
      url,
      createdAt: new Date(),
    }
    prevCertificates.push(newCertificate)

    let newCertificates = sortCertificates(prevCertificates)

    await User.updateCertificates(userId, newCertificates)

    res.status(200).json({ message: "Certificado adicionado" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function editCertificate(req, res) {
  try {
    const { userId } = req
    const { certificateId, name, institution, issueMonth, issueYear, url } =
      req.body

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevCertificates = foundedUser.certificates
    let newCertificates = prevCertificates.map((certificate) => {
      if (certificate._id.toString() === certificateId) {
        return {
          _id: certificate._id,
          name,
          institution,
          issueMonth,
          issueYear,
          url,
          createdAt: certificate.createdAt,
        }
      }
      return certificate
    })

    newCertificates = sortCertificates(newCertificates)

    await User.updateCertificates(userId, newCertificates)

    res.status(200).json({ message: "Certificado atualizado" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function deleteCertificate(req, res) {
  try {
    const { userId } = req
    const { certificateId } = req.query

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    let prevCertificates = foundedUser.certificates
    let newCertificates = prevCertificates.filter(
      (certificate) => certificate._id.toString() !== certificateId,
    )

    await User.updateCertificates(userId, newCertificates)

    res.status(200).json({ message: "Certificado removido" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function updateResume(req, res) {
  try {
    const { file, userId } = req

    if (!file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" })
    }

    const foundedUser = await User.getById(userId)
    if (foundedUser.resumeCloudinaryId) {
      await cloudinary.uploader.destroy(foundedUser.resumeCloudinaryId)
    }

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      filename_override: file.originalname,
    })

    await User.updateById(userId, { resumeUrl: result.url })
    await unlink(file.path)
    res
      .status(200)
      .json({ message: "Currículo atualizado", resumeUrl: result.url })
  } catch (error) {
    console.log(error)
  }
}

export async function getNetworkUsers(req, res) {
  try {
    const { userId } = req
    const { page, limit, type, keyword } = req.body

    if (type === "followers") {
      const { users, total } = await User.listAllFollowers({
        userId,
        page,
        limit,
        keyword,
      })
      return res.status(200).json({ users, total })
    }

    if (type === "following") {
      const { users, total } = await User.listAllFollowing({
        userId,
        page,
        limit,
        keyword,
      })
      return res.status(200).json({ users, total })
    }

    if (type === "all") {
      const { users, total } = await User.listAllUsers({
        userId,
        page,
        limit,
        keyword,
      })

      return res.status(200).json({ users, total })
    }

    const { users, total } = await User.listUserNotFollowing({
      userId,
      page,
      limit,
      keyword,
    })

    res.status(200).json({ users, total })
  } catch (error) {
    console.log(error)
  }
}

export async function getNetworkingUserInfo(req, res) {
  try {
    const { userId } = req

    const user = await User.getById(userId)

    const userNetwork = {
      followers: user.followers,
      following: user.following,
    }

    res.status(200).json({ userNetwork })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function sendCodeToEmail(req, res) {
  try {
    const { currentEmail, newEmail } = req.body

    const user = await User.findByEmail(currentEmail)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    if (
      user.codeToChangeEmail &&
      Date.now() - user.codeToChangeEmail.createdAt < 90000
    ) {
      return res.status(400).json({
        message: "Aguarde 1 minuto para enviar um novo código",
      })
    }

    const foundUserByNewEmail = await User.findByEmail(newEmail)
    if (foundUserByNewEmail) {
      return res.status(409).json({
        message: "E-mail já cadastrado",
      })
    }

    const code = randomize("0", 6)

    await User.update(user.email, {
      codeToChangeEmail: { code, createdAt: new Date() },
    })
    await sendChangeEmailCode({ name: user.name, email: newEmail, code })

    res.status(200).json({
      message: "Enviamos um código de confirmação para o seu e-mail",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function changeEmail(req, res) {
  try {
    const { currentEmail, newEmail, code } = req.body

    const user = await User.findByEmail(currentEmail)
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    if (user.codeToChangeEmail && user.codeToChangeEmail.code !== code) {
      return res.status(400).json({
        message: "Código inválido",
      })
    }

    await User.updateEmail(user.email, newEmail)

    res.status(200).json({ message: "E-mail alterado" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function changePassword(req, res) {
  try {
    const { userId } = req
    const { currentPassword, newPassword } = req.body

    const user = await User.getById(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Senha atual incorreta" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await User.updateById(userId, { password: hashedPassword })

    res.status(200).json({ message: "Senha alterada" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function removeAccount(req, res) {
  try {
    const { userId } = req
    const cookies = req.cookies

    const user = await User.getById(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    await Post.removeAllPostsFromUser(userId)
    await Comment.removeAllFromUser(userId)
    await Application.removeAllApplicationsFromUser(userId)
    await Like.removeAllLikesFromUser(userId)
    await Message.removeAllMessagesFromUser(userId)
    await Conversation.removeAllConversationsFromUser(userId)
    await User.deleteUser(userId)

    if (cookies && cookies["rf-jwt"]) {
      res.clearCookie("rf-jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
    }

    res.status(200).json({ message: "Conta removida" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function getSuggestions(req, res) {
  try {
    const { userId } = req
    const countUsers = await User.countAllUsers()
    if (countUsers <= 1) {
      return res.status(200).json([])
    }

    const suggestions = await User.listUserNotFollowing({ userId, limit: 5 })

    res.status(200).json(suggestions)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}
