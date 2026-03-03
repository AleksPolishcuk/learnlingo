require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Teacher = require("../models/Teacher");
const teachers = require("./teachers.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    await Teacher.deleteMany({});
    console.log("Cleared existing teachers");

    const inserted = await Teacher.insertMany(teachers);
    console.log(`Seeded ${inserted.length} teachers`);

    await mongoose.disconnect();
    console.log("Done. Disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
