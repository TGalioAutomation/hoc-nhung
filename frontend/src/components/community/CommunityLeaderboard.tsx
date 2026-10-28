import React, { useMemo } from 'react';
import { Trophy, Flame, Award, Sparkles, Star, MapPin, Share2, Heart } from 'lucide-react';
import { useCommunityHubStore } from '../../store/useCommunityHubStore';
import { useGamificationStore, computeLevelInfo } from '../../store/useGamificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { LeaderboardEntry } from '../../types/community';

export const CommunityLeaderboard: React.FC = () => {
  const getLiveLeaderboard = useCommunityHubStore((s) => s.getLiveLeaderboard);
  const xp = useGamificationStore((s) => s.xp);
  const streakDays = useGamificationStore((s) => s.streakDays);
  const completedIds = useGamificationStore((s) => s.completedIds);
  const user = useAuthStore((s) => s.user);

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    return getLiveLeaderboard();
  }, [getLiveLeaderboard, xp, streakDays, completedIds.length, user]);

  const levelInfo = useMemo(() => computeLevelInfo(xp), [xp]);

  const myEntry = useMemo(() => {
    return leaderboard.find(
      (e) =>
        e.id === (user?.id || 'current-learner-user') ||
        e.username === (user?.username || 'hoc-vien-nhi') ||
        e.displayName.includes('(Bạn)')
    );
  }, [leaderboard, user]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: '🥇',
          label: 'Quán Quân',
          bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(202, 138, 4, 0.1) 100%)',
          border: 'rgba(234, 179, 8, 0.6)',
          textColor: '#facc15',
          ring: 'rgba(234, 179, 8, 0.4)',
        };
      case 2:
        return {
          icon: '🥈',
          label: 'Á Quân 1',
          bg: 'linear-gradient(135deg, rgba(203, 213, 225, 0.25) 0%, rgba(148, 163, 184, 0.1) 100%)',
          border: 'rgba(203, 213, 225, 0.5)',
          textColor: '#e2e8f0',
          ring: 'rgba(203, 213, 225, 0.3)',
        };
      case 3:
        return {
          icon: '🥉',
          label: 'Á Quân 2',
          bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.1) 100%)',
          border: 'rgba(217, 119, 6, 0.5)',
          textColor: '#fb923c',
          ring: 'rgba(217, 119, 6, 0.3)',
        };
      default:
        return {
          icon: `#${rank}`,
          label: `Hạng ${rank}`,
          bg: '#27272a',
          border: '#3f3f46',
          textColor: '#a1a1aa',
          ring: 'transparent',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── BANNER CÁ NHÂN HỌC SINH (LIVE GAMIFICATION STATUS) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
              border: '2px solid #34d399',
            }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name || user.username}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              '⚡'
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5' }}>
                {user?.display_name || user?.username || 'Bạn (Nhà Sáng Chế Nhí)'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                Hạng #{myEntry?.rank ?? 1}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
              {levelInfo.title} · Tiến trình lên cấp tiếp theo: {levelInfo.progressPct}%
            </div>
          </div>
        </div>

        {/* Live stats chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div
            style={{
              background: 'rgba(24, 24, 27, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={16} color="#facc15" />
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa' }}>Điểm XP</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#facc15' }}>{xp} XP</div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(24, 24, 27, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Flame size={16} color="#ef4444" />
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa' }}>Chuỗi Học Tập</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#ef4444' }}>{streakDays} Ngày 🔥</div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(24, 24, 27, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Award size={16} color="#60a5fa" />
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa' }}>Bài Hoàn Thành</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>{completedIds.length} Bài</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP 3 PODIUM CARDS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Trophy size={22} color="#facc15" />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f4f4f5' }}>
            Top 3 Nhà Sáng Chế Nhí Xuất Sắc Nhất
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {top3.map((entry) => {
            const badge = getRankBadge(entry.rank);
            const isMe = entry.displayName.includes('(Bạn)');

            return (
              <div
                key={entry.id}
                style={{
                  background: isMe
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, #18181b 100%)'
                    : badge.bg,
                  border: `2px solid ${isMe ? '#10b981' : badge.border}`,
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 10px 25px ${badge.ring}`,
                }}
              >
                {/* Crown / Rank indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: badge.textColor,
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                  {isMe && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        background: '#10b981',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      BẠN ĐANG Ở ĐÂY
                    </span>
                  )}
                </div>

                {/* Profile info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#27272a',
                      border: `2px solid ${badge.textColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.displayName}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      '🧑‍💻'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#f4f4f5' }}>
                      {entry.displayName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#a1a1aa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <MapPin size={12} />
                      <span>{entry.location}</span>
                      {entry.age && <span>· {entry.age} tuổi</span>}
                    </div>
                  </div>
                </div>

                {/* Level badge */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    color: '#d4d4d8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Star size={14} color="#facc15" />
                  <span>{entry.level}</span>
                </div>

                {/* Stats grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: 10,
                    borderRadius: 10,
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: '#a1a1aa' }}>XP Tích Lũy</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#facc15', marginTop: 2 }}>
                      {entry.xp}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#a1a1aa' }}>Chuỗi Streak</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
                      {entry.streakDays}🔥
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#a1a1aa' }}>Dự Án Đã Chia Sẻ</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                      {entry.projectsShared}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {entry.badges.map((b, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#e4e4e7',
                        padding: '2px 6px',
                        borderRadius: 6,
                      }}
                    >
                      🏅 {b}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BẢNG XẾP HẠNG TỔNG THỂ (HẠNG 4+) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Award size={20} color="#a1a1aa" />
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f4f4f5' }}>
            Bảng Vinh Danh Các Nhà Sáng Chế Tiêu Biểu Khác
          </h4>
        </div>

        <div
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr',
              padding: '12px 16px',
              background: '#27272a',
              fontSize: 12,
              fontWeight: 700,
              color: '#a1a1aa',
              borderBottom: '1px solid #3f3f46',
            }}
          >
            <div>Hạng</div>
            <div>Nhà Sáng Chế Nhí</div>
            <div>Cấp Độ</div>
            <div style={{ textAlign: 'center' }}>Streak 🔥</div>
            <div style={{ textAlign: 'center' }}>Dự Án 🚀</div>
            <div style={{ textAlign: 'right' }}>Điểm XP ⭐</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rest.map((entry) => {
              const isMe = entry.displayName.includes('(Bạn)');

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr',
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid #27272a',
                    background: isMe ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    borderLeft: isMe ? '3px solid #10b981' : '3px solid transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, color: isMe ? '#10b981' : '#71717a' }}>
                    #{entry.rank}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#27272a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.displayName}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        '🧑‍🔧'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isMe ? '#34d399' : '#f4f4f5' }}>
                        {entry.displayName}
                      </div>
                      <div style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} />
                        <span>{entry.location}</span>
                        {entry.age && <span>· {entry.age}t</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#d4d4d8' }}>{entry.level}</div>

                  <div
                    style={{
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#ef4444',
                    }}
                  >
                    {entry.streakDays}🔥
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Share2 size={12} />
                    <span>{entry.projectsShared}</span>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: 14,
                      color: '#facc15',
                    }}
                  >
                    {entry.xp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
