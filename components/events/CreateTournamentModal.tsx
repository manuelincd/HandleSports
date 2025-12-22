// components/events/CreateTournamentModal.tsx

import { SPORTS } from "@/data/sports";
import { TournamentFormat } from "@/types/Tournament";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type FormData = {
  name: string;
  sportId: string;
  location: string;
  teamsCount: string;
  format: TournamentFormat;
};

type Props = {
  onSubmit: (data: FormData) => void;
};

const FORMAT_OPTIONS = [
  { id: "league" as const, label: "Liga", emoji: "📊", description: "Todos vs Todos" },
  { id: "knockout" as const, label: "Eliminación", emoji: "🏆", description: "Directa" },
  { id: "mixed" as const, label: "Mixto", emoji: "⚡", description: "Grupos + Elim." },
];

export const CreateTournamentModal = forwardRef<BottomSheet, Props>(
  ({ onSubmit }, ref) => {
    const colors = useThemeColors();
    const snapPoints = useMemo(() => ["85%"], []);

    const [formData, setFormData] = useState<FormData>({
      name: "",
      sportId: "",
      location: "",
      teamsCount: "",
      format: "league",
    });

    const handleSubmit = () => {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        sportId: "",
        location: "",
        teamsCount: "",
        format: "league",
      });
    };

    const isFormValid =
      formData.name &&
      formData.sportId &&
      formData.location &&
      formData.teamsCount &&
      formData.format;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                Crear Torneo
              </Text>
              <Pressable onPress={() => (ref as any)?.current?.close()}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            {/* Nombre del torneo */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                NOMBRE DEL TORNEO
              </Text>
              <TextInput
                placeholder="Ej: Copa de Primavera 2025"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                className="px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              />
            </View>

            {/* Selector de deporte */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                DEPORTE
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SPORTS.filter((s) => s.id !== "all").map((sport) => (
                  <Pressable
                    key={sport.id}
                    onPress={() =>
                      setFormData({ ...formData, sportId: sport.id })
                    }
                    className="px-4 py-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        formData.sportId === sport.id
                          ? colors.primary
                          : colors.background,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color:
                          formData.sportId === sport.id ? "#fff" : colors.text,
                      }}
                    >
                      {sport.emoji} {sport.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Formato del torneo */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                FORMATO DEL TORNEO
              </Text>
              <View className="flex-row gap-2">
                {FORMAT_OPTIONS.map((format) => (
                  <Pressable
                    key={format.id}
                    onPress={() =>
                      setFormData({ ...formData, format: format.id })
                    }
                    className="flex-1 py-3 px-2 rounded-xl items-center"
                    style={{
                      backgroundColor:
                        formData.format === format.id
                          ? colors.primary
                          : colors.background,
                    }}
                  >
                    <Text className="text-2xl mb-1">{format.emoji}</Text>
                    <Text
                      className="text-xs font-bold text-center mb-0.5"
                      style={{
                        color:
                          formData.format === format.id ? "#fff" : colors.text,
                      }}
                    >
                      {format.label}
                    </Text>
                    <Text
                      className="text-xs text-center"
                      style={{
                        color:
                          formData.format === format.id
                            ? "rgba(255,255,255,0.8)"
                            : colors.textSecondary,
                      }}
                    >
                      {format.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Ubicación */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                UBICACIÓN
              </Text>
              <TextInput
                placeholder="Ej: Ciudad de México"
                placeholderTextColor={colors.textSecondary}
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                className="px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              />
            </View>

            {/* Número de equipos */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                NÚMERO DE EQUIPOS
              </Text>
              <TextInput
                placeholder="Ej: 8"
                placeholderTextColor={colors.textSecondary}
                value={formData.teamsCount}
                onChangeText={(text) =>
                  setFormData({ ...formData, teamsCount: text })
                }
                keyboardType="number-pad"
                className="px-4 py-3 rounded-xl text-base"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              />
            </View>

            {/* Botón de crear */}
            <Pressable
              onPress={handleSubmit}
              className="py-4 rounded-full items-center"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed || !isFormValid ? 0.5 : 1,
              })}
              disabled={!isFormValid}
            >
              <Text className="text-white font-bold text-base">
                Crear Torneo
              </Text>
            </Pressable>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);