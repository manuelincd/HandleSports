export type Team = {
  id: string;
  name: string;
  logoUrl: string | null;
  tournamentId: string;

  captain: string | null;

  group?: string | null;

  players?: number;

  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;

    goalDifference?: number;

    points: number;
  };

  createdAt?: any;
};