import { ManageOptionCard } from "@/components/tournaments/ManageOptionCard";
import { TournamentHeader } from "@/components/tournaments/TournamentHeader";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentFormat } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react"; 
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 1. IMPORTAMOS TODOS LOS STORES
import { useMatchesStore } from "@/store/useMatches";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
// 2. IMPORTAR AUTH STORE (NUEVO)
import { useAuthStore } from "@/store/useAuthStore";

type ManageOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

function getManageOptionsForFormat(
  format: TournamentFormat,
  tournamentId: string
): ManageOption[] {
  const baseOptions: ManageOption[] = [
    { id: "edit", title: "Editar Información", description: "Cambiar nombre, ubicación, logo", icon: "create-outline", color: "#3b82f6" },
    { id: "teams", title: "Gestionar Equipos", description: "Agregar, editar o eliminar equipos", icon: "people-outline", color: "#8b5cf6" },
  ];

  if (format === "league" || format === "mixed") {
    baseOptions.push({ id: "matchdays", title: "Jornadas", description: "Gestionar calendario y resultados", icon: "calendar-outline", color: "#22c55e" });
  }

  if (format === "knockout" || format === "mixed") {
    baseOptions.push({ id: "brackets", title: "Cuadro de Eliminación", description: "Configurar llaves", icon: "git-network-outline", color: "#f59e0b" });
  }

  if (format === "mixed") {
    baseOptions.push({ id: "groups", title: "Grupos", description: "Configurar grupos", icon: "grid-outline", color: "#06b6d4" });
  }

  return baseOptions;
}

export default function TournamentManageScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [isDeleting, setIsDeleting] = useState(false);

  // CONEXIÓN A LOS STORES
  const { tournaments, isLoading: loadingTournaments, fetchTournaments, deleteTournament } = useTournamentsStore();
  const { matches, isLoading: loadingMatches, fetchMatches } = useMatchesStore();
  const { teams, isLoading: loadingTeams, fetchTeams } = useTeamsStore();
  
  // 3. OBTENER USUARIO ACTUAL (NUEVO)
  const { user } = useAuthStore();

  const tournament = tournaments.find((t) => t.id === id);

  useEffect(() => {
    if (!tournament) fetchTournaments();
    fetchMatches();
    fetchTeams();
  }, [id, tournament]);

  const stats = useMemo(() => {
    const tournamentMatches = matches.filter(m => m.tournamentId === id);
    const tournamentTeams = teams.filter(t => t.tournamentId === id);
    const uniqueMatchdays = new Set(tournamentMatches.map(m => m.matchday).filter(Boolean));

    return {
      teams: tournamentTeams.length,
      matches: tournamentMatches.length,
      rounds: uniqueMatchdays.size
    };
  }, [matches, teams, id]);

  // 4. VERIFICAR PROPIEDAD (NUEVO)
  // ¿Existe usuario? ¿Existe torneo? ¿El ID del usuario coincide con el ownerId del torneo?
  const isOwner = useMemo(() => {
      if (!user || !tournament) return false;
      return user.uid === tournament.ownerId;
  }, [user, tournament]);

  const handleDeletePress = () => {
    Alert.alert(
      "Eliminar Torneo",
      "¿Estás seguro? Esta acción borrará permanentemente el torneo, sus equipos y partidos. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteTournament(id);
              router.replace("/(tabs)/events");
            } catch (error) {
              setIsDeleting(false);
              Alert.alert("Error", "No se pudo eliminar el torneo. Intenta de nuevo.");
            }
          }
        }
      ]
    );
  };

  const isLoading = (loadingTournaments && !tournament) || isDeleting;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        {isDeleting && <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Eliminando...</Text>}
      </View>
    );
  }

  // VALIDACIÓN 1: Torneo no existe
  if (!tournament) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Torneo no encontrado</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-6 py-2 rounded-full" style={{ backgroundColor: colors.surface }}>
          <Text style={{ color: colors.text }}>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  // VALIDACIÓN 2: NO ES EL DUEÑO (SEGURIDAD)
  if (!isOwner) {
    return (
        <View className="flex-1 items-center justify-center p-8" style={{ backgroundColor: colors.background }}>
            <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={40} color="#ef4444" />
            </View>
            <Text className="text-xl font-bold text-center mb-2" style={{ color: colors.text }}>
                Acceso Restringido
            </Text>
            <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
                No tienes permisos para gestionar este torneo. Solo el creador puede acceder a este panel.
            </Text>
            <Pressable 
                onPress={() => router.replace("/(tabs)/events")} 
                className="mt-8 px-8 py-3 rounded-full" 
                style={{ backgroundColor: colors.primary }}
            >
                <Text className="text-white font-bold">Volver a mis eventos</Text>
            </Pressable>
        </View>
    );
  }

  const manageOptions = getManageOptionsForFormat(tournament.format, tournament.id);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>

        {/* Header personalizado */}
        <View className="px-4 pb-4" style={{ backgroundColor: colors.surface, paddingTop: insets.top + 8 }}>
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full mr-2" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>Gestionar Evento</Text>
          </View>

          <TournamentHeader
            tournament={tournament}
            showStats
            stats={{
              teams: stats.teams,
              matches: stats.matches,
              rounds: stats.rounds,
            }}
          />

          <View className="mt-3 self-start">
            <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.primaryLight }}>
              <Text className="mr-1">{tournament.format === "league" ? "📊" : tournament.format === "knockout" ? "🏆" : "⚡"}</Text>
              <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                Formato: {tournament.format === "league" ? "Liga (Todos vs Todos)" : tournament.format === "knockout" ? "Eliminación Directa" : "Mixto (Grupos + Eliminación)"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
          <View className="p-4">
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>OPCIONES DE GESTIÓN</Text>
            {manageOptions.map((option) => (
              <ManageOptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                route={`/tournament/${id}/${option.id}` as any}
                color={option.color}
              />
            ))}
          </View>

          <View className="p-4">
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>ZONA PELIGROSA</Text>
            <Pressable 
                onPress={handleDeletePress} 
                className="flex-row items-center justify-center p-4 rounded-2xl" 
                style={({ pressed }) => ({ backgroundColor: `${colors.error}20`, opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text className="ml-2 font-semibold" style={{ color: colors.error }}>Eliminar Torneo</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}