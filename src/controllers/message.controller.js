import * as Message from "../models/message.model.js"
import * as Conversation from "../models/conversation.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export async function sendMessage(req, res) {
  try {
    const { userId } = req
    const { content, receiverId } = req.body

    const messageBody = { sender: userId, receiver: receiverId, content }
    const newMessage = await Message.create(messageBody)

    let conversationId = null
    const foundedConversation =
      await Conversation.getConversationByParticipants({
        userId,
        receiverId,
      })

    if (foundedConversation) {
      conversationId = foundedConversation._id
      await Conversation.addMessage(foundedConversation._id, newMessage._id)
    } else {
      const conversationBody = {
        participants: [userId, receiverId],
        messages: [newMessage._id],
      }
      const newConversation = await Conversation.create(conversationBody)
      conversationId = newConversation._id
    }

    const receiverSocketId = getReceiverSocketId(receiverId)
    console.log("receiverSocketId", receiverSocketId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage._doc,
        conversationId,
      })
    }

    res.status(201).json({
      message: "Mensagem enviada",
      newMessage: { ...newMessage._doc, conversationId },
    })
  } catch (error) {
    console.log("Controller - Erro ao enviar mensagem:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}
