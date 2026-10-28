/**
 * Community Hub & Open Learning Types
 *
 * Types for Vietnamese youth community projects, 1-Click Remix engine,
 * and Open Hall of Fame Leaderboard (Bảng Vàng Sáng Tạo Cộng Đồng).
 */

export type AgeGroupFilter = 'all' | '5-8' | '9-13' | '14-20';

export type BoardFilter = string;

export interface CommunityAuthor {
  id?: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  age?: number;
  location?: string;
  level?: string;
  streakDays?: number;
  badges?: string[];
}

export interface CommunityProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  boardType: string;
  ageGroup: '5-8' | '9-13' | '14-20' | 'all';
  likesCount: number;
  forksCount: number;
  hasLiked?: boolean;
  author: CommunityAuthor;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isFeatured?: boolean;
  /**
   * Complete project data payload (components, wires, code, boards, libraries)
   * used by the 1-Click Remix engine to load directly into the simulator without network requests.
   */
  projectData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    is_public?: boolean;
    visibility?: 'public' | 'unlisted' | 'private';
    board_type: string;
    components_json: string;
    wires_json: string;
    boards_json?: string;
    libraries_json?: string;
    code?: string;
    files?: Array<{ name: string; content: string }>;
    file_groups?: Array<{ groupId: string; files: Array<{ name: string; content: string }> }>;
    owner_username?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  location: string;
  age?: number;
  xp: number;
  level: string;
  levelNumber: number;
  streakDays: number;
  projectsShared: number;
  likesReceived: number;
  badges: string[];
}

export interface CommunityProjectFilter {
  ageGroup?: AgeGroupFilter;
  boardType?: BoardFilter;
  search?: string;
  sort?: 'trending' | 'most_liked' | 'newest' | 'most_forked';
  page?: number;
  limit?: number;
  offset?: number;
}

export interface CommunityProjectsResponse {
  items: CommunityProject[];
  total: number;
  page?: number;
  limit?: number;
}

export interface LikeProjectResponse {
  liked: boolean;
  likes_count: number;
}

export interface ForkProjectResponse {
  success: boolean;
  project: CommunityProject['projectData'];
}
