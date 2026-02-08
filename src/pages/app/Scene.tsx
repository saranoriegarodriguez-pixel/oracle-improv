// src/pages/Scene.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CHARACTERS } from "../../../shared/data/characters";
import type { PlayerLevel } from "../../../shared/types";

import { useAppSettings } from "../../state/appSettings";
import Select from "../../components/Select";


import "./Scene.css";

/** ✅ Exercises */
type ExerciseId = `E${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

const EXERCISES: { id: ExerciseId; name: string }[] = Array.from({ length: 12 }, (_, i) => {
  const id = `E${i + 1}` as ExerciseId;
  return { id, name: id };
});

/** ✅ Mode (sin oráculo) */
type ModeKey = "train" | "scene" | "trial";

const LEVEL_TO_MAX_E: Record<PlayerLevel, number> = {
  apprentice: 3,
  performer: 6,
  tragicHero: 9,
  presentChorus: 12,
};

/** ✅ character.slug -> ejercicios permitidos (3 por personaje) */
const CHARACTER_ALLOWED: Record<string, ExerciseId[]> = {
  athena: ["E1", "E5", "E12"],
  dionysus: ["E2", "E9", "E10"],
  hermes: ["E8", "E6", "E3"],
  hera: ["E4", "E11", "E5"],
  apollo: ["E7", "E1", "E12"],
  medusa: ["E11", "E4", "E3"],
  minotaur: ["E9", "E5", "E2"],
  sirena: ["E11", "E6", "E3"],
  cerbero: ["E9", "E10", "E12"],
  sphinx: ["E7", "E5", "E1"],
};

export default function Scene() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const charSlug = (params.get("char") ?? "").trim();

  const { st } = useAppSettings() as any;
  const lang = (st.lang ?? "es") as "es" | "en";
  const level = (st.level ?? "apprentice") as PlayerLevel;

  // ✅ Master flag
  const master = Boolean(st.master);

  const character = useMemo(() => {
    if (!charSlug) return null;
    return CHARACTERS.find((c) => c.slug === charSlug) ?? null;
  }, [charSlug]);

  /** ✅ Ejercicios permitidos = (por personaje) ∩ (por nivel), master desbloquea */
  const allowedExercises = useMemo(() => {
    if (!character) return EXERCISES;

    // 1) por nivel
    const max = LEVEL_TO_MAX_E[level] ?? 3;
    const byLevel = EXERCISES.filter((ex) => Number(ex.id.replace("E", "")) <= max);

    if (master) return byLevel; // master: ignora personaje

    // 2) por personaje
    const byChar = CHARACTER_ALLOWED[character.slug];
    if (!byChar?.length) return byLevel;

    const setChar = new Set(byChar);
    const out = byLevel.filter((ex) => setChar.has(ex.id));

    // fallback por si queda vacío
    return out.length ? out : byLevel;
  }, [character, level, master]);

  const [exerciseId, setExerciseId] = useState<ExerciseId>(
    (allowedExercises[0]?.id ?? "E1") as ExerciseId
  );
  const [mode, setMode] = useState<ModeKey | null>(null);

  useEffect(() => {
    // ✅ si cambian los ejercicios permitidos (nivel/master/personaje), ajusta selección
    if (!allowedExercises.some((ex) => ex.id === exerciseId)) {
      setExerciseId((allowedExercises[0]?.id ?? "E1") as ExerciseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedExercises.map((x) => x.id).join("|")]);

  if (!character) {
    return (
      <div className="scene">
        <div className="scene__wrap">
          <p className="scene__hint">
            {lang === "es"
              ? "No hay personaje seleccionado. Vuelve a la app y elige uno."
              : "No character selected. Go back to the app and pick one."}
          </p>

          {/* ✅ importante: volver a /app, no "/" */}
          <button className="btn btn--primary" onClick={() => navigate("/app")}>
            {lang === "es" ? "Ir a la app" : "Go to app"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scene">
      <div className="scene__wrap">
        <p className="scene__subtitle">
          {lang === "es" ? "Personaje" : "Character"}:{" "}
          <strong>{character.name[lang]}</strong>
          {master ? (
            <span style={{ marginLeft: 10, opacity: 0.85, fontWeight: 900 }}>MASTER</span>
          ) : null}
        </p>

        {/* Paso 1: ejercicio */}
        <section className="panel">
          <div className="row row--end">
            <div className="field">
              <Select
                label={lang === "es" ? "Ejercicio" : "Exercise"}
                value={exerciseId as any}
                onChange={(v) => setExerciseId(String(v) as ExerciseId)}
                options={allowedExercises.map((ex) => ({
                  value: ex.id,
                  label: ex.name,
                }))}
              />
            </div>

            <div className="meta">
              <div>
                {lang === "es" ? "Elegiste" : "Selected"}: <strong>{exerciseId}</strong>
              </div>
              <div className="meta__sub">
                {lang === "es" ? "Nivel actual" : "Current level"}: <strong>{level}</strong>
                {master ? (
                  <span style={{ marginLeft: 8, opacity: 0.85 }}>
                    ({lang === "es" ? "sin límite" : "unlocked"})
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Paso 2: modo */}
        <section className="scene__section">
          <h2 className="scene__sectionTitle">{lang === "es" ? "Modo" : "Mode"}</h2>

          <div className="modeGrid">
            <ModeCard
              active={mode === "train"}
              title={lang === "es" ? "Entrenar" : "Train"}
              text={
                lang === "es"
                  ? "Más guiado, para practicar sin presión."
                  : "More guided, practice without pressure."
              }
              onClick={() => setMode("train")}
            />
            <ModeCard
              active={mode === "scene"}
              title={lang === "es" ? "Escena" : "Scene"}
              text={
                lang === "es"
                  ? "Impro real: avanza la escena con el personaje."
                  : "Real improv: advance the scene with the character."
              }
              onClick={() => setMode("scene")}
            />
            <ModeCard
              active={mode === "trial"}
              title={lang === "es" ? "Reto" : "Trial"}
              text={
                lang === "es"
                  ? "Más intenso, menos ayudas, más riesgo."
                  : "More intense, fewer hints, more risk."
              }
              onClick={() => setMode("trial")}
            />
          </div>

          <div className="panel panel--result">
            <div className="small">
              {lang === "es"
                ? "Se abrirá la sesión con este personaje y este modo."
                : "Session will start with this character and mode."}
            </div>

            {mode ? (
              <>
                <div className="resultText" style={{ whiteSpace: "pre-wrap" }}>
                  <div style={{ opacity: 0.8, marginBottom: 6 }}>
                    {lang === "es" ? "Saludo:" : "Greeting:"}
                  </div>
                  <strong>{character.greeting[lang]}</strong>
                </div>

                <div className="actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => {
                      // Guardado opcional “resume”
                      const payload = {
                        char: character.slug,
                        exerciseId,
                        mode,
                        level,
                        ts: Date.now(),
                      };
                      localStorage.setItem("app.lastSceneSetup", JSON.stringify(payload));

                      // ✅ CLAVE: ir a /app/session (o ruta relativa)
                      navigate(
                        `/app/session?char=${encodeURIComponent(character.slug)}&exercise=${encodeURIComponent(
                          exerciseId
                        )}&mode=${encodeURIComponent(mode)}`
                      );
                      // alternativa relativa (también vale):
                      // navigate(`../session?char=${...}&exercise=${...}&mode=${...}`);
                    }}
                  >
                    {lang === "es" ? "Empezar" : "Start"}
                  </button>

                  <button className="btn btn--ghost" type="button" onClick={() => setMode(null)}>
                    {lang === "es" ? "Cambiar modo" : "Change mode"}
                  </button>
                </div>
              </>
            ) : (
              <div className="muted">
                {lang === "es" ? "Elige Entrenar, Escena o Reto." : "Pick Train, Scene, or Trial."}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ModeCard(props: { title: string; text: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`modeCard ${props.active ? "modeCard--active" : ""}`}
    >
      <div className="modeCard__title">{props.title}</div>
      <div className="modeCard__text">{props.text}</div>
    </button>
  );
}
