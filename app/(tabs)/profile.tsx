import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoritesStore } from "@/store/useFavorites";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tournaments } = useTournamentsStore();
  const { favorites } = useFavoritesStore();
  
  const myTournamentsCount = tournaments.filter(t => t.ownerId === user?.uid).length;
  const favoritesCount = favorites.filter(favId =>
    tournaments.some(t => t.id === favId)
  ).length;

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: signOut }
      ]
    );
  };

  if (!user) {
    return (
      <Screen>
        <View className="flex-1 justify-center px-8">
          <View className="items-center mb-10">
            <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 transform rotate-3" style={{ backgroundColor: colors.primary + "20" }}>
              <Ionicons name="trophy" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-center mb-3" style={{ color: colors.text }}>
              Únete al Juego
            </Text>
            <Text className="text-center text-base leading-6" style={{ color: colors.textSecondary }}>
              Crea torneos, sigue tus equipos favoritos y compite con amigos. La mejor experiencia deportiva te espera.
            </Text>
          </View>

          <View className="mb-10 space-y-4">
            <BenefitRow icon="create-outline" text="Organiza tus propios torneos" colors={colors} />
            <BenefitRow icon="star-outline" text="Guarda tus equipos favoritos" colors={colors} />
            <BenefitRow icon="stats-chart-outline" text="Estadísticas en tiempo real" colors={colors} />
          </View>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            className="w-full py-4 rounded-2xl items-center shadow-md flex-row justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg mr-2">Iniciar Sesión</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text style={{ color: colors.textSecondary }}>¿No tienes cuenta? </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="font-bold" style={{ color: colors.primary }}>Regístrate</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: colors.surface, paddingBottom: 24, paddingTop: insets.top + 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View className="items-center px-6">
            <Pressable className="relative mb-4">
              <View
                className="w-24 h-24 rounded-full items-center justify-center border-4"
                style={{ backgroundColor: colors.background, borderColor: colors.background }}
              >
                {user.photoURL ? (
                  <Image source={{ uri: user.photoURL }} className="w-full h-full rounded-full" />
                ) : (
                  <Ionicons name="person" size={40} color={colors.textSecondary} />
                )}
              </View>
              <View className="absolute bottom-0 right-0 p-2 rounded-full border-2" style={{ backgroundColor: colors.primary, borderColor: colors.surface }}>
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </Pressable>

            <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
              {user.displayName || "Usuario Deportista"}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{user.email}</Text>

            <View className="flex-row mt-6 w-full justify-around bg-gray-50/5 p-4 rounded-2xl border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
              <StatItem label="Favoritos" value={favoritesCount} colors={colors} />
              <View className="w-[1px] h-full bg-gray-200" style={{ backgroundColor: colors.border }} />
              <StatItem label="Torneos" value={myTournamentsCount} colors={colors} />
              <View className="w-[1px] h-full bg-gray-200" style={{ backgroundColor: colors.border }} />
              <StatItem label="Nivel" value="Pro" colors={colors} />
            </View>
          </View>
        </View>

        {/* Secciones del Menú */}
        <View className="px-4 mt-6">

          <SectionTitle title="Cuenta" colors={colors} />
          <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: colors.surface }}>
            <MenuOption
              icon="person-outline"
              label="Editar Perfil"
              onPress={() => { }}
              colors={colors}
            />
            <MenuOption
              icon="notifications-outline"
              label="Notificaciones"
              onPress={() => { }}
              colors={colors}
              hasSwitch
            />
            <MenuOption
              icon="shield-checkmark-outline"
              label="Seguridad (2FA)"
              onPress={() => router.push("/profile/two-factor")}
              colors={colors}
            />
          </View>

          <SectionTitle title="Actividad" colors={colors} />
          <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: colors.surface }}>
            <MenuOption
              icon="trophy-outline"
              label="Mis Torneos"
              onPress={() => router.push("/(tabs)/events")}
              colors={colors}
            />
            <MenuOption
              icon="heart-outline"
              label="Favoritos"
              onPress={() => { }}
              colors={colors}
            />
          </View>

          <SectionTitle title="Aplicación" colors={colors} />
          <View className="rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: colors.surface }}>
            <MenuOption
              icon="moon-outline"
              label="Modo Oscuro"
              onPress={() => { }}
              colors={colors}
              value="Automático"
            />
            <MenuOption
              icon="information-circle-outline"
              label="Sobre Nosotros"
              onPress={() => { }}
              colors={colors}
            />
            <MenuOption
              icon="log-out-outline"
              label="Cerrar Sesión"
              onPress={handleSignOut}
              colors={colors}
              isDestructive
              hideChevron
            />
          </View>

          <Text className="text-center text-xs mb-8 opacity-50" style={{ color: colors.textSecondary }}>
            Versión 1.0.2 (Build 145)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


function StatItem({ label, value, colors }: any) {
  return (
    <View className="items-center px-4">
      <Text className="text-lg font-bold" style={{ color: colors.text }}>{value}</Text>
      <Text className="text-xs uppercase tracking-wider" style={{ color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, colors }: any) {
  return (
    <Text className="text-xs font-bold uppercase tracking-widest mb-2 ml-4 opacity-70" style={{ color: colors.textSecondary }}>
      {title}
    </Text>
  );
}

function MenuOption({ icon, label, onPress, colors, isDestructive = false, hasSwitch = false, value, hideChevron = false }: any) {
  return (
    <Pressable
      onPress={hasSwitch ? undefined : onPress}
      className="flex-row items-center p-4 border-b active:opacity-70"
      style={({ pressed }) => ({
        borderBottomColor: colors.background,
        borderBottomWidth: 1,
        backgroundColor: pressed && !hasSwitch ? colors.background : "transparent"
      })}
    >
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`} style={{ backgroundColor: isDestructive ? colors.error + '10' : colors.background }}>
        <Ionicons
          name={icon}
          size={18}
          color={isDestructive ? colors.error : colors.text}
        />
      </View>

      <Text
        className="flex-1 font-medium text-base"
        style={{ color: isDestructive ? colors.error : colors.text }}
      >
        {label}
      </Text>

      {value && (
        <Text className="mr-2 text-sm" style={{ color: colors.textSecondary }}>{value}</Text>
      )}

      {hasSwitch ? (
        <Switch
          trackColor={{ false: "#767577", true: colors.primary }}
          thumbColor={"#f4f3f4"}
          value={true}
          onValueChange={() => { }}
        />
      ) : !hideChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ opacity: 0.5 }} />
      )}
    </Pressable>
  )
}

function BenefitRow({ icon, text, colors }: any) {
  return (
    <View className="flex-row items-center">
      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
      <Text className="ml-3 text-base font-medium" style={{ color: colors.text }}>{text}</Text>
    </View>
  );
}