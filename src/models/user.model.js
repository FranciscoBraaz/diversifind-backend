import mongoose, { Schema, model } from "mongoose"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarCloudinaryId: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    headline: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    profileType: {
      type: String,
      required: true,
      enum: ["person", "company"],
    },
    city: {
      type: String,
    },
    stateUf: {
      type: String,
    },
    occupationArea: {
      type: String,
    },
    companyType: {
      type: String,
    },
    website: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    feed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    about: {
      type: String,
      default: null,
    },
    experience: [
      {
        occupation: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        startDateMonth: {
          type: String,
          required: true,
        },
        startDateYear: {
          type: String,
          required: true,
        },
        endDateMonth: {
          type: String,
          default: null,
        },
        endDateYear: {
          type: String,
          default: null,
        },
        current: {
          type: Boolean,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: [
            "Tempo integral",
            "Meio período",
            "Autônomo",
            "Estágio",
            "Freelancer",
            "Trainee",
            "Aprendiz",
            "Voluntário",
            "Terceirizado",
          ],
        },
        description: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    academicEducation: [
      {
        name: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
          enum: [
            "Ensino fundamental",
            "Ensino médio",
            "Técnico",
            "Tecnólogo",
            "Graduação",
            "Pós-graduação",
            "Mestrado",
            "Doutorado",
            "Pós-doutorado",
          ],
        },
        startDateMonth: {
          type: String,
          required: true,
        },
        startDateYear: {
          type: String,
          required: true,
        },
        endDateMonth: {
          type: String,
          default: null,
        },
        endDateYear: {
          type: String,
          default: null,
        },
      },
    ],
    certificates: [
      {
        name: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        issueMonth: {
          type: String,
          required: true,
        },
        issueYear: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
    emailToken: {
      type: String,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
      select: false,
    },
    codeToChangeEmail: {
      type: { code: String, createdAt: Date },
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const User = model("User", userSchema)

export async function listAll(userId) {
  try {
    const users = await User.find({ _id: { $ne: userId } })
      .limit(5)
      .select(["name", "avatar", "headline"])

    return users
  } catch (error) {
    console.log("DB - Erro ao listar todos os usuários: ", error)
    throw new Error(error)
  }
}

export async function getById(id) {
  try {
    const user = await User.findById(id).select("+password")
    return user
  } catch (error) {
    console.log("DB - Erro ao buscar usuário por ID: ", error)
    throw new Error(error)
  }
}

export async function getByEmail(email) {
  try {
    const user = await User.findOne({ email })
    return user
  } catch (error) {
    console.log("DB - Erro ao buscar usuário por ID: ", error)
    throw new Error(error)
  }
}

export async function findByEmail(email) {
  try {
    const user = User.findOne({ email })
      .select("+password")
      .select("+emailToken")
      .select("+forgotPasswordToken")

    return user
  } catch (error) {
    console.log("DB - Erro ao buscar usuário por email: ", error)
    throw new Error(error)
  }
}

export async function findByRefreshToken(refreshToken) {
  try {
    const user = User.findOne({ refreshToken }).select("+refreshToken")

    return user
  } catch (error) {
    console.log("DB - Erro ao buscar usuário por refreshToken: ", error)
  }
}

export async function create(userData) {
  try {
    await User.create(userData)
  } catch (error) {
    console.log("DB - Erro ao criar usuário: ", error)
    throw new Error(error)
  }
}

export async function update(email, userData) {
  try {
    await User.updateOne({ email }, userData)
  } catch (error) {
    console.log("DB - Erro ao atualizar usuário: ", error)
    throw new Error(error)
  }
}

export async function updateById(userId, data) {
  try {
    const user = await User.findOneAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
    })
    return user
  } catch (error) {
    console.log("DB - Erro ao atualizar usuário: ", error)
    throw new Error(error)
  }
}

export async function updateExperience(userId, experienceData) {
  try {
    await User.updateOne({ _id: userId }, { experience: experienceData })
  } catch (error) {
    console.log("DB - Erro ao adicionar experiência: ", error)
    throw new Error(error)
  }
}

export async function updateAcademicEducation(userId, academicEducationData) {
  try {
    await User.updateOne(
      { _id: userId },
      { academicEducation: academicEducationData },
    )
  } catch (error) {
    console.log("DB - Erro ao adicionar formação acadêmica: ", error)
    throw new Error(error)
  }
}

export async function updateCertificates(userId, certificatesData) {
  try {
    await User.updateOne({ _id: userId }, { certificates: certificatesData })
  } catch (error) {
    console.log("DB - Erro ao adicionar formação acadêmica: ", error)
    throw new Error(error)
  }
}

export async function getFollowers(userId) {
  try {
    const user = await User.findOne({ _id: userId }).populate("followers")

    return user.followers
  } catch (error) {
    console.log("DB - Erro ao buscar seguidores: ", error)
    throw new Error(error)
  }
}

export async function addNewFollowing(userId, followingId) {
  try {
    await User.updateOne({ _id: userId }, { $push: { following: followingId } })
  } catch (error) {
    console.log("DB - Erro ao adicionar usuário na lista de seguindo: ", error)
    throw new Error(error)
  }
}

export async function addNewFollower(userId, followerId) {
  try {
    await User.updateOne({ _id: userId }, { $push: { followers: followerId } })
  } catch (error) {
    console.log(
      "DB - Erro ao adicionar usuário na lista de seguidores: ",
      error,
    )
    throw new Error(error)
  }
}

export async function removeFollower(userId, followerId) {
  try {
    await User.updateOne({ _id: userId }, { $pull: { following: followerId } })
    await User.updateOne({ _id: followerId }, { $pull: { followers: userId } })
  } catch (error) {
    console.log(
      "DB - Erro ao adicionar usuário na lista de seguidores: ",
      error,
    )
    throw new Error(error)
  }
}

export async function addInFeed(users, postId) {
  try {
    await User.updateMany({ _id: { $in: users } }, { $push: { feed: postId } })
  } catch (error) {
    console.log("DB - Erro ao adicionar postagem no feed: ", error)
    throw new Error(error)
  }
}

export async function getFeedPosts(userId, page) {
  try {
    const itemsPerPage = 25
    const feedData = await User.findOne({ _id: userId })
      .select({ feed: 1 })
      .lean()
      .populate({
        path: "feed",
        options: {
          sort: {
            createdAt: -1,
          },
          skip: (page - 1) * itemsPerPage,
          limit: itemsPerPage,
        },
        populate: {
          path: "author",
          select: ["name", "avatar", "headline"],
          model: "User",
        },
      })

    const totalItems = await User.findOne({ _id: userId }).select({
      feed: 1,
    })
    const totalPages = Math.ceil(totalItems.feed.length / itemsPerPage)

    return { posts: feedData.feed, total: totalPages }
  } catch (error) {
    console.log("DB - Erro ao buscar todas as postagens:", error)
    throw new Error(error)
  }
}

export async function removeFromFeed(userId, postId) {
  try {
    await User.updateOne({ _id: userId }, { $pull: { feed: postId } })
  } catch (error) {
    console.log("DB - Erro ao remover postagem do feed: ", error)
    throw new Error(error)
  }
}

export async function listAllFollowing({ userId, page, limit, keyword }) {
  try {
    let queryObject = {}

    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }
    const userFounded = await getById(userId)

    const following = await User.find(
      {
        ...queryObject,
        _id: { $in: userFounded.following },
      },
      { name: 1, avatar: 1, headline: 1, followers: 1, following: 1 },
    )
      .skip((page - 1) * limit)
      .limit(limit)

    const usersBody = following.map((user) => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      headline: user.headline,
      followers: user.followers.length,
      following: user.following.length,
    }))

    return {
      users: usersBody,
      total: userFounded.following.length,
    }
  } catch (error) {
    console.log("DB - Erro ao listar todos os usuários seguidos: ", error)
    throw new Error(error)
  }
}

