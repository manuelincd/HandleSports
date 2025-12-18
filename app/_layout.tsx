import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import { colors } from "@/theme/colors";
import { useFonts } from "expo-font";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import "../global.css";

export default function RootLayout() {
  const scheme = useColorScheme() ?? "light";
  const theme = colors[scheme];

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleAlign: "left",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>

      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </>
  );
}
