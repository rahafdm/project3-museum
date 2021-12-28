const mongoose = require("mongoose")
const joi = require("joi")


const userSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phoneNumber:Number,
    password:String,
    avatar:String,
    favCollection: [
        {
            type:mongoose.Types.ObjectId,
            ref: "Collection"
        },
    ],

    favUserCollection: [
        {
            type:mongoose.Types.ObjectId,
            ref: "UserCollection"
        },
    ],

    role: {
        type:String,
        default: "User"
    }
})

const signUpJoi = joi.object({
    firstName: joi.string().min(2).max(100).required(),
    lastName: joi.string().min(2).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(100).required(),
    phoneNumber: joi.number().required(),
    avatar: joi.string().uri().min(5).max(10000).required(),
})

const loginJoi = joi.object({
    email: joi.string().min(5).max(100).required(),
    password: joi.string().min(8).max(100).required(),
})


const profileJoi = joi.object({
    firstName: joi.string().min(2).max(100).required(),
    lastName: joi.string().min(2).max(100).required(),
    password: joi.string().min(8).max(100).required(),
    phoneNumber: joi.number().required(),
    avatar: joi.string().uri().min(5).max(10000).required(),
})
 
const User = mongoose.model("User", userSchema)
module.exports.User = User
module.exports.signUpJoi = signUpJoi
module.exports.loginJoi = loginJoi
module.exports.profileJoi = profileJoi