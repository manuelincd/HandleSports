export interface Player {
  id: string;
  name: string;
  teamId: string;       
  tournamentId: string; 
  number?: string;      
  goals: number;      
  yellowCards: number;
  redCards: number;
}