export async function listAllFollowers({
  userId,
  page = 1,
  limit = 10,
  keyword,
}) {
  try {
    let queryObject = {}

    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }

    const userFounded = await getById(userId)

    const followers = await User.find(
      {
        ...queryObject,
        _id: { $in: userFounded.followers },
      },
      { name: 1, avatar: 1, headline: 1, followers: 1, following: 1 },
    )
      .skip((page - 1) * limit)
      .limit(limit)

    const usersBody = followers.map((user) => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      headline: user.headline,
      followers: user.followers.length,
      following: user.following.length,
    }))

    return {
      users: usersBody,
      total: userFounded.followers.length,
    }
  } catch (error) {
    console.log("DB - Erro ao listar todos os usuários seguidos: ", error)
    throw new Error(error)
  }
}

export async function listAllSuggestions({ userId, limit, keyword }) {
  try {
    let queryObject = {}

    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }

    const userFounded = await getById(userId)
    const userFoundedHeadline = userFounded.headline

    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: [userId, ...userFounded.following] },
          ...queryObject,
        },
      },
      {
        $addFields: {
          distancia: {
            $function: {
              body: function (userHeadline, userFoundedHeadline) {
                const levenshteinDistance = (s, t) => {
                  if (!t) return Infinity
                  if (!s) return Infinity
                  if (!s.length) return t.length
                  if (!t.length) return s.length
                  const arr = []
                  for (let i = 0; i <= t.length; i++) {
                    arr[i] = [i]
                    for (let j = 1; j <= s.length; j++) {
                      arr[i][j] =
                        i === 0
                          ? j
                          : Math.min(
                              arr[i - 1][j] + 1,
                              arr[i][j - 1] + 1,
                              arr[i - 1][j - 1] +
                                (s[j - 1] === t[i - 1] ? 0 : 1),
                            )
                    }
                  }
                  return arr[t.length][s.length]
                }

                const result = levenshteinDistance(
                  userFoundedHeadline,
                  userHeadline,
                )

                return result
              },
              args: ["$headline", userFoundedHeadline],
              lang: "js",
            },
          },
        },
      },
      { $sort: { distancia: 1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          avatar: 1,
          headline: 1,
          following: 1,
          followers: 1,
          distancia: 1,
        },
      },
    ])

    let suggestionsBody = []
    suggestions.forEach((suggestion) => {
      if (suggestion._id.toString() !== userId) {
        const userBody = {
          _id: suggestion._id,
          name: suggestion.name,
          avatar: suggestion.avatar,
          headline: suggestion.headline,
          followers: suggestion.followers.length,
          following: suggestion.following.length,
        }
        suggestionsBody.push(userBody)
      }
    })

    const total = await User.aggregate([
      {
        $match: {
          $and: [
            { _id: { $nin: [userId, ...userFounded.following] } },
            queryObject,
          ],
        },
      },
      { $count: "total" },
    ])

    return {
      users: suggestionsBody,
      total: total,
    }
  } catch (error) {
    console.log("DB - Erro ao listar sugestões de usuários: ", error)
    throw new Error(error)
  }
}

