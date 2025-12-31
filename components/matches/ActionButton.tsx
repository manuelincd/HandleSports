import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
};

export function ActionButton({ icon, label, color, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center p-3 rounded-xl border"
      style={{
        backgroundColor: `${color}10`, // 10% de opacidad hexadecimal
        borderColor: `${color}30`,
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text className="ml-2 font-bold text-xs" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}