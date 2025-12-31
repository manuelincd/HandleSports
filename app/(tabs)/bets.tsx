import { Screen } from "@/components/Screen";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BetsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Altura consistente con tu AppHeader
  const HEADER_HEIGHT = 56;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT + insets.top],
    outputRange: [0, -(HEADER_HEIGHT + insets.top)],
    extrapolate: "clamp",
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false, title: "Apuestas" }} />

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
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
            Apuestas
          </Text>
        </Animated.View>

        <View
          className="flex-1 items-center justify-center py-12 px-6 rounded-[32px] mt-16"
          style={{ backgroundColor: colors.surface }}
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Ionicons name="stats-chart" size={48} color={colors.primary} />
          </View>

          <Text
            className="text-xl font-bold mt-2 mb-3 text-center"
            style={{ color: colors.text }}
          >
            Próximamente
          </Text>

          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: colors.textSecondary }}
          >
            Estamos preparando un sistema de apuestas y predicciones para que vivas tus torneos con más emoción.
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/search")}
            className="px-8 py-4 rounded-2xl w-full items-center"
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
          >
            <Text className="font-bold text-base"
              style={{ color: colors.text }}>
              Explorar Torneos Disponibles
            </Text>
          </Pressable>

          <View
            className="mt-6 px-4 py-1.5 rounded-full border"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              En construcción
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}