// src/pages/portfolio/projectsData.ts
// ✅ TODO media en /public → rutas ABSOLUTAS "/media/..." (cero imports)

export type Lang = "es" | "en";

export type Project = {
  slug: string;
  title: { es: string; en: string };
  tagline: { es: string; en: string };

  // ✅ cover en public
  cover: string;

  // Página detalle
  description: { es: string; en: string };

  // ✅ obligatorio (evita TS18048)
  sections: Array<{
    title: { es: string; en: string };
    body: { es: string; en: string };
  }>;

  // Media extra (rutas en public)
  gallery?: string[];

  // Híbrido: YouTube/Vimeo o MP4 en public
  videos?: Array<{
    title: { es: string; en: string };
    url: string;     // puede ser "https://..." o "/media/.../demo.mp4"
    thumb?: string;  // opcional (si no, YouTube se autogenera en ProjectPage)
  }>;

  demo: Array<{
    label: { es: string; en: string };
    url: string; // "/app" o "https://..."
    kind: "app" | "demo" | "repo" | "doc";
  }>;
};

// ✅ Covers en public (NO imports)
const coverOracle = "/media/portfolio/work/work-oraculo.png";
const coverCotilleos = "/media/portfolio/work/work-cotilleos.png";
const coverRV = "/media/portfolio/work/work-rv.png";

/**
 * PROJECTS
 * - Oracle-Improv: la app está dentro de esta web → demo url "/app"
 * - Cotilleos: página de proyecto (fotos/vídeos/demos cuando los tengas)
 * - RV: lo mismo
 */
export const PROJECTS: Project[] = [
  {
    slug: "oraculo-improv",
    title: { es: "Oracle-Improv", en: "Oracle-Improv" },
    tagline: {
      es: "Entrenamiento de improvisación teatral con personajes y Oráculo evaluador.",
      en: "Theatre improv training with characters + an evaluator Oracle.",
    },
    cover: coverOracle,
    description: {
      es: "Oracle-Improv es una app para entrenar impro teatral con IA: personajes que te ponen escenas y un Oráculo que analiza tu sesión con feedback medible.",
      en: "Oracle-Improv is an app to train theatre improv with AI: characters run scenes and an Oracle evaluates your session with measurable feedback.",
    },
    sections: [
      {
        title: { es: "Qué aporta", en: "What it brings" },
        body: {
          es: "Separación clara entre conversación (personajes) y evaluación (Oráculo), progreso por habilidades y feedback accionable.",
          en: "Clear separation between conversation (characters) and evaluation (Oracle), skill progress and actionable feedback.",
        },
      },
      {
        title: { es: "Stack", en: "Stack" },
        body: {
          es: "React + TypeScript, Express/Node, evaluación estructurada (Oráculo) y control de proveedor (OpenAI/Ollama).",
          en: "React + TypeScript, Express/Node, structured evaluation (Oracle), provider control (OpenAI/Ollama).",
        },
      },
    ],

    // ✅ (opcional) capturas extra en public
    // Crea: public/media/portfolio/projects/oraculo-improv/gallery/01.png etc.
    gallery: [
      // "/media/portfolio/projects/oraculo-improv/gallery/01.png",
      // "/media/portfolio/projects/oraculo-improv/gallery/02.png",
    ],

    // ✅ vídeos: YouTube/Vimeo o MP4 en public
    videos: [
      // YouTube:
      // { title: { es: "Demo", en: "Demo" }, url: "https://www.youtube.com/watch?v=XXXXXXXXXXX" },

      // MP4 en public:
      // Guarda: public/media/portfolio/projects/oraculo-improv/videos/demo.mp4
      // { title: { es: "Demo (MP4)", en: "Demo (MP4)" }, url: "/media/portfolio/projects/oraculo-improv/videos/demo.mp4", thumb: "/media/portfolio/projects/oraculo-improv/videos/demo_thumb.png" },
    ],

    demo: [
      { label: { es: "Abrir app", en: "Open app" }, url: "/app", kind: "app" },

      // Si luego tienes repo/docs:
      // { label: { es: "Repositorio", en: "Repository" }, url: "https://github.com/...", kind: "repo" },
      // { label: { es: "Documento", en: "Doc" }, url: "/media/portfolio/projects/oraculo-improv/docs/onepager.pdf", kind: "doc" },
    ],
  },

  {
    slug: "cotilleos-del-olimpo",
    title: { es: "Cotilleos del Olimpo", en: "Olympus Gossip" },
    tagline: {
      es: "Serie narrativa: mito, ironía y humanidad con estética propia.",
      en: "Narrative series: myth, irony and humanity with a distinct aesthetic.",
    },
    cover: coverCotilleos,
    description: {
      es: "Una serie donde lo mítico baja al barro de lo cotidiano. Personajes con máscara, deseo y consecuencias.",
      en: "A series where myth descends into the everyday. Characters with masks, desire and consequences.",
    },
    sections: [
      {
        title: { es: "Estado", en: "Status" },
        body: { es: "Próximamente.", en: "Coming soon." },
      },
      {
        title: { es: "Formato", en: "Format" },
        body: {
          es: "Episodios, piezas visuales y expansión transmedia (cuando esté lista).",
          en: "Episodes, visual pieces and transmedia expansion (when ready).",
        },
      },
    ],

    // ✅ crea: public/media/portfolio/projects/cotilleos-del-olimpo/gallery/01.png etc.
    gallery: [
      // "/media/portfolio/projects/cotilleos-del-olimpo/gallery/01.png",
    ],

    videos: [
      // { title: { es: "Teaser", en: "Teaser" }, url: "https://www.youtube.com/watch?v=..." },
    ],

    demo: [
      // por ahora placeholder
      { label: { es: "Próximamente", en: "Coming soon" }, url: "#", kind: "doc" },
    ],
  },

  {
    slug: "rv-monta-tu-teatro",
    title: { es: "RV: Monta tu Teatro", en: "VR: Build Your Theatre" },
    tagline: {
      es: "Experiencia inmersiva para crear escena, espacio y ritmo en VR.",
      en: "Immersive experience to build scene, space and rhythm in VR.",
    },
    cover: coverRV,
    description: {
      es: "Proyecto VR centrado en dirección escénica: componer, ensayar y explorar la puesta en escena en un entorno inmersivo.",
      en: "A VR project focused on stage direction: composing, rehearsing and exploring mise-en-scène in an immersive space.",
    },
    sections: [
      {
        title: { es: "Estado", en: "Status" },
        body: { es: "Próximamente.", en: "Coming soon." },
      },
      {
        title: { es: "Objetivo", en: "Goal" },
        body: {
          es: "Herramienta/experiencia para diseñar escenas y bloquear movimiento en un teatro virtual.",
          en: "A tool/experience to design scenes and block movement in a virtual theatre.",
        },
      },
    ],

    // ✅ crea: public/media/portfolio/projects/rv-monta-tu-teatro/gallery/01.png etc.
    gallery: [
      // "/media/portfolio/projects/rv-monta-tu-teatro/gallery/01.png",
    ],

    videos: [
      // { title: { es: "Walkthrough", en: "Walkthrough" }, url: "https://vimeo.com/..." },
    ],

    demo: [
      { label: { es: "Próximamente", en: "Coming soon" }, url: "#", kind: "demo" },
    ],
  },
];
