import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { Match, Scorer } from "@/types/Match";
import { Team } from "@/types/Team";
import { usePlayersStore } from "@/store/usePlayers";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  match: Match | null;
  homeTeam?: Team;
  awayTeam?: Team;
  sportId?: string;
  scoreUnit?: string;
  onClose: () => void;
  onSave: (homeScore: number, awayScore: number, scorers: Scorer[]) => void;
};

const getSportActions = (sportId: string = 'default') => {
    switch (sportId) {
        case 'soccer':
        case 'futsal':
        case 'handball':
            return { showGoals: true, showCards: true };
        case 'basketball':
        case 'volleyball':
        case 'tennis':
        case 'baseball':
        case 'padel':
            return { showGoals: true, showCards: false };
        default:
            return { showGoals: true, showCards: false };
    }
};

export function UpdateScoreModal({ 
  visible, 
  match, 
  homeTeam, 
  awayTeam, 
  sportId = 'soccer', 
  scoreUnit = "Goles", 
  onClose, 
  onSave 
}: Props) {
  const colors = useThemeColors();
  const config = useMemo(() => getSportActions(sportId), [sportId]);
  
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [showScorers, setShowScorers] = useState(false);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const { players, fetchPlayers } = usePlayersStore();
  
  const homePlayers = useMemo(() => players.filter(p => p.teamId === homeTeam?.id), [players, homeTeam]);
  const awayPlayers = useMemo(() => players.filter(p => p.teamId === awayTeam?.id), [players, awayTeam]);

  useEffect(() => {
    if (visible && match) {
        setHomeScore(String(match.homeScore ?? 0));
        setAwayScore(String(match.awayScore ?? 0));
        if (match.stats && match.stats.length > 0) {
            setScorers(match.stats);
        } else {
            setScorers([]);
        }
        
        setExpandedPlayerId(null);
        if (players.length === 0) fetchPlayers();
    }
  }, [match, visible]);

  const updateStat = (playerId: string, teamId: string, playerName: string, field: keyof Scorer, delta: number) => {
      setScorers(prev => {
          const existingIndex = prev.findIndex(s => s.playerId === playerId);
          if (existingIndex >= 0) {
              const updated = [...prev];
              const currentVal = (updated[existingIndex][field] as number) || 0;
              const newVal = Math.max(0, currentVal + delta);
              updated[existingIndex] = { ...updated[existingIndex], [field]: newVal };
              return updated;
          } else {
              if (delta > 0) {
                  return [...prev, { 
                      playerId, teamId, playerName, 
                      goals: field === 'goals' ? 1 : 0,
                      yellowCards: field === 'yellowCards' ? 1 : 0,
                      redCards: field === 'redCards' ? 1 : 0
                  }];
              }
              return prev;
          }
      });
  };

  const handleSave = () => {
    const h = parseInt(homeScore) || 0;
    const a = parseInt(awayScore) || 0;
    
    if (scorers.length > 0) {
        const homePlayerPoints = scorers
            .filter(s => s.teamId === homeTeam?.id)
            .reduce((acc, curr) => acc + (curr.goals || 0), 0);

        const awayPlayerPoints = scorers
            .filter(s => s.teamId === awayTeam?.id)
            .reduce((acc, curr) => acc + (curr.goals || 0), 0);

        if ((homePlayerPoints !== h && homePlayerPoints > 0) || (awayPlayerPoints !== a && awayPlayerPoints > 0)) {
             Alert.alert("Atención", `La suma de ${scoreUnit.toLowerCase()} no coincide con el marcador. ¿Guardar igual?`, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Guardar", onPress: () => { onSave(h, a, scorers); onClose(); }}
                ]);
            return;
        }
    }
    onSave(h, a, scorers);
    onClose();
  };

  const StatControl = ({ label, value, color, onPressAdd, onPressRemove }: any) => (
      <View className="items-center mx-3"> 
          <Text className="text-[10px] font-bold mb-2 uppercase tracking-wide opacity-70" style={{ color: colors.textSecondary }}>
            {label}
          </Text>
          
          <View 
            className="flex-row items-center rounded-xl p-1 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
              <Pressable 
                onPress={onPressRemove} 
                className="w-10 h-10 items-center justify-center rounded-lg active:opacity-50"
                style={{ backgroundColor: colors.background }}
              >
                  <Ionicons name="remove" size={20} color={colors.text} />
              </Pressable>

              <View className="min-w-[40px] items-center">
                  <Text className="text-xl font-bold" style={{ color: value > 0 ? color : colors.textSecondary }}>
                      {value}
                  </Text>
              </View>

              <Pressable 
                onPress={onPressAdd} 
                className="w-10 h-10 items-center justify-center rounded-lg active:opacity-50"
                style={{ backgroundColor: color }}
              >
                  <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
          </View>
      </View>
  );

  const PlayerItem = ({ player, teamColor }: { player: any, teamColor: string }) => {
      const stats = scorers.find(s => s.playerId === player.id) || { goals: 0, yellowCards: 0, redCards: 0 };
      const isExpanded = expandedPlayerId === player.id;
      const hasStats = stats.goals > 0 || stats.yellowCards > 0 || stats.redCards > 0;

      return (
          <View 
            className="mb-3 rounded-2xl overflow-hidden border shadow-sm" 
            style={{ 
                borderColor: isExpanded ? teamColor : colors.border, 
                backgroundColor: colors.surface, 
            }}
          >
              <Pressable 
                onPress={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                className="flex-row items-center justify-between p-4"
                style={{ backgroundColor: hasStats ? teamColor + "15" : "transparent" }}
              >
                  <View className="flex-row items-center flex-1">
                      <View className="w-7 h-7 rounded-full items-center justify-center mr-3 bg-gray-100/10 border border-gray-200/20">
                        <Text className="font-bold text-xs" style={{ color: colors.textSecondary }}>
                            {player.number || "#"}
                        </Text>
                      </View>
                      <Text className="font-semibold text-base flex-1" style={{ color: colors.text }}>
                          {player.name}
                      </Text>
                  </View>

                  {!isExpanded && hasStats && (
                      <View className="flex-row gap-2 mr-2">
                          {stats.goals > 0 && (
                              <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-md">
                                  <Ionicons name="football" size={12} color={colors.text} />
                                  <Text className="text-xs ml-1 font-bold" style={{ color: colors.text }}>
                                      {stats.goals}
                                  </Text>
                              </View>
                          )}
                          {stats.yellowCards > 0 && <View className="w-3 h-4 bg-yellow-400 rounded-sm" />}
                          {stats.redCards > 0 && <View className="w-3 h-4 bg-red-500 rounded-sm" />}
                      </View>
                  )}
                  
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
              </Pressable>

              {isExpanded && (
                  <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="border-t"
                    style={{ 
                        backgroundColor: colors.background, 
                        borderColor: colors.border 
                    }}
                    contentContainerStyle={{
                        paddingVertical: 16,
                        paddingHorizontal: 8,
                        minWidth: '100%',
                        justifyContent: 'center'
                    }}
                  >
                      <View className="flex-row items-center"> 
                          {config.showGoals && (
                              <StatControl 
                                  label={scoreUnit} 
                                  value={stats.goals} 
                                  color={teamColor}
                                  onPressAdd={() => updateStat(player.id, player.teamId, player.name, 'goals', 1)}
                                  onPressRemove={() => updateStat(player.id, player.teamId, player.name, 'goals', -1)}
                              />
                          )}

                          {config.showCards && (
                              <>
                                  <View className="w-[1px] h-12 bg-gray-500/20 mx-2" />
                                  <StatControl 
                                      label="Amarilla" 
                                      value={stats.yellowCards} 
                                      color="#EAB308"
                                      onPressAdd={() => updateStat(player.id, player.teamId, player.name, 'yellowCards', 1)}
                                      onPressRemove={() => updateStat(player.id, player.teamId, player.name, 'yellowCards', -1)}
                                  />
                                  <StatControl 
                                      label="Roja" 
                                      value={stats.redCards} 
                                      color="#EF4444"
                                      onPressAdd={() => updateStat(player.id, player.teamId, player.name, 'redCards', 1)}
                                      onPressRemove={() => updateStat(player.id, player.teamId, player.name, 'redCards', -1)}
                                  />
                              </>
                          )}
                      </View>
                  </ScrollView>
              )}
          </View>
      );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center items-center bg-black/80">
        <View className="w-[90%] h-[85%] rounded-[32px] overflow-hidden flex" style={{ backgroundColor: colors.surface }}>
            
            <View className="p-6 pb-2 border-b" style={{ borderColor: colors.border }}>
                <Text className="text-center text-xl font-bold mb-4" style={{ color: colors.text }}>Actualizar Resultado</Text>
                <View className="flex-row items-center justify-around mb-2">
                    <View className="items-center flex-1">
                        <Text className="text-xs mb-2 font-bold uppercase opacity-60" style={{ color: colors.text }}>{homeTeam?.name}</Text>
                        <TextInput
                            value={homeScore} onChangeText={setHomeScore} keyboardType="number-pad"
                            className="w-16 h-16 text-center text-3xl font-bold rounded-2xl border-2"
                            style={{ color: colors.text, borderColor: colors.primary, backgroundColor: colors.background }}
                        />
                    </View>
                    <Text className="text-2xl font-bold opacity-50" style={{ color: colors.text }}>:</Text>
                    <View className="items-center flex-1">
                        <Text className="text-xs mb-2 font-bold uppercase opacity-60" style={{ color: colors.text }}>{awayTeam?.name}</Text>
                        <TextInput
                            value={awayScore} onChangeText={setAwayScore} keyboardType="number-pad"
                            className="w-16 h-16 text-center text-3xl font-bold rounded-2xl border-2"
                            style={{ color: colors.text, borderColor: colors.primary, backgroundColor: colors.background }}
                        />
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                 <Pressable onPress={() => setShowScorers(!showScorers)} className="flex-row items-center justify-between py-2 mb-2">
                    <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                       {showScorers ? "Ocultar Jugadores" : `Asignar ${scoreUnit} y Tarjetas`}
                    </Text>
                    <Ionicons name={showScorers ? "chevron-up" : "chevron-down"} size={20} color={colors.primary} />
                </Pressable>

                {showScorers && (
                    <View className="pb-10">
                        <Text className="text-xs font-bold mb-3 mt-1 uppercase tracking-widest opacity-50" style={{ color: colors.text }}>Local</Text>
                        {homePlayers.map(p => <PlayerItem key={p.id} player={p} teamColor={colors.primary} />)}

                        <Text className="text-xs font-bold mb-3 mt-6 uppercase tracking-widest opacity-50" style={{ color: colors.text }}>Visitante</Text>
                        {awayPlayers.map(p => <PlayerItem key={p.id} player={p} teamColor={colors.error} />)}
                    </View>
                )}
            </ScrollView>

            <View className="p-5 border-t" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                <View className="flex-row gap-4">
                    <Pressable onPress={onClose} className="flex-1 py-4 rounded-2xl border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <Text className="text-center font-bold" style={{ color: colors.text }}>Cancelar</Text>
                    </Pressable>
                    <Pressable onPress={handleSave} className="flex-1 py-4 rounded-2xl shadow-sm" style={{ backgroundColor: colors.primary }}>
                        <Text className="text-center font-bold text-white">Guardar</Text>
                    </Pressable>
                </View>
            </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}