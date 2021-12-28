const mongoose = require("mongoose")
const joi = require("joi")



const collectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  types: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Type",
    },
  ],
  FavCollection: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
})



const collectionJoi = joi.object ({
    title: joi.string().min(5).required(),
    description: joi.string().min(10).max(100).required(),
    image: joi.string().uri().min(10).max(10000).required(),
    types: joi.array().items(joi.Objectid()).min(1)
})

const collectionEditJoi = joi.object ({
    title: joi.string().min(5),
    description: joi.string().min(10).max(100),
    image: joi.string().uri().min(10).max(10000),
    types: joi.array().items(joi.Objectid()).min(1)
})


const Collection = mongoose.model("Collection", collectionSchema)
module.exports.Collection = Collection
module.exports.collectionSchema = collectionSchema
module.exports.collectionJoi = collectionJoi
module.exports.collectionEditJoi = collectionEditJoi
