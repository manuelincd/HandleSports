import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { SportChip } from "@/components/SportChip";
import { TournamentCard } from "@/components/TournamentCard";
import { useTournamentsStore } from "@/store/useTournaments";
import { useFavoritesStore } from "@/store/useFavorites";
import { useSportsStore } from "@/store/useSports"; 

import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { Animated, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
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
  
  const { favorites, loadFavorites, isLoading: isFavLoading } = useFavoritesStore();
  const { tournaments, fetchTournaments, isLoading: isTournamentsLoading } = useTournamentsStore();
  
  // 3. USAMOS EL STORE DE DEPORTES
  const { sports, fetchSports, isLoading: isSportsLoading } = useSportsStore();

  const HEADER_HEIGHT = 56;

  useEffect(() => {
    loadFavorites();
    fetchTournaments();
    fetchSports(); // <--- Descargar deportes de Firebase
  }, []);

  // 4. CREAR LISTA COMBINADA PARA LA UI
  // Firebase solo devuelve los deportes reales. Nosotros agregamos el chip "Todos" manualmente.
  const uiSportsList = useMemo(() => {
      return [
          { id: 'all', name: 'Todos', emoji: '🏆' }, // Chip estático
          ...sports // Deportes de Firebase
      ];
  }, [sports]);

  const isLoading = isFavLoading || isTournamentsLoading || isSportsLoading;

  const favoriteTournaments = tournaments.filter((t) =>
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
        {/* Chips de deportes (Ahora dinámicos) */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {uiSportsList.map((sport) => (
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
        <View className="flex-row justify-between items-center mb-4">
            <Text 
            className="text-xl font-bold"
            style={{ color: colors.text }}
            >
            Mis Torneos Favoritos
            </Text>
        </View>

        {/* Lista de torneos favoritos */}
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Cargando torneos...
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
          <View 
            className="items-center justify-center py-12 px-4 rounded-2xl border"
            style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border
            }}
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