import * as CommunityModel from "../models/community.model.js"

export async function createCommunity(req, res) {
  try {
    const { userId } = req
    const { name, description, link, platform, professionalArea, skills } =
      req.body

    let formattedLink = link.toLowerCase().replace(/\//g, "")
    formattedLink = formattedLink.replace("https:", "")
    formattedLink = formattedLink.replace("www.", "")
    const communityExists = await CommunityModel.getCommunityByFormattedLink(
      formattedLink,
    )

    if (communityExists) {
      return res.status(400).send({ message: "Comunidade já cadastrada" })
    }

    const community = {
      name,
      author: userId,
      description,
      link,
      formattedLink,
      platform,
      professionalArea,
      skills,
    }

    await CommunityModel.create(community)
    res.status(201).json({ message: "Comunidade criada" })
  } catch (error) {
    console.log("Controller - Erro ao criar comunidade: ", error)
    res.status(500).send({ message: "Erro ao criar comunidade" })
  }
}

export async function editCommunity(req, res) {
  try {
    const { userId } = req
    const {
      communityId,
      name,
      description,
      link,
      platform,
      professionalArea,
      skills,
    } = req.body

    const foundedCommunity = await CommunityModel.getCommunityById(communityId)

    if (!foundedCommunity) {
      return res.status(404).send({ message: "Comunidade não encontrada" })
    }

    if (foundedCommunity.author.toString() !== userId) {
      return res.status(403).send({ message: "Usuário não autorizado" })
    }

    let formattedLink = link.toLowerCase().replace(/\//g, "")
    formattedLink = formattedLink.replace("https:", "")
    formattedLink = formattedLink.replace("www.", "")
    const communityExists = await CommunityModel.getCommunityByFormattedLink(
      formattedLink,
    )

    if (communityExists && communityExists._id.toString() !== communityId) {
      return res.status(400).send({ message: "Comunidade já cadastrada" })
    }

    const community = {
      name,
      description,
      link,
      formattedLink,
      platform,
      professionalArea,
      skills,
    }

    await CommunityModel.update(communityId, community)
    res.status(200).json({ message: "Comunidade editada" })
  } catch (error) {
    console.log("Controller - Erro ao editar comunidade: ", error)
    res.status(500).send({ message: "Erro ao editar comunidade" })
  }
}

export async function listCommunities(req, res) {
  try {
    const { page = 1, limit = 5, filters, keyword = "" } = req.body
    const { communities, totalCommunities } = await CommunityModel.list({
      page,
      limit,
      filters,
      keyword,
    })

    res.status(200).json({ communities, totalCommunities })
  } catch (error) {
    console.log("Controller - Erro ao listar todas as vagas: ", error)
    res.status(500).send({ message: "Erro ao listar todas as vagas" })
  }
}

export async function listCommunitiesByAuthor(req, res) {
  try {
    const { userId } = req
    const { page = 1, limit = 5, filters, keyword = "" } = req.body
    const { communities, totalCommunities } = await CommunityModel.list({
      userId,
      page,
      limit,
      filters,
      keyword,
    })

    res.status(200).json({ communities, totalCommunities })
  } catch (error) {
    console.log("Controller - Erro ao listar todas as vagas: ", error)
    res.status(500).send({ message: "Erro ao listar todas as vagas" })
  }
}

export async function rateCommunity(req, res) {
  try {
    const { userId } = req
    const { rating, communityId } = req.body
    await CommunityModel.updateRating({ userId, rating, communityId })

    res.status(200).json({ message: "Comunidade avaliada" })
  } catch (error) {
    console.log("Controller - Erro ao avaliar comunidade: ", error)
    res.status(500).send({ message: "Erro ao avaliar comunidade" })
  }
}

export async function deleteCommunity(req, res) {
  try {
    const { userId } = req
    const { communityId } = req.params

    const foundedCommunity = await CommunityModel.getCommunityById(communityId)
    if (!foundedCommunity) {
      return res.status(404).send({ message: "Comunidade não encontrada" })
    }

    if (foundedCommunity.author.toString() !== userId) {
      return res.status(403).send({ message: "Usuário não autorizado" })
    }

    await CommunityModel.remove(communityId)

    res.status(200).json({ message: "Comunidade removida" })
  } catch (error) {
    console.log("Controller - Erro ao remover comunidade: ", error)
    res.status(500).send({ message: "Erro ao remover comunidade" })
  }
}
