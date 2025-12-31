import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { TeamSelect } from "@/components/ui/TeamSelect";
import { useTeamsStore } from "@/store/useTeams";
import { useThemeColors } from "@/theme/useThemeColors";
import { Match, MatchStage } from "@/types/Match";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

// 1. CAMBIO IMPORTANTE: Manejamos Date Objects en el estado local
type MatchFormState = {
    homeTeamId: string;
    awayTeamId: string;
    date: Date;
    time: Date;
    matchday: string;
    location: string;
};

// Esta es la estructura que espera el componente padre al guardar
type MatchSubmitData = {
    homeTeamId: string;
    awayTeamId: string;
    date: string;
    time: string;
    matchday: string;
    location: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: MatchSubmitData) => void;
    initialData?: Match | null;
    tournamentId: string;
    stage?: MatchStage;
};

const STAGE_LABELS: Record<MatchStage, string> = {
    'group': 'Fase de Grupos',
    'round_of_16': 'Octavos de Final',
    'quarterfinals': 'Cuartos de Final',
    'semifinals': 'Semifinales',
    'final': 'Final',
    '3rd_place': 'Tercer Lugar'
};

// Helper robusto para inicializar
const parseDateSafe = (dateInput: any): Date => {
    if (!dateInput) return new Date();
    if (dateInput.seconds) return new Date(dateInput.seconds * 1000);

    if (typeof dateInput === 'string') {
        const normalized = dateInput.includes('T') ? dateInput : dateInput.replace(/-/g, '/');
        const d = new Date(normalized);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? new Date() : d;
};

export function MatchFormModal({ visible, onClose, onSubmit, initialData, tournamentId, stage }: Props) {
    const colors = useThemeColors();
    const allTeams = useTeamsStore((state) => state.teams);

    const teams = useMemo(() =>
        allTeams.filter((t) => t.tournamentId === tournamentId),
        [allTeams, tournamentId]
    );

    // 2. Estado inicial con Objetos Date
    const [formData, setFormData] = useState<MatchFormState>({
        homeTeamId: "",
        awayTeamId: "",
        date: new Date(),
        time: new Date(),
        matchday: "1",
        location: "",
    });

    useEffect(() => {
        if (visible) {
            if (initialData) {
                // Al abrir para editar, convertimos UNA SOLA VEZ
                const safeDate = parseDateSafe(initialData.date);
                setFormData({
                    homeTeamId: initialData.homeTeamId,
                    awayTeamId: initialData.awayTeamId,
                    date: safeDate, // Guardamos el objeto directo
                    time: safeDate, // Guardamos el objeto directo
                    matchday: initialData.matchday?.toString() || "1",
                    location: initialData.location || "",
                });
            } else {
                // Reset para nuevo
                setFormData({
                    homeTeamId: "",
                    awayTeamId: "",
                    date: new Date(),
                    time: new Date(),
                    matchday: "1",
                    location: "",
                });
            }
        }
    }, [visible, initialData]);

    const handleSubmit = () => {
        // 3. CONVERSIÓN FINAL: Aquí transformamos a string para el padre
        // Extraemos manualmente para evitar cambios de zona horaria
        const y = formData.date.getFullYear();
        const m = String(formData.date.getMonth() + 1).padStart(2, '0');
        const d = String(formData.date.getDate()).padStart(2, '0');
        const dateString = `${y}-${m}-${d}`;

        const timeString = formData.time.toTimeString().substring(0, 5);

        onSubmit({
            ...formData,
            date: dateString,
            time: timeString
        });
        onClose();
    };

    const isFormValid = formData.homeTeamId !== "" && formData.awayTeamId !== "";

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="p-6 flex-row justify-between items-center border-b" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-xl font-bold" style={{ color: colors.text }}>
                        {initialData ? "Editar Partido" : stage ? `Nuevo Cruce - ${STAGE_LABELS[stage]}` : "Nuevo Partido"}
                    </Text>
                    <Pressable onPress={onClose} className="p-2 bg-gray-500 rounded-full">
                        <Ionicons name="close" size={24} color={colors.text} />
                    </Pressable>
                </View>

                <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                    <Text className="font-bold mb-4 uppercase tracking-wider text-xs" style={{ color: colors.textSecondary }}>
                        Enfrentamiento
                    </Text>

                    <View className="flex-row gap-4 mb-2">
                        <View className="flex-1">
                            <TeamSelect
                                label="Local"
                                value={formData.homeTeamId}
                                teams={teams}
                                onSelect={(id) => {
                                    if (id === formData.awayTeamId) setFormData({ ...formData, awayTeamId: "" });
                                    setFormData({ ...formData, homeTeamId: id });
                                }}
                            />
                        </View>

                        <View className="justify-center pt-4">
                            <Text className="font-bold text-xl" style={{ color: colors.textSecondary }}>VS</Text>
                        </View>

                        <View className="flex-1">
                            <TeamSelect
                                label="Visitante"
                                value={formData.awayTeamId}
                                teams={teams.filter(t => t.id !== formData.homeTeamId)}
                                onSelect={(id) => setFormData({ ...formData, awayTeamId: id })}
                                disabled={!formData.homeTeamId}
                                placeholder={!formData.homeTeamId ? "Elige Local..." : "Seleccionar..."}
                            />
                        </View>
                    </View>

                    {/* SECCIÓN DE FECHA Y HORA */}
                    <Text className="font-bold mt-4 mb-4 uppercase tracking-wider text-xs" style={{ color: colors.textSecondary }}>
                        Horario
                    </Text>
                    <View className="flex-row gap-4 mb-6">

                        {/* 4. PICKER ESTABLE: Pasamos el objeto Date directo */}
                        <DateTimeInput
                            label="Fecha"
                            value={formData.date}
                            mode="date"
                            onChange={(newDate) => {
                                // Actualizamos el estado con el objeto Date directamente
                                // Sin conversiones intermedias a string
                                setFormData(prev => ({ ...prev, date: newDate }));
                            }}
                        />

                        {/* PICKER DE HORA */}
                        <DateTimeInput
                            label="Hora"
                            value={formData.time}
                            mode="time"
                            onChange={(newTime) => {
                                setFormData(prev => ({ ...prev, time: newTime }));
                            }}
                        />

                    </View>

                    <View className="flex-row gap-4 mb-8">
                        {!stage && (
                            <View className="flex-1">
                                <Text className="text-xs font-bold mb-1 ml-1" style={{ color: colors.textSecondary }}>Jornada</Text>
                                <TextInput
                                    value={formData.matchday}
                                    keyboardType="number-pad"
                                    onChangeText={(t) => setFormData({ ...formData, matchday: t })}
                                    className="p-4 border rounded-xl font-medium text-center"
                                    style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }}
                                />
                            </View>
                        )}
                        <View className={stage ? "flex-1" : "flex-[2]"}>
                            <Text className="text-xs font-bold mb-1 ml-1" style={{ color: colors.textSecondary }}>Ubicación</Text>
                            <TextInput
                                value={formData.location}
                                onChangeText={(t) => setFormData({ ...formData, location: t })}
                                className="p-4 border rounded-xl font-medium"
                                style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }}
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleSubmit}
                        disabled={!isFormValid}
                        className="p-4 rounded-2xl mb-20 items-center mt-4 shadow-sm"
                        style={{
                            backgroundColor: isFormValid ? colors.primary : colors.border,
                            opacity: isFormValid ? 1 : 0.5,
                        }}
                    >
                        <Text className="text-white font-bold text-lg">
                            {initialData ? "Guardar Cambios" : "Programar Partido"}
                        </Text>
                    </Pressable>

                </ScrollView>
            </View>
        </Modal>
    );
}