import {
    Text,
    TouchableOpacity,
    Animated,
    ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    translateY: Animated.AnimatedInterpolation<string | number>;
};

export function AppHeader({ translateY }: Props) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const containerStyle: ViewStyle = {
        position: "absolute",
        top: insets.top,            
        left: 0,
        right: 0,
        height: 56,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.background,
        zIndex: 10,
        transform: [{ translateY }],
    };

    return (
        <Animated.View style={containerStyle}>
            <Text style={{ width: 24 }} />

            <Text
                style={{
                    color: colors.text,
                    fontSize: 24,
                    fontWeight: "bold",
                }}
            >
                HandleSports
            </Text>

            <TouchableOpacity>
                <Ionicons
                    name="notifications-outline"
                    size={30}
                    color={colors.text}
                />
            </TouchableOpacity>
        </Animated.View>
    );
}
