import { TournamentSection } from "@/types/Tournament";
import { View, Text } from "react-native";

type Props = {
  section: TournamentSection;
  tournamentId: string;
};

export function TournamentSectionContent({ section, tournamentId }: Props) {
  switch (section) {
    case "matchdays":
      return <MatchdaysSection tournamentId={tournamentId} />;
    
    case "standings":
      return <StandingsSection tournamentId={tournamentId} />;
    
    case "teams":
      return <TeamsSection tournamentId={tournamentId} />;
    
    case "stats":
      return <StatsSection tournamentId={tournamentId} />;
    
    case "bracket":
      return <BracketSection tournamentId={tournamentId} />;
    
    case "groups":
      return <GroupsSection tournamentId={tournamentId} />;
    
    default:
      return (
        <View>
          <Text>Sección no disponible</Text>
        </View>
      );
  }
}