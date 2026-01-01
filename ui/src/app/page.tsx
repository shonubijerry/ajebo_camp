import { api } from "@/lib/api/server";
import CampsDisplay from "../components/home/CampsDisplay";

type Camp = {
  id: string;
  title: string;
  theme?: string | null;
  verse?: string | null;
  banner?: string | null;
  fee: number;
  start_date: string;
  end_date: string;
};

export default async function HomePage() {
  const result = await api.GET("/api/v1/camps/list", {
    query: { page: 0, per_page: 100 },
  });

  const camps = result.data?.success ? result.data.data : [];

  if (!camps || camps.length === 0) {
    return <CampsDisplay camps={[]} />;
  }

  return <CampsDisplay camps={camps} />;
}
