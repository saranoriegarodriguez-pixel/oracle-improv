import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, PlayerLevel } from "../../shared/types";

export type AiProvider = "ollama" | "openai";

export type AppSettings = {
  lang: Locale;
  level: PlayerLevel;
  master?: boolean;
  aiProvider?: AiProvider;
};

const KEY = "oracle.settings.v1";

function isPlayerLevel(x: any): x is PlayerLevel {
  return x === "apprentice" || x === "performer" || x === "tragicHero" || x === "presentChorus";
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    const level: PlayerLevel = isPlayerLevel(parsed.level) ? parsed.level : "apprentice";
    const lang: Locale = parsed.lang === "en" ? "en" : "es";
    const aiProvider: AiProvider = parsed.aiProvider === "openai" ? "openai" : "ollama";

    return {
      lang,
      level,
      master: parsed.master === true,
      aiProvider,
    };
  } catch {
    return { lang: "es", level: "apprentice", master: false, aiProvider: "ollama" };
  }
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

type CtxValue = {
  st: AppSettings;
  setLang: (lang: Locale) => void;
  setLevel: (level: PlayerLevel) => void;
  setMaster: (master: boolean) => void;
  setAiProvider: (p: AiProvider) => void;
};

const Ctx = createContext<CtxValue | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(st);
  }, [st]);

  const api = useMemo<CtxValue>(
    () => ({
      st,
      setLang: (lang) => setSt((p) => ({ ...p, lang })),
      setLevel: (level) => setSt((p) => ({ ...p, level })),
      setMaster: (master) => setSt((p) => ({ ...p, master })),
      setAiProvider: (aiProvider) => setSt((p) => ({ ...p, aiProvider })),
    }),
    [st]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}
