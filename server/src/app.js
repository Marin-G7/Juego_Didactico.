import express from "express";
import { ObjectId } from "mongodb";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDatabase, getRoundsCollection, getUsersCollection } from "./db.js";
import datos from "../../src/data/palabras.json" with { type: "json" };
import { unlockedRewards } from "../../src/data/rewards.js";

const scrypt = promisify(scryptCallback);

const app = express();
app.use(express.json({ limit: "20kb" }));

function publicUser(user) {
  const points = Number(user.puntos) || 0;
  return { id: user._id.toString(), nombre: user.nombre, correo: user.correo, puntos: points, desbloqueos: unlockedRewards(points), recompensaActiva: user.recompensaActiva || "" };
}

// El token firmado permite identificar la cuenta sin enviar la contraseña en cada solicitud.
function createToken(userId) {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configura AUTH_TOKEN_SECRET con al menos 32 caracteres en server/.env.");
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function authenticated(request, response, next) {
  const [scheme, token] = String(request.headers.authorization || "").split(" ");
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < 32) return response.status(503).json({ error: "Configura AUTH_TOKEN_SECRET en server/.env para activar las cuentas." });
  if (scheme !== "Bearer" || !token) return response.status(401).json({ error: "Inicia sesión para continuar." });
  try {
    const [payload, signature] = token.split(".");
    const expected = createHmac("sha256", secret).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error("Firma no válida");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!claims.sub || claims.exp < Date.now() || !ObjectId.isValid(claims.sub)) throw new Error("Sesión vencida");
    request.userId = new ObjectId(claims.sub);
    next();
  } catch {
    response.status(401).json({ error: "La sesión venció o no es válida. Inicia sesión otra vez." });
  }
}

function optionalAuthenticated(request, response, next) {
  if (!request.headers.authorization) return next();
  return authenticated(request, response, next);
}

// Registro: valida los campos y guarda un hash de la contraseña, nunca el texto original.
app.post("/api/auth/registro", async (request, response) => {
  if (!process.env.AUTH_TOKEN_SECRET || process.env.AUTH_TOKEN_SECRET.length < 32) return response.status(503).json({ error: "Configura AUTH_TOKEN_SECRET con al menos 32 caracteres en server/.env." });
  const collection = getUsersCollection();
  if (!collection) return response.status(503).json({ error: "Conecta MongoDB Atlas para crear y conservar cuentas." });
  const nombre = String(request.body?.nombre || "").trim().replace(/\s+/g, " ");
  const correo = String(request.body?.correo || "").trim().toLowerCase();
  const password = String(request.body?.password || "");
  if (nombre.length < 2 || nombre.length > 32 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 150 || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: "Escribe un nombre de 2 a 32 caracteres, un correo válido y una contraseña de 8 a 128 caracteres." });
  }
  try {
    const salt = randomBytes(16);
    const passwordHash = await scrypt(password, salt, 64);
    const user = { nombre, correo, salt: salt.toString("hex"), passwordHash: Buffer.from(passwordHash).toString("hex"), puntos: 0, partidasPremiadas: [], creadoEn: new Date() };
    const result = await collection.insertOne(user);
    user._id = result.insertedId;
    response.status(201).json({ token: createToken(result.insertedId.toString()), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "Ya existe una cuenta con ese correo." });
    if (error.message.startsWith("Configura AUTH_TOKEN_SECRET")) return response.status(503).json({ error: error.message });
    console.error("No se pudo crear la cuenta:", error.message);
    response.status(500).json({ error: "No se pudo crear la cuenta." });
  }
});

