import { Schema, model } from "mongoose"

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      default: null,
    },
    mediaDescription: {
      type: String,
      default: null,
    },
    cloudinaryId: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Post = model("Post", postSchema)

export async function newPost({
  author,
  content,
  media = null,
  mediaDescription = null,
  cloudinaryId = null,
}) {
  try {
    const postCreated = await Post.create({
      author,
      content,
      media,
      mediaDescription,
      cloudinaryId,
    })
    return postCreated.populate("author", ["name", "avatar", "headline"])
  } catch (error) {
    console.log("DB - Erro ao criar postagem:", error)
    throw new Error(error)
  }
}

export async function updatePost(postId, postBody) {
  try {
    const postUpdated = await Post.findOneAndUpdate(
      { _id: postId },
      { $set: postBody },
      { returnDocument: "after" },
    )

    return postUpdated.populate("author", ["name", "avatar"])
  } catch (error) {
    console.log("DB - Erro ao atualizar postagem:", error)
    throw new Error(error)
  }
}

export async function getAllPosts() {
  try {
    const posts = await Post.find().populate("author", ["name", "avatar"])
    // .populate("comments")
    // .populate("likes")

    return posts
  } catch (error) {
    console.log("DB - Erro ao buscar todas as postagens:", error)
    throw new Error(error)
  }
}

export async function getPostById(postId) {
  try {
    const post = await Post.findById(postId).populate("author", [
      "name",
      "avatar",
    ])

    return post
  } catch (error) {
    console.log("DB - Erro ao buscar post:", error)
    throw new Error(error)
  }
}

export async function addLikePost(postId, userId) {
  try {
    await Post.updateOne({ _id: postId }, { $push: { likes: userId } })
  } catch (error) {
    console.log("DB - Erro ao curtir post:", error)
    throw new Error(error)
  }
}

export async function removeLikePost(postId, userId) {
  try {
    await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
  } catch (error) {
    console.log("DB - Erro ao remover post:", error)
    throw new Error(error)
  }
}

export async function addCommentPost(postId, commentId) {
  try {
    await Post.updateOne(
      { _id: postId },
      { $push: { comments: commentId } },
      { returnDocument: "after" },
    )
  } catch (error) {
    console.log("DB - Erro ao adicionar comentário:", error)
    throw new Error(error)
  }
}

export async function deletePostComment(postId, commentId) {
  try {
    await Post.updateOne({ _id: postId }, { $pull: { comments: commentId } })
  } catch (error) {
    console.log("DB - Erro ao remover comentário:", error)
    throw new Error(error)
  }
}

export async function removePost(postId) {
  try {
    await Post.deleteOne({ _id: postId })
  } catch (error) {
    console.log("DB - Erro ao remover postagem:", error)
    throw new Error(error)
  }
}

export async function removeAllPostsFromUser(userId) {
  try {
    await Post.deleteMany({ author: userId })
  } catch (error) {
    console.log("DB - Erro ao remover todas as postagens do usuário:", error)
    throw new Error(error)
  }
}

export async function feedRandom() {
  try {
    const posts = await Post.aggregate([
      { $sample: { size: 25 } },
      {
        $lookup: {
          from: "users", // Nome da coleção de autores
          localField: "author", // Campo na coleção postagens que se refere ao autor
          foreignField: "_id", // Campo na coleção autores que corresponde ao campo localField
          as: "author", // Nome do campo que conterá os dados do autor
        },
      },
      { $unwind: "$author" }, // Desnormaliza o array resultante
    ])
    return posts
  } catch (error) {
    console.error("Erro ao recuperar postagens aleatórias paginadas:", error)
    return null
  }
}
