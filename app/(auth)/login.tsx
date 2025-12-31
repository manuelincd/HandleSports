// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useThemeColors } from '@/theme/useThemeColors';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const colors = useThemeColors();
  const router = useRouter();

  // Función auxiliar para traducir errores de Firebase
  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Este usuario ha sido deshabilitado.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'La contraseña es incorrecta.';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
  };

  const handleAuth = async () => {
    // 1. Validación básica
    if (!email || !password) {
        return Alert.alert("Campos incompletos", "Por favor ingresa tu email y contraseña.");
    }
    
    // 2. Cerrar teclado para mejor visualización
    Keyboard.dismiss();
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register(email, password);
        
        // 3a. Éxito en Registro: Feedback claro y limpieza
        setEmail('');
        setPassword('');
        Alert.alert(
            "¡Cuenta creada!", 
            "Bienvenido a la comunidad.",
            [{ 
                text: "Continuar", 
                onPress: () => router.replace("/(tabs)") // Navegación explícita
            }]
        );
      } else {
        await authService.login(email, password);
        
        // 3b. Éxito en Login: Navegación inmediata
        // No mostramos alerta para que sea fluido, solo limpiamos y nos vamos
        setEmail('');
        setPassword('');
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      // 4. Manejo de errores amigable
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      Alert.alert("Error de acceso", friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 p-6 justify-center">
        {/* Botón Cerrar */}
        <Pressable 
            onPress={() => router.back()} 
            className="absolute top-12 left-6 p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
        >
            <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        <Text className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
          {isRegister ? "Crear Cuenta" : "Bienvenido"}
        </Text>
        <Text className="text-lg mb-10" style={{ color: colors.textSecondary }}>
          {isRegister ? "Únete a la comunidad de torneos" : "Inicia sesión para continuar"}
        </Text>

        {/* Inputs */}
        <View className="mb-4">
            <Text className="ml-1 mb-2 font-bold text-xs uppercase" style={{ color: colors.textSecondary }}>Email</Text>
            <TextInput 
                className="p-4 rounded-2xl border"
                style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
        </View>

        <View className="mb-8">
            <Text className="ml-1 mb-2 font-bold text-xs uppercase" style={{ color: colors.textSecondary }}>Contraseña</Text>
            <TextInput 
                className="p-4 rounded-2xl border"
                style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
        </View>

        <Pressable 
            onPress={handleAuth}
            disabled={loading}
            className="py-4 rounded-2xl items-center shadow-lg"
            style={{ backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }}
        >
            <Text className="text-white font-bold text-lg">
                {loading ? "Procesando..." : (isRegister ? "Registrarse" : "Entrar")}
            </Text>
        </Pressable>

        <Pressable 
            onPress={() => setIsRegister(!isRegister)}
            className="mt-6 items-center"
        >
            <Text style={{ color: colors.textSecondary }}>
                {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                    {isRegister ? "Inicia Sesión" : "Regístrate gratis"}
                </Text>
            </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}