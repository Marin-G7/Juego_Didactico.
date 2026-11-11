import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext.jsx";

const modes = [
  { id: "individual", icon: "🙋", title: "Aventura individual", note: "A tu propio ritmo" },
  { id: "duelo", icon: "👥", title: "Grupos por turnos", note: "De 2 a 10 jugadores" },
  { id: "tiempo", icon: "⏱️", title: "Contrarreloj", note: "Resuelve antes de que acabe" },
  { id: "formar", icon: "🔤", title: "Forma la palabra", note: "Ordena letras antes del tiempo" },
  { id: "formar-duelo", icon: "🧩", title: "Formación en grupo", note: "Compitan por turnos" },
  { id: "eliminacion", icon: "💛", title: "Últimos en pie", note: "Pierde vidas si fallas" }
];
const isMultiplayer = mode => ["duelo", "formar-duelo", "eliminacion"].includes(mode);
const isFormation = mode => ["formar", "formar-duelo"].includes(mode);
const categoryArt = {
  animales: ["🐾", "animal"], tecnologia: ["🤖", "technology"], musica: ["🎸", "music"], videojuegos: ["🎮", "games"],
  deportes: ["⚽", "sports"], ciencia: ["🧪", "science"], cultura: ["📚", "culture"], anime: ["🗾", "japan"],
  gastronomia: ["🍲", "food"], geografia: ["🌎", "geography"], naturaleza: ["🌿", "nature"]
};
const colorClasses = ["samurai-red", "samurai-ink", "samurai-vermilion", "samurai-charcoal", "samurai-wine", "samurai-black-red", "samurai-night", "samurai-crimson", "samurai-smoke", "samurai-sunrise"];
const avatarOptions = ["🐱", "🦊", "🐼", "🐸", "🐯", "🐰", "🐨", "🐵", "🐲", "🦁"];
const durations = Array.from({ length: 10 }, (_, index) => (index + 1) * 30);

