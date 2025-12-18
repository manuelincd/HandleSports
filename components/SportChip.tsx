import { Text, Pressable, View } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";

type Props = {
  label: string;
  emoji: string;
  selected?: boolean;
  onPress?: () => void;
};

export function SportChip({
  label,
  emoji,
  selected = false,
  onPress,
}: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className="items-center mr-3"
      style={{ opacity: selected ? 1 : 0.6 }}
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{
          backgroundColor: selected
            ? colors.primary
            : colors.surface,
        }}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>

      <Text className="mt-1 text-xs" style={{ color: colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
