import "dotenv/config";
import app from "./app.js";
import { closeDatabase, connectDatabase } from "./db.js";

const port = Number(process.env.PORT) || 3001;
try {
  await connectDatabase();
} catch (error) {
  console.error("No se pudo conectar a MongoDB Atlas:", error.message);
  console.error("Revisa MONGODB_URI, el usuario de base de datos y la lista de IP permitidas.");
}
const server = app.listen(port, () => console.log(`API lista en http://localhost:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await closeDatabase();
    process.exit(0);
  });
}
