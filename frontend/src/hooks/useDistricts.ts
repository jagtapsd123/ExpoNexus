import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export interface District {
  id: number;
  divisionId: number;
  districtName: string;
}

interface ApiResponse<T> {
  data?: T;
}

export function useDistricts() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get<ApiResponse<District[]>>("/districts")
      .then((res) => { if (!cancelled) setDistricts(res.data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { districts, loading };
}
