import createFetchClient from "openapi-fetch";
import type { paths } from "@/lib/api/v1";

export const api = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6001',
});
