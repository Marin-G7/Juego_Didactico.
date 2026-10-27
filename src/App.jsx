import { Navigate, Route, Routes } from "react-router";
import { SiteLayout } from "./components/SiteLayout.jsx";
import { useGame } from "./context/GameContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";

function GameRoute() {
  const { activeRound } = useGame();
  return activeRound ? <GamePage key={activeRound.roundId} /> : <Navigate to="/categorias" replace />;
}

export default function App() {
  return <SiteLayout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categorias" element={<CategoriesPage />} />
      <Route path="/juego" element={<GameRoute />} />
      <Route path="/resultados" element={<ResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </SiteLayout>;
}
