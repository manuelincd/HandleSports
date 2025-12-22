import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
};

export function ManageOptionCard({
  title,
  description,
  icon,
  route,
  color,
}: Props) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(route as any)}
      className="flex-row items-center p-4 mb-3 rounded-2xl"
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
        
      })}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View className="flex-1">
        <Text
          className="text-base font-semibold mb-1"
          style={{ color: colors.text,}}
        >
          {title}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}