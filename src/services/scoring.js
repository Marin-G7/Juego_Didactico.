const MAX_ERRORS = 6;
const MAX_TIME_BONUS = 15;

export function calculatePoints(round) {
  if (!round?.gano) return 0;

  const errors = Math.min(MAX_ERRORS, Math.max(0, Number(round.errores) || 0));
  const attemptsBonus = (MAX_ERRORS - errors) * 5;
  const seconds = Math.max(0, Number(round.tiempoRestante) || 0);
  const timeBonus = round.modo === "tiempo" ? Math.min(MAX_TIME_BONUS, Math.floor(seconds / 6)) : 0;

  return 40 + attemptsBonus + timeBonus;
}
