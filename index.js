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
    client.connect()
    const allToyCollection = client.db("toyDB").collection("allToy");

    const indexkey = { name: 1 };
    const indexOption = { searchToy: "toyName" };

    await allToyCollection.createIndex(indexkey, indexOption);

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
      const value = req.query
      const index = parseInt(value.value);
      const result = await allToyCollection.find({email: req.query.email}).sort({ price: index }).toArray();
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

    //get toy find by ID
    app.get("/findToyById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.find(query).toArray();
      res.send(result);
    });

    //get toy search
    app.get("/getToyBySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await allToyCollection
        .find({ name: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    //post a single item
    app.post('/addToy',async(req,res)=>{
      const body = req.body;
      const result = await allToyCollection.insertOne(body)
      res.send(result)
    })

    //update the toy
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          seller: body.seller,
          name: body.name,
          price: body.price,
          quantity: body.quantity,
          rating: body.rating,
          email: body.email,
          picture: body.picture,
          category: body.category,
          details: body.details,
        },
      };
      const result = await allToyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Delete a single toy from dataBase
    app.delete('/deleteToy/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allToyCollection.deleteOne(query);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
