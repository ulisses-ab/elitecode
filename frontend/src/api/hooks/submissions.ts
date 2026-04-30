import { useMutation, useQuery } from "@tanstack/react-query";
import {
  postSubmission,
  getAllSubmissionsForProblem,
  getLatestSubmissionForProblem,
  getSubmissionWithResults,
  getSubmissionCode,
  getLeaderboard,
  type LeaderboardData,
} from "../functions/submissions";
import type { Submission } from "@/types/Submission";
import { queryClient } from "../queryClient";
import { useEffect } from "react";
import type { SubmissionWithResults } from "@/types/SubmissionWithResults";

export type PostSubmissionParams = {
  problemId: string;
  setupId: string;
  file: File;
  temporary?: boolean;
};

export function usePostSubmission(problemId: string) {
  return useMutation<Submission, Error, PostSubmissionParams>({
    mutationFn: ({ problemId, setupId, file, temporary }) =>
      postSubmission(problemId, setupId, file, temporary),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", problemId],
      });
    },
  });
}

export function useProblemSubmissions(
  problemId: string | null,
) {
  return useQuery<Submission[], Error>({
    queryKey: ["submissions", problemId],
    queryFn: () => getAllSubmissionsForProblem(problemId!),
    enabled: !!problemId,
  });
}

export function useProblemLatestSubmission(problemId: string | null) {
  const query = useQuery<Submission | null, Error>({
    queryKey: ["submissions", problemId, "latest"],
    queryFn: () => getLatestSubmissionForProblem(problemId!),
    enabled: !!problemId,
    refetchInterval: (query) => {
      return query.state.data?.status === "PENDING" ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (query.data && query.data.status !== "PENDING") {
      queryClient.invalidateQueries({
        queryKey: ["submissions", problemId],
        exact: true
      });
    }
  }, [query.data?.status, problemId, queryClient]);

  return query;
}

export function useSubmissionWithResults(id: string) {
  return useQuery<SubmissionWithResults | null, Error>({
    queryKey: ["submissions", id, "results"],
    queryFn: () => getSubmissionWithResults(id),
  });
}

export function useSubmissionCode() {
  return useMutation<Blob, Error, string>({
    mutationFn: (id: string) => getSubmissionCode(id),
  });
}

export function useLeaderboard(problemId: string | null, setupId: string | null) {
  return useQuery<LeaderboardData, Error>({
    queryKey: ["leaderboard", problemId, setupId],
    queryFn: () => getLeaderboard(problemId!, setupId!),
    enabled: !!problemId && !!setupId,
  });
}