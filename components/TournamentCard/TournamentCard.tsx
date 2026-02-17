import { View, Text, Image, Pressable } from "react-native";
import { Tournament } from "@/types/Tournament";
import { useThemeColors } from "@/theme/useThemeColors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "@/store/useFavorites";
import { useEffect, useState, useMemo } from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const placeholder = require("@/assets/images/tournament-placeholder.png");

const sportCache: Record<string, { name: string; emoji: string }> = {};

type Props = {
  tournament: Tournament;
};

export function TournamentCard({ tournament }: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  
  const [sportData, setSportData] = useState<{ name: string; emoji: string } | null>(null);
  
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFav = isFavorite(tournament.id);

  const activeSeasonName = useMemo(() => {
      if (!tournament.activeSeasonId || !tournament.seasons) return null;
      return tournament.seasons.find(s => s.id === tournament.activeSeasonId)?.name;
  }, [tournament]);

  useEffect(() => {
    const loadSport = async () => {
        const sportId = tournament.sportId;
        if (!sportId) return;

        if (sportCache[sportId]) {
            setSportData(sportCache[sportId]);
            return;
        }

        try {
            const docRef = doc(db, "sports", sportId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data() as { name: string; emoji: string };
                sportCache[sportId] = data;
                setSportData(data);
            } else {
                setSportData({ name: "Desconocido", emoji: "❓" });
            }
        } catch (error) {
            console.error("Error cargando deporte:", error);
        }
    };

    loadSport();
  }, [tournament.sportId]);

  const handlePress = () => {
    router.push(`/tournament/${tournament.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation(); 
    toggleFavorite(tournament.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-4" 
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View 
        className="flex-row rounded-2xl px-4 py-6 border"
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
          <View className="relative">
              <Image
                  source={
                      tournament.logoUrl
                          ? { uri: tournament.logoUrl }
                          : placeholder
                  }
                  className="w-20 h-20 rounded-xl"
                  style={{ backgroundColor: colors.background }}
              />
          </View>

          <View className="flex-1 justify-center ml-4">
              <Text 
                  className="text-xl font-bold mb-1" 
                  style={{ color: colors.text }}
                  numberOfLines={2}
              >
                  {tournament.name}
              </Text>

              {activeSeasonName && (
                  <View 
                    className="self-start px-3 py-0.5 rounded-full border mb-2"
                    style={{ borderColor: colors.primary }}
                  >
                      <Text 
                        className="text-[10px] font-bold uppercase" 
                        style={{ color: colors.primary }}
                      >
                          {activeSeasonName}
                      </Text>
                  </View>
              )}

              <View className="flex-row items-center mb-1">
                  <Text className="text-base mr-1">{sportData?.emoji || "..."}</Text>
                  <Text 
                      className="text-base flex-1 font-medium" 
                      style={{ color: colors.textSecondary }}
                  >
                      {sportData?.name || "Cargando..."}
                  </Text>
              </View>

              <View className="flex-row items-center mb-1">
                  <Ionicons 
                      name="location-outline" 
                      size={14} 
                      color={colors.textSecondary} 
                  />
                  <Text 
                      className="text-sm ml-1" 
                      style={{ color: colors.textSecondary }}
                  >
                      {tournament.location}
                  </Text>
              </View>

              <View className="flex-row items-center">
                  <Ionicons 
                      name="people-outline" 
                      size={14} 
                      color={colors.textSecondary} 
                  />
                  <Text 
                      className="text-sm ml-1" 
                      style={{ color: colors.textSecondary }}
                  >
                      {tournament.teamsCount} equipos
                  </Text>
              </View>
          </View>

          <View className="justify-center pl-2">
              <Pressable
                  onPress={handleFavoritePress}
                  className="p-2 -mr-2 rounded-full"
                  style={({pressed}) => ({
                      backgroundColor: pressed ? colors.background : 'transparent'
                  })}
              >
                  <Ionicons 
                      name={isFav ? "star" : "star-outline"} 
                      size={28} 
                      color={isFav ? "#fbbf24" : colors.textSecondary} 
                  />
              </Pressable>
          </View>
      </View>
    </Pressable>
  );
}