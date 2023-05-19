const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.pwdn1ap.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allToyCollection = client.db("toyDB").collection("allToy");

    const indexkey = { name: 1 };
    const indexOption = { searchToy: "toyName" };

    const result = await allToyCollection.createIndex(indexkey, indexOption);

    //get all toy
    app.get("/allToy", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;
      const result = await allToyCollection.find().sort({ price: 1 }).skip(skip).limit(limit).toArray();
      res.send(result);
    });

    //get toy filtering by email
    app.get('/myToy',async(req,res)=>{
      const result = await allToyCollection.find({email: req.query.email}).sort({ price: 1 }).toArray();
      res.send(result);
    })

    //get total toy number
    app.get('/totalToy',async(req,res)=>{
      const result = await allToyCollection.estimatedDocumentCount();
      res.send({totalToy: result})
  })

    //get data to filter category section
    app.get("/allToyByCategory/:category", async (req, res) => {
      const toys = await allToyCollection
        .find({ category: req.params.category })
        .toArray();
      res.send(toys);
    });

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy server are running");
});

app.listen(port, () => {
  console.log(`This server running, and port number is : ${port}`);
});
