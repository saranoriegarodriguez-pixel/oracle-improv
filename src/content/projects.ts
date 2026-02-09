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
    src: string; // ruta desde /public
    poster?: string;
  };

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
      es: "Entrenamiento de improvisación teatral con personajes y un Oráculo evaluador.",
      en: "Improv theatre training with characters and an evaluator Oracle.",
    },
    year: "2026",
    status: { es: "Producto / Demo", en: "Product / Demo" },
    tags: ["IA", "UX", "Teatro", "Evaluación", "React"],

    // 👉 imagen 1 del carrusel
    cover: {
      kind: "image",
      src: "/media/carousel/carousel-01.jpg",
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
    tags: ["Narrativa", "IA", "Dirección", "Mitología"],

    // 👉 imagen 2 del carrusel
    cover: {
      kind: "image",
      src: "/media/carousel/carousel-02.jpg",
    },
  },

  {
    slug: "rv-teatro-de-tus-suenos",
    title: { es: "RV · El teatro de tus sueños", en: "VR · Theatre of Your Dreams" },
    tagline: {
      es: "Experiencia inmersiva en Unreal Engine 5 sobre el teatro clásico.",
      en: "Immersive Unreal Engine 5 experience about classical theatre.",
    },
    year: "2026",
    status: { es: "Demos", en: "Demos" },
    tags: ["Unreal Engine 5", "VR", "XR", "Cinemática"],

    // 👉 imagen 3 del carrusel
    cover: {
      kind: "image",
      src: "/media/carousel/carousel-03.jpg",
    },
  },
];
