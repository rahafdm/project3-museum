const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkId = require("../middleware/checkId")
const validateBody = require("../middleware/validateBody")
const { Type, typeJoi } = require("../models/Type")
const router = express.Router()

router.get("/", async (req, res) => {
  const types = await Type.find()
  res.json(types)
})  
 
router.get("/:id",checkId, async (req, res) => {
  const types = await Type.findById(req.params.id)
  
  if(!types) return res.status(404).send("type not found")
  res.json(types)
})

router.post("/", checkAdmin, validateBody(typeJoi), async (req, res) => {
  try {
    const { name } = req.body

    const type = new Type({
      name,
    })

    await type.save()
    res.json(type)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.put("/:id", checkAdmin, checkId, validateBody(typeJoi), async (req, res) => {
  try {
    const { name } = req.body
    const type = await Type.findByIdAndUpdate(req.params.id, { $set: { name } }, { new: true })

    if (!type) return res.status(404).send("type not found")

    res.json(type)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

router.delete("/:id", checkAdmin, checkId, async (req, res) =>{
    try{
        const type = await Type.findByIdAndRemove(req.params.id)
        if(!type) return res.status(404).send("type not found")

        res.json("type is removed")

    }catch (error) {
        res.status(500).json(error.message)
    }
})

module.exports = router