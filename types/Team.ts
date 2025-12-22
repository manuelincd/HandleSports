export type Team = {
  id: string;
  name: string;
  logoUrl?: string;
  tournamentId: string;
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
};