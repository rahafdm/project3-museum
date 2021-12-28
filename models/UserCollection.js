const mongoose = require("mongoose")
const joi = require("joi")

const userCollectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  favCollection: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],

  favUserCollection: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],

  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],

  types: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Type",
    },
  ],

  location: {
    type: mongoose.Types.ObjectId,
    ref: "Location",
  },

  era: {
    type: mongoose.Types.ObjectId,
    ref: "Era",
  },
})

const userCollectionJoi = joi.object({
  title: joi.string().min(5).max(100).required(),
  description: joi.string().min(8).max(1000).required(),
  image: joi.string().uri().min(8).max(10000).required(),
  types: joi.array().items(joi.Objectid()).min(1).required(),
  location: joi.Objectid().required(),
  era: joi.Objectid().required(),
})

const userCollectionEditJoi = joi.object({
  title: joi.string().min(5).max(100),
  description: joi.string().min(8).max(1000),
  image: joi.string().uri().min(8).max(10000),
  types: joi.array().items(joi.Objectid()).min(1),
  location: joi.Objectid(),
  era: joi.Objectid(),
})

const UserCollection = mongoose.model("UserCollection", userCollectionSchema)
module.exports.UserCollection = UserCollection
module.exports.userCollectionJoi = userCollectionJoi
module.exports.userCollectionEditJoi = userCollectionEditJoi
