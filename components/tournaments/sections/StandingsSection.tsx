import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useEffect } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
  seasonId?: string;
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

export function StandingsSection({ tournamentId, seasonId }: Props) {
  const colors = useThemeColors();
  
  const { matches, isLoading: loadingMatches, fetchMatches } = useMatchesStore();
  const { teams, isLoading: loadingTeams, fetchTeams } = useTeamsStore();
  const { tournaments } = useTournamentsStore();
  
  const tournament = tournaments.find(t => t.id === tournamentId);

  const seasonName = useMemo(() => {
      if (!tournament || !seasonId) return null;
      return tournament.seasons?.find(s => s.id === seasonId)?.name || null;
  }, [tournament, seasonId]);

  useEffect(() => {
     if (tournamentId) {
         fetchMatches(tournamentId, seasonId);
     }
     fetchTeams();
  }, [tournamentId, seasonId]);

  const tableData = useMemo(() => {
    // CONFIGURACIÓN DE PUNTOS 
    const POINTS_WIN = tournament?.winPoints ?? 3;
    const POINTS_DRAW = tournament?.drawPoints ?? 1;
    const POINTS_LOSS = tournament?.lossPoints ?? 0;

    const tournamentTeams = teams.filter(t => t.tournamentId === tournamentId);
    
    const tournamentMatches = matches.filter(m => 
        m.tournamentId === tournamentId && 
        m.status === 'finished' && 
        (seasonId ? m.seasonId === seasonId : true)
    );

    const statsMap = new Map<string, TeamStats>();

    // Inicializar equipos
    tournamentTeams.forEach(team => {
        statsMap.set(team.id, {
            teamId: team.id,
            teamName: team.name,
            logoUrl: team.logoUrl,
            played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, gd: 0, points: 0
        });
    });

    // Calcular estadísticas
    tournamentMatches.forEach(match => {
        if (match.stage !== 'group') return; 

        const home = statsMap.get(match.homeTeamId);
        const away = statsMap.get(match.awayTeamId);

        if (!home || !away) return;

        const hScore = match.homeScore || 0;
        const aScore = match.awayScore || 0;

        home.played += 1;
        away.played += 1;

        home.gf += hScore;
        home.ga += aScore;
        home.gd += (hScore - aScore);

        away.gf += aScore;
        away.ga += hScore;
        away.gd += (aScore - hScore);

        if (hScore > aScore) {
            // Gana Local
            home.won += 1;
            home.points += POINTS_WIN; 
            
            // Pierde Visitante
            away.lost += 1;
            away.points += POINTS_LOSS; 

        } else if (hScore < aScore) {
            // Gana Visitante
            away.won += 1;
            away.points += POINTS_WIN; 
            
            // Pierde Local
            home.lost += 1;
            home.points += POINTS_LOSS; 

        } else {
            // Empate
            home.drawn += 1;
            home.points += POINTS_DRAW; 
            
            away.drawn += 1;
            away.points += POINTS_DRAW; 
        }
    });

    return Array.from(statsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });

  }, [matches, teams, tournamentId, seasonId, tournament]); 

  if (loadingMatches || loadingTeams) {
      return <ActivityIndicator size="large" color={colors.primary} className="mt-10" />;
  }

  if (tableData.length === 0) {
    return (
      <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
                Tabla General
            </Text>
            {seasonName && (
                <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
                    <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
                        {seasonName}
                    </Text>
                </View>
            )}
          </View>

          <View className="items-center py-10 opacity-50 border-2 border-dashed rounded-2xl mx-4" style={{ borderColor: colors.border }}>
            <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
            <Text className="mt-4" style={{ color: colors.textSecondary }}>Aún no hay equipos en la tabla</Text>
          </View>
      </View>
    );
  }

  return (
    <View className="flex-1 pb-8">
      
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
          Tabla General
        </Text>
        
        {seasonName && (
             <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
                 <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
                     {seasonName}
                 </Text>
             </View>
        )}
      </View>

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {tableData.map((team, index) => {
            const isChampion = index === 0;
            let positionColor = "transparent";
            if (isChampion) positionColor = "#fbbf24"; 

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
        
        <View className="flex-row justify-center mt-4 gap-4">
            <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#fbbf24" }} />
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Líder</Text>
            </View>
        </View>
        <Text className="text-xs text-center mt-2" style={{ color: colors.textSecondary }}>
            * La clasificación puede variar según el reglamento del torneo
        </Text>
      </ScrollView>
    </View>
  );
}