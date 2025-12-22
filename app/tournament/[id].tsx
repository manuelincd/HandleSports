// app/(tabs)/tournaments/[id].tsx

import { TOURNAMENTS } from "@/data/tournaments";
import { SPORTS } from "@/data/sports";
import { useFavoritesStore } from "@/store/useFavorites";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentSection } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function capitalize(str?: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSectionLabel(section: TournamentSection): string {
  const labels: Record<TournamentSection, string> = {
    matchdays: "Jornadas",
    standings: "Tabla",
    teams: "Equipos",
    stats: "Estadísticas",
    bracket: "Cuadro",
    groups: "Grupos",
  };
  return labels[section] || capitalize(section);
}

const placeholder = require("@/assets/images/tournament-placeholder.png");

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournament = TOURNAMENTS.find((t) => t.id === id);
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [activeSection, setActiveSection] = useState(
    tournament?.sections[0]
  );

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

  const sport = SPORTS.find((s) => s.id === tournament.sportId);

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
                  {sport?.name}
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
            {tournament.sections.map((section) => {
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
        >
          {/* Placeholder para contenido */}
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
              {activeSection && getSectionLabel(activeSection)}
            </Text>
            <Text
              className="text-center"
              style={{ color: colors.textSecondary }}
            >
              El contenido de esta sección se mostrará aquí
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}