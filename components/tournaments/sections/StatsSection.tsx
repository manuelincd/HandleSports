import { usePlayersStore } from "@/store/usePlayers";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";

// 1. IMPORTAR STORE DE PARTIDOS (Para filtrar goles por temporada)
import { useMatchesStore } from "@/store/useMatches";

type Props = {
  tournamentId: string;
  seasonId?: string;
};

type StatKey = 'goals' | 'yellowCards' | 'redCards';

type StatConfig = {
  key: StatKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const getSportStatsConfig = (sportId: string, colors: any): StatConfig[] => {
  const baseGoalConfig = { key: 'goals' as StatKey, color: colors.primary };

  switch (sportId) {
    case 'soccer':
    case 'futsal':
      return [
        { ...baseGoalConfig, label: 'Goles', icon: 'football' },
        { key: 'yellowCards', label: 'Amarillas', icon: 'square', color: '#EAB308' },
        { key: 'redCards', label: 'Rojas', icon: 'square', color: '#EF4444' },
      ];

    case 'basketball':
      return [
        { ...baseGoalConfig, label: 'Puntos', icon: 'basketball' }
      ];

    case 'volleyball':
    case 'tennis':
    case 'padel':
      return [
        { ...baseGoalConfig, label: 'Sets/Puntos', icon: 'tennisball' }
      ];

    case 'baseball':
      return [
        { ...baseGoalConfig, label: 'Carreras', icon: 'baseball' }
      ];

    case 'handball':
      return [
        { ...baseGoalConfig, label: 'Goles', icon: 'football' },
        { key: 'redCards', label: 'Rojas', icon: 'square', color: '#EF4444' },
      ];

    default:
      return [
        { ...baseGoalConfig, label: 'Anotaciones', icon: 'trophy' }
      ];
  }
};

export function StatsSection({ tournamentId, seasonId }: Props) {
  const colors = useThemeColors();

  const { players, isLoading: loadingPlayers, fetchPlayers } = usePlayersStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { tournaments } = useTournamentsStore();
  // Necesitamos los partidos para calcular las stats en vivo
  const { matches, fetchMatches } = useMatchesStore();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    if (tournamentId) {
        fetchMatches(tournamentId, seasonId);
    }
  }, [tournamentId, seasonId]);

  const tournament = tournaments.find(t => t.id === tournamentId);
  const sportId = tournament?.sportId || 'default';

  // OBTENER NOMBRE DE TEMPORADA
  const seasonName = useMemo(() => {
    if (!tournament || !seasonId) return null;
    return tournament.seasons?.find(s => s.id === seasonId)?.name || null;
  }, [tournament, seasonId]);

  const tabsConfig = useMemo(() => getSportStatsConfig(sportId, colors), [sportId, colors]);

  const [activeTabKey, setActiveTabKey] = useState<StatKey>('goals');

  useEffect(() => {
    if (tabsConfig.length > 0) {
      setActiveTabKey(tabsConfig[0].key);
    }
  }, [sportId, tabsConfig]);

  // CÁLCULO DE ESTADÍSTICAS EN VIVO
  const sortedPlayers = useMemo(() => {
    if (!tournament) return [];

    // 1. Obtener partidos relevantes (filtrados por temporada)
    const relevantMatches = matches.filter(m => 
        m.tournamentId === tournamentId && 
        m.status === 'finished' &&
        (seasonId ? m.seasonId === seasonId : true)
    );

    // 2. Sumar estadísticas manualmente desde los partidos
    const statsCounter = new Map<string, number>();

    relevantMatches.forEach(match => {
        const stats = match.stats || [];
        stats.forEach(stat => {
            const currentValue = statsCounter.get(stat.playerId) || 0;
            // @ts-ignore
            const valueToAdd = stat[activeTabKey] || 0; 
            statsCounter.set(stat.playerId, currentValue + valueToAdd);
        });
    });

    const tournamentTeamIds = teams
      .filter(t => t.tournamentId === tournamentId)
      .map(t => t.id);

    return players
      .filter(p => tournamentTeamIds.includes(p.teamId))
      .map(p => {
        // Usamos el valor calculado del contador
        const calculatedValue = statsCounter.get(p.id) || 0;
        return {
          ...p,
          activeStatValue: calculatedValue
        };
      })
      .filter(p => p.activeStatValue > 0) // Solo mostrar si tiene > 0
      .sort((a, b) => b.activeStatValue - a.activeStatValue)
      .slice(0, 50);

  }, [players, teams, matches, tournamentId, activeTabKey, seasonId, tournament]);

  const activeConfig = tabsConfig.find(t => t.key === activeTabKey) || tabsConfig[0];

  if (loadingPlayers && players.length === 0) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 pb-8">

      {/* HEADER DE SECCIÓN CON TEMPORADA */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
          Estadísticas
        </Text>

        {seasonName && (
          <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
            <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
              {seasonName}
            </Text>
          </View>
        )}
      </View>

      {/* SELECTOR DE PESTAÑAS */}
      {tabsConfig.length > 1 && (
        <View className="flex-row justify-center mb-6 gap-2">
          {tabsConfig.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTabKey(tab.key)}
              className="px-4 py-2 rounded-full flex-row items-center border"
              style={{
                backgroundColor: activeTabKey === tab.key ? tab.color : colors.surface,
                borderColor: activeTabKey === tab.key ? 'transparent' : colors.border
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTabKey === tab.key ? '#fff' : colors.textSecondary}
              />
              <Text
                className="ml-2 font-semibold"
                style={{ color: activeTabKey === tab.key ? '#fff' : colors.textSecondary }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* TÍTULO SIMPLE */}
      {tabsConfig.length === 1 && (
        <View className="mb-4 px-4">
          <Text className="font-bold text-lg" style={{ color: colors.text }}>
            Tabla de {activeConfig.label}
          </Text>
        </View>
      )}

      {/* LISTA DE JUGADORES */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => {
            const isTop3 = index < 3;
            const statValue = player.activeStatValue;
            
            // --- NUEVO: BUSCAMOS EL EQUIPO COMPLETO AQUÍ ---
            const team = teams.find(t => t.id === player.teamId);
            const teamLogo = team?.logoUrl || null;
            const teamName = team?.name || "Sin equipo";

            return (
              <View
                key={player.id}
                className="flex-row items-center py-3 px-4 mb-3 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isTop3 ? activeConfig.color + '40' : colors.border
                }}
              >
                {/* Ranking */}
                <Text
                  className={`font-bold text-lg w-8 text-center ${isTop3 ? 'scale-110' : ''}`}
                  style={{ color: isTop3 ? activeConfig.color : colors.textSecondary }}
                >
                  {index + 1}
                </Text>

                {/* Foto/Avatar */}
                <View className="relative mx-3">
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-100">
                    <Ionicons name="person" size={20} color={colors.textSecondary} />
                  </View>
                  {teamLogo && (
                    <Image
                      source={{ uri: teamLogo }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white bg-white"
                    />
                  )}
                </View>

                {/* Info (Nombre + Equipo) */}
                <View className="flex-1 justify-center">
                  <Text className="font-bold text-base" style={{ color: colors.text }}>
                    {player.name}
                  </Text>
                  {/* AQUÍ MOSTRAMOS EL NOMBRE DEL EQUIPO */}
                  <Text 
                    className="text-xs" 
                    style={{ color: colors.textSecondary }}
                    numberOfLines={1}
                  >
                    {teamName}
                  </Text>
                </View>

                {/* Valor */}
                <View className="items-end">
                  <Text className="text-2xl font-black" style={{ color: colors.text }}>
                    {statValue}
                  </Text>
                  <Text className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: colors.text }}>
                    {activeConfig.label}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center py-12 opacity-50 border-2 border-dashed rounded-2xl mx-4" style={{ borderColor: colors.border }}>
            <Ionicons name="stats-chart-outline" size={48} color={colors.textSecondary} />
            <Text className="mt-4 font-medium" style={{ color: colors.textSecondary }}>
              Aún no hay registros de {activeConfig.label.toLowerCase()}
            </Text>
            <Text className="text-xs mt-1 max-w-[200px] text-center" style={{ color: colors.textSecondary }}>
              Registra los resultados en las jornadas para ver la tabla.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}