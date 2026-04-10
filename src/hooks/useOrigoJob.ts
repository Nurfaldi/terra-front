import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listOrigoJobs,
  getOrigoJobFull,
  uploadOrigoDocuments,
  patchOrigoJob,
  rerunOrigoJob,
  deleteOrigoJob,
} from "../lib/origoApi";
import type { PatchPageRequest } from "../types/origo";
import { useAuth } from "../context/AuthContext";

export function useOrigoJobs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["origo-jobs", user?.username],
    queryFn: () => listOrigoJobs(user?.username),
    refetchInterval: 5000,
  });
}

export function useOrigoJobFull(jobId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["origo-job", jobId],
    queryFn: () => getOrigoJobFull(jobId!, user?.username),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (data.status === "completed" || data.status === "failed") return false;
      return 3000;
    },
  });
}

export function useOrigoUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (files: File[]) => uploadOrigoDocuments(files, user?.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["origo-jobs"] });
    },
  });
}

export function useOrigoPatch(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pages: PatchPageRequest[]) => patchOrigoJob(jobId, pages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["origo-job", jobId] });
    },
  });
}

export function useOrigoRerun(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instructions?: string) => rerunOrigoJob(jobId, instructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["origo-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["origo-jobs"] });
    },
  });
}

export function useOrigoDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteOrigoJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["origo-jobs"] });
    },
  });
}
