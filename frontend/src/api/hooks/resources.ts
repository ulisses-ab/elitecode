import { useQuery } from "@tanstack/react-query";
import { fetchAllResources, fetchResourcesForProblem } from "../functions/resources";

export function useResources(problemId: string | null | undefined) {
  return useQuery({
    queryKey: ["resources", problemId],
    queryFn: () => fetchResourcesForProblem(problemId!),
    enabled: !!problemId,
  });
}

export function useAllResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: fetchAllResources,
  });
}
