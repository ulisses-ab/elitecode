import type { Resource } from "@/types/Resource";
import { api } from "../api";

export async function fetchResourcesForProblem(problemId: string): Promise<Resource[]> {
  const res = await api.get(`/resources/problems/${problemId}`);
  return res.data.resources;
}
