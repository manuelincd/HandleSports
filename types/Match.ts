export type Scorer = {
  playerId: string;
  teamId: string;
  playerName: string;
  goals: number;
  yellowCards: number;
  redCards: number;
};

export type MatchStage = 
  | 'group'        
  | 'round_of_16'   
  | 'quarterfinals' 
  | 'semifinals'    
  | 'final'         
  | '3rd_place';    

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: any;
  matchday: number;
  location?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'finished' | 'canceled';
  
  stats?: Scorer[]; 
  stage: MatchStage; 
  group?: string;    
}