// src/pages/Settings.tsx
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import "./Settings.css";
import Select, { type SelectOption } from "../components/Select";

// ✅ IMPORTS CORRECTOS (sin / inicial)
import { PLAYER_LEVELS } from "../../shared/data/characters";
import type { PlayerLevel } from "../../shared/types";

import { useAppSettings } from "../state/appSettings";
import { loadUsername, saveUsername, resetSkillPoints } from "../state/profileStore";
import { clearSummaries } from "../state/profileSummaries";

type Lang = "es" | "en";
type AiProvider = "ollama" | "openai";

export default function Settings() {
  // Si tu hook no tiene setAiProvider todavía, lo dejamos en any por ahora
  const { st, setLang, setLevel, setMaster, setAiProvider } = useAppSettings() as any;

  const lang: Lang = (st.lang ?? "es") as Lang;
  const level: PlayerLevel = (st.level ?? "apprentice") as PlayerLevel;

  const isDev = import.meta.env.DEV;
  const master = Boolean(st.master);

  const aiProvider: AiProvider = (st.aiProvider ?? "ollama") as AiProvider;

  // ---------------- Username ----------------
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(loadUsername());
  }, []);

  const t = useMemo(() => {
    const es = lang === "es";
    return {
      language: es ? "Idioma" : "Language",
      level: es ? "Nivel" : "Level",

      master: "Master",
      masterHint: es
        ? "Solo visible en local/dev. Activa herramientas de testing."
        : "Only visible in local/dev. Enables testing tools.",

      forceChorus: es ? "Forzar nivel: Coro presente" : "Force level: Present Chorus",
      forceChorusHint: es
        ? "Pone el nivel en presentChorus (solo Master)."
        : "Sets level to presentChorus (Master only).",

      aiTitle: es ? "IA (solo Master)" : "AI (Master only)",
      aiProviderLabel: es ? "Proveedor de IA" : "AI provider",
      aiHintOllama: es
        ? "Usará Ollama local en /api/chat y /api/evaluate."
        : "Uses local Ollama in /api/chat and /api/evaluate.",
      aiHintOpenAI: es
        ? "Usará OpenAI (por ejemplo GPT-5 mini) en /api/chat y /api/evaluate."
        : "Uses OpenAI (e.g. GPT-5 mini) in /api/chat and /api/evaluate.",

      username: es ? "Nombre de usuario" : "Username",
      usernameHint: es ? "Este nombre se muestra en tu perfil." : "This name is shown in your profile.",
      usernamePh: es ? "Tu nombre…" : "Your name…",

      // ✅ Reset SOLO skills + Oráculo (no username, no usos)
      resetAll: es ? "Reset progreso" : "Reset progress",
      resetAllBtn: es ? "Resetear habilidades y Oráculo" : "Reset skills + Oracle",
      resetAllHint: es
        ? "Borra las barras de habilidades y los consejos/últimas 10 sesiones del Oráculo. No borra tu nombre ni el uso de personajes."
        : "Resets skill bars and Oracle tips/last 10 sessions. Does not erase your name or character usage.",
      confirmResetAll: es
        ? "¿Seguro? Esto reseteará habilidades y consejos del Oráculo. No se puede deshacer."
        : "Are you sure? This will reset skills and Oracle tips. It can’t be undone.",
      resetAllDone: es ? "Habilidades y Oráculo reseteados." : "Skills + Oracle reset.",

      selectPh: es ? "Selecciona…" : "Select…",
    };
  }, [lang]);

  const langOptions = useMemo<SelectOption<Lang>[]>(() => {
    return [
      { value: "es", label: "Español" },
      { value: "en", label: "English" },
    ];
  }, []);

  // ✅ Player levels tipados a PlayerLevel (no string)
  const levelOptions = useMemo<SelectOption<PlayerLevel>[]>(() => {
    const order: PlayerLevel[] = ["apprentice", "performer", "tragicHero", "presentChorus"];
    const idx = new Map<PlayerLevel, number>(order.map((k, i) => [k, i]));

    return [...PLAYER_LEVELS]
      .sort((a, b) => {
        const ak = a.key as PlayerLevel;
        const bk = b.key as PlayerLevel;
        return (idx.get(ak) ?? 999) - (idx.get(bk) ?? 999);
      })
      .map((l) => ({
        value: l.key as PlayerLevel,
        label: l.label[lang],
      }));
  }, [lang]);

  const aiProviderOptions = useMemo<SelectOption<AiProvider>[]>(() => {
    return [
      { value: "ollama", label: "Ollama (local)" },
      { value: "openai", label: "OpenAI (API)" },
    ];
  }, []);

  function commitUsername() {
    const saved = saveUsername(username);
    setUsername(saved);
  }

  function onUsernameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitUsername();
      e.currentTarget.blur();
    }
  }

  function handleForceChorus() {
    setLevel("presentChorus");
  }

  function handleResetAll() {
    const ok = window.confirm(t.confirmResetAll);
    if (!ok) return;

    // ✅ SOLO barras (skills)
    resetSkillPoints();

    // ✅ SOLO consejos del Oráculo (últimas 10 sesiones)
    clearSummaries();

    window.alert(t.resetAllDone);
  }

  return (
    <div className="settings">
      <div className="settings__panel">
        {/* Fila: Idioma + Nivel */}
        <div className="settings__row2">
          {/* ✅ IMPORTANTE: pasar genérico para que onChange NO sea string */}
          <Select<Lang>
            label={t.language}
            value={lang}
            onChange={(v) => setLang(v)}
            options={langOptions}
            placeholder={t.selectPh}
          />

          <Select<PlayerLevel>
            label={t.level}
            value={level}
            onChange={(v) => setLevel(v)}
            options={levelOptions}
            placeholder={t.selectPh}
          />
        </div>

        {/* Master (solo DEV) */}
        {isDev && (
          <div className="settings__group">
            <div className="settings__label">{t.master}</div>

            <label className="settings__switch">
              <input
                type="checkbox"
                checked={master}
                onChange={(e) => setMaster(e.target.checked)}
              />
              <span className="settings__slider" aria-hidden />
              <span className="settings__switchText">{master ? "ON" : "OFF"}</span>
            </label>

            <div className="settings__hint">{t.masterHint}</div>

            {master && (
              <div style={{ marginTop: 10 }}>
                <button className="settings__btn" type="button" onClick={handleForceChorus}>
                  {t.forceChorus}
                </button>
                <div className="settings__hint" style={{ marginTop: 8 }}>
                  {t.forceChorusHint}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IA Provider (solo Master) */}
        {master && (
          <div className="settings__group">
            <div className="settings__label">{t.aiTitle}</div>

            <Select<AiProvider>
              label={t.aiProviderLabel}
              value={aiProvider}
              onChange={(v) => setAiProvider?.(v)}
              options={aiProviderOptions}
              placeholder={t.selectPh}
            />

            <div className="settings__hint" style={{ marginTop: 8 }}>
              {aiProvider === "openai" ? t.aiHintOpenAI : t.aiHintOllama}
            </div>
          </div>
        )}

        {/* Nombre de usuario */}
        <div className="settings__group">
          <div className="settings__label">{t.username}</div>
          <input
            className="settings__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={commitUsername}
            onKeyDown={onUsernameKeyDown}
            placeholder={t.usernamePh}
            maxLength={32}
            autoComplete="off"
          />
          <div className="settings__hint">{t.usernameHint}</div>
        </div>

        {/* ✅ Reset (solo skills + Oráculo) */}
        <div className="settings__group">
          <div className="settings__label">{t.resetAll}</div>
          <button className="settings__danger" type="button" onClick={handleResetAll}>
            {t.resetAllBtn}
          </button>
          <div className="settings__hint">{t.resetAllHint}</div>
        </div>
      </div>
    </div>
  );
}
