import { create } from "zustand";
import {
  bootstrapProfile,
  getSettings,
  putProfile,
  putSettings,
  repos,
} from "../data/repositories";
import { ensureMigrated } from "../data/migrations";
import type {
  AiUsage,
  AppSettings,
  FocusSession,
  InAppNotification,
  Milestone,
  Note,
  Opportunity,
  OpportunityStatusEvent,
  PersonalTodo,
  Profile,
  Reminder,
  RewardLedgerEntry,
  RoadmapPhase,
  RoadmapTask,
  Skill,
  Whiteboard,
} from "../domain/types";

export interface AppState {
  ready: boolean;
  error?: string;
  profile?: Profile;
  settings?: AppSettings;
  skills: Skill[];
  phases: RoadmapPhase[];
  milestones: Milestone[];
  tasks: RoadmapTask[];
  focusSessions: FocusSession[];
  opportunities: Opportunity[];
  opportunityEvents: OpportunityStatusEvent[];
  notes: Note[];
  whiteboards: Whiteboard[];
  todos: PersonalTodo[];
  reminders: Reminder[];
  notifications: InAppNotification[];
  rewards: RewardLedgerEntry[];
  aiUsage: AiUsage[];
  toast?: string;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  setToast: (msg?: string) => void;
  saveProfile: (p: Profile) => Promise<void>;
  saveSettings: (s: AppSettings) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  skills: [],
  phases: [],
  milestones: [],
  tasks: [],
  focusSessions: [],
  opportunities: [],
  opportunityEvents: [],
  notes: [],
  whiteboards: [],
  todos: [],
  reminders: [],
  notifications: [],
  rewards: [],
  aiUsage: [],
  setToast: (toast) => set({ toast }),
  load: async () => {
    const migrated = await ensureMigrated();
    if (!migrated.ok) {
      set({ ready: true, error: migrated.message });
      return;
    }
    const profile = await bootstrapProfile();
    await get().refresh();
    set({ ready: true, profile });
  },
  refresh: async () => {
    const profile = await bootstrapProfile();
    const settings = await getSettings();
    const pid = profile.id;
    const [
      skills,
      phases,
      milestones,
      tasks,
      focusSessions,
      opportunities,
      opportunityEvents,
      notes,
      whiteboards,
      todos,
      reminders,
      notifications,
      rewards,
      aiUsage,
    ] = await Promise.all([
      repos.skills.list(pid),
      repos.phases.list(pid),
      repos.milestones.list(pid),
      repos.tasks.list(pid),
      repos.focus.list(pid),
      repos.opportunities.list(pid),
      repos.opportunityEvents.listAll(),
      repos.notes.list(pid),
      repos.whiteboards.list(pid),
      repos.todos.list(pid),
      repos.reminders.list(pid),
      repos.notifications.list(pid),
      repos.rewards.list(pid),
      repos.aiUsage.list(pid),
    ]);
    set({
      profile,
      settings,
      skills,
      phases,
      milestones,
      tasks,
      focusSessions,
      opportunities,
      opportunityEvents,
      notes,
      whiteboards,
      todos,
      reminders,
      notifications,
      rewards,
      aiUsage,
    });
  },
  saveProfile: async (profile) => {
    await putProfile({ ...profile, updatedAt: new Date().toISOString() });
    await get().refresh();
  },
  saveSettings: async (settings) => {
    await putSettings(settings);
    await get().refresh();
  },
}));
