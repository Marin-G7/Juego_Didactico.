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
  saveRound: partida => request("/api/partidas", { method: "POST", body: JSON.stringify(partida) }),
  getRounds: jugadorId => request(`/api/partidas?jugadorId=${encodeURIComponent(jugadorId)}`)
};


