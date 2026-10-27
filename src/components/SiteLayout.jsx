import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function SiteLayout({ children }) {
  const [atlas, setAtlas] = useState("consultando");
  useEffect(() => {
    api.health().then(data => setAtlas(data.atlas)).catch(() => setAtlas("API apagada"));
  }, []);
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/"><span className="brand-seal">猫</span><span>Gatito Ahorcado<small>APRENDE JUGANDO</small></span></NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink><NavLink to="/categorias">Jugar</NavLink><NavLink to="/resultados">Resultados</NavLink>
        </nav>
        <span className={`api-badge ${atlas === "conectado" ? "api-ok" : ""}`} title="Estado de la conexión con el servidor">
          <i /> {atlas === "conectado" ? "Atlas conectado" : atlas === "sin configurar" ? "Modo local" : atlas}
        </span>
      </header>
      <main className="page-content">{children}</main>
      <footer className="page-footer">Un juego de palabras, gatos y pétalos <span>🌸</span></footer>
    </div>
  );
}

export function CatReaction({ name = "normal", caption, className = "" }) {
  const labels = { normal: "Gatito curioso", pensando: "Gatito pensando", acierto: "¡Gatito sorprendido!", error: "Gatito dudando", enojado: "Gatito enojado", indiferente: "Gatito indiferente", orgulloso: "Gatito orgulloso", derrota: "Gatito derrotado" };
  return <figure className={`cat-card ${className}`}>
    <img src={`/assets/gato/${name}.png`} alt={labels[name] || labels.normal} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

export function HangmanDrawing({ mistakes }) {
  return <svg className="hangman" viewBox="0 0 200 200" role="img" aria-label={`Dibujo del ahorcado, ${mistakes} errores`}>
    <path className="gallows" d="M25 180h110M55 180V25h90M145 25v24" />
    <circle className="body-part" style={{ opacity: mistakes >= 1 ? 1 : 0 }} cx="145" cy="65" r="16" />
    <path className="body-part" style={{ opacity: mistakes >= 2 ? 1 : 0 }} d="M145 81v42" />
    <path className="body-part" style={{ opacity: mistakes >= 3 ? 1 : 0 }} d="m145 91-25 22" />
    <path className="body-part" style={{ opacity: mistakes >= 4 ? 1 : 0 }} d="m145 91 25 22" />
    <path className="body-part" style={{ opacity: mistakes >= 5 ? 1 : 0 }} d="m145 123-24 34" />
    <path className="body-part" style={{ opacity: mistakes >= 6 ? 1 : 0 }} d="m145 123 24 34" />
  </svg>;
}
