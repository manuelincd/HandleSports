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
    e.stopPropagation(); 
    toggleFavorite(tournament.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      // 1. Movemos el margen aquí (espacio ENTRE tarjetas)
      className="mb-4" 
      style={({ pressed }) => ({
        // Solo la animación de escala y opacidad va en el Pressable
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* 2. CREAMOS UNA VIEW INTERNA PARA EL ESTILO VISUAL */}
      {/* Esta View garantiza que el background.surface se renderice siempre */}
      <View 
        className="flex-row rounded-2xl px-4 py-6 border"
        style={{
            // Color de fondo seguro
            backgroundColor: colors.surface,
            // Borde sutil para contraste
            borderColor: colors.border,
            // Sombra para elevación (hace que flote)
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3, // Importante para Android
        }}
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
                  style={{ backgroundColor: colors.background }} // Fondo gris mientras carga
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
                      className="text-base flex-1 font-medium" 
                      style={{ color: colors.textSecondary }}
                  >
                      {sport?.name}
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

          {/* Botón de favorito */}
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