import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// ======= CONFIGURE THESE =======
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "pm2dashboard";
// ===============================

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: bun scripts/createAdmin.ts <username> <password>");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection("users");

  const existing = await users.findOne({ username });
  if (existing) {
    console.error("User already exists!");
    process.exit(2);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userDoc = {
    _id: new ObjectId(),
    username,
    passwordHash,
    role: "admin",
    assignedServices: [],
  };

  await users.insertOne(userDoc);
  console.log(`Admin user '${username}' created!`);
  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
