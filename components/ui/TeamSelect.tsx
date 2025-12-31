import React, { useState } from "react";
import { View, Text, Pressable, Modal, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme/useThemeColors";
import { Team } from "@/types/Team";

type Props = {
  label: string;
  value: string;
  teams: Team[];
  onSelect: (teamId: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function TeamSelect({ label, value, teams, onSelect, placeholder = "Seleccionar...", disabled = false }: Props) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  // Encontrar el objeto del equipo seleccionado para mostrar su nombre
  const selectedTeam = teams.find((t) => t.id === value);

  const handleSelect = (id: string) => {
    onSelect(id);
    setModalVisible(false);
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-bold mb-1 ml-1" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      
      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        className="flex-row items-center justify-between p-3 border rounded-xl"
        style={{
          backgroundColor: disabled ? colors.background : colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1
        }}
      >
        <Text 
          className="font-medium"
          style={{ color: selectedTeam ? colors.text : colors.textSecondary }}
        >
          {selectedTeam ? selectedTeam.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {/* MODAL DE SELECCIÓN */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/50" 
          onPress={() => setModalVisible(false)}
        >
          <View 
            className="h-[50%] rounded-t-[32px] p-6" 
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Seleccionar {label}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={teams}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = item.id === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.id)}
                    className="p-4 mb-2 rounded-xl flex-row items-center justify-between"
                    style={{
                      backgroundColor: isSelected ? colors.primary + "15" : colors.background,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : "transparent"
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Si tienes escudos, aquí iría la imagen */}
                      <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center">
                        <Text className="text-xs">🛡️</Text>
                      </View>
                      <Text className="font-semibold text-md" style={{ color: colors.text }}>
                        {item.name}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}