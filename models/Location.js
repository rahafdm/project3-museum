const mongoose = require("mongoose")
const joi = require("joi")

const locationSchema = new mongoose.Schema ({
    location:String
})

const locationJoi = joi.object({
    location:joi.string().min(3).max(30).required(),
})

const Location = mongoose.model("Location", locationSchema)
module.exports.Location = Location 
module.exports.locationSchema = locationSchema
module.exports.locationJoi = locationJoi