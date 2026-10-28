/**
 * Community Hub Page (/community)
 *
 * Dedicated full-page view for the Vietnamese Youth Community Hub:
 * - Curated starter projects across 3 age bands (5–8t, 9–13t, 14–20t)
 * - 1-Click Fork/Remix engine directly loading circuits into the simulator
 * - Open Community Hall of Fame Leaderboard (Bảng Vàng Sáng Tạo)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Trophy,
  Search,
  Filter,
  Cpu,
  Heart,
  GitFork,
  MapPin,
  RefreshCw,
  X,
  Play,
  Share2,
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { useCommunityHubStore } from '../store/useCommunityHubStore';
import { CommunityLeaderboard } from '../components/community/CommunityLeaderboard';
import { useSEO } from '../utils/useSEO';
import type { AgeGroupFilter, CommunityProject } from '../types/community';

export const CommunityHubPage: React.FC = () => {
  const navigate = useNavigate();
  useSEO({
    title: 'Kho Dự Án Cộng Đồng & Bảng Vàng Sáng Tạo — Học Nhúng Cho Bé',
    description:
      'Khám phá các dự án mạch sáng tạo từ các bạn nhỏ Việt Nam, thử nghiệm 1-click remix, thi đua điểm kinh nghiệm XP và vinh danh trên Bảng Vàng Cộng Đồng Học Nhúng.',
    url: 'https://hocnhung.apexdev.website/community',
  });
  const {
    activeTab,
    ageGroup,
    boardType,
    search,
    sort,
    projects,
    loading,
    setActiveTab,
    setAgeGroup,
    setBoardType,
    setSearch,
    setSort,
    fetchProjects,
    likeProject,
    forkProject,
  } = useCommunityHubStore();

  const [remixingId, setRemixingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRemix = async (project: CommunityProject) => {
    setRemixingId(project.id);
    try {
      await forkProject(project, (path) => navigate(path));
    } finally {
      setRemixingId(null);
    }
  };

  const ageFilterButtons: { key: AgeGroupFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả lứa tuổi', icon: '🌟' },
    { key: '5-8', label: '5–8 tuổi (Khởi động)', icon: '🌱' },
    { key: '9-13', label: '9–13 tuổi (Khám phá)', icon: '🧩' },
    { key: '14-20', label: '14–20 tuổi (Sáng chế)', icon: '🚀' },
  ];

  const boardOptions = [
    { value: 'all', label: 'Tất cả vi điều khiển' },
    { value: 'arduino-uno', label: 'Arduino Uno' },
    { value: 'arduino-nano', label: 'Arduino Nano' },
    { value: 'arduino-mega', label: 'Arduino Mega' },
    { value: 'esp32', label: 'ESP32 Wi-Fi / Bluetooth' },
    { value: 'esp32-s3', label: 'ESP32-S3' },
    { value: 'pi-pico', label: 'Raspberry Pi Pico' },
    { value: 'stm32-bluepill', label: 'STM32 Blue Pill' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#0e0e11',
        color: '#f4f4f5',
      }}
    >
      <AppHeader />

      {/* ── HERO BANNER ── */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, #0e0e11 70%)',
          borderBottom: '1px solid #27272a',
          padding: '48px 24px 36px 24px',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            <span>🌱</span>
            <span>100% MIỄN PHÍ CHO CỘNG ĐỒNG (OPEN COMMUNITY)</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 900,
              margin: '0 0 16px 0',
              lineHeight: 1.25,
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Kho Dự Án Cộng Đồng & Bảng Vàng Sáng Tạo
          </h1>

          <p
            style={{
              fontSize: 16,
              color: '#a1a1aa',
              maxWidth: 720,
              margin: '0 auto 28px auto',
              lineHeight: 1.6,
            }}
          >
            Nền tảng học lập trình nhúng & vi điều khiển mở dành riêng cho thanh thiếu niên Việt Nam.
            Khám phá các mạch sáng chế thực tế, thả tim bình chọn và 1-Click Remix nạp thẳng vào bàn thí nghiệm để học tập!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/editor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Play size={16} fill="#fff" />
              <span>Vào Bàn Thí Nghiệm (Editor)</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#27272a',
                color: '#facc15',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: 10,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Trophy size={16} />
              <span>Xem Bảng Vàng Vinh Danh</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: 1120, width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #27272a',
            marginBottom: 28,
            gap: 12,
          }}
        >
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 20px',
              fontSize: 15,
              fontWeight: 800,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'projects' ? '#34d399' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={18} />
            <span>🌟 Kho Dự Án Sáng Tạo ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 20px',
              fontSize: 15,
              fontWeight: 800,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'leaderboard' ? '3px solid #facc15' : '3px solid transparent',
              color: activeTab === 'leaderboard' ? '#facc15' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Trophy size={18} />
            <span>🏆 Bảng Vàng Sáng Tạo Học Tập Mở</span>
          </button>
        </div>

        {/* Tab 1: Projects Gallery */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filter Controls Bar */}
            <div
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                {/* Search Input */}
                <div
                  style={{
                    flex: '1 1 280px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#27272a',
                    borderRadius: 10,
                    padding: '10px 14px',
                    border: '1px solid #3f3f46',
                  }}
                >
                  <Search size={18} color="#a1a1aa" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên dự án, linh kiện, tác giả nhí, tỉnh thành..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#f4f4f5',
                      fontSize: 14,
                      width: '100%',
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#71717a',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Microcontroller Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={16} color="#a1a1aa" />
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value)}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#f4f4f5',
                      fontSize: 13,
                      borderRadius: 10,
                      padding: '10px 14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {boardOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={16} color="#a1a1aa" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#f4f4f5',
                      fontSize: 13,
                      borderRadius: 10,
                      padding: '10px 14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="trending">🔥 Nổi bật nhất</option>
                    <option value="most_liked">❤️ Nhiều lượt thích nhất</option>
                    <option value="newest">✨ Mới nhất</option>
                    <option value="most_forked">🚀 Lượt Remix nhiều nhất</option>
                  </select>
                </div>
              </div>

              {/* Age Bracket Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', marginRight: 4 }}>
                  Nhóm tuổi:
                </span>
                {ageFilterButtons.map((btn) => {
                  const active = ageGroup === btn.key;
                  return (
                    <button
                      key={btn.key}
                      onClick={() => setAgeGroup(btn.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: active ? '#10b981' : '#27272a',
                        color: active ? '#fff' : '#d4d4d8',
                        border: active ? '1px solid #059669' : '1px solid #3f3f46',
                        borderRadius: 20,
                        padding: '6px 16px',
                        fontSize: 13,
                        fontWeight: active ? 800 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{btn.icon}</span>
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#a1a1aa' }}>
                <RefreshCw className="animate-spin" size={36} style={{ margin: '0 auto 16px auto' }} />
                <div style={{ fontSize: 16 }}>Đang tải danh sách dự án cộng đồng...</div>
              </div>
            ) : projects.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  background: '#18181b',
                  borderRadius: 16,
                  border: '1px dashed #3f3f46',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5' }}>
                  Không tìm thấy dự án phù hợp
                </div>
                <div style={{ fontSize: 14, color: '#a1a1aa', marginTop: 6 }}>
                  Hãy thử chọn lại từ khóa hoặc nhóm tuổi khác nhé!
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 20,
                }}
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 16,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            color: '#38bdf8',
                            padding: '3px 8px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Cpu size={12} />
                          <span>{project.boardType}</span>
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              project.ageGroup === '5-8'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : project.ageGroup === '9-13'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(234, 179, 8, 0.2)',
                            color:
                              project.ageGroup === '5-8'
                                ? '#34d399'
                                : project.ageGroup === '9-13'
                                ? '#60a5fa'
                                : '#facc15',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {project.ageGroup === '5-8'
                            ? '🌱 5–8 tuổi'
                            : project.ageGroup === '9-13'
                            ? '🧩 9–13 tuổi'
                            : '🚀 14–20 tuổi'}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: 16,
                          fontWeight: 800,
                          color: '#f4f4f5',
                          lineHeight: 1.4,
                        }}
                      >
                        {project.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: '#a1a1aa',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </p>
                    </div>

                    {/* Author & Location */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        background: '#27272a',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#3f3f46',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {project.author?.avatarUrl ? (
                          <img
                            src={project.author.avatarUrl}
                            alt={project.author.displayName}
                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                          />
                        ) : (
                          '🧒'
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#f4f4f5',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.author?.displayName || 'Tác giả nhí'}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#a1a1aa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 1,
                          }}
                        >
                          {project.author?.location && (
                            <>
                              <MapPin size={10} />
                              <span>{project.author.location}</span>
                            </>
                          )}
                          {project.author?.age && <span>· {project.author.age} tuổi</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Thả tim & 1-Click Remix */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => likeProject(project.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: project.hasLiked ? 'rgba(239, 68, 68, 0.2)' : '#27272a',
                          border: project.hasLiked
                            ? '1px solid rgba(239, 68, 68, 0.6)'
                            : '1px solid #3f3f46',
                          color: project.hasLiked ? '#f87171' : '#a1a1aa',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title={project.hasLiked ? 'Bỏ thích' : 'Thả tim dự án này'}
                      >
                        <Heart
                          size={15}
                          fill={project.hasLiked ? '#f87171' : 'none'}
                          color={project.hasLiked ? '#f87171' : '#a1a1aa'}
                        />
                        <span>{project.likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleRemix(project)}
                        disabled={remixingId === project.id}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '10px 16px',
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: remixingId === project.id ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                          transition: 'opacity 0.15s ease',
                          opacity: remixingId === project.id ? 0.7 : 1,
                        }}
                      >
                        {remixingId === project.id ? (
                          <>
                            <RefreshCw className="animate-spin" size={15} />
                            <span>Đang nạp mạch...</span>
                          </>
                        ) : (
                          <>
                            <GitFork size={15} />
                            <span>🚀 Mở & Remix Mạch Này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && <CommunityLeaderboard />}
      </main>
    </div>
  );
};
