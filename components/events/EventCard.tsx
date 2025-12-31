import { SPORTS } from "@/data/sports";
import { useThemeColors } from "@/theme/useThemeColors";
import { Tournament } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
// 1. Nuevos imports
import { useMatchesStore } from "@/store/useMatches";
import { useMemo } from "react";

const placeholder = require("@/assets/images/tournament-placeholder.png");

type Props = {
  tournament: Tournament;
};

export function EventCard({ tournament }: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  const sport = SPORTS.find((s) => s.id === tournament.sportId);

  // 2. Suscribirse al Store de Partidos
  const allMatches = useMatchesStore((state) => state.matches);

  // 3. Cálculo dinámico de Jornadas
  // Usamos useMemo para que solo se recalcule si cambian los partidos o el ID
  const stats = useMemo(() => {
    const tournamentMatches = allMatches.filter(m => m.tournamentId === tournament.id);
    
    // Set crea una lista de valores únicos (elimina duplicados)
    const uniqueMatchdays = new Set(tournamentMatches.map(m => m.matchday).filter(Boolean));
    
    return {
        matchdays: uniqueMatchdays.size,
        matches: tournamentMatches.length
    };
  }, [allMatches, tournament.id]);

  return (
    <Pressable
      onPress={() => router.push(`/tournament/${tournament.id}/manage`)}
      className="mb-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* TARJETA PRINCIPAL */}
      <View
        className="rounded-2xl p-4 border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Header del card */}
        <View className="flex-row items-center mb-4">
          <Image
            source={
              tournament.logoUrl ? { uri: tournament.logoUrl } : placeholder
            }
            className="w-16 h-16 rounded-xl mr-3 bg-gray-100"
            style={{ borderColor: colors.border, borderWidth: 1 }}
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
              <Text className="mr-2 text-base">{sport?.emoji}</Text>
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                {sport?.name}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>

        {/* Stats rápidas */}
        <View
          className="flex-row justify-between pt-4 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <View className="items-center flex-1 border-r" style={{ borderColor: colors.border }}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text className="text-lg font-bold mt-1" style={{ color: colors.text }}>
              {tournament.teamsCount}
            </Text>
            <Text className="text-[10px] uppercase font-bold tracking-wide" style={{ color: colors.textSecondary }}>
              Equipos
            </Text>
          </View>

          {/* --- CAMBIO AQUÍ: JORNADAS --- */}
          <View className="items-center flex-1 border-r" style={{ borderColor: colors.border }}>
            {/* Cambiamos ícono a Calendario */}
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text className="text-lg font-bold mt-1" style={{ color: colors.text }}>
              {/* Usamos el valor calculado */}
              {stats.matchdays}
            </Text>
            <Text className="text-[10px] uppercase font-bold tracking-wide" style={{ color: colors.textSecondary }}>
              Jornadas
            </Text>
          </View>

          <View className="items-center flex-1">
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text className="text-sm font-bold mt-2" style={{ color: colors.text }} numberOfLines={1}>
              {tournament.location.split(',')[0]}
            </Text>
            <Text className="text-[10px] uppercase font-bold tracking-wide" style={{ color: colors.textSecondary }}>
              Sede
            </Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View className="flex-row mt-5 gap-3">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/tournament/${tournament.id}/edit`);
            }}
            className="flex-1"
          >
            <View
              className="flex-row items-center justify-center py-3 rounded-xl border"
              style={{
                backgroundColor: "transparent",
                borderColor: colors.border,
                borderWidth: 1
              }}
            >
              <Ionicons name="create-outline" size={18} color={colors.text} />
              <Text className="ml-2 font-bold text-xs" style={{ color: colors.text }}>
                Editar
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/tournament/${tournament.id}/matchdays`);
            }}
            className="flex-1"
          >
            <View
              className="flex-row items-center justify-center py-3 rounded-xl shadow-sm"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
              }}
            >
              <Ionicons name="football" size={18} color="#fff" />
              <Text className="ml-2 font-bold text-xs text-white">
                Partidos
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}