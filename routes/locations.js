const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkId = require("../middleware/checkId")
const validateBody = require("../middleware/validateBody")
const { Location, locationJoi } = require("../models/Location")
const router = express.Router()

router.get("/", async (req, res) => {
  const locations = await Location.find()
  res.json(locations)
})

router.post("/", checkAdmin, validateBody(locationJoi), async (req, res) => {
  try {
    const { location } = req.body

    const locationBody = new Location({
      location,
    })

    await locationBody.save()

    res.json(locationBody)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.put("/:id", checkAdmin, checkId, validateBody(locationJoi), async (req, res) => {
  try {
    const { location } = req.body

    const locationBody = await Location.findByIdAndUpdate(req.params.id, { $set: { location } }, { new: true })

    if (!locationBody) return res.status(404).send(" location not found ")

    res.json(locationBody)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
      const location = await Location.findByIdAndRemove(req.params.id)
      if(!location) return res.status(404).send("location not found")

      res.json("location has been removed ")
  } catch (error) { 
    res.status(500).json(error.message)
  }
})

module.exports = router
