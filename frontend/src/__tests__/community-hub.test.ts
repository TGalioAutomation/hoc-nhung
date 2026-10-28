// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forkAndRemixProject } from '../utils/communityFork';
import { useCommunityHubStore } from '../store/useCommunityHubStore';
import { useProjectStore } from '../store/useProjectStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { useElectricalStore } from '../store/useElectricalStore';
import { useGamificationStore } from '../store/useGamificationStore';
import {
  COMMUNITY_STARTER_PROJECTS,
  COMMUNITY_HALL_OF_FAME,
  filterStarterProjects,
  getStarterProjectById,
} from '../data/communityStarterProjects';
import type { CommunityProject } from '../types/community';

describe('Community Hub & 1-Click Remix Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Vietnamese Youth Starter Projects Integrity', () => {
    it('contains exactly 9 starter projects across 3 age groups', () => {
      expect(COMMUNITY_STARTER_PROJECTS.length).toBe(9);

      const age5to8 = COMMUNITY_STARTER_PROJECTS.filter((p) => p.ageGroup === '5-8');
      const age9to13 = COMMUNITY_STARTER_PROJECTS.filter((p) => p.ageGroup === '9-13');
      const age14to20 = COMMUNITY_STARTER_PROJECTS.filter((p) => p.ageGroup === '14-20');

      expect(age5to8.length).toBe(3);
      expect(age9to13.length).toBe(3);
      expect(age14to20.length).toBe(3);
    });

    it('ensures each starter project has valid hardware diagram data and C++ code', () => {
      for (const project of COMMUNITY_STARTER_PROJECTS) {
        expect(project.id).toBeTruthy();
        expect(project.name).toBeTruthy();
        expect(project.boardType).toBeTruthy();
        expect(project.author.displayName).toBeTruthy();
        expect(project.projectData).toBeDefined();

        const data = project.projectData!;
        expect(data.code && data.code.length > 0).toBe(true);
        expect(data.components_json).toBeTruthy();
        expect(data.wires_json).toBeTruthy();

        // Components and wires should be valid JSON
        const components = JSON.parse(data.components_json);
        const wires = JSON.parse(data.wires_json);
        expect(Array.isArray(components)).toBe(true);
        expect(Array.isArray(wires)).toBe(true);
      }
    });

    it('retrieves specific starter projects by id correctly', () => {
      const trafficLight = getStarterProjectById('vn-starter-traffic-light');
      expect(trafficLight).toBeDefined();
      expect(trafficLight?.boardType).toBe('arduino-uno');
      expect(trafficLight?.author.displayName).toContain('Minh Khang');

      const aqiIot = getStarterProjectById('vn-starter-aqi-iot');
      expect(aqiIot).toBeDefined();
      expect(aqiIot?.boardType).toBe('esp32');
    });
  });

  describe('2. Project Filtering and Sorting', () => {
    it('filters projects by age group correctly', () => {
      const p5to8 = filterStarterProjects({ ageGroup: '5-8' });
      expect(p5to8.length).toBe(3);
      expect(p5to8.every((p) => p.ageGroup === '5-8' || p.ageGroup === 'all')).toBe(true);

      const p14to20 = filterStarterProjects({ ageGroup: '14-20' });
      expect(p14to20.length).toBe(3);
      expect(p14to20.every((p) => p.ageGroup === '14-20' || p.ageGroup === 'all')).toBe(true);
    });

    it('filters projects by board type correctly', () => {
      const unoProjects = filterStarterProjects({ boardType: 'arduino-uno' });
      expect(unoProjects.length).toBeGreaterThan(0);
      expect(unoProjects.every((p) => p.boardType === 'arduino-uno')).toBe(true);

      const esp32Projects = filterStarterProjects({ boardType: 'esp32' });
      expect(esp32Projects.length).toBeGreaterThan(0);
      expect(esp32Projects.every((p) => p.boardType === 'esp32')).toBe(true);
    });

    it('searches projects by keyword', () => {
      const trafficResults = filterStarterProjects({ search: 'giao thông' });
      expect(trafficResults.length).toBeGreaterThan(0);
      expect(trafficResults[0].name).toContain('Giao Thông');

      const authorResults = filterStarterProjects({ search: 'Hà Nội' });
      expect(authorResults.length).toBeGreaterThan(0);
    });

    it('sorts projects by most liked and trending', () => {
      const sortedByLikes = filterStarterProjects({ sort: 'most_liked' });
      for (let i = 0; i < sortedByLikes.length - 1; i++) {
        expect(sortedByLikes[i].likesCount).toBeGreaterThanOrEqual(sortedByLikes[i + 1].likesCount);
      }
    });
  });

  describe('3. 1-Click Remix Engine (forkAndRemixProject)', () => {
    it('clears currentProject FIRST to prevent auto-save overwrite', async () => {
      // Simulate user having an active project open
      useProjectStore.getState().setCurrentProject({
        id: 'user-old-project-123',
        slug: 'my-old-project',
        ownerUsername: 'testuser',
        isPublic: false,
      });

      expect(useProjectStore.getState().currentProject?.id).toBe('user-old-project-123');

      const targetProject = COMMUNITY_STARTER_PROJECTS[0];
      const navigateMock = vi.fn();

      await forkAndRemixProject(targetProject, navigateMock);

      // CRITICAL ASSERTION: currentProject must be cleared (null) to prevent debounced PUT overwrite
      expect(useProjectStore.getState().currentProject).toBeNull();

      // Electrical store should be unpaused
      expect(useElectricalStore.getState().paused).toBe(false);

      // Navigation callback should be called with /editor
      expect(navigateMock).toHaveBeenCalledWith('/editor');
    });

    it('loads project state into simulator store', async () => {
      const project = COMMUNITY_STARTER_PROJECTS[1]; // Doraemon Doorbell
      await forkAndRemixProject(project);

      const simState = useSimulatorStore.getState();
      expect(simState.boards.length).toBeGreaterThan(0);
      expect(simState.components.length).toBeGreaterThan(0);
      expect(simState.wires.length).toBeGreaterThan(0);
    });
  });

  describe('4. Community Hub Store & Live Leaderboard', () => {
    it('manages modal open state and tab selection', () => {
      const store = useCommunityHubStore.getState();
      store.openModal('leaderboard');

      expect(useCommunityHubStore.getState().isOpen).toBe(true);
      expect(useCommunityHubStore.getState().activeTab).toBe('leaderboard');

      store.setActiveTab('projects');
      expect(useCommunityHubStore.getState().activeTab).toBe('projects');

      store.closeModal();
      expect(useCommunityHubStore.getState().isOpen).toBe(false);
    });

    it('optimistically updates project likes and persists state', async () => {
      const store = useCommunityHubStore.getState();
      const project = COMMUNITY_STARTER_PROJECTS[0];
      const initialLikes = project.likesCount;

      await store.likeProject(project.id);
      const afterLike = useCommunityHubStore.getState().projects.find((p) => p.id === project.id);
      expect(afterLike?.hasLiked).toBe(true);
      expect(afterLike?.likesCount).toBe(initialLikes + 1);

      // Unlike
      await store.likeProject(project.id);
      const afterUnlike = useCommunityHubStore.getState().projects.find((p) => p.id === project.id);
      expect(afterUnlike?.hasLiked).toBe(false);
      expect(afterUnlike?.likesCount).toBe(initialLikes);
    });

    it('integrates live gamification stats dynamically into the leaderboard', () => {
      const store = useCommunityHubStore.getState();
      const gamification = useGamificationStore.getState();

      const leaderboard = store.getLiveLeaderboard();
      expect(leaderboard.length).toBeGreaterThanOrEqual(COMMUNITY_HALL_OF_FAME.length);

      // Verify the list is ordered by XP descending
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].xp).toBeGreaterThanOrEqual(leaderboard[i + 1].xp);
        expect(leaderboard[i].rank).toBe(i + 1);
      }

      // Current learner entry exists
      const learnerEntry = leaderboard.find((e) => e.displayName.includes('(Bạn)'));
      expect(learnerEntry).toBeDefined();
      expect(learnerEntry?.xp).toBe(gamification.xp);
      expect(learnerEntry?.streakDays).toBe(gamification.streakDays);
    });
  });
});
