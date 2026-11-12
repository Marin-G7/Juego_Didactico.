import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { GameProvider } from "./context/GameContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

// Los proveedores comparten sesión y estado del juego entre todas las páginas.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
