import { Schema, model } from "mongoose"

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
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

const Comment = model("Comment", commentSchema)

export async function createComment({ post, user, content }) {
  try {
    const commentCreated = await Comment.create({ post, user, content })
    return commentCreated
  } catch (error) {
    console.log("DB - Erro ao criar like:", error)
    throw new Error(error)
  }
}

export async function getComments(postId, page) {
  try {
    const itemsPerPage = 5
    const comments = await Comment.find({ post: postId })
      .lean()
      .populate("user", ["name", "avatar", "headline"])
      .sort({ createdAt: -1 })
      .limit(itemsPerPage)
      .skip((page - 1) * itemsPerPage)

    const totalComments = await Comment.countDocuments({ post: postId })
    const totalPages = Math.ceil(totalComments / itemsPerPage)

    return { comments, totalPages }
  } catch (error) {
    console.log("DB - Erro ao buscar comentários:", error)
    throw new Error(error)
  }
}

export async function updateComment(commentId, content) {
  try {
    await Comment.updateOne({ _id: commentId }, { content })
  } catch (error) {
    console.log("DB - Erro ao editar comentário:", error)
    throw new Error(error)
  }
}

export async function deleteComment(commentId) {
  try {
    await Comment.findOneAndDelete({ _id: commentId })
  } catch (error) {
    console.log("DB - Erro ao deletar comentário:", error)
    throw new Error(error)
  }
}

export async function removeManyComments(postId) {
  try {
    await Comment.deleteMany({ post: postId })
  } catch (error) {
    console.log("DB - Erro ao deletar comentários:", error)
    throw new Error(error)
  }
}

export async function removeAllFromUser(userId) {
  try {
    await Comment.deleteMany({ user: userId })
  } catch (error) {
    console.log("DB - Erro ao deletar comentários:", error)
    throw new Error(error)
  }
}
