"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type UserRole } from "./api";

export const userKeys = {
  all: ["users"] as const,
};

export const attendanceKeys = {
  all: ["attendance"] as const,
  list: (userId?: string) => ["attendance", userId ?? "all"] as const,
};

export function useUsersQuery() {
  return useQuery({ queryKey: userKeys.all, queryFn: api.listUsers });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      department?: string;
      position?: string;
    }) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        email: string;
        password: string;
        name: string;
        role: UserRole;
        department: string;
        position: string;
      }>;
    }) => api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useAttendanceQuery(userId?: string) {
  return useQuery({
    queryKey: attendanceKeys.list(userId),
    queryFn: () => api.listAttendance(userId),
  });
}

export function useCheckInMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photo: File) => {
      if (!userId) throw new Error("No user selected");
      return api.checkIn(userId, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useCheckOutMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("No user selected");
      return api.checkOut(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useViewPhotoMutation() {
  return useMutation({
    mutationFn: (recordId: string) => api.getPhotoUrl(recordId),
    onSuccess: ({ url }) => {
      window.open(url, "_blank");
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => api.login(data),
  });
}
