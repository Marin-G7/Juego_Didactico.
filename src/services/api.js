async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `La API respondió ${response.status}.`);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  health: () => request("/api/health"),
  getCategories: () => request("/api/categorias"),
  getWords: category => request(`/api/palabras/${encodeURIComponent(category)}`),
  saveRound: (partida, token) => request("/api/partidas", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(partida) }),
  getRounds: jugadorId => request(`/api/partidas?jugadorId=${encodeURIComponent(jugadorId)}`),
  register: data => request("/api/auth/registro", { method: "POST", body: JSON.stringify(data) }),
  login: data => request("/api/auth/iniciar-sesion", { method: "POST", body: JSON.stringify(data) }),
  account: token => request("/api/auth/cuenta", { headers: { Authorization: `Bearer ${token}` } }),
  selectReward: (token, rewardId) => request("/api/auth/recompensa", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ rewardId }) }),
  awardPoints: (token, round) => request("/api/auth/puntos", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(round) })
};


