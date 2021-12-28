const mongoose = require("mongoose")
const joi = require("joi")

const eraSchema = new mongoose.Schema ({
    era:String
})

const eraJoi = joi.object({
    era:joi.string().min(3).max(20).required(),
})

const Era = mongoose.model("Era",eraSchema)
module.exports.Era = Era 
module.exports.eraSchema = eraSchema
module.exports.eraJoi = eraJoi