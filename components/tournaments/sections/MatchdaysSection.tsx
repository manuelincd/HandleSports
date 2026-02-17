import { MatchCard } from "@/components/matches/MatchCard";
import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
// 1. IMPORTAR STORE DE TORNEOS PARA BUSCAR EL NOMBRE DE LA TEMPORADA
import { useTournamentsStore } from "@/store/useTournaments"; 
import { useThemeColors } from "@/theme/useThemeColors";
import { Match, MatchStage } from "@/types/Match";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

const STAGE_LABELS: Record<MatchStage, string> = {
  'group': 'Fase de Grupos',
  'round_of_16': 'Octavos',
  'quarterfinals': 'Cuartos',
  'semifinals': 'Semis',
  'final': 'Final',
  '3rd_place': '3er Lugar'
};

const STAGE_ORDER: MatchStage[] = ['round_of_16', 'quarterfinals', 'semifinals', '3rd_place', 'final'];

type Props = {
  tournamentId: string;
  seasonId?: string; 
};

type SelectorItem = {
    id: string;
    type: 'matchday' | 'stage';
    label: string;
    subLabel: string;
    matches: Match[];
    total: number;
    finished: number;
    isCompleted: boolean;
};

export function MatchdaysSection({ tournamentId, seasonId }: Props) {
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);

  const { matches: allMatches, fetchMatches, isLoading: isLoadingMatches } = useMatchesStore();
  const { teams: allTeams, fetchTeams, isLoading: isLoadingTeams } = useTeamsStore();
  
  // 2. OBTENER DATOS DEL TORNEO
  const { tournaments } = useTournamentsStore();
  const tournament = tournaments.find(t => t.id === tournamentId);

  // 3. OBTENER NOMBRE DE LA TEMPORADA
  const seasonName = useMemo(() => {
      if (!tournament || !seasonId) return null;
      return tournament.seasons?.find(s => s.id === seasonId)?.name || null;
  }, [tournament, seasonId]);

  // CARGAR DATOS
  useEffect(() => {
    if (tournamentId) {
        fetchMatches(tournamentId, seasonId);
    }
    fetchTeams(); 
  }, [tournamentId, seasonId]);

  // PROCESAMIENTO DE DATOS UNIFICADO
  const tournamentMatches = useMemo(
    () => allMatches.filter((m) => {
        const matchesTournament = m.tournamentId === tournamentId;
        const matchesSeason = seasonId ? m.seasonId === seasonId : true;
        return matchesTournament && matchesSeason;
    }),
    [allMatches, tournamentId, seasonId]
  );

  const selectorItems = useMemo<SelectorItem[]>(() => {
    if (tournamentMatches.length === 0) return [];

    const items: SelectorItem[] = [];

    // A. JORNADAS
    const regularMatches = tournamentMatches.filter(m => m.stage === 'group');
    const uniqueMatchdays = [...new Set(regularMatches.map(m => m.matchday).filter(Boolean))].sort((a, b) => a - b);

    uniqueMatchdays.forEach(day => {
        const dayMatches = regularMatches.filter(m => m.matchday === day);
        const total = dayMatches.length;
        const finished = dayMatches.filter(m => m.status === 'finished').length;

        items.push({
            id: `md-${day}`,
            type: 'matchday',
            label: `Jornada ${day}`,
            subLabel: 'Fase de Grupos',
            matches: dayMatches,
            total,
            finished,
            isCompleted: total > 0 && total === finished
        });
    });

    // B. ELIMINATORIAS
    const eliminationMatches = tournamentMatches.filter(m => m.stage !== 'group');
    
    STAGE_ORDER.forEach(stage => {
        const stageMatches = eliminationMatches.filter(m => m.stage === stage);
        if (stageMatches.length > 0) {
            const total = stageMatches.length;
            const finished = stageMatches.filter(m => m.status === 'finished').length;
            
            items.push({
                id: `st-${stage}`,
                type: 'stage',
                label: STAGE_LABELS[stage],
                subLabel: 'Eliminatoria',
                matches: stageMatches,
                total,
                finished,
                isCompleted: total > 0 && total === finished
            });
        }
    });

    return items;
  }, [tournamentMatches]);

  // ESTADO DE SELECCIÓN
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
      setSelectedItemId(null); 
  }, [seasonId]);

  const initialIndex = useMemo(() => {
      if (selectorItems.length === 0) return -1;
      const firstActive = selectorItems.findIndex(item => !item.isCompleted);
      return firstActive !== -1 ? firstActive : selectorItems.length - 1;
  }, [selectorItems]);

  useEffect(() => {
      if (selectorItems.length > 0 && !selectedItemId) {
          const targetIndex = initialIndex !== -1 ? initialIndex : 0;
          setSelectedItemId(selectorItems[targetIndex].id);
      }
  }, [selectorItems, initialIndex, selectedItemId]);

  useEffect(() => {
    if (selectorItems.length > 0 && flatListRef.current && initialIndex !== -1) {
      const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: initialIndex,
            animated: true,
            viewPosition: 0.5
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectorItems.length, initialIndex]);

  const getTeam = (teamId: string) => allTeams.find((t) => t.id === teamId);

  const currentItem = useMemo(() => 
      selectorItems.find(i => i.id === selectedItemId) || selectorItems[0],
  [selectorItems, selectedItemId]);

  // --- RENDERS ---

  if ((isLoadingMatches || isLoadingTeams) && tournamentMatches.length === 0) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (selectorItems.length === 0) {
    return (
      <View>
          {/* Header de Temporada incluso si está vacío */}
          {seasonName && (
             <View className="mb-4 flex-row items-center justify-center">
                 <View className="bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                     <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                         {seasonName}
                     </Text>
                 </View>
             </View>
          )}

          <View
            className="p-6 rounded-2xl items-center border-2 border-dashed mx-4 mt-2"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.text }}>
              Calendario Vacío
            </Text>
            <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
              No hay partidos programados para esta temporada.
            </Text>
          </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* 4. TÍTULO DE SECCIÓN CON TEMPORADA */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
          Calendario del Torneo
        </Text>
        
        {seasonName && (
             <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
                 <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
                     {seasonName}
                 </Text>
             </View>
        )}
      </View>

      <View className="mb-4">
        <FlatList
          ref={flatListRef}
          data={selectorItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 10 }}
          onScrollToIndexFailed={info => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => flatListRef.current?.scrollToIndex({ index: info.index, animated: true }));
          }}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedItemId;

            return (
              <View
                style={{
                  marginRight: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                  shadowOpacity: isSelected ? 0.3 : 0.05,
                  shadowRadius: isSelected ? 4 : 3,
                  elevation: isSelected ? 5 : 2,
                  borderRadius: 16,
                }}
              >
                <Pressable
                  onPress={() => {
                    setSelectedItemId(item.id);
                    const index = selectorItems.findIndex(i => i.id === item.id);
                    if (index !== -1) {
                      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                    }
                  }}
                  style={({ pressed }) => ({
                    transform: [{ scale: isSelected ? 1.05 : (pressed ? 0.98 : 1) }],
                  })}
                >
                  <View
                    className="px-5 py-3 justify-center min-w-[110px] items-center"
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderRadius: 16,
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-base font-bold text-center"
                      style={{
                        color: isSelected ? "#fff" : colors.text,
                        fontSize: isSelected ? 16 : 15
                      }}
                    >
                      {item.label}
                    </Text>

                    <View className="flex-row items-center mt-1">
                      <Ionicons 
                        name={item.type === 'matchday' ? "calendar" : "trophy"} 
                        size={10} 
                        color={isSelected ? "rgba(255,255,255,0.7)" : colors.textSecondary} 
                        style={{ marginRight: 4 }}
                      />
                      
                      <Text
                        className="text-xs mr-1"
                        style={{
                          color: isSelected ? "rgba(255,255,255,0.9)" : colors.textSecondary,
                          fontWeight: isSelected ? "600" : "400"
                        }}
                      >
                        {item.finished}/{item.total}
                      </Text>
                      
                      {item.isCompleted && (
                        <Ionicons name="checkmark-circle" size={14} color={isSelected ? "#fff" : colors.success} />
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          }}
        />
      </View>

      {/* Lista de partidos */}
      {currentItem && (
        <View>
          <Text className="text-sm font-semibold mb-3 uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
            Resultados - {currentItem.label}
          </Text>
          
          {currentItem.matches.length > 0 ? (
              currentItem.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  homeTeam={getTeam(match.homeTeamId)}
                  awayTeam={getTeam(match.awayTeamId)}
                />
              ))
          ) : (
             <View className="p-8 items-center justify-center border-dashed border-2 rounded-xl" style={{ borderColor: colors.border }}>
                 <Text style={{ color: colors.textSecondary }}>No hay partidos para mostrar</Text>
             </View>
          )}
        </View>
      )}
    </View>
  );
}