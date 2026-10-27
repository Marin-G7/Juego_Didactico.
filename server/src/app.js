import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "./db.js";
import datos from "./data/palabras.json" with { type: "json" };

const app = express();
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, atlas: getDatabase() ? "conectado" : "sin configurar" });
});

app.get("/api/categorias", (_request, response) => {
  response.json(Object.entries(datos.bancoPalabras).map(([id, palabras]) => ({
    id, nombre: datos.nombresCategorias[id] || id, cantidad: palabras.length
  })));
});

app.get("/api/palabras/:categoria", (request, response) => {
  const palabras = datos.bancoPalabras[request.params.categoria];
  if (!palabras) return response.status(404).json({ error: "No existe esa categoría." });
  response.json(palabras);
});

app.get("/api/partidas", async (request, response) => {
  const database = getDatabase();
  if (!database) return response.status(503).json({ error: "Configura MongoDB Atlas para consultar partidas guardadas." });
  const jugadorId = String(request.query.jugadorId || "");
  if (!/^[a-z0-9-]{1,80}$/.test(jugadorId)) return response.status(400).json({ error: "Indica un identificador de jugador válido." });
  try {
    const limite = Math.min(50, Math.max(1, Number(request.query.limite) || 20));
    const partidas = await database.collection("partidas").find({ jugadorId }).sort({ creadaEn: -1 }).limit(limite).toArray();
    response.json(partidas.map(({ _id, ...partida }) => ({ id: _id.toString(), ...partida })));
  } catch (error) {
    console.error("No se pudieron consultar las partidas:", error.message);
    response.status(500).json({ error: "No se pudieron consultar las partidas." });
  }
});

app.post("/api/partidas", async (request, response) => {
  const database = getDatabase();
  if (!database) return response.status(503).json({ error: "Configura MongoDB Atlas para guardar partidas." });
  const { palabra, categoria, gano, puntos, errores, modo, jugador, jugadorId } = request.body ?? {};
  if (typeof palabra !== "string" || palabra.length < 1 || palabra.length > 40 || !Object.hasOwn(datos.bancoPalabras, categoria) ||
      typeof gano !== "boolean" || !Number.isFinite(Number(puntos)) || !Number.isFinite(Number(errores)) ||
      !["individual", "duelo", "tiempo"].includes(modo) || typeof jugador !== "string" || jugador.length > 40 ||
      typeof jugadorId !== "string" || !/^[a-z0-9-]{1,80}$/.test(jugadorId)) {
    return response.status(400).json({ error: "Los datos de la partida no son válidos." });
  }
  try {
    const documento = {
      palabra, categoria, gano,
      puntos: Math.max(0, Math.min(10000, Number(puntos))),
      errores: Math.max(0, Math.min(6, Number(errores))),
      modo, jugador: jugador.trim() || "Jugador", jugadorId,
      tiempoRestante: request.body.tiempoRestante !== null && request.body.tiempoRestante !== undefined && Number.isFinite(Number(request.body.tiempoRestante))
        ? Math.max(0, Math.min(90, Number(request.body.tiempoRestante))) : null,
      creadaEn: new Date()
    };
    const resultado = await database.collection("partidas").insertOne(documento);
    response.status(201).json({ id: resultado.insertedId.toString(), ...documento, creadaEn: documento.creadaEn.toISOString() });
  } catch (error) {
    console.error("No se pudo guardar la partida:", error.message);
    response.status(500).json({ error: "No se pudo guardar la partida." });
  }
});

app.delete("/api/partidas/:id", async (request, response) => {
  const database = getDatabase();
  if (!database) return response.status(503).json({ error: "Configura MongoDB Atlas para borrar partidas." });
  if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: "El identificador no es válido." });
  try {
    const resultado = await database.collection("partidas").deleteOne({ _id: new ObjectId(request.params.id) });
    if (!resultado.deletedCount) return response.status(404).json({ error: "No se encontró esa partida." });
    response.status(204).end();
  } catch (error) {
    console.error("No se pudo borrar la partida:", error.message);
    response.status(500).json({ error: "No se pudo borrar la partida." });
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) return response.status(400).json({ error: "El cuerpo JSON no es válido." });
  console.error(error);
  response.status(500).json({ error: "Ocurrió un error inesperado en la API." });
});

export default app;


