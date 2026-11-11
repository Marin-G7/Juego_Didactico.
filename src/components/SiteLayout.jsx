import { NavLink } from "react-router";
import { useEffect, useRef, useState } from "react";
import { api } from "../services/api.js";
import { useGame } from "../context/GameContext.jsx";

export function SiteLayout({ children }) {
  const { theme } = useGame();
  const styleSymbols = { samurai: "⛩️", navidad: "🎄", colombia: "☀️", bosque: "🌲" };
  const pageSymbols = {
    samurai: ["🎴", "🏮", "⛩️", "🎋", "☀️", "🗡️"],
    navidad: ["❄️", "🎄", "⭐", "🎁", "🔔", "🕯️"],
    colombia: ["🌺", "🦜", "☕", "🌻", "☀️", "🦋"],
    bosque: ["🍃", "🦋", "🍄", "🪵", "🌼", "🌙"]
  }[theme] || ["🎴", "🏮", "⛩️", "🎋", "☀️", "🗡️"];
  const [atlas, setAtlas] = useState("consultando");
  useEffect(() => {
    api.health().then(data => setAtlas(data.atlas)).catch(() => setAtlas("API apagada"));
  }, []);
  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="page-edge-decor" aria-hidden="true">
        {pageSymbols.map((symbol, index) => <span className={`page-edge-mark edge-mark-${index + 1}`} key={`${symbol}-${index}`}>{symbol}</span>)}
      </div>
      <header className="topbar">
        <NavLink className="brand" to="/"><span className="brand-seal" aria-hidden="true">{styleSymbols[theme] || "猫"}</span><span>Gatito Ahorcado<small>APRENDE JUGANDO</small></span></NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink><NavLink to="/categorias">Jugar</NavLink><NavLink to="/resultados">Resultados</NavLink>
        </nav>
        <MusicToggle theme={theme} />
        <span className={`api-badge ${atlas === "conectado" ? "api-ok" : ""}`} title="Estado de la conexión con el servidor">
          <i /> {atlas === "conectado" ? "Atlas conectado" : atlas === "sin configurar" ? "Modo local" : atlas}
        </span>
      </header>
      <main className="page-content">{children}</main>
      <footer className="page-footer">🐾 ¡Tu próxima aventura empieza con una palabra! <span aria-hidden="true">{styleSymbols[theme] || "✨"}</span></footer>
    </div>
  );
}

function MusicToggle({ theme }) {
  const [enabled, setEnabled] = useState(false);
  const audioContext = useRef(null);
  useEffect(() => () => { audioContext.current?.close(); }, []);
  useEffect(() => {
    if (!enabled || !audioContext.current) return undefined;
    const context = audioContext.current;
    const notes = {
      samurai: [392, 440, 587, 523, 440, 392, 330, 392],
      navidad: [523, 659, 784, 659, 587, 698, 880, 698],
      colombia: [392, 494, 587, 659, 587, 494, 440, 494],
      bosque: [330, 392, 440, 523, 440, 392, 349, 392]
    }[theme] || [392, 440, 587, 523, 440, 392, 330, 392];
    let noteIndex = 0;
    const playNote = () => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex % notes.length];
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.72);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.75);
      noteIndex++;
    };
    playNote();
    const interval = window.setInterval(playNote, 800);
    return () => window.clearInterval(interval);
  }, [enabled, theme]);
  const toggle = async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext.current) audioContext.current = new AudioContextClass();
    if (enabled) await audioContext.current.suspend();
    else await audioContext.current.resume();
    setEnabled(value => !value);
  };
  return <button type="button" className="music-toggle" aria-pressed={enabled} onClick={toggle} title="Música ambiental original del juego">{enabled ? "🔊 Música" : "🎵 Música"}</button>;
}

export function CatReaction({ name = "normal", caption, className = "" }) {
  const labels = { normal: "Gatito curioso", pensando: "Gatito pensando", acierto: "¡Gatito sorprendido!", error: "Gatito dudando", enojado: "Gatito enojado", indiferente: "Gatito indiferente", orgulloso: "Gatito orgulloso", derrota: "Gatito derrotado" };
  return <figure className={`cat-card ${className}`}>
    <img src={`/assets/gato/${name}.png`} alt={labels[name] || labels.normal} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

export function HangmanDrawing({ mistakes, maxMistakes = 6 }) {
  const stage = order => ({ opacity: mistakes >= Math.ceil(maxMistakes * order / Math.max(6, maxMistakes)) ? 1 : 0 });
  return <svg className="hangman" viewBox="0 0 200 200" role="img" aria-label={`Dibujo del ahorcado, ${mistakes} errores`}>
    <circle className="samurai-sun" cx="145" cy="105" r="43" />
    <path className="gallows" d="M25 180h110M55 180V25h90M145 25v24" />
    <path className="gallows-accent" d="M49 25h107M138 25v9" />
    <circle className="body-part" style={stage(1)} cx="145" cy="65" r="16" />
    <path className="body-part" style={stage(2)} d="M145 81v42" />
    <path className="body-part" style={stage(3)} d="m145 91-25 22" />
    <path className="body-part" style={stage(4)} d="m145 91 25 22" />
    <path className="body-part" style={stage(5)} d="m145 123-24 34" />
    <path className="body-part" style={stage(6)} d="m145 123 24 34" />
    <circle className="body-part extra-part" style={stage(7)} cx="139" cy="63" r="1.7" />
    <circle className="body-part extra-part" style={stage(8)} cx="151" cy="63" r="1.7" />
    <path className="body-part extra-part" style={stage(9)} d="M141 72q4 4 8 0" />
    <path className="body-part extra-part" style={stage(10)} d="M130 54h30" />
  </svg>;
}
