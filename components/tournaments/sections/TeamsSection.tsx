import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
};

export function TeamsSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  const { getTeamsByTournament } = useTeamsStore();
  const teams = getTeamsByTournament(tournamentId);

  // Ordenar por puntos
  const sortedTeams = [...teams].sort((a, b) => 
    (b.stats?.points || 0) - (a.stats?.points || 0)
  );

  return (
    <View className="flex-1">
      {sortedTeams.length > 0 ? (
        <>
          {/* Header */}
          <View className="mb-3">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.textSecondary }}
            >
              {sortedTeams.length} EQUIPOS
            </Text>
          </View>

          {/* Lista de equipos */}
          {sortedTeams.map((team, index) => (
            <View
              key={team.id}
              className="flex-row items-center p-4 mb-3 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              {/* Posición */}
              <View className="w-8 items-center mr-3">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  {index + 1}
                </Text>
              </View>

              {/* Logo */}
              <Image
                source={team.logoUrl ? { uri: team.logoUrl } : placeholder}
                className="w-12 h-12 rounded-full mr-3"
              />

              {/* Info del equipo */}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold mb-1"
                  style={{ color: colors.text }}
                >
                  {team.name}
                </Text>
                {team.captain && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="person"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-xs ml-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {team.captain}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              {team.stats && (
                <View className="items-end">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.primary }}
                  >
                    {team.stats.points}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    pts
                  </Text>
                </View>
              )}
            </View>
          ))}
        </>
      ) : (
        <View
          className="items-center justify-center py-12 rounded-2xl"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons
            name="people-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            className="text-base mt-4"
            style={{ color: colors.textSecondary }}
          >
            No hay equipos en este torneo
          </Text>
        </View>
      )}
    </View>
  );
}