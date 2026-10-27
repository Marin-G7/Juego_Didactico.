import { MongoClient } from "mongodb";

let client;
let database;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("USUARIO:CONTRASENA")) {
    console.warn("MongoDB sin configurar. La API funcionará en modo local; las partidas no se guardarán en Atlas.");
    return null;
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  database = client.db(process.env.MONGODB_DB || "ahorcado_educativo");
  await database.collection("partidas").createIndex({ creadaEn: -1 });
  console.log(`Conectado a MongoDB: ${database.databaseName}`);
  return database;
}

export function getDatabase() {
  return database || null;
}

export async function closeDatabase() {
  if (client) await client.close();
}
