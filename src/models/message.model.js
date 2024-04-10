import { Schema, model } from "mongoose"

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const MessageModel = model("Message", messageSchema)

export async function create(messageBody) {
  try {
    const newMessage = await MessageModel.create(messageBody)
    const newMessagePopulated = await newMessage.populate(
      "sender",
      "name avatar",
    )

    return newMessagePopulated
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeAllMessagesFromUser(userId) {
  try {
    await MessageModel.deleteMany({ sender: userId })
  } catch (error) {
    throw new Error(error)
  }
}
