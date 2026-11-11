import { Link } from "react-router";
import { useState } from "react";
import { useGame } from "../context/GameContext.jsx";
import { CatReaction } from "../components/SiteLayout.jsx";

export default function HomePage() {
  const { categories, theme, setTheme } = useGame();
  const [showThemes, setShowThemes] = useState(false);
  const themes = [
    { id: "samurai", label: "Japonés", symbol: "⛩️" },
    { id: "navidad", label: "Navidad", symbol: "🎄" },
    { id: "colombia", label: "Colombia", symbol: "🇨🇴" },
    { id: "bosque", label: "Bosque", symbol: "🌲" }
  ];
  const heroStyles = {
    samurai: { title: "🏮 ¡BIENVENIDO AL FESTIVAL DE PALABRAS! 🏮", motif: ["⛩", "☀"] },
    navidad: { title: "🎄 ¡UNA AVENTURA LLENA DE MAGIA! 🎄", motif: ["❄", "⭐"] },
    colombia: { title: "🇨🇴 ¡AVENTURA DE PALABRAS, PARCE! 🇨🇴", motif: ["🦜", "☀"] },
    bosque: { title: "🌿 ¡EXPLORA EL BOSQUE DE PALABRAS! 🌿", motif: ["🌳", "🍃"] }
  }[theme] || { title: "🏮 ¡BIENVENIDO AL FESTIVAL DE PALABRAS! 🏮", motif: ["⛩", "☀"] };
  return <>
    <section className="theme-selector" aria-label="Elige el estilo visual">
      <div className="theme-picker">
        <button type="button" className="theme-toggle" aria-expanded={showThemes} aria-controls="theme-options" onClick={() => setShowThemes(open => !open)}>Estilos</button>
        {showThemes && <div className="theme-options" id="theme-options" aria-label="Estilos disponibles">
          {themes.map(item => <button key={item.id} type="button" className={`theme-choice theme-choice-${item.id} ${theme === item.id ? "is-selected" : ""}`} aria-label={`Elegir estilo ${item.label}`} aria-pressed={theme === item.id} title={item.label} onClick={() => { setTheme(item.id); setShowThemes(false); }}>
            <span aria-hidden="true">{item.symbol}</span><small>{item.label}</small>
          </button>)}
        </div>}
      </div>
    </section>
    <section className="hero-card">
      <div className="hero-copy">
        <span className="eyebrow">{heroStyles.title}</span>
        <h1>¿Qué palabra se esconde?</h1>
        <p>🐾 Elige una categoría, adivina palabras y aprende algo nuevo. El gatito te acompaña con sus reacciones en cada partida. ✨</p>
        <Link className="button button-gold" to="/categorias">¡Vamos a jugar! de una no lo piense!! <span>🎮</span></Link>
      </div>
      <CatReaction name="normal" className="hero-cat" />
      <span className="hero-symbol motif-one" aria-hidden="true">{heroStyles.motif[0]}</span><span className="hero-symbol motif-two" aria-hidden="true">{heroStyles.motif[1]}</span>
    </section>
    <section className="welcome-stats">
      <div><span className="welcome-icon" aria-hidden="true">🗂️</span><strong>{categories.length}</strong><span>categorías para explorar</span></div>
      <div><span className="welcome-icon" aria-hidden="true">👥</span><strong>10</strong><span>jugadores por turnos</span></div>
      <div><span className="welcome-icon" aria-hidden="true">🎮</span><strong>3</strong><span>modos de aventura</span></div>
    </section>
    <section className="how-section">
      <div className="section-heading"><span className="eyebrow">🎴 TU AVENTURA 🎴</span><h2>Un juego, muchas formas de jugar</h2></div>
      <div className="how-grid">
        <article><div className="adventure-card-top"><span className="step-badge">01</span><span className="adventure-icon" aria-hidden="true">🧭</span></div><h3>Elige tu categoría</h3><p>Explora <strong>{categories.length} categorías</strong> 🗂️ y aprende palabras nuevas con su definición 📖.</p></article>
        <article><div className="adventure-card-top"><span className="step-badge">02</span><span className="adventure-icon" aria-hidden="true">🎏</span></div><h3>Invita a tu equipo</h3><p>Jueguen hasta <strong>10 personas</strong> 👥. Pasen el turno y celebren cada acierto 🎉.</p></article>
        <article><div className="adventure-card-top"><span className="step-badge">03</span><span className="adventure-icon" aria-hidden="true">🔎</span></div><h3>¡Adivina la palabra!</h3><p>Usa una pista 💡, prueba letras 🔤 y mira cómo reacciona el gatito 🐈.</p></article>
      </div>
      <div className="home-invitation">
        <CatReaction name="normal" className="invitation-cat" caption="¡ya está listoo a parchar!🐾" />
        <div><span className="eyebrow">🐱 UNA AVENTURA TE ESPERA</span><h2>¿Te atreves a descubrir la palabra?</h2>
          <Link className="button button-gold" to="/categorias">¡Empecemos a jugar! ¿Te atreves? 🎮</Link>
        </div>
      </div>
    </section>
  </>;
}
