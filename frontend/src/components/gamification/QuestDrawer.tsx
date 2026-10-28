import React, { useEffect, useMemo, useRef, useState } from 'react';
import { exampleProjects, type ExampleProject } from '../../data/examples';
import { CATEGORY_LABELS_VI, DIFFICULTY_META_VI } from '../../data/examplesVi';
import {
  useGamificationStore,
  computeLevelInfo,
  GAMIFICATION_BADGES,
} from '../../store/useGamificationStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { loadExample } from '../../utils/loadExample';

export const QuestDrawer: React.FC = () => {
  const questDrawerOpen = useGamificationStore((s) => s.questDrawerOpen);
  const setQuestDrawerOpen = useGamificationStore((s) => s.setQuestDrawerOpen);
  const activeQuestId = useGamificationStore((s) => s.activeQuestId);
  const setActiveQuestId = useGamificationStore((s) => s.setActiveQuestId);
  const completedIds = useGamificationStore((s) => s.completedIds);
  const xp = useGamificationStore((s) => s.xp);
  const rewardToast = useGamificationStore((s) => s.rewardToast);
  const dismissToast = useGamificationStore((s) => s.dismissToast);
  const recordSimulationSuccess = useGamificationStore((s) => s.recordSimulationSuccess);

  const isRunning = useSimulatorStore((s) => s.running);
  const activeBoardId = useSimulatorStore((s) => s.activeBoardId);

  const [ageFilter, setAgeFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [boardFilter, setBoardFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Tự động phát hiện khi học sinh bấm Chạy (Run) mạch thành công để cộng XP
  const prevRunningRef = useRef<boolean>(false);
  useEffect(() => {
    if (isRunning && !prevRunningRef.current) {
      recordSimulationSuccess(activeBoardId ?? 'Mạch điện');
    }
    prevRunningRef.current = isRunning;
  }, [isRunning, activeBoardId, recordSimulationSuccess]);

  // Tự động ẩn thông báo thưởng XP sau 5 giây
  useEffect(() => {
    if (!rewardToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [rewardToast, dismissToast]);

  const activeQuest: ExampleProject = useMemo(() => {
    return (
      exampleProjects.find((e) => e.id === activeQuestId) ??
      exampleProjects[0]
    );
  }, [activeQuestId]);

  const filteredQuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exampleProjects.filter((ex) => {
      if (ageFilter !== 'all' && ex.difficulty !== ageFilter) return false;
      if (boardFilter !== 'all') {
        const b = ex.boardFilter ?? ex.boardType ?? 'arduino-uno';
        if (boardFilter === 'esp32-family') {
          if (!String(b).startsWith('esp32')) return false;
        } else if (boardFilter === 'pico-family') {
          if (!String(b).includes('pico')) return false;
        } else if (boardFilter === 'spice-family') {
          if (b !== 'analog' && b !== 'digital' && ex.category !== 'circuits') return false;
        } else if (b !== boardFilter) {
          return false;
        }
      }
      if (q) {
        const hay = `${ex.title} ${ex.description} ${(ex.tags ?? []).join(' ')} ${ex.id}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [ageFilter, boardFilter, search]);

  const handleSelectQuest = async (ex: ExampleProject) => {
    setActiveQuestId(ex.id);
    setLoadingId(ex.id);
    try {
      await loadExample(ex);
    } catch (err) {
      console.error('[QuestDrawer] Lỗi nạp bài học:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const levelInfo = computeLevelInfo(xp);

  return (
    <>
      {/* Toast ăn mừng nhận XP khi chạy mạch thành công */}
      {rewardToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'var(--wb-2)',
            color: 'var(--wb-13)',
            border: '2px solid var(--color-action-primary)',
            borderRadius: 16,
            padding: '12px 20px',
            boxShadow: '0 14px 36px rgba(0, 0, 0, 0.28)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            maxWidth: 520,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'var(--color-action-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            🎉
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-action-primary)' }}>
              +{rewardToast.xpEarned} XP! Chạy mô phỏng mạch thành công!
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--wb-12)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Nhiệm vụ: {rewardToast.questTitle}
            </div>
            {rewardToast.badgeUnlocked && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#16a34a',
                }}
              >
                🏅 Mở khóa huy hiệu mới: {rewardToast.badgeUnlocked.icon}{' '}
                {rewardToast.badgeUnlocked.title}!
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={dismissToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--wb-10)',
              fontSize: 18,
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      )}

      {/* Bảng Bài Học & Nhiệm Vụ Thực Hành (400+ Dự Án) */}
      {questDrawerOpen && (
        <aside
          aria-label="Bảng Bài Học & Nhiệm Vụ Thực Hành"
          style={{
            width: 340,
            flexShrink: 0,
            height: '100%',
            background: 'var(--wb-2)',
            borderLeft: '1px solid var(--wb-6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 25,
          }}
        >
          {/* Header của Bảng Nhiệm Vụ */}
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--wb-3)',
              borderBottom: '1px solid var(--wb-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--wb-13)' }}>
                🎯 Bảng Bài Học &amp; Nhiệm Vụ ({exampleProjects.length} Bài)
              </div>
              <div style={{ fontSize: 11, color: 'var(--wb-10)' }}>
                {levelInfo.title} · Đã hoàn thành {completedIds.length} bài
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuestDrawerOpen(false)}
              title="Thu gọn bảng bài học"
              style={{
                background: 'var(--wb-4)',
                border: '1px solid var(--wb-6)',
                color: 'var(--wb-12)',
                borderRadius: 6,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>

          {/* Thẻ Nhiệm Vụ Đang Thực Hiện */}
          {activeQuest && (
            <div
              style={{
                margin: 10,
                padding: 10,
                borderRadius: 10,
                background: 'var(--color-accent-soft)',
                border: '1.5px solid var(--color-action-primary)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-action-primary)',
                  }}
                >
                  Đang học · {DIFFICULTY_META_VI[activeQuest.difficulty]?.ageBand}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '1px 7px',
                    borderRadius: 999,
                    background: completedIds.includes(activeQuest.id)
                      ? '#16a34a'
                      : 'var(--color-action-primary)',
                    color: '#fff',
                  }}
                >
                  {completedIds.includes(activeQuest.id)
                    ? '✅ Đã nhận XP'
                    : `+${DIFFICULTY_META_VI[activeQuest.difficulty]?.xp ?? 50} XP`}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--wb-13)', marginBottom: 4 }}>
                {activeQuest.title}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--wb-11)',
                  lineHeight: 1.4,
                  maxHeight: 52,
                  overflow: 'hidden',
                }}
              >
                {activeQuest.description}
              </div>
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 6,
                  borderTop: '1px dashed var(--wb-6)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isRunning ? '#16a34a' : 'var(--color-action-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {isRunning
                    ? '🟢 Mạch đang chạy mô phỏng!'
                    : '👉 Bấm nút Chạy (Run ▶) trên thanh công cụ để nhận XP!'}
                </span>
              </div>
            </div>
          )}

          {/* Bộ lọc độ tuổi 5–20 & Tìm kiếm */}
          <div
            style={{
              padding: '0 10px 8px',
              borderBottom: '1px solid var(--wb-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0,
            }}
          >
            {/* Dải nút chọn độ tuổi */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'beginner', label: '🌱 5–8t' },
                  { id: 'intermediate', label: '🧩 9–13t' },
                  { id: 'advanced', label: '🚀 14–20t' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAgeFilter(tab.id)}
                  style={{
                    padding: '5px 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    border:
                      ageFilter === tab.id
                        ? '1px solid var(--color-action-primary)'
                        : '1px solid var(--wb-6)',
                    background:
                      ageFilter === tab.id ? 'var(--color-action-primary)' : 'var(--wb-3)',
                    color: ageFilter === tab.id ? '#fff' : 'var(--wb-12)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ô tìm kiếm & Chọn bo mạch */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài học (LED, ESP32, cảm biến)..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 28,
                  padding: '0 8px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--wb-6)',
                  background: 'var(--wb-1)',
                  color: 'var(--wb-13)',
                }}
              />
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                aria-label="Lọc theo bo mạch"
                style={{
                  height: 28,
                  padding: '0 6px',
                  fontSize: 11,
                  borderRadius: 6,
                  border: '1px solid var(--wb-6)',
                  background: 'var(--wb-3)',
                  color: 'var(--wb-13)',
                  maxWidth: 118,
                }}
              >
                <option value="all">Mọi bo mạch</option>
                <option value="esp32-family">Họ ESP32 (IoT)</option>
                <option value="arduino-uno">Arduino Uno</option>
                <option value="pico-family">Raspberry Pi Pico</option>
                <option value="spice-family">Mạch Điện SPICE</option>
              </select>
            </div>
          </div>

          {/* Danh sách cuộn 400+ Bài Học */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {filteredQuests.slice(0, 150).map((ex, idx) => {
              const isSelected = ex.id === activeQuest?.id;
              const isDone = completedIds.includes(ex.id);
              const diffMeta = DIFFICULTY_META_VI[ex.difficulty] ?? DIFFICULTY_META_VI.beginner;
              const catLabel = CATEGORY_LABELS_VI[ex.category] ?? ex.category;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => void handleSelectQuest(ex)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isSelected
                      ? '1.5px solid var(--color-action-primary)'
                      : '1px solid var(--wb-6)',
                    background: isSelected ? 'var(--color-accent-soft)' : 'var(--wb-1)',
                    color: 'var(--wb-13)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: 'var(--wb-10)',
                      }}
                    >
                      #{idx + 1} · {catLabel} · {diffMeta.ageBand}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: isDone ? '#16a34a' : 'var(--color-action-primary)',
                      }}
                    >
                      {loadingId === ex.id
                        ? 'Đang nạp...'
                        : isDone
                          ? '✅ Đã xong'
                          : `+${diffMeta.xp} XP`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--wb-13)' }}>
                    {ex.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Thanh Huy Hiệu Đạt Được ở đáy */}
          <div
            style={{
              padding: '8px 10px',
              background: 'var(--wb-3)',
              borderTop: '1px solid var(--wb-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--wb-11)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 700 }}>Huy hiệu đạt được:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {GAMIFICATION_BADGES.map((b) => {
                const unlocked =
                  (b.id === 'first-circuit' && completedIds.length >= 1) ||
                  (b.id === 'junior-explorer' && completedIds.length >= 5) ||
                  (b.id === 'sensor-master' && xp >= 500) ||
                  (b.id === 'esp32-pro' && xp >= 1500);
                return (
                  <span
                    key={b.id}
                    title={`${b.title}: ${b.description}`}
                    style={{
                      fontSize: 15,
                      opacity: unlocked ? 1 : 0.28,
                      filter: unlocked ? 'none' : 'grayscale(1)',
                      cursor: 'help',
                    }}
                  >
                    {b.icon}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
