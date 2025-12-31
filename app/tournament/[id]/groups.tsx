// app/(tabs)/tournaments/[id]/groups.tsx

import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTeamsStore } from "@/store/useTeams";
import { useMatchesStore } from "@/store/useMatches";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tipo simple para cruces
type RoundMatch = { home: string; away: string };

// Algoritmo Round Robin
const generateRoundRobin = (teamIds: string[]) => {
  const schedule: RoundMatch[][] = [];
  const teams = [...teamIds];
  
  if (teams.length % 2 !== 0) teams.push("bye");
  
  const numRounds = teams.length - 1;
  const halfSize = teams.length / 2;

  for (let round = 0; round < numRounds; round++) {
    const roundMatches: RoundMatch[] = [];
    for (let i = 0; i < halfSize; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];
      if (home !== "bye" && away !== "bye") {
        roundMatches.push({ home, away });
      }
    }
    teams.splice(1, 0, teams.pop()!);
    schedule.push(roundMatches);
  }
  return schedule;
};

// Colores por grupo
const GROUP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' },
  B: { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' },
  C: { bg: '#22c55e20', border: '#22c55e', text: '#22c55e' },
  D: { bg: '#f59e0b20', border: '#f59e0b', text: '#f59e0b' },
};

export default function GroupsManageScreen() {
  const { id: tournamentId } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { teams, updateTeamGroup } = useTeamsStore();
  const { addMatch } = useMatchesStore();
  const { tournaments } = useTournamentsStore();
  
  const tournament = tournaments.find(t => t.id === tournamentId);
  const [isGenerating, setIsGenerating] = useState(false);

  const tournamentTeams = useMemo(() => 
    teams.filter(t => t.tournamentId === tournamentId), 
  [teams, tournamentId]);

  const GROUPS = ['A', 'B', 'C', 'D'];

  const getTeamsInGroup = (group: string) => tournamentTeams.filter(t => t.group === group);
  const getUnassignedTeams = () => tournamentTeams.filter(t => !t.group);

  // ✅ CORREGIDO: Ahora recibe el grupo correcto
  const handleAssignGroup = async (teamId: string, group: string | null) => {
    if (updateTeamGroup) {
      await updateTeamGroup(teamId, group); 
    }
  };

  const handleGenerateMatches = async (group: string) => {
    const groupTeams = getTeamsInGroup(group);
    
    if (groupTeams.length < 2) {
      Alert.alert("Error", "Necesitas al menos 2 equipos para generar partidos.");
      return;
    }

    Alert.alert(
      "Generar Calendario",
      `Se crearán ${groupTeams.length * (groupTeams.length - 1) / 2} partidos para el Grupo ${group}. ¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Generar", 
          onPress: async () => {
            try {
              setIsGenerating(true);
              const teamIds = groupTeams.map(t => t.id);
              const schedule = generateRoundRobin(teamIds);
              const promises: Promise<void>[] = [];
              
              schedule.forEach((round, roundIndex) => {
                round.forEach(match => {
                  promises.push(addMatch({
                    tournamentId: tournamentId || "",
                    homeTeamId: match.home,
                    awayTeamId: match.away,
                    date: new Date(),
                    matchday: (roundIndex + 1), 
                    location: "Por definir",
                    status: 'scheduled',
                    stage: 'group',
                  }));
                });
              });

              await Promise.all(promises);
              Alert.alert(
                "Éxito", 
                `Se crearon ${schedule.reduce((acc, r) => acc + r.length, 0)} partidos para el Grupo ${group}.`
              );
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudieron generar los partidos.");
            } finally {
              setIsGenerating(false);
            }
          }
        }
      ]
    );
  };

  const handleClearGroup = (group: string) => {
    const teamsInGroup = getTeamsInGroup(group);
    if (teamsInGroup.length === 0) return;

    Alert.alert(
      "Vaciar Grupo",
      `¿Quitar todos los equipos del Grupo ${group}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Vaciar", 
          style: "destructive",
          onPress: async () => {
            for (const team of teamsInGroup) {
              await handleAssignGroup(team.id, null);
            }
          }
        }
      ]
    );
  };

  const handleAutoDistribute = () => {
    const unassigned = getUnassignedTeams();
    if (unassigned.length === 0) {
      Alert.alert("Info", "No hay equipos sin asignar");
      return;
    }

    Alert.alert(
      "Distribución Automática",
      `Se distribuirán ${unassigned.length} equipos equitativamente en los grupos. ¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Distribuir", 
          onPress: async () => {
            const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffled.length; i++) {
              const groupIndex = i % GROUPS.length;
              await handleAssignGroup(shuffled[i].id, GROUPS[groupIndex]);
            }
            Alert.alert("Éxito", "Equipos distribuidos correctamente");
          }
        }
      ]
    );
  };

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
                  Gestionar Grupos
                </Text>
                {tournament && (
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {tournament.name}
                  </Text>
                )}
              </View>
            </View>

            {/* Botón distribución automática */}
            {getUnassignedTeams().length > 0 && (
              <Pressable
                onPress={handleAutoDistribute}
                className="px-3 py-2 rounded-full"
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="shuffle" size={18} color="#fff" />
              </Pressable>
            )}
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <View 
              className="flex-1 p-2 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Total
              </Text>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                {tournamentTeams.length}
              </Text>
            </View>
            <View 
              className="flex-1 p-2 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Sin asignar
              </Text>
              <Text className="text-lg font-bold" style={{ color: colors.warning }}>
                {getUnassignedTeams().length}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1 p-4" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
          {/* Equipos Sin Asignar */}
          {getUnassignedTeams().length > 0 && (
            <View className="mb-6">
              <Text 
                className="font-bold text-xs tracking-widest mb-3" 
                style={{ color: colors.textSecondary }}
              >
                SIN GRUPO ({getUnassignedTeams().length})
              </Text>
              
              <View className="flex-row flex-wrap gap-2">
                {getUnassignedTeams().map(team => (
                  <Pressable 
                    key={team.id}
                    className="px-3 py-2 rounded-lg border"
                    style={({ pressed }) => ({
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.5 : 1,
                    })}
                    onLongPress={() => {
                      // Mostrar opciones de grupo
                      Alert.alert(
                        "Asignar a Grupo",
                        `Selecciona el grupo para ${team.name}`,
                        [
                          ...GROUPS.map(g => ({
                            text: `Grupo ${g}`,
                            onPress: () => handleAssignGroup(team.id, g),
                          })),
                          { text: "Cancelar", style: "cancel" }
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: colors.text }}>{team.name}</Text>
                  </Pressable>
                ))}
              </View>

              <View 
                className="mt-3 p-3 rounded-lg flex-row items-center"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text className="text-xs ml-2 flex-1" style={{ color: colors.primary }}>
                  Mantén presionado un equipo para asignarlo a un grupo
                </Text>
              </View>
            </View>
          )}

          {/* Grupos A, B, C, D */}
          {GROUPS.map(group => {
            const teamsInGroup = getTeamsInGroup(group);
            const groupColor = GROUP_COLORS[group];

            return (
              <View 
                key={group} 
                className="mb-4 p-4 rounded-2xl"
                style={{ 
                  borderWidth: 2,
                  borderColor: groupColor.border,
                  backgroundColor: groupColor.bg,
                }}
              >
                {/* Header del grupo */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: groupColor.border }}
                    >
                      <Text className="font-bold text-xl text-white">{group}</Text>
                    </View>
                    <View>
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        Grupo {group}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {teamsInGroup.length} equipos
                      </Text>
                    </View>
                  </View>
                  
                  {/* Botones de acción */}
                  <View className="flex-row gap-2">
                    {teamsInGroup.length >= 2 && (
                      <Pressable 
                        onPress={() => handleGenerateMatches(group)}
                        disabled={isGenerating}
                        className="px-3 py-2 rounded-lg"
                        style={({ pressed }) => ({
                          backgroundColor: colors.success,
                          opacity: pressed || isGenerating ? 0.6 : 1,
                        })}
                      >
                        <Ionicons name="calendar" size={16} color="#fff" />
                      </Pressable>
                    )}
                    
                    {teamsInGroup.length > 0 && (
                      <Pressable 
                        onPress={() => handleClearGroup(group)}
                        className="px-3 py-2 rounded-lg"
                        style={({ pressed }) => ({
                          backgroundColor: colors.error + "40",
                          opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Equipos del grupo */}
                {teamsInGroup.length > 0 ? (
                  teamsInGroup.map(team => (
                    <View 
                      key={team.id} 
                      className="flex-row justify-between items-center py-3 px-3 mb-2 rounded-lg"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <View className="flex-row items-center flex-1">
                        <Ionicons 
                          name="shield-checkmark" 
                          size={18} 
                          color={groupColor.text}
                          style={{ marginRight: 10 }} 
                        />
                        <Text className="font-medium flex-1" style={{ color: colors.text }}>
                          {team.name}
                        </Text>
                      </View>
                      <Pressable 
                        onPress={() => handleAssignGroup(team.id, null)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 0.7 })}
                      > 
                        <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <View 
                    className="py-8 items-center border-2 border-dashed rounded-xl"
                    style={{ borderColor: groupColor.border }}
                  >
                    <Ionicons 
                      name="people-outline" 
                      size={32} 
                      color={colors.textSecondary}
                      style={{ marginBottom: 8 }}
                    />
                    <Text 
                      className="text-sm font-medium mb-2" 
                      style={{ color: colors.textSecondary }}
                    >
                      Sin equipos asignados
                    </Text>
                    <Text 
                      className="text-xs" 
                      style={{ color: colors.textSecondary }}
                    >
                      Mantén presionado un equipo arriba
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
        
        {/* Loading overlay */}
        {isGenerating && (
          <View className="absolute inset-0 items-center justify-center z-50" style={{ backgroundColor: colors.overlay }}>
            <View className="bg-white p-6 rounded-2xl items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-4 font-bold" style={{ color: colors.text }}>
                Creando calendario...
              </Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
}