const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkId = require("../middleware/checkId")
const validateBody = require("../middleware/validateBody")
const { Era, eraJoi } = require("../models/Era")
const router = express.Router()

router.get("/", async (req, res) => {
  const eras = await Era.find()
  res.json(eras)
})

router.get("/:id",checkId, async (req, res) => {
    const eras = await Era.findById(req.params.id)

    if(!eras) return res.status(404).send("era not found ")
    res.json(eras)
  })

router.post("/", checkAdmin, validateBody(eraJoi), async (req, res) => {
  try {
    const { era } = req.body

    const eraBody = new Era({
      era,
    })

    await eraBody.save()

    res.json(eraBody)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.put("/:id", checkAdmin, checkId, validateBody(eraJoi), async (req, res) => {
  try {
    const { era } = req.body

    const eraBody = await Era.findByIdAndUpdate(req.params.id, { $set: { era } }, { new: true })

    if (!eraBody) return res.status(404).send(" era not found ")

    res.json(eraBody)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const era = await Era.findByIdAndRemove(req.params.id)
    if (!era) return res.status(404).send("era not found")

    res.json("era has been removed ")
  } catch (error) {
    res.status(500).json(error.message)
  }
})

module.exports = router
