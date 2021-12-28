const mongoose = require("mongoose")
const joi = require("joi")


const typeSchema = new mongoose.Schema ({
    name:String
})

const typeJoi = joi.object({
    name:joi.string().min(3).max(20).required(),
})

const Type = mongoose.model("Type", typeSchema)
module.exports.Type = Type 
module.exports.typeSchema = typeSchema
module.exports.typeJoi = typeJoi