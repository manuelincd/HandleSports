export type Match = {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  date: Date;
  location?: string;
  round?: number;
  matchday?: number;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';
};