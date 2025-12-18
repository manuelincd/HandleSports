import { Text, Animated, View, ScrollView } from "react-native";
import { useRef, useState } from "react";
import { useThemeColors } from "@/theme/useThemeColors";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { SPORTS } from "@/data/sports";
import { SportChip } from "@/components/SportChip";

export const options = {
  title: "Home",
};

const HEADER_HEIGHT = 56;

export default function HomeScreen() {
  const colors = useThemeColors();

  // ✅ HOOKS DENTRO DEL COMPONENTE
  const [selectedSport, setSelectedSport] = useState("all");
  const scrollY = useRef(new Animated.Value(0)).current;

  const translateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <Screen>
      {/* Header colapsable */}
      <AppHeader translateY={translateY} />

      {/* Contenido con scroll */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 56 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Chips de deportes */}
        <View style={{ marginTop: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
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
        <Text className="font-bold text-3xl text-red-500">
          HANDLESPORTS
        </Text>
        {/* Aquí después van las cards de torneos */}
      </Animated.ScrollView>
    </Screen>
  );
}