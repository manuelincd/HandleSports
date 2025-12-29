export type Team = {
  id: string;
  name: string;
  logoUrl?: string;
  tournamentId: string;
  captain?: string;
  players?: number;
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  };
};