app.post("/api/auth/iniciar-sesion", async (request, response) => {
  if (!process.env.AUTH_TOKEN_SECRET || process.env.AUTH_TOKEN_SECRET.length < 32) return response.status(503).json({ error: "Configura AUTH_TOKEN_SECRET con al menos 32 caracteres en server/.env." });
  const collection = getUsersCollection();
  if (!collection) return response.status(503).json({ error: "Conecta MongoDB Atlas para iniciar sesión." });
  const correo = String(request.body?.correo || "").trim().toLowerCase();
  const password = String(request.body?.password || "");
  try {
    const user = await collection.findOne({ correo });
    if (!user) return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    const candidate = Buffer.from(await scrypt(password, Buffer.from(user.salt, "hex"), 64));
    const stored = Buffer.from(user.passwordHash, "hex");
    if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    response.json({ token: createToken(user._id.toString()), user: publicUser(user) });
  } catch (error) {
    if (error.message.startsWith("Configura AUTH_TOKEN_SECRET")) return response.status(503).json({ error: error.message });
    response.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

app.get("/api/auth/cuenta", authenticated, async (request, response) => {
  const user = await getUsersCollection()?.findOne({ _id: request.userId });
  if (!user) return response.status(404).json({ error: "No se encontró la cuenta." });
  response.json(publicUser(user));
});

app.post("/api/auth/recompensa", authenticated, async (request, response) => {
  const collection = getUsersCollection();
  const rewardId = String(request.body?.rewardId || "");
  const user = await collection?.findOne({ _id: request.userId });
  if (!user) return response.status(404).json({ error: "No se encontró la cuenta." });
  if (rewardId && !unlockedRewards(Number(user.puntos) || 0).includes(rewardId)) return response.status(403).json({ error: "Primero debes desbloquear esa recompensa." });
  await collection.updateOne({ _id: request.userId }, { $set: { recompensaActiva: rewardId } });
  response.json(publicUser({ ...user, recompensaActiva: rewardId }));
});

// El premio se calcula en el servidor y partidasPremiadas hace idempotente la acreditación.
app.post("/api/auth/puntos", authenticated, async (request, response) => {
  const collection = getUsersCollection();
  const { roundId } = request.body || {};
  if (!collection || typeof roundId !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(roundId)) {
    return response.status(400).json({ error: "Los datos de puntuación no son válidos." });
  }
  try {
    const round = await getRoundsCollection()?.findOne({ roundId, userId: request.userId, gano: true });
    if (!round) return response.status(404).json({ error: "No se encontró una victoria de esta cuenta para premiar." });
    const max = Math.min(10, Math.max(6, Number(round.intentosMaximos) || 6));
    const misses = Math.min(max, Math.max(0, Number(round.errores) || 0));
    const timedModes = ["tiempo", "formar", "formar-duelo"];
    const points = Math.min(55, 25 + (max - misses) * 2 + (timedModes.includes(round.modo) ? Math.min(10, Math.floor(Math.max(0, Number(round.tiempoRestante) || 0) / 30)) : 0));
    const update = await collection.updateOne({ _id: request.userId, partidasPremiadas: { $ne: roundId } }, { $inc: { puntos: points }, $addToSet: { partidasPremiadas: roundId } });
    const user = await collection.findOne({ _id: request.userId });
    response.json({ ...publicUser(user), puntosRonda: update.modifiedCount ? points : 0 });
  } catch (error) {
    console.error("No se pudieron actualizar los puntos:", error.message);
    response.status(500).json({ error: "No se pudieron guardar los puntos." });
  }
});

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
  const collection = getRoundsCollection();
  if (!collection) return response.status(503).json({ error: "Configura MongoDB Atlas para consultar partidas guardadas." });
  const jugadorId = String(request.query.jugadorId || "");
  if (!/^[a-z0-9-]{1,80}$/.test(jugadorId)) return response.status(400).json({ error: "Indica un identificador de jugador válido." });
  try {
    const limite = Math.min(50, Math.max(1, Number(request.query.limite) || 20));
    const partidas = await collection.find({ jugadorId }).sort({ creadaEn: -1 }).limit(limite).toArray();
    response.json(partidas.map(({ _id, ...partida }) => ({ id: _id.toString(), ...partida })));
  } catch (error) {
    console.error("No se pudieron consultar las partidas:", error.message);
    response.status(500).json({ error: "No se pudieron consultar las partidas." });
  }
});

app.post("/api/partidas", optionalAuthenticated, async (request, response) => {
  const collection = getRoundsCollection();
  if (!collection) return response.status(503).json({ error: "Configura MongoDB Atlas para guardar partidas." });
  const { palabra, categoria, gano, puntos, errores, modo, jugador, jugadorId } = request.body ?? {};
  if (typeof palabra !== "string" || palabra.length < 1 || palabra.length > 40 || !Object.hasOwn(datos.bancoPalabras, categoria) ||
      typeof gano !== "boolean" || !Number.isFinite(Number(puntos)) || !Number.isFinite(Number(errores)) ||
      !["individual", "duelo", "tiempo", "formar", "formar-duelo", "eliminacion"].includes(modo) || typeof jugador !== "string" || jugador.length > 40 ||
      typeof jugadorId !== "string" || !/^[a-z0-9-]{1,80}$/.test(jugadorId)) {
    return response.status(400).json({ error: "Los datos de la partida no son válidos." });
  }
  try {
    const documento = {
      palabra, categoria, gano,
      puntos: Math.max(0, Math.min(55, Number(puntos))),
      errores: Math.max(0, Math.min(10, Number(errores))),
      intentosMaximos: Math.min(10, Math.max(6, Number(request.body.intentosMaximos) || 6)),
      modo, jugador: jugador.trim() || "Jugador", jugadorId,
      roundId: typeof request.body.id === "string" ? request.body.id.slice(0, 100) : null,
      userId: request.userId || null,
      tiempoRestante: request.body.tiempoRestante !== null && request.body.tiempoRestante !== undefined && Number.isFinite(Number(request.body.tiempoRestante))
        ? Math.max(0, Math.min(300, Number(request.body.tiempoRestante))) : null,
      creadaEn: new Date()
    };
    const resultado = await collection.insertOne(documento);
    response.status(201).json({ id: resultado.insertedId.toString(), ...documento, creadaEn: documento.creadaEn.toISOString() });
  } catch (error) {
    console.error("No se pudo guardar la partida:", error.message);
    response.status(500).json({ error: "No se pudo guardar la partida." });
  }
});

app.delete("/api/partidas/:id", async (request, response) => {
  const collection = getRoundsCollection();
  if (!collection) return response.status(503).json({ error: "Configura MongoDB Atlas para borrar partidas." });
  if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: "El identificador no es válido." });
  try {
    const resultado = await collection.deleteOne({ _id: new ObjectId(request.params.id) });
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

