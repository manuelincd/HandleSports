import { SafeAreaView } from "react-native-safe-area-context";
import { PropsWithChildren } from "react";
import { useThemeColors } from "@/theme/useThemeColors";

export function Screen({ children }: PropsWithChildren) {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      edges={["top"]}
    >
      {children}
    </SafeAreaView>
  );
}
