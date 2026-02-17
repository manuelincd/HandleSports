import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/theme/useThemeColors';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  const colors = useThemeColors();
  const router = useRouter();

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email': return 'El correo electrónico no es válido.';
      case 'auth/user-disabled': return 'Este usuario ha sido deshabilitado.';
      case 'auth/user-not-found': return 'No existe una cuenta con este correo.';
      case 'auth/wrong-password': case 'auth/invalid-credential': return 'Credenciales incorrectas.';
      case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
      case 'auth/weak-password': return 'La contraseña es muy débil (mínimo 6 caracteres).';
      default: return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
        return Alert.alert("Faltan datos", "Por favor ingresa email y contraseña.");
    }

    if (isRegister && !name.trim()) {
        return Alert.alert("Falta el nombre", "Por favor dinos cómo te llamas para tu perfil.");
    }
    
    Keyboard.dismiss();
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register(email, password, name); 
        
        Alert.alert(
            "¡Bienvenido!", 
            "Tu cuenta ha sido creada exitosamente.",
            [{ text: "Comenzar", onPress: () => router.replace("/(tabs)") }]
        );
      } else {
        await authService.login(email, password);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      Alert.alert("Atención", friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
      if (!email) return Alert.alert("Email requerido", "Ingresa tu correo para enviarte las instrucciones.");
      try {
          Alert.alert("Enviado", "Revisa tu correo para restablecer tu contraseña.");
      } catch (e) {
          Alert.alert("Error", "No se pudo enviar el correo.");
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
            className="absolute top-12 left-6 p-2 rounded-full z-10"
            style={{ backgroundColor: colors.surface }}
        >
            <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: colors.primary + '20' }}>
                <Ionicons name={isRegister ? "person-add" : "log-in"} size={32} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
                {isRegister ? "Crear Cuenta" : "¡Hola de nuevo!"}
            </Text>
            <Text className="text-base mt-2 text-center" style={{ color: colors.textSecondary }}>
                {isRegister ? "Gestiona tus torneos como un profesional" : "Ingresa para continuar gestionando tus eventos"}
            </Text>
        </View>

                {isRegister && (
            <View className="mb-4">
                <Text className="ml-1 mb-2 font-bold text-xs uppercase" style={{ color: colors.textSecondary }}>Nombre de usuario</Text>
                <TextInput 
                    className="p-4 rounded-2xl border font-medium"
                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                    placeholder="Ej. Juan123"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
            </View>
        )}

        <View className="mb-4">
            <Text className="ml-1 mb-2 font-bold text-xs uppercase" style={{ color: colors.textSecondary }}>Email</Text>
            <TextInput 
                className="p-4 rounded-2xl border font-medium"
                style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                placeholder="nombre@ejemplo.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
        </View>

        <View className="mb-2">
            <Text className="ml-1 mb-2 font-bold text-xs uppercase" style={{ color: colors.textSecondary }}>Contraseña</Text>
            <View className="relative">
                <TextInput 
                    className="p-4 rounded-2xl border font-medium pr-12"
                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                </Pressable>
            </View>
        </View>

        {!isRegister && (
            <Pressable onPress={handleForgotPassword} className="self-end mb-6 py-2">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
        )}

        <View className={isRegister ? "mt-6" : "mt-2"}>
            <Pressable 
                onPress={handleAuth}
                disabled={loading}
                className="py-4 rounded-2xl items-center shadow-md flex-row justify-center"
                style={{ backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">
                        {isRegister ? "Registrarme" : "Iniciar Sesión"}
                    </Text>
                )}
            </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center items-center">
            <Text style={{ color: colors.textSecondary }}>
                {isRegister ? "¿Ya tienes cuenta? " : "¿Nuevo usuario? "}
            </Text>
            <Pressable onPress={() => {
                setIsRegister(!isRegister);
                setName('');
            }}>
                <Text className="font-bold py-2" style={{ color: colors.primary }}>
                    {isRegister ? "Ingresa aquí" : "Crea una cuenta"}
                </Text>
            </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}