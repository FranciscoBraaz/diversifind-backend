import _ from "lodash"
import { Schema, model } from "mongoose"

import * as ApplicationVacancy from "./applicationVacancy.model.js"

const vacancySchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    occupation: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    typeLocation: {
      type: String,
      required: true,
      enum: ["remote", "onsite", "hybrid"],
    },
    externalVacancy: {
      type: Boolean,
      default: false,
    },
    externalVacancyLink: {
      type: String,
      default: null,
    },
    externalVacancyLocation: {
      type: String,
      default: null,
    },
    externalVacancyId: {
      type: String,
      default: null,
    },
    stateUf: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    employmentType: {
      type: String,
      required: false,
      enum: [
        "fullTime",
        "partTime",
        "autonomous",
        "internship",
        "freelancer",
        "trainee",
        "temporary",
        "apprentice",
        "volunteer",
        "outsourced",
      ],
    },
    contractType: {
      type: String,
      required: false,
      enum: ["clt", "pj", "internship", "other"],
    },
    selectiveProcessAccessibility: [
      {
        type: String,
        required: false,
      },
    ],
    jobAccessibility: [
      {
        type: String,
        required: false,
      },
    ],
    accommodationAccessibility: [
      {
        type: String,
        required: false,
      },
    ],
    occupationArea: {
      type: Schema.Types.ObjectId,
      ref: "ProfessionalArea",
      required: false,
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        required: false,
      },
    ],
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "ApplicationVacancy",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const VacancyModel = model("Vacancy", vacancySchema)

export async function create(vacancy) {
  try {
    const newVacancy = await VacancyModel.create(vacancy)
    return newVacancy._id
  } catch (error) {
    console.error("DB - Erro ao criar uma nova vaga: ", error)
    throw new Error(error)
  }
}

export async function edit(vacancyId, vacancy) {
  try {
    await VacancyModel.updateOne({ _id: vacancyId }, vacancy)
  } catch (error) {
    console.error("DB - Erro ao criar uma nova vaga: ", error)
    throw new Error(error)
  }
}

export async function listAll({
  userId,
  page = 1,
  limit = 20,
  filters,
  keyword,
}) {
  const itemsPerPage = limit
  let queryObject = {}
  if (!_.isEmpty(filters)) {
    if (filters.typeLocation && filters.typeLocation.length > 0) {
      queryObject.typeLocation = { $in: filters.typeLocation }
    }

    if (filters.contractType && filters.contractType.length > 0) {
      queryObject.contractType = { $in: filters.contractType }
    }

    if (filters.employmentType) {
      queryObject.employmentType = filters.employmentType
    }

    if (filters.occupationArea) {
      queryObject.occupationArea = filters.occupationArea
    }
  }

  if (keyword) {
    queryObject = {
      ...queryObject,
      $or: [
        { occupation: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ],
    }
  }

  if (userId) {
    queryObject.author = userId
  }

  try {
    const vacancies = await VacancyModel.find(queryObject)
      .select({
        author: 1,
        occupation: 1,
        company: 1,
        description: 1,
        typeLocation: 1,
        stateUf: 1,
        city: 1,
        contractType: 1,
        occupationArea: 1,
        employmentType: 1,
        skills: 1,
        active: 1,
        externalVacancy: 1,
        externalVacancyLink: 1,
        externalVacancyLocation: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate("skills")
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    const totalVacancies = await VacancyModel.countDocuments(queryObject)

    return { vacancies, totalVacancies }
  } catch (error) {
    console.error("DB - Erro ao listar todos as vagas: ")
    throw new Error(error)
  }
}

export async function getVacancyById(id) {
  try {
    const vacancy = await VacancyModel.findById(id)
      .populate("author")
      .populate("skills")
      .populate("occupationArea")
      .populate("applications")

    return vacancy
  } catch (error) {
    console.error("DB - Erro ao buscar vaga por id: ", error)
    throw new Error(error)
  }
}

export async function addApplicationToVacancy(vacancyId, applicationId) {
  try {
    await VacancyModel.updateOne(
      { _id: vacancyId },
      { $push: { applications: applicationId } },
    )
  } catch (error) {
    console.error("DB - Erro ao adicionar aplicação a vaga: ", error)
    throw new Error(error)
  }
}

export async function listCandidatesByVacancy(vacancyId, page = 1) {
  const itemsPerPage = 2
  try {
    const vacancy = await VacancyModel.findById(vacancyId).populate({
      path: "applications",
      options: {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      },
      populate: {
        path: "candidate",
        select: [
          "name",
          "avatar",
          "headline",
          "resumeUrl",
          "about",
          "stateUf",
          "city",
        ],
      },
    })

    const totalApplications =
      await ApplicationVacancy.getTotalApplicationsByVacancy(vacancyId)

    return {
      applications: vacancy.applications,
      totalApplications,
    }
  } catch (error) {
    console.error("DB - Erro ao listar candidatos por vaga: ", error)
    throw new Error(error)
  }
}

export async function removeVacancy(vacancyId) {
  try {
    await VacancyModel.deleteOne({ _id: vacancyId })
  } catch (error) {
    console.error("DB - Erro ao deletar vaga: ", error)
    throw new Error(error)
  }
}

export async function removeManyVacancies() {
  try {
    await VacancyModel.deleteMany({ externalVacancy: true })
  } catch (error) {
    console.error("DB - Erro ao deletar todas as vagas: ", error)
    throw new Error(error)
  }
}

export async function getExternalVacancy(externalVacancyId) {
  try {
    const vacancy = await VacancyModel.findOne({
      externalVacancyId,
    })

    return vacancy
  } catch (error) {
    console.error("DB - Erro ao buscar vaga externa por id: ", error)
    throw new Error(error)
  }
}
