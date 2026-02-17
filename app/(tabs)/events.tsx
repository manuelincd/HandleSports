import { Screen } from "@/components/Screen";
import { CreateTournamentModal } from "@/components/events/CreateTournamentModal";
import { EventCard } from "@/components/events/EventCard";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/store/useAuthStore";
import { useMatchesStore } from "@/store/useMatches";
import { useTournamentsStore } from "@/store/useTournaments";

export default function EventsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuthStore();

  const {
    tournaments,
    addTournament,
    fetchTournaments,
    isLoading: loadingTournaments
  } = useTournamentsStore();

  const {
    fetchMatches,
    isLoading: loadingMatches
  } = useMatchesStore();

  const HEADER_HEIGHT = 56;

  useEffect(() => {
    fetchTournaments();
    fetchMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTournaments(), fetchMatches()]);
    setRefreshing(false);
  };

  const isLoading = loadingTournaments || loadingMatches;

  const myTournaments = useMemo(() => {
    if (!user) return [];
    return tournaments.filter(t => t.ownerId === user.uid);
  }, [tournaments, user]);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT + insets.top],
    outputRange: [0, -(HEADER_HEIGHT + insets.top)],
    extrapolate: "clamp",
  });

  const handleOpenModal = () => {
    if (!user) {
      Alert.alert(
        "Cuenta requerida",
        "Necesitas iniciar sesión para crear y gestionar torneos.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/(auth)/login") }
        ]
      );
      return;
    }
    bottomSheetRef.current?.expand();
  };

  const handleCreateTournament = async (data: any) => {
    const initialSeasonId = `s_${Date.now()}`;
    await addTournament({
      name: data.name,
      sportId: data.sportId,
      location: data.location,
      teamsCount: parseInt(data.teamsCount),
      format: data.format,
      logoUrl: data.logoUrl || null,
      seasons: [
        {
          id: initialSeasonId,
          name: "Temporada 1",
          isActive: true
        }
      ],
      activeSeasonId: initialSeasonId,
    });
  };

  return (
    <Screen>
      <Animated.View
        className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-10"
        style={{
          backgroundColor: colors.background,
          height: HEADER_HEIGHT + insets.top,
          paddingTop: insets.top,
          transform: [{ translateY: headerTranslateY }],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Mis Eventos
        </Text>

        <Pressable
          onPress={handleOpenModal}
          className="p-2 rounded-full"
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* LÓGICA DE VISTA */}
        {!user ? (
          <View
            className="items-center justify-center py-12 px-4 rounded-[32px] mt-4 border border-dashed"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
            <Text className="text-lg font-semibold mt-4 mb-2 text-center" style={{ color: colors.text }}>
              Gestiona tus Torneos
            </Text>
            <Text className="text-center mb-6" style={{ color: colors.textSecondary }}>
              Inicia sesión para crear torneos, gestionar partidos y actualizar resultados.
            </Text>
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Iniciar Sesión</Text>
            </Pressable>
          </View>

        ) : isLoading && myTournaments.length === 0 ? (
          <View className="py-20">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

        ) : myTournaments.length > 0 ? (
          myTournaments.map((tournament) => (
            <Pressable
              key={tournament.id}
              onPress={() => router.push(`/tournament/${tournament.id}/manage`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <EventCard tournament={tournament} />
            </Pressable>
          ))

        ) : (
          <View
            className="items-center justify-center py-12 px-4 rounded-[32px]"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text className="text-lg font-semibold mt-4 mb-2 text-center" style={{ color: colors.text }}>
              No tienes eventos creados
            </Text>
            <Pressable
              onPress={handleOpenModal}
              className="px-6 py-3 rounded-full mt-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Crear Mi Primer Evento</Text>
            </Pressable>
          </View>
        )}
      </Animated.ScrollView>

      <CreateTournamentModal ref={bottomSheetRef} onSubmit={handleCreateTournament} />
    </Screen>
  );
}