export async function listAllUsers({ userId, page, limit, keyword }) {
  try {
    let queryObject = { _id: { $ne: userId } }

    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }

    const users = await User.find(queryObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .select(["name", "avatar", "headline", "followers", "following"])

    const usersBody = users.map((user) => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      headline: user.headline,
      followers: user.followers.length,
      following: user.following.length,
    }))
    const total = await User.countDocuments(queryObject)

    return { users: usersBody, total }
  } catch (error) {
    console.log("DB - Erro ao listar todos os usuários: ", error)
    throw new Error(error)
  }
}

export async function listUserNotFollowing({ userId, limit = 5, keyword }) {
  try {
    const user = await User.findById(userId)

    let queryObject = { _id: { $ne: userId, $nin: user.following } }
    if (keyword) {
      queryObject = {
        ...queryObject,
        name: { $regex: keyword, $options: "i" },
      }
    }

    const users = await User.find(queryObject)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(["name", "avatar", "headline", "followers", "following"])

    const usersBody = users.map((user) => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      headline: user.headline,
      followers: user.followers.length,
      following: user.following.length,
    }))

    const total = await User.countDocuments(queryObject)

    return { users: usersBody, total }
  } catch (error) {
    console.log("DB - Erro ao buscar usuário por ID: ", error)
    throw new Error(error)
  }
}

export async function updateEmail(currentEmail, newEmail) {
  try {
    await User.updateOne(
      { email: currentEmail },
      { email: newEmail, codeToChangeEmail: null },
    )
  } catch (error) {
    console.log("DB - Erro ao atualizar email: ", error)
    throw new Error(error)
  }
}

export async function deleteUser(id) {
  try {
    await User.deleteOne({ _id: id })
  } catch (error) {
    console.log("DB - Erro ao excluir usuário: ", error)
    throw new Error(error)
  }
}

export async function getSuggestions(userId) {
  try {
    const suggestions = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } }, // Exclui o próprio usuário
      { $sample: { size: 5 } }, // Seleciona aleatoriamente 5 usuários
      {
        $match: {
          followers: { $not: { $in: [new mongoose.Types.ObjectId(userId)] } }, // Exclui usuários que o usuário já segue
        },
      },
    ])

    return suggestions
  } catch (error) {
    console.log("DB - Erro ao buscar sugestões de usuários: ", error)
    throw new Error(error)
  }
}

export async function countAllUsers() {
  try {
    return await User.countDocuments()
  } catch (error) {
    console.log("DB - Erro ao buscar quantidade de usuários: ", error)
    throw new Error(error)
  }
}
