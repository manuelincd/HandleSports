import { useThemeColors } from "@/theme/useThemeColors";
import { TournamentFormat } from "@/types/Tournament";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { 
  Alert, 
  Keyboard, 
  Pressable, 
  Text, 
  View, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from "react-native";
import { ScrollView } from "react-native-gesture-handler"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Definimos el tipo para el ref, para mantener compatibilidad
export type CreateTournamentModalRef = {
  open: () => void;
  close: () => void;
};

type FormData = {
  name: string;
  sportId: string;
  location: string;
  teamsCount: string;
  format: TournamentFormat;
  logoUrl?: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
};

type Sport = {
    id: string;
    name: string;
    emoji: string;
};

type Props = {
  onSubmit: (data: FormData) => Promise<void>;
};

const FORMAT_OPTIONS = [
  { id: "league" as const, label: "Liga", emoji: "📊", description: "Todos vs Todos" },
  { id: "knockout" as const, label: "Eliminación", emoji: "🏆", description: "Directa" },
  { id: "mixed" as const, label: "Mixto", emoji: "⚡", description: "Grupos + Elim." },
];

export const CreateTournamentModal = forwardRef<CreateTournamentModalRef, Props>(
  ({ onSubmit }, ref) => {
    const colors = useThemeColors();
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoadingSports, setIsLoadingSports] = useState(true);

    // Estados del formulario
    const [name, setName] = useState("");
    const [sportId, setSportId] = useState("");
    const [location, setLocation] = useState("");
    const [teamsCount, setTeamsCount] = useState("");
    const [format, setFormat] = useState<TournamentFormat>("league");
    const [logoUrl, setLogoUrl] = useState("");
    const [winPoints, setWinPoints] = useState("3");
    const [drawPoints, setDrawPoints] = useState("1");
    const [lossPoints, setLossPoints] = useState("0");

    // Exponemos las funciones open/close al padre mediante la ref
    useImperativeHandle(ref, () => ({
      open: () => setIsVisible(true),
      close: () => setIsVisible(false),
      // Mantenemos compatibilidad por si usabas expand/close del bottom sheet
      expand: () => setIsVisible(true),
      collapse: () => setIsVisible(false),
    }));

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      setIsVisible(false);
    }, []);

    useEffect(() => {
        if (isVisible && sports.length === 0) {
            const fetchSports = async () => {
                try {
                    const q = query(collection(db, "sports"), orderBy("name"));
                    const querySnapshot = await getDocs(q);
                    const sportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sport[];
                    setSports(sportsData);
                } catch (error) {
                    console.error("Error cargando deportes:", error);
                } finally {
                    setIsLoadingSports(false);
                }
            };
            fetchSports();
        }
    }, [isVisible]);

    const handleSubmit = async () => {
      if (!name.trim()) return Alert.alert("Falta información", "Ingresa un nombre.");
      if (!sportId) return Alert.alert("Falta información", "Selecciona un deporte.");
      if (!location.trim()) return Alert.alert("Falta información", "Ingresa la sede.");
      if (!teamsCount || parseInt(teamsCount) < 2) return Alert.alert("Error", "Mínimo 2 equipos.");

      try {
        setIsSubmitting(true);
        await onSubmit({
            name, sportId, location, teamsCount, format,
            logoUrl: logoUrl.trim() || undefined,
            winPoints: parseInt(winPoints) || 3,
            drawPoints: parseInt(drawPoints) || 1,
            lossPoints: parseInt(lossPoints) || 0
        });
        
        setIsSubmitting(false);
        // Reset manual
        setName(""); setSportId(""); setLocation(""); setTeamsCount(""); 
        setFormat("league"); setLogoUrl(""); setWinPoints("3"); setDrawPoints("1"); setLossPoints("0");
        handleClose();
        Alert.alert("¡Éxito!", "Torneo creado correctamente.");
      } catch (error) {
        setIsSubmitting(false);
        Alert.alert("Error", "No se pudo crear el torneo.");
      }
    };

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* FONDO OSCURO (BACKDROP) */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                
                {/* SI TOCAS FUERA, SE CIERRA */}
                <Pressable 
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
                    onPress={handleClose} 
                />

                {/* CARD FLOTANTE */}
                <View 
                    className="w-full max-h-[85%] rounded-3xl overflow-hidden shadow-xl"
                    style={{ backgroundColor: colors.surface }}
                >
                    {/* HEADER DE LA CARD */}
                    <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.border }}>
                        <View>
                            <Text className="text-xl font-bold" style={{ color: colors.text }}>Nuevo Torneo</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Configura las reglas básicas</Text>
                        </View>
                        <Pressable onPress={handleClose} className="p-2 rounded-full" style={{ backgroundColor: colors.background }}>
                            <Ionicons name="close" size={20} color={colors.text} />
                        </Pressable>
                    </View>

                    {/* CONTENIDO CON SCROLL */}
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 20 }}
                    >
                        {/* Nombre */}
                        <View className="mb-5">
                            <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.primary }}>Información General</Text>
                            <TextInput 
                                placeholder="Nombre del Torneo" 
                                placeholderTextColor={colors.textSecondary} 
                                value={name} 
                                onChangeText={setName} 
                                className="px-4 py-3 rounded-xl text-md border" 
                                style={{ backgroundColor: colors.background, color: colors.text, borderColor: name ? colors.primary : colors.border }} 
                            />
                        </View>

                        {/* Selector de Deporte */}
                        <View className="mb-5">
                            <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Deporte</Text>
                            {isLoadingSports ? (
                                <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start' }} />
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {sports.map((sport) => {
                                        const isSelected = sportId === sport.id;
                                        return (
                                            <Pressable key={sport.id} onPress={() => setSportId(sport.id)} className="mr-3">
                                                <View className="px-4 py-2 flex-row items-center border rounded-xl" style={{ backgroundColor: isSelected ? colors.primary : colors.background, borderColor: isSelected ? colors.primary : colors.border }}>
                                                    <Text className="text-lg mr-2">{sport.emoji}</Text>
                                                    <Text className="font-bold text-xs" style={{ color: isSelected ? "#fff" : colors.text }}>{sport.name}</Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            )}
                        </View>

                        {/* Formato */}
                        <View className="mb-5">
                            <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Formato</Text>
                            <View className="flex-row gap-2">
                                {FORMAT_OPTIONS.map((fmt) => {
                                    const isSelected = format === fmt.id;
                                    return (
                                        <Pressable key={fmt.id} onPress={() => setFormat(fmt.id)} className="flex-1">
                                            <View className="p-2 items-center border rounded-xl" style={{ backgroundColor: isSelected ? `${colors.primary}15` : colors.background, borderColor: isSelected ? colors.primary : colors.border }}>
                                                <Text className="text-xl mb-1">{fmt.emoji}</Text>
                                                <Text className="text-[10px] font-bold text-center" style={{ color: colors.text }}>{fmt.label}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Ubicación y Equipos */}
                        <View className="flex-row gap-3 mb-5">
                            <View className="flex-[2]">
                                <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Sede</Text>
                                <TextInput placeholder="Ej: Estadio Central" placeholderTextColor={colors.textSecondary} value={location} onChangeText={setLocation} className="px-4 py-3 rounded-xl text-md border" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Equipos</Text>
                                <TextInput placeholder="Nº" placeholderTextColor={colors.textSecondary} value={teamsCount} onChangeText={setTeamsCount} keyboardType="number-pad" className="px-4 py-3 rounded-xl text-md text-center border" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                            </View>
                        </View>

                        {/* Logo */}
                        <View className="mb-5">
                            <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Logo URL</Text>
                            <TextInput placeholder="https://..." value={logoUrl} onChangeText={setLogoUrl} autoCapitalize="none" className="px-4 py-3 rounded-xl text-md border" style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }} />
                        </View>

                        {/* Puntos */}
                        <View className="mb-2">
                            <Text className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>Puntuación</Text>
                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    <Text className="text-[9px] text-center mb-1 font-bold text-green-600">GANAR</Text>
                                    <TextInput value={winPoints} onChangeText={setWinPoints} keyboardType="number-pad" className="p-2 rounded-lg text-center border font-bold" style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[9px] text-center mb-1 font-bold text-yellow-600">EMPATAR</Text>
                                    <TextInput value={drawPoints} onChangeText={setDrawPoints} keyboardType="number-pad" className="p-2 rounded-lg text-center border font-bold" style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[9px] text-center mb-1 font-bold text-red-600">PERDER</Text>
                                    <TextInput value={lossPoints} onChangeText={setLossPoints} keyboardType="number-pad" className="p-2 rounded-lg text-center border font-bold" style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* FOOTER DEL CARD (Botón Fijo dentro de la tarjeta) */}
                    <View className="p-5 border-t" style={{ borderColor: colors.border }}>
                        <Pressable
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            className="py-3 rounded-xl items-center shadow-sm flex-row justify-center"
                            style={({ pressed }) => ({
                                backgroundColor: colors.primary,
                                opacity: pressed || isSubmitting ? 0.7 : 1,
                            })}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="white" className="mr-2" />
                                    <Text className="text-white font-bold text-base ml-2">Crear Torneo</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);