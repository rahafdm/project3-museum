const mongoose = require("mongoose")
const joi = require("joi")


const commentSchema = new mongoose.Schema({
    comment: String,
    userCollectionId:{
        type: mongoose.Types.ObjectId,
        ref: "UserCollection",
      },
    owner: {
        type:mongoose.Types.ObjectId,
        ref: "User",
    }
})

const commentJoi = joi.object({
    comment: joi.string().min(3).max(200).required(),
})

const Comment = mongoose.model("Comment" , commentSchema)

module.exports.Comment = Comment
module.exports.commentJoi = commentJoi