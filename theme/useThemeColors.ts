import { useColorScheme } from "react-native";
import { colors } from "./colors";

export function useThemeColors() {
  const scheme = useColorScheme() ?? "light";
  return colors[scheme];
}
