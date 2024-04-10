// Models
import * as Vacancy from "../models/vacancy.model.js"
import * as ApplicationVacancy from "../models/applicationVacancy.model.js"
import * as User from "../models/user.model.js"

export async function createVacancy(req, res) {
  try {
    const { userId } = req
    const {
      occupation,
      company,
      description,
      typeLocation,
      stateUf,
      city,
      occupationArea,
      skills,
      employmentType,
      contractType,
      selectiveProcessAccessibility,
      jobAccessibility,
      accommodationAccessibility,
    } = req.body

    if (typeLocation === "onsite" && (!stateUf || !city)) {
      return res.status(400).send({
        message: "Estado e cidade são obrigatórios para vagas presenciais",
      })
    }

    let vacancyBody = {
      author: userId,
      occupation,
      company,
      description,
      typeLocation,
      stateUf,
      city,
      occupationArea,
      skills,
      employmentType,
      contractType,
      selectiveProcessAccessibility,
      jobAccessibility,
      accommodationAccessibility,
    }

    if (typeLocation === "remote") {
      vacancyBody["stateUf"] = null
      vacancyBody["city"] = null
    }

    const vacancyId = await Vacancy.create(vacancyBody)

    res.status(201).json({ message: "Vaga cadastrada", vacancyId })
  } catch (error) {
    console.log("Controller - Erro ao criar vaga: ", error)
    res.status(500).send({ message: "Erro ao criar vaga" })
  }
}

export async function createExternalVacancy(req, res) {
  try {
    const {
      occupation,
      company,
      description,
      externalVacancyLink,
      externalVacancyLocation,
      externalVacancyId,
    } = req.body

    let vacancyBody = {
      occupation,
      company,
      description,
      externalVacancy: true,
      externalVacancyLink,
      externalVacancyLocation,
      externalVacancyId,
      typeLocation: "onsite",
    }

    const vacancyId = await Vacancy.create(vacancyBody)

    res.status(201).json({ message: "Vaga cadastrada", vacancyId })
  } catch (error) {
    console.log("Controller - Erro ao criar vaga externa: ", error)
    res.status(500).send({ message: "Erro ao criar vaga externa" })
  }
}

export async function editVacancy(req, res) {
  try {
    const { userId } = req
    const {
      vacancyId,
      occupation,
      company,
      description,
      typeLocation,
      stateUf,
      city,
      occupationArea,
      skills,
      employmentType,
      contractType,
      selectiveProcessAccessibility,
      jobAccessibility,
      accommodationAccessibility,
    } = req.body

    const foundedVacancy = await Vacancy.getVacancyById(vacancyId)

    if (!foundedVacancy) {
      return res.status(404).send({ message: "Vaga não encontrada" })
    }

    if (typeLocation === "onsite" && (!stateUf || !city)) {
      return res.status(400).send({
        message: "Estado e cidade são obrigatórios para vagas presenciais",
      })
    }

    let vacancyBody = {
      author: userId,
      occupation,
      company,
      description,
      typeLocation,
      stateUf,
      city,
      occupationArea,
      skills,
      employmentType,
      contractType,
      selectiveProcessAccessibility,
      jobAccessibility,
      accommodationAccessibility,
    }

    if (typeLocation === "remote") {
      vacancyBody["stateUf"] = null
      vacancyBody["city"] = null
    }

    await Vacancy.edit(vacancyId, vacancyBody)

    res.status(201).json({ message: "Vaga editada com sucesso" })
  } catch (error) {
    console.log("Controller - Erro ao criar vaga: ", error)
    res.status(500).send({ message: "Erro ao criar vaga" })
  }
}

export async function listVacancies(req, res) {
  try {
    const { page = 1, filters, keyword = "" } = req.body
    const vacancies = await Vacancy.listAll({ page, filters, keyword })

    res.status(200).json(vacancies)
  } catch (error) {
    console.log("Controller - Erro ao listar todas as vagas: ", error)
    res.status(500).send({ message: "Erro ao listar todas as vagas" })
  }
}

