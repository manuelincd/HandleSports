// types/Tournament.ts
import { Sport } from "./Sport";

export type TournamentFormat =
  | "league"        // Liga (todos vs todos)
  | "knockout"      // Eliminación directa
  | "mixed";        // Combinado (grupos + eliminación)

export type TournamentSection =
  | "matchdays"     // Jornadas/Rondas
  | "standings"     // Tabla de posiciones
  | "teams"         // Equipos
  | "stats"         // Estadísticas
  | "bracket"       // Cuadro de eliminación
  | "groups";       // Grupos (para formato mixto)

export type TournamentStatus = 
  | "draft"         // En creación
  | "upcoming"      // Próximo a iniciar
  | "live"          // En curso
  | "finished";     // Finalizado

export type Tournament = {
  id: string;
  name: string;
  sportId: Sport["id"];
  location: string;
  teamsCount: number;
  logoUrl?: string;
  
  format: TournamentFormat;
  status?: TournamentStatus;
  
  sections: TournamentSection[];
  
  // Metadata
  createdBy?: string;
  createdAt?: Date;
  startDate?: Date;
  endDate?: Date;
  
  // Stats calculadas
  matchesCount?: number;
  roundsCount?: number;
};