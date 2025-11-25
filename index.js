require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGODB_URL;

if (!uri) {
  console.error("❌ ERROR: MONGODB_URL is missing in .env file!");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Collections
let ChallengesCollection;
let UserChallengesCollection;
let EventCollection;
let tipsCollection;

// Connect to MongoDB BEFORE starting server
async function connectDB() {
  try {
    await client.connect();
    console.log(" MongoDB Connected Successfully");

    const db = client.db("track_eco");

    ChallengesCollection = db.collection("Challenges");
    UserChallengesCollection = db.collection("UserChallenges");
    EventCollection = db.collection("event");
    tipsCollection = db.collection("activities");

    console.log(" Collections Loaded");

  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1); 
  }
}

// Middleware to ensure DB is ready
function ensureDB(req, res, next) {
  if (!ChallengesCollection) {
    return res.status(500).send({
      error: "Database not initialized. Please try again in a moment.",
    });
  }
  next();
}

// Routes start here
app.get("/", (req, res) => {
  res.send("EcoTrack Server is Running");
});

// Use middleware for all API routes

app.use(ensureDB);

// Challenges

app.get("/Challenges", async (req, res) => {
  try {
    const result = await ChallengesCollection.find()
      .sort({ duration: 1 })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/Challenges/:id", async (req, res) => {
  try {
    const challenge = await ChallengesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(challenge);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/Challenges", async (req, res) => {
  try {
    const result = await ChallengesCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// User Challenges

app.get("/UserChallenges", async (req, res) => {
  try {
    const result = await UserChallengesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// Events 

app.get("/event", async (req, res) => {
  try {
    const result = await EventCollection.find().sort({ date: 1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/event/:id", async (req, res) => {
  try {
    const event = await EventCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(event);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/event", async (req, res) => {
  try {
    const result = await EventCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/event/:id", async (req, res) => {
  try {
    const result = await EventCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/event/:id", async (req, res) => {
  try {
    const result = await EventCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// Start Server AFTER DB 

connectDB().then(() => {
  app.listen(port, () => {
    console.log(` EcoTrack Server running on port ${port}`);
  });
});
