import { Screen } from "@/components/Screen";
import { EventCard } from "@/components/events/EventCard";
import { CreateTournamentModal } from "@/components/events/CreateTournamentModal";
import { TOURNAMENTS } from "@/data/tournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EventsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const HEADER_HEIGHT = 56;

  // Animación del header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT + insets.top],
    outputRange: [0, -(HEADER_HEIGHT + insets.top)],
    extrapolate: "clamp",
  });

  const handleOpenModal = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCreateTournament = (data: any) => {
    console.log("Crear torneo:", data);
    bottomSheetRef.current?.close();
    // TODO: Agregar a store
  };

  // Filtrar torneos del usuario (simulado)
  const myTournaments = TOURNAMENTS.slice(0, 3);

  return (
    <Screen>
      {/* Header colapsable */}
      <Animated.View
        className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-10"
        style={{
          backgroundColor: colors.background,
          height: HEADER_HEIGHT + insets.top,
          paddingTop: insets.top,
          transform: [{ translateY: headerTranslateY }],
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

      {/* Lista de torneos */}
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
        {myTournaments.length > 0 ? (
          myTournaments.map((tournament) => (
            <EventCard key={tournament.id} tournament={tournament} />
          ))
        ) : (
          // Estado vacío
          <View
            className="items-center justify-center py-12 px-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text
              className="text-lg font-semibold mt-4 mb-2 text-center"
              style={{ color: colors.text }}
            >
              No tienes eventos creados
            </Text>
            <Text
              className="text-center mb-6"
              style={{ color: colors.textSecondary }}
            >
              Crea tu primer torneo y empieza a gestionarlo
            </Text>
            <Pressable
              onPress={handleOpenModal}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Crear Evento</Text>
            </Pressable>
          </View>
        )}
      </Animated.ScrollView>

      {/* Modal para crear torneo */}
      <CreateTournamentModal
        ref={bottomSheetRef}
        onSubmit={handleCreateTournament}
      />
    </Screen>
  );
}