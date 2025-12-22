import { Tournament } from "@/types/Tournament";
import { SPORTS } from "@/data/sports";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

const placeholder = require("@/assets/images/tournament-placeholder.png");

type Props = {
  tournament: Tournament;
  showStats?: boolean;
  stats?: {
    teams?: number;
    matches?: number;
    rounds?: number;
  };
};

export function TournamentHeader({ tournament, showStats = true, stats }: Props) {
  const colors = useThemeColors();
  const sport = SPORTS.find((s) => s.id === tournament.sportId);

  return (
    <View className="p-4" style={{ backgroundColor: colors.surface }}>
      <View className="flex-row items-center">
        <Image
          source={
            tournament.logoUrl ? { uri: tournament.logoUrl } : placeholder
          }
          className="w-20 h-20 rounded-xl mr-4"
        />
        <View className="flex-1">
          <Text
            className="text-xl font-bold mb-1"
            style={{ color: colors.text }}
          >
            {tournament.name}
          </Text>
          <View className="flex-row items-center mb-1">
            <Text className="mr-2">{sport?.emoji}</Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {sport?.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text
              className="text-sm ml-1"
              style={{ color: colors.textSecondary }}
            >
              {tournament.location}
            </Text>
          </View>
        </View>
      </View>

      {showStats && (
        <View
          className="flex-row justify-around mt-4 pt-4 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {stats?.teams ?? tournament.teamsCount}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Equipos
            </Text>
          </View>
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {stats?.matches ?? 0}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Partidos
            </Text>
          </View>
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {stats?.rounds ?? 0}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Jornadas
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}