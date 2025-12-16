import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { colors } from "@/theme/colors";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";

export default function RootLayout() {
  const scheme = useColorScheme() ?? "light";
  const theme = colors[scheme];

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
          headerTitle: (props) => (
            <AppHeaderTitle title={String(props.children ?? "")} />
          ),
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
