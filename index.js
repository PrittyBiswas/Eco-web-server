require("dotenv").config();   // <-- IMPORTANT: Loads .env values

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ------------------------
// Middleware
// ------------------------
app.use(cors());
app.use(express.json());

// ------------------------
// MongoDB URI
// ------------------------
const uri = process.env.MONGODB_URL;

if (!uri) {
  console.error("❌ ERROR: MONGODB_URL is missing in .env file!");
  process.exit(1);
}

// ------------------------
// MongoDB client setup
// ------------------------
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

// ------------------------
// Default route
// ------------------------
app.get("/", (req, res) => {
  res.send("EcoTrack Server is Running");
});

// ------------------------
// Connect to MongoDB
// ------------------------
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("track_eco");

    ChallengesCollection = db.collection("Challenges");
    UserChallengesCollection = db.collection("UserChallenges");
    EventCollection = db.collection("event");

  } catch (error) {
    console.error("❌ DB Connection Error:", error);
  }
}
connectDB();

// ------------------------
// Routes
// ------------------------

// Get all challenges
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

// Get single challenge by ID
app.get("/Challenges/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const challenge = await ChallengesCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send(challenge);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Create challenge
app.post("/Challenges", async (req, res) => {
  try {
    const newChallenge = req.body;
    const result = await ChallengesCollection.insertOne(newChallenge);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all user challenges
app.get("/UserChallenges", async (req, res) => {
  try {
    const result = await UserChallengesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Join a challenge
app.post("/JoinChallenge", async (req, res) => {
  try {
    const { userId, challengeId } = req.body;

    if (!userId || !challengeId) {
      return res.status(400).send({
        error: "userId and challengeId required",
      });
    }

    const result = await UserChallengesCollection.insertOne({
      userId,
      challengeId,
      joinedAt: new Date(),
    });

    res.send({
      success: true,
      message: "Joined successfully!",
      result,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all events
app.get("/event", async (req, res) => {
  try {
    const result = await EventCollection.find()
      .sort({ date: 1 })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get single event by ID
app.get("/event/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const event = await EventCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send(event);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



// Create event
app.post("/event", async (req, res) => {
  try {
    const newEvent = req.body;
    const result = await EventCollection.insertOne(newEvent);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update event
app.put("/event/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedEvent = req.body;

    const result = await EventCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedEvent }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete event
app.delete("/event/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await EventCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ------------------------
// Start server
// ------------------------
app.listen(port, () => {
  console.log(`🚀 EcoTrack Server running on port ${port}`);
});
