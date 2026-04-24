import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, type UserProfile } from "../functions/user";

export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });
}
