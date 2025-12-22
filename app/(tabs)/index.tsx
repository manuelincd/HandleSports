import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { SportChip } from "@/components/SportChip";
import { TournamentCard } from "@/components/TournamentCard";
import { SPORTS } from "@/data/sports";
import { TOURNAMENTS } from "@/data/tournaments";
import { useFavoritesStore } from "@/store/useFavorites";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const options = {
  title: "Home",
};

export default function HomeScreen() {
  const [selectedSport, setSelectedSport] = useState("all");
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  
  const { favorites, loadFavorites, isLoading } = useFavoritesStore();

  const HEADER_HEIGHT = 56;

  // Cargar favoritos al montar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Filtrar torneos favoritos
  const favoriteTournaments = TOURNAMENTS.filter((t) =>
    favorites.includes(t.id)
  );

  const filteredTournaments =
    selectedSport === "all"
      ? favoriteTournaments
      : favoriteTournaments.filter((t) => t.sportId === selectedSport);

  return (
    <Screen>
      <AppHeader scrollY={scrollY} />

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 16,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Chips de deportes */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {SPORTS.map((sport) => (
              <SportChip
                key={sport.id}
                label={sport.name}
                emoji={sport.emoji}
                selected={selectedSport === sport.id}
                onPress={() => setSelectedSport(sport.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Título */}
        <Text 
          className="text-xl font-bold mb-4"
          style={{ color: colors.text }}
        >
          Mis Torneos Favoritos
        </Text>

        {/* Lista de torneos favoritos */}
        {isLoading ? (
          // Loading state
          <View className="items-center justify-center py-12">
            <Text style={{ color: colors.textSecondary }}>
              Cargando...
            </Text>
          </View>
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))
        ) : (
          // Estado vacío
          <View 
            className="items-center justify-center py-12 px-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons
              name="star-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text 
              className="text-lg font-semibold mt-4 mb-2 text-center"
              style={{ color: colors.text }}
            >
              No tienes torneos favoritos
            </Text>
            <Text 
              className="text-center mb-6"
              style={{ color: colors.textSecondary }}
            >
              Marca torneos como favoritos para verlos aquí
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/search")}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">
                Buscar Torneos
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.ScrollView>
    </Screen>
  );
}