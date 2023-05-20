const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require("dotenv").config()
const app = express()

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lc40fqb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toysDb").collection("toys")

    app.post("/toys", async (req, res) => {
      const body = req.body
      const result = await toysCollection.insertOne(body)
      res.send(result)
    })

    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().toArray()
      res.send(result)
    })

    app.get("/SingleToys/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result)
    })

    app.get("/toys/:category", async (req, res) => {
      console.log(req.params.category)
      if (req.params.category == "cricket" || req.params.category == "football" || req.params.category == "badminton") {
        const result = await toysCollection.find({
          category: req.params.category
        }).toArray()
        return res.send(result)
      }
      const result = await toysCollection.find().toArray()
      res.send(result)
    })

    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email)
      if (req.params?.email) {
        const result = await toysCollection.find({
          sellerEmail : req.params.email
        }).toArray()
        return res.send(result)
      }
      const result = await toysCollection.find().toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Toy store is running")
})

app.listen(port, () => {
  console.log(`Toy store is running on port ${port}`);
})