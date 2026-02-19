import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import * as OTPAuth from "otpauth";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColors } from '@/theme/useThemeColors';

export default function Verify2FAScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { secret } = useLocalSearchParams<{ secret: string }>();
  const [code, setCode] = useState("");

  const handleVerify = () => {
     if (!secret) return;
     const totp = new OTPAuth.TOTP({
        issuer: "HandleSports",
        label: "Usuario",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
     });

     const delta = totp.validate({ token: code, window: 1 });
     
     if (delta !== null) {
        router.replace("/(tabs)");
     } else {
        Alert.alert("Error", "Código inválido o expirado");
     }
  }

  return (
    <View className="flex-1 p-6 justify-center" style={{ backgroundColor: colors.background }}>
       <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>Verificación de Seguridad</Text>
       <Text className="mb-8 text-center" style={{ color: colors.textSecondary }}>Ingresa el código de tu autenticador</Text>

       <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        className="p-4 rounded-xl text-center text-3xl font-bold border mb-6"
        style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.primary, letterSpacing: 5 }}
      />

      <Pressable onPress={handleVerify} className="py-4 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-white font-bold text-lg">Entrar</Text>
      </Pressable>
    </View>
  );
}