const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkId = require("../middleware/checkId")
const checkToken = require("../middleware/checkToken")
const validateBody = require("../middleware/validateBody")
const validateId = require("../middleware/validateId")
const { Collection, collectionJoi, collectionEditJoi } = require("../models/Collection")
const { Type } = require("../models/Type")
const { User } = require("../models/User")
const router = express.Router()


router.get("/", checkAdmin, async (req, res) => {
  const collection = await Collection.find().populate("types")
  res.json(collection)
})

router.get("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
    if (!collection) return res.status(404).send("film not found")

    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/", checkAdmin, validateBody(collectionJoi), async (req, res) => {
  try {
    const { title, description, image, types } = req.body

    const typeSet = new Set(types)
    if (typeSet.size < types.length) return res.status(400).send("there is a dublicated type")

    const typeFound = await Type.find({ _id: { $in: types } })
    if (typeFound.length < types.length) return res.status(404).send("some of the types is not found")

    const collection = new Collection({
      title,
      description,
      image,
      types,
    })

    await collection.save()
    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/:id", checkAdmin, checkId, validateBody(collectionEditJoi), async (req, res) => {
  try {
    const { title, description, image, types } = req.body

    if (types) {
      const typeSet = new Set(types)
      if (typeSet.size < types.length) return res.status(400).send("there is a dublicated type")
      const typeFound = await Type.find({ _id: { $in: types } })
      if (typeFound.length < types.length) return res.status(404).send("some of the types is not found")
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, image, types } },
      { new: true }
    )

    if (!collection) return res.status(404).send(" collection not found")
    res.json(collection)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndRemove(req.params.id)
    if (!collection) return res.status(404).send("collection not found")

    res.json("collection has been removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// ADD TO FAVORIT COLLECTION //

router.get("/:CollectionId/favCollection", checkToken, validateId("CollectionId"), async (req, res) => {
  try {
    let collections = await Collection.findById(req.params.CollectionId)
    if (!collections) return res.status(404).send("collection is not found")

    const userFound = collections.favCollection.find(favCollection => favCollection == req.userId)
    if (userFound) {
      await Collection.findByIdAndUpdate(req.params.CollectionId, { $pull: { favCollection: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { favCollection: req.params.CollectionId } })
      res.send("removed from your favorite")
    } else {
      await Collection.findByIdAndUpdate(req.params.CollectionId, { $push: { favCollection: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { favCollection: req.params.CollectionId } })
      res.send("added to your favorite")
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
})


module.exports = router
