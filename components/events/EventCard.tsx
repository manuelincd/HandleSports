import { Tournament } from "@/types/Tournament";
import { SPORTS } from "@/data/sports";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

const placeholder = require("@/assets/images/tournament-placeholder.png");

type Props = {
  tournament: Tournament;
};

export function EventCard({ tournament }: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  const sport = SPORTS.find((s) => s.id === tournament.sportId);

  return (
    <Pressable
      onPress={() =>
        router.push(`/(tabs)/tournaments/${tournament.id}/manage`)
      }
      className="rounded-2xl p-4 mb-4"
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Header del card */}
      <View className="flex-row items-center mb-4">
        <Image
          source={
            tournament.logoUrl ? { uri: tournament.logoUrl } : placeholder
          }
          className="w-16 h-16 rounded-xl mr-3"
        />
        <View className="flex-1">
          <Text
            className="text-lg font-bold mb-1"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {tournament.name}
          </Text>
          <View className="flex-row items-center">
            <Text className="mr-2">{sport?.emoji}</Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {sport?.name}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.textSecondary}
        />
      </View>

      {/* Stats rápidas */}
      <View
        className="flex-row justify-between pt-4 border-t"
        style={{ borderTopColor: colors.border }}
      >
        <View className="items-center flex-1">
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text
            className="text-lg font-bold mt-1"
            style={{ color: colors.text }}
          >
            {tournament.teamsCount}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Equipos
          </Text>
        </View>

        <View className="items-center flex-1">
          <Ionicons name="trophy" size={20} color={colors.primary} />
          <Text
            className="text-lg font-bold mt-1"
            style={{ color: colors.text }}
          >
            {tournament.matchesCount || 0}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Partidos
          </Text>
        </View>

        <View className="items-center flex-1">
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text
            className="text-sm font-semibold mt-1"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {tournament.location}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Ubicación
          </Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View className="flex-row mt-4 gap-2">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/(tabs)/tournaments/${tournament.id}/edit`);
          }}
          className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
          style={{ backgroundColor: colors.background }}
        >
          <Ionicons name="pencil" size={16} color={colors.text} />
          <Text
            className="ml-2 font-semibold text-sm"
            style={{ color: colors.text }}
          >
            Editar
          </Text>
        </Pressable>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/(tabs)/tournaments/${tournament.id}/matches`);
          }}
          className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="football" size={16} color="#fff" />
          <Text className="ml-2 font-semibold text-sm text-white">
            Partidos
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}