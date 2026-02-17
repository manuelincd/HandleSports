import { Screen } from "@/components/Screen";
import { SportChip } from "@/components/SportChip";
import { TournamentCard } from "@/components/TournamentCard";
import { useTournamentsStore } from "@/store/useTournaments"; 
import { useSportsStore } from "@/store/useSports"; // <--- Nuevo import

import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useMemo } from "react";
import { ScrollView, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  const { 
    tournaments, 
    fetchTournaments, 
    isLoading: isLoadingTournaments 
  } = useTournamentsStore();

  const { 
    sports, 
    fetchSports, 
    isLoading: isLoadingSports 
  } = useSportsStore();

  useEffect(() => {
    fetchTournaments();
    fetchSports();
  }, []);
  const uiSportsList = useMemo(() => {
    return [
        { id: 'all', name: 'Todos', emoji: '🌍' }, 
        ...sports 
    ];
  }, [sports]);

  const isLoading = isLoadingTournaments || isLoadingSports;

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      tournament.location
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSport =
      selectedSport === "all" || tournament.sportId === selectedSport;

    return matchesSearch && matchesSport;
  });

  return (
    <Screen>
      <View 
        className="px-4 pb-3"
        style={{ 
          paddingTop: insets.top + 16,
          backgroundColor: colors.surface 
        }}
      >
        <Text 
          className="text-2xl font-bold mb-4"
          style={{ color: colors.text }}
        >
          Buscar Torneos
        </Text>

        <View
          className="flex-row items-center px-4 py-4 rounded-xl "
          style={{ backgroundColor: colors.background }}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Buscar por nombre o ubicación..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-md"
            style={{ color: colors.text }}
            autoCapitalize="sentences"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
              onPress={() => setSearchQuery("")}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros por deporte (DINÁMICO) */}
        <View className="mb-6">
          <Text 
            className="text-sm font-semibold mb-3"
            style={{ color: colors.textSecondary }}
          >
            FILTRAR POR DEPORTE
          </Text>
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

        {/* Resultados */}
        {searchQuery.length > 0 && (
          <Text 
            className="text-sm font-semibold mb-4"
            style={{ color: colors.textSecondary }}
          >
            {filteredTournaments.length} RESULTADOS
          </Text>
        )}

        {/* Lista de torneos */}
        {isLoading ? (
            <View className="py-10">
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons
              name="search-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text 
              className="text-lg font-semibold mt-4 mb-2"
              style={{ color: colors.text }}
            >
              {searchQuery.length > 0 
                ? "No se encontraron torneos"
                : "Busca tu torneo favorito"
              }
            </Text>
            <Text 
              className="text-center px-8"
              style={{ color: colors.textSecondary }}
            >
              {searchQuery.length > 0
                ? "Intenta con otros términos de búsqueda"
                : "Usa la barra de búsqueda para encontrar torneos"
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}