import { useTeamsStore } from "@/store/useTeams";
import { usePlayersStore } from "@/store/usePlayers"; // <--- 1. IMPORTAR STORE DE JUGADORES
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Image, Text, View, ActivityIndicator, Pressable } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
};

export function TeamsSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  
  const { teams, isLoading: loadingTeams, fetchTeams } = useTeamsStore();
  // 2. OBTENER JUGADORES PARA CALCULAR EL CONTADOR REAL
  const { players, fetchPlayers, isLoading: loadingPlayers } = usePlayersStore();

  useEffect(() => {
    // Cargamos ambos datos al montar
    fetchTeams();
    fetchPlayers();
  }, []);

  const sortedTeams = useMemo(() => {
    const tournamentTeams = teams.filter(t => t.tournamentId === tournamentId);
    // Ordenar Alfabéticamente (A-Z)
    return tournamentTeams.sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, tournamentId]);

  // 3. HELPER PARA CONTAR JUGADORES
  const getPlayerCount = (teamId: string) => {
    return players.filter(p => p.teamId === teamId).length;
  };

  if ((loadingTeams || loadingPlayers) && sortedTeams.length === 0) {
      return (
          <View className="py-10">
              <ActivityIndicator size="small" color={colors.primary} />
          </View>
      );
  }

  return (
    <View className="flex-1 pb-8">
      {sortedTeams.length > 0 ? (
        <>
          <View className="mb-3 px-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.textSecondary }}
            >
              {sortedTeams.length} {sortedTeams.length === 1 ? "EQUIPO REGISTRADO" : "EQUIPOS REGISTRADOS"}
            </Text>
          </View>

          {sortedTeams.map((team) => {
            // Calculamos la cantidad real en vivo
            const playerCount = getPlayerCount(team.id);

            return (
                <Pressable
                key={team.id}
                onPress={() => router.push(`/tournament/${tournamentId}/team-details/${team.id}` as any)}
                className="flex-row items-center p-4 mb-3 rounded-2xl border active:opacity-70"
                style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                }}
                >
                {/* Logo */}
                <Image
                    source={team.logoUrl ? { uri: team.logoUrl } : placeholder}
                    className="w-12 h-12 rounded-full mr-4 bg-gray-100"
                />

                {/* Info del equipo */}
                <View className="flex-1">
                    <Text
                    className="text-lg font-bold mb-1"
                    style={{ color: colors.text }}
                    >
                    {team.name}
                    </Text>
                    
                    <View className="flex-row items-center">
                        {/* Capitán */}
                        {team.captain ? (
                            <View className="flex-row items-center mr-3">
                                {/* 4. CORRECCIÓN ICONO: Usamos 'ribbon' para capitán */}
                                <Ionicons name="ribbon" size={14} color={colors.primary} />
                                <Text className="text-xs ml-1 font-medium" style={{ color: colors.textSecondary }}>
                                    Cap: {team.captain}
                                </Text>
                            </View>
                        ) : (
                            // Si no hay capitán, mostramos contador
                            <View className="flex-row items-center">
                                <Ionicons name="people" size={14} color={colors.textSecondary} />
                                <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                                    {playerCount} Jugadores
                                </Text>
                            </View>
                        )}

                        {/* Si hay capitán, mostramos el contador al lado también (opcional) */}
                        {team.captain && (
                             <View className="flex-row items-center ml-2 border-l pl-2" style={{ borderColor: colors.border }}>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                    {playerCount} Jug.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Flecha indicando click */}
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
                
                </Pressable>
            );
          })}
        </>
      ) : (
        <View
          className="items-center justify-center py-12 rounded-2xl border-2 border-dashed mx-1"
          style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
          }}
        >
          <Ionicons
            name="people-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            className="text-base mt-4 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Aún no hay equipos registrados
          </Text>
        </View>
      )}
    </View>
  );
}