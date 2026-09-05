const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UserRole = "EMPLOYEE" | "ADMIN";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  position?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  workDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInPhotoPath: string | null;
  status: AttendenceStatus | null;
};

export type AttendenceStatus = "ON_TIME" | "LATE";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  listUsers: () =>
    request<AppUser[]>("/users", {
      method: "GET",
    }),
  getUser: (id: string) =>
    request<AppUser>(`/users/${id}`, {
      method: "GET",
    }),
  createUser: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    department?: string;
    position?: string;
  }) =>
    request<AppUser>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (
    id: string,
    data: Partial<{
      email: string;
      password: string;
      name: string;
      role: UserRole;
      department: string;
      position: string;
    }>,
  ) =>
    request<AppUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<void>(`/users/${id}`, {
      method: "DELETE",
    }),
  checkIn: (userId: string, photo: File) => {
    const form = new FormData();
    form.append("userId", userId);
    form.append("photo", photo);
    return request<AttendanceRecord>("/attendance/check-in", {
      method: "POST",
      body: form,
    });
  },
  checkOut: (userId: string) =>
    request<AttendanceRecord>("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  listAttendance: (userId?: string) =>
    request<AttendanceRecord[]>(
      `/attendance${userId ? `?userId=${userId}` : ""}`,
      {
        method: "GET",
      },
    ),
  getPhotoUrl: (id: string) =>
    request<{ url: string }>(`/attendance/${id}/photo-url`, {
      method: "GET",
    }),
  login: (data: { email: string; password: string }) =>
    request<{
      accessToken: string;
      user: Pick<AppUser, "id" | "email" | "name" | "role">;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
