import { create } from 'zustand';
import { exampleProjects, type ExampleProject } from '../data/examples';
import { DIFFICULTY_META_VI } from '../data/examplesVi';
import { getClassCurriculum, getClassProgress } from '../data/classCurriculum';
import { useAuthStore } from './useAuthStore';

const STORAGE_KEY = 'velxio-kids-gamification-v1';

export interface BadgeDef {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const GAMIFICATION_BADGES: BadgeDef[] = [
  {
    id: 'first-circuit',
    icon: '⚡',
    title: 'Tia Lửa Đầu Tiên',
    description: 'Chạy thành công mạch mô phỏng đầu tiên trên bàn thí nghiệm',
  },
  {
    id: 'junior-explorer',
    icon: '🌱',
    title: 'Nhà Khám Phá Nhí',
    description: 'Hoàn thành 5 dự án thực hành bất kỳ',
  },
  {
    id: 'sensor-master',
    icon: '📡',
    title: 'Chuyên Gia Cảm Biến & IoT',
    description: 'Đạt mốc 500 XP tích lũy',
  },
  {
    id: 'esp32-pro',
    icon: '🚀',
    title: 'Kỹ Sư Nhúng Bậc Thầy',
    description: 'Đạt mốc 1500 XP tích lũy',
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  nextLevelXp: number;
  progressPct: number;
}

export function computeLevelInfo(xp: number): LevelInfo {
  const thresholds = [
    { level: 1, min: 0, max: 200, title: 'Cấp 1 · Tia Lửa Nhỏ (5–8t)' },
    { level: 2, min: 200, max: 500, title: 'Cấp 2 · Thợ Điện Nhí (8–10t)' },
    { level: 3, min: 500, max: 1000, title: 'Cấp 3 · Nhà Thám Hiểm Mạch (10–13t)' },
    { level: 4, min: 1000, max: 2000, title: 'Cấp 4 · Kỹ Sư ESP32 IoT (14–17t)' },
    { level: 5, min: 2000, max: 5000, title: 'Cấp 5 · Kiến Trúc Sư Nhúng (17–20t)' },
  ];
  const current =
    [...thresholds].reverse().find((t) => xp >= t.min) ?? thresholds[0];
  const span = Math.max(1, current.max - current.min);
  const progressPct = Math.min(100, Math.round(((xp - current.min) / span) * 100));
  return {
    level: current.level,
    title: current.title,
    nextLevelXp: current.max,
    progressPct,
  };
}

export interface GraduationModalData {
  graduatedLevel: number;
  promotedToLevel: number;
  xpBonus: number;
  isFinalClass: boolean;
}

interface PersistedState {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedIds: string[];
  activeQuestId: string | null;
  currentClassLevel: number;
  graduatedClasses: number[];
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 1,
        lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
        activeQuestId: typeof parsed.activeQuestId === 'string' ? parsed.activeQuestId : null,
        currentClassLevel:
          typeof parsed.currentClassLevel === 'number'
            ? Math.max(1, Math.min(5, parsed.currentClassLevel))
            : 1,
        graduatedClasses: Array.isArray(parsed.graduatedClasses)
          ? parsed.graduatedClasses.map(Number).filter((n: number) => !isNaN(n))
          : [],
      };
    }
  } catch {
    /* ignore */
  }
  return {
    xp: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    completedIds: [],
    activeQuestId: exampleProjects[0]?.id ?? null,
    currentClassLevel: 1,
    graduatedClasses: [],
  };
}

function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export interface RewardToast {
  id: number;
  xpEarned: number;
  questTitle: string;
  badgeUnlocked?: BadgeDef;
}

export interface GamificationStore extends PersistedState {
  questDrawerOpen: boolean;
  classSelectorOpen: boolean;
  rewardToast: RewardToast | null;
  graduationModalData: GraduationModalData | null;

