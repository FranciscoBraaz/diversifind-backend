import { Schema, model } from "mongoose"

const professionalAreaSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
})

const ProfessionalArea = model("ProfessionalArea", professionalAreaSchema)

export async function createProfessionalArea(professionalAreaName) {
  try {
    await ProfessionalArea.create({ name: professionalAreaName })
  } catch (error) {
    console.log("DB - Erro ao criar área profissional: ", error)
    throw new Error(error)
  }
}

export async function getAll() {
  try {
    const professionalAreas = await ProfessionalArea.find().sort({ name: 1 })

    return professionalAreas
  } catch (error) {
    console.log("DB - Erro ao listar áreas profissionais: ", error)
    throw new Error(error)
  }
}
