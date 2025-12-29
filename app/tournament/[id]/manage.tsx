// app/(tabs)/tournaments/[id]/manage.tsx

import { TOURNAMENTS } from "@/data/tournaments";
import { TournamentHeader } from "@/components/tournaments/TournamentHeader";
import { ManageOptionCard } from "@/components/tournaments/ManageOptionCard";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentFormat } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    {
      id: "edit",
      title: "Editar Información",
      description: "Cambiar nombre, ubicación, logo",
      icon: "create-outline",
      color: "#3b82f6",
    },
    {
      id: "teams",
      title: "Gestionar Equipos",
      description: "Agregar, editar o eliminar equipos",
      icon: "people-outline",
      color: "#8b5cf6",
    },
  ];

  if (format === "league" || format === "mixed") {
    baseOptions.push({
      id: "matchdays",
      title: "Jornadas",
      description: "Gestionar calendario de partidos",
      icon: "calendar-outline",
      color: "#22c55e",
    });
  }

  if (format === "league") {
    baseOptions.push({
      id: "standings",
      title: "Tabla de Posiciones",
      description: "Ver y ajustar clasificación",
      icon: "trophy-outline",
      color: "#f59e0b",
    });
  }

  if (format === "knockout" || format === "mixed") {
    baseOptions.push({
      id: "bracket",
      title: "Cuadro de Eliminación",
      description: "Configurar llaves y resultados",
      icon: "git-network-outline",
      color: "#f59e0b",
    });
  }

  if (format === "mixed") {
    baseOptions.push({
      id: "groups",
      title: "Grupos",
      description: "Configurar grupos y clasificación",
      icon: "grid-outline",
      color: "#06b6d4",
    });
  }

  baseOptions.push({
    id: "stats",
    title: "Estadísticas",
    description: "Goleadores, tarjetas, etc.",
    icon: "bar-chart-outline",
    color: "#ec4899",
  });

  return baseOptions;
}

export default function TournamentManageScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournament = TOURNAMENTS.find((t) => t.id === id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!tournament) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.text }}>Torneo no encontrado</Text>
      </View>
    );
  }

  const manageOptions = getManageOptionsForFormat(
    tournament.format,
    tournament.id
  );

  return (
    <>
      {/* Ocultar header nativo */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View 
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header personalizado */}
        <View
          className="px-4 pb-4"
          style={{
            backgroundColor: colors.surface,
            paddingTop: insets.top + 8,
          }}
        >
          {/* Botón de regresar + Título */}
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="p-2 -ml-2 rounded-full mr-2"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              Eventos
            </Text>
          </View>

          {/* Info del torneo */}
          <TournamentHeader
            tournament={tournament}
            showStats
            stats={{
              teams: tournament.teamsCount,
              matches: 0,
              rounds: 0,
            }}
          />

          {/* Badge de formato */}
          <View className="mt-3 self-start">
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Text className="mr-1">
                {tournament.format === "league"
                  ? "📊"
                  : tournament.format === "knockout"
                  ? "🏆"
                  : "⚡"}
              </Text>
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.primary }}
              >
                Formato:{" "}
                {tournament.format === "league"
                  ? "Liga (Todos vs Todos)"
                  : tournament.format === "knockout"
                  ? "Eliminación Directa"
                  : "Mixto (Grupos + Eliminación)"}
              </Text>
            </View>
          </View>
        </View>

        {/* Contenido scrolleable */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Opciones de gestión */}
          <View className="p-4">
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: colors.textSecondary }}
            >
              OPCIONES DE GESTIÓN
            </Text>

            {manageOptions.map((option) => (
              <ManageOptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                route={`tournament/${id}/${option.id}`}
                color={option.color}
              />
            ))}
          </View>

          {/* Acciones peligrosas */}
          <View className="p-4">
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: colors.textSecondary }}
            >
              ZONA PELIGROSA
            </Text>

            <Pressable
              className="flex-row items-center justify-center p-4 rounded-2xl"
              style={({ pressed }) => ({
                backgroundColor: `${colors.error}20`,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text
                className="ml-2 font-semibold"
                style={{ color: colors.error }}
              >
                Eliminar Torneo
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}