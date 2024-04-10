// Models
import * as SkillSchema from "../models/skill.model.js"

export async function addSkill(req, res) {
  try {
    const { skillName, professionalAreaId } = req.body
    await SkillSchema.createSkill(skillName, professionalAreaId)
  } catch (error) {
    console.log("DB - Erro ao criar competência: ", error)
    throw new Error(error)
  }
}

export async function addManySkills(req, res) {
  try {
    const { skills, professionalAreaId } = req.body
    await SkillSchema.createManySkill(skills, professionalAreaId)

    res.status(201).json({ message: "Competências criadas com sucesso" })
  } catch (error) {
    console.log("DB - Erro ao criar competência: ", error)
    throw new Error(error)
  }
}

export async function getSkillByProfessinalArea(req, res) {
  try {
    const { professionalAreaId } = req.params
    const skills = await SkillSchema.getByProfessionalArea(professionalAreaId)

    res.status(200).json(skills)
  } catch (error) {
    console.log("DB - Erro ao listar competências: ", error)
    throw new Error(error)
  }
}
