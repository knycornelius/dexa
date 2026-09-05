"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/lib/queries";
import type { AppUser, UserRole } from "@/lib/api";

const emptyForm = {
  email: "",
  password: "",
  name: "",
  role: "EMPLOYEE" as UserRole,
  department: "",
  position: "",
};

const emptyEditForm = {
  email: "",
  password: "",
  name: "",
  role: "EMPLOYEE" as UserRole,
  department: "",
  position: "",
};

export default function EmployeesPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [form, setForm] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const { data: users = [], error: listError } = useUsersQuery();
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();

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

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createUser.mutate(form, { onSuccess: () => setForm(emptyForm) });
  }

  function openEdit(target: AppUser) {
    setEditingUser(target);
    setEditForm({
      email: target.email,
      password: "",
      name: target.name,
      role: target.role,
      department: target.department ?? "",
      position: target.position ?? "",
    });
    updateUser.reset();
  }

  function closeEdit() {
    setEditingUser(null);
  }

  function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    const { password, ...rest } = editForm;
    updateUser.mutate(
      {
        id: editingUser.id,
        data: password ? { ...rest, password } : rest,
      },
      { onSuccess: () => closeEdit() },
    );
  }

  const error = listError ?? createUser.error;

  return (
    <div className="flex-1 w-full flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Employees</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/admin/attendance" className="underline">
              Attendance
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

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-2 gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
        >
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
          <input
            required
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
            }
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
          <input
            placeholder="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
          <button
            type="submit"
            disabled={createUser.isPending}
            className="col-span-2 rounded-md bg-brand-600 hover:bg-brand-800 text-white py-2 text-sm disabled:opacity-40"
          >
            {createUser.isPending ? "Adding…" : "Add employee"}
          </button>
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Position</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.department ?? "—"}</td>
                <td>{u.position ?? "—"}</td>
                <td className="space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => openEdit(u)}
                    className="text-brand-400 text-xs underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Remove this employee?"))
                        deleteUser.mutate(u.id);
                    }}
                    className="text-red-600 text-xs underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-lg border border-brand-800 bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit employee</h2>
              <button
                onClick={closeEdit}
                className="text-zinc-500 text-sm underline"
              >
                Close
              </button>
            </div>

            {updateUser.error && (
              <p className="text-sm text-red-600 mb-3">
                {(updateUser.error as Error).message}
              </p>
            )}

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                required
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              />
              <input
                type="password"
                placeholder="New password (leave blank to keep current)"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              />
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
              <input
                placeholder="Department"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              />
              <input
                placeholder="Position"
                value={editForm.position}
                onChange={(e) =>
                  setEditForm({ ...editForm, position: e.target.value })
                }
                className="w-full border rounded px-2 py-1 text-sm border-zinc-300 dark:border-zinc-700 bg-transparent"
              />
              <button
                type="submit"
                disabled={updateUser.isPending}
                className="w-full rounded-md bg-brand-600 hover:bg-brand-800 text-white py-2 text-sm disabled:opacity-40"
              >
                {updateUser.isPending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