export default function CategoriesPage() {
  const { mode, setMode, duration, setDuration, attempts, setAttempts, difficulty, setDifficulty, players, playerAvatars, updatePlayers, livesPerPlayer, setLivesPerPlayer, categories, startRound, scores } = useGame();
  const [count, setCount] = useState(Math.min(10, Math.max(2, players.length || 2)));
  const [draftNames, setDraftNames] = useState(players);
  const [draftAvatars, setDraftAvatars] = useState(() => players.map((_, index) => playerAvatars[index] || avatarOptions[index % avatarOptions.length]));
  const [draftLives, setDraftLives] = useState(livesPerPlayer);
  const [selectionType, setSelectionType] = useState("personalizada");

  useEffect(() => {
    setDraftNames(players);
    setDraftAvatars(players.map((_, index) => playerAvatars[index] || avatarOptions[index % avatarOptions.length]));
  }, [players, playerAvatars]);

  const changeCount = value => {
    const nextCount = Number(value);
    setCount(nextCount);
    setDraftNames(previous => Array.from({ length: nextCount }, (_, index) => previous[index] || ""));
    setDraftAvatars(previous => Array.from({ length: nextCount }, (_, index) => previous[index] || avatarOptions[index % avatarOptions.length]));
  };
  const updateName = (index, value) => setDraftNames(previous => previous.map((name, position) => position === index ? value : name));
  const updateAvatar = (index, value) => setDraftAvatars(previous => previous.map((avatar, position) => position === index ? value : avatar));
  const start = (categoryId, random = false) => {
    if (isMultiplayer(mode)) {
      const names = Array.from({ length: count }, (_, index) => draftNames[index]?.trim() || `Jugador ${index + 1}`);
      const seen = new Set();
      const uniqueNames = names.map(name => {
        let candidate = name;
        let suffix = 2;
        while (seen.has(candidate.toLocaleLowerCase("es"))) candidate = `${name} ${suffix++}`;
        seen.add(candidate.toLocaleLowerCase("es"));
        return candidate;
      });
      updatePlayers(uniqueNames, draftAvatars, draftLives);
    }
    const destination = random
      ? categories[Math.floor(Math.random() * categories.length)]?.id
      : categoryId;
    if (destination) startRound(destination);
  };

  const multiplayer = isMultiplayer(mode);
  const formation = isFormation(mode);
  const timed = mode === "tiempo" || formation;

  return <section className="choose-page">
    <div className="section-heading center-heading"><span className="eyebrow">🎌 ELIGE TU AVENTURA 🏮</span><h1>Categorías y modos</h1><p>Escoge una categoría y decide cómo vas a jugar.</p></div>
    <section className="mode-panel" aria-labelledby="mode-heading">
      <h2 id="mode-heading">¿Cómo quieren jugar?</h2>
      <div className="mode-grid mode-grid-expanded">
        {modes.map(option => <button type="button" key={option.id} className={`mode-card ${mode === option.id ? "is-selected" : ""}`} aria-pressed={mode === option.id} onClick={() => setMode(option.id)}>
          <span className="mode-icon">{option.icon}</span><strong>{option.title}</strong><small>{option.note}</small>
        </button>)}
      </div>
      <section className="start-choice" aria-label="Elige cómo seleccionar categoría">
        <h3>¿Cómo quieres comenzar?</h3>
        <div className="start-choice-actions">
          <button type="button" className={`start-choice-card ${selectionType === "rapida" ? "is-selected" : ""}`} aria-pressed={selectionType === "rapida"} onClick={() => setSelectionType("rapida")}>
            <span aria-hidden="true">🎲</span><strong>Inicio rápido</strong><small>Escoge una categoría al azar y empieza.</small>
          </button>
          <button type="button" className={`start-choice-card ${selectionType === "personalizada" ? "is-selected" : ""}`} aria-pressed={selectionType === "personalizada"} onClick={() => setSelectionType("personalizada")}>
            <span aria-hidden="true">🗺️</span><strong>Selección personalizada</strong><small>Elige tú la categoría de esta partida.</small>
          </button>
        </div>
        {selectionType === "rapida" && <button type="button" className="button button-gold quick-start-button" onClick={() => start(null, true)}>Comenzar con categoría aleatoria ✨</button>}
      </section>
      {multiplayer && <div className="mode-settings">
        <div className="settings-row">
          <label className="form-field count-field">Número de jugadores
            <select value={count} onChange={event => changeCount(event.target.value)}>
              {Array.from({ length: 9 }, (_, index) => index + 2).map(value => <option value={value} key={value}>{value} jugadores</option>)}
            </select>
          </label>
          {mode === "eliminacion" && <label className="form-field">Vidas por jugador
            <select value={draftLives} onChange={event => { const value = Number(event.target.value); setDraftLives(value); setLivesPerPlayer(value); }}>
              {[1, 2, 3].map(value => <option value={value} key={value}>{value} {value === 1 ? "vida" : "vidas"}</option>)}
            </select>
          </label>}
        </div>
        <div className="player-fields player-profile-fields">
          {Array.from({ length: count }, (_, index) => <fieldset className="player-profile" key={index}>
            <legend>Ficha del jugador {index + 1}</legend>
            <label className="form-field">Nombre o apodo
              <input value={draftNames[index] || ""} maxLength={18} aria-label={`Nombre del jugador ${index + 1}`} placeholder={["Ej. Luna", "Ej. Alex", "Ej. Sakura", "Ej. Ken"][index % 4]} onChange={event => updateName(index, event.target.value)} />
            </label>
            <label className="form-field">Avatar
              <select value={draftAvatars[index] || avatarOptions[index % avatarOptions.length]} onChange={event => updateAvatar(index, event.target.value)}>
                {avatarOptions.map(avatar => <option key={avatar} value={avatar}>{avatar}</option>)}
              </select>
            </label>
          </fieldset>)}
        </div>
        <p className="helper-copy">Cada jugador tendrá su nombre, avatar y puntaje en el marcador.</p>
      </div>}
      {timed && <div className="mode-settings time-settings">
        <label className="form-field">Tiempo de partida
          <select value={duration} onChange={event => setDuration(Number(event.target.value))}>
            {durations.map(value => <option value={value} key={value}>{value >= 60 ? `${Math.floor(value / 60)} min${value % 60 ? ` ${value % 60} s` : ""}` : `${value} segundos`} · ${value}s</option>)}
          </select>
        </label>
        <p className="helper-copy">El reloj empieza al abrir la ronda. ¡Piensa rápido y revisa tu respuesta antes de que termine!</p>
      </div>}
      <div className="mode-settings attempts-settings">
        <label className="form-field">Intentos para adivinar
          <select value={attempts} onChange={event => setAttempts(event.target.value)}>
            {Array.from({ length: 5 }, (_, index) => index + 6).map(value => <option value={value} key={value}>{value} intentos</option>)}
          </select>
        </label>
        <p className="helper-copy">El dibujo se completa poco a poco según el máximo de intentos que elijas.</p>
      </div>
      {formation && <p className="formation-explainer">🔤 Recibirás las letras mezcladas. Tócalas para construir la palabra y pulsa “Comprobar” antes de que acabe el tiempo.</p>}
      {mode === "eliminacion" && <p className="formation-explainer">💛 Cada respuesta fallida resta una vida. Quien pierda todas queda eliminado; gana quien conserve vidas al final.</p>}
    </section>
    <div className="mode-settings difficulty-settings">
      <label className="form-field">Dificultad de la partida
        <select value={difficulty} onChange={event => setDifficulty(event.target.value)}>
          <option value="facil">Fácil · palabras cortas y pistas útiles</option><option value="normal">Normal · palabras variadas y pista sutil</option><option value="dificil">Difícil · palabras largas y sin pistas</option>
        </select>
      </label>
      <p className="helper-copy">La dificultad se aplica en todos los modos: ajusta la longitud de las palabras y las pistas disponibles.</p>
    </div>
    {selectionType === "personalizada" && <><div className="category-heading"><h2>Escoge una categoría</h2><span>Hay {categories.length} mundos por descubrir</span></div>
    <div className="category-grid">
      {categories.map((category, index) => {
        const [icon, art] = categoryArt[category.id] || ["✨", "default"];
        return <button className={`category-card category-${art} ${colorClasses[index % colorClasses.length]}`} type="button" key={category.id} onClick={() => start(category.id)}>
          <span className="category-symbol" aria-hidden="true">{icon}</span><span className="category-art" aria-hidden="true">{icon}</span>
          <strong>{category.name || category.nombre || category.id}</strong><small>{category.count ?? category.cantidad ?? 0} palabras</small><span className="category-arrow">Jugar <b>→</b></span>
        </button>;
      })}
    </div></>}
  </section>;
}
