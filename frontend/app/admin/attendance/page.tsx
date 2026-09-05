"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import {
  useAttendanceQuery,
  useUsersQuery,
  useViewPhotoMutation,
} from "@/lib/queries";
import { formatStatus, formatTimeGmt7 } from "@/lib/format";

export default function AttendanceMonitoringPage() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const { data: records = [], error: recordsError } = useAttendanceQuery();
  const { data: userList = [], error: usersError } = useUsersQuery();
  const viewPhoto = useViewPhotoMutation();

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/check-in");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const usersById = Object.fromEntries(userList.map((u) => [u.id, u]));
  const error = recordsError ?? usersError;

  return (
    <div className="flex-1 w-full flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Attendance</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/admin/employees" className="underline">
              Employees
            </a>
            <button
              className="text-zinc-500 underline"
              onClick={() => {
                setUser(null);
                router.push("/");
              }}
            >
              Logout
            </button>
          </nav>
        </div>

        {error && (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2">Date</th>
              <th>Employee</th>
              <th>Check-in (GMT+7)</th>
              <th>Check-out (GMT+7)</th>
              <th>Status</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="py-2">{r.workDate}</td>
                <td>{usersById[r.userId]?.name ?? r.userId}</td>
                <td>{formatTimeGmt7(r.checkInAt)}</td>
                <td>{formatTimeGmt7(r.checkOutAt)}</td>
                <td>{formatStatus(r.status ?? null)}</td>
                <td>
                  {r.checkInPhotoPath && (
                    <button
                      onClick={() => viewPhoto.mutate(r.id)}
                      disabled={viewPhoto.isPending}
                      className="underline text-xs disabled:opacity-40"
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
