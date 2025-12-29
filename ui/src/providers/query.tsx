"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import createFetchClient from "openapi-fetch";
import type { paths } from "../lib/api/v1.js";
import createClient from "openapi-react-query";

export default function Providers({ children }: { children: ReactNode }) {
  // useState ensures the client is not recreated on every render
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
