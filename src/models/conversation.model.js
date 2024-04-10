import { Schema, model } from "mongoose"

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
)

const ConversationModel = model("Conversation", conversationSchema)

export async function create(conversationBody) {
  try {
    const newConversation = await ConversationModel.create(conversationBody)
    return newConversation
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConversationByParticipants({
  userId,
  receiverId,
  withPopulate = false,
}) {
  try {
    let conversation = null
    if (withPopulate) {
      conversation = await ConversationModel.findOne({
        participants: {
          $all: [userId, receiverId],
          $size: 2,
        },
      }).populate("messages")
    } else {
      conversation = await ConversationModel.findOne({
        participants: {
          $all: [userId, receiverId],
          $size: 2,
        },
      })
    }

    return conversation
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConversationById(
  conversationId,
  page = 1,
  limit = 10,
) {
  try {
    const conversation = await ConversationModel.findById(conversationId)

    const totalPages = Math.ceil(conversation.messages.length / limit)

    await conversation.populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit, skip: (page - 1) * limit },
      populate: [
        { path: "sender", select: "name avatar" },
        { path: "receiver", select: "name avatar" },
      ],
    })

    const conversationBody = {
      messages: conversation.messages,
      totalPages,
    }
    return conversationBody
  } catch (error) {
    throw new Error(error)
  }
}

export async function addMessage(conversationId, messageId) {
  try {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      $push: { messages: messageId },
    })
  } catch (error) {
    throw new Error(error)
  }
}

export async function listByUser(userId, keyword) {
  try {
    const conversations = await ConversationModel.find({
      participants: { $in: [userId] },
    }).populate([
      {
        path: "participants",
        select: "name avatar headline",
      },
      {
        path: "messages",
        options: { perDocumentLimit: 1, sort: { createdAt: -1 } },
        select: "content sender createdAt",
      },
    ])

    let filteredConversations = null
    if (keyword) {
      filteredConversations = conversations.filter((conversation) => {
        const filteredParticipants = conversation.participants.filter(
          (participant) =>
            participant._id !== userId &&
            participant.name.toLowerCase().includes(keyword.toLowerCase()),
        )

        return filteredParticipants.length > 0
      })
    } else {
      filteredConversations = conversations
    }

    return filteredConversations
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeAllConversationsFromUser(userId) {
  try {
    await ConversationModel.deleteMany({ participants: { $in: [userId] } })
  } catch (error) {
    throw new Error(error)
  }
}
