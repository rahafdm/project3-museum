const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
const joi = require("joi")
const joiObjectId = require("joi-objectid")
joi.Objectid = joiObjectId(joi)
const users = require("./routes/users")
const collections = require("./routes/collections")
const userCollection = require("./routes/userCollections")
const types = require("./routes/types")
const era = require("./routes/eras")
const location = require("./routes/locations")
require("dotenv").config()

mongoose
  .connect(`mongodb://localhost:27017/museumDB`)
  .then(() => {
    console.log("connected to MongoDB")
  })

  .catch(error => {
    console.log("Error connecting to MongoDB")
  })

app.use(express.json())
app.use(cors())

app.use("/api/auth", users)
app.use("/api/collections", collections)
app.use("/api/types", types)
app.use("/api/locations", location)
app.use("/api/eras", era)
app.use("/api/userCollections", userCollection)
 
const port = 5000

app.listen(port, () => {
  console.log("server is listening on port:" + 5000)
})
