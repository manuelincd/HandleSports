import { Screen } from "@/components/Screen";
import { usePlayersStore } from "@/store/usePlayers";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const placeholder = require("@/assets/images/team-placeholder.png");

export default function PublicTeamDetailScreen() {
  const { id: tournamentId, teamId } = useLocalSearchParams<{ id: string; teamId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Stores
  const { teams } = useTeamsStore();
  const { players, fetchPlayers, isLoading: loadingPlayers } = usePlayersStore();

  const team = teams.find((t) => t.id === teamId);

  // Cargar jugadores si no están
  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filtrar jugadores de este equipo
  const teamPlayers = useMemo(() => 
    players.filter(p => p.teamId === teamId),
  [players, teamId]);

  // Función para abrir redes (Placeholder)
  const openSocial = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url);
    });
  };

  if (!team) return null; // O un loading/error screen

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={{ backgroundColor: colors.surface }}>
        <View 
            className="px-4 pb-4 flex-row items-center"
            style={{ paddingTop: insets.top + 8 }}
        >
            <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text className="text-lg font-bold ml-2" style={{ color: colors.text }}>Perfil del Equipo</Text>
        </View>

        {/* INFO PRINCIPAL */}
        <View className="items-center pb-6 px-6">
            <Image
                source={team.logoUrl ? { uri: team.logoUrl } : placeholder}
                className="w-24 h-24 rounded-full bg-gray-100 mb-4 border-4"
                style={{ borderColor: colors.background }}
            />
            <Text className="text-2xl font-bold text-center mb-1" style={{ color: colors.text }}>
                {team.name}
            </Text>
            {team.captain && (
                <Text className="font-medium" style={{ color: colors.textSecondary }}>
                    Capitán: {team.captain}
                </Text>
            )}

            {/* REDES SOCIALES (UI Placeholder) */}
            <View className="flex-row gap-4 mt-6">
                <Pressable onPress={() => openSocial('https://instagram.com')} className="items-center justify-center w-10 h-10 rounded-full bg-pink-100">
                    <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                </Pressable>
                <Pressable onPress={() => openSocial('https://twitter.com')} className="items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                </Pressable>
                <Pressable onPress={() => openSocial('https://facebook.com')} className="items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                    <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                </Pressable>
            </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECCIÓN JUGADORES */}
        <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>
            Plantilla ({teamPlayers.length})
        </Text>

        {loadingPlayers && teamPlayers.length === 0 ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : teamPlayers.length > 0 ? (
            <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
                {teamPlayers.map((player, index) => (
                    <View 
                        key={player.id}
                        className={`flex-row items-center p-4 ${index !== teamPlayers.length - 1 ? 'border-b' : ''}`}
                        style={{ borderColor: colors.border }}
                    >
                        {/* Dorsal */}
                        <View 
                            className="w-8 h-8 rounded-lg items-center justify-center mr-4"
                            style={{ backgroundColor: colors.background }}
                        >
                            <Text className="font-bold text-xs" style={{ color: colors.textSecondary }}>
                                {player.number || "-"}
                            </Text>
                        </View>

                        {/* Nombre */}
                        <Text className="flex-1 font-medium" style={{ color: colors.text }}>
                            {player.name}
                        </Text>

                        {/* Icono Jugador */}
                        <Ionicons name="person-circle-outline" size={24} color={colors.border} />
                    </View>
                ))}
            </View>
        ) : (
            <View className="items-center py-10 opacity-50">
                <Ionicons name="body-outline" size={48} color={colors.textSecondary} />
                <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>
                    No hay jugadores públicos registrados
                </Text>
            </View>
        )}

      </ScrollView>
    </Screen>
  );
}