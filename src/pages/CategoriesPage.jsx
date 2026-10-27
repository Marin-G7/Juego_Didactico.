import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext.jsx";

const modos = [
  { id: "individual", icon: "🙋", title: "Aventura individual", note: "A tu propio ritmo" },
  { id: "duelo", icon: "🎏", title: "Equipo local", note: "De 2 a 10 por turnos" },
  { id: "tiempo", icon: "⏱️", title: "Contrarreloj", note: "Resuelve antes de que acabe" }
];
const colores = ["sakura", "indigo", "mango", "matcha", "violet", "coral", "sky", "plum", "mint", "sunset"];
const iconosCategoria = ["🐾", "💻", "🎵", "🕹️", "⚽", "🔬", "📚", "🌸", "🍜", "🗺️"];

export default function CategoriesPage() {
  const { mode, setMode, duration, setDuration, players, updatePlayers, categories, startRound, scores } = useGame();
  const [count, setCount] = useState(Math.min(10, Math.max(2, players.length || 2)));
  const [draftNames, setDraftNames] = useState(players);

  useEffect(() => setDraftNames(players), [players]);
  const chooseMode = nextMode => {
    setMode(nextMode);
    if (nextMode === "duelo" && draftNames.length < count) {
      setDraftNames(previous => Array.from({ length: count }, (_, index) => previous[index] || ""));
    }
  };
  const changeCount = value => {
    const nextCount = Number(value);
    setCount(nextCount);
    setDraftNames(previous => Array.from({ length: nextCount }, (_, index) => previous[index] || ""));
  };
  const updateName = (index, value) => setDraftNames(previous => previous.map((name, position) => position === index ? value : name));
  const start = categoryId => {
    if (mode === "duelo") {
      const names = Array.from({ length: count }, (_, index) => draftNames[index]?.trim() || `Jugador ${index + 1}`);
      const seen = new Set();
      const uniqueNames = names.map(name => {
        let candidate = name;
        let suffix = 2;
        while (seen.has(candidate.toLocaleLowerCase("es"))) candidate = `${name} ${suffix++}`;
        seen.add(candidate.toLocaleLowerCase("es"));
        return candidate;
      });
      updatePlayers(uniqueNames);
    }
    startRound(categoryId);
  };

  return <section className="choose-page">
    <div className="section-heading center-heading"><span className="eyebrow">🌸 ELIGE TU AVENTURA 🌸</span><h1>Categorías y modos</h1><p>Escoge un tema y decide cómo vas a jugar.</p></div>
    <section className="mode-panel" aria-labelledby="mode-heading">
      <h2 id="mode-heading">¿Cómo quieren jugar?</h2>
      <div className="mode-grid">
        {modos.map(option => <button type="button" key={option.id} className={`mode-card ${mode === option.id ? "is-selected" : ""}`} aria-pressed={mode === option.id} onClick={() => chooseMode(option.id)}>
          <span className="mode-icon">{option.icon}</span><strong>{option.title}</strong><small>{option.note}</small>
        </button>)}
      </div>
      {mode === "duelo" && <div className="mode-settings">
        <label className="form-field count-field">Número de jugadores
          <select value={count} onChange={event => changeCount(event.target.value)}>
            {Array.from({ length: 9 }, (_, index) => index + 2).map(value => <option value={value} key={value}>{value} jugadores</option>)}
          </select>
        </label>
        <div className="player-fields">
          {Array.from({ length: count }, (_, index) => <label className="form-field" key={index}>Nombre del jugador {index + 1}
            <input value={draftNames[index] || ""} maxLength={18} aria-label={`Nombre del jugador ${index + 1}`} placeholder={["Ej. Luna", "Ej. Alex", "Ej. Sakura", "Ej. Ken"][index % 4]} onChange={event => updateName(index, event.target.value)} />
          </label>)}
        </div>
        <p className="helper-copy">Se turnan para resolver palabras. Las victorias suman puntos en el marcador de esta sesión.</p>
        {players.length > 0 && scores.length > 0 && <p className="helper-copy">El marcador se actualiza al iniciar una nueva ronda.</p>}
      </div>}
      {mode === "tiempo" && <div className="mode-settings time-settings">
        <label className="form-field">Tiempo por palabra
          <select value={duration} onChange={event => setDuration(Number(event.target.value))}>
            <option value="30">30 segundos · Rápido</option><option value="60">60 segundos · Normal</option><option value="90">90 segundos · Tranquilo</option>
          </select>
        </label>
        <p className="helper-copy">Si el reloj llega a cero, se muestra la respuesta. ¡Una victoria rápida consigue puntos extra!</p>
      </div>}
    </section>
    <div className="category-heading"><h2>Escoge el tema</h2><span>Hay {categories.length} mundos por descubrir</span></div>
    <div className="category-grid">
      {categories.map((category, index) => <button className={`category-card ${colores[index % colores.length]}`} type="button" key={category.id} onClick={() => start(category.id)}>
        <span className="category-flower">✿</span><span className="category-symbol" aria-hidden="true">{iconosCategoria[index % iconosCategoria.length]}</span>
        <strong>{category.name || category.nombre || category.id}</strong><small>{category.count ?? category.cantidad ?? 0} palabras</small><span className="category-arrow">Jugar <b>→</b></span>
      </button>)}
    </div>
  </section>;
}
