// app/(tabs)/tournaments/[id]/bracket.tsx

import { MatchCard } from "@/components/matches/MatchCard";
import { MatchFormModal } from "@/components/matches/MatchFormModal";
import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { MatchStage } from "@/types/Match";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STAGES: {
    id: MatchStage;
    label: string;
    emoji: string;
    matchesCount: number;
    description: string;
}[] = [
        {
            id: 'round_of_16',
            label: 'Octavos',
            emoji: '🎯',
            matchesCount: 8,
            description: '8 cruces • 16 equipos'
        },
        {
            id: 'quarterfinals',
            label: 'Cuartos',
            emoji: '⚡',
            matchesCount: 4,
            description: '4 cruces • 8 equipos'
        },
        {
            id: 'semifinals',
            label: 'Semifinales',
            emoji: '🔥',
            matchesCount: 2,
            description: '2 cruces • 4 equipos'
        },
        {
            id: 'final',
            label: 'Final',
            emoji: '🏆',
            matchesCount: 1,
            description: '1 cruce • 2 equipos'
        },
    ];

export default function BracketManageScreen() {
    const { id: tournamentId } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [activeStage, setActiveStage] = useState<MatchStage>('quarterfinals');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<any>(null);

    const { matches, addMatch, updateMatch, deleteMatch } = useMatchesStore();
    const { teams } = useTeamsStore();
    const { tournaments } = useTournamentsStore();

    const tournament = tournaments.find(t => t.id === tournamentId);

    // Filtramos partidos de la etapa activa
    const stageMatches = useMemo(() =>
        matches.filter(m => m.tournamentId === tournamentId && m.stage === activeStage),
        [matches, tournamentId, activeStage]
    );

    const getTeam = (id: string) => teams.find(t => t.id === id);

    const currentStage = STAGES.find(s => s.id === activeStage);
    const isStageComplete = stageMatches.length === currentStage?.matchesCount;
    const allMatchesFinished = stageMatches.every(m => m.status === 'finished');

    const handleCreateMatch = useCallback(async (data: any) => {
        const fullDate = new Date(`${data.date}T${data.time}:00`);

        if (editingMatch) {
            // Editar partido existente
            await updateMatch(editingMatch.id, {
                homeTeamId: data.homeTeamId,
                awayTeamId: data.awayTeamId,
                date: fullDate,
                location: data.location,
            });
        } else {
            // Crear nuevo partido
            await addMatch({
                tournamentId: tournamentId || "",
                homeTeamId: data.homeTeamId,
                awayTeamId: data.awayTeamId,
                date: fullDate,
                matchday: parseInt(data.matchday) || 0,
                location: data.location,
                status: 'scheduled',
                stage: activeStage,
                seasonId: tournament?.activeSeasonId || "",
            });
        }

        setIsModalOpen(false);
        setEditingMatch(null);
    }, [editingMatch, addMatch, updateMatch, tournamentId, activeStage, tournament]);

    const handleEditMatch = useCallback((match: any) => {
        setEditingMatch(match);
        setIsModalOpen(true);
    }, []);

    const handleDeleteMatch = useCallback((matchId: string) => {
        Alert.alert(
            "Eliminar Cruce",
            "¿Estás seguro de eliminar este cruce?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => deleteMatch(matchId),
                },
            ]
        );
    }, [deleteMatch]);

    const handleUpdateScore = useCallback((matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        const homeTeam = getTeam(match.homeTeamId);
        const awayTeam = getTeam(match.awayTeamId);

        Alert.prompt(
            "Actualizar Resultado",
            `${homeTeam?.name} vs ${awayTeam?.name}\n\nFormato: 2-1`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Guardar",
                    onPress: (text?: string) => {
                        const scores = text?.split("-").map((s: string) => parseInt(s.trim()));
                        if (scores && scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1])) {
                            updateMatch(matchId, {
                                homeScore: scores[0],
                                awayScore: scores[1],
                                status: "finished",
                            });
                        } else {
                            Alert.alert("Error", "Formato inválido. Usa: 2-1");
                        }
                    },
                },
            ],
            "plain-text",
            `${match.homeScore ?? 0}-${match.awayScore ?? 0}`
        );
    }, [matches, teams, updateMatch]);

    const handleGenerateNextRound = useCallback(() => {
        if (!allMatchesFinished) {
            Alert.alert("Error", "Debes completar todos los partidos de esta ronda primero");
            return;
        }

        const currentIndex = STAGES.findIndex(s => s.id === activeStage);
        if (currentIndex >= STAGES.length - 1) {
            Alert.alert("Info", "Esta es la final. No hay más rondas.");
            return;
        }

        const nextStage = STAGES[currentIndex + 1];
        const winners = stageMatches.map(m => {
            if (!m.homeScore || !m.awayScore) return null;
            return m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId;
        }).filter(Boolean);

        if (winners.length < 2) {
            Alert.alert("Error", "No hay suficientes ganadores para generar la siguiente ronda");
            return;
        }

        Alert.alert(
            "Generar Siguiente Ronda",
            `Se crearán los cruces de ${nextStage.label} con los ${winners.length} ganadores. ¿Continuar?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Generar",
                    onPress: async () => {
                        // Emparejar ganadores
                        for (let i = 0; i < winners.length; i += 2) {
                            if (winners[i + 1]) {
                                await addMatch({
                                    tournamentId: tournamentId || "",
                                    homeTeamId: winners[i]!,
                                    awayTeamId: winners[i + 1]!,
                                    date: new Date(),
                                    matchday: 0,
                                    location: "Por definir",
                                    status: 'scheduled',
                                    stage: nextStage.id as MatchStage,
                                    seasonId: tournament?.activeSeasonId || ""
                                });
                            }
                        }

                        setActiveStage(nextStage.id);
                        Alert.alert("Éxito", `Se crearon los cruces de ${nextStage.label}`);
                    },
                },
            ]
        );
    }, [allMatchesFinished, activeStage, stageMatches, addMatch, tournamentId, tournament]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                {/* Header */}
                <View
                    className="px-4 pb-4"
                    style={{
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + 8
                    }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <Pressable
                                onPress={() => router.back()}
                                className="p-2 -ml-2 rounded-full mr-2"
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.text} />
                            </Pressable>
                            <View className="flex-1">
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>
                                    Cuadro Eliminatorio
                                </Text>
                                {tournament && (
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                        {tournament.name}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Badge de progreso */}
                        <View
                            className="px-3 py-2 rounded-full"
                            style={{
                                backgroundColor: allMatchesFinished && isStageComplete
                                    ? colors.success + "20"
                                    : colors.primaryLight
                            }}
                        >
                            <Text
                                className="text-sm font-bold"
                                style={{
                                    color: allMatchesFinished && isStageComplete
                                        ? colors.success
                                        : colors.primary
                                }}
                            >
                                {stageMatches.filter(m => m.status === 'finished').length}/{stageMatches.length}
                            </Text>
                        </View>
                    </View>

                    {/* Info de la ronda actual */}
                    <View
                        className="p-3 rounded-lg flex-row items-center"
                        style={{ backgroundColor: colors.background }}
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: colors.primaryLight }}
                        >
                            <Text className="text-xl">{currentStage?.emoji}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                {currentStage?.label}
                            </Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                {currentStage?.description}
                            </Text>
                        </View>

                        {/* Botón generar siguiente ronda */}
                        {allMatchesFinished && isStageComplete && activeStage !== 'final' && (
                            <Pressable
                                onPress={handleGenerateNextRound}
                                className="px-3 py-2 rounded-lg"
                                style={({ pressed }) => ({
                                    backgroundColor: colors.success,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <Text className="text-white text-xs font-bold">
                                    Siguiente →
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Selector de Ronda */}
                <View
                    className="py-3 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {STAGES.map(stage => {
                            const stageMatchesCount = matches.filter(
                                m => m.tournamentId === tournamentId && m.stage === stage.id
                            ).length;
                            const isActive = activeStage === stage.id;

                            return (
                                <Pressable
                                    key={stage.id}
                                    onPress={() => setActiveStage(stage.id)}
                                    className="mr-3"
                                    style={({ pressed }) => ({
                                        opacity: pressed ? 0.7 : 1,
                                    })}
                                >
                                    <View
                                        className="px-4 py-3 rounded-xl"
                                        style={{
                                            backgroundColor: isActive ? colors.primary : colors.surface,
                                            borderWidth: 2,
                                            borderColor: isActive ? colors.primary : colors.border,
                                        }}
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-lg mr-2">{stage.emoji}</Text>
                                            <View>
                                                <Text
                                                    className="font-semibold"
                                                    style={{ color: isActive ? '#fff' : colors.text }}
                                                >
                                                    {stage.label}
                                                </Text>
                                                <Text
                                                    className="text-xs"
                                                    style={{
                                                        color: isActive
                                                            ? 'rgba(255,255,255,0.8)'
                                                            : colors.textSecondary
                                                    }}
                                                >
                                                    {stageMatchesCount}/{stage.matchesCount}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Lista de Partidos */}
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="py-4">
                        {stageMatches.length === 0 ? (
                            <View
                                className="items-center py-16 border-2 border-dashed rounded-2xl"
                                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                            >
                                <Ionicons
                                    name="git-network-outline"
                                    size={64}
                                    color={colors.textSecondary}
                                />
                                <Text
                                    className="mt-4 text-lg font-semibold mb-2"
                                    style={{ color: colors.text }}
                                >
                                    No hay cruces en {currentStage?.label}
                                </Text>
                                <Text
                                    className="text-sm mb-4"
                                    style={{ color: colors.textSecondary }}
                                >
                                    Agrega los primeros cruces manualmente
                                </Text>
                                <Pressable
                                    onPress={() => setIsModalOpen(true)}
                                    className="px-6 py-3 rounded-full"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    <Text className="text-white font-bold">
                                        Agregar Cruce
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                {stageMatches.map((match, index) => (
                                    <View key={match.id} className="mb-3">
                                        {/* Badge de número de cruce */}
                                        <View className="flex-row items-center mb-2">
                                            <View
                                                className="px-2 py-1 rounded-md mr-2"
                                                style={{ backgroundColor: colors.primaryLight }}
                                            >
                                                <Text
                                                    className="text-xs font-bold"
                                                    style={{ color: colors.primary }}
                                                >
                                                    Cruce {index + 1}
                                                </Text>
                                            </View>
                                        </View>

                                        <MatchCard
                                            match={match}
                                            homeTeam={getTeam(match.homeTeamId)}
                                            awayTeam={getTeam(match.awayTeamId)}
                                        />

                                        {/* Botones de acción */}
                                        <View className="flex-row gap-2 mt-2">
                                            <Pressable
                                                onPress={() => handleUpdateScore(match.id)}
                                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                                                style={{ backgroundColor: colors.success + "20" }}
                                            >
                                                <Ionicons name="trophy" size={16} color={colors.success} />
                                                <Text
                                                    className="text-sm font-semibold ml-1"
                                                    style={{ color: colors.success }}
                                                >
                                                    Resultado
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={() => handleEditMatch(match)}
                                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                                                style={{ backgroundColor: colors.background }}
                                            >
                                                <Ionicons name="pencil" size={16} color={colors.text} />
                                                <Text
                                                    className="text-sm font-semibold ml-1"
                                                    style={{ color: colors.text }}
                                                >
                                                    Editar
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={() => handleDeleteMatch(match.id)}
                                                className="px-3 py-2 rounded-lg"
                                                style={{ backgroundColor: colors.error + "20" }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={colors.error} />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}

                                {/* Botón Agregar más cruces */}
                                {!isStageComplete && (
                                    <Pressable
                                        onPress={() => setIsModalOpen(true)}
                                        className="mt-4 p-4 rounded-2xl border-dashed border-2 items-center justify-center flex-row"
                                        style={{
                                            borderColor: colors.primary,
                                            backgroundColor: colors.surface
                                        }}
                                    >
                                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                                        <Text
                                            className="font-bold text-base ml-2"
                                            style={{ color: colors.primary }}
                                        >
                                            Agregar otro cruce
                                        </Text>
                                    </Pressable>
                                )}

                                {/* Info si la ronda está completa */}
                                {isStageComplete && (
                                    <View
                                        className="mt-4 p-4 rounded-2xl flex-row items-center"
                                        style={{
                                            backgroundColor: allMatchesFinished
                                                ? colors.success + "20"
                                                : colors.warning + "20"
                                        }}
                                    >
                                        <Ionicons
                                            name={allMatchesFinished ? "checkmark-circle" : "time"}
                                            size={24}
                                            color={allMatchesFinished ? colors.success : colors.warning}
                                        />
                                        <Text
                                            className="text-sm ml-3 flex-1"
                                            style={{
                                                color: allMatchesFinished ? colors.success : colors.warning
                                            }}
                                        >
                                            {allMatchesFinished
                                                ? activeStage === 'final'
                                                    ? "¡Torneo finalizado! 🎉"
                                                    : "Ronda completa. Puedes generar la siguiente →"
                                                : `Faltan ${stageMatches.filter(m => m.status !== 'finished').length} resultados por registrar`
                                            }
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* Modal para Crear/Editar Partido */}
                <MatchFormModal
                    visible={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingMatch(null);
                    }}
                    onSubmit={handleCreateMatch}
                    tournamentId={tournamentId || ""}
                    initialData={editingMatch}
                    stage={activeStage}
                />
            </View>
        </>
    );
}