import { unlink } from "fs/promises"

// Models
import * as Post from "../models/post.model.js"
import * as User from "../models/user.model.js"
import * as Comment from "../models/comment.model.js"
import * as Like from "../models/like.model.js"

// Midlewares
import cloudinary from "../middlewares/cloudinary.js"

export async function createPost(req, res) {
  try {
    const { content, mediaDescription } = req.body
    const file = req.file
    const { userId } = req

    let postBody = { content, author: userId }
    if (file) {
      const result = await cloudinary.uploader.upload(file.path)
      postBody["media"] = result.secure_url
      postBody["cloudinaryId"] = result.public_id
      postBody["mediaDescription"] = mediaDescription
    }

    const post = await Post.newPost(postBody)
    const userFollowers = await User.getFollowers(userId)

    await User.addInFeed(userFollowers, post._id)
    await User.addInFeed(userId, post._id)

    if (file) {
      await unlink(file.path)
    }

    res.status(201).json({ post, message: "Postagem criada com sucesso" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao criar publicação" })
  }
}

export async function editPost(req, res) {
  try {
    const { content, mediaDescription, postId, mediaRemoved = false } = req.body
    const file = req.file

    const foundedPost = await Post.getPostById(postId)

    let postBody = { content }

    if (foundedPost.cloudinaryId && (file || mediaRemoved)) {
      await cloudinary.uploader.destroy(foundedPost.cloudinaryId)
    }

    if (file) {
      const result = await cloudinary.uploader.upload(file.path)
      postBody["media"] = result.secure_url
      postBody["cloudinaryId"] = result.public_id
      postBody["mediaDescription"] = mediaDescription
    }

    if (mediaRemoved && foundedPost.cloudinaryId) {
      postBody["media"] = null
      postBody["cloudinaryId"] = null
      postBody["mediaDescription"] = null
    }

    const post = await Post.updatePost(postId, postBody)

    if (file) {
      await unlink(file.path)
    }

    res.status(200).json({ post, message: "Alterações salvas" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export async function getFeed(req, res) {
  try {
    const { userId } = req
    const { page = 1 } = req.query
    const { posts, total } = await User.getFeedPosts(userId, page)

    if (posts.length === 0) {
      const postsRandom = await Post.feedRandom()
      return res
        .status(200)
        .json({ posts: postsRandom, total: 1, isRandom: true })
    }
    res.status(200).json({ posts, total, isRandom: false })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export async function getPost(req, res) {
  try {
    const { postId } = req.query
    const post = await Post.getPostById(postId)

    res.status(200).json({ post })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function deletePost(req, res) {
  try {
    const { postId } = req.query
    const { userId } = req

    const post = await Post.getPostById(postId)

    if (post.author._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para deletar essa postagem" })
    }

    if (post.cloudinaryId) {
      await cloudinary.uploader.destroy(post.cloudinaryId)
    }

    await Post.removePost(postId)
    await User.removeFromFeed(userId, postId)
    await Comment.removeManyComments(postId)
    await Like.removeManyLikes(postId)

    res.status(200).json({ message: "Postagem deletada com sucesso" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
