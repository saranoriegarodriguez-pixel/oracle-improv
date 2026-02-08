export type Lang = "es" | "en";

export type Project = {
  slug: string;
  title: { es: string; en: string };
  tagline: { es: string; en: string };
  year?: string;
  status?: { es: string; en: string };
  tags: string[];

  // media principal (para carrusel)
  cover: {
    kind: "image" | "video";
    src: string; // ruta /media/...
    poster?: string; // para video
  };

  // links opcionales
  links?: Array<{
    label: { es: string; en: string };
    href: string;
  }>;
};

export const PROJECTS: Project[] = [
  {
    slug: "oraculo-improv",
    title: { es: "Oráculo-Improv", en: "Oracle-Improv" },
    tagline: {
      es: "Entrenamiento de improvisación teatral con personajes + Oráculo evaluador.",
      en: "Theatre improv training with characters + an evaluator Oracle.",
    },
    year: "2026",
    status: { es: "Producto / Demo", en: "Product / Demo" },
    tags: ["IA", "UX", "Teatro", "Evaluación", "React"],
    cover: {
      kind: "video",
      src: "/media/oracle-improv/hero.mp4",
      poster: "/media/oracle-improv/screen1.png",
    },
    links: [
      { label: { es: "Abrir demo", en: "Open demo" }, href: "/app/home" },
    ],
  },

  {
    slug: "cotilleos-del-olimpo",
    title: { es: "Cotilleos del Olimpo", en: "Olympus Gossip" },
    tagline: {
      es: "Capítulo piloto con IA: guion, voces y concepto visual.",
      en: "Pilot episode with AI: script, voices and visual concept.",
    },
    year: "2026",
    status: { es: "En desarrollo", en: "In progress" },
    tags: ["ChatGPT", "Sora", "Narrativa", "Dirección"],
    cover: {
      kind: "image",
      src: "/media/cotilleos/cover.png",
    },
  },

  {
    slug: "rv-teatro-de-tus-suenos",
    title: { es: "RV · El teatro de tus sueños", en: "VR · Theatre of Your Dreams" },
    tagline: {
      es: "Experiencia en Unreal Engine 5: demos de un día en pesado.",
      en: "Unreal Engine 5 experience: ‘one-day heavy’ demos.",
    },
    year: "2026",
    status: { es: "Demos", en: "Demos" },
    tags: ["Unreal Engine 5", "VR", "Cinemática", "XR"],
    cover: {
      kind: "image",
      src: "/media/rv/cover.png",
    },
  },
];
