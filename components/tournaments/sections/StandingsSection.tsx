// PLACEHOLDER POR EL MOMENTO

import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  tournamentId: string;
};

export function StandingsSection({ tournamentId }: Props) {
  const colors = useThemeColors();

  return (
    <View
      className="p-6 rounded-2xl items-center"
      style={{ backgroundColor: colors.surface }}
    >
      <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
      <Text
        className="text-lg font-semibold mt-4 mb-2"
        style={{ color: colors.text }}
      >
        Tabla de Posiciones
      </Text>
      <Text className="text-center" style={{ color: colors.textSecondary }}>
        La tabla se mostrará aquí
      </Text>
    </View>
  );
}