import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import datos from "../data/palabras.json";
import { api } from "../services/api.js";
import { calculatePoints } from "../services/scoring.js";
import { useAuth } from "./AuthContext.jsx";

const GameContext = createContext(null);
const multiplayerModes = ["duelo", "formar-duelo", "eliminacion"];
const leerSesion = (clave, alternativa) => {
  try {
    const valor = JSON.parse(sessionStorage.getItem(clave));
    return valor ?? alternativa;
  } catch {
    return alternativa;
  }
};
const idDeJugador = nombre => nombre.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jugador";
const leerPuntosLocales = jugadores => {
  try {
    const saved = JSON.parse(localStorage.getItem("puntosPorJugadorLocal") || "{}");
    return jugadores.map(name => Number(saved[idDeJugador(name)]) || 0);
  } catch { return jugadores.map(() => 0); }
};
const idLocal = () => {
  let id = localStorage.getItem("jugadorLocalId");
  if (!id) { id = `local-${crypto.randomUUID()}`; localStorage.setItem("jugadorLocalId", id); }
  return id;
};

export function GameProvider({ children }) {
  const navigate = useNavigate();
  const { user, token, awardPoints } = useAuth();
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem("temaVisual");
    return ["samurai", "navidad", "colombia", "bosque"].includes(savedTheme) ? savedTheme : "samurai";
  });
  // Opciones e historial de la partida usan sessionStorage; se limitan a la sesión del navegador.
  const [mode, setModeState] = useState(() => sessionStorage.getItem("modoJuego") || "individual");
  const [duration, setDurationState] = useState(() => Number(sessionStorage.getItem("duracionTiempo")) || 60);
  const [attempts, setAttemptsState] = useState(() => Math.min(10, Math.max(6, Number(sessionStorage.getItem("intentosMaximos")) || 6)));
  const [difficulty, setDifficulty] = useState(() => sessionStorage.getItem("dificultadPistas") || "facil");
  const [players, setPlayers] = useState(() => leerSesion("nombresJugadores", ["Jugador 1", "Jugador 2"]));
  const [playerAvatars, setPlayerAvatars] = useState(() => leerSesion("avataresJugadores", []));
  const [livesPerPlayer, setLivesPerPlayerState] = useState(() => Number(sessionStorage.getItem("vidasPorJugador")) || 2);
  const [lives, setLives] = useState(() => leerSesion("vidasJugadores", []));
  const [scores, setScores] = useState(() => {
    const previousScores = leerSesion("puntuacionJugadores", []);
    const previousHistory = leerSesion("historialPartidas", []);
    if (mode !== "duelo" || !previousHistory.length) return previousScores.length ? previousScores : leerPuntosLocales(players);
    return players.map(name => previousHistory
      .filter(round => round.jugador === name)
      .reduce((total, round) => total + calculatePoints(round), 0));
  });
  const [currentPlayer, setCurrentPlayer] = useState(() => Number(sessionStorage.getItem("indiceJugadorActual")) || 0);
  const [history, setHistory] = useState(() => leerSesion("historialPartidas", []));
  const [latestResult, setLatestResult] = useState(() => {
    const previousResult = leerSesion("ultimaPartida", null);
    return previousResult ? { ...previousResult, puntos: calculatePoints(previousResult) } : null;
  });
  const [categoryId, setCategoryId] = useState(() => localStorage.getItem("categoriaSeleccionada") || "");
  const [activeRound, setActiveRound] = useState(null);
  const [saveNotice, setSaveNotice] = useState("");
  const [categories, setCategories] = useState(() => Object.entries(datos.nombresCategorias).map(([id, name]) => ({ id, name, count: datos.bancoPalabras[id]?.length || 0 })));

  useEffect(() => {
    api.getCategories()
      .then(items => setCategories(items.map(({ id, nombre, cantidad }) => ({ id, name: nombre, count: cantidad }))))
      .catch(() => {});
  }, []);
  useEffect(() => { sessionStorage.setItem("modoJuego", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("temaVisual", theme); }, [theme]);
  useEffect(() => { sessionStorage.setItem("duracionTiempo", String(duration)); }, [duration]);
  useEffect(() => { sessionStorage.setItem("intentosMaximos", String(attempts)); }, [attempts]);
  useEffect(() => { sessionStorage.setItem("dificultadPistas", difficulty); }, [difficulty]);
  useEffect(() => { sessionStorage.setItem("nombresJugadores", JSON.stringify(players)); }, [players]);
  useEffect(() => { sessionStorage.setItem("avataresJugadores", JSON.stringify(playerAvatars)); }, [playerAvatars]);
  useEffect(() => { sessionStorage.setItem("vidasPorJugador", String(livesPerPlayer)); }, [livesPerPlayer]);
  useEffect(() => { sessionStorage.setItem("vidasJugadores", JSON.stringify(lives)); }, [lives]);
  useEffect(() => { sessionStorage.setItem("puntuacionJugadores", JSON.stringify(scores)); }, [scores]);
  useEffect(() => { sessionStorage.setItem("indiceJugadorActual", String(currentPlayer)); }, [currentPlayer]);
  useEffect(() => { sessionStorage.setItem("historialPartidas", JSON.stringify(history)); }, [history]);
  useEffect(() => {
    if (latestResult) sessionStorage.setItem("ultimaPartida", JSON.stringify(latestResult));
    else sessionStorage.removeItem("ultimaPartida");
  }, [latestResult]);

  const setMode = useCallback(next => {
    setModeState(next);
    if (multiplayerModes.includes(next) && mode !== next) {
      setCurrentPlayer(0);
      setScores(Array(players.length).fill(0));
    }
    if (next === "eliminacion" && mode !== next) setLives(Array(players.length).fill(livesPerPlayer));
  }, [mode, players.length, livesPerPlayer]);

  const setTheme = useCallback(nextTheme => {
    if (["samurai", "navidad", "colombia", "bosque"].includes(nextTheme)) setThemeState(nextTheme);
  }, []);

  const setAttempts = useCallback(value => setAttemptsState(Math.min(10, Math.max(6, Number(value) || 6))), []);
  const setLivesPerPlayer = useCallback(value => {
    const amount = Math.min(3, Math.max(1, Number(value) || 1));
    setLivesPerPlayerState(amount);
    setLives(Array(players.length).fill(amount));
  }, [players.length]);

  const updatePlayers = useCallback((nextPlayers, nextAvatars = [], nextLives = livesPerPlayer) => {
    setPlayers(nextPlayers);
    setPlayerAvatars(nextAvatars);
    setLivesPerPlayerState(nextLives);
    setScores(previous => {
      const sameRoster = players.length === nextPlayers.length && players.every((name, index) => name === nextPlayers[index]);
      return sameRoster ? previous : leerPuntosLocales(nextPlayers);
    });
    setLives(Array(nextPlayers.length).fill(nextLives));
    setCurrentPlayer(0);
  }, [players, livesPerPlayer]);

  // Obtiene las palabras, aplica la dificultad y prepara una palabra nueva para la pantalla de juego.
  const startRound = useCallback(async (nextCategory = categoryId) => {
    const words = await api.getWords(nextCategory).catch(() => datos.bancoPalabras[nextCategory] || []);
    if (!words?.length) return;
    const lastWord = localStorage.getItem(`ultimaPalabra-${nextCategory}`);
    const wordLength = item => [...item.palabra].filter(letter => /[A-ZÑÁÉÍÓÚÜ]/i.test(letter)).length;
    const byDifficulty = words.filter(item => {
      const length = wordLength(item);
      if (difficulty === "facil") return length <= 7;
      if (difficulty === "dificil") return length >= 8;
      return length >= 6 && length <= 10;
    });
    const pool = byDifficulty.length ? byDifficulty : words;
    const withoutRepeat = pool.length > 1 ? pool.filter(item => item.palabra !== lastWord) : pool;
    const available = withoutRepeat.length ? withoutRepeat : pool;
    const selected = available[Math.floor(Math.random() * available.length)];
    localStorage.setItem(`ultimaPalabra-${nextCategory}`, selected.palabra);
    localStorage.setItem("categoriaSeleccionada", nextCategory);
    setCategoryId(nextCategory);
    setLatestResult(null);
    setSaveNotice("");
    setActiveRound({ ...selected, roundId: `${Date.now()}-${Math.random().toString(16).slice(2)}`, categoryId: nextCategory, categoryName: categories.find(item => item.id === nextCategory)?.name || datos.nombresCategorias[nextCategory] || nextCategory });
    navigate("/juego");
  }, [categoryId, categories, difficulty, navigate]);

  // Centraliza el cierre de una ronda: resultado, marcador y guardado local/remoto.
  const finishRound = useCallback(result => {
    const partida = { ...result, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, creadaEn: new Date().toISOString() };
    setLatestResult(partida);
    setHistory(previous => [...previous, partida]);
    if (multiplayerModes.includes(mode) && partida.gano) {
      setScores(previous => {
        const next = players.map((_, index) => (Number(previous[index]) || 0) + (index === currentPlayer ? partida.puntos : 0));
        try {
          const saved = JSON.parse(localStorage.getItem("puntosPorJugadorLocal") || "{}");
          players.forEach((name, index) => { saved[idDeJugador(name)] = next[index]; });
          localStorage.setItem("puntosPorJugadorLocal", JSON.stringify(saved));
        } catch { /* El marcador de sesión sigue disponible si el almacenamiento local está lleno. */ }
        return next;
      });
    }
    if (mode === "eliminacion" && !partida.gano) {
      setLives(previous => previous.map((remaining, index) => index === currentPlayer ? Math.max(0, (Number(remaining) || livesPerPlayer) - 1) : remaining));
    }
    api.saveRound({
      ...partida,
      categoria: partida.categoryId,
      jugador: partida.jugador,
      jugadorId: multiplayerModes.includes(mode) ? idDeJugador(partida.jugador) : idLocal()
    }, token).then(async () => {
      if (partida.gano && user) {
        const account = await awardPoints({ roundId: partida.id, gano: partida.gano, errores: partida.errores, intentosMaximos: partida.intentosMaximos, modo: partida.modo, tiempoRestante: partida.tiempoRestante });
        setSaveNotice(account ? `¡Partida guardada! Tienes ${account.puntos} puntos y ${account.desbloqueos.length} recompensas desbloqueadas.` : "¡Partida guardada correctamente!");
      } else setSaveNotice("¡Partida guardada correctamente!");
    }).catch(() => setSaveNotice("No pudimos guardar esta partida ahora. Puedes verla en el resumen de esta sesión."));
  }, [awardPoints, currentPlayer, livesPerPlayer, mode, players, token, user]);

  // En multijugador salta al siguiente participante que aún tenga vidas.
  const nextPlayer = useCallback(() => {
    if (multiplayerModes.includes(mode)) {
      const eligible = players.map((_, index) => index).filter(index => mode !== "eliminacion" || (Number(lives[index]) || 0) > 0);
      if (eligible.length <= 1) return;
      const currentPosition = eligible.indexOf(currentPlayer);
      setCurrentPlayer(eligible[(currentPosition + 1 + eligible.length) % eligible.length]);
    }
    startRound();
  }, [currentPlayer, lives, mode, players, startRound]);

  const finishSession = useCallback(() => {
    setActiveRound(null);
    navigate("/resultados");
  }, [navigate]);

  const newSession = useCallback(() => {
    sessionStorage.clear();
    setModeState("individual");
    setDurationState(60);
    setAttemptsState(6);
    setDifficulty("facil");
    setPlayers(["Jugador 1", "Jugador 2"]);
    setPlayerAvatars([]);
    setLivesPerPlayerState(2);
    setLives([]);
    setScores(leerPuntosLocales(players));
    setCurrentPlayer(0);
    setHistory([]);
    setLatestResult(null);
    setActiveRound(null);
    setSaveNotice("");
    navigate("/");
  }, [navigate]);

  const remainingPlayers = players.map((name, index) => ({ name, index, avatar: playerAvatars[index] || "🐱", lives: Number(lives[index] ?? livesPerPlayer) }))
    .filter(player => mode !== "eliminacion" || player.lives > 0);
  const matchWinner = mode === "eliminacion" && history.length && remainingPlayers.length === 1 ? remainingPlayers[0] : null;

  const value = useMemo(() => ({
    mode, setMode, duration, setDuration: setDurationState, attempts, setAttempts, difficulty, setDifficulty,
    players, playerAvatars, updatePlayers, lives, livesPerPlayer, setLivesPerPlayer, remainingPlayers, matchWinner,
    scores, currentPlayer, history, latestResult, categoryId, setCategoryId,
    activeRound, startRound, finishRound, nextPlayer, finishSession, saveNotice, newSession,
    categories, theme, setTheme
  }), [mode, setMode, duration, attempts, setAttempts, difficulty, players, playerAvatars, updatePlayers, lives, livesPerPlayer, setLivesPerPlayer, remainingPlayers, matchWinner, scores, currentPlayer, history, latestResult,
    categoryId, activeRound, startRound, finishRound, nextPlayer, finishSession, saveNotice, newSession, categories, theme]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook de acceso: las páginas usan el contexto sin importar cómo se implementa su almacenamiento.
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame debe usarse dentro de GameProvider.");
  return context;
}







