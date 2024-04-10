import { Schema, model } from "mongoose"

const likeSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Like = model("Like", likeSchema)

export async function newLike(post, user) {
  try {
    const likeCreated = await Like.create({ post, user })
    return likeCreated
  } catch (error) {
    console.log("DB - Erro ao criar like:", error)
    throw new Error(error)
  }
}

export async function removeLike(postId, userId) {
  try {
    await Like.findOneAndDelete({ post: postId, user: userId })
  } catch (error) {
    console.log("DB - Erro ao remover like:", error)
    throw new Error(error)
  }
}

export async function removeManyLikes(postId) {
  try {
    await Like.deleteMany({ post: postId })
  } catch (error) {
    console.log("DB - Erro ao remover likes:", error)
    throw new Error(error)
  }
}

export async function removeAllLikesFromUser(userId) {
  try {
    await Like.deleteMany({ user: userId })
  } catch (error) {
    console.log("DB - Erro ao remover likes:", error)
    throw new Error(error)
  }
}
