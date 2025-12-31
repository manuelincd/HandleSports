// ManageTeamsScreen.tsx corregido
import { useTeamsStore } from "@/store/useTeams";
import { useTournamentsStore } from "@/store/useTournaments"; 
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState, useEffect } from "react";
import {
    Alert,
    Image,
    Keyboard,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const placeholder = require("@/assets/images/team-placeholder.png");

type TeamFormData = {
    name: string;
    captain: string;
    players: string;
    logoUrl?: string;
};

export default function ManageTeamsScreen() {
    const colors = useThemeColors();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { tournaments, fetchTournaments } = useTournamentsStore();
    const tournament = tournaments.find((t) => t.id === id);

    const { 
        teams: allTeams, 
        addTeam, 
        updateTeam, 
        deleteTeam, 
        fetchTeams, 
        isLoading: isLoadingTeams 
    } = useTeamsStore();

    useEffect(() => {
        if (!tournament) fetchTournaments();
        fetchTeams(); 
    }, [id]);

    const teams = useMemo(() =>
        allTeams.filter(t => t.tournamentId === id),
        [allTeams, id]
    );

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<TeamFormData>({
        name: "",
        captain: "",
        players: "",
        logoUrl: undefined,
    });

    const isTeamLimitReached = teams.length >= (tournament?.teamsCount || 0);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, logoUrl: result.assets[0].uri }));
        }
    };

    const removeImage = useCallback(() => {
        setFormData(prev => ({ ...prev, logoUrl: undefined }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name: "",
            captain: "",
            players: "",
            logoUrl: undefined,
        });
        setEditingTeamId(null);
        setIsSubmitting(false);
    }, []);

    const handleOpenAddModal = useCallback(() => {
        if (isTeamLimitReached) {
            Alert.alert(
                "Límite alcanzado",
                `Este torneo solo permite ${tournament?.teamsCount} equipos.`,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Editar Torneo", onPress: () => router.push(`/tournament/${id}/edit`) },
                ]
            );
            return;
        }
        resetForm();
        setTimeout(() => setShowModal(true), 100);
    }, [isTeamLimitReached, tournament?.teamsCount, id, router, resetForm]);

    const handleOpenEditModal = useCallback((teamId: string) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) {
            setFormData({
                name: team.name,
                captain: team.captain || "",
                players: team.players?.toString() || "",
                logoUrl: team.logoUrl || "",
            });
            setEditingTeamId(teamId);
            setTimeout(() => setShowModal(true), 100);
        }
    }, [teams]);

    const handleCloseModal = useCallback(() => {
        if (isSubmitting) return;
        Keyboard.dismiss();
        setShowModal(false);
        setTimeout(() => resetForm(), 300);
    }, [resetForm, isSubmitting]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "El nombre del equipo es obligatorio");
            return;
        }
        setIsSubmitting(true);
        try {
            const teamData = {
                name: formData.name.trim(),
                captain: formData.captain.trim() || null,
                players: formData.players ? parseInt(formData.players) : 0,
                logoUrl: formData.logoUrl || null,
            };
            if (editingTeamId) {
                await updateTeam(editingTeamId, teamData);
            } else if (id) {
                await addTeam({ ...teamData, tournamentId: id }); 
            }
            handleCloseModal();
        } catch (error) {
            Alert.alert("Error", "Problema al guardar el equipo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback((teamId: string) => {
        const team = teams.find((t) => t.id === teamId);
        Alert.alert(
            "Eliminar equipo",
            `¿Estás seguro de eliminar a ${team?.name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: async () => {
                    try { await deleteTeam(teamId); } catch (e) { Alert.alert("Error", "No se pudo eliminar."); }
                }}
            ]
        );
    }, [teams, deleteTeam]);

    const isFormValid = formData.name.trim().length > 0;

    const sortedTeams = useMemo(() => {
        return [...teams].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));
    }, [teams]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="px-4 pb-4" style={{ backgroundColor: colors.surface, paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full mr-2">
                                <Ionicons name="arrow-back" size={24} color={colors.text} />
                            </Pressable>
                            <View className="flex-1">
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>Gestionar Equipos</Text>
                                {tournament ? <Text className="text-sm" style={{ color: colors.textSecondary }}>{tournament.name}</Text> : null}
                            </View>
                        </View>
                        <View className="px-3 py-2 rounded-full" style={{ backgroundColor: isTeamLimitReached ? `${colors.error}20` : colors.primaryLight }}>
                            <Text className="text-sm font-bold" style={{ color: isTeamLimitReached ? colors.error : colors.primary }}>
                                {teams.length}/{tournament?.teamsCount || 0}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Pressable 
                        onPress={handleOpenAddModal} 
                        className="flex-row items-center justify-center p-4 mb-4 rounded-2xl" 
                        style={{ backgroundColor: isTeamLimitReached ? colors.textSecondary : colors.primary, opacity: isTeamLimitReached ? 0.8 : 1 }} 
                        disabled={isTeamLimitReached || isLoadingTeams}
                    >
                        {isLoadingTeams ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name={isTeamLimitReached ? "lock-closed" : "add-circle"} size={22} color="#fff" />
                                <Text className="text-white font-bold ml-2 text-base">{isTeamLimitReached ? "Límite Alcanzado" : "Agregar Equipo"}</Text>
                            </View>
                        )}
                    </Pressable>

                    {sortedTeams.length > 0 ? (
                        <>
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>
                                {sortedTeams.length} {sortedTeams.length === 1 ? "EQUIPO" : "EQUIPOS"}
                            </Text>
                            {sortedTeams.map((team, index) => (
                                <Pressable 
                                    onPress={() => router.push({ pathname: "/tournament/[id]/team/[teamId]", params: { id, teamId: team.id } })} 
                                    key={team.id} 
                                    className="flex-row items-center p-4 mb-3 rounded-2xl border" 
                                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                >
                                    <View className="w-8 items-center mr-3">
                                        <Text className="text-lg font-bold" style={{ color: colors.text }}>{index + 1}</Text>
                                    </View>
                                    <Image source={team.logoUrl ? { uri: team.logoUrl } : placeholder} className="w-12 h-12 rounded-full mr-3" />
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>{team.name}</Text>
                                        <View className="flex-row items-center">
                                            {team.captain ? (
                                                <View className="flex-row items-center mr-3">
                                                    <Ionicons name="person" size={12} color={colors.textSecondary} />
                                                    <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>{team.captain}</Text>
                                                </View>
                                            ) : null}
                                            {team.players ? (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="people" size={12} color={colors.textSecondary} />
                                                    <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>{team.players} jugadores</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <Pressable onPress={() => handleOpenEditModal(team.id)} className="p-2.5 rounded-lg" style={{ backgroundColor: colors.background }}>
                                            <Ionicons name="pencil" size={18} color={colors.text} />
                                        </Pressable>
                                        <Pressable onPress={() => handleDelete(team.id)} className="p-2.5 rounded-lg" style={{ backgroundColor: `${colors.error}20` }}>
                                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                                        </Pressable>
                                    </View>
                                </Pressable>
                            ))}
                        </>
                    ) : (
                        <View className="items-center justify-center py-16 rounded-2xl border-2 border-dashed" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                            <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.text }}>No hay equipos agregados</Text>
                            <Text className="text-sm text-center px-8" style={{ color: colors.textSecondary }}>Puedes agregar hasta {tournament?.teamsCount || 0} equipos</Text>
                        </View>
                    )}
                </ScrollView>

                <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleCloseModal} statusBarTranslucent>
                    <TouchableWithoutFeedback onPress={handleCloseModal}>
                        <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: colors.overlay }}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View className="w-full max-w-md rounded-2xl" style={{ backgroundColor: colors.surface }}>
                                    <View className="p-6 pb-4">
                                        <View className="flex-row items-center justify-between mb-6">
                                            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{editingTeamId ? "Editar Equipo" : "Agregar Equipo"}</Text>
                                            <Pressable onPress={handleCloseModal} hitSlop={10} disabled={isSubmitting}>
                                                <Ionicons name="close" size={28} color={colors.text} />
                                            </Pressable>
                                        </View>

                                        <View className="items-center mb-6">
                                            <View className="relative"> 
                                                <Pressable onPress={pickImage} disabled={isSubmitting}>
                                                    <View className="w-24 h-24 rounded-full items-center justify-center overflow-hidden border-2 border-dashed" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                                        {formData.logoUrl ? (
                                                            <Image source={{ uri: formData.logoUrl }} className="w-full h-full" resizeMode="cover" />
                                                        ) : (
                                                            <View className="items-center">
                                                                <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                                                <Text className="text-[10px] mt-1 font-medium" style={{ color: colors.textSecondary }}>Logo</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View className="absolute bottom-0 right-0 p-1.5 rounded-full border-2" style={{ backgroundColor: colors.primary, borderColor: colors.surface }}>
                                                        <Ionicons name="pencil" size={12} color="#fff" />
                                                    </View>
                                                </Pressable>

                                                {formData.logoUrl ? (
                                                    <Pressable onPress={removeImage} hitSlop={10} disabled={isSubmitting} className="absolute -top-1 -right-1 p-1.5 rounded-full border-2 items-center justify-center" style={{ backgroundColor: colors.error, borderColor: colors.surface }}>
                                                        <Ionicons name="close" size={14} color="#fff" />
                                                    </Pressable>
                                                ) : null}
                                            </View>
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>NOMBRE DEL EQUIPO *</Text>
                                            <TextInput placeholder="Ej: Real Madrid" placeholderTextColor={colors.textSecondary} value={formData.name} onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))} className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.background, color: colors.text }} autoFocus={!editingTeamId} editable={!isSubmitting} />
                                        </View>
                                        <View className="mb-4">
                                            <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>CAPITÁN (OPCIONAL)</Text>
                                            <TextInput placeholder="Ej: Sergio Ramos" placeholderTextColor={colors.textSecondary} value={formData.captain} onChangeText={(text) => setFormData((prev) => ({ ...prev, captain: text }))} className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.background, color: colors.text }} editable={!isSubmitting} />
                                        </View>
                                        <View className="mb-6">
                                            <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>NÚMERO DE JUGADORES (OPCIONAL)</Text>
                                            <TextInput placeholder="Ej: 25" placeholderTextColor={colors.textSecondary} value={formData.players} onChangeText={(text) => setFormData((prev) => ({ ...prev, players: text.replace(/[^0-9]/g, ''), }))} keyboardType="number-pad" className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.background, color: colors.text }} editable={!isSubmitting} />
                                        </View>

                                        <View className="flex-row gap-3">
                                            <Pressable onPress={handleCloseModal} disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl items-center" style={{ backgroundColor: colors.background }}>
                                                <Text className="font-semibold" style={{ color: colors.text }}>Cancelar</Text>
                                            </Pressable>
                                            <Pressable onPress={handleSubmit} disabled={!isFormValid || isSubmitting} className="flex-1 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary, opacity: (!isFormValid || isSubmitting) ? 0.5 : 1 }}>
                                                {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">{editingTeamId ? "Guardar" : "Agregar"}</Text>}
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </>
    );
}