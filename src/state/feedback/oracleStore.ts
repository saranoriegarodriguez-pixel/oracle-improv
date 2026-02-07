// src/state/feedback/oracleStore.ts
import { useCallback, useMemo, useState } from "react";
import type { OracleVerdict } from "./types";

export type { OracleVerdict };

export function useOracleStore() {
  const [isOpen, setIsOpen] = useState(false);
  const [last, setLast] = useState<OracleVerdict | null>(null);

  const open = useCallback((v: Omit<OracleVerdict, "ts"> & { ts?: number }) => {
    const verdict: OracleVerdict = { ts: v.ts ?? Date.now(), ...v };
    setLast(verdict);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return useMemo(
    () => ({
      isOpen,
      last,
      open,
      close,
      verdict: open, // alias opcional
    }),
    [isOpen, last, open, close]
  );
}
