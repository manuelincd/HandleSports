import { View, Text, Image, Pressable } from "react-native";
import { Tournament } from "@/types/Tournament";
import { useThemeColors } from "@/theme/useThemeColors";
import { SPORTS } from "@/data/sports";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "@/store/useFavorites";

const placeholder = require("@/assets/images/tournament-placeholder.png");

type Props = {
  tournament: Tournament;
};

export function TournamentCard({ tournament }: Props) {
    const colors = useThemeColors();
    const router = useRouter();
    const sport = SPORTS.find(s => s.id === tournament.sportId);
    
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const isFav = isFavorite(tournament.id);

    const handlePress = () => {
        router.push(`/tournament/${tournament.id}`);
    };

    const handleFavoritePress = (e: any) => {
        e.stopPropagation(); // Evita que se active el onPress del card
        toggleFavorite(tournament.id);
    };

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row rounded-2xl px-4 py-6 mb-4"
            style={({ pressed }) => ({
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
        >
            {/* Imagen del torneo */}
            <View className="relative">
                <Image
                    source={
                        tournament.logoUrl
                            ? { uri: tournament.logoUrl }
                            : placeholder
                    }
                    className="w-20 h-20 rounded-xl"
                />
            </View>

            {/* Información del torneo */}
            <View className="flex-1 justify-center ml-4">
                <Text 
                    className="text-xl font-bold mb-1" 
                    style={{ color: colors.text }}
                    numberOfLines={2}
                >
                    {tournament.name}
                </Text>

                <View className="flex-row items-center mb-1">
                    <Text className="text-base mr-1">{sport?.emoji}</Text>
                    <Text 
                        className="text-base flex-1" 
                        style={{ color: colors.textSecondary }}
                    >
                        {sport?.name}
                    </Text>
                </View>

                <View className="flex-row items-center mb-1">
                    <Ionicons 
                        name="location-outline" 
                        size={16} 
                        color={colors.textSecondary} 
                    />
                    <Text 
                        className="text-base ml-1" 
                        style={{ color: colors.textSecondary }}
                    >
                        {tournament.location}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Ionicons 
                        name="people-outline" 
                        size={16} 
                        color={colors.textSecondary} 
                    />
                    <Text 
                        className="text-base ml-1" 
                        style={{ color: colors.textSecondary }}
                    >
                        {tournament.teamsCount} equipos
                    </Text>
                </View>
            </View>

            {/* Botón de favorito */}
            <View className="justify-center">
                <Pressable
                    onPress={handleFavoritePress}
                    className="p-2 -mr-2"
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1,
                    })}
                >
                    <Ionicons 
                        name={isFav ? "star" : "star-outline"} 
                        size={28} 
                        color={isFav ? "#fbbf24" : colors.textSecondary} 
                    />
                </Pressable>
            </View>
        </Pressable>
    );
}