import { useState, useCallback } from "react";

export type UseRefreshKeyProps = {
  refreshKey: number;
  refresh: () => void;
};

export const useRefreshKey = (): UseRefreshKeyProps => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { refreshKey, refresh };
};
