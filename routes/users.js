const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validateBody = require("../middleware/validateBody")
const { signUpJoi, User, loginJoi, profileJoi } = require("../models/User")
const checkAdmin = require("../middleware/checkAdmin")
const checkToken = require("../middleware/checkToken")
const router = express.Router()

router.get("/users", checkAdmin, async (req, res) => {
  try {
    const user = await User.find()

    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/signup", validateBody(signUpJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, avatar } = req.body

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already registered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      phoneNumber,
      avatar,
      role: "User",
    })

    await user.save()

    delete user._doc.password

    res.send(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/add-admin", checkAdmin, validateBody(signUpJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, avatar } = req.body

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already registered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      phoneNumber,
      avatar,
      role: "Admin",
    })

    await user.save()
    delete user._doc.password

    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json(" user not found ")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })

    res.json(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login/admin", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).send(" user not found ")
    if (user.role != "Admin") return res.status(403).send("you are not admin")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })

    res.json(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/profile", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-__v -password")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/profile", checkToken, validateBody(profileJoi), async (req, res) => {
  try {
    const { firstName, lastName, password, phoneNumber, avatar } = req.body

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, password: hash, phoneNumber, avatar } },
      { new: true }
    ).select("-__v -password")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router
