const express = require("express")
const checkId = require("../middleware/checkId")
const checkToken = require("../middleware/checkToken")
const validateBody = require("../middleware/validateBody")
const validateId = require("../middleware/validateId")
const { Comment,commentJoi } = require("../models/Comment")
const { Era } = require("../models/Era")
const { Location } = require("../models/Location")
const { Type } = require("../models/Type")
const { User } = require("../models/User")
const { UserCollection, userCollectionJoi, userCollectionEditJoi } = require("../models/UserCollection")
const router = express.Router()

router.get("/", async (req, res) => {
  const collection = await UserCollection.find()
    .populate("types")
    .populate("location")
    .populate("era")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
        select: "-password -email -role -favUserCollection",
      },
    })
  res.json(collection)
})

router.get("/:id", checkId, async (req, res) => {
  try {
    const collection = await UserCollection.findById(req.params.id)
      .populate("types")
      .populate("location")
      .populate("era")
      .populate({
        path: "comments",
        populate: {
          path: "owner",
          select: "-password -email -role -favUserCollection",
        },
      })

    if (!collection) return res.status(404).send("user collection not found")

    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/", checkToken, validateBody(userCollectionJoi), async (req, res) => {
  try {
    const { title, description, image, types, location, era } = req.body
    //TYPES
    const typesSet = new Set(types)
    if (typesSet.size < types.length) return res.status(400).send("there is a dublicated type")

    const typesFound = await Type.find({ _id: { $in: types } })
    if (typesFound.length < types.length) return res.status(404).send("some of the types is not found")

    //LOCATION
    const locationFound = await Location.findOne({ _id: { $in: location } })
    if (locationFound.length < location.length) return res.status(404).send("some of the location is not found")

    //ERA
    const eraFound = await Era.findOne({ _id: { $in: era } })
    if (eraFound.length < era.length) return res.status(404).send("some of the era is not found")

    const collection = new UserCollection({
      title,
      description,
      image,
      types,
      location,
      era,
    })

    await collection.save()

    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/:id", checkToken, checkId, validateBody(userCollectionEditJoi), async (req, res) => {
  try {
    const { title, description, image, types, location, era } = req.body

    //TYPES
    if (types) {
      const typeSet = new Set(types)
      if (typeSet.size < types.length) return res.status(400).send("there is a dublicated type")
      const typeFound = await Type.find({ _id: { $in: types } })
      if (typeFound.length < types.length) return res.status(404).send("some of the types is not found")
    }

    //LOCATION
    if (location) {
      const locationFound = await Location.findOne({ _id: { $in: location } })
      if (locationFound.length < location.length) return res.status(404).send("some of the location is not found")
    }

    //era
    if (era) {
      const eraFound = await Era.findOne({ _id: { $in: era } })
      if (eraFound.length < era.length) return res.status(404).send("some of the era is not found")
    }

    const collection = await UserCollection.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, image, types, location, era } },
      { new: true }
    )

    if (!collection) return res.status(404).send("user collection not found ")
    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:id", checkToken, checkId, async (req, res) => {
  try {
    await Comment.deleteMany({ filmId: req.paramsid })

    const collection = await UserCollection.findOneAndRemove(req.params.id)
    if (!collection) return res.status(404).send("collection not found")

    res.json("user collection has been removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// COMMENTS //

router.get("/:userCollectionId/comments", validateId("userCollectionId"), async (req, res) => {
  try {
    const collection = await UserCollection.findById(req.params.userCollectionId)
    if (!collection) return res.status(404).send("user collection is not found")

    const comments = await Comment.find({ userCollectionId: req.params.userCollectionId })

    res.json(comments)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.post(
  "/:userCollectionId/comments",
  checkToken,
  validateId("userCollectionId"),
  validateBody(commentJoi),
  async (req, res) => {
    try {
      const { comment } = req.body

      const collection = await UserCollection.findById(req.params.userCollectionId)
      if (!collection) return res.status(404).send(" user collection is not found")

      const userComment = new Comment({
        comment,
        owner: req.userId,
        userCollectionId: req.params.userCollectionId,
      })

      await UserCollection.findByIdAndUpdate(req.params.userCollectionId, { $push: { comments: userComment._id } })

      await userComment.save()

      res.json(userComment)
    } catch (error) {
      res.status(500).json(error.message)
    }
  }
)

router.put(
  "/:userCollectionId/comments/:commentId",
  checkToken,
  validateId("userCollectionId", "commentId"),
  validateBody(commentJoi),
  async (req, res) => {
    try {
      const collection = await UserCollection.findById(req.params.userCollectionId)
      if (!collection) return res.status(404).send("user collection not found")

      const { comment } = req.body

      const commentFound = await Comment.findById(req.params.commentId)
      if (!commentFound) return res.status(404).send("comment not found")

      if (commentFound.owner != req.userId) return res.status(403).send("unauthorized action")

      const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, { $set: { comment } }, { new: true })

      res.json(updatedComment)
    } catch (error) {
      res.status(500).json(error.message)
    }
  }
)

router.delete(
  "/:userCollectionId/comments/:commentId",
  checkToken,
  validateId("userCollectionId", "commentId"),
  async (req, res) => {
    try {
      const collection = await UserCollection.findById(req.params.userCollectionId)
      if (!collection) return res.status(404).send("user collection not found")

      const commentFound = await Comment.findById(req.params.commentId)
      if (!commentFound) return res.status(404).send("comment not found")

      const user = await User.findById(req.userId)
      if (user.role !== "Admin" && commentFound.owner != req.userId) return res.status(403).send("unauthorized action")

      await UserCollection.findByIdAndUpdate(req.params.userCollectionId, { $pull: { comments: commentFound._id } })

      await Comment.findOneAndRemove(req.params.commentId)

      res.json("comment has been removed")
    } catch (error) {
      res.status(500).json(error.message)
    }
  }
)

// ADD TO FAVORIT USER COLLECTION //

router.get("/:userCollectionId/favUserCollection", checkToken, validateId("userCollectionId"), async (req, res) => {
  try {
    let collection = await UserCollection.findById(req.params.userCollectionId)
    if (!collection) return res.status(404).send("user collection is not found")

    const userFound = collection.favUserCollection.find(favUserCollection => favUserCollection == req.userId)
    if (userFound) {
      await UserCollection.findByIdAndUpdate(req.params.userCollectionId, { $pull: { favUserCollection: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { favUserCollection: req.params.userCollectionId } })
      res.send("removed from favorite")
    } else {
      await UserCollection.findByIdAndUpdate(req.params.userCollectionId, { $push: { favUserCollection: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { favUserCollection: req.params.userCollectionId } })
      res.send("added to your favorite")
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
})

module.exports = router
