import { Match } from "@/types/Match";
import { Team } from "@/types/Team";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

const placeholder = require("@/assets/images/team-placeholder.png");

type Props = {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  onPress?: () => void;
  showDate?: boolean;
};

const matchDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

export function MatchCard({ 
  match, 
  homeTeam, 
  awayTeam, 
  onPress,
  showDate = true 
}: Props) {
  const colors = useThemeColors();

  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return colors.success || '#22c55e';
      case 'finished':
        return colors.textSecondary;
      case 'scheduled':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
  switch (match.status) {
    case 'live':
      return 'EN VIVO';
    case 'finished':
      return 'FINALIZADO';
    case 'scheduled':
      if (showDate && match.date) {
        const dateObj = typeof match.date === 'string' ? new Date(match.date) : match.date;
        return matchDateFormatter.format(dateObj);
      }
      return 'PROGRAMADO';
    case 'cancelled':
      return 'CANCELADO';
    case 'postponed':
      return 'POSPUESTO';
    default:
      return '';
  }
};

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={({ pressed }: any) => ({
        backgroundColor: colors.surface,
        opacity: onPress && pressed ? 0.7 : 1,
      })}
    >
      {/* Status badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="px-2 py-1 rounded-md"
          style={{ backgroundColor: `${getStatusColor()}20` }}
        >
          <Text
            className="text-xs font-bold"
            style={{ color: getStatusColor() }}
          >
            {getStatusLabel()}
          </Text>
        </View>

        {match.location && (
          <View className="flex-row items-center">
            <Ionicons name="location" size={12} color={colors.textSecondary} />
            <Text
              className="text-xs ml-1"
              style={{ color: colors.textSecondary }}
            >
              {match.location}
            </Text>
          </View>
        )}
      </View>

      {/* Teams and score */}
      <View className="flex-row items-center justify-between">
        {/* Home team */}
        <View className="flex-1 flex-row items-center">
          <Image
            source={homeTeam?.logoUrl ? { uri: homeTeam.logoUrl } : placeholder}
            className="w-10 h-10 rounded-full mr-3"
          />
          <Text
            className="text-base font-semibold flex-1"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {homeTeam?.name || 'TBD'}
          </Text>
        </View>

        {/* Score */}
        <View className="px-4">
          {match.status === 'finished' || match.status === 'live' ? (
            <View className="flex-row items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {match.homeScore ?? 0}
              </Text>
              <Text
                className="text-xl font-bold mx-2"
                style={{ color: colors.textSecondary }}
              >
                -
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {match.awayScore ?? 0}
              </Text>
            </View>
          ) : (
            <Text
              className="text-lg font-bold"
              style={{ color: colors.textSecondary }}
            >
              VS
            </Text>
          )}
        </View>

        {/* Away team */}
        <View className="flex-1 flex-row items-center justify-end">
          <Text
            className="text-base font-semibold flex-1 text-right"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {awayTeam?.name || 'TBD'}
          </Text>
          <Image
            source={awayTeam?.logoUrl ? { uri: awayTeam.logoUrl } : placeholder}
            className="w-10 h-10 rounded-full ml-3"
          />
        </View>
      </View>
    </CardWrapper>
  );
}