// src/pages/Home.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import { CHARACTERS, PLAYER_LEVELS, SKILLS } from "../../shared/data/characters";
import type { Character, PlayerLevel, SkillKey } from "../../shared/types";

import { useAppSettings } from "../state/appSettings";
import { getCharacterUseCount, loadPoints, pointsToPercent } from "../state/profileStore";

import Select from "../components/Select";

const TABS = [
  { key: "forYou", label: { es: "Para ti", en: "For you" } },
  { key: "level", label: { es: "Nivel", en: "Level" } },
  { key: "skills", label: { es: "Habilidades", en: "Skills" } },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** orden de dificultad: apprentice → presentChorus */
const LEVEL_RANK: Record<PlayerLevel, number> = {
  apprentice: 0,
  performer: 1,
  tragicHero: 2,
  presentChorus: 3,
};

function minRecommendedLevelRank(c: Character): number {
  const rec = c.recommendedLevels ?? [];
  if (!rec.length) return 999;

  // ✅ Si tu tipo aún es string[], esto evita el error al indexar LEVEL_RANK
  const ranks = rec.map((lv) => LEVEL_RANK[lv as PlayerLevel] ?? 999);
  return Math.min(...ranks);
}

/** Bustos desde /public/characters/bust/<slug>.png */
function getBustUrl(slug: string) {
  return `/characters/bust/${slug}.png`;
}

function getCoverPlaceholder(slug: string) {
  const letter = (slug?.[0] ?? "O").toUpperCase();
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="840">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#0b0f1b"/>
          <stop offset="1" stop-color="#07090f"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="300" cy="340" r="140" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" stroke-width="4"/>
      <text x="50%" y="43%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, Segoe UI, Roboto"
        font-size="140" font-weight="900" fill="rgba(255,255,255,0.92)">${letter}</text>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, Segoe UI, Roboto"
        font-size="26" font-weight="700" fill="rgba(255,255,255,0.55)">Oracle Improv</text>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

export default function Home() {
  const navigate = useNavigate();

  // si tu store no está tipado, dejamos any, pero normalizamos st.level:
  const { st } = useAppSettings() as any;
  const lang = (st.lang ?? "es") as "es" | "en";
  const playerLevel = (st.level ?? "apprentice") as PlayerLevel;

  const [tab, setTab] = useState<TabKey>("forYou");
  const [q, setQ] = useState("");

  // filtros
  const [levelFilter, setLevelFilter] = useState<PlayerLevel | "any">("any");
  const [skillFilter, setSkillFilter] = useState<SkillKey | "any">("any");

  // ✅ Para ti (más inteligente): detecta skill más floja del perfil (por %)
  const focusSkill = useMemo<SkillKey | null>(() => {
    const pts = loadPoints();
    const keys = SKILLS.map((s) => s.key as SkillKey);

    let best: SkillKey | null = null;
    let bestVal = Number.POSITIVE_INFINITY;

    for (const k of keys) {
      const pct = pointsToPercent((pts as any)?.[k] ?? 0);
      if (pct < bestVal) {
        bestVal = pct;
        best = k;
      }
    }

    return best;
  }, []);

  // Skills en el selector: orden alfabético por nombre (según idioma)
  const skillsSorted = useMemo(() => {
    return [...SKILLS].sort((a, b) =>
      a.label[lang].localeCompare(b.label[lang], lang === "es" ? "es" : "en", {
        sensitivity: "base",
      })
    );
  }, [lang]);

  // Player levels: orden fijo apprentice→chorus
  const levelsSorted = useMemo(() => {
    const order: PlayerLevel[] = ["apprentice", "performer", "tragicHero", "presentChorus"];
    const map = new Map(order.map((k, i) => [k, i]));
    return [...PLAYER_LEVELS].sort(
      (a, b) => (map.get(a.key as PlayerLevel) ?? 0) - (map.get(b.key as PlayerLevel) ?? 0)
    );
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = CHARACTERS.filter((c: Character) => {
      const haystack = [c.name[lang], c.blurb[lang], ...(c.tags?.[lang] ?? [])]
        .join(" ")
        .toLowerCase();

      const matchesQuery = query.length === 0 ? true : haystack.includes(query);

      const recLevels = c.recommendedLevels ?? [];
      const matchesLevel = levelFilter === "any" ? true : recLevels.includes(levelFilter as any);

      const improves = c.improves ?? [];
      const matchesSkill = skillFilter === "any" ? true : improves.includes(skillFilter as any);

      const matchesTab =
        tab === "forYou"
          ? true
          : tab === "level"
          ? levelFilter === "any"
            ? true
            : matchesLevel
          : tab === "skills"
          ? skillFilter === "any"
            ? true
            : matchesSkill
          : true;

      return matchesQuery && matchesLevel && matchesSkill && matchesTab;
    });

    const sorted = [...base];

    const byName = (a: Character, b: Character) =>
      a.name[lang].localeCompare(b.name[lang], lang === "es" ? "es" : "en", {
        sensitivity: "base",
      });

    if (tab === "forYou") {
      // ✅ cache de usos para no leer localStorage mil veces
      const usesMap = new Map<string, number>();
      for (const c of sorted) usesMap.set(c.slug, getCharacterUseCount(c.slug));
      const maxUses = Math.max(0, ...sorted.map((c) => usesMap.get(c.slug) ?? 0));

      const scoreFor = (c: Character) => {
        const uses = usesMap.get(c.slug) ?? 0;

        // mezcla "familiar + novedad"
        const useScore = Math.log1p(uses);
        const novelty = 1 / (uses + 1);

        // enfoca tu skill más floja
        const improves = c.improves ?? [];
        const skillBoost = focusSkill && improves.includes(focusSkill as any) ? 1.25 : 0;

        // recomendado para tu nivel
        const recLevels = c.recommendedLevels ?? [];
        const levelBoost = recLevels.includes(playerLevel as any) ? 0.8 : 0;

        return skillBoost + levelBoost + useScore + novelty;
      };

      sorted.sort((a, b) => {
        if (maxUses > 0) {
          const sa = scoreFor(a);
          const sb = scoreFor(b);
          if (sb !== sa) return sb - sa;
          return byName(a, b);
        }

        const sa = scoreFor(a);
        const sb = scoreFor(b);
        if (sb !== sa) return sb - sa;

        const ra = minRecommendedLevelRank(a);
        const rb = minRecommendedLevelRank(b);
        if (ra !== rb) return ra - rb;

        return byName(a, b);
      });
    }

    if (tab === "level") {
      sorted.sort((a, b) => {
        const ra = minRecommendedLevelRank(a);
        const rb = minRecommendedLevelRank(b);
        if (ra !== rb) return ra - rb;
        return byName(a, b);
      });
    }

    if (tab === "skills") {
      const labelBySkill = (sk: SkillKey) =>
        (SKILLS.find((x) => x.key === sk) as any)?.label?.[lang] ?? sk;

      const primarySkillLabel = (c: Character) => {
        if (skillFilter !== "any") return labelBySkill(skillFilter);

        const skills = [...(c.improves ?? [])].sort((s1, s2) =>
          labelBySkill(s1 as SkillKey).localeCompare(
            labelBySkill(s2 as SkillKey),
            lang === "es" ? "es" : "en",
            { sensitivity: "base" }
          )
        );

        return skills[0] ? labelBySkill(skills[0] as SkillKey) : "zzz";
      };

      sorted.sort((a, b) => {
        const la = primarySkillLabel(a);
        const lb = primarySkillLabel(b);
        const cmp = la.localeCompare(lb, lang === "es" ? "es" : "en", {
          sensitivity: "base",
        });
        if (cmp !== 0) return cmp;
        return byName(a, b);
      });
    }

    return sorted;
  }, [lang, q, levelFilter, skillFilter, tab, playerLevel, focusSkill]);

  // options para Select (union: "any" | PlayerLevel)
  const levelOptions = useMemo(() => {
    return [
      {
        value: "any" as const,
        label: lang === "es" ? "Cualquier nivel" : "Any level",
      },
      ...levelsSorted.map((l) => ({
        value: l.key as PlayerLevel,
        label: l.label[lang],
      })),
    ] as Array<{ value: PlayerLevel | "any"; label: string }>;
  }, [levelsSorted, lang]);

  // options para Select (union: "any" | SkillKey)
  const skillOptions = useMemo(() => {
    return [
      {
        value: "any" as const,
        label: lang === "es" ? "Cualquier habilidad" : "Any skill",
      },
      ...skillsSorted.map((s) => ({
        value: s.key as SkillKey,
        label: s.label[lang],
      })),
    ] as Array<{ value: SkillKey | "any"; label: string }>;
  }, [skillsSorted, lang]);

  return (
    <div className="home">
      <div className="home__top">
        <div className="home__titleRow">
          <div className="home__title">{lang === "es" ? "Explorar" : "Explore"}</div>
          <div className="home__dot" aria-hidden />
        </div>

        <div className="search">
          <span className="search__icon" aria-hidden>
            ⌕
          </span>
          <input
            className="search__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "es" ? "Buscar personaje / tag / enfoque…" : "Search character / tag / focus…"}
            autoComplete="off"
          />
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? "tab--active" : ""}`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.label[lang]}
            </button>
          ))}
        </div>

        <div className="filters">
          <div className="filters__group">
            <div className="filters__label">{lang === "es" ? "Nivel del jugador" : "Player level"}</div>

            <Select<PlayerLevel | "any">
              className="filters__select"
              value={levelFilter}
              onChange={(v) => setLevelFilter(v)}
              options={levelOptions}
              placeholder={lang === "es" ? "Selecciona…" : "Select…"}
            />
          </div>

          <div className="filters__group">
            <div className="filters__label">{lang === "es" ? "Habilidad a mejorar" : "Skill to improve"}</div>

            <Select<SkillKey | "any">
              className="filters__select"
              value={skillFilter}
              onChange={(v) => setSkillFilter(v)}
              options={skillOptions}
              placeholder={lang === "es" ? "Selecciona…" : "Select…"}
            />
          </div>

          <button
            className="filters__reset"
            type="button"
            onClick={() => {
              setQ("");
              setLevelFilter("any");
              setSkillFilter("any");
              setTab("forYou");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid">
        {filtered.map((c) => (
          <button
            key={c.id}
            className="card"
            type="button"
            // ✅ FIX: ruta relativa dentro de /app
            // Estando en /app -> "scene?..." => /app/scene?...
            onClick={() => navigate(`scene?char=${encodeURIComponent(c.slug)}`)}
          >
            <img
              className="card__img"
              src={getBustUrl(c.slug)}
              alt={c.name[lang]}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getCoverPlaceholder(c.slug);
              }}
            />
            <div className="card__overlay">
              <div className="card__title">{c.name[lang]}</div>
              <div className="card__desc">{c.blurb[lang]}</div>
              <div className="chips">
                {(c.tags?.[lang] ?? []).slice(0, 4).map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">
          {lang === "es" ? "No hay resultados con esos filtros." : "No results with these filters."}
        </div>
      )}
    </div>
  );
}