export async function listVacanciesByAuthor(req, res) {
  try {
    const { userId } = req
    const { page = 1, limit = 20, filters = {}, keyword = "" } = req.body
    const vacancies = await Vacancy.listAll({
      userId,
      page,
      limit,
      filters,
      keyword,
    })

    res.status(200).json(vacancies)
  } catch (error) {
    console.log("Controller - Erro ao listar todas as vagas: ", error)
    res.status(500).send({ message: "Erro ao listar todas as vagas" })
  }
}

export async function getVacancyInfo(req, res) {
  try {
    const { vacancyId } = req.params
    const vacancy = await Vacancy.getVacancyById(vacancyId)

    if (!vacancy) {
      return res.status(404).send({ message: "Vaga não encontrada" })
    }

    res.status(200).json(vacancy)
  } catch (error) {
    console.log("Controller - Erro ao buscar vaga: ", error)
    res.status(500).send({ message: "Erro ao buscar vaga" })
  }
}

export async function applyVacancy(req, res) {
  try {
    const { userId } = req
    const { vacancyId, contactEmail } = req.body

    const foundedVacancy = await Vacancy.getVacancyById(vacancyId)

    if (!foundedVacancy) {
      return res.status(404).send({ message: "Vaga não encontrada" })
    }

    const foundedUser = await User.getById(userId)

    if (!foundedUser) {
      return res.status(404).send({ message: "Usuário não encontrado" })
    }

    const application = await ApplicationVacancy.create({
      candidate: userId,
      vacancy: vacancyId,
      contactEmail,
    })

    await Vacancy.addApplicationToVacancy(vacancyId, application._id)

    res.status(201).json({ message: "Candidatura enviada" })
  } catch (error) {
    console.log("Controller - Erro aplicar para a vaga: ", error)
    res.status(500).send({ message: "Erro aplicar para a vaga" })
  }
}

export async function getVacancyCandidates(req, res) {
  try {
    const { page = 1, vacancyId } = req.body
    const vacancy = await Vacancy.getVacancyById(vacancyId)

    if (!vacancy) {
      return res.status(404).send({ message: "Vaga não encontrada" })
    }

    const { applications, totalApplications } =
      await Vacancy.listCandidatesByVacancy(vacancyId, page)

    res.status(200).json({ applications, totalApplications })
  } catch (error) {
    console.log("Controller - Erro ao buscar candidatos da vaga: ", error)
    res.status(500).send({ message: "Erro ao buscar candidatos da vaga" })
  }
}

export async function deleteVacancy(req, res) {
  try {
    const { vacancyId } = req.params

    const foundedVacancy = await Vacancy.getVacancyById(vacancyId)

    if (!foundedVacancy) {
      return res.status(404).send({ message: "Vaga não encontrada" })
    }

    await ApplicationVacancy.deleteApplication(vacancyId)

    await Vacancy.removeVacancy(vacancyId)

    res.status(200).json({ message: "Vaga deletada com sucesso" })
  } catch (error) {
    console.log("Controller - Erro ao buscar aplicações do usuário: ", error)
    res.status(500).send({ message: "Erro ao buscar aplicações do usuário" })
  }
}

export async function listApplicationsByUser(req, res) {
  try {
    const { userId } = req
    const { page = 1, keyword = "" } = req.body
    const { applications, totalApplications } =
      await ApplicationVacancy.listByUser({
        userId,
        page,
        keyword,
      })

    res.status(200).json({ applications, totalApplications })
  } catch (error) {
    console.log("Controller - Erro ao buscar aplicações do usuário: ", error)
    res.status(500).send({ message: "Erro ao buscar aplicações do usuário" })
  }
}

export async function getExternalVacancyById(req, res) {
  try {
    const { id } = req.params
    const vacancy = await Vacancy.getExternalVacancy(id)

    if (!vacancy) {
      return res.status(200).json({ vacancyAlreadyExist: false })
    }

    res.status(200).json({ vacancyAlreadyExist: true })
  } catch (error) {
    console.log("Controller - Erro ao buscar vaga externa: ", error)
    res.status(500).send({ message: "Erro ao buscar vaga externa" })
  }
}

export async function removeExternalVacancies(req, res) {
  try {
    await Vacancy.removeManyVacancies()

    res.status(200).json({ message: "Vagas externas deletadas com sucesso" })
  } catch (error) {
    console.log("Controller - Erro ao deletar vagas externas: ", error)
    res.status(500).send({ message: "Erro ao deletar vagas externas" })
  }
}
