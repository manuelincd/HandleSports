import { Tournament } from "@/types/Tournament";

export const TOURNAMENTS: Tournament[] = [
  {
    id: "1",
    name: "Liga Municipal",
    sportId: "handball",
    location: "Colima",
    teamsCount: 12,
    format: "league",
    sections: ["matchdays", "standings", "teams", "stats"],
  },
  {
    id: "2",
    name: "Copa Relámpago",
    sportId: "football",
    location: "Colima",
    teamsCount: 8,
    format: "knockout",
    sections: ["matchdays", "teams"],
  },
  {
    id: "3",
    name: "Copa de Oro",
    sportId: "football",
    location: "Colima",
    teamsCount: 8,
    format: "knockout",
    sections: ["matchdays", "teams"],
  },
  {
    id: "4",
    name: "Copa de Oro",
    sportId: "football",
    location: "Colima",
    teamsCount: 8,
    format: "knockout",
    sections: ["matchdays", "teams"],
  },

];
