// Models
import * as ProfessionalAreaSchema from "../models/professionalArea.model.js"

export async function addProfessionalArea(req, res) {
  try {
    const { name } = req.body
    await ProfessionalAreaSchema.createProfessionalArea(name)
    res.status(201).json({ message: "Área profissional criada com sucesso" })
  } catch (error) {
    console.log("DB - Erro ao criar área profissional: ", error)
    throw new Error(error)
  }
}

export async function listProfessionalAreas(req, res) {
  try {
    const professionalAreas = await ProfessionalAreaSchema.getAll()

    res.status(200).json(professionalAreas)
  } catch (error) {
    console.log("DB - Erro ao listar áreas profissionais: ", error)
    throw new Error(error)
  }
}
