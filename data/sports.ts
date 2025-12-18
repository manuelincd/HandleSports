export type Sport = {
  id: string;
  name: string;
  emoji: string;
};

export const SPORTS: Sport[] = [
  { id: "all", name: "All", emoji: "🌐" },
  { id: "handball", name: "Handball", emoji: "🤾‍♂️" },
  { id: "basketball", name: "Basket", emoji: "🏀" },
  { id: "football", name: "Fútbol", emoji: "⚽" },
  { id: "volleyball", name: "Volley", emoji: "🏐" },
];
