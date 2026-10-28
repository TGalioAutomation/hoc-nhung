import React from 'react';
import { Award, Sparkles, ArrowRight, X, Trophy, CheckCircle } from 'lucide-react';
import { useGamificationStore } from '../../store/useGamificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CLASS_CURRICULUM, type ClassLevelNumber } from '../../data/classCurriculum';
import { exampleProjects } from '../../data/examples';
import { loadExample } from '../../utils/loadExample';

export const ClassGraduationModal: React.FC = () => {
  const graduationModalData = useGamificationStore((s) => s.graduationModalData);
  const dismissGraduationModal = useGamificationStore((s) => s.dismissGraduationModal);
  const setActiveQuestId = useGamificationStore((s) => s.setActiveQuestId);
  const setClassSelectorOpen = useGamificationStore((s) => s.setClassSelectorOpen);
  const user = useAuthStore((s) => s.user);

  if (!graduationModalData) return null;

  const { graduatedLevel, promotedToLevel, xpBonus, isFinalClass } = graduationModalData;
  const graduatedClass = CLASS_CURRICULUM[graduatedLevel as ClassLevelNumber] || CLASS_CURRICULUM[1];
  const promotedClass = CLASS_CURRICULUM[promotedToLevel as ClassLevelNumber] || CLASS_CURRICULUM[5];
  const studentName = user?.display_name || user?.username || 'Kỹ Sư Nhí';

  const handleStartNextClass = async () => {
    dismissGraduationModal();
    const firstLessonId = promotedClass.lessonIds[0];
    if (firstLessonId) {
      const ex = exampleProjects.find((p) => p.id === firstLessonId);
      if (ex) {
        setActiveQuestId(firstLessonId);
        try {
          await loadExample(ex);
          if (window.location.pathname !== '/editor' && !window.location.pathname.startsWith('/editor')) {
            window.location.href = '/editor';
          }
        } catch {
          /* ignore */
        }
      }
    }
  };

  const handleOpenClassSelector = () => {
    dismissGraduationModal();
    setClassSelectorOpen(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissGraduationModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#18181b',
          border: '2px solid #f59e0b',
          borderRadius: 20,
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.35)',
          overflow: 'hidden',
          color: '#f4f4f5',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Confetti / Top Banner Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)',
            padding: '24px 20px',
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            onClick={dismissGraduationModal}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(0,0,0,0.25)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ fontSize: 44, marginBottom: 4 }}>🎓</div>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#fef3c7' }}>
            Học Viện Nhúng Cho Bé — Cộng Đồng Mở
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '6px 0 0 0', color: '#ffffff' }}>
            CHỨNG NHẬN TỐT NGHIỆP &amp; CHUYỂN CẤP
          </h2>
        </div>

        {/* Certificate Body */}
        <div style={{ padding: '24px 24px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 14, color: '#a1a1aa' }}>
            Vinh danh học viên xuất sắc:
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#38bdf8' }}>
            🌟 {studentName} 🌟
          </div>

          {/* Graduated Class Award Box */}
          <div
            style={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 32 }}>{graduatedClass.badgeIcon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fef08a' }}>
                  {graduatedClass.name}
                </div>
                <div style={{ fontSize: 12, color: '#d4d4d8' }}>
                  Đã hoàn thành toàn bộ 5 bài thực hành cốt lõi ({graduatedClass.ageRange})
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background: '#78350f44',
                color: '#facc15',
                fontWeight: 800,
                fontSize: 13,
                width: 'fit-content',
                margin: '6px auto 0 auto',
              }}
            >
              <Trophy size={16} />
              <span>Thưởng Tốt Nghiệp: +{xpBonus} XP Điểm Kinh Nghiệm</span>
            </div>
          </div>

          {/* Promotion Banner */}
          {!isFinalClass ? (
            <div
              style={{
                backgroundColor: '#14532d22',
                border: '1.5px dashed #22c55e',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <Sparkles size={22} color="#22c55e" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#86efac' }}>
                  🎉 CHÍNH THỨC CHUYỂN CẤP LÊN {promotedClass.shortName.toUpperCase()}!
                </div>
                <div style={{ fontSize: 12, color: '#d1d5db' }}>
                  {promotedClass.name} ({promotedClass.ageRange}) — Đã mở khóa trên bảng bài học!
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#88133722',
                border: '1.5px dashed #f43f5e',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <Trophy size={22} color="#f43f5e" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fda4af' }}>
                  👑 BẠN ĐÃ TỐT NGHIỆP TOÀN BỘ 5 CẤP ĐỘ LỚP HỌC NHÚNG!
                </div>
                <div style={{ fontSize: 12, color: '#fecdd3' }}>
                  Chúc mừng bạn đã đạt danh hiệu Học Viện Sáng Tạo Nhúng Tối Cao!
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {!isFinalClass ? (
              <button
                onClick={handleStartNextClass}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                }}
              >
                <span>🚀 Bắt Đầu Học Ngay Bài Đầu Tiên Của {promotedClass.shortName}</span>
                <ArrowRight size={16} />
              </button>
            ) : null}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleOpenClassSelector}
                style={{
                  flex: 1,
                  background: '#27272a',
                  color: '#e4e4e7',
                  border: '1px solid #3f3f46',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📚 Mở Bảng Lớp Học &amp; Bài Học
              </button>

              <button
                onClick={dismissGraduationModal}
                style={{
                  flex: 1,
                  background: '#18181b',
                  color: '#a1a1aa',
                  border: '1px solid #27272a',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng &amp; Xem Bằng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
