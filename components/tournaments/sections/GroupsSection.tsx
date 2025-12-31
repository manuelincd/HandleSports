import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, View, Image, ActivityIndicator } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
};

// Función de cálculo pura (fuera del componente para rendimiento)
const calculateGroupStandings = (teams: any[], matches: any[]) => {
    return teams.map(team => {
        // Buscamos solo partidos YA JUGADOS de este equipo
        const teamMatches = matches.filter(m => 
            (m.homeTeamId === team.id || m.awayTeamId === team.id) && m.status === 'finished'
        );
        
        let points = 0;
        let gd = 0;
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;

        teamMatches.forEach(m => {
            const isHome = m.homeTeamId === team.id;
            const goalsFor = isHome ? m.homeScore : m.awayScore;
            const goalsAgainst = isHome ? m.awayScore : m.homeScore;
            
            played++;
            gd += (goalsFor - goalsAgainst);

            if (goalsFor > goalsAgainst) {
                points += 3;
                won++;
            } else if (goalsFor === goalsAgainst) {
                points += 1;
                drawn++;
            } else {
                lost++;
            }
        });

        return { 
            ...team, 
            stats: { points, gd, played, won, drawn, lost } 
        };
    }).sort((a, b) => {
        // Criterios de desempate: 1. Puntos, 2. Diferencia de Goles, 3. Goles a favor (opcional, aquí simplificado)
        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        return b.stats.gd - a.stats.gd;
    });
};

export function GroupsSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  const { matches, fetchMatches } = useMatchesStore();
  const { teams, fetchTeams } = useTeamsStore();

  // 1. Obtener datos limpios
  const tournamentTeams = useMemo(() => teams.filter(t => t.tournamentId === tournamentId), [teams, tournamentId]);
  const tournamentMatches = useMemo(() => matches.filter(m => m.tournamentId === tournamentId), [matches, tournamentId]);

  // 2. Detectar Grupos basándonos en los EQUIPOS (Más robusto)
  const groupsList = useMemo(() => {
    // Extraemos las letras de grupo asignadas a los equipos (ej: "A", "B")
    const assignedGroups = [...new Set(tournamentTeams.map(t => t.group).filter(g => g))].sort();
    
    // Si no hay grupos asignados, asumimos tabla general
    if (assignedGroups.length === 0) {
        return [{ id: 'general', name: "Tabla General", teams: tournamentTeams }];
    }

    // Retornamos estructura lista para renderizar
    return assignedGroups.map(groupName => ({
        id: groupName,
        name: `Grupo ${groupName}`,
        // Filtramos estrictamente los equipos que pertenecen a este grupo
        teams: tournamentTeams.filter(t => t.group === groupName)
    }));
  }, [tournamentTeams]);

  if (groupsList.length === 0 && tournamentTeams.length === 0) {
      return (
          <View className="py-12 items-center">
             <ActivityIndicator size="small" color={colors.primary} />
          </View>
      );
  }

  return (
    <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
    >
      {groupsList.map((group) => {
          // Calculamos la tabla para ESTE grupo específico
          // Pasamos TODOS los partidos del torneo, la función filtrará los relevantes
          const standings = calculateGroupStandings(group.teams, tournamentMatches);

          return (
            <View 
                key={group.id} 
                className="mb-8 rounded-2xl overflow-hidden border shadow-sm" 
                style={{ 
                    borderColor: colors.border, 
                    backgroundColor: colors.surface,
                    // Sombra suave para separar visualmente
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 3
                }}
            >
                {/* --- HEADER DEL GRUPO --- */}
                <View 
                    className="px-4 py-3 border-b flex-row justify-between items-center" 
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                    <Text className="font-bold text-lg" style={{ color: colors.text }}>
                        {group.name}
                    </Text>
                    <Ionicons name="grid" size={16} color={colors.primary} />
                </View>

                {/* --- ENCABEZADOS DE COLUMNAS --- */}
                <View className="flex-row py-2 px-3 border-b" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                    <Text className="w-8 text-center text-[10px] font-bold opacity-50" style={{ color: colors.text }}>POS</Text>
                    <Text className="flex-1 text-[10px] font-bold opacity-50 ml-1" style={{ color: colors.text }}>EQUIPO</Text>
                    <Text className="w-8 text-center text-[10px] font-bold opacity-50" style={{ color: colors.text }}>PJ</Text>
                    <Text className="w-8 text-center text-[10px] font-bold opacity-50" style={{ color: colors.text }}>DG</Text>
                    <Text className="w-8 text-center text-[10px] font-bold" style={{ color: colors.primary }}>PTS</Text>
                </View>
                
                {/* --- FILAS DE EQUIPOS --- */}
                {standings.length > 0 ? (
                    standings.map((team, index) => {
                        const isTop = index < 2; // Resaltar los 2 primeros (zona de clasificación)

                        return (
                            <View 
                                key={team.id} 
                                className="flex-row items-center py-3 px-3 border-b last:border-0" 
                                style={{ 
                                    borderColor: colors.border,
                                    backgroundColor: isTop ? `${colors.primary}05` : 'transparent' // Fondo sutil para líderes
                                }}
                            >
                                {/* Posición */}
                                <View className="w-8 items-center justify-center">
                                    <View 
                                        className="w-6 h-6 rounded-full items-center justify-center"
                                        style={{ backgroundColor: index === 0 ? colors.primary : (index === 1 ? colors.primaryLight : 'transparent') }}
                                    >
                                        <Text 
                                            className="font-bold text-xs" 
                                            style={{ color: index === 0 ? '#fff' : (index === 1 ? colors.primary : colors.textSecondary) }}
                                        >
                                            {index + 1}
                                        </Text>
                                    </View>
                                </View>

                                {/* Equipo */}
                                <View className="flex-1 flex-row items-center ml-1">
                                    <Image 
                                        source={team.logoUrl ? { uri: team.logoUrl } : placeholder} 
                                        className="w-6 h-6 rounded-full mr-2 bg-gray-100"
                                    />
                                    <Text 
                                        className="font-semibold text-sm" 
                                        numberOfLines={1} 
                                        style={{ color: colors.text }}
                                    >
                                        {team.name}
                                    </Text>
                                </View>

                                {/* Stats */}
                                <Text className="w-8 text-center text-sm" style={{ color: colors.text }}>{team.stats.played}</Text>
                                <Text className="w-8 text-center text-sm" style={{ color: colors.textSecondary }}>{team.stats.gd > 0 ? `+${team.stats.gd}` : team.stats.gd}</Text>
                                <Text className="w-8 text-center font-bold text-base" style={{ color: colors.primary }}>{team.stats.points}</Text>
                            </View>
                        );
                    })
                ) : (
                    <View className="py-6 items-center opacity-50">
                        <Text style={{ color: colors.textSecondary }}>No hay equipos en este grupo</Text>
                    </View>
                )}
            </View>
          );
      })}

      {groupsList.length === 0 && (
        <View className="items-center py-10 opacity-50">
            <Ionicons name="albums-outline" size={48} color={colors.textSecondary} />
            <Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>
                No hay grupos configurados.
            </Text>
            <Text className="text-xs text-center mt-1" style={{ color: colors.textSecondary }}>
                Ve a "Equipos" para asignar los grupos.
            </Text>
        </View>
      )}
    </ScrollView>
  );
}