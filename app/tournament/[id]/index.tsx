import { TournamentSectionContent } from "@/components/tournaments/TournamentSectionContent";
import { useFavoritesStore } from "@/store/useFavorites";
import { useMatchesStore } from "@/store/useMatches";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentFormat, TournamentSection } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function getSectionLabel(section: TournamentSection): string {
  const labels: Record<TournamentSection, string> = {
    matchdays: "Jornadas",
    standings: "Tabla",
    teams: "Equipos",
    stats: "Estadísticas",
    bracket: "Fase Final",
    groups: "Fase de Grupos",
  };
  return labels[section];
}

function getSectionsForFormat(format: TournamentFormat): TournamentSection[] {
  const baseSections: TournamentSection[] = ["teams", "matchdays"];
  switch (format) {
    case "league":
      return [...baseSections, "standings", "stats"];
    case "knockout":
      return [...baseSections, "bracket", "stats"];
    case "mixed":
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

  const { tournaments, isLoading, fetchTournaments } = useTournamentsStore();
  const { fetchMatches } = useMatchesStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const tournament = tournaments.find((t) => t.id === id);

  const [activeSection, setActiveSection] = useState<TournamentSection | null>(null);
  const [sportData, setSportData] = useState<{ name: string; emoji: string } | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(undefined);

  
  useEffect(() => {
    if (!tournament && !isLoading) {
      fetchTournaments();
    }
  }, [id, tournament]);

  useEffect(() => {
    if (tournament && !selectedSeasonId) {
      const defaultSeason = tournament.activeSeasonId || (tournament.seasons && tournament.seasons.length > 0 ? tournament.seasons[0].id : undefined);
      setSelectedSeasonId(defaultSeason);
    }
  }, [tournament]);

  useEffect(() => {
    if (tournament) {
      fetchMatches(tournament.id, selectedSeasonId);
    }
  }, [tournament, selectedSeasonId]);

  useEffect(() => {
    const fetchSport = async () => {
      if (tournament?.sportId) {
        try {
          const docRef = doc(db, "sports", tournament.sportId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSportData(docSnap.data() as { name: string; emoji: string });
          }
        } catch (error) {
          console.error("Error fetching sport:", error);
        }
      }
    };
    fetchSport();
  }, [tournament?.sportId]);

  const sections = useMemo(() => {
    if (!tournament) return [];
    return getSectionsForFormat(tournament.format);
  }, [tournament]);

  useEffect(() => {
    if (tournament && !activeSection && sections.length > 0) {
      const defaultSection = sections.includes("matchdays") ? "matchdays" : sections[0];
      setActiveSection(defaultSection);
    }
  }, [tournament, sections]);

  if (isLoading && !tournament) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="px-4 pb-4"
          style={{
            backgroundColor: colors.surface,
            paddingTop: insets.top + 8,
          }}
        >
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
            <Image
              source={
                tournament.logoUrl
                  ? { uri: tournament.logoUrl }
                  : placeholder
              }
              className="w-16 h-16 rounded-xl mr-4"
            />

            <View className="flex-1">
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text }}
              >
                {tournament.name}
              </Text>

              <View className="flex-row items-center mb-1">
                <Text className="mr-2">{sportData?.emoji || "⚽"}</Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {sportData?.name || "Cargando deporte..."}
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

            <Pressable
              onPress={() => toggleFavorite(tournament.id)}
              className="p-2 rounded-full"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={isFavorite(tournament.id) ? "star" : "star-outline"}
                size={28}
                color={isFavorite(tournament.id) ? "#fbbf24" : colors.text}
              />
            </Pressable>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
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

            {tournament.seasons && tournament.seasons.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    className="ml-4"
                    contentContainerStyle={{ alignItems: 'center' }}
                >
                    {tournament.seasons.map((season) => (
                        <Pressable
                            key={season.id}
                            onPress={() => setSelectedSeasonId(season.id)}
                            className={`px-3 py-1 rounded-full mr-2 border ${selectedSeasonId === season.id ? 'bg-gray-800' : 'bg-transparent'}`}
                            style={{ borderColor: colors.border }}
                        >
                            <Text 
                                className="text-xs font-medium" 
                                style={{ color: selectedSeasonId === season.id ? '#fff' : colors.textSecondary }}
                            >
                                {season.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
          </View>
        </View>

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

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {activeSection && id ? (
            <TournamentSectionContent
              section={activeSection}
              tournamentId={id}
              seasonId={selectedSeasonId}
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