export const rewards = [
  { id: "neko-brillante", title: "Neko brillante", icon: "🐱🌟", kind: "Reacción", points: 60, detail: "Una reacción para celebrar tus victorias." },
  { id: "meme-sueno", title: "Gatito con sueño", icon: "😹💤", kind: "Meme", points: 150, detail: "Un sticker juguetón hecho con símbolos del juego." },
  { id: "samurai-neko", title: "Neko samurái", icon: "🐱🥷", kind: "Reacción", points: 300, detail: "Tu gatito se une al dojo de las palabras." },
  { id: "meme-sensei", title: "Sensei de memes", icon: "😼🎴", kind: "Meme", points: 500, detail: "Una pose especial para presumir en la partida." }
];

export function unlockedRewards(points = 0) {
  return rewards.filter(reward => points >= reward.points).map(reward => reward.id);
}
