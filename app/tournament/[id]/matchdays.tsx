import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Match, MatchStage, Scorer } from "@/types/Match";

import { ActionButton } from "@/components/matches/ActionButton";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchFormModal } from "@/components/matches/MatchFormModal";
import { UpdateScoreModal } from "@/components/matches/UpdateScoreModal";

// Helper para traducir stages
const getStageLabel = (stage: MatchStage | string, matchday?: number) => {
  if (stage === 'group') return `JORNADA ${matchday || '?'}`;
  switch (stage) {
    case 'round_of_16': return 'OCTAVOS DE FINAL';
    case 'quarterfinals': return 'CUARTOS DE FINAL';
    case 'semifinals': return 'SEMIFINALES';
    case 'final': return 'GRAN FINAL';
    case '3rd_place': return '3ER LUGAR';
    default: return stage.toUpperCase();
  }
};

// Orden de renderizado
const STAGE_ORDER = ['group', 'round_of_16', 'quarterfinals', 'semifinals', '3rd_place', 'final'];

export default function ManageMatchesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Stores
  const { addMatch, updateMatch, updateMatchScore, deleteMatch, fetchMatches, isLoading: loadingMatches } = useMatchesStore();
  const allMatches = useMatchesStore((state) => state.matches);
  const allTeams = useTeamsStore((state) => state.teams);
  const { tournaments, fetchTournaments } = useTournamentsStore(); // Agregamos fetchTournaments por si acaso

  // 1. OBTENER TORNEO
  const tournament = useMemo(() => tournaments.find(t => t.id === id), [tournaments, id]);

  // 2. FILTRAR DATOS (Asegurando la temporada)
  // Nota: fetchMatches ya se encarga de llenar el store solo con los relevantes, 
  // pero el filtro local extra no hace daño.
  const matches = useMemo(() => {
      if (!tournament?.activeSeasonId) return [];
      return allMatches.filter((m) => m.tournamentId === id && m.seasonId === tournament.activeSeasonId);
  }, [allMatches, id, tournament?.activeSeasonId]);

  const teams = useMemo(() => allTeams.filter((t) => t.tournamentId === id), [allTeams, id]);

  // Estados Modal
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [isScoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedMatchForScore, setSelectedMatchForScore] = useState<Match | null>(null);
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);

  // 3. EFECTO DE CARGA CORREGIDO
  useEffect(() => {
    const loadData = async () => {
        // Si no tenemos el torneo cargado, lo pedimos primero para saber la temporada activa
        let currentTournament = tournament;
        if (!currentTournament) {
            await fetchTournaments();
            // Intentamos buscarlo de nuevo tras el fetch
            // (Nota: En un componente real esto se maneja mejor con react-query, pero aquí improvisamos)
        }

        if (id && tournament?.activeSeasonId) {
            console.log(`Cargando partidos para Torneo: ${id}, Temporada: ${tournament.activeSeasonId}`);
            fetchMatches(id, tournament.activeSeasonId);
        }
    };
    loadData();
  }, [id, tournament?.activeSeasonId]); // Dependencia clave: activeSeasonId

  const getScoreUnit = (sportId?: string) => {
    switch (sportId) {
      case 'basketball': return 'Puntos';
      case 'baseball': return 'Carreras';
      case 'volleyball': return 'Sets';
      case 'tennis': return 'Sets';
      default: return 'Goles';
    }
  };

  const handleOpenCreate = () => {
    if (teams.length < 2) {
      Alert.alert("Insuficientes Equipos", "Necesitas al menos 2 equipos para crear partidos.");
      return;
    }
    setSelectedMatchForEdit(null);
    setFormModalVisible(true);
  };

  const handleOpenEdit = (match: Match) => {
    setSelectedMatchForEdit(match);
    setFormModalVisible(true);
  };

  const handleOpenScore = (match: Match) => {
    setSelectedMatchForScore(match);
    setScoreModalVisible(true);
  };

  // 4. GUARDAR PARTIDO CON TEMPORADA
  const handleFormSubmit = (data: any) => {
    const fullDate = new Date(`${data.date}T${data.time}:00`);
    
    // Objeto base
    const matchData = {
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      date: fullDate,
      matchday: parseInt(data.matchday) || 1,
      location: data.location?.trim() || undefined,
    };

    if (selectedMatchForEdit) {
      updateMatch(selectedMatchForEdit.id, matchData);
    } else if (id && tournament?.activeSeasonId) {
      // CREAR NUEVO
      addMatch({
        ...matchData,
        tournamentId: id,
        status: "scheduled",
        stage: "group", 
        // ¡CRUCIAL! Asignar la temporada activa
        seasonId: tournament.activeSeasonId 
      });
    } else {
        Alert.alert("Error", "No se pudo identificar la temporada activa del torneo.");
    }
  };

  const confirmDeleteMatch = (matchId: string) => {
    Alert.alert(
      "Eliminar Partido",
      "¿Estás seguro de que deseas eliminar este partido?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMatch(matchId) },
      ],
      { cancelable: true }
    );
  };

  const handleScoreSubmit = (homeScore: number, awayScore: number, scorers: Scorer[] = []) => {
    if (selectedMatchForScore) {
      updateMatchScore(selectedMatchForScore.id, homeScore, awayScore, scorers);
    }
  };

  // --- LÓGICA DE AGRUPAMIENTO ---
  const groupedMatches = useMemo(() => {
    const groups: { title: string; matches: Match[]; order: number }[] = [];

    // A. Agrupar Jornadas (Stage = group)
    const groupMatches = matches.filter(m => m.stage === 'group');
    const matchdays = [...new Set(groupMatches.map(m => m.matchday).filter(Boolean))].sort((a, b) => a - b);

    matchdays.forEach(day => {
      groups.push({
        title: getStageLabel('group', day),
        matches: groupMatches.filter(m => m.matchday === day),
        order: day
      });
    });

    // B. Agrupar Eliminatorias
    const eliminationMatches = matches.filter(m => m.stage !== 'group');
    const uniqueStages = [...new Set(eliminationMatches.map(m => m.stage))];

    uniqueStages.forEach(stage => {
      groups.push({
        title: getStageLabel(stage),
        matches: eliminationMatches.filter(m => m.stage === stage),
        order: 100 + STAGE_ORDER.indexOf(stage)
      });
    });

    return groups.sort((a, b) => a.order - b.order);

  }, [matches]);

  // Nombre de la temporada para mostrar en el header (opcional)
  const currentSeasonName = tournament?.seasons?.find(s => s.id === tournament.activeSeasonId)?.name || "";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>

        {/* Header */}
        <View className="px-4 pb-4 shadow-sm" style={{ backgroundColor: colors.surface, paddingTop: insets.top + 8 }}>
          <View className="flex-row items-center justify-between mb-2">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <Text className="text-xl font-bold" style={{ color: colors.text }}>Gestión de Partidos</Text>
              <View className="w-10" />
          </View>
          
          {/* Badge de Temporada (Visual feedback) */}
          {currentSeasonName && (
             <View className="self-center bg-gray-100 px-3 py-1 rounded-full">
                 <Text className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                     {currentSeasonName}
                 </Text>
             </View>
          )}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
          {/* Botón Crear */}
          <Pressable onPress={handleOpenCreate} className="flex-row items-center justify-center p-4 mb-6 rounded-2xl shadow-sm" style={{ backgroundColor: colors.primary }}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-2 text-lg">Nuevo Partido</Text>
          </Pressable>
          
          {loadingMatches ? (
             <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
          ) : (
            <>
                {/* Lista Agrupada */}
                {groupedMatches.map((group) => (
                    <View key={group.title} className="mb-8">
                    {/* Separador con Título */}
                    <View className="flex-row items-center mb-4 opacity-60">
                        <View className="h-[1px] flex-1" style={{ backgroundColor: colors.border }} />
                        <Text className="mx-4 font-bold text-xs tracking-widest" style={{ color: colors.textSecondary }}>
                        {group.title}
                        </Text>
                        <View className="h-[1px] flex-1" style={{ backgroundColor: colors.border }} />
                    </View>

                    {group.matches.map((match) => (
                        <View key={match.id} className="mb-6">
                        <MatchCard
                            match={match}
                            homeTeam={allTeams.find(t => t.id === match.homeTeamId)}
                            awayTeam={allTeams.find(t => t.id === match.awayTeamId)}
                        />

                        {/* Acciones */}
                        <View className="flex-row gap-2 mt-3">
                            <ActionButton icon="trophy-outline" label="Marcador" color={colors.success} onPress={() => handleOpenScore(match)} />
                            <ActionButton icon="create-outline" label="Editar" color={colors.textSecondary} onPress={() => handleOpenEdit(match)} />
                            <Pressable onPress={() => confirmDeleteMatch(match.id)} className="p-3 rounded-xl items-center justify-center" style={{ backgroundColor: `${colors.error}15` }}>
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                            </Pressable>
                        </View>
                        </View>
                    ))}
                    </View>
                ))}

                {groupedMatches.length === 0 && (
                    <View className="items-center py-10 opacity-50">
                    <Ionicons name="football-outline" size={48} color={colors.textSecondary} />
                    <Text className="mt-4" style={{ color: colors.textSecondary }}>No hay partidos en esta temporada</Text>
                    </View>
                )}
            </>
          )}
        </ScrollView>

        {/* Modales */}
        <MatchFormModal
          visible={isFormModalVisible}
          onClose={() => setFormModalVisible(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedMatchForEdit}
          tournamentId={id}
        />

        <UpdateScoreModal
          visible={isScoreModalVisible}
          match={selectedMatchForScore}
          sportId={tournament?.sportId}
          scoreUnit={getScoreUnit(tournament?.sportId)}
          homeTeam={allTeams.find((t) => t.id === selectedMatchForScore?.homeTeamId)}
          awayTeam={allTeams.find((t) => t.id === selectedMatchForScore?.awayTeamId)}
          onClose={() => setScoreModalVisible(false)}
          onSave={handleScoreSubmit}
        />

      </View>
    </>
  );
}