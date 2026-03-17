import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const useRecentGames = () => {
  return useQuery({
    queryKey: ["recent-games"],
    queryFn: async () => await axios.get("/api/game").then((res) => res.data),
    // Poll every 1s
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    // Avoid UI flicker on polling
    placeholderData: (prev) => prev,
    // Only update cache if response actually changed
    structuralSharing: (oldData, newData) => {
      try {
        return JSON.stringify(oldData) === JSON.stringify(newData) ? oldData : newData;
      } catch {
        return newData;
      }
    },
  });
};