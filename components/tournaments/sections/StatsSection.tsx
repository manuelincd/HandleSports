import { usePlayersStore } from "@/store/usePlayers";
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, useEffect } from "react";
import { Image, ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";

const playerPlaceholder = require("@/assets/images/team-placeholder.png");

type Props = {
  tournamentId: string;
};

// Definimos qué estadísticas existen en la DB
type StatKey = 'goals' | 'yellowCards' | 'redCards';

// Configuración visual de cada estadística
type StatConfig = {
  key: StatKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

// FUNCIÓN MAESTRA: Define qué pestañas mostrar según el deporte
const getSportStatsConfig = (sportId: string, colors: any): StatConfig[] => {
  const baseGoalConfig = { key: 'goals' as StatKey, color: colors.primary };

  switch (sportId) {
    case 'soccer':
    case 'futsal':
      return [
        { ...baseGoalConfig, label: 'Goles', icon: 'football' },
        { key: 'yellowCards', label: 'Amarillas', icon: 'square', color: '#EAB308' },
        { key: 'redCards', label: 'Rojas', icon: 'square', color: '#EF4444' },
      ];
    
    case 'basketball':
      return [
        { ...baseGoalConfig, label: 'Puntos', icon: 'basketball' }
      ];
    
    case 'volleyball':
    case 'tennis':
    case 'padel':
      return [
        { ...baseGoalConfig, label: 'Sets/Puntos', icon: 'tennisball' } 
      ];

    case 'baseball':
        return [
          { ...baseGoalConfig, label: 'Carreras', icon: 'baseball' } 
        ];
    
    case 'handball':
      return [
        { ...baseGoalConfig, label: 'Goles', icon: 'football' },
        { key: 'redCards', label: 'Rojas', icon: 'square', color: '#EF4444' },   
      ];
    
    default:
      return [
        { ...baseGoalConfig, label: 'Anotaciones', icon: 'trophy' }
      ];
  }
};

export function StatsSection({ tournamentId }: Props) {
  const colors = useThemeColors();
  
  // 1. OBTENER DATOS
  const { players, isLoading: loadingPlayers, fetchPlayers } = usePlayersStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { tournaments } = useTournamentsStore();

  // 2. EFECTO DE CARGA AL MONTAR
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [tournamentId]);

  // Buscamos el torneo para saber su deporte
  const tournament = tournaments.find(t => t.id === tournamentId);
  const sportId = tournament?.sportId || 'default';

  // 3. CONFIGURACIÓN DINÁMICA
  const tabsConfig = useMemo(() => getSportStatsConfig(sportId, colors), [sportId, colors]);

  // Estado de la pestaña activa (Por defecto la primera de la lista)
  const [activeTabKey, setActiveTabKey] = useState<StatKey>('goals');

  // Aseguramos que si cambia el deporte, se resetee la tab
  useEffect(() => {
    if (tabsConfig.length > 0) {
        setActiveTabKey(tabsConfig[0].key);
    }
  }, [sportId, tabsConfig]);

  // 4. PROCESAMIENTO DE JUGADORES
  const sortedPlayers = useMemo(() => {
    if (!tournament) return [];

    // A. Filtramos equipos del torneo
    const tournamentTeamIds = teams
        .filter(t => t.tournamentId === tournamentId)
        .map(t => t.id);

    // B. Filtramos jugadores de esos equipos
    const relevantPlayers = players.filter(p => tournamentTeamIds.includes(p.teamId));

    // C. Filtramos y Ordenamos según la TAB ACTIVA
    return relevantPlayers
        .filter(p => {
            // Solo mostrar jugadores que tengan > 0 en la estadística actual
            const value = p[activeTabKey] || 0;
            return value > 0;
        })
        .sort((a, b) => {
            // Orden descendente
            const valA = a[activeTabKey] || 0;
            const valB = b[activeTabKey] || 0;
            return valB - valA;
        })
        .slice(0, 50); // Top 50

  }, [players, teams, tournamentId, activeTabKey]);

  const getTeamLogo = (teamId: string) => teams.find(t => t.id === teamId)?.logoUrl || null;
  
  const activeConfig = tabsConfig.find(t => t.key === activeTabKey) || tabsConfig[0];

  // Renderizado de carga inicial
  if (loadingPlayers && players.length === 0) {
      return (
        <View className="py-10 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
  }

  return (
    <View className="flex-1 pb-8">
      
      {/* --- SELECTOR DE PESTAÑAS (Solo si hay >1 tipo de estadística) --- */}
      {tabsConfig.length > 1 && (
        <View className="flex-row justify-center mb-6 gap-2">
            {tabsConfig.map((tab) => (
                <Pressable
                    key={tab.key}
                    onPress={() => setActiveTabKey(tab.key)}
                    className="px-4 py-2 rounded-full flex-row items-center border"
                    style={{ 
                        backgroundColor: activeTabKey === tab.key ? tab.color : colors.surface,
                        borderColor: activeTabKey === tab.key ? 'transparent' : colors.border
                    }}
                >
                    <Ionicons 
                        name={tab.icon} 
                        size={16} 
                        color={activeTabKey === tab.key ? '#fff' : colors.textSecondary} 
                    />
                    <Text 
                        className="ml-2 font-semibold"
                        style={{ color: activeTabKey === tab.key ? '#fff' : colors.textSecondary }}
                    >
                        {tab.label}
                    </Text>
                </Pressable>
            ))}
        </View>
      )}

      {/* --- TÍTULO SIMPLE (Si solo hay 1 tipo, ej: Basket) --- */}
      {tabsConfig.length === 1 && (
          <View className="mb-4 px-4">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>
                  Tabla de {activeConfig.label}
              </Text>
          </View>
      )}

      {/* --- LISTA DE JUGADORES --- */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {sortedPlayers.length > 0 ? (
            sortedPlayers.map((player, index) => {
                const teamLogo = getTeamLogo(player.teamId);
                const isTop3 = index < 3;
                const statValue = player[activeTabKey] || 0;

                return (
                    <View 
                        key={player.id}
                        className="flex-row items-center py-3 px-4 mb-3 rounded-2xl border shadow-sm"
                        style={{ 
                            backgroundColor: colors.surface,
                            borderColor: isTop3 ? activeConfig.color + '40' : colors.border
                        }}
                    >
                        {/* Ranking */}
                        <Text 
                            className={`font-bold text-lg w-8 text-center ${isTop3 ? 'scale-110' : ''}`}
                            style={{ color: isTop3 ? activeConfig.color : colors.textSecondary }}
                        >
                            {index + 1}
                        </Text>

                        {/* Foto/Avatar */}
                        <View className="relative mx-3">
                             <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-100">
                                <Ionicons name="person" size={20} color={colors.textSecondary} />
                             </View>
                             {teamLogo && (
                                 <Image 
                                    source={{ uri: teamLogo }} 
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white bg-white"
                                 />
                             )}
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                            <Text className="font-bold text-base" style={{ color: colors.text }}>
                                {player.name}
                            </Text>
                        </View>

                        {/* Valor */}
                        <View className="items-end">
                            <Text className="text-2xl font-black" style={{ color: colors.text }}>
                                {statValue}
                            </Text>
                            <Text className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: colors.text }}>
                                {activeConfig.label}
                            </Text>
                        </View>
                    </View>
                );
            })
        ) : (
            <View className="items-center py-12 opacity-50">
                <Ionicons name="stats-chart-outline" size={48} color={colors.textSecondary} />
                <Text className="mt-4 font-medium" style={{ color: colors.textSecondary }}>
                    Aún no hay registros de {activeConfig.label.toLowerCase()}
                </Text>
                <Text className="text-xs mt-1 max-w-[200px] text-center" style={{ color: colors.textSecondary }}>
                    Registra los resultados en las jornadas para ver la tabla.
                </Text>
            </View>
        )}
      </ScrollView>
    </View>
  );
}