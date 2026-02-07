// src/state/feedback/FeedbackProvider.tsx
import React, { createContext, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "./toastStore";
import { useOracleStore } from "./oracleStore";

import ToastHost from "../../components/toast/ToastHost";
import OracleModal from "../../ui/OracleModal";

type FeedbackApi = ReturnType<typeof useToastStore> & {
  oracle: ReturnType<typeof useOracleStore>;
};

const Ctx = createContext<FeedbackApi | null>(null);

export function FeedbackProvider(props: { children: React.ReactNode }) {
  const toast = useToastStore();
  const oracle = useOracleStore();
  const navigate = useNavigate();

  const api: FeedbackApi = { ...toast, oracle };

  // ✅ Al cerrar: cierra modal y ve a Profile
  const onCloseOracle = useCallback(() => {
    oracle.close();
    navigate("/profile");
  }, [oracle, navigate]);

  return (
    <Ctx.Provider value={api}>
      {props.children}

      {/* UI global */}
      <ToastHost items={toast.items} onDismiss={toast.dismiss} />
      <OracleModal open={oracle.isOpen} verdict={oracle.last} onClose={onCloseOracle} />
    </Ctx.Provider>
  );
}

/** Solo toasts (ergonomía) */
export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <FeedbackProvider/>");

  const { oracle, ...toast } = ctx;
  return toast;
}

/** Solo oráculo (ergonomía) */
export function useOracleFeedback() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOracleFeedback must be used inside <FeedbackProvider/>");
  return ctx.oracle;
}
