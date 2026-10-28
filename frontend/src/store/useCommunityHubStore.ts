/**
 * Community Hub & Leaderboard Store
 *
 * Manages public projects, Vietnamese youth starter projects, 1-Click Remix triggers,
 * optimistic likes, and the Open Hall of Fame Leaderboard (Bảng Vàng Sáng Tạo).
 */

import { create } from 'zustand';
import axios from 'axios';
import { getApiBase } from '../lib/apiBase';
import type {
  AgeGroupFilter,
  BoardFilter,
  CommunityProject,
  LeaderboardEntry,
} from '../types/community';
import {
  COMMUNITY_STARTER_PROJECTS,
  COMMUNITY_HALL_OF_FAME,
  filterStarterProjects,
} from '../data/communityStarterProjects';
import { forkAndRemixProject } from '../utils/communityFork';
import { useGamificationStore, computeLevelInfo } from './useGamificationStore';
import { useAuthStore } from './useAuthStore';

const LIKES_STORAGE_KEY = 'velxio-community-likes-v1';

function loadLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveLikedIds(set: Set<string>): void {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

const communityApi = axios.create({ withCredentials: true });
communityApi.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  return config;
});

export interface CommunityHubState {
  isOpen: boolean;
  activeTab: 'projects' | 'leaderboard';
  ageGroup: AgeGroupFilter;
  boardType: BoardFilter;
  search: string;
  sort: 'trending' | 'most_liked' | 'newest' | 'most_forked';
  projects: CommunityProject[];
  loading: boolean;
  error: string | null;
  likedProjectIds: Set<string>;

  // Actions
  openModal: (tab?: 'projects' | 'leaderboard') => void;
  closeModal: () => void;
  setActiveTab: (tab: 'projects' | 'leaderboard') => void;
  setAgeGroup: (ageGroup: AgeGroupFilter) => void;
  setBoardType: (boardType: BoardFilter) => void;
  setSearch: (search: string) => void;
  setSort: (sort: 'trending' | 'most_liked' | 'newest' | 'most_forked') => void;
  fetchProjects: () => Promise<void>;
  likeProject: (projectId: string) => Promise<void>;
  forkProject: (project: CommunityProject, onNavigate?: (path: string) => void) => Promise<void>;
  getLiveLeaderboard: () => LeaderboardEntry[];
}

let fetchSeq = 0;

