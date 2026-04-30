import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchUserProfile, updateUsername, type UserProfile } from "../functions/user";
import { queryClient } from "../queryClient";

export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });
}

export function useUpdateUsername() {
  return useMutation<{ user: any }, Error, string>({
    mutationFn: (handle: string) => updateUsername(handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
