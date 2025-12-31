import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
};

type TeamStats = {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; 
  ga: number; 
  gd: number; 
  points: number;
};

export function StandingsSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  
  // 1. CONEXIÓN A LOS STORES
  const { matches, isLoading: loadingMatches } = useMatchesStore();
  const { teams, isLoading: loadingTeams } = useTeamsStore();

  // 2. CEREBRO MATEMÁTICO (useMemo para rendimiento)
  const tableData = useMemo(() => {
    // A. Filtramos equipos y partidos del torneo
    const tournamentTeams = teams.filter(t => t.tournamentId === tournamentId);
    const tournamentMatches = matches.filter(m => 
        m.tournamentId === tournamentId && m.status === 'finished'
    );

    // B. Inicializamos el mapa de estadísticas
    const statsMap = new Map<string, TeamStats>();

    tournamentTeams.forEach(team => {
        statsMap.set(team.id, {
            teamId: team.id,
            teamName: team.name,
            logoUrl: team.logoUrl,
            played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, gd: 0, points: 0
        });
    });

    // C. Procesamos cada partido jugado
    tournamentMatches.forEach(match => {
        const home = statsMap.get(match.homeTeamId);
        const away = statsMap.get(match.awayTeamId);

        if (!home || !away) return; // Si un equipo fue borrado, ignoramos

        const hScore = match.homeScore || 0;
        const aScore = match.awayScore || 0;

        // Actualizar partidos jugados
        home.played += 1;
        away.played += 1;

        // Actualizar goles
        home.gf += hScore;
        home.ga += aScore;
        home.gd += (hScore - aScore);

        away.gf += aScore;
        away.ga += hScore;
        away.gd += (aScore - hScore);

        // Calcular Puntos y Resultados
        if (hScore > aScore) {
            // Gana Local
            home.won += 1;
            home.points += 3;
            away.lost += 1;
        } else if (hScore < aScore) {
            // Gana Visitante
            away.won += 1;
            away.points += 3;
            home.lost += 1;
        } else {
            // Empate
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
        }
    });

    // D. Convertimos a Array y Ordenamos
    return Array.from(statsMap.values()).sort((a, b) => {
        // 1. Mayor puntaje
        if (b.points !== a.points) return b.points - a.points;
        // 2. Mayor diferencia de gol
        if (b.gd !== a.gd) return b.gd - a.gd;
        // 3. Más goles a favor
        return b.gf - a.gf;
    });

  }, [matches, teams, tournamentId]);

  if (loadingMatches || loadingTeams) {
      return <ActivityIndicator size="large" color={colors.primary} className="mt-10" />;
  }

  if (tableData.length === 0) {
    return (
      <View className="items-center py-10 opacity-50">
        <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
        <Text className="mt-4" style={{ color: colors.textSecondary }}>Aún no hay equipos en la tabla</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pb-8">
      {/* HEADER DE LA TABLA */}
      <View 
        className="flex-row py-3 px-4 mb-2 rounded-xl"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="w-8 font-bold text-xs text-center" style={{ color: colors.textSecondary }}>#</Text>
        <Text className="flex-1 font-bold text-xs" style={{ color: colors.textSecondary }}>EQUIPO</Text>
        <View className="flex-row w-48 justify-between">
            <Text className="w-8 font-bold text-xs text-center" style={{ color: colors.textSecondary }}>PJ</Text>
            <Text className="w-8 font-bold text-xs text-center" style={{ color: colors.textSecondary }}>DG</Text>
            <Text className="w-8 font-bold text-xs text-center" style={{ color: colors.textSecondary }}>PTS</Text>
        </View>
      </View>

      {/* FILAS DE LA TABLA */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {tableData.map((team, index) => {
            // Colores para zonas de clasificación (Opcional)
            const isChampion = index === 0;
            const isPromotion = index < 4; 
            const isRelegation = index >= tableData.length - 2 && tableData.length > 4;

            let positionColor = "transparent";
            if (isChampion) positionColor = "#fbbf24"; // Dorado
            // else if (isPromotion) positionColor = "#3b82f6"; // Azul Champions
            // else if (isRelegation) positionColor = "#ef4444"; // Rojo Descenso

            return (
                <View 
                    key={team.teamId}
                    className="flex-row items-center py-3 px-4 mb-2 rounded-2xl border"
                    style={{ 
                        backgroundColor: colors.surface,
                        borderColor: isChampion ? "#fbbf24" : colors.border
                    }}
                >
                    {/* Posición */}
                    <View className="w-8 items-center justify-center">
                        <View 
                            className="w-6 h-6 items-center justify-center rounded-full"
                            style={{ backgroundColor: isChampion ? positionColor : "transparent" }}
                        >
                            <Text 
                                className="font-bold text-sm" 
                                style={{ color: isChampion ? "#fff" : colors.text }}
                            >
                                {index + 1}
                            </Text>
                        </View>
                    </View>

                    {/* Equipo */}
                    <View className="flex-1 flex-row items-center mr-2">
                        <Image 
                            source={team.logoUrl ? { uri: team.logoUrl } : placeholder} 
                            className="w-8 h-8 rounded-full mr-2 bg-gray-100"
                        />
                        <Text 
                            numberOfLines={1} 
                            className="font-semibold text-sm" 
                            style={{ color: colors.text }}
                        >
                            {team.teamName}
                        </Text>
                    </View>

                    {/* Estadísticas */}
                    <View className="flex-row w-48 justify-between items-center">
                        <Text className="w-8 text-center text-sm" style={{ color: colors.text }}>{team.played}</Text>
                        <Text className="w-8 text-center text-sm" style={{ color: colors.textSecondary }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</Text>
                        <Text className="w-8 text-center font-bold text-base" style={{ color: colors.primary }}>{team.points}</Text>
                    </View>
                </View>
            );
        })}
        
        {/* Leyenda pequeña al final */}
        <View className="flex-row justify-center mt-4 gap-4">
            <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#fbbf24" }} />
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Líder</Text>
            </View>
        </View>
        <Text className="text-xs text-center mt-2" style={{ color: colors.textSecondary }}>
            * La clasificación puede variar según el formato del torneo
        </Text>
      </ScrollView>
    </View>
  );
}