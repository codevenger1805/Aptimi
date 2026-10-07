import type {
  Milestone,
  Profile,
  RoadmapPhase,
  RoadmapTask,
  RolePresetId,
  Skill,
} from "./types";
import { skillGap } from "./readiness";
import { insertAt } from "./ordering";

export interface GeneratedRoadmap {
  phases: RoadmapPhase[];
  milestones: Milestone[];
  tasks: RoadmapTask[];
}

interface MilestoneTemplate {
  title: string;
  objective: string;
  difficulty: "Foundation" | "Practice" | "Evidence" | "Interview";
  actions: string[];
  prerequisites?: string[];
}

interface PhaseTemplate {
  title: string;
  description: string;
  milestones: MilestoneTemplate[];
}

const TEMPLATES: Record<Exclude<RolePresetId, "custom">, PhaseTemplate[]> = {
  product_manager: [
    {
      title: "01 — PM Foundations",
      description: "Understand the role, users, lifecycle, and beginner product thinking.",
      milestones: [
        {
          title: "Understand the PM role",
          objective: "Explain what a PM owns vs engineering and design in an internship setting.",
          difficulty: "Foundation",
          actions: ["Read one beginner PM role overview", "Write five sentences on PM vs adjacent roles", "Save the note as evidence"],
        },
        {
          title: "Learn the product lifecycle",
          objective: "Map discovery → delivery → iteration for a familiar campus product.",
          difficulty: "Foundation",
          actions: ["Sketch a lifecycle for one app you use", "Label where evidence is missing"],
          prerequisites: ["Understand the PM role"],
        },
        {
          title: "Understand Product Metrics",
          objective: "Define activation, retention, and a north-star metric for a simple product.",
          difficulty: "Foundation",
          actions: [
            "Learn what DAU, MAU, and retention describe",
            "Choose one product and name its activation event",
            "Write three metric questions a PM intern could answer",
          ],
          prerequisites: ["Learn the product lifecycle"],
        },
        {
          title: "Complete a beginner product teardown",
          objective: "Describe users, jobs-to-be-done, and one improvement with a reason.",
          difficulty: "Practice",
          actions: ["Pick a consumer app", "Capture screens and user jobs", "Propose one change tied to a metric"],
          prerequisites: ["Understand Product Metrics"],
        },
      ],
    },
    {
      title: "02 — Product Discovery",
      description: "Learn research, problems, journeys, and beginner PRDs.",
      milestones: [
        {
          title: "Learn user research",
          objective: "Distinguish interviews, surveys, and observation — and when each is enough.",
          difficulty: "Foundation",
          actions: ["Write when you would interview vs survey", "Draft five interview questions"],
        },
        {
          title: "Conduct beginner interviews",
          objective: "Complete three short interviews and record recurring problems.",
          difficulty: "Practice",
          actions: ["Conduct interview 1", "Conduct two more interviews", "List recurring problems"],
          prerequisites: ["Learn user research"],
        },
        {
          title: "Write a beginner PRD",
          objective: "Turn one problem statement into a scoped intern-sized PRD.",
          difficulty: "Evidence",
          actions: ["Write the problem statement", "List goals and non-goals", "Define success metrics"],
          prerequisites: ["Conduct beginner interviews"],
        },
      ],
    },
    {
      title: "03 — Product Analytics",
      description: "Funnels, retention, experiments, and SQL applied to a product question.",
      milestones: [
        {
          title: "Understand funnels and retention",
          objective: "Explain a funnel drop-off and what retention would change about the product.",
          difficulty: "Foundation",
          actions: ["Draw a three-step funnel", "Write one retention hypothesis"],
        },
        {
          title: "Learn SQL fundamentals",
          objective: "Write SELECT, WHERE, and GROUP BY queries on a small dataset.",
          difficulty: "Practice",
          actions: ["Practice SELECT and filters", "Practice aggregation", "Answer one product question with SQL"],
        },
        {
          title: "Analyze a small dataset",
          objective: "Publish a short write-up answering a product question with evidence.",
          difficulty: "Evidence",
          actions: ["Choose a public dataset", "Compute two metrics", "Write the product implication"],
          prerequisites: ["Learn SQL fundamentals"],
        },
      ],
    },
    {
      title: "04 — Product Evidence",
      description: "Case studies, portfolio, resume, and a public professional profile.",
      milestones: [
        {
          title: "Create a product case study",
          objective: "Document problem, approach, insight, and what you would measure.",
          difficulty: "Evidence",
          actions: ["Outline the case", "Add screenshots or diagrams", "Write a one-page narrative"],
        },
        {
          title: "Improve resume and profile",
          objective: "Translate completed work into role-aligned bullets.",
          difficulty: "Evidence",
          actions: ["Rewrite three bullets with evidence", "Align headline to the target intern role"],
        },
      ],
    },
    {
      title: "05 — Internship Readiness",
      description: "Practice interviews, submit targeted applications, and review feedback.",
      milestones: [
        {
          title: "Practice product sense questions",
          objective: "Answer two intern-level product sense prompts with a structure.",
          difficulty: "Interview",
          actions: ["Pick two prompts", "Time-box answers", "Record gaps to study"],
        },
        {
          title: "Submit targeted applications",
          objective: "Move saved roles into Applied with a next follow-up date.",
          difficulty: "Interview",
          actions: ["Shortlist three roles", "Submit two applications", "Log them in Internship Tracker"],
        },
      ],
    },
  ],
  software_engineer: [
    {
      title: "Programming foundations",
      description: "Strengthen implementation fluency.",
      milestones: [
        {
          title: "Complete a small project in your main language",
          objective: "Build and test a runnable program demonstrating idiomatic language patterns.",
          difficulty: "Foundation",
          actions: ["Choose an open problem", "Write tests and core logic", "Publish runnable code"],
        },
      ],
    },
    {
      title: "Data structures and problem solving",
      description: "Practice core CS skills used in internships.",
      milestones: [
        {
          title: "Work a weekly problem set",
          objective: "Solve 5 data structure problems with time and space complexity explanations.",
          difficulty: "Practice",
          actions: ["Complete 5 targeted algorithm problems", "Write complexity reflections"],
        },
      ],
    },
    {
      title: "Testing and debugging",
      description: "Ship reliable changes.",
      milestones: [
        {
          title: "Add tests to a personal project",
          objective: "Achieve meaningful unit test coverage on a core repository.",
          difficulty: "Practice",
          actions: ["Add unit tests", "Set up automated test run"],
        },
      ],
    },
    {
      title: "Collaborative engineering",
      description: "Use git and code review habits.",
      milestones: [
        {
          title: "Publish a documented repository",
          objective: "Document setup, design decisions, and trade-offs in a clear README.",
          difficulty: "Evidence",
          actions: ["Write detailed README", "Add architecture diagram", "Tag release version"],
        },
      ],
    },
    {
      title: "Resume and applications",
      description: "Apply with evidence of shipped work.",
      milestones: [
        {
          title: "Align resume to intern role",
          objective: "Refine bullet points focusing on impact and technical stack.",
          difficulty: "Interview",
          actions: ["Tailor resume bullets with metric results", "Review with a peer"],
        },
        {
          title: "Submit targeted applications",
          objective: "Submit applications to 3 software engineering internships.",
          difficulty: "Interview",
          actions: ["Shortlist roles", "Submit applications", "Track in pipeline"],
        },
      ],
    },
  ],
  data_analyst: [
    {
      title: "SQL and spreadsheets",
      description: "Query and clean data independently.",
      milestones: [
        {
          title: "Complete a SQL practice set",
          objective: "Write multi-table joins, window functions, and aggregations.",
          difficulty: "Foundation",
          actions: ["Solve 10 SQL queries", "Document sample queries"],
        },
      ],
    },
    {
      title: "Statistics for analysis",
      description: "Choose honest summaries.",
      milestones: [
        {
          title: "Analyze a public dataset",
          objective: "Conduct exploratory data analysis and spot anomalies.",
          difficulty: "Practice",
          actions: ["Select public dataset", "Perform summary statistics", "Note observations"],
        },
      ],
    },
    {
      title: "Visualization and communication",
      description: "Tell a clear data story.",
      milestones: [
        {
          title: "Build a dashboard or report",
          objective: "Create an interactive visual dashboard answering a business query.",
          difficulty: "Evidence",
          actions: ["Design dashboard mock", "Build charts", "Write executive summary"],
        },
      ],
    },
    {
      title: "Portfolio and resume",
      description: "Show analysis that answers a question.",
      milestones: [
        {
          title: "Publish one analysis write-up",
          objective: "Publish a clear data case study linking data to business decisions.",
          difficulty: "Evidence",
          actions: ["Write findings writeup", "Upload as evidence artifact"],
        },
      ],
    },
    {
      title: "Internship Applications",
      description: "Apply with a focused story.",
      milestones: [
        {
          title: "Submit targeted applications",
          objective: "Apply to 3 data analyst internships with tailored portfolio links.",
          difficulty: "Interview",
          actions: ["Identify 3 roles", "Submit applications", "Log in pipeline"],
        },
      ],
    },
  ],
  ux_designer: [
    {
      title: "User research basics",
      description: "Learn from people, not assumptions.",
      milestones: [
        {
          title: "Run a small research interview set",
          objective: "Interview 3 users on a friction-heavy workflow.",
          difficulty: "Foundation",
          actions: ["Draft interview guide", "Conduct 3 interviews", "Synthesize findings"],
        },
      ],
    },
    {
      title: "Wireframing and flows",
      description: "Map problems into screens.",
      milestones: [
        {
          title: "Design a core user flow",
          objective: "Create low-fidelity wireframes resolving key user pain points.",
          difficulty: "Practice",
          actions: ["Map user flow", "Sketch 5 core wireframe screens"],
        },
      ],
    },
    {
      title: "Prototyping and testing",
      description: "Validate with usability checks.",
      milestones: [
        {
          title: "Test a prototype with three users",
          objective: "Run usability tests on an interactive Figma prototype.",
          difficulty: "Practice",
          actions: ["Build interactive prototype", "Test with 3 users", "Log feedback"],
        },
      ],
    },
    {
      title: "Portfolio development",
      description: "Document process, not only visuals.",
      milestones: [
        {
          title: "Write one case-study narrative",
          objective: "Author a comprehensive case study documenting research to final design.",
          difficulty: "Evidence",
          actions: ["Write problem statement", "Include iteration screenshots", "Publish case study"],
        },
      ],
    },
    {
      title: "Internship Applications",
      description: "Apply with a focused portfolio.",
      milestones: [
        {
          title: "Submit targeted applications",
          objective: "Apply to 3 product design internship postings.",
          difficulty: "Interview",
          actions: ["Review portfolio links", "Submit applications", "Track status in APTIMI"],
        },
      ],
    },
  ],
};

