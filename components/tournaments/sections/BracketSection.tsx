import { MatchCard } from "@/components/matches/MatchCard";
import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Match } from "@/types/Match";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, View, Dimensions } from "react-native";

type Props = {
  tournamentId: string;
};

// Orden lógico de las rondas
const ROUND_ORDER = ['round_of_16', 'quarterfinals', 'semifinals', '3rd_place', 'final'];

const getRoundName = (stage: string) => {
    switch(stage) {
        case 'round_of_16': return 'Octavos de Final';
        case 'quarterfinals': return 'Cuartos de Final';
        case 'semifinals': return 'Semifinales';
        case 'final': return 'Gran Final';
        case '3rd_place': return '3er Lugar';
        default: return stage;
    }
};

export function BracketSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  const { matches } = useMatchesStore();
  const { teams } = useTeamsStore();
  const screenWidth = Dimensions.get('window').width;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  // Agrupar partidos por ronda
  const rounds = useMemo(() => {
    const bracketMatches = matches.filter(m => m.tournamentId === tournamentId && m.stage !== 'group');
    
    // Agrupar
    const grouped: Record<string, Match[]> = {};
    bracketMatches.forEach(m => {
        if (!grouped[m.stage]) grouped[m.stage] = [];
        grouped[m.stage].push(m);
    });

    // Ordenar según flujo del torneo
    return ROUND_ORDER
        .filter(stage => grouped[stage] && grouped[stage].length > 0)
        .map(stage => ({
            id: stage,
            title: getRoundName(stage),
            matches: grouped[stage]
        }));

  }, [matches, tournamentId]);

  if (rounds.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-10 opacity-50">
            <Ionicons name="git-network-outline" size={64} color={colors.textSecondary} />
            <Text className="mt-4 font-medium" style={{ color: colors.textSecondary }}>
                Aún no hay fase eliminatoria.
            </Text>
        </View>
      );
  }

  return (
    <View className="flex-1 bg-gray-50/50" style={{ backgroundColor: colors.background }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
      >
        {rounds.map((round, index) => (
            <View 
                key={round.id} 
                style={{ 
                    width: screenWidth * 0.85, // Cada columna ocupa 85% de la pantalla
                    marginRight: 16 
                }}
            >
                {/* Título de la Ronda */}
                <View className="mb-4 flex-row items-center">
                    <View className="h-8 w-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: colors.primary }}>
                        <Text className="text-white font-bold">{index + 1}</Text>
                    </View>
                    <Text className="text-xl font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        {round.title}
                    </Text>
                </View>
                
                {/* Lista de Partidos de esa ronda */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {round.matches.map(match => (
                        <View key={match.id} className="mb-4 relative">
                            {/* Línea conectora visual (Decorativa) */}
                            {index < rounds.length - 1 && (
                                <View 
                                    className="absolute -right-6 top-1/2 w-4 h-[2px]" 
                                    style={{ backgroundColor: colors.border }} 
                                />
                            )}
                            
                            <MatchCard 
                                match={match}
                                homeTeam={getTeam(match.homeTeamId)}
                                awayTeam={getTeam(match.awayTeamId)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
        ))}
      </ScrollView>
    </View>
  );
}