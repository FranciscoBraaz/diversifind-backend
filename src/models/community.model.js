import _ from "lodash"
import { Schema, model } from "mongoose"

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    formattedLink: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "whatsapp",
        "telegram",
        "discord",
        "facebook",
        "linkedin",
        "reddit",
        "others",
      ],
    },
    ratedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    professionalArea: {
      type: Schema.Types.ObjectId,
      ref: "ProfessionalArea",
      required: true,
    },
    skills: {
      type: [Schema.Types.ObjectId],
      ref: "Skill",
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

const CommunityModel = model("Community", communitySchema)

export function create(community) {
  try {
    return CommunityModel.create(community)
  } catch (error) {
    console.log("DB - Erro ao criar uma nova comunidade: ", error)
    throw new Error(error)
  }
}

export async function list({
  userId,
  page = 1,
  limit = 10,
  filters = {},
  keyword,
}) {
  try {
    let queryObject = {}
    let sortQuery = { createdAt: -1 }

    if (!_.isEmpty(filters)) {
      if (filters.professionalArea) {
        queryObject.professionalArea = filters.professionalArea
      }

      if (filters.skills && filters.skills.length > 0) {
        queryObject.skills = { $in: filters.skills }
      }

      if (filters.platforms && filters.platforms.length > 0) {
        queryObject.platform = { $in: filters.platforms }
      }

      if (filters.sortType === "relevance") {
        sortQuery = { rating: -1 }
      }
    }

    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }

    if (userId) {
      queryObject.author = userId
    }

    const communities = await CommunityModel.find(queryObject)
      .populate("professionalArea", "name")
      .populate("skills", "name")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortQuery)

    const totalCommunities = await CommunityModel.countDocuments(queryObject)

    return { communities, totalCommunities }
  } catch (error) {
    console.log("DB - Erro ao buscar comunidades: ", error)
    throw new Error(error)
  }
}

export async function getCommunityById(communityId) {
  try {
    return await CommunityModel.findById(communityId)
  } catch (error) {
    console.log("DB - Erro ao buscar comunidade por id: ", error)
    throw new Error(error)
  }
}

export async function getCommunityByFormattedLink(formattedLink) {
  try {
    return await CommunityModel.findOne({ formattedLink })
  } catch (error) {
    console.log("DB - Erro ao buscar comunidade por id: ", error)
    throw new Error(error)
  }
}

export async function update(communityId, community) {
  try {
    await CommunityModel.updateOne({ _id: communityId }, community)
  } catch (error) {
    console.log("DB - Erro ao buscar comunidade por id: ", error)
    throw new Error(error)
  }
}

export async function updateRating({ userId, communityId, rating }) {
  try {
    await CommunityModel.updateOne(
      { _id: communityId },
      { $inc: { rating, totalRatings: 1 }, $push: { ratedUsers: userId } },
    )
  } catch (error) {
    console.log("DB - Erro ao buscar comunidade por id: ", error)
    throw new Error(error)
  }
}

export async function remove(communityId) {
  try {
    await CommunityModel.deleteOne({ _id: communityId })
  } catch (error) {
    console.log("DB - Erro ao buscar comunidade por id: ", error)
    throw new Error(error)
  }
}
