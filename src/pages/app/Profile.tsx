// src/pages/Profile.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./Profile.css";

import { useAppSettings } from "../../state/appSettings";

import { loadUsername, loadPoints, pointsToPercent } from "../../state/profileStore";
import { loadSummaries } from "../../state/profileSummaries";

import { PLAYER_LEVELS } from "../../../shared/data/characters";
import type { PlayerLevel, SkillKey } from "../../../shared/types";

import jsPDF from "jspdf";

// ✅ auth (Google) como “owner real”
import { useAuthStore } from "../../state/authStore";

type Lang = "es" | "en";

type BudgetResponse = {
  username: string;
  monthKey: string;
  usdSpent: number;
  eurSpent: number;
  eurBudget: number;
  eurCutoff: number;
  remainingToCutoffEur: number;
  overCutoff: boolean;
};

const SKILLS: SkillKey[] = ["clarity", "desire", "listening", "status", "ending"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function recommendLevel(avgPct: number): PlayerLevel {
  if (avgPct < 25) return "apprentice";
  if (avgPct < 50) return "performer";
  if (avgPct < 75) return "tragicHero";
  return "presentChorus";
}

function formatDate(ts: number, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return String(ts);
  }
}

// ✅ Budget fetch con cookie sid
async function fetchBudget(ownerUsername: string): Promise<BudgetResponse> {
  const res = await fetch(`/api/budget/${encodeURIComponent(ownerUsername)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "budget fetch failed"));
  return (await res.json()) as BudgetResponse;
}

export default function Profile() {
  const { st } = useAppSettings() as any;

  const lang: Lang = (st.lang ?? "es") as Lang;
  const master = Boolean(st.master);

  const aiProvider = (st.aiProvider ?? "ollama") as "ollama" | "openai";
  const isOpenAI = aiProvider === "openai";

  // ✅ auth store
  const auth = useAuthStore();
  const authedEmail =
    auth.status === "authed" && auth.user?.email
      ? String(auth.user.email).trim().toLowerCase()
      : "";

  // ✅ Nickname visible (editable en Settings)
  const nickname = loadUsername() || (lang === "es" ? "Sin nombre" : "Unnamed");

  // ✅ Owner real para límites/presupuesto/usage
  const ownerUsername = authedEmail || nickname;

  const selectedLevel = (st.level ?? "apprentice") as PlayerLevel;

  const t = useMemo(() => {
    const es = lang === "es";
    return {
      title: es ? "Perfil" : "Profile",
      subtitle: es ? "Tu progreso local y el estado del Oráculo." : "Your local progress and the Oracle status.",

      recommended: es ? "Nivel recomendado" : "Recommended level",
      selected: es ? "Seleccionado" : "Selected",

      skillsTitle: es ? "Habilidades" : "Skills",

      oracleTipsTitle: es ? "Consejos del Oráculo" : "Oracle tips",
      oracleTipsEmpty: es
        ? "Aún no hay consejos. Completa una sesión para recibir feedback."
        : "No tips yet. Complete a session to receive feedback.",

      budgetTitle: es ? "Presupuesto mensual" : "Monthly budget",
      budgetRefresh: es ? "Actualizar" : "Refresh",
      budgetRefreshing: es ? "Actualizando…" : "Refreshing…",
      budgetLoading: es ? "Cargando presupuesto…" : "Loading budget…",
      budgetError: es ? "No se pudo cargar el presupuesto" : "Could not load budget",
      budgetMonth: es ? "Mes" : "Month",
      budgetRemaining: es ? "Restante" : "Remaining",
      budgetOver: es ? "límite alcanzado" : "limit reached",
      budgetHintOk: es
        ? "Controla el gasto acumulado de OpenAI este mes (según tokens)."
        : "Tracks your OpenAI spend this month (token-based).",
      budgetHintOver: es
        ? "OpenAI está bloqueado este mes por presupuesto. Cambia a Ollama para seguir sin coste."
        : "OpenAI is blocked this month by budget. Switch to Ollama to continue for free.",

      pdf: "PDF",
      pdfTitle: es ? "Informe del Oráculo" : "Oracle Report",
      pdfSessions: es ? "Últimas 10 sesiones" : "Last 10 sessions",

      clarity: es ? "Claridad" : "Clarity",
      desire: es ? "Deseo" : "Desire",
      listening: es ? "Escucha" : "Listening",
      status: es ? "Status" : "Status",
      ending: es ? "Cierre" : "Ending",
    };
  }, [lang]);

  // 2) Métricas actuales
  const points = loadPoints(); // 0..20 por skill

  const pcts = useMemo(() => {
    const out: Record<SkillKey, number> = {
      clarity: 0,
      desire: 0,
      listening: 0,
      status: 0,
      ending: 0,
    };
    for (const k of SKILLS) out[k] = clamp(pointsToPercent(points[k] ?? 0), 0, 100);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.clarity, points.desire, points.listening, points.status, points.ending]);

  const avgPct = useMemo(() => {
    const sum = SKILLS.reduce((acc, k) => acc + pcts[k], 0);
    return Math.round(sum / SKILLS.length);
  }, [pcts]);

  const recommended = useMemo<PlayerLevel>(() => recommendLevel(avgPct), [avgPct]);

  const recommendedLabel = useMemo(() => {
    const found = PLAYER_LEVELS.find((x) => (x.key as PlayerLevel) === recommended);
    return found ? found.label[lang] : recommended;
  }, [recommended, lang]);

  const selectedLabel = useMemo(() => {
    const found = PLAYER_LEVELS.find((x) => (x.key as PlayerLevel) === selectedLevel);
    return found ? found.label[lang] : selectedLevel;
  }, [selectedLevel, lang]);

  const latestSummary = useMemo(() => {
    const all = loadSummaries();
    return all[0] ?? null;
  }, []);

  function labelForSkill(k: SkillKey) {
    switch (k) {
      case "clarity":
        return t.clarity;
      case "desire":
        return t.desire;
      case "listening":
        return t.listening;
      case "status":
        return t.status;
      case "ending":
        return t.ending;
    }
  }

  // -------------------------
  // ✅ Budget mensual (solo OpenAI) + botón refrescar
  // -------------------------
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
  const [budgetErr, setBudgetErr] = useState<string>("");
  const [budgetRefreshing, setBudgetRefreshing] = useState(false);

  async function refreshBudget() {
    if (!isOpenAI) return;
    if (!ownerUsername.trim()) {
      setBudget(null);
      setBudgetErr("");
      return;
    }

    setBudgetRefreshing(true);
    try {
      const b = await fetchBudget(ownerUsername.trim());
      setBudget(b);
      setBudgetErr("");
    } catch (e: any) {
      setBudget(null);
      setBudgetErr(e?.message ?? "budget fetch failed");
    } finally {
      setBudgetRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isOpenAI) {
        setBudget(null);
        setBudgetErr("");
        return;
      }

      if (!ownerUsername.trim()) {
        setBudget(null);
        setBudgetErr("");
        return;
      }

      try {
        const b = await fetchBudget(ownerUsername.trim());
        if (!cancelled) {
          setBudget(b);
          setBudgetErr("");
        }
      } catch (e: any) {
        if (!cancelled) {
          setBudget(null);
          setBudgetErr(e?.message ?? "budget fetch failed");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isOpenAI, ownerUsername]);

  // -------------------------
  // ✨ Animación "bump" + skill mejorada
  // -------------------------
  const prevPctsRef = useRef<Record<SkillKey, number> | null>(null);
  const bumpTimerRef = useRef<number | null>(null);
  const improvedTimerRef = useRef<number | null>(null);

  const [bumpSkill, setBumpSkill] = useState<SkillKey | null>(null);
  const [improvedSkill, setImprovedSkill] = useState<SkillKey | null>(null);

  useEffect(() => {
    const prev = prevPctsRef.current;

    if (bumpTimerRef.current) {
      window.clearTimeout(bumpTimerRef.current);
      bumpTimerRef.current = null;
    }
    if (improvedTimerRef.current) {
      window.clearTimeout(improvedTimerRef.current);
      improvedTimerRef.current = null;
    }

    if (prev) {
      let best: { k: SkillKey; delta: number } | null = null;

      for (const k of SKILLS) {
        const before = prev[k] ?? 0;
        const now = pcts[k] ?? 0;
        const delta = now - before;
        if (delta > 0 && (!best || delta > best.delta)) best = { k, delta };
      }

      if (best) {
        setBumpSkill(best.k);
        setImprovedSkill(best.k);

        bumpTimerRef.current = window.setTimeout(() => {
          setBumpSkill(null);
          bumpTimerRef.current = null;
        }, 260);

        improvedTimerRef.current = window.setTimeout(() => {
          setImprovedSkill(null);
          improvedTimerRef.current = null;
        }, 4500);
      }
    }

    prevPctsRef.current = { ...pcts };

    return () => {
      if (bumpTimerRef.current) {
        window.clearTimeout(bumpTimerRef.current);
        bumpTimerRef.current = null;
      }
      if (improvedTimerRef.current) {
        window.clearTimeout(improvedTimerRef.current);
        improvedTimerRef.current = null;
      }
    };
  }, [pcts]);

  // ✅ PDF
  function exportPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const margin = 48;
    const maxW = pageW - margin * 2;

    const h1 = 16;
    const h2 = 12;
    const body = 10;

    const headerTop = 40;
    const headerHeight = 70;
    const footerHeight = 34;
    const topY = headerTop + headerHeight;
    const bottomY = pageH - margin - footerHeight;

    const nowStr = (() => {
      try {
        return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
      } catch {
        return "";
      }
    })();

    const title = t.pdfTitle;
    const userLine = `${lang === "es" ? "Usuario" : "User"}: ${nickname}`;
    const dateLine = nowStr ? `${lang === "es" ? "Fecha" : "Date"}: ${nowStr}` : "";

    let y = topY;

    function drawHeader() {
      doc.setFontSize(h1);
      doc.text(title, margin, headerTop);

      doc.setFontSize(h2);
      doc.text(userLine, margin, headerTop + 20);

      if (dateLine) {
        doc.setFontSize(body);
        doc.text(dateLine, margin, headerTop + 38);
      }

      doc.setDrawColor(200);
      doc.line(margin, headerTop + headerHeight - 10, pageW - margin, headerTop + headerHeight - 10);
    }

    function ensureSpace(needed: number) {
      if (y + needed <= bottomY) return;
      doc.addPage();
      drawHeader();
      y = topY;
    }

    function addText(text: string, size = body, extraGap = 0) {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, maxW);
      const lineHeight = size + 3;
      const needed = lines.length * lineHeight + extraGap;
      ensureSpace(needed);

      doc.text(lines, margin, y);
      y += lines.length * lineHeight + extraGap;
    }

    function addSectionTitle(text: string) {
      addText(text, h2, 6);
    }

    function addSpacer(px = 8) {
      ensureSpace(px);
      y += px;
    }

    drawHeader();

    addSectionTitle(`${t.recommended}: ${recommendedLabel} (${avgPct}%)`);
    addSpacer(6);

    addSectionTitle(t.skillsTitle);
    for (const k of SKILLS) addText(`• ${labelForSkill(k)}: ${pcts[k]}%`, body, 0);
    addSpacer(12);

    const sessions = loadSummaries();
    addSectionTitle(t.pdfSessions);

    if (!sessions.length) {
      addText(lang === "es" ? "Sin sesiones todavía." : "No sessions yet.", body, 0);
    } else {
      sessions.forEach((s, idx) => {
        addSpacer(6);
        addText(
          `${idx + 1}. ${formatDate(s.ts, lang)} · ${String(s.mode).toUpperCase()} · ${s.exerciseId} · ${s.charSlug}`,
          body,
          2
        );

        if (s.recommendation) {
          addText(`${lang === "es" ? "Recomendación" : "Recommendation"}: ${s.recommendation}`, body, 2);
        }

        if (Array.isArray(s.tips) && s.tips.length) {
          addText(lang === "es" ? "Consejos:" : "Tips:", body, 0);
          s.tips.forEach((tip) => addText(`- ${tip}`, body, 0));
          addSpacer(2);
        }

        if (Array.isArray(s.mistakes) && s.mistakes.length) {
          addText(lang === "es" ? "Fallos:" : "Mistakes:", body, 0);
          s.mistakes.forEach((m) => addText(`- ${m}`, body, 0));
          addSpacer(2);
        }

        if (s.penalty) {
          addText(`${lang === "es" ? "Penalización" : "Penalty"}: ${s.penalty}`, body, 0);
        }
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);

      const pageLabel = lang === "es" ? `Página ${i} / ${totalPages}` : `Page ${i} / ${totalPages}`;
      const textW = doc.getTextWidth(pageLabel);
      const x = pageW - margin - textW;
      const yFooter = pageH - margin;

      doc.setTextColor(120);
      doc.text(pageLabel, x, yFooter);
      doc.setTextColor(0);
    }

    const filename =
      (lang === "es" ? "informe_oraculo_" : "oracle_report_") +
      (nickname || "guest").trim().toLowerCase() +
      ".pdf";

    doc.save(filename);
  }

  return (
    <div className={`profile ${master ? "profile--master" : ""}`}>
      <div className="profile__panel">
        <div className="profile__header">
          <div className="profile__kicker">{t.title}</div>
          <div className="profile__subtitle">{t.subtitle}</div>
        </div>

        {/* ✅ sigue mostrando el nickname */}
        <div className="profile__name">{nickname}</div>

        <div style={{ marginTop: 10 }}>
          <button className="btn btn--gold" type="button" onClick={exportPdf}>
            {t.pdf}
          </button>
        </div>

        <div className="profile__levels" style={{ marginTop: 12 }}>
          <div className="profile__levelBox">
            <div className="profile__levelRow">
              <div className="profile__levelCols">
                <div className="profile__levelCol">
                  <div className="profile__miniLabel">{t.recommended}</div>
                  <span className="profile__badge profile__badge--gold">{recommendedLabel}</span>
                </div>

                <div className="profile__levelCol">
                  <div className="profile__miniLabel">{t.selected}</div>
                  <span className="profile__badge profile__badge--accent">{selectedLabel}</span>
                </div>
              </div>

              <div className="profile__levelPct">{avgPct}%</div>
            </div>
          </div>
        </div>

        {/* ✅ Presupuesto mensual (solo OpenAI) */}
        {isOpenAI && (
          <>
            <div
              className="profile__sectionTitle"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span>{t.budgetTitle}</span>

              <button
                className="btn btn--soft"
                type="button"
                onClick={refreshBudget}
                disabled={budgetRefreshing}
                style={{ padding: "8px 10px", fontSize: 12 }}
              >
                {budgetRefreshing ? t.budgetRefreshing : t.budgetRefresh}
              </button>
            </div>

            {budget ? (
              <div className="profile__oracle" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 26, letterSpacing: 0.2 }}>
                    {budget.eurSpent.toFixed(2)}€
                    <span style={{ fontSize: 14, opacity: 0.75, marginLeft: 6 }}>
                      / {budget.eurCutoff}€
                    </span>
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>
                    <div>
                      {t.budgetMonth}: {budget.monthKey}
                    </div>
                    <div>
                      {t.budgetRemaining}: {Math.max(0, budget.remainingToCutoffEur).toFixed(2)}€
                      {budget.overCutoff ? (
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                          {" "}
                          · {t.budgetOver}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="profile__budgetBar" aria-hidden>
                  <div
                    className={`profile__budgetFill ${budget.overCutoff ? "is-over" : ""}`}
                    style={{
                      width: `${Math.min(100, (budget.eurSpent / Math.max(0.01, budget.eurCutoff)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="profile__muted" style={{ marginTop: 10 }}>
                  {budget.overCutoff ? t.budgetHintOver : t.budgetHintOk}
                </div>
              </div>
            ) : (
              <div className="profile__muted">{budgetErr ? `${t.budgetError}: ${budgetErr}` : t.budgetLoading}</div>
            )}
          </>
        )}

        <div className="profile__sectionTitle">{t.oracleTipsTitle}</div>

        {latestSummary ? (
          <div className="profile__oracle">
            {latestSummary.recommendation && (
              <div className="profile__oracleRec">{latestSummary.recommendation}</div>
            )}

            {!!latestSummary.tips?.length && (
              <ul className="profile__oracleList">
                {latestSummary.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            )}

            {!latestSummary.recommendation && !(latestSummary.tips?.length) && (
              <div className="profile__muted">{t.oracleTipsEmpty}</div>
            )}

            {latestSummary.penalty && <div className="profile__oraclePenalty">{latestSummary.penalty}</div>}
          </div>
        ) : (
          <div className="profile__muted">{t.oracleTipsEmpty}</div>
        )}

        <div className="profile__sectionTitle">{t.skillsTitle}</div>

        <div className="profile__skills">
          {SKILLS.map((k) => {
            const pct = pcts[k];
            const isImproved = improvedSkill === k;

            return (
              <div key={k} className={`profile__skill ${isImproved ? "is-improved" : ""}`}>
                <div className="profile__skillTop">
                  <div className="profile__skillName">{labelForSkill(k)}</div>
                  <div className="profile__skillPct">{pct}%</div>
                </div>

                <div className="profile__bar">
                  <div
                    className={["profile__barFill", bumpSkill === k ? "is-bump" : ""].filter(Boolean).join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* (Opcional) Debug mini: ver owner real si Master */}
        {master && (
          <div className="profile__muted" style={{ marginTop: 14, fontSize: 12 }}>
            owner: {ownerUsername || "—"} {authedEmail ? "(email)" : "(nickname fallback)"}
          </div>
        )}
      </div>
    </div>
  );
}
