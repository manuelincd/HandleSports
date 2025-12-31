// app/_layout.tsx
import { colors } from "@/theme/colors";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import "../global.css";

export default function RootLayout() {
  const scheme = useColorScheme() ?? "light";
  const theme = colors[scheme];

  const { initialize, isLoading: isAuthLoading } = useAuthStore();

 
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  
  useEffect(() => {
    initialize();
  }, []);

  
  if (!fontsLoaded || isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleAlign: "left",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background }, 
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        
        
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>

      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </GestureHandlerRootView>
  );
}