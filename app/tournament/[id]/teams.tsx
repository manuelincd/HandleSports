import { TOURNAMENTS } from "@/data/tournaments";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const placeholder = require("@/assets/images/team-placeholder.png");

type TeamFormData = {
    name: string;
    captain: string;
    players: string;
};

export default function ManageTeamsScreen() {
    const colors = useThemeColors();
    const { id } = useLocalSearchParams<{ id: string }>();
    const tournament = TOURNAMENTS.find((t) => t.id === id);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { addTeam, updateTeam, deleteTeam } = useTeamsStore();
    const allTeams = useTeamsStore((state) => state.teams);
    const teams = useMemo(() =>
        allTeams.filter(t => t.tournamentId === id),
        [allTeams, id]
    );

    const [showModal, setShowModal] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TeamFormData>({
        name: "",
        captain: "",
        players: "",
    });

    const isTeamLimitReached = teams.length >= (tournament?.teamsCount || 0);
    const remainingSlots = (tournament?.teamsCount || 0) - teams.length;

    const resetForm = useCallback(() => {
        setFormData({
            name: "",
            captain: "",
            players: "",
        });
        setEditingTeamId(null);
    }, []);

    const handleOpenAddModal = useCallback(() => {
        if (isTeamLimitReached) {
            Alert.alert(
                "Límite alcanzado",
                `Este torneo solo permite ${tournament?.teamsCount} equipos.\n\nPara agregar más equipos, ve a "Editar Información" y aumenta el número de equipos permitidos.`,
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                    },
                    {
                        text: "Editar Torneo",
                        onPress: () => router.push(`/tournament/${id}/edit`),
                    },
                ]
            );
            return;
        }

        resetForm();
        // Delay pequeño para evitar conflictos
        setTimeout(() => {
            setShowModal(true);
        }, 100);
    }, [isTeamLimitReached, tournament?.teamsCount, id, router, resetForm]);

    const handleOpenEditModal = useCallback((teamId: string) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) {
            setFormData({
                name: team.name,
                captain: team.captain || "",
                players: team.players?.toString() || "",
            });
            setEditingTeamId(teamId);

            // Delay pequeño para evitar conflictos
            setTimeout(() => {
                setShowModal(true);
            }, 100);
        }
    }, [teams]);

    const handleCloseModal = useCallback(() => {
        Keyboard.dismiss();
        setShowModal(false);

        // Limpiar después de cerrar
        setTimeout(() => {
            resetForm();
        }, 300);
    }, [resetForm]);

    const handleSubmit = useCallback(() => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "El nombre del equipo es obligatorio");
            return;
        }

        if (editingTeamId) {
            updateTeam(editingTeamId, {
                name: formData.name.trim(),
                captain: formData.captain.trim() || undefined,
                players: formData.players ? parseInt(formData.players) : undefined,
            });
        } else {
            if (id) {
                addTeam({
                    name: formData.name.trim(),
                    tournamentId: id,
                    captain: formData.captain.trim() || undefined,
                    players: formData.players ? parseInt(formData.players) : undefined,
                });
            }
        }

        handleCloseModal();
    }, [formData, editingTeamId, id, addTeam, updateTeam, handleCloseModal]);

    const handleDelete = useCallback((teamId: string) => {
        const team = teams.find((t) => t.id === teamId);

        setTimeout(() => {
            Alert.alert(
                "Eliminar equipo",
                `¿Estás seguro de eliminar a ${team?.name}?`,
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                    },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () => deleteTeam(teamId),
                    },
                ]
            );
        }, 100);
    }, [teams, deleteTeam]);

    const isFormValid = formData.name.trim().length > 0;

    const sortedTeams = useMemo(() => {
        return [...teams].sort((a, b) =>
            (b.stats?.points || 0) - (a.stats?.points || 0)
        );
    }, [teams]);

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View
                className="flex-1"
                style={{ backgroundColor: colors.background }}
            >
                {/* Header - igual que antes */}
                <View
                    className="px-4 pb-4"
                    style={{
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + 8,
                    }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <Pressable
                                onPress={() => router.back()}
                                className="p-2 -ml-2 rounded-full mr-2"
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.6 : 1,
                                })}
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.text} />
                            </Pressable>
                            <View className="flex-1">
                                <Text
                                    className="text-xl font-bold"
                                    style={{ color: colors.text }}
                                >
                                    Gestionar Equipos
                                </Text>
                                {tournament && (
                                    <Text
                                        className="text-sm"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {tournament.name}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Contador de equipos */}
                        <View
                            className="px-3 py-2 rounded-full"
                            style={{
                                backgroundColor: isTeamLimitReached
                                    ? `${colors.error}20`
                                    : colors.primaryLight
                            }}
                        >
                            <Text
                                className="text-sm font-bold"
                                style={{
                                    color: isTeamLimitReached
                                        ? colors.error
                                        : colors.primary
                                }}
                            >
                                {teams.length}/{tournament?.teamsCount}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: insets.bottom + 16,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Botón para agregar equipo */}
                    <Pressable
                        onPress={handleOpenAddModal}
                        className="flex-row items-center justify-center p-4 mb-4 rounded-2xl"
                        style={({ pressed }) => ({
                            backgroundColor: isTeamLimitReached
                                ? colors.textSecondary
                                : colors.primary,
                            opacity: pressed ? 0.8 : 1,
                        })}
                        disabled={isTeamLimitReached}
                    >
                        <Ionicons
                            name={isTeamLimitReached ? "lock-closed" : "add-circle"}
                            size={22}
                            color="#fff"
                        />
                        <Text className="text-white font-bold ml-2 text-base">
                            {isTeamLimitReached ? "Límite Alcanzado" : "Agregar Equipo"}
                        </Text>
                    </Pressable>

                    {/* Lista de equipos */}
                    {sortedTeams.length > 0 ? (
                        <>
                            <Text
                                className="text-sm font-semibold mb-3"
                                style={{ color: colors.textSecondary }}
                            >
                                {sortedTeams.length} {sortedTeams.length === 1 ? "EQUIPO" : "EQUIPOS"}
                            </Text>

                            {sortedTeams.map((team, index) => (
                                <View
                                    key={team.id}
                                    className="flex-row items-center p-4 mb-3 rounded-2xl"
                                    style={{ backgroundColor: colors.surface }}
                                >
                                    {/* Posición */}
                                    <View className="w-8 items-center mr-3">
                                        <Text
                                            className="text-lg font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {index + 1}
                                        </Text>
                                    </View>

                                    {/* Logo */}
                                    <Image
                                        source={team.logoUrl ? { uri: team.logoUrl } : placeholder}
                                        className="w-12 h-12 rounded-full mr-3"
                                    />

                                    {/* Info del equipo */}
                                    <View className="flex-1">
                                        <Text
                                            className="text-base font-semibold mb-1"
                                            style={{ color: colors.text }}
                                        >
                                            {team.name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            {team.captain && (
                                                <>
                                                    <Ionicons
                                                        name="person"
                                                        size={12}
                                                        color={colors.textSecondary}
                                                    />
                                                    <Text
                                                        className="text-xs ml-1 mr-3"
                                                        style={{ color: colors.textSecondary }}
                                                    >
                                                        {team.captain}
                                                    </Text>
                                                </>
                                            )}
                                            {team.players && (
                                                <>
                                                    <Ionicons
                                                        name="people"
                                                        size={12}
                                                        color={colors.textSecondary}
                                                    />
                                                    <Text
                                                        className="text-xs ml-1"
                                                        style={{ color: colors.textSecondary }}
                                                    >
                                                        {team.players} jugadores
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2">
                                        <Pressable
                                            onPress={() => handleOpenEditModal(team.id)}
                                            className="p-2.5 rounded-lg"
                                            style={({ pressed }) => ({
                                                backgroundColor: colors.background,
                                                opacity: pressed ? 0.6 : 1,
                                            })}
                                        >
                                            <Ionicons name="pencil" size={18} color={colors.text} />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(team.id)}
                                            className="p-2.5 rounded-lg"
                                            style={({ pressed }) => ({
                                                backgroundColor: `${colors.error}20`,
                                                opacity: pressed ? 0.6 : 1,
                                            })}
                                        >
                                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <View
                            className="items-center justify-center py-16 rounded-2xl"
                            style={{ backgroundColor: colors.surface }}
                        >
                            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                            <Text
                                className="text-lg font-semibold mt-4 mb-2"
                                style={{ color: colors.text }}
                            >
                                No hay equipos agregados
                            </Text>
                            <Text
                                className="text-sm text-center px-8"
                                style={{ color: colors.textSecondary }}
                            >
                                Puedes agregar hasta {tournament?.teamsCount} equipos
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Modal mejorado */}
                <Modal
                    visible={showModal}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCloseModal}
                    statusBarTranslucent
                >
                    <TouchableWithoutFeedback onPress={handleCloseModal}>
                        <View
                            className="flex-1 justify-center items-center px-4"
                            style={{ backgroundColor: colors.overlay }}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View
                                    className="w-full max-w-md rounded-2xl"
                                    style={{ backgroundColor: colors.surface }}
                                >
                                    {/* Header del modal */}
                                    <View className="p-6 pb-4">
                                        <View className="flex-row items-center justify-between mb-4">
                                            <Text
                                                className="text-2xl font-bold"
                                                style={{ color: colors.text }}
                                            >
                                                {editingTeamId ? "Editar Equipo" : "Agregar Equipo"}
                                            </Text>
                                            <Pressable
                                                onPress={handleCloseModal}
                                                className="p-1"
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons name="close" size={28} color={colors.text} />
                                            </Pressable>
                                        </View>

                                        {/* Nombre del equipo */}
                                        <View className="mb-4">
                                            <Text
                                                className="text-sm font-semibold mb-2"
                                                style={{ color: colors.textSecondary }}
                                            >
                                                NOMBRE DEL EQUIPO *
                                            </Text>
                                            <TextInput
                                                placeholder="Ej: Real Madrid"
                                                placeholderTextColor={colors.textSecondary}
                                                value={formData.name}
                                                onChangeText={(text) =>
                                                    setFormData((prev) => ({ ...prev, name: text }))
                                                }
                                                className="px-4 py-3 rounded-xl text-medium"
                                                style={{
                                                    backgroundColor: colors.background,
                                                    color: colors.text,
                                                }}
                                                autoFocus={!editingTeamId}
                                            />
                                        </View>

                                        {/* Capitán */}
                                        <View className="mb-4">
                                            <Text
                                                className="text-sm font-semibold mb-2"
                                                style={{ color: colors.textSecondary }}
                                            >
                                                CAPITÁN (OPCIONAL)
                                            </Text>
                                            <TextInput
                                                placeholder="Ej: Sergio Ramos"
                                                placeholderTextColor={colors.textSecondary}
                                                value={formData.captain}
                                                onChangeText={(text) =>
                                                    setFormData((prev) => ({ ...prev, captain: text }))
                                                }
                                                className="px-4 py-3 rounded-xl text-medium"
                                                style={{
                                                    backgroundColor: colors.background,
                                                    color: colors.text,
                                                }}
                                            />
                                        </View>

                                        {/* Número de jugadores */}
                                        <View className="mb-6">
                                            <Text
                                                className="text-sm font-semibold mb-2"
                                                style={{ color: colors.textSecondary }}
                                            >
                                                NÚMERO DE JUGADORES (OPCIONAL)
                                            </Text>
                                            <TextInput
                                                placeholder="Ej: 25"
                                                placeholderTextColor={colors.textSecondary}
                                                value={formData.players}
                                                onChangeText={(text) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        players: text.replace(/[^0-9]/g, '')
                                                    }))
                                                }
                                                keyboardType="number-pad"
                                                className="px-4 py-3 rounded-xl text-medium"
                                                style={{
                                                    backgroundColor: colors.background,
                                                    color: colors.text,
                                                }}
                                            />
                                        </View>

                                        {/* Botones */}
                                        <View className="flex-row gap-3">
                                            <Pressable
                                                onPress={handleCloseModal}
                                                className="flex-1 py-3.5 rounded-xl items-center"
                                                style={({ pressed }) => ({
                                                    backgroundColor: colors.background,
                                                    opacity: pressed ? 0.6 : 1,
                                                })}
                                            >
                                                <Text
                                                    className="font-semibold text-medium"
                                                    style={{ color: colors.text }}
                                                >
                                                    Cancelar
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={handleSubmit}
                                                className="flex-1 py-3.5 rounded-xl items-center"
                                                style={({ pressed }) => ({
                                                    backgroundColor: colors.primary,
                                                    opacity: pressed || !isFormValid ? 0.5 : 1,
                                                })}
                                                disabled={!isFormValid}
                                            >
                                                <Text className="text-white font-bold text-medium">
                                                    {editingTeamId ? "Guardar" : "Agregar"}
                                                </Text>
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