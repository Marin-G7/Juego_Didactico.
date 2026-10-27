import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useGame } from "../context/GameContext.jsx";
import { api } from "../services/api.js";
import { CatReaction } from "../components/SiteLayout.jsx";
import { calculatePoints } from "../services/scoring.js";

const idDeJugador = nombre => nombre.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jugador";
const idLocal = () => {
  let id = localStorage.getItem("jugadorLocalId");
  if (!id) { id = `local-${crypto.randomUUID()}`; localStorage.setItem("jugadorLocalId", id); }
  return id;
};

export default function ResultsPage() {
  const { mode, players, scores, history, latestResult, categoryId, startRound, saveNotice, newSession, nextPlayer, categories } = useGame();
  const [savedRounds, setSavedRounds] = useState([]);
  const [atlasLoading, setAtlasLoading] = useState(true);
  const [databaseMessage, setDatabaseMessage] = useState("");
  const displayHistory = history.map(round => ({ ...round, puntos: calculatePoints(round) }));
  const savedHistory = savedRounds.map(round => ({ ...round, puntos: calculatePoints(round) }));
  const categoryNames = Object.fromEntries(categories.map(category => [category.id, category.name]));
  const nameOfCategory = round => round.categoriaNombre || categoryNames[round.categoryId || round.categoria] || round.categoryId || round.categoria;
  const wins = displayHistory.filter(round => round.gano).length;
  const losses = displayHistory.length - wins;
  const percentage = displayHistory.length ? Math.round(wins * 100 / displayHistory.length) : 0;
  const points = displayHistory.reduce((sum, round) => sum + round.puntos, 0);
  const ranking = players.map((name, index) => ({ name, index, points: Number(scores[index]) || 0 }))
    .sort((a, b) => b.points - a.points || a.index - b.index);
  const topScore = ranking[0]?.points || 0;
  const leaders = ranking.filter(player => player.points === topScore);

  useEffect(() => {
    let cancelled = false;
    setAtlasLoading(true);
    setDatabaseMessage("");
    const ids = mode === "duelo" ? players.map(idDeJugador) : [idLocal()];
    Promise.all([...new Set(ids)].map(id => api.getRounds(id)))
      .then(groups => { if (!cancelled) setSavedRounds(groups.flat().sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn))); })
      .catch(error => { if (!cancelled) setDatabaseMessage(error.message); })
      .finally(() => { if (!cancelled) setAtlasLoading(false); });
    return () => { cancelled = true; };
  }, [mode, players, latestResult, saveNotice]);

  const startFresh = () => {
    if (window.confirm("¿Borramos el marcador y el historial temporal de esta pestaña?")) newSession();
  };
  const continuePlaying = () => mode === "duelo" ? nextPlayer() : startRound(categoryId);
  const title = !latestResult ? "¡Tu aventura te espera!" : latestResult.gano ? "¡Victoria brillante!" : "¡Palabra rebelde!";

  return <section className="results-page">
    <div className={`result-banner ${latestResult && !latestResult.gano ? "result-loss" : ""}`}>
      <CatReaction name={!latestResult ? "normal" : latestResult.gano ? "orgulloso" : "derrota"} className="result-cat" />
      <div className="result-copy"><span className="eyebrow">🌸 TU RESUMEN 🌸</span><h1>{title}</h1>
        <p>{latestResult ? latestResult.gano
          ? `${latestResult.jugador} adivinó ${latestResult.palabra} y ganó ${latestResult.puntos} puntos.`
          : `${latestResult.jugador}, la palabra era ${latestResult.palabra}. ¡El gatito ya pide revancha!`
          : "Elige una categoría y juega para ver aquí tu resultado."}</p>
        {latestResult && <div className="answer-card"><span>Palabra</span><strong>{latestResult.palabra}</strong><small>{latestResult.categoriaNombre || latestResult.categoryId}</small></div>}
        <div className="result-actions">
          {latestResult && <button className="button button-mint" onClick={continuePlaying}>Continuar {mode === "duelo" ? "con el siguiente turno 🎏" : "jugando ✨"}</button>}
          <Link className="button button-gold" to="/categorias">Elegir otra categoría 🌸</Link>
        </div>
      </div>
    </div>
    {latestResult && <p className="score-explanation">🪙 Puntuación: 40 puntos por resolver + 5 por cada intento que te quede. En contrarreloj puedes ganar hasta 15 extra.</p>}
    {latestResult?.definicion && <section className="learning-card"><span className="eyebrow">📚 UNA PALABRA NUEVA</span><h2>¿Qué aprendiste?</h2><p>{latestResult.definicion}</p>
      {latestResult.datoCurioso && <aside className="curiosity-card"><span aria-hidden="true">🔎</span><div><strong>Dato curioso</strong><p>{latestResult.datoCurioso}</p>{latestResult.fuenteDato && <a href={latestResult.fuenteDato} target="_blank" rel="noreferrer">Conoce la fuente ↗</a>}</div></aside>}
    </section>}
    <section className="progress-section" aria-labelledby="session-progress-title">
      <div className="section-heading"><span className="eyebrow">🌱 PROGRESO DE LA SESIÓN</span><h2 id="session-progress-title">Así vas jugando</h2></div>
      <div className="stats-grid">
        <article className="stat-card mango"><span aria-hidden="true">🎮</span><strong>{displayHistory.length}</strong><span>Partidas</span></article>
        <article className="stat-card matcha"><span aria-hidden="true">🌟</span><strong>{wins}</strong><span>Ganadas</span></article>
        <article className="stat-card sakura"><span aria-hidden="true">🐾</span><strong>{losses}</strong><span>Perdidas</span></article>
        <article className="stat-card indigo"><span aria-hidden="true">🪙</span><strong>{points}</strong><span>Puntos</span></article>
      </div>
      <div className="progress-label"><span>Porcentaje de victorias</span><strong>{percentage}%</strong></div>
      <div className="progress-track" role="meter" aria-label="Porcentaje de victorias de esta sesión" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}><div style={{ width: `${percentage}%` }} /></div>
      <p className="helper-copy">Este resumen cuenta solo las partidas de esta sesión; el historial temporal se borra al cerrar la pestaña.</p>
      {saveNotice && <p className="save-notice" role="status">{saveNotice}</p>}
    </section>
    {mode === "duelo" && <section className="leaderboard-card" aria-labelledby="leaderboard-title">
      <div className="section-heading"><span className="eyebrow">🎏 EQUIPO LOCAL</span><h2 id="leaderboard-title">🏆 Tabla de posiciones</h2></div>
      {topScore > 0 ? <p className="leader-callout" role="status">{leaders.length > 1 ? `🤝 ¡Empate entre ${leaders.map(player => player.name).join(" y ")}!` : `👑 ${leaders[0].name} va en primer lugar con ${topScore} puntos.`}</p> : <p className="leader-callout">✨ ¡La primera ronda puede cambiar el marcador!</p>}
      <ol className="scoreboard-list" aria-label="Posiciones del equipo">
        {ranking.map((player, position) => <li className={`scoreboard-item ${position === 0 && topScore > 0 ? "is-leading" : ""} ${latestResult?.jugadorIndice === player.index ? "last-turn" : ""}`} key={`${player.name}-${player.index}`}>
          <span className="score-medal" aria-label={`Puesto ${position + 1}`}>{["🥇", "🥈", "🥉"][position] || `#${position + 1}`}</span>
          <span className="score-player"><strong>{player.name}</strong>{latestResult?.jugadorIndice === player.index && <small>🎯 Último turno</small>}</span>
          <span className="score-total">{player.points}<small>pts</small></span>
          <span className="score-meter" role="meter" aria-label={`${player.name}: ${player.points} puntos`} aria-valuemin="0" aria-valuemax={Math.max(1, topScore)} aria-valuenow={player.points}><i style={{ width: `${topScore ? player.points / topScore * 100 : 0}%` }} /></span>
        </li>)}
      </ol>
      <p className="helper-copy">El marcador se conserva al elegir otra categoría; cambia si modificas la lista de jugadores o borras la sesión.</p>
    </section>}
    <section className="history-card" aria-labelledby="session-history-title">
      <div className="section-heading"><span className="eyebrow">🕹️ SESIÓN ACTUAL</span><h2 id="session-history-title">📜 Historial temporal</h2></div>
      <p className="helper-copy">Solo aparece en esta pestaña y se borra al cerrarla.</p>
      {displayHistory.length ? <ul className="history-list">{displayHistory.slice(-10).reverse().map((round, index) => <li key={round.id || `${round.palabra}-${index}`}>
        <span>{mode === "duelo" ? `${round.jugador}: ` : ""}<strong>{round.palabra}</strong><small>{nameOfCategory(round)}</small></span>
        <b className={round.gano ? "won-label" : "lost-label"}>{round.gano ? `Ganada · ${round.puntos} pts` : "Perdida"}</b>
      </li>)}</ul> : <p className="empty-state">Todavía no hay partidas en esta sesión. ¡Elige un tema para empezar!</p>}
      <button className="button button-outline" onClick={startFresh}>🧹 Borrar sesión y progreso temporal</button>
    </section>
    <section className="history-card atlas-history" aria-labelledby="atlas-history-title">
      <div className="section-heading"><span className="eyebrow">☁️ NUBE</span><h2 id="atlas-history-title">Partidas guardadas en Atlas</h2></div>
      <p className="helper-copy">Estas partidas quedan guardadas en la base de datos aunque cierres la pestaña. Mostramos las diez más recientes.</p>
      {atlasLoading && <p className="empty-state" role="status">🔄 Consultando las partidas guardadas…</p>}
      {!atlasLoading && databaseMessage && <p className="save-notice local-notice" role="status">No se pudo consultar Atlas: {databaseMessage}</p>}
      {!atlasLoading && !databaseMessage && (savedHistory.length ? <ul className="history-list">{savedHistory.slice(0, 10).map((round, index) => <li key={round.id || `${round.palabra}-${index}`}>
        <span>{mode === "duelo" ? `${round.jugador}: ` : ""}<strong>{round.palabra}</strong><small>{nameOfCategory(round)}</small></span>
        <b className={round.gano ? "won-label" : "lost-label"}>{round.gano ? `Ganada · ${round.puntos} pts` : "Perdida"}</b>
      </li>)}</ul> : !atlasLoading && <p className="empty-state">Aún no hay partidas guardadas para este jugador o equipo.</p>)}
    </section>
  </section>;
}
