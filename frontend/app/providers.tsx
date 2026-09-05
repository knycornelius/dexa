"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

const UserProvider = dynamic(
  () => import("@/context/user").then((mod) => mod.UserProvider),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );
}
