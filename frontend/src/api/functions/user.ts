import type { User } from "@/types/User";
import { api } from "../api";

export async function fetchUser(token: string): Promise<User | null> {
  try {
    const response = await api.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  } catch (error: any) {
    console.error("Error fetching user:", error.response?.data || error.message);
    return null;
  }
}

export type UserProfile = {
  user: User;
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    rejectedSubmissions: number;
    solvedEasy: number;
    solvedMedium: number;
    solvedHard: number;
    totalSolved: number;
  };
  recentSubmissions: Array<{
    id: string;
    problemId: string;
    status: string;
    submittedAt: string;
  }>;
};

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get("/users/me/profile");
  return response.data;
}