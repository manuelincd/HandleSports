import { TournamentFormat, TournamentSection } from "@/types/Tournament";

export function getSectionsForFormat(
  format: TournamentFormat
): TournamentSection[] {
  switch (format) {
    case "league":
      return ["matchdays", "standings", "teams", "stats"];
    
    case "knockout":
      return ["bracket", "teams", "stats"];
    
    case "mixed":
      return ["groups", "bracket", "standings", "teams", "stats"];
    
    default:
      return ["teams"];
  }
}

export function getFormatLabel(format: TournamentFormat): string {
  const labels = {
    league: "Liga (Todos vs Todos)",
    knockout: "Eliminación Directa",
    mixed: "Formato Mixto (Grupos + Eliminación)",
  };
  return labels[format];
}

export function getFormatIcon(format: TournamentFormat): string {
  const icons = {
    league: "📊",
    knockout: "🏆",
    mixed: "⚡",
  };
  return icons[format];
}