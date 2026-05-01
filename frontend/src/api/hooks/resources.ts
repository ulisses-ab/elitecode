import { useQuery } from "@tanstack/react-query";
import { fetchResourcesForProblem } from "../functions/resources";

export function useResources(problemId: string | null | undefined) {
  return useQuery({
    queryKey: ["resources", problemId],
    queryFn: () => fetchResourcesForProblem(problemId!),
    enabled: !!problemId,
  });
}
