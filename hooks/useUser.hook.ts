"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useUser = (walletPublicKey: string) => {
  return useQuery({
    queryKey: ["user", walletPublicKey],
    queryFn: async () => await axios.get(`/api/user?walletPublicKey=${walletPublicKey}`)
    .then((res) => res.data),
  });
};