function customTemplate(role: string): PhaseTemplate[] {
  return [
    {
      title: `Foundations for ${role || "your target role"}`,
      description: "Build the skills you rated as gaps.",
      milestones: [
        {
          title: "Define learning sources",
          objective: "Curate top 3 industry resources and textbooks for your target role.",
          difficulty: "Foundation",
          actions: ["List resources", "Set weekly reading target"],
        },
        {
          title: "Complete an introductory project",
          objective: "Build a starter project demonstrating core capabilities.",
          difficulty: "Practice",
          actions: ["Define scope", "Execute starter project"],
        },
      ],
    },
    {
      title: "Practice and evidence",
      description: "Turn study into artifacts.",
      milestones: [
        {
          title: "Ship a portfolio artifact",
          objective: "Complete a standalone artifact demonstrating hands-on execution.",
          difficulty: "Evidence",
          actions: ["Build artifact", "Save summary and link in evidence"],
        },
      ],
    },
    {
      title: "Resume Optimization",
      description: "Make the work visible.",
      milestones: [
        {
          title: "Revise resume for the target role",
          objective: "Align resume bullets with demonstrable project outcomes.",
          difficulty: "Interview",
          actions: ["Update resume bullets", "Run JD analysis in APTIMI"],
        },
      ],
    },
    {
      title: "Internship Applications",
      description: "Apply with a clear story.",
      milestones: [
        {
          title: "Submit targeted applications",
          objective: "Submit targeted applications with proof of execution.",
          difficulty: "Interview",
          actions: ["Shortlist companies", "Submit applications", "Track deadlines"],
        },
      ],
    },
  ];
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateRoadmap(input: {
  profile: Profile;
  skills: Skill[];
  now?: Date;
  idFactory?: () => string;
}): GeneratedRoadmap {
  const now = input.now ?? new Date();
  const id = input.idFactory ?? (() => crypto.randomUUID());
  const start = now.toISOString().slice(0, 10);
  const end = input.profile.targetDate.slice(0, 10);
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  const totalDays = Math.max(
    28,
    Math.round((endMs - startMs) / 86400000) || 28,
  );
  const preset = input.profile.rolePresetId;
  const rawTemplates =
    preset === "custom"
      ? customTemplate(input.profile.targetRole)
      : TEMPLATES[preset] ?? TEMPLATES.product_manager;

  const gapped = [...input.skills]
    .map((s) => ({ skill: s, gap: skillGap(s) ?? 2 }))
    .sort((a, b) => b.gap - a.gap)
    .map((x) => x.skill);

  const phases: RoadmapPhase[] = [];
  const milestones: Milestone[] = [];
  const tasks: RoadmapTask[] = [];
  const slice = totalDays / rawTemplates.length;

  rawTemplates.forEach((tpl: any, i: number) => {
    const phaseStart = addDays(start, Math.round(i * slice));
    const phaseEnd = addDays(start, Math.round((i + 1) * slice));
    const related = i < 2 ? gapped.slice(0, 3).map((s) => s.id) : [];
    const gapNote =
      related.length > 0
        ? ` Focus first on: ${gapped
            .slice(0, 3)
            .map((s) => s.name)
            .join(", ")}.`
        : "";
    const phaseId = id();
    phases.push({
      id: phaseId,
      profileId: input.profile.id,
      title: tpl.title,
      description: (tpl.description || "") + gapNote,
      order: i,
      startDate: phaseStart,
      endDate: phaseEnd,
    });

    const msList: any[] = tpl.milestones ?? (tpl.milestoneTitles ? tpl.milestoneTitles.map((t: string) => ({ title: t, actions: [`Work on: ${t}`] })) : []);

    msList.forEach((msItem: any, mi: number) => {
      const msTitle = typeof msItem === "string" ? msItem : msItem.title;
      const msObjective = typeof msItem === "object" ? msItem.objective : undefined;
      const msDifficulty = typeof msItem === "object" ? msItem.difficulty : "Practice";
      const msActions: string[] = typeof msItem === "object" && Array.isArray(msItem.actions) ? msItem.actions : [`Work on: ${msTitle}`];
      const msPrereqs: string[] | undefined = typeof msItem === "object" ? msItem.prerequisites : undefined;

      const msId = id();
      const targetDate = addDays(
        phaseStart,
        Math.round(((mi + 1) / (msList.length + 1)) * slice),
      );
      milestones.push({
        id: msId,
        profileId: input.profile.id,
        phaseId,
        title: msTitle,
        description: tpl.description,
        objective: msObjective,
        difficulty: msDifficulty,
        prerequisiteTitles: msPrereqs,
        relatedSkillIds: related,
        order: mi,
        targetDate,
        status: "not_started",
        isCustom: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      msActions.forEach((actionText: string, ai: number) => {
        const taskId = id();
        tasks.push({
          id: taskId,
          profileId: input.profile.id,
          milestoneId: msId,
          title: actionText,
          order: ai,
          priority: ai === 0 ? "High" : "Medium",
          dueAt: `${targetDate}T17:00:00.000Z`,
          status: "pending",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      });
    });
  });

  return { phases, milestones, tasks };
}

export function mergeRegeneratedRoadmap(
  existing: GeneratedRoadmap,
  next: GeneratedRoadmap,
): GeneratedRoadmap {
  const completedMilestones = existing.milestones.filter(
    (m) => m.status === "completed" || m.isCustom,
  );
  const completedTasks = existing.tasks.filter(
    (t) => t.status === "completed" || existing.milestones.find((m) => m.id === t.milestoneId)?.isCustom,
  );
  return {
    phases: next.phases,
    milestones: [...next.milestones, ...completedMilestones],
    tasks: [...next.tasks, ...completedTasks],
  };
}

export function insertMilestoneBetween(
  milestones: Milestone[],
  newMilestone: Milestone,
  afterOrder: number,
): Milestone[] {
  return insertAt(milestones, newMilestone, afterOrder + 1);
}

