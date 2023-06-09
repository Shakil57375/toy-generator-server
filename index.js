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
    // await client.connect();

    const toysCollection = client.db("toysDb").collection("toys")

    const indexKeys = { title: 1, category: 1 }
    const indexOptions = { name: "titleCategory" }
    // get data from server
    app.get("/toySearchByToyName/:toyName", async (req, res) => {
      const searchName = req.params.toyName
      const result = await toysCollection.find({
        $or: [
          { ToyName: { $regex: searchName, $options: "i" } },
        ],
      }).toArray()
      res.send(result)
    })
    // set data to server
    app.post("/toys", async (req, res) => {
      const body = req.body
      const result = await toysCollection.insertOne(body)
      res.send(result)
    })
    // get data from server
    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray()
      res.send(result)
    })
    // get specific data from server
    app.get("/SingleToys/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result)
    })
    // filter by category
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
    // get the toys for the exact person
    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email)
      const {query} = req.params
      if (req.params?.email) {
        const result = await toysCollection
        .find({sellerEmail: req.params.email})
        .toArray()
        return res.send(result)
      }
      const result = await toysCollection.find().toArray()
      res.send(result)
    })

    // update data
    app.put("/updateToys/:id", async (req, res) => {
      const id = req.params.id
      const body = req.body
      const filter = { _id: new ObjectId(id) }
      const updatedProduct = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      }
      const result = await toysCollection.updateOne(filter, updatedProduct)
      res.send(result)
    })
    
    // delete data 

    app.delete("/SingleToys/:id", async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(filter)
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