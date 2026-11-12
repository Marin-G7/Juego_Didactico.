import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import { useGame } from "../context/GameContext.jsx";
import { CatReaction, HangmanDrawing } from "../components/SiteLayout.jsx";
import { calculatePoints } from "../services/scoring.js";
import { useAuth } from "../context/AuthContext.jsx";
import { rewards } from "../data/rewards.js";

const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const multiplayerModes = ["duelo", "formar-duelo", "eliminacion"];
const formationModes = ["formar", "formar-duelo"];

// Convierte vocales acentuadas en letras base, pero conserva la Ñ como letra distinta.
function normalize(text) {
  return text.toLocaleUpperCase("es").replace(/Ñ/g, "\u0001")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0001/g, "Ñ");
}
function shuffle(text) {
  const letters = [...text];
  for (let index = letters.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [letters[index], letters[other]] = [letters[other], letters[index]];
  }
  return letters;
}

export default function GamePage() {
  const { mode, duration, attempts, difficulty, players, playerAvatars, scores, currentPlayer, lives, livesPerPlayer, activeRound, finishRound, finishSession } = useGame();
  const { user } = useAuth();
  const activeReward = rewards.find(reward => reward.id === user?.recompensaActiva);
  const multiplayer = multiplayerModes.includes(mode);
  const formation = formationModes.includes(mode);
  const timed = mode === "tiempo" || formation;
  const definitionAllowed = ["individual", "tiempo", "formar"].includes(mode);
  const [guessed, setGuessed] = useState(() => new Set());
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(duration);
  const [definitionHint, setDefinitionHint] = useState(false);
  const [letterHint, setLetterHint] = useState(false);
  const [challengeHint, setChallengeHint] = useState(false);
  const [formedLetters, setFormedLetters] = useState([]);
  const [status, setStatus] = useState("");
  const [reaction, setReaction] = useState("pensando");
  const [catMessage, setCatMessage] = useState("¡A ver si encuentras la palabra!");
  const [finished, setFinished] = useState(false);
  // Los refs permiten que teclado/temporizador consulten el valor actual sin esperar otro render.
  const finishedRef = useRef(false);
  const mistakesRef = useRef(0);

  const normalizedWord = useMemo(() => normalize(activeRound?.palabra || ""), [activeRound]);
  const answerLetters = useMemo(() => [...normalizedWord].filter(letter => /[A-ZÑ]/.test(letter)), [normalizedWord]);
  const letters = useMemo(() => [...new Set(answerLetters)], [answerLetters]);
  const mixedLetters = useMemo(() => shuffle(answerLetters), [activeRound?.roundId, answerLetters]);
  const playerName = multiplayer ? players[currentPlayer] || `Jugador ${currentPlayer + 1}` : "Tú";
  const rankedPlayers = players.map((name, index) => ({ name, avatar: playerAvatars[index] || "🐱", points: Number(scores[index]) || 0, lives: Number(lives[index]) || livesPerPlayer }))
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
    const points = calculatePoints({ gano: won, errores: finalMistakes, intentosMaximos: attempts, modo: mode, tiempoRestante: seconds });
    finishRound({
      palabra: activeRound.palabra, definicion: activeRound.definicion, datoCurioso: activeRound.datoCurioso,
      fuenteDato: activeRound.fuenteDato, categoryId: activeRound.categoryId, categoriaNombre: activeRound.categoryName,
      gano: won, jugador: playerName, jugadorIndice: currentPlayer, avatar: playerAvatars[currentPlayer],
      puntos: points, errores: finalMistakes, intentosMaximos: attempts, modo: mode,
      tiempoRestante: timed ? seconds : null
    });
  }, [activeRound, attempts, currentPlayer, finishRound, mode, playerAvatars, playerName, seconds, timed]);

  useEffect(() => {
    if (!timed || finished) return undefined;
    const timer = window.setTimeout(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [timed, seconds, finished]);

  useEffect(() => {
    if (timed && seconds === 0 && !finished) conclude(false, true);
  }, [timed, seconds, finished, conclude]);

  const recordMistake = useCallback(message => {
    if (finishedRef.current) return;
    const next = Math.min(attempts, mistakesRef.current + 1);
    mistakesRef.current = next;
    setMistakes(next);
    setReaction(next === 1 ? "indiferente" : next >= Math.ceil(attempts * .65) ? "enojado" : "error");
    setCatMessage(next >= Math.ceil(attempts * .65) ? "Uy, el gatito se está impacientando…" : "Mmm… prueba otra vez.");
    setStatus(message);
    if (next >= attempts) conclude(false);
  }, [attempts, conclude]);

  const guess = useCallback(rawLetter => {
    if (finishedRef.current || formation) return;
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
    recordMistake("");
  }, [conclude, formation, guessed, letters, recordMistake]);

  useEffect(() => {
    if (formation) return undefined;
    const handleKey = event => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || !/^[a-zñ]$/i.test(event.key)) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      guess(event.key);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [formation, guess]);

  const usePenalty = useCallback(cost => {
    if (finishedRef.current) return false;
    if (mistakesRef.current + cost >= attempts) {
      mistakesRef.current = attempts;
      setMistakes(attempts);
      conclude(false);
      return false;
    }
    mistakesRef.current += cost;
    setMistakes(mistakesRef.current);
    return true;
  }, [attempts, conclude]);

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
    if (!available.length || !usePenalty(2)) return;
    setLetterHint(true);
    const selected = available[Math.floor(Math.random() * available.length)];
    guess(selected);
    if (!finishedRef.current) setStatus("Letra revelada; perdiste dos intentos.");
  };
  const revealChallengeHint = () => {
    if (challengeHint || !usePenalty(1)) return;
    setChallengeHint(true);
    setStatus(`Pista: la palabra tiene ${answerLetters.length} letras y termina en «${answerLetters.at(-1)}». (−1 intento)`);
    setReaction("pensando");
    setCatMessage("Una pista pequeña para mantener el reto… ✨");
  };
  const addFormLetter = index => {
    if (finished || formedLetters.some(item => item.index === index)) return;
    setFormedLetters(previous => [...previous, { letter: mixedLetters[index], index }]);
  };
  const checkFormation = () => {
    if (finished || !formedLetters.length) return;
    if (formedLetters.map(item => item.letter).join("") === answerLetters.join("")) conclude(true);
    else {
      setFormedLetters([]);
      recordMistake("Esa combinación no forma la palabra. Perdiste un intento.");
    }
  };
  const clearFormation = () => setFormedLetters([]);

  if (!activeRound) return <Navigate to="/categorias" replace />;
  const shownWord = [...activeRound.palabra].map(letter => {
    if (!/[A-ZÑÁÉÍÓÚÜ]/i.test(letter)) return letter;
    return guessed.has(normalize(letter)) || finished ? letter : "_";
  }).join(" ");
  const spokenWord = [...activeRound.palabra].map(letter => /[A-ZÑÁÉÍÓÚÜ]/i.test(letter)
    ? guessed.has(normalize(letter)) || finished ? letter : "casilla oculta"
    : letter).join(", ");
  const reactionName = timed && seconds <= 10 && !finished ? "enojado" : reaction;
  const difficultyLabel = { facil: "Fácil", normal: "Normal", dificil: "Difícil" }[difficulty] || "Fácil";

  return <section className="game-page">
    <div className="game-heading"><span className="eyebrow">🎴 {activeRound.categoryName.toLocaleUpperCase("es")} 🎴</span><h1>{formation ? "¡Forma la palabra!" : "¡Adivina la palabra!"}</h1>
      {multiplayer && <span className="turn-pill">{playerAvatars[currentPlayer] || "🐱"} Turno de {playerName}</span>}
      {timed && <span role="timer" aria-label={`Tiempo restante: ${seconds} segundos`} className={`timer-pill ${seconds <= 10 ? "urgent" : ""}`}>⏱️ {seconds} s</span>}
      <span className="difficulty-pill">🎚️ Dificultad: {difficultyLabel}</span>
      {mode === "eliminacion" && <div className="elimination-lives" aria-live="polite">{players.map((name, index) => <span className={Number(lives[index]) > 0 ? "" : "is-eliminated"} key={`${name}-${index}`}>{playerAvatars[index] || "🐱"} {name} · {"❤️".repeat(Math.max(0, Number(lives[index]) || 0)) || "☠️"}</span>)}</div>}
      {multiplayer && <div className="game-score-summary" aria-label="Resumen del marcador">
        <span>⭐ {playerName}: {Number(scores[currentPlayer]) || 0} pts</span>
        {roundLeader && (roundLeader.points === 0 ? <span>✨ Todavía no hay puntos</span> : roundLeaders.length > 1 ? <span>🤝 Empate: {roundLeaders.map(player => player.name).join(" y ")}</span> : <span>🏆 Va ganando {roundLeader.name}: {roundLeader.points} pts</span>)}
        <Link to="/resultados">Ver marcador completo →</Link>
      </div>}
    </div>
    <div className="game-layout"><section className="game-board">
      <div className="hangman-stage"><HangmanDrawing mistakes={mistakes} maxMistakes={attempts} /><div className="mistake-counter" aria-live="polite" aria-atomic="true">Errores <strong>{mistakes}/{attempts}</strong></div></div>
      <div className="play-area">
        <p className="category-label">Categoría: <strong>{activeRound.categoryName}</strong></p>
        {definitionAllowed && <div className="definition-box" aria-live="polite">{definitionHint || finished ? activeRound.definicion : formation ? "Ordena las letras; al terminar podrás leer la explicación." : "Adivina la palabra. Puedes usar una pista según la dificultad."}</div>}
        {!formation && <p className="hidden-word" aria-live="polite" aria-atomic="true"><span aria-hidden="true">{shownWord}</span><span className="visually-hidden">Palabra: {spokenWord}</span></p>}
        {formation ? <>
          <p className="keyboard-help">🔤 Toca las letras mezcladas para formar la respuesta.</p>
          <div className="formed-word" aria-label="Letras seleccionadas">{formedLetters.length ? formedLetters.map((item, index) => <button type="button" className="formed-letter" key={`${item.index}-${index}`} onClick={() => setFormedLetters(previous => previous.filter((_, position) => position !== index))} aria-label={`Quitar letra ${item.letter}`}>{item.letter}</button>) : <span>Tu palabra aparecerá aquí</span>}</div>
          <div className="letter-board formation-board" role="group" aria-label="Letras mezcladas">{mixedLetters.map((letter, index) => <button type="button" key={`${index}-${letter}`} onClick={() => addFormLetter(index)} disabled={finished || formedLetters.some(item => item.index === index)}>{letter}</button>)}</div>
          <div className="round-actions"><button className="button button-soft" onClick={clearFormation} disabled={finished || !formedLetters.length}>↩️ Limpiar</button><button className="button button-gold" onClick={checkFormation} disabled={finished || !formedLetters.length}>✅ Comprobar</button></div>
        </> : <>
          <p className="keyboard-help">⌨️ Usa las letras del teclado o toca una letra.</p>
          <div className="letter-board" role="group" aria-label="Letras para adivinar">{alphabet.map(letter => <button type="button" key={letter} aria-label={`Probar la letra ${letter}`} aria-pressed={guessed.has(letter)} onClick={() => guess(letter)} disabled={finished || guessed.has(letter)} className={guessed.has(letter) ? (letters.includes(letter) ? "letter-hit" : "letter-miss") : ""}>{letter}</button>)}</div>
        </>}
        <p className="game-status" aria-live="polite">{status || " "}</p>
        {difficulty === "facil" && <div className="hint-row">{definitionAllowed && <button className="button button-soft" onClick={revealDefinition} disabled={definitionHint || finished}>💡 Ver definición <small>−1 intento</small></button>}<button className="button button-soft" onClick={revealLetter} disabled={letterHint || finished}>🔎 Revelar letra <small>−2 intentos</small></button></div>}
        {difficulty === "normal" && <div className="hint-row"><button className="button button-soft" onClick={revealChallengeHint} disabled={challengeHint || finished}>🧩 Pista sutil <small>−1 intento</small></button></div>}
        {difficulty === "dificil" && <p className="no-hints-label">🚫 Modo difícil: esta ronda no permite pistas.</p>}
        <div className="round-actions">{finished && <Link className="button button-plum" to="/resultados">Ver resultado ✨</Link>}<button type="button" className="button button-outline finish-session-button" onClick={() => { if (window.confirm("¿Finalizar la sesión ahora? La ronda en curso no se guardará.")) finishSession(); }}>⏹️ Finalizar sesión</button></div>
      </div>
      {activeReward && <p className="active-reward-badge" title="Recompensa equipada en tu cuenta">🎁 {activeReward.icon} {activeReward.title}</p>}
      <CatReaction name={reactionName} caption={catMessage} className="game-cat" />
    </section></div>
  </section>;
}
