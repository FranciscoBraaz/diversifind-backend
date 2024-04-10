import { Schema, model } from "mongoose"

const applicationVacancySchema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vacancy: {
      type: Schema.Types.ObjectId,
      ref: "Vacancy",
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const ApplicationVacancy = model("ApplicationVacancy", applicationVacancySchema)

export async function create(applicationVacancy) {
  try {
    const applicationCreated = await ApplicationVacancy.create(
      applicationVacancy,
    )
    return applicationCreated
  } catch (error) {
    console.log("DB - Erro ao criar aplicação:", error)
    throw new Error(error)
  }
}

export async function listByUser({ userId, page = 1, limit = 10 }) {
  try {
    const applications = await ApplicationVacancy.find({
      candidate: userId,
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({ path: "vacancy", populate: { path: "skills" } })

    const totalApplications = await ApplicationVacancy.countDocuments({
      candidate: userId,
    })

    return { applications, totalApplications }
  } catch (error) {
    console.log("DB - Erro ao listar aplicações:", error)
    throw new Error(error)
  }
}

export async function getTotalApplicationsByVacancy(vacancyId) {
  try {
    return await ApplicationVacancy.countDocuments({ vacancy: vacancyId })
  } catch (error) {
    console.log("DB - Erro ao buscar total de aplicações:", error)
    throw new Error(error)
  }
}

export async function deleteApplication(vacancyId) {
  try {
    await ApplicationVacancy.deleteMany({ vacancy: vacancyId })
  } catch (error) {
    console.log("DB - Erro ao deletar aplicação:", error)
    throw new Error(error)
  }
}

export async function removeAllApplicationsFromUser(userId) {
  try {
    await ApplicationVacancy.deleteMany({ candidate: userId })
  } catch (error) {
    console.log("DB - Erro ao remover aplicações:", error)
    throw new Error(error)
  }
}
