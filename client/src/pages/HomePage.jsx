import { Link } from "react-router";
import { useGame } from "../context/GameContext.jsx";
import { CatReaction } from "../components/SiteLayout.jsx";

export default function HomePage() {
  const { categories } = useGame();
  return <>
    <section className="hero-card">
      <div className="hero-copy">
        <span className="eyebrow">🌸 ¡BIENVENIDO AL FESTIVAL DE PALABRAS! 🌸</span>
        <h1>¿Qué palabra se esconde?</h1>
        <p>Elige un tema, prueba tus letras y descubre algo nuevo. Invita a tu equipo o reta al cronómetro: el gatito tiene una reacción para cada momento.</p>
        <Link className="button button-gold" to="/categorias">¡Vamos a jugar! <span>✿</span></Link>
      </div>
      <CatReaction name="normal" className="hero-cat" />
      <span className="hero-flower flower-one">✿</span><span className="hero-flower flower-two">✿</span>
    </section>
    <section className="welcome-stats">
      <div><strong>{categories.length}</strong><span>temas para explorar</span></div>
      <div><strong>10</strong><span>jugadores por turnos</span></div>
      <div><strong>3</strong><span>modos de aventura</span></div>
    </section>
    <section className="how-section">
      <div className="section-heading"><span className="eyebrow">TU AVENTURA</span><h2>Un juego, muchas formas de jugar</h2></div>
      <div className="how-grid">
        <article><span className="step-badge">01</span><h3>Elige tu camino</h3><p>Explora siete categorías y aprende palabras con su definición.</p></article>
        <article><span className="step-badge">02</span><h3>Invita a tu equipo</h3><p>Hasta diez personas pueden participar pasando el turno.</p></article>
        <article><span className="step-badge">03</span><h3>¡Adivina a tiempo!</h3><p>Usa pistas, evita errores y mira cómo reacciona el gato.</p></article>
      </div>
    </section>
  </>;
}
