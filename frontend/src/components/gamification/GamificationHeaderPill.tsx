import React from 'react';
import { useGamificationStore, computeLevelInfo } from '../../store/useGamificationStore';
import { getClassCurriculum, getClassProgress, type ClassLevelNumber } from '../../data/classCurriculum';
import { exampleProjects } from '../../data/examples';

export const GamificationHeaderPill: React.FC = () => {
  const xp = useGamificationStore((s) => s.xp);
  const streakDays = useGamificationStore((s) => s.streakDays);
  const completedIds = useGamificationStore((s) => s.completedIds);
  const questDrawerOpen = useGamificationStore((s) => s.questDrawerOpen);
  const toggleQuestDrawer = useGamificationStore((s) => s.toggleQuestDrawer);
  const currentClassLevel = useGamificationStore((s) => s.currentClassLevel);
  const setClassSelectorOpen = useGamificationStore((s) => s.setClassSelectorOpen);

  const levelInfo = computeLevelInfo(xp);
  const classInfo = getClassCurriculum(currentClassLevel);
  const progress = getClassProgress(currentClassLevel, completedIds);

  return (
    <div
      className="gamification-header-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginRight: 6,
        flexShrink: 0,
      }}
    >
      {/* Nút Chọn Lớp Học (Lớp 1 – Lớp 5) & Chuyển Cấp */}
      <button
        type="button"
        onClick={() => setClassSelectorOpen(true)}
        title={`Đang học: ${classInfo.name} — Bấm để chọn Lớp 1 đến Lớp 5 hoặc thi tốt nghiệp chuyển cấp!`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 11px',
          borderRadius: 999,
          border: `1.5px solid ${classInfo.color}`,
          background: 'var(--wb-3)',
          color: 'var(--wb-13)',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{classInfo.badgeIcon}</span>
        <span>{classInfo.shortName}</span>
        <span
          style={{
            background: classInfo.color,
            color: '#fff',
            borderRadius: 999,
            padding: '1px 7px',
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {progress.completedCount}/{progress.totalCount}
        </span>
      </button>

      {/* Nút Bật/Tắt Bảng Bài Học & Nhiệm Vụ 400+ */}
      <button
        type="button"
        onClick={toggleQuestDrawer}
        title="Bật/Tắt Bảng Bài Học & Nhiệm Vụ Thực Hành (400+ Dự Án)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 11px',
          borderRadius: 999,
          border: questDrawerOpen
            ? '1.5px solid var(--color-action-primary)'
            : '1px solid var(--wb-7)',
          background: questDrawerOpen ? 'var(--color-action-primary)' : 'var(--wb-3)',
          color: questDrawerOpen ? '#ffffff' : 'var(--wb-13)',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span>🎯</span>
        <span>Bài Học &amp; Nhiệm Vụ</span>
        <span
          style={{
            background: questDrawerOpen ? 'rgba(255,255,255,0.24)' : 'var(--wb-5)',
            color: questDrawerOpen ? '#fff' : 'var(--wb-12)',
            borderRadius: 999,
            padding: '1px 7px',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {completedIds.length}/{exampleProjects.length}
        </span>
      </button>

      {/* Huy hiệu XP & Cấp độ */}
      <div
        title={`${levelInfo.title} — Đã hoàn thành ${completedIds.length} bài thực hành (Tiến độ cấp tiếp theo: ${levelInfo.progressPct}%)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 10px',
          borderRadius: 999,
          background: 'var(--wb-3)',
          border: '1px solid var(--wb-6)',
          color: 'var(--wb-13)',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#f59e0b', fontSize: 13 }}>⭐</span>
        <span>{xp} XP</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--wb-11)',
            borderLeft: '1px solid var(--wb-6)',
            paddingLeft: 6,
          }}
        >
          Cấp {levelInfo.level}
        </span>
      </div>

      {/* Chuỗi ngày học liên tiếp (Streak) */}
      <div
        title={`Chuỗi ngày học liên tiếp: ${streakDays} ngày`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 30,
          padding: '0 9px',
          borderRadius: 999,
          background: 'rgba(234, 88, 12, 0.14)',
          border: '1px solid rgba(234, 88, 12, 0.35)',
          color: '#ea580c',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span>🔥</span>
        <span>{streakDays} ngày</span>
      </div>
    </div>
  );
};