  setQuestDrawerOpen: (open: boolean) => void;
  toggleQuestDrawer: () => void;
  setClassSelectorOpen: (open: boolean) => void;
  setActiveQuestId: (id: string | null) => void;
  dismissToast: () => void;
  dismissGraduationModal: () => void;

  setCurrentClassLevel: (level: number, syncBackend?: boolean) => void;
  hydrateFromUser: (data: {
    class_level?: number;
    completed_lessons?: string[];
    graduated_classes?: number[];
  }) => void;
  completeLessonAndCheckGraduation: (lessonId: string) => void;
  graduateCurrentClassNow: () => void;
  recordSimulationSuccess: (fallbackBoardName?: string) => void;
}

const initial = loadState();

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  ...initial,
  questDrawerOpen: true,
  classSelectorOpen: false,
  rewardToast: null,
  graduationModalData: null,

  setQuestDrawerOpen: (open) => set({ questDrawerOpen: open }),
  toggleQuestDrawer: () => set((s) => ({ questDrawerOpen: !s.questDrawerOpen })),
  setClassSelectorOpen: (open) => set({ classSelectorOpen: open }),

  setActiveQuestId: (id) => {
    set({ activeQuestId: id });
    const st = get();
    saveState({
      xp: st.xp,
      streakDays: st.streakDays,
      lastActiveDate: st.lastActiveDate,
      completedIds: st.completedIds,
      activeQuestId: id,
      currentClassLevel: st.currentClassLevel,
      graduatedClasses: st.graduatedClasses,
    });
  },

  dismissToast: () => set({ rewardToast: null }),
  dismissGraduationModal: () => set({ graduationModalData: null }),

  setCurrentClassLevel: (level, syncBackend = true) => {
    const clamped = Math.max(1, Math.min(5, Math.round(level || 1)));
    set({ currentClassLevel: clamped });
    const st = get();
    saveState({
      xp: st.xp,
      streakDays: st.streakDays,
      lastActiveDate: st.lastActiveDate,
      completedIds: st.completedIds,
      activeQuestId: st.activeQuestId,
      currentClassLevel: clamped,
      graduatedClasses: st.graduatedClasses,
    });
    if (syncBackend) {
      void useAuthStore.getState().syncProgressToAccount({ class_level: clamped });
    }
  },

  hydrateFromUser: (data) => {
    const st = get();
    const userClass = data.class_level
      ? Math.max(1, Math.min(5, Number(data.class_level)))
      : st.currentClassLevel;
    const userCompleted = Array.isArray(data.completed_lessons) ? data.completed_lessons : [];
    const mergedCompleted = Array.from(new Set([...st.completedIds, ...userCompleted]));
    const userGraduated = Array.isArray(data.graduated_classes)
      ? data.graduated_classes.map(Number).filter((n) => !isNaN(n))
      : [];
    const mergedGraduated = Array.from(new Set([...st.graduatedClasses, ...userGraduated])).sort(
      (a, b) => a - b
    );

    const nextPersisted: PersistedState = {
      xp: st.xp,
      streakDays: st.streakDays,
      lastActiveDate: st.lastActiveDate,
      completedIds: mergedCompleted,
      activeQuestId: st.activeQuestId,
      currentClassLevel: userClass,
      graduatedClasses: mergedGraduated,
    };
    saveState(nextPersisted);
    set({
      completedIds: mergedCompleted,
      currentClassLevel: userClass,
      graduatedClasses: mergedGraduated,
    });
  },

  completeLessonAndCheckGraduation: (lessonId: string) => {
    const st = get();
    const alreadyDone = st.completedIds.includes(lessonId);
    const updatedCompleted = alreadyDone ? st.completedIds : [...st.completedIds, lessonId];
    const targetExample = exampleProjects.find((e) => e.id === lessonId);
    const baseXp = targetExample ? (DIFFICULTY_META_VI[targetExample.difficulty]?.xp ?? 50) : 50;
    const earnedXp = alreadyDone ? 0 : baseXp;
    let nextXp = st.xp + earnedXp;

    // Check automatic graduation
    const progress = getClassProgress(st.currentClassLevel, updatedCompleted);
    let graduationData: GraduationModalData | null = null;
    let finalClassLevel = st.currentClassLevel;
    let finalGraduated = st.graduatedClasses;

    if (progress.isReadyToGraduate && !st.graduatedClasses.includes(st.currentClassLevel)) {
      const classInfo = getClassCurriculum(st.currentClassLevel);
      const promotedToLevel = Math.min(5, st.currentClassLevel + 1);
      finalGraduated = Array.from(new Set([...st.graduatedClasses, st.currentClassLevel])).sort(
        (a, b) => a - b
      );
      finalClassLevel = promotedToLevel;
      nextXp += classInfo.graduationXpBonus;
      graduationData = {
        graduatedLevel: st.currentClassLevel,
        promotedToLevel,
        xpBonus: classInfo.graduationXpBonus,
        isFinalClass: st.currentClassLevel === 5,
      };
    }

    const nextPersisted: PersistedState = {
      xp: nextXp,
      streakDays: st.streakDays,
      lastActiveDate: st.lastActiveDate,
      completedIds: updatedCompleted,
      activeQuestId: lessonId,
      currentClassLevel: finalClassLevel,
      graduatedClasses: finalGraduated,
    };
    saveState(nextPersisted);

    set({
      ...nextPersisted,
      graduationModalData: graduationData ?? st.graduationModalData,
      rewardToast: {
        id: Date.now(),
        xpEarned: earnedXp + (graduationData ? graduationData.xpBonus : 0),
        questTitle: graduationData
          ? `🎓 Tốt nghiệp ${getClassCurriculum(st.currentClassLevel).shortName} và chuyển cấp lên ${getClassCurriculum(finalClassLevel).shortName}!`
          : targetExample?.title ?? `Hoàn thành bài học ${lessonId}`,
      },
    });

    void useAuthStore.getState().syncProgressToAccount({
      class_level: finalClassLevel,
      completed_lessons: updatedCompleted,
      graduated_classes: finalGraduated,
    });
  },

  graduateCurrentClassNow: () => {
    const st = get();
    const classInfo = getClassCurriculum(st.currentClassLevel);
    const updatedCompleted = Array.from(new Set([...st.completedIds, ...classInfo.lessonIds]));
    // MUTATION SABOTAGE: Fails to record graduation and fails to advance class level
    const updatedGraduated = st.graduatedClasses; // SABOTAGED: Omits new graduation
    const promotedToLevel = st.currentClassLevel; // SABOTAGED: Fails to advance from N to N + 1
    const isFinalClass = st.currentClassLevel === 5;
    const xpBonus = classInfo.graduationXpBonus;
    const nextXp = st.xp + xpBonus;

    const nextPersisted: PersistedState = {
      xp: nextXp,
      streakDays: st.streakDays,
      lastActiveDate: st.lastActiveDate,
      completedIds: updatedCompleted,
      activeQuestId: st.activeQuestId,
      currentClassLevel: promotedToLevel,
      graduatedClasses: updatedGraduated,
    };
    saveState(nextPersisted);

    set({
      ...nextPersisted,
      graduationModalData: {
        graduatedLevel: st.currentClassLevel,
        promotedToLevel,
        xpBonus,
        isFinalClass,
      },
      rewardToast: {
        id: Date.now(),
        xpEarned: xpBonus,
        questTitle: `🎉 Chúc mừng! Tốt nghiệp ${classInfo.shortName} (+${xpBonus} XP)`,
      },
    });

    void useAuthStore.getState().syncProgressToAccount({
      class_level: promotedToLevel,
      completed_lessons: updatedCompleted,
      graduated_classes: updatedGraduated,
    });
  },

  recordSimulationSuccess: (fallbackBoardName) => {
    const st = get();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let activeExample: ExampleProject | undefined = st.activeQuestId
      ? exampleProjects.find((e) => e.id === st.activeQuestId)
      : undefined;

    // Nếu người học mở bài từ URL /example/<id>
    if (!activeExample && typeof window !== 'undefined') {
      const m = window.location.pathname.match(/\/example\/([^/]+)/);
      if (m?.[1]) {
        activeExample = exampleProjects.find((e) => e.id === m[1]);
      }
    }

    const questId = activeExample?.id ?? `freeplay-${fallbackBoardName ?? 'circuit'}-${today}`;
    const alreadyDone = st.completedIds.includes(questId);

    const baseXp = activeExample
      ? (DIFFICULTY_META_VI[activeExample.difficulty]?.xp ?? 50)
      : 50;
    // Lần đầu hoàn thành bài nhận 100% XP, chạy lại thử nghiệm nhận +15 XP khích lệ
    const xpEarned = alreadyDone ? 15 : baseXp;
    let newXp = st.xp + xpEarned;
    const newCompleted = alreadyDone ? st.completedIds : [...st.completedIds, questId];

    let newStreak = st.streakDays || 1;
    if (st.lastActiveDate && st.lastActiveDate !== today) {
      const prev = new Date(st.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
    }

    // Kiểm tra huy hiệu mới mở khóa
    let badgeUnlocked: BadgeDef | undefined;
    if (st.completedIds.length === 0 && newCompleted.length >= 1) {
      badgeUnlocked = GAMIFICATION_BADGES[0];
    } else if (st.completedIds.length < 5 && newCompleted.length >= 5) {
      badgeUnlocked = GAMIFICATION_BADGES[1];
    } else if (st.xp < 500 && newXp >= 500) {
      badgeUnlocked = GAMIFICATION_BADGES[2];
    } else if (st.xp < 1500 && newXp >= 1500) {
      badgeUnlocked = GAMIFICATION_BADGES[3];
    }

    // Check automatic class graduation
    const progress = getClassProgress(st.currentClassLevel, newCompleted);
    let graduationData: GraduationModalData | null = null;
    let finalClassLevel = st.currentClassLevel;
    let finalGraduated = st.graduatedClasses;

    if (progress.isReadyToGraduate && !st.graduatedClasses.includes(st.currentClassLevel)) {
      const classInfo = getClassCurriculum(st.currentClassLevel);
      const promotedToLevel = Math.min(5, st.currentClassLevel + 1);
      finalGraduated = Array.from(new Set([...st.graduatedClasses, st.currentClassLevel])).sort(
        (a, b) => a - b
      );
      finalClassLevel = promotedToLevel;
      newXp += classInfo.graduationXpBonus;
      graduationData = {
        graduatedLevel: st.currentClassLevel,
        promotedToLevel,
        xpBonus: classInfo.graduationXpBonus,
        isFinalClass: st.currentClassLevel === 5,
      };
    }

    const nextPersisted: PersistedState = {
      xp: newXp,
      streakDays: newStreak,
      lastActiveDate: today,
      completedIds: newCompleted,
      activeQuestId: activeExample?.id ?? st.activeQuestId,
      currentClassLevel: finalClassLevel,
      graduatedClasses: finalGraduated,
    };
    saveState(nextPersisted);

    set({
      ...nextPersisted,
      graduationModalData: graduationData ?? st.graduationModalData,
      rewardToast: {
        id: Date.now(),
        xpEarned: xpEarned + (graduationData ? graduationData.xpBonus : 0),
        questTitle: graduationData
          ? `🎓 Tốt nghiệp ${getClassCurriculum(st.currentClassLevel).shortName} và chuyển cấp lên ${getClassCurriculum(finalClassLevel).shortName}!`
          : activeExample?.title ?? `Thử nghiệm mạch tự do (${fallbackBoardName ?? 'Simulator'})`,
        badgeUnlocked,
      },
    });

    void useAuthStore.getState().syncProgressToAccount({
      class_level: finalClassLevel,
      completed_lessons: newCompleted,
      graduated_classes: finalGraduated,
    });
  },
}));
