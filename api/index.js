require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 4000
const uri = process.env.MONGODB_URI;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middilwar JWT = Json Web Token
const verifiToken = (req,res,next)=>{
  const header = req.headers.authorization
  if(!header){
    return res.status(401).json({ message: "Unauthorized" })
  }
  const token =header.split(" ")[1]
  if(!token){
    return res.status(401).json({ message: "Unauthorized" })
  }
   next()
}
async function run() {
  try {
    await client.connect();
    const db = client.db("wanderlist")
    const destinationCollection = db.collection("destinations")
    const bookinCollection = db.collection("bookings")

    app.post("/bookings",async(req,res)=>{
      const newBooking = req.body ;
      const result = await bookinCollection.insertOne(newBooking)
      res.send(result)
    })
    app.get("/bookings/:userId",async(req,res)=>{
      const {userId}=req.params
      const allBooking = bookinCollection.find({userId : userId}) ;
      const result = await allBooking.toArray()
      res.send(result)
    })
    app.delete("/bookings/:id",async(req,res)=>{
      const id=req.params.id
      const quari = { _id : new ObjectId(id) }
      const result = await bookinCollection.deleteOne(quari)
      res.send(result)
    })
    
    app.get("/destination",async (req,res) => {
      const allData = destinationCollection.find();
      const result = await allData.toArray();
      res.send(result)
    })

    app.get("/destination/:id",verifiToken,async(req,res)=>{
      const id = req.params.id ;
      const quari = {
        _id : new ObjectId(id)
      }
      const result = await destinationCollection.findOne(quari)
      res.send(result)
    })

    app.delete("/destination/:id",async(req,res)=>{
      const id = req.params.id ;
      const quari = {
        _id : new ObjectId(id)
      }
      const result = await destinationCollection.deleteOne(quari)
      res.send(result)
    })

    app.patch("/destination/:id",async(req,res)=>{
      const id = req.params.id ;
      const updateData=req.body;
      const quari = {
        _id : new ObjectId(id)
      }
      const result = await destinationCollection.updateOne(quari,
        {$set:updateData}
      )
      res.send(result)
    })

    app.post("/destination",async(req,res)=>{
      const newDestination = req.body;
      const result = await destinationCollection.insertOne(newDestination)
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
