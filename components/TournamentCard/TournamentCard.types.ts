import { Tournament } from "@/types/Tournament";

export type TournamentCardProps = {
    tournament: Tournament;
    onPress?: () => void;
};
