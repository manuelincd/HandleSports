import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    scrollY: Animated.Value;
};

export function AppHeader({ scrollY }: Props) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = 56;

    const translateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT + insets.top],
        outputRange: [0, -(HEADER_HEIGHT + insets.top)],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View 
            className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-10"
            style={{
                backgroundColor: colors.background,
                height: HEADER_HEIGHT + insets.top,
                paddingTop: insets.top,
                transform: [{ translateY }],
            }}
        >
            <Ionicons 
                name="notifications-outline" 
                size={30} 
                color="transparent" 
            />

            <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
            >
                HandleSports
            </Text>

            <TouchableOpacity 
                className="p-2 -m-2"
                onPress={() => console.log('Notificaciones')}
            >
                <Ionicons
                    name="notifications-outline"
                    size={30}
                    color={colors.text}
                />
            </TouchableOpacity>
        </Animated.View>
    );
}