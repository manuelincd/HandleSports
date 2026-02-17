import { TournamentFormat } from "@/types/Tournament";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useTournamentsStore } from "@/store/useTournaments";

const FORMAT_OPTIONS = [
  { id: "league" as const, label: "Liga", emoji: "📊", description: "Todos vs Todos" },
  { id: "knockout" as const, label: "Eliminación", emoji: "🏆", description: "Directa" },
  { id: "mixed" as const, label: "Mixto", emoji: "⚡", description: "Grupos + Elim." },
];

type FormData = {
  name: string;
  sportId: string;
  location: string;
  teamsCount: string;
  format: TournamentFormat;
  logoUrl: string;
  // Nuevos campos
  winPoints: string;
  drawPoints: string;
  lossPoints: string;
};

type Sport = {
    id: string;
    name: string;
    emoji: string;
};

export default function EditTournamentScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { tournaments, updateTournament, fetchTournaments } = useTournamentsStore();
  const tournament = tournaments.find((t) => t.id === id);

  const [isSaving, setIsSaving] = useState(false);
  
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoadingSports, setIsLoadingSports] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: tournament?.name || "",
    sportId: tournament?.sportId || "",
    location: tournament?.location || "",
    teamsCount: tournament?.teamsCount.toString() || "",
    format: tournament?.format || "league",
    logoUrl: tournament?.logoUrl || "",
    // Inicializamos con valores del torneo o por defecto
    winPoints: tournament?.winPoints?.toString() ?? "3",
    drawPoints: tournament?.drawPoints?.toString() ?? "1",
    lossPoints: tournament?.lossPoints?.toString() ?? "0",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSports = async () => {
        try {
            const q = query(collection(db, "sports"), orderBy("name"));
            const querySnapshot = await getDocs(q);
            
            const sportsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Sport[];

            setSports(sportsData);
        } catch (error) {
            console.error("Error cargando deportes:", error);
        } finally {
            setIsLoadingSports(false);
        }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    if (!tournament) fetchTournaments();
  }, [id, tournament]);

  useEffect(() => {
    if (tournament && !hasChanges) {
        setFormData({
            name: tournament.name,
            sportId: tournament.sportId,
            location: tournament.location,
            teamsCount: tournament.teamsCount.toString(),
            format: tournament.format,
            logoUrl: tournament.logoUrl || "",
            // Actualizamos si llegan datos de la BD
            winPoints: tournament.winPoints?.toString() ?? "3",
            drawPoints: tournament.drawPoints?.toString() ?? "1",
            lossPoints: tournament.lossPoints?.toString() ?? "0",
        });
    }
  }, [tournament]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    if (!formData.sportId) return Alert.alert("Error", "Selecciona un deporte");

    setIsSaving(true);
    try {
        await updateTournament(id, {
            name: formData.name,
            sportId: formData.sportId,
            location: formData.location,
            teamsCount: parseInt(formData.teamsCount) || 0,
            format: formData.format,
            logoUrl: formData.logoUrl,
            // Guardamos los puntos como números
            winPoints: parseInt(formData.winPoints) || 3,
            drawPoints: parseInt(formData.drawPoints) || 1,
            lossPoints: parseInt(formData.lossPoints) || 0,
        });
        
        router.back();
    } catch (error) {
        Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert("Descartar cambios", "¿Salir sin guardar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }, [hasChanges, router]);

  const isFormValid = formData.name.trim() && formData.sportId && formData.location.trim();

  if (!tournament) {
      return (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
            <ActivityIndicator color={colors.primary} />
        </View>
      );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        
        {/* HEADER */}
        <View
          className="px-4 pb-4 border-b z-10"
          style={{
            backgroundColor: colors.surface,
            paddingTop: insets.top + 8,
            borderBottomColor: colors.border
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Pressable onPress={handleCancel} className="p-2 -ml-2 rounded-full mr-2">
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
              <Text className="text-xl font-bold" style={{ color: colors.text }}>Editar Torneo</Text>
            </View>
            
            {hasChanges && (
               <Pressable 
                onPress={handleSave} 
                disabled={!isFormValid || isSaving}
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: isFormValid ? colors.primary : colors.border }}
               >
                   {isSaving ? (
                       <ActivityIndicator size="small" color="white" />
                   ) : (
                       <Text className="text-white font-bold text-xs">Guardar</Text>
                   )}
               </Pressable>
            )}
          </View>
        </View>

        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <ScrollView
            contentContainerStyle={{ 
                padding: 16, 
                paddingBottom: 100 
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
            {/* Nombre */}
            <View className="mb-6">
                <Text className="text-xs mb-2 font-bold ml-1 uppercase" style={{ color: colors.textSecondary }}>Nombre</Text>
                <TextInput
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                className="px-4 py-4 rounded-2xl text-md border"
                style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                }}
                />
            </View>

            {/* Deporte (CARGADO DINÁMICAMENTE) */}
            <View className="mb-6">
                <Text className="text-xs mb-3 font-bold ml-1 uppercase" style={{ color: colors.textSecondary }}>Deporte</Text>
                
                {isLoadingSports ? (
                    <ActivityIndicator color={colors.primary} style={{ alignSelf: "flex-start", marginLeft: 10 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                    {sports.map((sport) => {
                        const isSelected = formData.sportId === sport.id;
                        return (
                            <Pressable
                                key={sport.id}
                                onPress={() => handleChange("sportId", sport.id)}
                                className="mr-3"
                            >
                                <View 
                                    className="px-5 py-3 rounded-2xl flex-row items-center border"
                                    style={{
                                        backgroundColor: isSelected ? colors.primary : colors.surface,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        borderWidth: 1, 
                                    }}
                                >
                                    <Text className="mr-2 text-xl">{sport.emoji}</Text>
                                    <Text 
                                        className="font-bold text-sm"
                                        style={{ color: isSelected ? "#fff" : colors.text }}
                                    >
                                        {sport.name}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={16} color="white" style={{ marginLeft: 6 }} />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                    </ScrollView>
                )}
            </View>

            {/* Formato */}
            <View className="mb-6">
                <Text className="text-xs mb-3 font-bold ml-1 uppercase" style={{ color: colors.textSecondary }}>Formato</Text>
                <View className="flex-row gap-3">
                {FORMAT_OPTIONS.map((format) => {
                    const isSelected = formData.format === format.id;
                    return (
                    <Pressable
                        key={format.id}
                        onPress={() => handleChange("format", format.id)}
                        className="flex-1"
                    >
                        <View 
                            className="py-4 px-2 rounded-2xl items-center border"
                            style={{
                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                borderColor: isSelected ? colors.primary : colors.border,
                                borderWidth: 1,
                            }}
                        >
                            <Text className="text-3xl mb-2">{format.emoji}</Text>
                            <Text
                            className="text-xs font-bold text-center mb-1"
                            style={{ color: isSelected ? "#fff" : colors.text }}
                            >
                            {format.label}
                            </Text>
                            <Text
                            className="text-[10px] text-center"
                            style={{ color: isSelected ? "rgba(255,255,255,0.8)" : colors.textSecondary }}
                            >
                            {format.description}
                            </Text>
                        </View>
                    </Pressable>
                    );
                })}
                </View>
            </View>

            {/* Ubicación */}
            <View className="mb-6">
                <Text className="text-xs mb-2 font-bold ml-1 uppercase" style={{ color: colors.textSecondary }}>Sede / Ciudad</Text>
                <TextInput
                value={formData.location}
                onChangeText={(text) => handleChange("location", text)}
                className="px-4 py-4 rounded-2xl text-md border"
                style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                }}
                />
            </View>

            {/* Equipos */}
            <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2 ml-1">
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Cupo de Equipos</Text>
                </View>
                <TextInput
                value={formData.teamsCount}
                onChangeText={(text) => handleChange("teamsCount", text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                className="px-4 py-4 rounded-2xl text-md border"
                style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                }}
                />
            </View>

            {/* URL Logo */}
            <View className="mb-8">
                <Text className="text-xs mb-2 font-bold ml-1 uppercase" style={{ color: colors.textSecondary }}>URL del Logo</Text>
                <TextInput
                value={formData.logoUrl}
                onChangeText={(text) => handleChange("logoUrl", text)}
                placeholder="https://..."
                placeholderTextColor={colors.textSecondary + "80"}
                autoCapitalize="none"
                className="px-4 py-4 rounded-2xl text-md border"
                style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                }}
                />
            </View>

            {/* --- SECCIÓN DE PUNTOS --- */}
            <View className="mb-8">
                <Text className="text-xs font-bold mb-3 uppercase" style={{ color: colors.textSecondary }}>
                    Sistema de Puntuación
                </Text>
                <View className="flex-row gap-3">
                    {/* Ganar */}
                    <View className="flex-1">
                        <Text className="text-[10px] text-center mb-1 font-bold" style={{ color: colors.success }}>
                            GANAR
                        </Text>
                        <TextInput 
                            value={formData.winPoints}
                            onChangeText={(t) => handleChange("winPoints", t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            className="p-4 rounded-2xl text-center border font-bold text-lg"
                            style={{ 
                                backgroundColor: colors.surface, 
                                borderColor: colors.border, 
                                color: colors.text 
                            }}
                        />
                    </View>
                    
                    {/* Empatar */}
                    <View className="flex-1">
                        <Text className="text-[10px] text-center mb-1 font-bold" style={{ color: "#EAB308" }}>
                            EMPATAR
                        </Text>
                        <TextInput 
                            value={formData.drawPoints}
                            onChangeText={(t) => handleChange("drawPoints", t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            className="p-4 rounded-2xl text-center border font-bold text-lg"
                            style={{ 
                                backgroundColor: colors.surface, 
                                borderColor: colors.border, 
                                color: colors.text 
                            }}
                        />
                    </View>

                    {/* Perder */}
                    <View className="flex-1">
                        <Text className="text-[10px] text-center mb-1 font-bold" style={{ color: colors.error }}>
                            PERDER
                        </Text>
                        <TextInput 
                            value={formData.lossPoints}
                            onChangeText={(t) => handleChange("lossPoints", t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            className="p-4 rounded-2xl text-center border font-bold text-lg"
                            style={{ 
                                backgroundColor: colors.surface, 
                                borderColor: colors.border, 
                                color: colors.text 
                            }}
                        />
                    </View>
                </View>
            </View>

            </ScrollView>
            
            {/* FOOTER */}
            <View 
                className="p-4 border-t"
                style={{ 
                    backgroundColor: colors.background, 
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 16
                }}
            >
                <Pressable
                onPress={handleSave}
                disabled={!hasChanges || !isFormValid || isSaving}
                className="w-full py-4 rounded-2xl items-center justify-center flex-row shadow-sm"
                style={{ 
                    backgroundColor: colors.primary,
                    opacity: (!hasChanges || !isFormValid || isSaving) ? 0.5 : 1
                }}
                >
                {isSaving ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white font-bold text-lg mr-2">Guardar Cambios</Text>
                        <Ionicons name="checkmark" size={24} color="white" />
                    </>
                )}
                </Pressable>
            </View>

        </KeyboardAvoidingView>

      </View>
    </>
  );
}