import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import { useGame } from "../context/GameContext.jsx";
import { CatReaction, HangmanDrawing } from "../components/SiteLayout.jsx";
import { calculatePoints } from "../services/scoring.js";

const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const maxMistakes = 6;
function normalize(text) {
  return text.toLocaleUpperCase("es").replace(/Ñ/g, "\u0001")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0001/g, "Ñ");
}

export default function GamePage() {
  const { mode, duration, players, scores, currentPlayer, activeRound, finishRound } = useGame();
  const [guessed, setGuessed] = useState(() => new Set());
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(duration);
  const [definitionHint, setDefinitionHint] = useState(false);
  const [letterHint, setLetterHint] = useState(false);
  const [status, setStatus] = useState("");
  const [reaction, setReaction] = useState("pensando");
  const [catMessage, setCatMessage] = useState("¡A ver si encuentras la palabra!");
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const mistakesRef = useRef(0);

  const normalizedWord = useMemo(() => normalize(activeRound?.palabra || ""), [activeRound]);
  const letters = useMemo(() => [...new Set([...normalizedWord].filter(letter => /[A-ZÑ]/.test(letter)))], [normalizedWord]);
  const playerName = mode === "duelo" ? players[currentPlayer] || `Jugador ${currentPlayer + 1}` : "Tú";
  const rankedPlayers = players.map((name, index) => ({ name, points: Number(scores[index]) || 0 }))
    .sort((a, b) => b.points - a.points);
  const roundLeader = rankedPlayers[0];
  const roundLeaders = rankedPlayers.filter(player => player.points === roundLeader?.points);

  const conclude = useCallback((won, timedOut = false) => {
    if (!activeRound || finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    setStatus(won ? `¡${playerName} resolvió la palabra!` : timedOut ? `¡Se acabó el tiempo! La palabra era ${activeRound.palabra}.` : `¡Casi! La palabra era ${activeRound.palabra}.`);
    setReaction(won ? "orgulloso" : "derrota");
    setCatMessage(won ? "¡Qué jugada tan brillante!" : "El gato ya planea la revancha…");
    const finalMistakes = mistakesRef.current;
    const points = calculatePoints({ gano: won, errores: finalMistakes, modo: mode, tiempoRestante: seconds });
    finishRound({
      palabra: activeRound.palabra,
      definicion: activeRound.definicion,
      datoCurioso: activeRound.datoCurioso,
      fuenteDato: activeRound.fuenteDato,
      categoryId: activeRound.categoryId,
      categoriaNombre: activeRound.categoryName,
      gano: won,
      jugador: playerName,
      jugadorIndice: currentPlayer,
      puntos: points,
      errores: finalMistakes,
      modo: mode,
      tiempoRestante: mode === "tiempo" ? seconds : null
    });
  }, [activeRound, currentPlayer, finishRound, mode, playerName, seconds]);

  useEffect(() => {
    if (mode !== "tiempo" || finished) return undefined;
    const timer = window.setTimeout(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [mode, seconds, finished]);

  useEffect(() => {
    if (mode === "tiempo" && seconds === 0 && !finished) conclude(false, true);
  }, [mode, seconds, finished, conclude]);

  const guess = useCallback(rawLetter => {
    if (finishedRef.current) return;
    const letter = normalize(rawLetter);
    if (guessed.has(letter)) return;
    const nextGuessed = new Set(guessed);
    nextGuessed.add(letter);
    setGuessed(nextGuessed);

    if (letters.includes(letter)) {
      setReaction("acierto");
      setCatMessage("¡Sí! Esa letra estaba escondida.");
      setStatus("");
      if (letters.every(item => nextGuessed.has(item))) conclude(true);
      return;
    }

    const nextMistakes = mistakesRef.current + 1;
    mistakesRef.current = nextMistakes;
    setMistakes(nextMistakes);
    const mood = nextMistakes === 1 ? "indiferente" : nextMistakes >= 4 ? "enojado" : "error";
    setReaction(mood);
    setCatMessage(nextMistakes >= 4 ? "Uy, el gatito se está impacientando…" : "Mmm… esa letra no era.");
    if (nextMistakes >= maxMistakes) conclude(false);
  }, [conclude, guessed, letters]);

  useEffect(() => {
    const handleKey = event => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || !/^[a-zñ]$/i.test(event.key)) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      guess(event.key);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [guess]);

  const usePenalty = cost => {
    if (finishedRef.current || mistakesRef.current + cost >= maxMistakes) {
      if (!finishedRef.current) {

        mistakesRef.current = maxMistakes;
        setMistakes(maxMistakes);
        conclude(false);
      }
      return false;
    }
    mistakesRef.current += cost;
    setMistakes(mistakesRef.current);
    return true;
  };

  const revealDefinition = () => {
    if (definitionHint || !usePenalty(1)) return;
    setDefinitionHint(true);
    setStatus("Usaste la pista: perdiste un intento.");
    setReaction("pensando");
    setCatMessage("¡Una pista gratis no iba a ser! 😼");
  };

  const revealLetter = () => {
    if (letterHint || finishedRef.current) return;
    const available = letters.filter(letter => !guessed.has(letter));
    if (!available.length) return;
    if (!usePenalty(2)) return;
    setLetterHint(true);
    const selected = available[Math.floor(Math.random() * available.length)];
    guess(selected);
    if (!finishedRef.current) setStatus("Letra revelada; perdiste dos intentos.");
  };

  if (!activeRound) return <Navigate to="/categorias" replace />;
  const shownWord = [...activeRound.palabra].map(letter => {
    if (!/[A-ZÑÁÉÍÓÚÜ]/i.test(letter)) return letter;
    return guessed.has(normalize(letter)) || finished ? letter : "_";
  }).join(" ");
  const spokenWord = [...activeRound.palabra].map(letter => /[A-ZÑÁÉÍÓÚÜ]/i.test(letter)
    ? guessed.has(normalize(letter)) || finished ? letter : "casilla oculta"
    : letter).join(", ");
  const reactionName = mode === "tiempo" && seconds <= 10 && !finished ? "enojado" : reaction;

  return <section className="game-page">
    <div className="game-heading"><span className="eyebrow">🌸 {activeRound.categoryName.toLocaleUpperCase("es")} 🌸</span><h1>¡Adivina la palabra!</h1>
      {mode === "duelo" && <span className="turn-pill">🎏 Turno de {playerName}</span>}
      {mode === "tiempo" && <span role="timer" aria-label={`Tiempo restante: ${seconds} segundos`} className={`timer-pill ${seconds <= 10 ? "urgent" : ""}`}>⏱️ {seconds} s</span>}
      {mode === "duelo" && <div className="game-score-summary" aria-label="Resumen del marcador">
        <span>⭐ {playerName}: {Number(scores[currentPlayer]) || 0} pts</span>
        {roundLeader && (roundLeader.points === 0
          ? <span>✨ Todavía no hay puntos</span>
          : roundLeaders.length > 1
            ? <span>🤝 Empate: {roundLeaders.map(player => player.name).join(" y ")}</span>
            : <span>🏆 Va ganando {roundLeader.name}: {roundLeader.points} pts</span>)}
        <Link to="/resultados">Ver marcador completo →</Link>
      </div>}
    </div>
    <div className="game-layout">
      <section className="game-board">
        <div className="hangman-stage"><HangmanDrawing mistakes={mistakes} /><div className="mistake-counter" aria-live="polite" aria-atomic="true">Errores <strong>{mistakes}/{maxMistakes}</strong></div></div>
        <div className="play-area">
          <p className="category-label">Tema: <strong>{activeRound.categoryName}</strong></p>
          <div className="definition-box" aria-live="polite">{definitionHint || finished ? activeRound.definicion : "Adivina la palabra o usa una pista si la necesitas."}</div>
          <p className="hidden-word" aria-live="polite" aria-atomic="true"><span aria-hidden="true">{shownWord}</span><span className="visually-hidden">Palabra: {spokenWord}</span></p>
          <p className="keyboard-help">⌨️ Usa las letras del teclado o toca una letra.</p>
          <p className="game-status" aria-live="polite">{status || " "}</p>
          <div className="hint-row">
            <button className="button button-soft" onClick={revealDefinition} disabled={definitionHint || finished}>💡 Ver definición <small>−1 intento</small></button>
            <button className="button button-soft" onClick={revealLetter} disabled={letterHint || finished}>🔎 Revelar letra <small>−2 intentos</small></button>
          </div>
          <div className="letter-board" role="group" aria-label="Letras para adivinar">
            {alphabet.map(letter => <button type="button" key={letter} aria-label={`Probar la letra ${letter}`} aria-pressed={guessed.has(letter)} onClick={() => guess(letter)} disabled={finished || guessed.has(letter)} className={`${guessed.has(letter) ? (letters.includes(letter) ? "letter-hit" : "letter-miss") : ""} ${letterHint && guessed.has(letter) && letters.includes(letter) ? "letter-revealed" : ""}`}>{letter}</button>)}
          </div>
          <div className="round-actions">
            {finished && <Link className="button button-plum" to="/resultados">Ver resultado ✨</Link>}
          </div>
        </div>
        <CatReaction name={reactionName} caption={catMessage} className="game-cat" />
      </section>
    </div>
  </section>;
}






