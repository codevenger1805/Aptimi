import type { RolePresetId } from "./types";
import { DEFAULT_SKILL_WEIGHT, DEFAULT_TARGET_LEVEL } from "./types";

export const SKILL_PRESETS: Record<
  Exclude<RolePresetId, "custom">,
  { name: string; skills: string[] }
> = {
  product_manager: {
    name: "Product Manager",
    skills: [
      "Product Thinking",
      "User Research",
      "Communication",
      "Analytics",
      "SQL",
      "Leadership",
      "Problem Solving",
      "Prioritization",
    ],
  },
  software_engineer: {
    name: "Software Engineer",
    skills: [
      "Programming",
      "Data Structures",
      "System Design",
      "Testing",
      "Collaboration",
      "Debugging",
    ],
  },
  data_analyst: {
    name: "Data Analyst",
    skills: [
      "SQL",
      "Spreadsheets",
      "Statistics",
      "Visualization",
      "Communication",
      "Domain Research",
    ],
  },
  ux_designer: {
    name: "UX Designer",
    skills: [
      "User Research",
      "Wireframing",
      "Visual Design",
      "Prototyping",
      "Usability Testing",
      "Communication",
    ],
  },
};

export const ROLE_PRESET_OPTIONS: { id: RolePresetId; name: string }[] = [
  { id: "product_manager", name: "Product Manager" },
  { id: "software_engineer", name: "Software Engineer" },
  { id: "data_analyst", name: "Data Analyst" },
  { id: "ux_designer", name: "UX Designer" },
  { id: "custom", name: "Custom" },
];

export const EDUCATION_OPTIONS: { id: string; name: string }[] = [
  { id: "undergrad_y1", name: "Undergraduate — Year 1" },
  { id: "undergrad_y2", name: "Undergraduate — Year 2" },
  { id: "undergrad_y3", name: "Undergraduate — Year 3" },
  { id: "undergrad_y4", name: "Undergraduate — Year 4" },
  { id: "graduate", name: "Graduate student" },
  { id: "recent_graduate", name: "Recent graduate" },
  { id: "career_switcher", name: "Career switcher" },
  { id: "skipped", name: "Prefer not to say / skip" },
];

export function skillsForPreset(preset: RolePresetId, customNames: string[] = []) {
  if (preset === "custom") {
    const names = customNames.filter((n) => n.trim()).length
      ? customNames.filter((n) => n.trim())
      : ["Skill 1", "Skill 2", "Skill 3"];
    return names.map((name) => ({
      name,
      targetLevel: DEFAULT_TARGET_LEVEL,
      weight: DEFAULT_SKILL_WEIGHT,
    }));
  }
  return SKILL_PRESETS[preset].skills.map((name) => ({
    name,
    targetLevel: DEFAULT_TARGET_LEVEL,
    weight: DEFAULT_SKILL_WEIGHT,
  }));
}
