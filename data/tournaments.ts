import { Tournament } from "@/types/Tournament";

export const TOURNAMENTS: Tournament[] = [
  {
    id: "1", 
    name: "La Liga 2024",
    sportId: "football",
    location: "España",
    teamsCount: 5,
    format: "league",
    sections: ["teams", "matchdays", "standings", "stats"],
  },
  {
    id: "2", 
    name: "NBA Championship",
    sportId: "basketball",
    location: "USA",
    teamsCount: 2,
    format: "knockout",
    sections: ["teams", "bracket", "matchdays", "stats"],
  },
  {
    id: "3", 
    name: "NFL Championship",
    sportId: "football",
    location: "USA",
    teamsCount: 2,
    format: "mixed",
    sections: ["teams", "bracket", "matchdays", "stats"],
  },
];
