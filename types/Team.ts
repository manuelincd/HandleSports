export type Team = {
  id: string;
  name: string;
  logoUrl: string | null;
  tournamentId: string;
  
  // Información de contacto / Capitán
  captain: string | null;
  
  // Fase de Grupos
  // El ? permite que sea undefined, lo cual es útil si el campo no existe aún en Firebase
  group?: string | null; 

  // Contador desnormalizado (opcional)
  players?: number;

  // Estadísticas
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    
    // OPCIÓN A: Lo hacemos opcional (?) porque lo calculamos en el frontend
    // OPCIÓN B: Si lo quieres en BD, debes inicializarlo en 0 en useTeamsStore
    goalDifference?: number; 
    
    points: number;
  };
  
  // Siempre es bueno tener fecha de creación para ordenar listas
  createdAt?: any; 
};