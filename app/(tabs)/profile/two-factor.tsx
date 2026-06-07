import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColors } from '@/theme/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as OTPAuth from "otpauth";
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from "expo-router";

export default function TwoFactorSetupScreen() {
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 56;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT + insets.top],
    outputRange: [0, -(HEADER_HEIGHT + insets.top)],
    extrapolate: "clamp",
  });

  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState('');
  
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatusAndGenerate = async () => {
        if (!user) return;
        
        try {
            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);
            const userData = snapshot.data();

            if (userData?.isTwoFactorEnabled) {
                setIsEnabled(true);
                setIsEnabled(true);
                setCheckingStatus(false);
            } else {
                generateNewSecret();
                setCheckingStatus(false);
            }
        } catch (error) {
            console.error("Error verificando 2FA", error);
            setCheckingStatus(false);
        }
    };

    checkStatusAndGenerate();
  }, [user]);

  const generateNewSecret = () => {
    if (!user) return;
    const newTotp = new OTPAuth.TOTP({
        issuer: "HandleSports",
        label: user.email || "Usuario",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: new OTPAuth.Secret(),
    });
    setSecret(newTotp.secret.base32);
    setOtpauthUrl(newTotp.toString());
  };

  const handleReconfigure = () => {
    Alert.alert(
        "¿Reconfigurar 2FA?",
        "Esto invalidará tu código anterior. Tendrás que escanear el nuevo QR con tu app.",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sí, reconfigurar", 
                style: "destructive",
                onPress: () => {
                    setIsEnabled(false);
                    generateNewSecret();
                }
            }
        ]
    );
  };

  const verifyAndSave = async () => {
    try {
      if (!secret) return;

      const totp = new OTPAuth.TOTP({
        issuer: "HandleSports",
        label: user?.email || "Usuario",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      const delta = totp.validate({ token, window: 1 });

      if (delta === null) {
        Alert.alert("Error", "El código es incorrecto. Intenta de nuevo.");
        return;
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          twoFactorSecret: secret,
          isTwoFactorEnabled: true
        });

        setIsEnabled(true);
        Alert.alert("¡Éxito!", "Autenticación de dos factores activada.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo activar la 2FA.");
    }
  };

  if (checkingStatus) {
      return (
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  if (isEnabled) {
    return (
      <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View className="bg-green-100 p-6 rounded-full mb-6">
             <Ionicons name="shield-checkmark" size={64} color={colors.success} />
        </View>
        
        <Text className="text-2xl font-bold mt-4" style={{ color: colors.text }}>2FA Activado</Text>
        <Text className="text-center mt-2 mb-8" style={{ color: colors.textSecondary }}>
            Tu cuenta está protegida. Se te solicitará un código cada vez que inicies sesión.
        </Text>

        <Pressable 
            onPress={() => router.back()} 
            className="w-full py-4 rounded-2xl items-center mb-4"
            style={{ backgroundColor: colors.primary }}
        >
            <Text className="text-white font-bold text-lg">Volver a inicio</Text>
        </Pressable>

        <Pressable onPress={handleReconfigure}>
            <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                ¿Cambiaste de celular? Reconfigurar
            </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View
        className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-10 border-b"
        style={{
          backgroundColor: colors.background,
          height: HEADER_HEIGHT + insets.top,
          paddingTop: insets.top,
          transform: [{ translateY: headerTranslateY }],
          borderColor: colors.border
        }}
      >
        <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2 rounded-full">
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Configurar 2FA
            </Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          flexGrow: 1,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 text-base leading-6" style={{ color: colors.textSecondary }}>
          Para mayor seguridad, escanea el código con Google Authenticator e ingresa el token generado.
        </Text>

        <View className="items-center mb-8 p-6 bg-white rounded-3xl self-center shadow-sm">
          {otpauthUrl ? <QRCode value={otpauthUrl} size={180} /> : <ActivityIndicator color={colors.primary} />}
        </View>

        <View className="mb-8">
            <Text className="text-xs font-bold uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
                Código de verificación
            </Text>
            <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="000 000"
            placeholderTextColor={colors.textSecondary + "80"}
            keyboardType="number-pad"
            maxLength={6}
            className="p-4 rounded-2xl text-center text-3xl font-bold border"
            style={{ 
                backgroundColor: colors.surface, 
                color: colors.text, 
                borderColor: colors.primary, 
                letterSpacing: 8 
            }}
            />
        </View>

        <Pressable 
            onPress={verifyAndSave} 
            className="py-4 rounded-2xl items-center shadow-md mb-8" 
            style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg">Activar Seguridad</Text>
        </Pressable>

        <View className="items-center p-4 rounded-2xl bg-gray-50/5 border" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            <Text className="text-xs text-center mb-1" style={{ color: colors.textSecondary }}>
                ¿No puedes escanear el código?
            </Text>
            <Text className="text-xs text-center font-mono select-all" style={{ color: colors.text }}>
                Clave manual: <Text style={{ fontWeight: 'bold' }}>{secret}</Text>
            </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}