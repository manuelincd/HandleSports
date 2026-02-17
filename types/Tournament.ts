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

export interface Season {
  id: string;   
  name: string; 
  isActive: boolean;
}

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
  
  seasons: Season[];
  activeSeasonId: string;
  sections: TournamentSection[];
  
  createdBy?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  
  matchesCount?: number;
  roundsCount?: number;

  winPoints?: number;
  drawPoints?: number;
  lossPoints?: number;
};