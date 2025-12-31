import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  value: Date;
  mode: "date" | "time";
  onChange: (date: Date) => void;
};

export function DateTimeInput({ label, value, mode, onChange }: Props) {
  const colors = useThemeColors();
  const [show, setShow] = useState(false);

  // Manejador del cambio
  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // En Android, hay que cerrar el modal manualmente
    if (Platform.OS === "android") {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Formato para mostrar el texto
  const formattedValue = mode === "date" 
    ? value.toLocaleDateString() 
    : value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View className="mb-4 flex-1">
      <Text className="text-xs font-bold mb-1 ml-1" style={{ color: colors.textSecondary }}>
        {label}
      </Text>

      {/* COMPORTAMIENTO PARA ANDROID */}
      {Platform.OS === "android" && (
        <>
          <Pressable
            onPress={() => setShow(true)}
            className="p-3 border rounded-xl flex-row justify-between items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>{formattedValue}</Text>
            <Ionicons 
              name={mode === "date" ? "calendar-outline" : "time-outline"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </Pressable>

          {show && (
            <DateTimePicker
              value={value}
              mode={mode}
              display="default"
              onChange={handleChange}
            />
          )}
        </>
      )}

      {/* COMPORTAMIENTO PARA IOS */}
      {Platform.OS === "ios" && (
        <View 
            className="p-2 border rounded-xl flex-row justify-start items-center"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
            <DateTimePicker
              value={value}
              mode={mode}
              display="compact" // Se ve como un botón nativo pequeño
              onChange={handleChange}
              style={{ alignSelf: 'flex-start' }}
              // A veces se necesita themeVariant para forzar modo oscuro/claro
            />
        </View>
      )}
    </View>
  );
}