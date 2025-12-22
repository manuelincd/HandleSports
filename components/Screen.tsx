import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { useThemeColors } from "@/theme/useThemeColors";

type Props = {
    children?: ReactNode;
    style?: any;
};

export function Screen({ children, style }: Props) {
    const colors = useThemeColors();

    return (
        <SafeAreaView 
            style={{ flex: 1, backgroundColor: colors.background }} 
            edges={["left", "right"]} 
        >
            <View style={[{ flex: 1 }, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
}