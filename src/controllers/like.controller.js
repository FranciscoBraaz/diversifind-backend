import * as Like from "../models/like.model.js"
import * as Post from "../models/post.model.js"

export async function likePost(req, res) {
  try {
    const { postId } = req.body
    const { userId } = req

    const like = await Like.newLike(postId, userId)
    await Post.addLikePost(postId, userId)

    res.status(201).json({ like, message: "Post curtido" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export async function unlikePost(req, res) {
  try {
    const { postId } = req.body
    const { userId } = req

    await Like.removeLike(postId, userId)
    await Post.removeLikePost(postId, userId)
    res.status(200).json({ message: "Post descurtido" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
