export type SkillCategory = {
  title: string;
  coreTools?: string[];
  alsoExplored?: string[];
  core?: string[];
  more?: string[];
  description?: string;
  icon?: string;
  order?: number;
  visible?: boolean;
};

export function deriveFlatSkills(categories: SkillCategory[]) {
  return Object.fromEntries(categories.map((category) => {
    const tools = [...(category.coreTools ?? category.core ?? []), ...(category.alsoExplored ?? category.more ?? [])];
    return [category.title, Array.from(new Set(tools.map((name) => name.trim()).filter(Boolean))).map((name) => ({ name, years: 0 }))];
  }));
}
