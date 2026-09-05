"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppUser } from "../lib/api";

type UserContextProps = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);
const STORAGE_KEY = "dexa.user";

function readUserData(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AppUser) : null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(() => readUserData());

  function setUser(next: AppUser | null) {
    setUserState(next);
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
