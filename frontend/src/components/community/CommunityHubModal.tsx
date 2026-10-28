import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Sparkles,
  Trophy,
  Heart,
  GitFork,
  ArrowRight,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useCommunityHubStore } from '../../store/useCommunityHubStore';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import type { AgeGroupFilter, CommunityProject } from '../../types/community';

export const CommunityHubModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    activeTab,
    ageGroup,
    boardType,
    search,
    sort,
    projects,
    loading,
    closeModal,
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
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  if (!isOpen) return null;

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
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          maxHeight: '92vh',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f4f4f5',
        }}
      >
        {/* ── MODAL HEADER ── */}
        <div
          style={{
            padding: '16px 24px',
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
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              🌟
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>Kho Dự Án Cộng Đồng & Bảng Vàng Sáng Tạo</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  🌱 100% MIỄN PHÍ CHO CỘNG ĐỒNG
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                Khám phá mạch sáng chế của thiếu nhi Việt Nam · 1-Click Remix nạp thẳng vào bàn thí nghiệm
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
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
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── TAB BUTTONS ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #27272a',
            background: '#121214',
            padding: '0 20px',
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'projects' ? '#34d399' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            <span>🌟 Kho Dự Án Sáng Tạo ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'leaderboard' ? '2px solid #facc15' : '2px solid transparent',
              color: activeTab === 'leaderboard' ? '#facc15' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Trophy size={16} />
            <span>🏆 Bảng Vàng Sáng Tạo Học Tập Mở</span>
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* FILTERS & SEARCH ROW */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                {/* Search Bar & Dropdowns */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      flex: '1 1 240px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#27272a',
                      borderRadius: 8,
                      padding: '8px 12px',
                      border: '1px solid #3f3f46',
                    }}
                  >
                    <Search size={16} color="#a1a1aa" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm dự án, linh kiện, tác giả nhí..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#f4f4f5',
                        fontSize: 13,
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
                          padding: 0,
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Board selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={16} color="#a1a1aa" />
                    <select
                      value={boardType}
                      onChange={(e) => setBoardType(e.target.value)}
                      style={{
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        color: '#f4f4f5',
                        fontSize: 13,
                        borderRadius: 8,
                        padding: '8px 12px',
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

                  {/* Sort selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={16} color="#a1a1aa" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as any)}
                      style={{
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        color: '#f4f4f5',
                        fontSize: 13,
                        borderRadius: 8,
                        padding: '8px 12px',
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

                {/* Age brackets pill buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginRight: 4 }}>
                    Độ tuổi:
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
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: active ? 700 : 500,
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

              {/* PROJECT CARDS GRID */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
                  <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                  <div>Đang tải kho dự án sáng tạo cộng đồng...</div>
                </div>
              ) : projects.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#18181b',
                    borderRadius: 12,
                    border: '1px dashed #3f3f46',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5' }}>
                    Không tìm thấy dự án phù hợp
                  </div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
                    Hãy thử đổi từ khóa tìm kiếm hoặc chọn nhóm tuổi khác nhé!
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 18,
                  }}
                >
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        background: '#1e1e24',
                        border: '1px solid #2e2e38',
                        borderRadius: 14,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                      }}
                    >
                      {/* Top badges */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#27272a',
                              border: '1px solid #3f3f46',
                              color: '#38bdf8',
                              padding: '2px 8px',
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
                              fontSize: 10,
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
                              padding: '2px 8px',
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

                        {/* Project Title & Description */}
                        <h4
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#f4f4f5',
                            lineHeight: 1.4,
                          }}
                        >
                          {project.name}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#a1a1aa',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description}
                        </p>
                      </div>

                      {/* Author information */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#27272a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
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
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#e4e4e7',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.author?.displayName || 'Tác giả nhí'}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: '#71717a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {project.author?.location && (
                              <>
                                <MapPin size={10} />
                                <span>{project.author.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Like & 1-Click Remix */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <button
                          onClick={() => likeProject(project.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            background: project.hasLiked ? 'rgba(239, 68, 68, 0.2)' : '#27272a',
                            border: project.hasLiked
                              ? '1px solid rgba(239, 68, 68, 0.6)'
                              : '1px solid #3f3f46',
                            color: project.hasLiked ? '#f87171' : '#a1a1aa',
                            borderRadius: 8,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title={project.hasLiked ? 'Bỏ thích' : 'Thả tim dự án này'}
                        >
                          <Heart
                            size={14}
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
                            gap: 6,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: remixingId === project.id ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            transition: 'opacity 0.15s ease',
                            opacity: remixingId === project.id ? 0.7 : 1,
                          }}
                        >
                          {remixingId === project.id ? (
                            <>
                              <RefreshCw className="animate-spin" size={14} />
                              <span>Đang nạp mạch...</span>
                            </>
                          ) : (
                            <>
                              <GitFork size={14} />
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

          {activeTab === 'leaderboard' && <CommunityLeaderboard />}
        </div>
      </div>
    </div>
  );
};
