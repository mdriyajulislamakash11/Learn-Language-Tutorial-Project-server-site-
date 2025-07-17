const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// mongo db code:

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const languageCollections = client
      .db("language_DB")
      .collection("tutorials");
    const languageBookingCollections = client
      .db("language_DB")
      .collection("Booking");

      // JWT Authentication:
      app.post('/jwt', async (req, res) => {
        const user = req.body;
        const tokent = jwt.sign(user, "secret", {expiresIn: '2h'})
        res.send(tokent);
      })



    // All Language:
    app.get("/tutorials", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const cursor = languageCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/tutorial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await languageCollections.findOne(query);
      res.send(result);
    });

    app.get("/tutorials/:category", async (req, res) => {
      const category = req.params.category;
      const query = { language: category };
      const result = await languageCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/add-tutorials", async (req, res) => {
      const language = req.body;
      const result = await languageCollections.insertOne(language);
      res.send(result);
    });

    // Updated Card
    app.put("/tutorial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedTutorial = req.body;
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedTutorial.name,
          image: updatedTutorial.image,
          language: updatedTutorial.language,
          price: updatedTutorial.price,
          description: updatedTutorial.description,
          review: updatedTutorial.review,
        },
      };

    const result = await languageCollections.updateOne(query, updatedDoc, options);
    res.send(result);
    });

    // deleted booking card
    app.delete("/tutorial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await languageCollections.deleteOne(query);
      res.send(result);
    });

    // Booking colections APIs
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const booked = await languageBookingCollections.find(query).toArray();
      res.send(booked);
    });

    app.get("booking", async (req, res) => {
      const cursor = languageBookingCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-booking", async (req, res) => {
      const language = req.body;
      const result = await languageBookingCollections.insertOne(language);
      res.send(result);
    });

    // rivew count increes kortesi
    app.patch("/tutorials/review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const tutorial = await languageCollections.findOne(filter);
      const currentReview = parseInt(tutorial.review) || 0;
      const newReview = currentReview + 1;
      const updateDoc = {
        $set: { review: newReview },
      };

      const result = await languageCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Root Route
app.get("/", (req, res) => {
  res.send("Hello from Express server!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
