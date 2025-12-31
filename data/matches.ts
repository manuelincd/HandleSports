// data/matches.ts

import { Match } from "@/types/Match";

export const MATCHES: Match[] = [
  // Jornada 1
  {
    id: "1",
    tournamentId: "1",
    homeTeamId: "1", // Real Madrid
    awayTeamId: "2", // Barcelona
    homeScore: 2,
    awayScore: 1,
    date: new Date("2025-01-15T20:00:00"),
    matchday: 1,
    status: "finished",
    location: "Santiago Bernabéu",
  },
  {
    id: "2",
    tournamentId: "1",
    homeTeamId: "3", // Atlético
    awayTeamId: "4", // Sevilla
    homeScore: 1,
    awayScore: 1,
    date: new Date("2025-01-15T18:00:00"),
    matchday: 1,
    status: "finished",
    location: "Wanda Metropolitano",
  },
  
  // Jornada 2 (próximos)
  {
    id: "3",
    tournamentId: "1",
    homeTeamId: "2", // Barcelona
    awayTeamId: "3", // Atlético
    date: new Date("2025-01-22T20:00:00"),
    matchday: 2,
    status: "scheduled",
    location: "Camp Nou",
  },
  {
    id: "4",
    tournamentId: "1",
    homeTeamId: "4", // Sevilla
    awayTeamId: "1", // Real Madrid
    date: new Date("2025-01-22T18:00:00"),
    matchday: 2,
    status: "scheduled",
    location: "Ramón Sánchez-Pizjuán",
  },
];