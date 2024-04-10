import { Schema, model } from "mongoose"

const skillSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  professionalArea: {
    type: Schema.Types.ObjectId,
    ref: "ProfessionalArea",
  },
})

const Skill = model("Skill", skillSchema)

export async function createSkill(skillName, professionalAreaId) {
  try {
    await Skill.create({
      name: skillName,
      professionalArea: professionalAreaId,
    })
  } catch (error) {
    console.log("DB - Erro ao criar skill: ", error)
    throw new Error(error)
  }
}

export async function createManySkill(skills, professionalAreaId) {
  try {
    const skillList = skills.map((skill) => ({
      name: skill,
      professionalArea: professionalAreaId,
    }))
    await Skill.insertMany(skillList)
  } catch (error) {
    console.log("DB - Erro ao criar skill: ", error)
    throw new Error(error)
  }
}

export async function getByProfessionalArea(professionalAreaId) {
  try {
    const skills = await Skill.find({ professionalArea: professionalAreaId })

    return skills
  } catch (error) {
    console.log("DB - Erro ao listar skill: ", error)
    throw new Error(error)
  }
}
