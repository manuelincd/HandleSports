import { SPORTS } from "@/data/sports";
import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentFormat } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, Text, View, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormData = {
  name: string;
  sportId: string;
  location: string;
  teamsCount: string;
  format: TournamentFormat;
};

type Props = {
  // Ahora onSubmit devuelve una Promesa para poder esperar a que termine
  onSubmit: (data: FormData) => Promise<void>; 
};

const FORMAT_OPTIONS = [
  { id: "league" as const, label: "Liga", emoji: "📊", description: "Todos vs Todos" },
  { id: "knockout" as const, label: "Eliminación", emoji: "🏆", description: "Directa" },
  { id: "mixed" as const, label: "Mixto", emoji: "⚡", description: "Grupos + Elim." },
];

export const CreateTournamentModal = forwardRef<BottomSheet, Props>(
  ({ onSubmit }, ref) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["90%"], []);
    
    // Estado de carga para el botón
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
      name: "",
      sportId: "",
      location: "",
      teamsCount: "",
      format: "league",
    });

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      (ref as any)?.current?.close();
    }, [ref]);

    // --- NUEVA LÓGICA DE VALIDACIÓN Y ENVÍO ---
    const handleSubmit = async () => {
      // 1. Validaciones Explícitas
      if (!formData.name.trim()) {
        Alert.alert("Falta información", "Por favor ingresa un nombre para el torneo.");
        return;
      }
      if (!formData.sportId) {
        Alert.alert("Falta información", "Debes seleccionar un deporte.");
        return;
      }
      if (!formData.location.trim()) {
        Alert.alert("Falta información", "Ingresa la sede o ubicación del torneo.");
        return;
      }
      if (!formData.teamsCount || parseInt(formData.teamsCount) < 2) {
        Alert.alert("Falta información", "El torneo debe tener al menos 2 equipos.");
        return;
      }

      // 2. Proceso de Envío
      try {
        setIsSubmitting(true);
        
        // Esperamos a que la pantalla padre guarde el torneo y refresque la lista
        await onSubmit(formData);

        // 3. Éxito
        setIsSubmitting(false);
        setFormData({
            name: "",
            sportId: "",
            location: "",
            teamsCount: "",
            format: "league",
        });
        handleClose();
        
        // Mensaje de éxito (Opcional, si la pantalla padre no navega inmediatamente)
        Alert.alert("¡Listo!", "El torneo ha sido creado exitosamente.");

      } catch (error) {
        setIsSubmitting(false);
        Alert.alert("Error", "Hubo un problema al crear el torneo. Intenta nuevamente.");
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                  Nuevo Torneo
                </Text>
                <Text style={{ color: colors.textSecondary }}>Configura las reglas básicas</Text>
              </View>
              <Pressable
                onPress={handleClose}
                className="p-2 rounded-full"
                style={{ backgroundColor: colors.background }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Nombre del torneo */}
            <View className="mb-6">
              <Text className="text-[11px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.primary }}>
                Información General
              </Text>
              <BottomSheetTextInput
                placeholder="Nombre del Torneo"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                className="px-4 py-4 rounded-2xl text-md border"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: formData.name ? colors.primary : colors.border
                }}
              />
            </View>

            {/* Selector de deporte (CORREGIDO: View -> Pressable -> View) */}
            <View className="mb-6">
              <Text className="text-[11px] font-bold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Selecciona el Deporte
              </Text>
              <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ paddingRight: 20 }}>
                {SPORTS.filter((s) => s.id !== "all").map((sport) => {
                  const isSelected = formData.sportId === sport.id;
                  return (
                    <View 
                        key={sport.id} 
                        className="mr-3 rounded-2xl overflow-hidden"
                        style={{
                            // Sombra en el contenedor
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isSelected ? 0.2 : 0,
                            shadowRadius: 3,
                            elevation: isSelected ? 3 : 0,
                            backgroundColor: 'transparent' 
                        }}
                    >
                        <Pressable
                            onPress={() => setFormData({ ...formData, sportId: sport.id })}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.9 : 1
                            })}
                        >
                            <View 
                                className="px-5 py-3 flex-row items-center border"
                                style={{
                                    // Colores en el View interno
                                    backgroundColor: isSelected ? colors.primary : colors.surface,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    borderRadius: 16
                                }}
                            >
                                <Text className="text-lg mr-2">{sport.emoji}</Text>
                                <Text className="font-bold" style={{ color: isSelected ? "#fff" : colors.text }}>
                                    {sport.name}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                  );
                })}
              </BottomSheetScrollView>
            </View>

            {/* Formato del torneo (CORREGIDO: View -> Pressable -> View) */}
            <View className="mb-6">
              <Text className="text-[11px] font-bold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Formato de Competición
              </Text>
              <View className="flex-row gap-3">
                {FORMAT_OPTIONS.map((format) => {
                  const isSelected = formData.format === format.id;
                  return (
                    <View key={format.id} className="flex-1 rounded-2xl overflow-hidden">
                        <Pressable
                            onPress={() => setFormData({ ...formData, format: format.id })}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.8 : 1
                            })}
                        >
                            <View
                                className="p-3 items-center border-2 rounded-2xl"
                                style={{
                                    backgroundColor: isSelected ? `${colors.primary}15` : colors.background, // Opacidad manual para asegurar visibilidad
                                    borderColor: isSelected ? colors.primary : "transparent",
                                }}
                            >
                                <Text className="text-2xl mb-1">{format.emoji}</Text>
                                <Text className="text-xs font-bold mb-1" style={{ color: colors.text }}>
                                    {format.label}
                                </Text>
                                <Text className="text-[10px] text-center" style={{ color: colors.textSecondary }}>
                                    {format.description}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="flex-row gap-4 mb-8">
              {/* Ubicación */}
              <View className="flex-[2]">
                <Text className="text-[11px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Sede / Ciudad
                </Text>
                <BottomSheetTextInput
                  placeholder="Ej: Estadio Central"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  className="px-4 py-4 rounded-2xl text-md"
                  style={{ backgroundColor: colors.background, color: colors.text }}
                />
              </View>

              {/* Número de equipos */}
              <View className="flex-1">
                <Text className="text-[11px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Equipos
                </Text>
                <BottomSheetTextInput
                  placeholder="Máx"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.teamsCount}
                  onChangeText={(text) => setFormData({ ...formData, teamsCount: text.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                  className="px-4 py-4 rounded-2xl text-md text-center"
                  style={{ backgroundColor: colors.background, color: colors.text }}
                />
              </View>
            </View>

            {/* Botón de crear */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting} // Deshabilitar mientras carga
              className="py-4 rounded-2xl items-center shadow-sm"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed || isSubmitting ? 0.7 : 1, // Feedback visual
                transform: [{ scale: pressed ? 0.98 : 1 }]
              })}
            >
              {isSubmitting ? (
                 <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                    <Ionicons name="trophy-outline" size={20} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">
                        Confirmar y Crear
                    </Text>
                </View>
              )}
            </Pressable>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);