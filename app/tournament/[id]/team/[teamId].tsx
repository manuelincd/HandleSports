import { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Keyboard, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme/useThemeColors";
import { Screen } from "@/components/Screen";
import { usePlayersStore } from "@/store/usePlayers"; 
import { useTeamsStore } from "@/store/useTeams";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeamPlayersScreen() {
  // 1. CORRECCIÓN: Mapeamos 'id' (de la URL) a 'tournamentId'
  const { teamId, id: tournamentId } = useLocalSearchParams<{ teamId: string, id: string }>();
  
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");

  const { players, addPlayer, deletePlayer, fetchPlayers, isLoading: isLoadingPlayers } = usePlayersStore();
  const { teams } = useTeamsStore();
  
  const team = teams.find(t => t.id === teamId);

  useEffect(() => {
    fetchPlayers(); 
  }, []);

  const teamPlayers = useMemo(() => 
    players.filter(p => p.teamId === teamId), 
  [players, teamId]);

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;

    // 2. SEGURIDAD: Evitar enviar undefined a Firebase
    if (!teamId || !tournamentId) {
        Alert.alert("Error", "Faltan datos del torneo o equipo.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await addPlayer({
        name: playerName.trim(),
        number: playerNumber.trim(),
        teamId: teamId,         // Usamos las variables validadas
        tournamentId: tournamentId, 
      });

      setPlayerName("");
      setPlayerNumber("");
      Keyboard.dismiss();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo agregar el jugador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (playerId: string) => {
    Alert.alert(
        "Eliminar Jugador",
        "¿Estás seguro?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: () => deletePlayer(playerId) 
            }
        ]
    );
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Jugadores", headerShown: false }} />
      
      {/* Header */}
      <View className="px-4 pb-4" style={{ backgroundColor: colors.surface, paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>{team?.name || "Equipo"}</Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Lista de Jugadores</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Formulario de Alta */}
        <View className="p-4 rounded-2xl mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold mb-3 uppercase opacity-60" style={{ color: colors.text }}>Nuevo Jugador</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="Nº"
              value={playerNumber}
              onChangeText={setPlayerNumber}
              keyboardType="number-pad"
              className="w-16 px-3 py-3 rounded-xl text-center font-bold"
              style={{ backgroundColor: colors.background, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
              maxLength={3}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Nombre del jugador"
              value={playerName}
              onChangeText={setPlayerName}
              className="flex-1 px-4 py-3 rounded-xl"
              style={{ backgroundColor: colors.background, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
              editable={!isSubmitting}
            />
            <Pressable 
              onPress={handleAddPlayer}
              disabled={isSubmitting || !playerName.trim()}
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ 
                  backgroundColor: colors.primary,
                  opacity: (isSubmitting || !playerName.trim()) ? 0.5 : 1 
              }}
            >
              {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
              ) : (
                  <Ionicons name="add" size={28} color="white" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Lista de Jugadores */}
        <Text className="text-sm font-bold mb-3" style={{ color: colors.textSecondary }}>
            {teamPlayers.length} JUGADORES REGISTRADOS
        </Text>

        {isLoadingPlayers && teamPlayers.length === 0 ? (
            <ActivityIndicator size="large" color={colors.primary} className="mt-8" />
        ) : teamPlayers.length > 0 ? (
          teamPlayers.map((player) => (
            <View 
              key={player.id} 
              className="flex-row items-center p-3 mb-2 rounded-2xl border"
              style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border
              }}
            >
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="font-bold" style={{ color: colors.primary }}>
                    {player.number || "#"}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    {player.name}
                </Text>
                {/* 3. Renderizado Condicional Limpio */}
                <View className="flex-row gap-3 mt-0.5">
                    {(player.goals || 0) > 0 ? (
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>⚽ {player.goals}</Text>
                    ) : null}
                    {(player.yellowCards || 0) > 0 ? (
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>🟨 {player.yellowCards}</Text>
                    ) : null}
                </View>
              </View>

              <Pressable 
                onPress={() => handleDelete(player.id)}
                className="p-2 rounded-lg"
                style={({pressed}) => ({ 
                    backgroundColor: pressed ? colors.background : 'transparent' 
                })}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </Pressable>
            </View>
          ))
        ) : (
          <View className="items-center py-10 border-2 border-dashed rounded-xl" style={{ borderColor: colors.border }}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text className="mt-2 font-medium" style={{ color: colors.textSecondary }}>
                No hay jugadores en este equipo
            </Text>
            <Text className="text-xs opacity-70" style={{ color: colors.textSecondary }}>
                Agrega el primero usando el formulario de arriba
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}