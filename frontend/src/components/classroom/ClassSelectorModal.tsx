import React, { useState } from 'react';
import { X, Award, CheckCircle2, Play, Zap, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { useGamificationStore } from '../../store/useGamificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ALL_CLASS_LEVELS,
  CLASS_CURRICULUM,
  getClassProgress,
  type ClassLevelNumber,
} from '../../data/classCurriculum';
import { exampleProjects, type ExampleProject } from '../../data/examples';
import { loadExample } from '../../utils/loadExample';

export const ClassSelectorModal: React.FC = () => {
  const classSelectorOpen = useGamificationStore((s) => s.classSelectorOpen);
  const setClassSelectorOpen = useGamificationStore((s) => s.setClassSelectorOpen);
  const currentClassLevel = useGamificationStore((s) => s.currentClassLevel);
  const setCurrentClassLevel = useGamificationStore((s) => s.setCurrentClassLevel);
  const graduatedClasses = useGamificationStore((s) => s.graduatedClasses);
  const completedIds = useGamificationStore((s) => s.completedIds);
  const setActiveQuestId = useGamificationStore((s) => s.setActiveQuestId);
  const completeLessonAndCheckGraduation = useGamificationStore(
    (s) => s.completeLessonAndCheckGraduation
  );
  const graduateCurrentClassNow = useGamificationStore((s) => s.graduateCurrentClassNow);
  const selectClassLevel = useAuthStore((s) => s.selectClassLevel);

  const [expandedLevel, setExpandedLevel] = useState<number | null>(currentClassLevel);
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);

  if (!classSelectorOpen) return null;

  const handleSelectClass = async (level: ClassLevelNumber) => {
    setCurrentClassLevel(level);
    try {
      await selectClassLevel(level);
    } catch {
      /* ignore */
    }
  };

  const handleOpenLesson = async (lessonId: string) => {
    const ex: ExampleProject | undefined = exampleProjects.find((p) => p.id === lessonId);
    if (!ex) return;
    setLoadingLessonId(lessonId);
    try {
      setActiveQuestId(lessonId);
      await loadExample(ex);
      setClassSelectorOpen(false);
      // Ensure we are on editor page if needed
      if (window.location.pathname !== '/editor' && !window.location.pathname.startsWith('/editor')) {
        window.location.href = '/editor';
      }
    } catch (err) {
      console.error('[ClassSelectorModal] Lỗi nạp bài học:', err);
    } finally {
      setLoadingLessonId(null);
    }
  };

  const handleQuickGraduate = (level: ClassLevelNumber) => {
    // If not current, switch first, then graduate
    if (currentClassLevel !== level) {
      setCurrentClassLevel(level);
    }
    // Small timeout to ensure state propagation
    setTimeout(() => {
      graduateCurrentClassNow();
    }, 50);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setClassSelectorOpen(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '92vh',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f4f4f5',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}
            >
              🏫
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Bảng Chọn Cấp Độ Lớp Học &amp; Lộ Trình 5 Cấp Độ</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#16a34a',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  Lớp 1 → Lớp 5
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                Lộ trình chuẩn hóa từ Mầm Non Điện Tử (5–8 tuổi) đến Kiến Trúc Sư Hệ Thống Nhúng (17–20 tuổi)
              </div>
            </div>
          </div>

          <button
            onClick={() => setClassSelectorOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Progress Strip */}
        <div
          style={{
            background: '#121214',
            padding: '12px 20px',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <span style={{ color: '#a1a1aa' }}>Đang học: </span>
              <strong style={{ color: '#38bdf8' }}>
                {CLASS_CURRICULUM[currentClassLevel as ClassLevelNumber]?.name || `Lớp ${currentClassLevel}`}
              </strong>
            </div>
            <div style={{ borderLeft: '1px solid #27272a', paddingLeft: 16 }}>
              <span style={{ color: '#a1a1aa' }}>Bằng tốt nghiệp: </span>
              <strong style={{ color: '#fbbf24' }}>
                {graduatedClasses.length}/5 Lớp ({graduatedClasses.map((c) => `Lớp ${c}`).join(', ') || 'Chưa có'})
              </strong>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#a1a1aa' }}>
            💡 <span style={{ color: '#e4e4e7' }}>Hoàn thành đủ 5 bài cốt lõi để tự động nhận bằng và chuyển cấp!</span>
          </div>
        </div>

        {/* Classroom List Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ALL_CLASS_LEVELS.map((level) => {
            const classConfig = CLASS_CURRICULUM[level];
            const progress = getClassProgress(level, completedIds);
            const isCurrent = currentClassLevel === level;
            const isGraduated = graduatedClasses.includes(level);
            const isExpanded = expandedLevel === level;

            return (
              <div
                key={classConfig.id}
                style={{
                  backgroundColor: '#1f1f23',
                  border: isCurrent
                    ? `2px solid ${classConfig.color}`
                    : isGraduated
                    ? '1px solid #d97706'
                    : '1px solid #27272a',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? `0 0 16px ${classConfig.color}22` : undefined,
                }}
              >
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{classConfig.badgeIcon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>
                          {classConfig.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: '#27272a',
                            color: '#a1a1aa',
                            padding: '1px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {classConfig.ageRange}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                        {classConfig.description}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges & Quick Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isGraduated && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '3px 9px',
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Award size={13} />
                        Đã Tốt Nghiệp
                      </span>
                    )}

                    {isCurrent && (
                      <span
                        style={{
                          background: `${classConfig.color}22`,
                          color: classConfig.color,
                          border: `1px solid ${classConfig.color}`,
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '3px 9px',
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        🎯 Đang Học
                      </span>
                    )}

                    {!isCurrent && (
                      <button
                        onClick={() => handleSelectClass(level)}
                        style={{
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '5px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>🎯 Chọn Lớp Này</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: '#121214',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progress.percent}%`,
                        height: '100%',
                        backgroundColor: classConfig.color,
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', minWidth: 100, textAlign: 'right' }}>
                    {progress.completedCount}/{progress.totalCount} bài ({progress.percent}%)
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fbbf24',
                      backgroundColor: '#78350f33',
                      border: '1px solid #b4530944',
                      padding: '2px 8px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ⭐ +{classConfig.graduationXpBonus} XP
                  </div>
                </div>

                {/* Toggle Lesson List & Fast Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                    borderTop: '1px solid #27272a',
                    paddingTop: 8,
                    fontSize: 12,
                  }}
                >
                  <button
                    onClick={() => setExpandedLevel(isExpanded ? null : level)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#93c5fd',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{isExpanded ? 'Ẩn 5 bài học cốt lõi ▲' : 'Xem 5 bài học cốt lõi ▼'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isCurrent && progress.isReadyToGraduate && !isGraduated && (
                      <button
                        onClick={graduateCurrentClassNow}
                        style={{
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <GraduationCap size={14} />
                        <span>🎓 Tốt Nghiệp Lớp {level} Ngay</span>
                      </button>
                    )}

                    {/* Quick Demo Complete / Graduate Button */}
                    <button
                      onClick={() => handleQuickGraduate(level)}
                      title="Hoàn thành tức thì 5 bài học của lớp này và kích hoạt chứng nhận chuyển cấp (Dành cho kiểm thử/đánh giá)"
                      style={{
                        background: '#3f3f46',
                        color: '#facc15',
                        border: '1px solid #52525b',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Zap size={13} />
                      <span>⚡ Hoàn Thành Nhanh &amp; Chuyển Cấp Lớp {level}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Lesson List */}
                {isExpanded && (
                  <div
                    style={{
                      backgroundColor: '#141417',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    {classConfig.lessonIds.map((lid, idx) => {
                      const ex = exampleProjects.find((p) => p.id === lid);
                      const isDone = completedIds.includes(lid);
                      const isLoading = loadingLessonId === lid;

                      return (
                        <div
                          key={lid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: 6,
                            backgroundColor: isDone ? '#14532d18' : '#1f1f23',
                            border: isDone ? '1px solid #15803d44' : '1px solid #27272a',
                            fontSize: 12,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <span style={{ color: isDone ? '#22c55e' : '#71717a' }}>
                              {isDone ? <CheckCircle2 size={16} /> : `${idx + 1}.`}
                            </span>
                            <div>
                              <strong style={{ color: isDone ? '#86efac' : '#f4f4f5' }}>
                                {ex?.title || lid}
                              </strong>
                              {ex?.description && (
                                <div style={{ fontSize: 11, color: '#a1a1aa' }}>
                                  {ex.description.slice(0, 75)}...
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {!isDone && (
                              <button
                                onClick={() => completeLessonAndCheckGraduation(lid)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #3f3f46',
                                  color: '#a1a1aa',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                                title="Đánh dấu đã hoàn thành bài học này"
                              >
                                ✓ Đã học xong
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenLesson(lid)}
                              disabled={isLoading}
                              style={{
                                background: classConfig.color,
                                color: '#fff',
                                border: 'none',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Play size={11} fill="#fff" />
                              <span>{isLoading ? 'Đang mở...' : 'Học bài này'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #27272a',
            backgroundColor: '#121214',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, color: '#71717a' }}>
            Hệ thống đào tạo mở 100% miễn phí cho học sinh &amp; thiếu nhi Việt Nam
          </div>
          <button
            onClick={() => setClassSelectorOpen(false)}
            style={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
