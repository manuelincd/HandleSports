import { View, Text, Image } from "react-native";
import { useColorScheme } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
};

export function AppHeaderTitle({ title }: Props) {
  const scheme = useColorScheme() ?? "light";
  const theme = colors[scheme];

  const logo =
    scheme === "light"
      ? require("@/assets/images/logo-light.png")
      : require("@/assets/images/logo-dark.png");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Image
        source={logo}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: theme.text,
          fontSize: 17,
          fontWeight: "600",
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
