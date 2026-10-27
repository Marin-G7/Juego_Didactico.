import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import datos from "../data/palabras.json";
import { api } from "../services/api.js";

const GameContext = createContext(null);
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
  const [mode, setModeState] = useState(() => sessionStorage.getItem("modoJuego") || "individual");
  const [duration, setDurationState] = useState(() => Number(sessionStorage.getItem("duracionTiempo")) || 60);
  const [players, setPlayers] = useState(() => leerSesion("nombresJugadores", ["Jugador 1", "Jugador 2"]));
  const [scores, setScores] = useState(() => leerSesion("puntuacionJugadores", []));
  const [currentPlayer, setCurrentPlayer] = useState(() => Number(sessionStorage.getItem("indiceJugadorActual")) || 0);
  const [history, setHistory] = useState(() => leerSesion("historialPartidas", []));
  const [latestResult, setLatestResult] = useState(() => leerSesion("ultimaPartida", null));
  const [categoryId, setCategoryId] = useState(() => localStorage.getItem("categoriaSeleccionada") || "");
  const [activeRound, setActiveRound] = useState(null);
  const [saveNotice, setSaveNotice] = useState("");
  const [categories, setCategories] = useState(() => Object.entries(datos.nombresCategorias).map(([id, name]) => ({ id, name, count: datos.bancoPalabras[id]?.length || 0 })));

  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { sessionStorage.setItem("modoJuego", mode); }, [mode]);
  useEffect(() => { sessionStorage.setItem("duracionTiempo", String(duration)); }, [duration]);
  useEffect(() => { sessionStorage.setItem("nombresJugadores", JSON.stringify(players)); }, [players]);
  useEffect(() => { sessionStorage.setItem("puntuacionJugadores", JSON.stringify(scores)); }, [scores]);
  useEffect(() => { sessionStorage.setItem("indiceJugadorActual", String(currentPlayer)); }, [currentPlayer]);
  useEffect(() => { sessionStorage.setItem("historialPartidas", JSON.stringify(history)); }, [history]);
  useEffect(() => {
    if (latestResult) sessionStorage.setItem("ultimaPartida", JSON.stringify(latestResult));
    else sessionStorage.removeItem("ultimaPartida");
  }, [latestResult]);

  const setMode = useCallback(next => {
    setModeState(next);
    if (next === "duelo" && mode !== "duelo") {
      setCurrentPlayer(0);
      setScores(Array(players.length).fill(0));
    }
  }, [mode, players.length]);

  const updatePlayers = useCallback(nextPlayers => {
    setPlayers(nextPlayers);
    setScores(previous => {
      const sameRoster = players.length === nextPlayers.length && players.every((name, index) => name === nextPlayers[index]);
      return sameRoster ? previous : Array(nextPlayers.length).fill(0);
    });
    setCurrentPlayer(0);
  }, [players]);

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
    setActiveRound({ ...selected, roundId: `${Date.now()}-${Math.random().toString(16).slice(2)}`, categoryId: nextCategory, categoryName: datos.nombresCategorias[nextCategory] });
    navigate("/juego");
  }, [categoryId, navigate]);

  const finishRound = useCallback(result => {
    const partida = { ...result, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, creadaEn: new Date().toISOString() };
    setLatestResult(partida);
    setHistory(previous => [...previous, partida]);
    if (mode === "duelo" && partida.gano) {
      setScores(previous => players.map((_, index) => (Number(previous[index]) || 0) + (index === currentPlayer ? partida.puntos : 0)));
    }
    api.saveRound({
      ...partida,
      categoria: partida.categoryId,
      jugador: partida.jugador,
      jugadorId: mode === "duelo" ? idDeJugador(partida.jugador) : idLocal()
    }).then(() => setSaveNotice("Partida guardada en Atlas."))
      .catch(() => setSaveNotice("Partida guardada en esta pestaña. Configura Atlas para conservarla al cerrar."));
  }, [currentPlayer, mode, players]);

  const nextPlayer = useCallback(() => {
    if (mode === "duelo") setCurrentPlayer(index => (index + 1) % players.length);
    startRound();
  }, [mode, players.length, startRound]);

  const newSession = useCallback(() => {
    sessionStorage.clear();
    setModeState("individual");
    setDurationState(60);
    setPlayers(["Jugador 1", "Jugador 2"]);
    setScores([]);
    setCurrentPlayer(0);
    setHistory([]);
    setLatestResult(null);
    setActiveRound(null);
    setSaveNotice("");
    navigate("/");
  }, [navigate]);

  const value = useMemo(() => ({
    mode, setMode, duration, setDuration: setDurationState, players, updatePlayers,
    scores, currentPlayer, history, latestResult, categoryId, setCategoryId,
    activeRound, startRound, finishRound, nextPlayer, saveNotice, newSession,
    categories
  }), [mode, setMode, duration, players, updatePlayers, scores, currentPlayer, history, latestResult,
    categoryId, activeRound, startRound, finishRound, nextPlayer, saveNotice, newSession, categories]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame debe usarse dentro de GameProvider.");
  return context;
}







