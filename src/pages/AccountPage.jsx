import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { rewards } from "../data/rewards.js";

function playerFriendlyError(error) {
  const detail = String(error?.message || "");
  if (/AUTH_TOKEN_SECRET|Atlas|MongoDB|base de datos|servidor/i.test(detail)) return "El servicio de cuentas no está disponible ahora. Inténtalo de nuevo más tarde.";
  return detail || "No pudimos completar la solicitud. Inténtalo de nuevo.";
}

export default function AccountPage() {
  const { user, loading, register, login, logout, selectReward } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const unlocked = new Set(user?.desbloqueos || []);

  const submit = async event => {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ correo: form.correo, password: form.password });
    } catch (error) { setMessage(playerFriendlyError(error)); }
    finally { setBusy(false); }
  };

  if (loading) return <section className="account-page"><p role="status">🔄 Revisando tu sesión…</p></section>;

  return <section className="account-page">
    <div className="section-heading center-heading"><span className="eyebrow">🐾 TU ESPACIO DE JUEGO</span><h1>{user ? `¡Hola, ${user.nombre}!` : "Tu cuenta de jugador"}</h1><p>Guarda tus puntos y colecciona reacciones y memes mientras juegas.</p></div>
    {user ? <div className="account-summary">
      <div className="account-points"><span>🪙 Tus puntos</span><strong>{user.puntos}</strong><small>Los puntos se suman una sola vez por victoria.</small></div>
      <div className="account-details"><strong>{user.nombre}</strong><span>{user.correo}</span><button className="button button-outline" type="button" onClick={logout}>Cerrar sesión</button></div>
    </div> : <section className="account-form-card">
      <div className="account-tabs"><button type="button" className={isRegister ? "active" : ""} onClick={() => { setIsRegister(true); setMessage(""); }}>Crear cuenta</button><button type="button" className={!isRegister ? "active" : ""} onClick={() => { setIsRegister(false); setMessage(""); }}>Iniciar sesión</button></div>
      <form onSubmit={submit} className="account-form">
        {isRegister && <label className="form-field">Nombre de jugador<input autoComplete="name" minLength={2} maxLength={32} required value={form.nombre} onChange={event => setForm({ ...form, nombre: event.target.value })} placeholder="Ej. Sakura" /></label>}
        <label className="form-field">Correo electrónico<input type="email" autoComplete="email" maxLength={150} required value={form.correo} onChange={event => setForm({ ...form, correo: event.target.value })} placeholder="tu@correo.com" /></label>
        <label className="form-field">Contraseña<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} maxLength={128} required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder={isRegister ? "Mínimo 8 caracteres" : "Tu contraseña"} /></label>
        <button className="button button-gold" type="submit" disabled={busy}>{busy ? "Un momento…" : isRegister ? "Crear mi cuenta ✨" : "Entrar 🎮"}</button>
      </form>
      {message && <p className="account-message" role="alert">{message}</p>}
      <p className="helper-copy">Al iniciar sesión, podrás conservar tus puntos y recompensas en tu cuenta.</p>
    </section>}

    <section className="rewards-section" aria-labelledby="rewards-heading"><div className="section-heading"><span className="eyebrow">🎁 COLECCIÓN</span><h2 id="rewards-heading">Reacciones y memes</h2><p>Gana puntos en tus victorias para desbloquear coleccionables.</p></div>
      <div className="rewards-grid">{rewards.map(reward => {
        const isUnlocked = unlocked.has(reward.id);
        const progress = user ? Math.min(100, Math.round(user.puntos * 100 / reward.points)) : 0;
        return <article className={`reward-card ${isUnlocked ? "is-unlocked" : "is-locked"}`} key={reward.id}>
          <span className="reward-icon" aria-hidden="true">{isUnlocked ? reward.icon : "🔒"}</span><span className="reward-kind">{reward.kind}</span><h3>{reward.title}</h3><p>{reward.detail}</p>
          <strong>{isUnlocked ? "Desbloqueado" : `${reward.points} puntos`}</strong>
          {user && isUnlocked && <button type="button" className="button button-soft reward-equip" onClick={() => selectReward(user.recompensaActiva === reward.id ? "" : reward.id).catch(error => setMessage(playerFriendlyError(error)))}>{user.recompensaActiva === reward.id ? "✅ Equipado · quitar" : "Equipar en mi partida"}</button>}
          {!isUnlocked && <div className="reward-progress" role="meter" aria-label={`Progreso para desbloquear ${reward.title}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div>}
        </article>;
      })}</div>
    </section>
    <p className="account-back-link"><Link to="/categorias" className="button button-plum">Volver a jugar 🐾</Link></p>
  </section>;
}
