import { TournamentFormat } from "@/types/Tournament";
import { getFormatIcon, getFormatLabel } from "@/utils/tournamentHelpers";
import { useThemeColors } from "@/theme/useThemeColors";
import { Text, View } from "react-native";

type Props = {
  format: TournamentFormat;
};

export function FormatBadge({ format }: Props) {
  const colors = useThemeColors();
  
  return (
    <View className="flex-row items-center px-3 py-1 rounded-full"
      style={{ backgroundColor: colors.primaryLight }}
    >
      <Text className="mr-1">{getFormatIcon(format)}</Text>
      <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
        {getFormatLabel(format).split(" ")[0]}
      </Text>
    </View>
  );
}   