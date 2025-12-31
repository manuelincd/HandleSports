import { TournamentSectionContent } from "@/components/tournaments/TournamentSectionContent";
import { SPORTS } from "@/data/sports";
import { useFavoritesStore } from "@/store/useFavorites";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentSection } from "@/types/Tournament";
import { TournamentFormat } from "@/types/Tournament"; // Asegúrate de importar esto
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 1. IMPORTAR EL STORE DE TORNEOS
import { useTournamentsStore } from "@/store/useTournaments";

function getSectionLabel(section: TournamentSection): string {
  const labels: Record<TournamentSection, string> = {
    matchdays: "Jornadas",
    standings: "Tabla",
    teams: "Equipos",
    stats: "Estadísticas",
    bracket: "Fase Final", // O "Cuadro"
    groups: "Fase de Grupos",
  };
  return labels[section];
}

// --- 1. NUEVA FUNCIÓN DE LÓGICA ---
// Define qué pestañas mostrar según el formato del torneo
function getSectionsForFormat(format: TournamentFormat): TournamentSection[] {
  // Secciones base que TODOS tienen
  const baseSections: TournamentSection[] = ["teams", "matchdays"];

  switch (format) {
    case "league":
      // Liga: Equipos, Jornadas, Tabla, Estadísticas
      return [...baseSections, "standings", "stats"];
    
    case "knockout":
      // Eliminatoria: Equipos, Jornadas, Cuadro (Bracket), Estadísticas
      return [...baseSections, "bracket", "stats"];
    
    case "mixed":
      // Mixto: Equipos, Jornadas, Grupos, Cuadro, Estadísticas
      return [...baseSections, "groups", "bracket", "stats"];
      
    default:
      return baseSections;
  }
}

const placeholder = require("@/assets/images/tournament-placeholder.png");

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 2. CONEXIÓN CON EL STORE
  const { tournaments, isLoading, fetchTournaments } = useTournamentsStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  // Buscamos el torneo en el estado global
  const tournament = tournaments.find((t) => t.id === id);

  // Estado para la sección activa (Tab)
  const [activeSection, setActiveSection] = useState<TournamentSection | null>(null);

  // 3. EFECTO: CARGAR DATOS SI NO EXISTEN
  useEffect(() => {
    // Si no encontramos el torneo en la lista local y no está cargando, refrescamos desde Firebase
    if (!tournament && !isLoading) {
      fetchTournaments();
    }
  }, [id, tournament]);

  // --- 2. CALCULAR SECCIONES DINÁMICAMENTE ---
  const sections = useMemo(() => {
    if (!tournament) return [];
    return getSectionsForFormat(tournament.format);
  }, [tournament]);

  // 4. EFECTO: INICIALIZAR LA TAB ACTIVA
  useEffect(() => {
    if (tournament && !activeSection && sections.length > 0) {
      const defaultSection = sections.includes("matchdays") ? "matchdays" : sections[0];
      setActiveSection(defaultSection);
    }
  }, [tournament, sections]);

  const sport = tournament ? SPORTS.find((s) => s.id === tournament.sportId) : null;

  // 5. VISTA DE CARGA
  if (isLoading && !tournament) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 6. VISTA DE NO ENCONTRADO
  if (!tournament) {
    return (
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: colors.background }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text
          className="text-xl font-bold mt-4 mb-2"
          style={{ color: colors.text }}
        >
          Torneo no encontrado
        </Text>
        <Text
          className="text-base text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          El torneo que buscas no existe o fue eliminado
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">Volver atrás</Text>
        </Pressable>
      </View>
    );
  }

  // 7. RENDERIZADO PRINCIPAL
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header con imagen */}
        <View
          className="px-4 pb-4"
          style={{
            backgroundColor: colors.surface,
            paddingTop: insets.top + 8,
          }}
        >
          {/* Botón de regresar */}
          <Pressable
            onPress={() => router.back()}
            className="mb-4 self-start p-2 -ml-2 rounded-full"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View className="flex-row items-center">
            {/* Logo del torneo */}
            <Image
              source={
                tournament.logoUrl
                  ? { uri: tournament.logoUrl }
                  : placeholder
              }
              className="w-16 h-16 rounded-xl mr-4"
            />

            {/* Info del torneo */}
            <View className="flex-1">
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text }}
              >
                {tournament.name}
              </Text>

              <View className="flex-row items-center mb-1">
                <Text className="mr-2">{sport?.emoji}</Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {sport?.name || "Deporte Desconocido"}
                </Text>
              </View>

              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="location"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  className="text-sm ml-1"
                  style={{ color: colors.textSecondary }}
                >
                  {tournament.location}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons
                  name="people"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  className="text-sm ml-1"
                  style={{ color: colors.textSecondary }}
                >
                  {tournament.teamsCount} equipos
                </Text>
              </View>
            </View>

            {/* Botón de favorito */}
            <Pressable
              onPress={() => toggleFavorite(tournament.id)}
              className="p-2 rounded-full"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={
                  isFavorite(tournament.id) ? "star" : "star-outline"
                }
                size={28}
                color={
                  isFavorite(tournament.id) ? "#fbbf24" : colors.text
                }
              />
            </Pressable>
          </View>

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
                {tournament.format === "league"
                  ? "Liga"
                  : tournament.format === "knockout"
                  ? "Eliminación"
                  : "Mixto"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs de navegación */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {sections.map((section) => {
              const isActive = activeSection === section;

              return (
                <Pressable
                  key={section}
                  onPress={() => setActiveSection(section)}
                  className="px-4 py-3 mx-1"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                    borderBottomWidth: 2,
                    borderBottomColor: isActive
                      ? colors.primary
                      : "transparent",
                  })}
                >
                  <Text
                    className="text-base"
                    style={{
                      color: isActive
                        ? colors.primary
                        : colors.textSecondary,
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {getSectionLabel(section)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Contenido de la sección activa */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {activeSection && id ? (
            <TournamentSectionContent
              section={activeSection}
              tournamentId={id}
            />
          ) : (
            <View
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                className="text-lg font-semibold mt-4 mb-2"
                style={{ color: colors.text }}
              >
                Sin contenido
              </Text>
              <Text
                className="text-center"
                style={{ color: colors.textSecondary }}
              >
                No hay información disponible
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}