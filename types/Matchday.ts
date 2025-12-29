export type Matchday = {
  id: string;
  tournamentId: string;
  number: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  matches: string[];
};