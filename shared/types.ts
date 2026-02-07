// shared/types.ts

export type Locale = "es" | "en";

export type PlayerLevel =
  | "apprentice"
  | "performer"
  | "tragicHero"
  | "presentChorus";

export type SkillKey =
  | "clarity"
  | "desire"
  | "listening"
  | "status"
  | "ending";

export type Lang = "es" | "en";
export type Character = {
  id: string;
  slug: string;
  name: Record<Lang, string>;
  tags: Record<Lang, string[]>;
  blurb: Record<Lang, string>;

  recommendedLevels: PlayerLevel[];
  improves: SkillKey[];

  prompt: Record<Lang, string>;
  greeting: Record<Lang, string>;
  styleRules?: Record<Lang, string[]>;
};
