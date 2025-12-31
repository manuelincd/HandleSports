// types/Tournament.ts
import { Sport } from "./Sport";

export type TournamentFormat =
  | "league"        
  | "knockout"      
  | "mixed";        

export type TournamentSection =
  | "matchdays"     
  | "standings"     
  | "teams"         
  | "stats"         
  | "bracket"       
  | "groups";       

export type TournamentStatus = 
  | "draft"         
  | "upcoming"      
  | "live"          
  | "finished";     

export type Tournament = {
  id: string;
  name: string;
  sportId: Sport["id"];
  location: string;
  teamsCount: number;
  ownerId: string;
  logoUrl?: string;
  
  format: TournamentFormat;
  status?: TournamentStatus;
  
  sections: TournamentSection[];
  
  // Metadata
  createdBy?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  
  // Stats calculadas
  matchesCount?: number;
  roundsCount?: number;
};