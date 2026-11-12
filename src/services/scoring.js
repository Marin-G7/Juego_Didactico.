const MAX_TIME_BONUS = 10;

// Una derrota da cero; una victoria suma base, intentos conservados y un bono de tiempo limitado.
export function calculatePoints(round) {
  if (!round?.gano) return 0;

  const maxAttempts = Math.min(10, Math.max(6, Number(round.intentosMaximos) || 6));
  const errors = Math.min(maxAttempts, Math.max(0, Number(round.errores) || 0));
  const attemptsBonus = (maxAttempts - errors) * 2;
  const seconds = Math.max(0, Number(round.tiempoRestante) || 0);
  const timeBonus = ["tiempo", "formar", "formar-duelo"].includes(round.modo) ? Math.min(MAX_TIME_BONUS, Math.floor(seconds / 30)) : 0;

  return 25 + attemptsBonus + timeBonus;
}
