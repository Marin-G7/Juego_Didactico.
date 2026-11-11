import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import datos from "../data/palabras.json";
import { api } from "../services/api.js";
import { calculatePoints } from "../services/scoring.js";

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
const idLocal = () => {
  let id = localStorage.getItem("jugadorLocalId");
  if (!id) { id = `local-${crypto.randomUUID()}`; localStorage.setItem("jugadorLocalId", id); }
  return id;
};

export function GameProvider({ children }) {
  const navigate = useNavigate();
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem("temaVisual");
    return ["samurai", "navidad", "colombia", "bosque"].includes(savedTheme) ? savedTheme : "samurai";
  });
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
    if (mode !== "duelo" || !previousHistory.length) return previousScores;
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
      return sameRoster ? previous : Array(nextPlayers.length).fill(0);
    });
    setLives(Array(nextPlayers.length).fill(nextLives));
    setCurrentPlayer(0);
  }, [players, livesPerPlayer]);

  const startRound = useCallback(async (nextCategory = categoryId) => {
    const words = await api.getWords(nextCategory).catch(() => datos.bancoPalabras[nextCategory] || []);
    if (!words?.length) return;
    const lastWord = localStorage.getItem(`ultimaPalabra-${nextCategory}`);
    const available = words.length > 1 ? words.filter(item => item.palabra !== lastWord) : words;
    const selected = available[Math.floor(Math.random() * available.length)];
    localStorage.setItem(`ultimaPalabra-${nextCategory}`, selected.palabra);
    localStorage.setItem("categoriaSeleccionada", nextCategory);
    setCategoryId(nextCategory);
    setLatestResult(null);
    setSaveNotice("");
    setActiveRound({ ...selected, roundId: `${Date.now()}-${Math.random().toString(16).slice(2)}`, categoryId: nextCategory, categoryName: categories.find(item => item.id === nextCategory)?.name || datos.nombresCategorias[nextCategory] || nextCategory });
    navigate("/juego");
  }, [categoryId, categories, navigate]);

  const finishRound = useCallback(result => {
    const partida = { ...result, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, creadaEn: new Date().toISOString() };
    setLatestResult(partida);
    setHistory(previous => [...previous, partida]);
    if (multiplayerModes.includes(mode) && partida.gano) {
      setScores(previous => players.map((_, index) => (Number(previous[index]) || 0) + (index === currentPlayer ? partida.puntos : 0)));
    }
    if (mode === "eliminacion" && !partida.gano) {
      setLives(previous => previous.map((remaining, index) => index === currentPlayer ? Math.max(0, (Number(remaining) || livesPerPlayer) - 1) : remaining));
    }
    api.saveRound({
      ...partida,
      categoria: partida.categoryId,
      jugador: partida.jugador,
      jugadorId: multiplayerModes.includes(mode) ? idDeJugador(partida.jugador) : idLocal()
    }).then(() => setSaveNotice("Partida guardada en Atlas."))
      .catch(() => setSaveNotice("Partida guardada en esta pestaña. Configura Atlas para conservarla al cerrar."));
  }, [currentPlayer, livesPerPlayer, mode, players]);

  const nextPlayer = useCallback(() => {
    if (multiplayerModes.includes(mode)) {
      const eligible = players.map((_, index) => index).filter(index => mode !== "eliminacion" || (Number(lives[index]) || 0) > 0);
      if (eligible.length <= 1) return;
      const currentPosition = eligible.indexOf(currentPlayer);
      setCurrentPlayer(eligible[(currentPosition + 1 + eligible.length) % eligible.length]);
    }
    startRound();
  }, [currentPlayer, lives, mode, players, startRound]);

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
    setScores([]);
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
    activeRound, startRound, finishRound, nextPlayer, saveNotice, newSession,
    categories, theme, setTheme
  }), [mode, setMode, duration, attempts, setAttempts, difficulty, players, playerAvatars, updatePlayers, lives, livesPerPlayer, setLivesPerPlayer, remainingPlayers, matchWinner, scores, currentPlayer, history, latestResult,
    categoryId, activeRound, startRound, finishRound, nextPlayer, saveNotice, newSession, categories, theme]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame debe usarse dentro de GameProvider.");
  return context;
}







