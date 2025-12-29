import { useThemeColors } from '@/theme/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <>
            <Stack.Screen 
                options={{ 
                    headerShown: false 
                }} 
            />

            <View 
                className="flex-1"
                style={{ backgroundColor: colors.background }}
            >
                <View
                    className="px-4 pb-4"
                    style={{
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + 8,
                    }}
                >
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            className="p-2 -ml-2 rounded-full mr-2"
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.6 : 1,
                            })}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </Pressable>
                        <Text
                            className="text-xl font-bold"
                            style={{ color: colors.text }}
                        >
                            Página no encontrada
                        </Text>
                    </View>
                </View>

                <View className="flex-1 items-center justify-center px-8">
                    <View
                        className="items-center p-8 rounded-3xl"
                        style={{ backgroundColor: colors.surface }}
                    >
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center mb-6"
                            style={{ backgroundColor: `${colors.error}20` }}
                        >
                            <Ionicons 
                                name="alert-circle-outline" 
                                size={56} 
                                color={colors.error} 
                            />
                        </View>

                        <Text
                            className="text-2xl font-bold mb-3 text-center"
                            style={{ color: colors.text }}
                        >
                            ¡Oops! Página no encontrada
                        </Text>

                        <Text
                            className="text-base text-center mb-6"
                            style={{ color: colors.textSecondary }}
                        >
                            La página que buscas no existe o fue movida
                        </Text>

                        <Pressable
                            onPress={() => router.replace('/(tabs)')}
                            className="px-8 py-4 rounded-full w-full"
                            style={({ pressed }) => ({
                                backgroundColor: colors.primary,
                                opacity: pressed ? 0.8 : 1,
                            })}
                        >
                            <Text className="text-white font-bold text-center text-base">
                                Volver al inicio
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.back()}
                            className="px-8 py-3 rounded-full mt-3 w-full"
                            style={({ pressed }) => ({
                                backgroundColor: colors.background,
                                opacity: pressed ? 0.8 : 1,
                            })}
                        >
                            <Text 
                                className="font-semibold text-center text-base"
                                style={{ color: colors.text }}
                            >
                                Regresar
                            </Text>
                        </Pressable>
                    </View>

                    <Text
                        className="text-9xl font-bold mt-8 opacity-10"
                        style={{ color: colors.text }}
                    >
                        404
                    </Text>
                </View>
            </View>
        </>
    );
}