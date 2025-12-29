// components/tournaments/TournamentSectionContent.tsx

import { TournamentSection } from "@/types/Tournament";
import { TeamsSection } from "./sections/TeamsSection";
import { StandingsSection } from "./sections/StandingsSection";
import { MatchdaysSection } from "./sections/MatchdaysSection";
import { StatsSection } from "./sections/StatsSection";
import { BracketSection } from "./sections/BracketSection";
import { GroupsSection } from "./sections/GroupsSection";
import { View, Text } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  section: TournamentSection;
  tournamentId: string;
};

export function TournamentSectionContent({ section, tournamentId }: Props) {
  const colors = useThemeColors();

  switch (section) {
    case "teams":
      return <TeamsSection tournamentId={tournamentId} />;
    
    case "matchdays":
      return <MatchdaysSection tournamentId={tournamentId} />;
    
    case "standings":
      return <StandingsSection tournamentId={tournamentId} />;
    
    case "stats":
      return <StatsSection tournamentId={tournamentId} />;
    
    case "bracket":
      return <BracketSection tournamentId={tournamentId} />;
    
    case "groups":
      return <GroupsSection tournamentId={tournamentId} />;
    
    default:
      return (
        <View
          className="p-6 rounded-2xl items-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons
            name="construct-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            className="text-lg font-semibold mt-4 mb-2"
            style={{ color: colors.text }}
          >
            En Desarrollo
          </Text>
          <Text
            className="text-center"
            style={{ color: colors.textSecondary }}
          >
            Esta sección estará disponible pronto
          </Text>
        </View>
      );
  }
}