import { MatchCard } from "@/components/matches/MatchCard";
import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
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

// Orden lógico de las fases eliminatorias
const STAGE_ORDER: MatchStage[] = ['round_of_16', 'quarterfinals', 'semifinals', '3rd_place', 'final'];

type Props = {
  tournamentId: string;
};

// Tipo unificado para el selector
type SelectorItem = {
    id: string; // Identificador único (ej: "md-1" o "st-final")
    type: 'matchday' | 'stage';
    label: string;
    subLabel: string; // Para mostrar "Jornada X" o el nombre de la fase
    matches: Match[];
    total: number;
    finished: number;
    isCompleted: boolean;
};

export function MatchdaysSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);

  // 1. STORES
  const { matches: allMatches, fetchMatches, isLoading: isLoadingMatches } = useMatchesStore();
  const { teams: allTeams, fetchTeams, isLoading: isLoadingTeams } = useTeamsStore();

  // 2. CARGAR DATOS
  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  // 3. PROCESAMIENTO DE DATOS UNIFICADO
  const tournamentMatches = useMemo(
    () => allMatches.filter((m) => m.tournamentId === tournamentId),
    [allMatches, tournamentId]
  );

  const selectorItems = useMemo<SelectorItem[]>(() => {
    if (tournamentMatches.length === 0) return [];

    const items: SelectorItem[] = [];

    // A. PROCESAR JORNADAS (Fase de Grupos)
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

    // B. PROCESAR FASES ELIMINATORIAS
    const eliminationMatches = tournamentMatches.filter(m => m.stage !== 'group');
    
    // Iteramos sobre el orden definido para mantener la cronología
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

  // 4. ESTADO DE SELECCIÓN
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Lógica para encontrar el ítem inicial (el primero no terminado o el último)
  const initialIndex = useMemo(() => {
      if (selectorItems.length === 0) return -1;
      
      // Buscamos el primero que no esté completo
      const firstActive = selectorItems.findIndex(item => !item.isCompleted);
      
      // Si todos están completos, vamos al último. Si no, al activo.
      return firstActive !== -1 ? firstActive : selectorItems.length - 1;
  }, [selectorItems]);

  // Inicializar selección
  useEffect(() => {
      if (selectorItems.length > 0 && !selectedItemId) {
          const targetIndex = initialIndex !== -1 ? initialIndex : 0;
          setSelectedItemId(selectorItems[targetIndex].id);
      }
  }, [selectorItems, initialIndex, selectedItemId]);

  // Auto-scroll al ítem inicial
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

  // Item seleccionado actual
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
      <View
        className="p-6 rounded-2xl items-center border-2 border-dashed mx-4 mt-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
        <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.text }}>
          Calendario Vacío
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Selector Unificado Horizontal */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-3 uppercase tracking-wider px-1" style={{ color: colors.textSecondary }}>
          Calendario del Torneo
        </Text>

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
                    {/* Etiqueta Principal (Jornada 1 / Octavos) */}
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
                      {/* Icono diferenciador */}
                      <Ionicons 
                        name={item.type === 'matchday' ? "calendar" : "trophy"} 
                        size={10} 
                        color={isSelected ? "rgba(255,255,255,0.7)" : colors.textSecondary} 
                        style={{ marginRight: 4 }}
                      />
                      
                      {/* Contador */}
                      <Text
                        className="text-xs mr-1"
                        style={{
                          color: isSelected ? "rgba(255,255,255,0.9)" : colors.textSecondary,
                          fontWeight: isSelected ? "600" : "400"
                        }}
                      >
                        {item.finished}/{item.total}
                      </Text>
                      
                      {/* Check si está completo */}
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

      {/* Lista de partidos del item seleccionado */}
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