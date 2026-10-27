import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useGame } from "../context/GameContext.jsx";
import { api } from "../services/api.js";
import { CatReaction } from "../components/SiteLayout.jsx";

const idDeJugador = nombre => nombre.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jugador";
const idLocal = () => {
  let id = localStorage.getItem("jugadorLocalId");
  if (!id) { id = `local-${crypto.randomUUID()}`; localStorage.setItem("jugadorLocalId", id); }
  return id;
};

export default function ResultsPage() {
  const { mode, players, scores, history, latestResult, saveNotice, newSession, nextPlayer } = useGame();
  const [savedRounds, setSavedRounds] = useState(null);
  const [databaseMessage, setDatabaseMessage] = useState("");
  const visibleHistory = savedRounds === null ? history : [...savedRounds, ...history.filter(local => !savedRounds.some(remote => remote.palabra === local.palabra && remote.jugador === local.jugador && remote.categoria === (local.categoryId || local.categoria) && Math.abs(new Date(remote.creadaEn).getTime() - new Date(local.creadaEn).getTime()) < 10000))];
  const wins = visibleHistory.filter(round => round.gano).length;
  const losses = visibleHistory.length - wins;
  const percentage = visibleHistory.length ? Math.round(wins * 100 / visibleHistory.length) : 0;
  const points = visibleHistory.reduce((sum, round) => sum + (Number(round.puntos) || 0), 0);

  useEffect(() => {
    let cancelled = false;
    const ids = mode === "duelo" ? players.map(idDeJugador) : [idLocal()];
    Promise.all([...new Set(ids)].map(id => api.getRounds(id)))
      .then(groups => { if (!cancelled) setSavedRounds(groups.flat().sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn))); })
      .catch(error => { if (!cancelled) setDatabaseMessage(error.message); });
    return () => { cancelled = true; };
  }, [mode, players, latestResult]);

  const startFresh = () => {
    if (window.confirm("¿Borramos el marcador y el historial temporal de esta pestaña?")) newSession();
  };
  const title = !latestResult ? "¡Tu aventura te espera!" : latestResult.gano ? "¡Victoria brillante!" : "¡Palabra rebelde!";

  return <section className="results-page">
    <div className={`result-banner ${latestResult && !latestResult.gano ? "result-loss" : ""}`}>
      <CatReaction name={!latestResult ? "normal" : latestResult.gano ? "orgulloso" : "derrota"} className="result-cat" />
      <div className="result-copy"><span className="eyebrow">🌸 TU RESUMEN 🌸</span><h1>{title}</h1>
        <p>{latestResult ? latestResult.gano
          ? `${latestResult.jugador} adivinó ${latestResult.palabra} y ganó ${latestResult.puntos} puntos.`
          : `La palabra era ${latestResult.palabra}. ¡El gatito ya pide revancha!`
          : "Elige una categoría y juega para ver aquí tu resultado."}</p>
        {latestResult && <div className="answer-card"><span>Palabra</span><strong>{latestResult.palabra}</strong><small>{latestResult.categoriaNombre || latestResult.categoryId}</small></div>}
        <div className="result-actions">
          <Link className="button button-gold" to="/categorias">Elegir categoría</Link>
          {mode === "duelo" && latestResult && <button className="button button-mint" onClick={nextPlayer}>Siguiente jugador 🎏</button>}
        </div>
      </div>
    </div>
    {latestResult?.definicion && <section className="learning-card"><span className="eyebrow">UNA PALABRA NUEVA</span><h2>¿Qué aprendiste?</h2><p>{latestResult.definicion}</p></section>}
    <section className="progress-section">
      <div className="section-heading"><span className="eyebrow">🌱 PROGRESO DE LA SESIÓN</span><h2>Así vas jugando</h2></div>
      <div className="stats-grid">
        <article className="stat-card mango"><strong>{visibleHistory.length}</strong><span>Partidas</span></article>
        <article className="stat-card matcha"><strong>{wins}</strong><span>Ganadas</span></article>
        <article className="stat-card sakura"><strong>{losses}</strong><span>Perdidas</span></article>
        <article className="stat-card indigo"><strong>{points}</strong><span>Puntos</span></article>
      </div>
      <div className="progress-label"><span>Porcentaje de victorias</span><strong>{percentage}%</strong></div>
      <div className="progress-track"><div style={{ width: `${percentage}%` }} /></div>
      <p className="helper-copy">El historial de esta pestaña se borra al cerrarla. Las partidas guardadas en Atlas duran hasta que las borres.</p>
      {saveNotice && <p className="save-notice" role="status">{saveNotice}</p>}
      {databaseMessage && <p className="save-notice local-notice" role="status">Aún no se pueden cargar partidas de Atlas: {databaseMessage}</p>}
    </section>
    {mode === "duelo" && <section className="leaderboard-card"><div className="section-heading"><span className="eyebrow">🏆 EQUIPO LOCAL</span><h2>Marcador</h2></div>
      <ol className="leaderboard">{players.map((name, index) => <li key={`${name}-${index}`}><span><i>{index + 1}</i>{name}</span><strong>{Number(scores[index]) || 0} pts</strong></li>)}</ol>
    </section>}
    <section className="history-card"><div className="section-heading"><span className="eyebrow">📜 ÚLTIMAS RONDAS</span><h2>{savedRounds ? "Partidas guardadas" : "Historial de esta sesión"}</h2></div>
      {visibleHistory.length ? <ul className="history-list">{visibleHistory.slice(-10).reverse().map((round, index) => <li key={round.id || `${round.palabra}-${index}`}>
        <span>{mode === "duelo" ? `${round.jugador}: ` : ""}<strong>{round.palabra}</strong><small>{round.categoriaNombre || round.categoryId || round.categoria}</small></span>
        <b className={round.gano ? "won-label" : "lost-label"}>{round.gano ? `Ganada · ${round.puntos} pts` : "Perdida"}</b>
      </li>)}</ul> : <p className="empty-state">Todavía no hay partidas. ¡Elige un tema para empezar!</p>}
      <button className="button button-outline" onClick={startFresh}>Borrar progreso temporal</button>
    </section>
  </section>;
}




