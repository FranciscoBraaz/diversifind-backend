import * as Post from "../models/post.model.js"
import * as Comment from "../models/comment.model.js"

export async function newComment(req, res) {
  try {
    const { postId, content } = req.body
    const { userId } = req

    const comment = await Comment.createComment({
      post: postId,
      user: userId,
      content,
    })
    await Post.addCommentPost(postId, comment._id)

    res.status(201).json({ comment, message: "Comentário enviado" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export async function getCommentsFromPost(req, res) {
  try {
    const { postId, page = 1 } = req.body
    const { comments, totalPages } = await Comment.getComments(postId, page)

    res.status(200).json({ comments, totalPages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function editComment(req, res) {
  try {
    const { commentId, content } = req.body

    await Comment.updateComment(commentId, content)
    res.status(200).json({ message: "Comentário editado" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export async function removeComment(req, res) {
  try {
    const { commentId, postId } = req.body

    await Comment.deleteComment(commentId)
    await Post.deletePostComment(postId, commentId)

    res.status(200).json({ message: "Comentário removido" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
