import * as Conversation from "../models/conversation.model.js"

export async function listConversations(req, res) {
  try {
    const { userId } = req
    const { keyword } = req.params

    const conversations = await Conversation.listByUser(userId, keyword)
    const formattedConversations = conversations.map((conversation) => {
      const receiver = conversation.participants.find(
        (participant) => participant._id != userId,
      )
      return {
        conversationId: conversation._id,
        receiver: receiver,
        lastMessage: conversation.messages[0],
      }
    })

    res.status(200).json({ conversations: formattedConversations })
  } catch (error) {
    console.log("Controller - Erro ao buscar conversa:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

export async function getConversationMessages(req, res) {
  try {
    const { conversationId, page = 1, limit = 10 } = req.params

    const conversation = await Conversation.getConversationById(
      conversationId,
      page,
      limit,
    )
    if (!conversation) {
      return res.status(404).json({ message: "Conversa não encontrada" })
    }

    res.status(200).json(conversation)
  } catch (error) {
    console.log("Controller - Erro ao buscar mensagens da conversa:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}
