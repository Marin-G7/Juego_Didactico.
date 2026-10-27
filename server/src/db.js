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
  database = client.db(process.env.MONGODB_DB || "juego_ahorcado");
  const collection = process.env.MONGODB_COLLECTION || "partidas";
  await database.collection(collection).createIndex({ creadaEn: -1 });
  console.log(`Conectado a MongoDB: ${database.databaseName}, colección ${collection}`);
  return database;
}

export function getDatabase() {
  return database || null;
}

export function getRoundsCollection() {
  if (!database) return null;
  return database.collection(process.env.MONGODB_COLLECTION || "partidas");
}

export async function closeDatabase() {
  if (client) await client.close();
}
