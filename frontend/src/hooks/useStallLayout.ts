import { useEffect, useState, useCallback } from "react";
import {
  getLayout,
  getAllLayouts,
  subscribeLayouts,
  upsertLayout,
  deleteLayout,
  ExhibitionLayout,
} from "@/data/stallLayouts";

/** Reactive accessor for a single exhibition's layout. */
export function useStallLayout(exhibitionId: string | undefined) {
  const [layout, setLayout] = useState<ExhibitionLayout | undefined>(() =>
    exhibitionId ? getLayout(exhibitionId) : undefined,
  );

  useEffect(() => {
    setLayout(exhibitionId ? getLayout(exhibitionId) : undefined);
    const unsub = subscribeLayouts(() => {
      setLayout(exhibitionId ? getLayout(exhibitionId) : undefined);
    });
    return () => {
      unsub();
    };
  }, [exhibitionId]);

  const save = useCallback((next: ExhibitionLayout) => upsertLayout(next), []);
  const remove = useCallback(() => {
    if (exhibitionId) deleteLayout(exhibitionId);
  }, [exhibitionId]);

  return { layout, save, remove };
}

/** Reactive accessor for all layouts (used by admin overview/dashboard). */
export function useAllStallLayouts() {
  const [layouts, setLayouts] = useState(() => getAllLayouts());
  useEffect(() => {
    const unsub = subscribeLayouts(() => setLayouts(getAllLayouts()));
    return () => {
      unsub();
    };
  }, []);
  return layouts;
}
