// src/ui/OracleModal.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OracleVerdict } from "../state/feedback/types";
import "./OracleModal.css";

type Props = {
  open: boolean;
  verdict: OracleVerdict | null;
  onClose: () => void;
};

function isAllZeroPoints(points?: OracleVerdict["points"]) {
  if (!points) return true;
  return (
    points.clarity === 0 &&
    points.desire === 0 &&
    points.listening === 0 &&
    points.status === 0 &&
    points.ending === 0
  );
}

export default function OracleModal({ open, verdict, onClose }: Props) {
  const navigate = useNavigate();

  const isVisible = open && !!verdict;
  if (!isVisible) return null;

  const points = verdict!.points;

  const computedTotal =
    points ? Object.values(points).reduce((a, b) => a + b, 0) : undefined;

  const total =
    typeof verdict!.score === "number" ? verdict!.score : computedTotal;

  const noScore = isAllZeroPoints(points);

  function handleClose() {
    onClose();
    // ✅ App está bajo /app/*
    navigate("/app/profile");
  }

  // ✅ Cerrar con Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="oracleOverlay"
      role="dialog"
      aria-modal="true"
      onClick={handleClose} // ✅ click fuera cierra y manda a perfil
    >
      <div className="oracleModal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="oracleTop">
          <div className="oracleTitle">{verdict!.title ?? "Veredicto del Oráculo"}</div>

          {/* ✅ Badge: si no hay puntuación, no pongas 0/100 */}
          {noScore ? (
            <div className="oracleBadge oracleBadge--train">
              {verdict!.lang === "en" ? "TRAIN" : "ENTRENO"}
            </div>
          ) : typeof total === "number" ? (
            <div className="oracleBadge">{total}/100</div>
          ) : null}
        </div>

        <div className="oracleBody">
          {/* ✅ Mensaje cuando no hay puntuación */}
          {noScore && (
            <div className="oracleRec">
              {verdict!.lang === "en"
                ? "Training mode: feedback without scoring."
                : "Modo entrenamiento: feedback sin puntuación."}
            </div>
          )}

          {/* DESGLOSE */}
          {points && (
            <div className="oracleBox">
              <div className="oracleBoxTitle">
                {verdict!.lang === "en" ? "Breakdown" : "Puntuación"}
              </div>
              <ul className="oracleList oracleList--grid">
                <li>Claridad: {points.clarity}/20</li>
                <li>Deseo: {points.desire}/20</li>
                <li>Escucha: {points.listening}/20</li>
                <li>Status: {points.status}/20</li>
                <li>Cierre: {points.ending}/20</li>
              </ul>
            </div>
          )}

          {/* RECOMENDACIÓN */}
          {verdict!.recommendation && (
            <div className="oracleRec">{verdict!.recommendation}</div>
          )}

          {/* TIPS */}
          {!!verdict!.tips?.length && (
            <div className="oracleBox">
              <div className="oracleBoxTitle">
                {verdict!.lang === "en" ? "Tips" : "Consejos"}
              </div>
              <ul className="oracleList">
                {verdict!.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* FALLOS */}
          {!!verdict!.mistakes?.length && (
            <div className="oracleBox">
              <div className="oracleBoxTitle">
                {verdict!.lang === "en" ? "Mistakes" : "Fallos"}
              </div>
              <ul className="oracleList">
                {verdict!.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PENALTY */}
          {verdict!.penalty && (
            <div className="oraclePenalty">{verdict!.penalty}</div>
          )}
        </div>

        <div className="oracleActions">
          <button className="oracleCloseBtn" type="button" onClick={handleClose}>
            {verdict!.lang === "en" ? "Close" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
