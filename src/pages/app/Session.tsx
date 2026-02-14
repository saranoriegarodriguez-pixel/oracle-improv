
// src/pages/Session.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Session.css";

import { CHARACTERS } from "../../../shared/data/characters";
import type { Character } from "../../../shared/types";

import { useAppSettings } from "../../state/appSettings";
import { loadUsername, applyOraclePoints } from "../../state/profileStore";
import { saveSummary } from "../../state/profileSummaries";
import { sendEvaluate, normalizeOracle, sumPoints } from "../../api/evaluate";
import { useToast, useOracleFeedback } from "../../state/feedback/FeedbackProvider";

// ✅ zustand auth store (si lo tienes)
import { useAuthStore } from "../../state/authStore";

import {
  safeExercise,
  safeMode,
  formatMMSS,
  getBgUrl,
  buildSystemPrompt,
  buildInitialAssistantMessage,
  buildHeaderText,
  type ExerciseId,
  type Mode,
  type Lang,
} from "./sessionHelpers";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type UsageResponse = {
  remaining: number;
  limit: number;
  used: number;
  dayKey?: string;
};

const SESSION_SECONDS = 8 * 60;

// Zoom limits (modo imagen)
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function makeSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `sid_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function isAllZero(points: any): boolean {
  if (!points || typeof points !== "object") return true;
  const vals = Object.values(points);
  if (!vals.length) return true;
  return vals.every((v) => Number(v) === 0);
}

export default function Session() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { st } = useAppSettings() as any;
  const lang: Lang = (st?.lang ?? "es") as Lang;

  const aiProvider = st?.aiProvider ?? "ollama";
  const isOpenAI = aiProvider === "openai";

  const toast = useToast();
  const oracle = useOracleFeedback();

  // ✅ auth (zustand)
  const auth = useAuthStore();
  const authedEmail = auth.user?.email ? String(auth.user.email).trim().toLowerCase() : "";
  const isAuthed = auth.status === "authed" && !!authedEmail;

  const charSlug = params.get("char") ?? "";
  const exerciseId = (safeExercise(params.get("exercise")) ?? "E1") as ExerciseId;
  const mode = (safeMode(params.get("mode")) ?? "train") as Mode;

  // 👇 “username” visible (perfil) vs “owner real” (email)
  const profileName = loadUsername() || (lang === "es" ? "Sin nombre" : "Unnamed");
  const ownerUsername = authedEmail || profileName; // para /api/usage (idealmente email)

  // ✅ sessionId estable por sesión
  const sessionIdRef = useRef<string>(String(params.get("sessionId") ?? makeSessionId()));
  const sessionId = sessionIdRef.current;

  const character: Character | null = useMemo(() => {
    if (!charSlug) return null;
    return (CHARACTERS as unknown as Character[]).find((c) => (c as any).slug === charSlug) ?? null;
  }, [charSlug]);

  const headerText = useMemo(
    () => buildHeaderText({ lang, mode, exerciseId }),
    [lang, mode, exerciseId]
  );

  const bgUrl = useMemo(() => getBgUrl(charSlug), [charSlug]);

  // -------------------------
  // Si OpenAI requiere login
  // -------------------------
  useEffect(() => {
    // ✅ refresca /api/auth/me (si tu authStore lo implementa así)
    if (auth.status === "unknown") {
      void auth.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpenAI) return;

    // si aún está cargando el estado, no hagas nada
    if (auth.status === "unknown" || auth.status === "loading") return;

    // si no hay sesión, fuera
    if (!isAuthed) {
      toast.warning?.(
        lang === "es" ? "Para usar OpenAI necesitas iniciar sesión con Google." : "Google login is required for OpenAI."
      );
      navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenAI, auth.status, isAuthed, lang]);

  // -------------------------
  // Chat + input
  // -------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ overlay Evaluando…
  const [isEvaluating, setIsEvaluating] = useState(false);

  // -------------------------
  // Timer 8:00
  // -------------------------
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [timerRunning, setTimerRunning] = useState(true);

  // -------------------------
  // Modo cine (sin chat)
  // -------------------------
  const [cinema, setCinema] = useState(false);

  // -------------------------
  // Zoom + Pan (solo en cinema)
  // -------------------------
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // -------------------------
  // Parallax (estado)
  // -------------------------
  const [par, setPar] = useState({ x: 0, y: 0 });

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPar({ x: 0, y: 0 });
  }

  // Pan clamp: con contain es difícil “perfecto”, pero esto evita perder la imagen.
  function clampPan(p: { x: number; y: number }, z: number) {
    const k = Math.max(0, z - 1);
    const max = 260 * k; // ajustable
    return { x: clamp(p.x, -max, max), y: clamp(p.y, -max, max) };
  }

  // -------------------------
  // Usage (solo OpenAI)
  // -------------------------
  const [usage, setUsage] = useState<UsageResponse | null>(null);

  async function refreshUsage() {
    if (!isOpenAI) return;
    if (!ownerUsername) return;

    try {
      const res = await fetch(`/api/usage/${encodeURIComponent(ownerUsername)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as UsageResponse;
      setUsage(data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!isOpenAI) return;
    void refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenAI, ownerUsername]);

  // -------------------------
  // Init: system + greeting
  // -------------------------
  const evaluatedRef = useRef(false);

  useEffect(() => {
    if (!character) return;

    const system = buildSystemPrompt({ character, lang, mode, exerciseId });
    const greeting = buildInitialAssistantMessage({ character, lang, exerciseId });

    setMessages([
      { role: "system", content: system },
      { role: "assistant", content: greeting },
    ]);

    // reset sesión
    setInput("");
    setIsSending(false);
    setIsEvaluating(false);
    setTimeLeft(SESSION_SECONDS);
    setTimerRunning(true);
    evaluatedRef.current = false;

    // reset vista
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPar({ x: 0, y: 0 });
  }, [character, lang, mode, exerciseId]);

  // -------------------------
  // Auto-scroll inteligente + botón
  // -------------------------
  const listRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  }

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const el = node;

    const onScroll = () => {
      const threshold = 28;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(dist <= threshold);
    };

    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cinema) return;
    if (atBottom) scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, atBottom, cinema]);

  // -------------------------
  // Stage ref
  // -------------------------
  const stageRef = useRef<HTMLDivElement | null>(null);

  // -------------------------
  // Parallax suave
  // -------------------------
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    const PARALLAX = cinema ? 7 : 5;

    function schedule(nx: number, ny: number) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setPar({ x: nx, y: ny }));
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      if (cinema && zoomRef.current > 1) return;

      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const nx = clamp((e.clientX - cx) / (r.width / 2), -1, 1);
      const ny = clamp((e.clientY - cy) / (r.height / 2), -1, 1);

      schedule(nx * PARALLAX, ny * PARALLAX);
    }

    function onLeave() {
      schedule(0, 0);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cinema]);

  // -------------------------
  // Doble click / doble tap reset
  // -------------------------
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    function onDblClick(e: MouseEvent) {
      if (!cinema) return;
      e.preventDefault();
      resetView();
    }

    let lastTap = 0;
    function onTouchEnd() {
      if (!cinema) return;
      const now = Date.now();
      if (now - lastTap < 260) {
        resetView();
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }

    el.addEventListener("dblclick", onDblClick);
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("dblclick", onDblClick);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [cinema]);

  // -------------------------
  // Zoom con rueda (PC)
  // -------------------------
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    function onWheel(e: WheelEvent) {
      if (!cinema) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const prevZ = zoomRef.current;
      const dir = e.deltaY > 0 ? -1 : 1;
      const step = 0.14;
      const nextZ = clamp(Number((prevZ + dir * step).toFixed(2)), ZOOM_MIN, ZOOM_MAX);

      const px = (mx - rect.width / 2 - panRef.current.x) / prevZ;
      const py = (my - rect.height / 2 - panRef.current.y) / prevZ;

      const nextPanRaw = {
        x: mx - rect.width / 2 - px * nextZ,
        y: my - rect.height / 2 - py * nextZ,
      };

      setZoom(nextZ);
      setPan(clampPan(nextPanRaw, nextZ));
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [cinema]);

  // -------------------------
  // Pan con ratón (drag) cuando zoom>1
  // -------------------------
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let base = { x: 0, y: 0 };

    function onPointerDown(e: PointerEvent) {
      if (!cinema) return;
      if (e.pointerType !== "mouse") return;
      if (zoomRef.current <= 1) return;

      dragging = true;
      base = panRef.current;
      startX = e.clientX;
      startY = e.clientY;

      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const next = { x: base.x + dx, y: base.y + dy };
      const z = zoomRef.current;
      setPan(clampPan(next, z));
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;

      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}

      el.style.cursor = zoomRef.current > 1 ? "grab" : "";
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    el.style.cursor = cinema && zoomRef.current > 1 ? "grab" : "";

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.style.cursor = "";
    };
  }, [cinema]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    el.style.cursor = cinema && zoom > 1 ? "grab" : "";
    return () => {
      el.style.cursor = "";
    };
  }, [cinema, zoom]);

  // -------------------------
  // Pinch móvil + pan 1 dedo
  // -------------------------
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const el = node;

    const pointers = new Map<number, { x: number; y: number }>();
    let startDist = 0;
    let startZoom = 1;

    let lastSingle = { x: 0, y: 0 };

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    function onPointerDown(e: PointerEvent) {
      if (!cinema) return;
      if (e.pointerType !== "touch") return;

      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        lastSingle = { x: e.clientX, y: e.clientY };
      }

      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        startDist = dist(pts[0], pts[1]);
        startZoom = zoomRef.current;
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!cinema) return;
      if (e.pointerType !== "touch") return;
      if (!pointers.has(e.pointerId)) return;

      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1 && zoomRef.current > 1) {
        const cur = Array.from(pointers.values())[0];
        const dx = cur.x - lastSingle.x;
        const dy = cur.y - lastSingle.y;
        lastSingle = cur;

        const z = zoomRef.current;
        setPan((p) => clampPan({ x: p.x + dx, y: p.y + dy }, z));
        return;
      }

      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const d = dist(pts[0], pts[1]);
        if (startDist <= 0) return;

        const factor = d / startDist;
        const nextZ = clamp(Number((startZoom * factor).toFixed(2)), ZOOM_MIN, ZOOM_MAX);
        setZoom(nextZ);
        setPan((p) => clampPan(p, nextZ));
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      pointers.delete(e.pointerId);
      startDist = 0;

      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [cinema]);

  // -------------------------
  // Timer tick
  // -------------------------
  useEffect(() => {
    if (!timerRunning) return;

    const id = window.setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerRunning]);

  // -------------------------
  // Evaluación única
  // -------------------------
  async function finalize(reason: "manual" | "time") {
    if (evaluatedRef.current) return;
    evaluatedRef.current = true;

    setIsEvaluating(true);

    try {
      const level = (st?.level ?? 1) as 1 | 2 | 3 | 4;
      const master = Boolean(st?.master);

      const out = await sendEvaluate({
        lang,
        mode,
        level,
        exerciseId,
        charSlug,
        master,
        auto: reason === "time",
        messages,
        provider: aiProvider,
        sessionId,
        username: ownerUsername,
      });

      const oracleJson = normalizeOracle(out);
      const score = sumPoints(oracleJson.points);

      applyOraclePoints({ points: oracleJson.points, charSlug, allowPoints: true });

      saveSummary({
        ts: Date.now(),
        username: ownerUsername,
        sessionId,
        mode,
        exerciseId,
        charSlug,
        recommendation: oracleJson.recommendation,
        mistakes: oracleJson.mistakes?.length ? oracleJson.mistakes : undefined,
        tips: oracleJson.tips?.length ? oracleJson.tips : undefined,
        penalty: oracleJson.penalty,
      });

      const noScore = isAllZero(oracleJson.points);
      const title = lang === "es" ? "Veredicto del Oráculo" : "Oracle verdict";
      const recommendation =
        oracleJson.recommendation ||
        (noScore
          ? lang === "es"
            ? "Modo entrenamiento: feedback sin puntuación. En tu próxima ronda, declara quién eres, dónde estás y qué quieres."
            : "Training mode: feedback without scoring. Next round, state who you are, where you are, and what you want."
          : undefined);

      oracle.open({
        title,
        score,
        points: oracleJson.points,
        recommendation,
        tips: oracleJson.tips,
        mistakes: oracleJson.mistakes,
        penalty: oracleJson.penalty,
        rawText: oracleJson.text,
      });

      toast.push({
        tone: "oracle",
        message: noScore
          ? lang === "es"
            ? "Sesión evaluada (sin puntuación)."
            : "Session evaluated (no scoring)."
          : lang === "es"
            ? "Sesión evaluada."
            : "Session evaluated.",
      });

      if (isOpenAI) void refreshUsage();
    } catch {
      toast.error(lang === "es" ? "Error evaluando la sesión." : "Error evaluating session.");
      evaluatedRef.current = false;
    } finally {
      setIsEvaluating(false);
    }
  }

  useEffect(() => {
    if (timeLeft > 0) return;
    setTimerRunning(false);
    void finalize("time");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // -------------------------
  // Send chat
  // -------------------------
  async function sendLine() {
    if (!input.trim()) return;
    if (isSending) return;
    if (isEvaluating) return;

    // extra guard: OpenAI requiere auth
    if (isOpenAI && (auth.status === "unknown" || auth.status === "loading")) return;
    if (isOpenAI && !isAuthed) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
      return;
    }

    const content = input.trim();
    setInput("");
    setIsSending(true);

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ cookie sid
        body: JSON.stringify({
          messages: next,
          provider: aiProvider,
          sessionId,
          username: ownerUsername,
          mode,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const out: unknown = await res.json();

      const anyOut = out as any;
      const reply =
        anyOut?.message?.content ??
        anyOut?.choices?.[0]?.message?.content ??
        anyOut?.output?.content ??
        anyOut?.text ??
        "";

      const assistant = String(reply || "").trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            assistant ||
            (lang === "es"
              ? "No he podido responder. Prueba otra vez."
              : "I couldn't reply. Try again."),
        },
      ]);
    } catch {
      toast.error(lang === "es" ? "Error enviando mensaje." : "Error sending message.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "es"
              ? "Se ha roto algo al responder. Inténtalo otra vez."
              : "Something broke while replying. Try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  // -------------------------
  // Guard UI
  // -------------------------
  if (!character) {
    return (
      <div className="session">
        <div className="session__wrap">
          <p className="muted">
            {lang === "es"
              ? "No hay personaje seleccionado. Vuelve a Home."
              : "No character selected. Go back to Home."}
          </p>
          <button className="btn btn--primary" type="button" onClick={() => navigate("/")}>
            {lang === "es" ? "Ir a Home" : "Go Home"}
          </button>
        </div>
      </div>
    );
  }

  const charName = (character as any).name?.[lang] ?? (character as any).name ?? "?";
  const youName = lang === "es" ? "Tú" : "You";

  // ✅ Transform final: parallax + pan + zoom
  const tx = par.x + (cinema ? pan.x : 0);
  const ty = par.y + (cinema ? pan.y : 0);

  return (
    <div className={`session ${cinema ? "session--cinema" : ""}`}>
      {isEvaluating && (
        <div className="evalOverlay" role="status" aria-live="polite">
          <div className="evalCard">
            <div className="evalTitle">{lang === "es" ? "Evaluando…" : "Evaluating…"}</div>
            <div className="evalSub">
              {lang === "es"
                ? "El Oráculo está calculando tu puntuación."
                : "The Oracle is scoring your session."}
            </div>
            <div className="evalDots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div className="session__wrap">
        <div className="session__top">
          <div className="session__titleRow">
            <div className="session__char">
              <span className="badge">{charName}</span>
              <span className="muted" style={{ marginLeft: 10 }}>
                {exerciseId} · {mode.toUpperCase()}
              </span>
            </div>

            <div className="session__right">
              <div className="session__timer">{formatMMSS(timeLeft)}</div>

              <button
                className="btn btn--ghost"
                type="button"
                disabled={isEvaluating}
                onClick={() => setCinema((v) => !v)}
              >
                {cinema
                  ? lang === "es"
                    ? "Mostrar chat"
                    : "Show chat"
                  : lang === "es"
                    ? "Ver imagen"
                    : "View image"}
              </button>

              <button
                className="btn btn--gold"
                type="button"
                disabled={isEvaluating}
                onClick={() => {
                  setTimerRunning(false);
                  void finalize("manual");
                }}
              >
                {lang === "es" ? "Terminar" : "Finish"}
              </button>
            </div>
          </div>

          <div className="session__headerText" style={{ whiteSpace: "pre-wrap" }}>
            {headerText}
          </div>

          {isOpenAI && usage && (
            <div className="small" style={{ marginTop: 6, opacity: 0.9 }}>
              {lang === "es"
                ? `Te quedan ${usage.remaining} sesiones hoy`
                : `${usage.remaining} sessions left today`}
            </div>
          )}
        </div>

        <div ref={stageRef} className={`session__stage ${cinema ? "session__stage--zoomable" : ""}`}>
          <img
            className="session__bg"
            src={bgUrl}
            alt=""
            draggable={false}
            style={{
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${zoom})`,
            }}
          />
          <div className="session__vignette" aria-hidden />

          {!cinema && (
            <div className="session__chatOverlay">
              <div className="session__chat">
                <div className="session__list" ref={listRef}>
                  {messages
                    .filter((m) => m.role !== "system")
                    .map((m, i) => {
                      const who = m.role === "assistant" ? charName : youName;
                      return (
                        <div
                          key={i}
                          className={`msg ${m.role === "user" ? "msg--user" : "msg--assistant"}`}
                        >
                          <div className="msg__name">{who}</div>
                          <div className={`bubble ${m.role === "user" ? "bubble--user" : "bubble--assistant"}`}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {!atBottom && (
                  <button className="session__toBottom" type="button" onClick={() => scrollToBottom("smooth")}>
                    {lang === "es" ? "Ir a lo último" : "Jump to latest"}
                  </button>
                )}

                <div className="session__composer">
                  <input
                    className="session__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={lang === "es" ? "Tu réplica…" : "Your line…"}
                    disabled={isEvaluating || isSending || timeLeft === 0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void sendLine();
                      }
                    }}
                  />
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => void sendLine()}
                    disabled={isEvaluating || isSending || !input.trim() || timeLeft === 0}
                  >
                    {lang === "es" ? "Enviar" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {cinema && (
          <div className="small" style={{ marginTop: 10, opacity: 0.85 }}>
            {lang === "es"
              ? "Zoom: rueda o pellizco. Arrastra para mover cuando hayas hecho zoom. Doble click/tap: reset."
              : "Zoom: wheel or pinch. Drag to pan when zoomed. Double click/tap: reset."}
          </div>
        )}
      </div>
    </div>
  );
}