export const useCommunityHubStore = create<CommunityHubState>((set, get) => ({
  isOpen: false,
  activeTab: 'projects',
  ageGroup: 'all',
  boardType: 'all',
  search: '',
  sort: 'trending',
  projects: [...COMMUNITY_STARTER_PROJECTS],
  loading: false,
  error: null,
  likedProjectIds: loadLikedIds(),

  openModal: (tab = 'projects') => {
    set({ isOpen: true, activeTab: tab });
    get().fetchProjects();
  },

  closeModal: () => set({ isOpen: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setAgeGroup: (ageGroup) => {
    set({ ageGroup });
    get().fetchProjects();
  },

  setBoardType: (boardType) => {
    set({ boardType });
    get().fetchProjects();
  },

  setSearch: (search) => {
    set({ search });
    get().fetchProjects();
  },

  setSort: (sort) => {
    set({ sort });
    get().fetchProjects();
  },

  fetchProjects: async () => {
    const seq = ++fetchSeq;
    const { ageGroup, boardType, search, sort } = get();
    set({ loading: true, error: null });

    try {
      const params: Record<string, string | number> = {
        age_group: ageGroup,
        sort,
      };
      if (boardType && boardType !== 'all') {
        params.board_type = boardType;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const res = await communityApi.get<{ items: any[]; total: number }>('/projects/public', {
        params,
      });

      if (seq !== fetchSeq) return;

      const currentLikedIds = get().likedProjectIds;

      if (res.data && Array.isArray(res.data.items)) {
        // Map backend items to CommunityProject model
        const backendProjects: CommunityProject[] = res.data.items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || '',
          boardType: item.board_type,
          ageGroup: item.age_group || 'all',
          likesCount: item.likes_count || 0,
          forksCount: item.forks_count || 0,
          hasLiked: currentLikedIds.has(item.id) || !!item.has_liked,
          author: {
            username: item.owner_username || 'nha-sang-che',
            displayName: item.owner_display_name || item.owner_username || 'Nhà Sáng Chế Trẻ',
            avatarUrl: item.owner_avatar_url,
          },
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
        }));

        const filteredStarters = filterStarterProjects({
          ageGroup,
          boardType,
          search,
          sort,
        }).map((p) => ({
          ...p,
          hasLiked: currentLikedIds.has(p.id),
          likesCount: currentLikedIds.has(p.id) ? p.likesCount + 1 : p.likesCount,
        }));

        const projectMap = new Map<string, CommunityProject>();
        for (const p of filteredStarters) {
          projectMap.set(p.id, p);
        }
        for (const bp of backendProjects) {
          projectMap.set(bp.id, bp);
        }

        const merged = Array.from(projectMap.values());
        if (sort === 'most_liked') {
          merged.sort((a, b) => b.likesCount - a.likesCount);
        } else if (sort === 'newest') {
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sort === 'most_forked') {
          merged.sort((a, b) => b.forksCount - a.forksCount);
        } else {
          merged.sort((a, b) => b.likesCount * 2 + b.forksCount - (a.likesCount * 2 + a.forksCount));
        }

        set({ projects: merged, loading: false });
        return;
      }
    } catch {
      // Backend request failed or offline — fall back gracefully to starter projects
    }

    if (seq !== fetchSeq) return;

    const currentLikedIds = get().likedProjectIds;
    const filteredStarters = filterStarterProjects({
      ageGroup,
      boardType,
      search,
      sort,
    }).map((p) => ({
      ...p,
      hasLiked: currentLikedIds.has(p.id),
      likesCount: currentLikedIds.has(p.id) ? p.likesCount + 1 : p.likesCount,
    }));

    set({ projects: filteredStarters, loading: false });
  },

  likeProject: async (projectId: string) => {
    const { projects, likedProjectIds } = get();
    const isCurrentlyLiked = likedProjectIds.has(projectId);
    const newLikedSet = new Set(likedProjectIds);

    if (isCurrentlyLiked) {
      newLikedSet.delete(projectId);
    } else {
      newLikedSet.add(projectId);
    }

    // Save to localStorage
    saveLikedIds(newLikedSet);

    // Optimistic UI update
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        const delta = isCurrentlyLiked ? -1 : 1;
        return {
          ...p,
          hasLiked: !isCurrentlyLiked,
          likesCount: Math.max(0, p.likesCount + delta),
        };
      }
      return p;
    });

    set({ likedProjectIds: newLikedSet, projects: updatedProjects });

    // Asynchronous backend synchronization
    try {
      await communityApi.post(`/projects/${projectId}/like`);
    } catch {
      // Best-effort like sync; local optimistic state remains
    }
  },

  forkProject: async (project: CommunityProject, onNavigate?: (path: string) => void) => {
    // 1. Optimistically increment fork counter
    const { projects } = get();
    const updatedProjects = projects.map((p) => {
      if (p.id === project.id) {
        return { ...p, forksCount: p.forksCount + 1 };
      }
      return p;
    });
    set({ projects: updatedProjects, isOpen: false });

    // 2. Fire backend fork notification in background
    try {
      communityApi.post(`/projects/${project.id}/fork`).catch(() => {});
    } catch {
      /* ignore */
    }

    // 3. Execute 1-Click Remix into simulator
    await forkAndRemixProject(project, onNavigate);
  },

  getLiveLeaderboard: (): LeaderboardEntry[] => {
    const gamification = useGamificationStore.getState();
    const auth = useAuthStore.getState();
    const user = auth.user;

    const userXp = gamification.xp;
    const userStreak = gamification.streakDays;
    const userCompleted = gamification.completedIds;
    const levelInfo = computeLevelInfo(userXp);

    const currentUserEntry: LeaderboardEntry = {
      rank: 0,
      id: user?.id || 'current-learner-user',
      username: user?.username || 'hoc-vien-nhi',
      displayName: user?.display_name
        ? `${user.display_name} (Bạn)`
        : user?.username
          ? `${user.username} (Bạn)`
          : 'Nhà Sáng Chế Nhí (Bạn)',
      avatarUrl: user?.avatar_url || undefined,
      location: 'Việt Nam',
      age: 10,
      xp: userXp,
      level: levelInfo.title,
      levelNumber: levelInfo.level,
      streakDays: userStreak,
      projectsShared: Math.max(1, Math.floor(userCompleted.length / 3) + 1),
      likesReceived: Math.max(10, Math.round(userXp / 12) + 5),
      badges:
        userCompleted.length >= 5
          ? ['Tia Lửa Đầu Tiên', 'Nhà Khám Phá Nhí']
          : ['Tia Lửa Đầu Tiên'],
    };

    // Combine starter hall of fame with current user
    const hallOfFame = [...COMMUNITY_HALL_OF_FAME];
    const existingIndex = hallOfFame.findIndex(
      (e) => e.id === currentUserEntry.id || e.username === currentUserEntry.username
    );

    if (existingIndex >= 0) {
      hallOfFame[existingIndex] = currentUserEntry;
    } else {
      hallOfFame.push(currentUserEntry);
    }

    // Sort by XP descending
    hallOfFame.sort((a, b) => b.xp - a.xp);

    // Recompute ranks 1..N
    return hallOfFame.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  },
}));
