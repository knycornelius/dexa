"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import {
  useAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
} from "@/lib/queries";
import type { AttendanceRecord } from "@/lib/api";
import { formatStatus, formatTimeGmt7, todayWorkDateGmt7 } from "@/lib/format";

function todayRecord(
  records: AttendanceRecord[],
): AttendanceRecord | undefined {
  const today = todayWorkDateGmt7();
  return records.find((r) => r.workDate === today);
}

export default function CheckInPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: records = [], error: listError } = useAttendanceQuery(user?.id);
  const checkIn = useCheckInMutation(user?.id);
  const checkOut = useCheckOutMutation(user?.id);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return <></>;
  }
  const today = todayRecord(records);
  const error = listError ?? checkIn.error ?? checkOut.error;

  function handleCheckIn() {
    if (!photo) {
      return;
    }

    checkIn.mutate(photo, {
      onSuccess: () => {
        setPhoto(null);
      },
    });
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-brand-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <button
            className="text-sm text-zinc-500 underline"
            onClick={() => {
              setUser(null);
              router.push("/");
            }}
          >
            Logout
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">
            {(error as Error).message}
          </p>
        )}

        {!today && (
          <div className="space-y-3">
            <p className="text-sm">You haven&apos;t checked in today.</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="block text-sm"
            />
            <button
              onClick={handleCheckIn}
              disabled={!photo || checkIn.isPending}
              className="w-full rounded-md bg-brand-600 hover:bg-brand-800 text-white py-2 text-sm disabled:opacity-40"
            >
              {checkIn.isPending ? "Checking in…" : "Check in"}
            </button>
          </div>
        )}

        {today && !today.checkOutAt && (
          <div className="space-y-3">
            <p className="text-sm">
              Checked in at {formatTimeGmt7(today.checkInAt)} (GMT+7){" "}
              <span className="font-medium">
                ({formatStatus(today.status)})
              </span>
            </p>
            <button
              onClick={() => checkOut.mutate()}
              disabled={checkOut.isPending}
              className="w-full rounded-md bg-brand-600 hover:bg-brand-800 text-white py-2 text-sm disabled:opacity-40"
            >
              {checkOut.isPending ? "Checking out…" : "Check out"}
            </button>
          </div>
        )}

        {today && today.checkOutAt && (
          <p className="text-sm">
            Done for today ({formatTimeGmt7(today.checkInAt)} to{" "}
            {formatTimeGmt7(today.checkOutAt)}) (GMT+7).
          </p>
        )}

        <h2 className="text-sm font-medium mt-8 mb-2 text-zinc-500">History</h2>
        <ul className="space-y-1 text-sm">
          {records.map((r) => (
            <li
              key={r.id}
              className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 py-1"
            >
              <span>{r.workDate}</span>
              <span>
                {formatTimeGmt7(r.checkInAt)}-
                {r.checkOutAt ? formatTimeGmt7(r.checkOutAt) : "present"}
              </span>
              <span className="text-zinc-500">
                {formatStatus(r.status ?? null)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
