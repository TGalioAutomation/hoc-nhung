import React, { useState, useEffect } from 'react';
import {
  Crown,
  User as UserIcon,
  Shield,
  Cloud,
  X,
  Check,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  Key,
  Download,
  AlertCircle,
  Sparkles,
  Heart,
  GitFork,
  Cpu,
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore, type User } from '../../store/useAuthStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import {
  CLASS_CURRICULUM,
  ALL_CLASS_LEVELS,
  getClassCurriculum,
  getClassProgress,
  type ClassLevelNumber,
} from '../../data/classCurriculum';
import { useEditorStore } from '../../store/useEditorStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useCommunityHubStore } from '../../store/useCommunityHubStore';
import { forkAndRemixProject } from '../../utils/communityFork';
import type { CommunityProject, AgeGroupFilter } from '../../types/community';
import {
  getMyProjects,
  createProject,
  deleteProject,
  type ProjectResponse,
} from '../../services/projectService';
import { getApiBase } from '../../lib/apiBase';

export const AccountManagerModal: React.FC = () => {
  const {
    user,
    isAccountModalOpen,
    isAuthModalOpen,
    sessionChecked,
    accountModalTab,
    closeAccountModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateProfile,
    selectClassLevel,
    loading: authLoading,
  } = useAuthStore();

  const currentClassLevel = useGamificationStore((s) => s.currentClassLevel);
  const graduatedClasses = useGamificationStore((s) => s.graduatedClasses);
  const completedIds = useGamificationStore((s) => s.completedIds);
  const setClassSelectorOpen = useGamificationStore((s) => s.setClassSelectorOpen);
  const setCurrentClassLevel = useGamificationStore((s) => s.setCurrentClassLevel);

  const [activeTab, setActiveTab] = useState<'profile' | 'admin' | 'projects' | 'community'>('profile');

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [ident, setIdent] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regClassLevel, setRegClassLevel] = useState<number>(1);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile update state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newClassLevel, setNewClassLevel] = useState<number>(1);
  const [creatingUser, setCreatingUser] = useState(false);
  const [resetPwdUserId, setResetPwdUserId] = useState<string | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Cloud projects state
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPublic, setNewProjectPublic] = useState(true);
  const [savingProject, setSavingProject] = useState(false);
  const [projectMsg, setProjectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Community state
  const {
    projects: communityProjects,
    likeProject: likeCommunityProject,
    ageGroup: communityAgeGroup,
    setAgeGroup: setCommunityAgeGroup,
    search: communitySearch,
    setSearch: setCommunitySearch,
    fetchProjects: fetchCommunityProjects,
  } = useCommunityHubStore();
  const [remixingCommunityId, setRemixingCommunityId] = useState<string | null>(null);

  const handleCommunityRemix = async (project: CommunityProject) => {
    setRemixingCommunityId(project.id);
    try {
      handleClose();
      await forkAndRemixProject(project);
    } finally {
      setRemixingCommunityId(null);
    }
  };

  const isMandatoryGate = !user;
  const isOpen = isMandatoryGate ? sessionChecked || isAuthModalOpen : isAccountModalOpen || isAuthModalOpen;

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab('profile');
      setAuthMode('login');
    } else if (accountModalTab) {
      setActiveTab(accountModalTab);
    }
  }, [isAuthModalOpen, accountModalTab]);

  useEffect(() => {
    if (user) {
      setEditDisplayName(user.display_name || user.username);
      setEditEmail(user.email || '');
    }
  }, [user]);

  const createAdminApi = () => {
    const tk = useAuthStore.getState().token;
    return axios.create({
      withCredentials: true,
      baseURL: getApiBase(),
      headers: tk ? { Authorization: `Bearer ${tk}` } : undefined,
    });
  };

  // Load Admin Users
  const loadAdminUsers = async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const api = createAdminApi();
      const { data } = await api.get<User[]>('/admin/users');
      setAdminUsers(data);
    } catch (err: any) {
      setAdminError(err.response?.data?.detail || 'Không thể tải danh sách tài khoản.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Load Projects
  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch {
      /* ignore */
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'admin') {
        void loadAdminUsers();
      } else if (activeTab === 'projects') {
        void loadProjects();
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isMandatoryGate) return;
    closeAccountModal();
    closeAuthModal();
    setAuthError(null);
    setProfileMsg(null);
    setProjectMsg(null);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await login(ident, password);
      setIdent('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  // Quick 1-click Demo Login
  const handleQuickLogin = async (loginIdent: string, loginPass: string) => {
    setAuthError(null);
    try {
      await login(loginIdent, loginPass);
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || 'Đăng nhập thất bại.');
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await register(regUsername, regEmail, regPassword, regDisplayName, regClassLevel);
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegDisplayName('');
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng kiểm tra lại.');
    }
  };

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setUpdatingProfile(true);
    try {
      await updateProfile({
        displayName: editDisplayName,
        email: editEmail,
        password: editPassword || undefined,
      });
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setEditPassword('');
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Cập nhật thất bại.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Admin Create User
  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setAdminError(null);
    try {
      const api = createAdminApi();
      await api.post('/admin/users', {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        display_name: newDisplayName || undefined,
        role: newRole,
        is_admin: newRole === 'admin',
        is_active: true,
        is_pro: true,
        plan: 'pro',
        class_level: newClassLevel,
      });
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setShowCreateUser(false);
      await loadAdminUsers();
    } catch (err: any) {
      setAdminError(err.response?.data?.detail || 'Không thể tạo tài khoản mới.');
    } finally {
      setCreatingUser(false);
    }
  };

  // Admin Toggle Admin
  const handleToggleAdmin = async (targetUser: User) => {
    try {
      const api = createAdminApi();
      await api.put(`/admin/users/${targetUser.id}`, {
        is_admin: !targetUser.is_admin,
        role: !targetUser.is_admin ? 'admin' : 'user',
      });
      await loadAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể cập nhật quyền quản trị.');
    }
  };

  // Admin Toggle Active
  const handleToggleActive = async (targetUser: User) => {
    try {
      const api = createAdminApi();
      await api.put(`/admin/users/${targetUser.id}`, {
        is_active: !targetUser.is_active,
      });
      await loadAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể cập nhật trạng thái.');
    }
  };

  // Admin Reset Password
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUserId || !newResetPassword) return;
    try {
      const api = createAdminApi();
      await api.post(`/admin/users/${resetPwdUserId}/reset-password`, {
        new_password: newResetPassword,
      });
      alert('Đã đặt lại mật khẩu thành công!');
      setResetPwdUserId(null);
      setNewResetPassword('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Đặt lại mật khẩu thất bại.');
    }
  };

  // Admin Delete User
  const handleDeleteUser = async (targetUser: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${targetUser.username}"?`)) return;
    try {
      const api = createAdminApi();
      await api.delete(`/admin/users/${targetUser.id}`);
      await loadAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa tài khoản này.');
    }
  };

  // Admin Change User Class Level
  const handleAdminChangeClass = async (targetUser: User, newLevel: number) => {
    try {
      const api = createAdminApi();
      await api.put(`/admin/users/${targetUser.id}`, {
        class_level: newLevel,
      });
      await loadAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể cập nhật lớp học.');
    }
  };

  // Cloud Save Current Project
  const handleSaveCurrentProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setSavingProject(true);
    setProjectMsg(null);
    try {
      const edState = useEditorStore.getState();
      const simState = useSimulatorStore.getState();

      const sketchFiles = edState.files.map((f) => ({
        name: f.name,
        content: f.content,
      }));

      const activeFile = edState.files.find((f) => f.id === edState.activeFileId);
      const code = activeFile ? activeFile.content : edState.files[0]?.content || '';

      const created = await createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        is_public: newProjectPublic,
        visibility: newProjectPublic ? 'public' : 'private',
        board_type: simState.boardType || 'arduino-uno',
        code,
        files: sketchFiles,
        components_json: JSON.stringify(simState.components || []),
        wires_json: JSON.stringify(simState.wires || []),
      });

      // Update current project in project store
      useProjectStore.getState().setCurrentProject({
        id: created.id,
        slug: created.slug,
        ownerUsername: created.owner_username,
        isPublic: created.is_public,
        visibility: created.visibility,
      });

      setProjectMsg({ type: 'success', text: `Đã lưu dự án "${created.name}" lên đám mây!` });
      setNewProjectName('');
      setNewProjectDesc('');
      await loadProjects();
    } catch (err: any) {
      setProjectMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Không thể lưu dự án lên mây.',
      });
    } finally {
      setSavingProject(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (p: ProjectResponse) => {
    if (!confirm(`Xóa dự án "${p.name}"?`)) return;
    try {
      await deleteProject(p.id);
      await loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa dự án.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMandatoryGate) handleClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: '90vh',
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
        {/* Modal Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Crown size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Trung Tâm Tài Khoản &amp; Quản Trị Hệ Thống</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  🌱 100% MIỄN PHÍ CHO CỘNG ĐỒNG (OPEN COMMUNITY)
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                Học lập trình nhúng &amp; vi điều khiển 100% miễn phí cho cộng đồng trẻ em &amp; học sinh Việt Nam
              </div>
            </div>
          </div>

          {isMandatoryGate ? (
            <div
              style={{
                background: '#dc2626',
                color: '#fff',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
              }}
            >
              <span>🔒 Bắt Buộc Đăng Nhập</span>
            </div>
          ) : (
            <button
              onClick={handleClose}
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
          )}
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #27272a',
            background: '#121214',
            padding: '0 16px',
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'profile' ? '#fbbf24' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <UserIcon size={16} />
            <span>👤 Tài Khoản Của Tôi</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'admin' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'admin' ? '#fbbf24' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={16} />
            <span>🛡️ Quản Lý Tất Cả Account</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'projects' ? '#fbbf24' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Cloud size={16} />
            <span>☁️ Dự Án Đám Mây</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('community');
              fetchCommunityProjects();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'community' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'community' ? '#34d399' : '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            <span>🌟 Kho Dự Án Cộng Đồng</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* ════════════════════════ TAB 1: PROFILE / AUTH ════════════════════════ */}
          {activeTab === 'profile' && (
            <div>
              {!user ? (
                /* Unauthenticated View: Quick Login / Form */
                <div style={{ maxWidth: 520, margin: '0 auto' }}>
                  {/* Warm Welcoming Mandatory Login Gate Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(30, 58, 138, 0.28) 100%)',
                      border: '1.5px solid #3b82f6',
                      borderRadius: 14,
                      padding: '16px 18px',
                      marginBottom: 16,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#60a5fa', marginBottom: 6 }}>
                      🏫 Cổng Lớp Học Nhúng Cộng Đồng — Bắt Buộc Đăng Nhập Để Vào Lớp Học
                    </div>
                    <div style={{ fontSize: 12.5, color: '#e0e7ff', lineHeight: 1.5 }}>
                      Vui lòng đăng nhập, đăng ký tài khoản miễn phí, hoặc chọn 1-Chạm Tài Khoản Demo bên dưới để chọn Lớp Học (Lớp 1 – Lớp 5) và lưu tiến độ chuyển cấp!
                    </div>
                  </div>

                  {/* Quick 1-Click Demo Logins */}
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Crown size={16} />
                      <span>Đăng Nhập 1-Chạm Nhanh (Demo Accounts)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        onClick={() => handleQuickLogin('admin', 'admin123')}
                        style={{
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          color: '#fff',
                          padding: '10px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 2,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>👑 Quản Trị Viên (Admin)</div>
                        <div style={{ fontSize: 11, color: '#a1a1aa' }}>admin · admin123</div>
                      </button>

                      <button
                        onClick={() => handleQuickLogin('hocsinh', 'hocsinh123')}
                        style={{
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          color: '#fff',
                          padding: '10px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 2,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#3b82f6' }}>🎓 Học Sinh Demo</div>
                        <div style={{ fontSize: 11, color: '#a1a1aa' }}>hocsinh · hocsinh123</div>
                      </button>
                    </div>
                  </div>

                  {/* Auth Mode Toggle */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 16 }}>
                    <button
                      onClick={() => setAuthMode('login')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'none',
                        border: 'none',
                        borderBottom: authMode === 'login' ? '2px solid #3b82f6' : 'none',
                        color: authMode === 'login' ? '#60a5fa' : '#a1a1aa',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Đăng Nhập
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'none',
                        border: 'none',
                        borderBottom: authMode === 'register' ? '2px solid #3b82f6' : 'none',
                        color: authMode === 'register' ? '#60a5fa' : '#a1a1aa',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Tạo Tài Khoản Mới
                    </button>
                  </div>

                  {authError && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#f87171',
                        fontSize: 13,
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Email hoặc Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={ident}
                          onChange={(e) => setIdent(e.target.value)}
                          placeholder="admin / hocsinh / email..."
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Mật khẩu
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        style={{
                          marginTop: 6,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#000',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {authLoading ? <RefreshCw size={16} className="animate-spin" /> : <Crown size={16} />}
                        <span>Đăng Nhập Ngay</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Tên hiển thị (Họ và tên)
                        </label>
                        <input
                          type="text"
                          value={regDisplayName}
                          onChange={(e) => setRegDisplayName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Username (viết liền không dấu)
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="nguyenvana"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="vana@example.com"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Mật khẩu (tối thiểu 8 ký tự)
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                          Chọn Lớp Học Bắt Đầu (Lớp 1 – Lớp 5)
                        </label>
                        <select
                          value={regClassLevel}
                          onChange={(e) => setRegClassLevel(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#38bdf8',
                            fontSize: 13,
                            fontWeight: 700,
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                          }}
                        >
                          {ALL_CLASS_LEVELS.map((lvl) => {
                            const c = CLASS_CURRICULUM[lvl];
                            return (
                              <option key={lvl} value={lvl}>
                                {c.badgeIcon} {c.name} ({c.ageRange})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        style={{
                          marginTop: 6,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {authLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                        <span>Đăng Ký Tài Khoản Học Tập (100% Miễn Phí)</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Authenticated Profile View */
                <div>
                  {/* Pro Status Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      borderRadius: 12,
                      padding: 18,
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: '#10b981',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Crown size={22} strokeWidth={3} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: '#34d399' }}>
                            🌱 100% MIỄN PHÍ CHO CỘNG ĐỒNG (OPEN COMMUNITY)
                          </div>
                          <div style={{ fontSize: 12, color: '#d4d4d8' }}>
                            Vĩnh viễn cho học sinh & cộng đồng · Mở khóa 100% toàn bộ tính năng cao cấp
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 20,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={12} strokeWidth={3} /> ĐANG HOẠT ĐỘNG
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12, color: '#e4e4e7' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> 19+ Bo mạch STM32 QEMU, Pi Linux &amp; ESP32
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Hàng đợi biên dịch VIP ưu tiên cao nhất
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Tải file dữ liệu / âm thanh lên MicroSD ảo
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Nạp trực tiếp bo mạch thật qua WebSerial
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Không giới hạn lưu trữ dự án Đám mây
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Không quảng cáo &amp; Toàn quyền IoT Gateway
                      </div>
                    </div>
                  </div>

                  {/* 🎓 Lớp Học Hiện Tại & Tiến Độ Chuyển Cấp */}
                  {(() => {
                    const activeLvl = (user.class_level || currentClassLevel || 1) as ClassLevelNumber;
                    const curClass = CLASS_CURRICULUM[activeLvl] || CLASS_CURRICULUM[1];
                    const prog = getClassProgress(activeLvl, completedIds);
                    const userGraduated =
                      user.graduated_classes && user.graduated_classes.length > 0
                        ? user.graduated_classes
                        : graduatedClasses;

                    return (
                      <div
                        style={{
                          background: '#1f1f23',
                          border: `1.5px solid ${curClass.color}`,
                          borderRadius: 14,
                          padding: '16px 20px',
                          marginBottom: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 32 }}>{curClass.badgeIcon}</span>
                            <div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: curClass.color,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                LỚP HỌC HIỆN TẠI CỦA BẠN
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                                {curClass.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                                Độ tuổi phù hợp: {curClass.ageRange} · {curClass.description}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              setClassSelectorOpen(true);
                            }}
                            style={{
                              background: curClass.color,
                              border: 'none',
                              color: '#fff',
                              padding: '8px 14px',
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span>📚 Mở Bảng Chọn Lớp &amp; Bài Học</span>
                          </button>
                        </div>

                        {/* Progress Bar & Class Switcher */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ color: '#d4d4d8' }}>Tiến độ bài cốt lõi:</span>
                              <strong style={{ color: curClass.color }}>
                                {prog.completedCount}/{prog.totalCount} bài ({prog.percent}%)
                              </strong>
                            </div>
                            <div
                              style={{
                                height: 8,
                                background: '#121214',
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${prog.percent}%`,
                                  height: '100%',
                                  background: curClass.color,
                                  borderRadius: 999,
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </div>

                          {/* Switch Classroom Dropdown */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>
                              Chuyển lớp:
                            </label>
                            <select
                              value={activeLvl}
                              onChange={async (e) => {
                                const newLvl = Number(e.target.value) as ClassLevelNumber;
                                setCurrentClassLevel(newLvl);
                                try {
                                  await selectClassLevel(newLvl);
                                } catch {
                                  /* ignore */
                                }
                              }}
                              style={{
                                background: '#27272a',
                                border: '1px solid #3f3f46',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {ALL_CLASS_LEVELS.map((lvl) => {
                                const cl = CLASS_CURRICULUM[lvl];
                                return (
                                  <option key={lvl} value={lvl}>
                                    {cl.shortName} · {cl.name.split(':')[1]?.trim() || ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        {/* Graduated Certificates Strip */}
                        <div
                          style={{
                            borderTop: '1px solid #27272a',
                            paddingTop: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                            🏆 Bằng tốt nghiệp đã đạt:
                          </span>
                          {userGraduated.length === 0 ? (
                            <span style={{ fontSize: 12, color: '#71717a' }}>
                              Chưa có bằng (Hãy hoàn thành 5 bài cốt lõi của lớp để tốt nghiệp!)
                            </span>
                          ) : (
                            userGraduated.map((glvl) => {
                              const gConfig =
                                CLASS_CURRICULUM[glvl as ClassLevelNumber] || CLASS_CURRICULUM[1];
                              return (
                                <span
                                  key={glvl}
                                  style={{
                                    background: '#78350f44',
                                    border: '1px solid #f59e0b',
                                    color: '#fef08a',
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <span>{gConfig.badgeIcon}</span>
                                  <span>Bằng {gConfig.shortName}</span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Profile Edit Form */}
                  <div
                    style={{
                      background: '#1f1f23',
                      border: '1px solid #27272a',
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#fff' }}>
                      Chỉnh Sửa Thông Tin Cá Nhân
                    </div>

                    {profileMsg && (
                      <div
                        style={{
                          background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          color: profileMsg.type === 'success' ? '#34d399' : '#f87171',
                          padding: '10px 14px',
                          borderRadius: 8,
                          fontSize: 13,
                          marginBottom: 16,
                        }}
                      >
                        {profileMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6 }}>
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6 }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6 }}>
                          Username (Định danh)
                        </label>
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: 8,
                            color: '#71717a',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6 }}>
                          Đổi mật khẩu mới (để trống nếu không đổi)
                        </label>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Mật khẩu mới..."
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => logout()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <LogOut size={16} />
                          <span>Đăng Xuất</span>
                        </button>

                        <button
                          type="submit"
                          disabled={updatingProfile}
                          style={{
                            background: '#3b82f6',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 18px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {updatingProfile ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                          <span>Lưu Thay Đổi</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ TAB 2: ADMIN MANAGEMENT ════════════════════════ */}
          {activeTab === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
                    Quản Trị Tài Khoản & Phân Quyền Hệ Thống
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    Tất cả tài khoản học tập đều mở khóa 100% tài nguyên cộng đồng miễn phí
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={loadAdminUsers}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#d4d4d8',
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <RefreshCw size={14} className={adminLoading ? 'animate-spin' : ''} />
                    <span>Làm Mới</span>
                  </button>

                  <button
                    onClick={() => setShowCreateUser(!showCreateUser)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Tạo Tài Khoản Mới</span>
                  </button>
                </div>
              </div>

              {adminError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {adminError}
                </div>
              )}

              {/* Create User Form Drawer */}
              {showCreateUser && (
                <div
                  style={{
                    background: '#1f1f23',
                    border: '1px solid #3b82f6',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#60a5fa', marginBottom: 12 }}>
                    Tạo Tài Khoản Người Dùng / Quản Trị Viên Mới
                  </div>
                  <form onSubmit={handleAdminCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Tên hiển thị
                      </label>
                      <input
                        type="text"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Nguyễn Văn B"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="nguyenvanb"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="vanb@example.com"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Vai trò (Role)
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="user">Học viên (User)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                        Lớp học khởi đầu
                      </label>
                      <select
                        value={newClassLevel}
                        onChange={(e) => setNewClassLevel(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      >
                        {ALL_CLASS_LEVELS.map((lvl) => {
                          const curr = getClassCurriculum(lvl);
                          return (
                            <option key={lvl} value={lvl}>
                              Lớp {lvl}: {curr.title}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <button
                        type="submit"
                        disabled={creatingUser}
                        style={{
                          flex: 1,
                          padding: '9px',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {creatingUser ? 'Đang tạo...' : 'Tạo Tài Khoản Học Tập'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateUser(false)}
                        style={{
                          padding: '9px 12px',
                          background: '#3f3f46',
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Reset Modal Prompt */}
              {resetPwdUserId && (
                <div
                  style={{
                    background: '#27272a',
                    border: '1px solid #f59e0b',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                  }}
                >
                  <form onSubmit={handleAdminResetPassword} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', whiteSpace: 'nowrap' }}>
                      🔑 Đặt lại mật khẩu mới:
                    </div>
                    <input
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      required
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 13,
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '7px 14px',
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: 6,
                        color: '#000',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Cập Nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetPwdUserId(null)}
                      style={{
                        padding: '7px 10px',
                        background: '#3f3f46',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Hủy
                    </button>
                  </form>
                </div>
              )}

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #3f3f46', color: '#a1a1aa' }}>
                      <th style={{ padding: '8px 10px' }}>Tài Khoản</th>
                      <th style={{ padding: '8px 10px' }}>Email</th>
                      <th style={{ padding: '8px 10px' }}>Vai Trò</th>
                      <th style={{ padding: '8px 10px' }}>Gói Cước</th>
                      <th style={{ padding: '8px 10px' }}>Trạng Thái</th>
                      <th style={{ padding: '8px 10px' }}>Lớp Học &amp; Tiến Độ</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #27272a' }}>
                        <td style={{ padding: '10px 10px' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{u.display_name || u.username}</div>
                          <div style={{ fontSize: 11, color: '#71717a' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '10px 10px', color: '#d4d4d8' }}>{u.email}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <span
                            style={{
                              background: u.is_admin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: u.is_admin ? '#f87171' : '#60a5fa',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            {u.is_admin ? 'Quản Trị Viên' : 'Học Viên'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            🌱 CỘNG ĐỒNG
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <button
                            onClick={() => handleToggleActive(u)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: u.is_active ? '#34d399' : '#f87171',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            title="Click để đổi trạng thái"
                          >
                            {u.is_active ? '● Hoạt động' : '○ Bị khóa'}
                          </button>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <select
                              value={u.class_level || 1}
                              onChange={(e) => handleAdminChangeClass(u, Number(e.target.value))}
                              style={{
                                background: '#18181b',
                                border: '1px solid #3b82f6',
                                borderRadius: 6,
                                color: '#93c5fd',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '3px 6px',
                                cursor: 'pointer',
                              }}
                            >
                              {ALL_CLASS_LEVELS.map((lvl) => (
                                <option key={lvl} value={lvl}>
                                  Lớp {lvl}
                                </option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  color: '#60a5fa',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                }}
                              >
                                📚 {u.completed_lessons?.length || 0} bài
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  background: (u.graduated_classes?.length || 0) > 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                                  color: (u.graduated_classes?.length || 0) > 0 ? '#facc15' : '#71717a',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                }}
                              >
                                🎓 {u.graduated_classes?.length || 0} bằng
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => handleToggleAdmin(u)}
                              title={u.is_admin ? 'Hạ xuống học viên' : 'Nâng lên Admin'}
                              style={{
                                background: '#27272a',
                                border: '1px solid #3f3f46',
                                color: '#d4d4d8',
                                padding: '4px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                              }}
                            >
                              {u.is_admin ? 'Hạ quyền' : 'Lên Admin'}
                            </button>

                            <button
                              onClick={() => setResetPwdUserId(u.id)}
                              title="Đặt lại mật khẩu"
                              style={{
                                background: '#27272a',
                                border: '1px solid #3f3f46',
                                color: '#fbbf24',
                                padding: '4px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                              }}
                            >
                              <Key size={12} />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Xóa tài khoản"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                                padding: '4px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════ TAB 3: CLOUD PROJECTS ════════════════════════ */}
          {activeTab === 'projects' && (
            <div>
              {/* Save current project block */}
              <div
                style={{
                  background: '#1f1f23',
                  border: '1px solid #27272a',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fbbf24', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cloud size={16} />
                  <span>Lưu Sơ Đồ & Code Hiện Tại Lên Đám Mây</span>
                </div>

                {projectMsg && (
                  <div
                    style={{
                      background: projectMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${projectMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: projectMsg.type === 'success' ? '#34d399' : '#f87171',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    {projectMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveCurrentProject} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr auto 1fr', gap: 10 }}>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Tên dự án (VD: Đèn Giao Thông IoT)"
                    required
                    style={{
                      padding: '8px 10px',
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />

                  <input
                    type="text"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Mô tả tóm tắt tính năng..."
                    style={{
                      padding: '8px 10px',
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d4d4d8', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newProjectPublic}
                      onChange={(e) => setNewProjectPublic(e.target.checked)}
                    />
                    <span>Công khai</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingProject}
                    style={{
                      padding: '8px 14px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      borderRadius: 6,
                      color: '#000',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {savingProject ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
                    <span>Lưu Mây</span>
                  </button>
                </form>
              </div>

              {/* Saved projects list */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
                    Danh Sách Dự Án Đã Lưu ({projects.length})
                  </div>
                  <button
                    onClick={loadProjects}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#d4d4d8',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Làm mới
                  </button>
                </div>

                {projectsLoading ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#a1a1aa' }}>Đang tải dự án...</div>
                ) : projects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#71717a', fontSize: 13 }}>
                    Chưa có dự án nào được lưu. Hãy bấm nút "Lưu Mây" ở trên để lưu mạch của bạn!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          background: '#1f1f23',
                          border: '1px solid #27272a',
                          borderRadius: 8,
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{p.name}</span>
                            <span
                              style={{
                                fontSize: 10,
                                background: '#3f3f46',
                                color: '#d4d4d8',
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {p.board_type}
                            </span>
                          </div>
                          {p.description && (
                            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                              {p.description}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>
                            Cập nhật: {new Date(p.updated_at).toLocaleString('vi-VN')} · Chủ sở hữu: @{p.owner_username}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <a
                            href={`${getApiBase()}/pro/projects/${p.id}/bom.csv`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: '#27272a',
                              border: '1px solid #3f3f46',
                              color: '#d4d4d8',
                              padding: '6px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Download size={12} />
                            <span>BOM CSV</span>
                          </a>

                          <button
                            onClick={() => handleDeleteProject(p)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                              padding: '6px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════ TAB 4: COMMUNITY PROJECTS ════════════════════════ */}
          {activeTab === 'community' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#34d399',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Kho Dự Án Sáng Tạo Cộng Đồng</span>
                  </h3>
                  <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                    Khám phá mạch sáng chế của thiếu nhi Việt Nam · 1-Click Remix nạp thẳng vào bàn thí nghiệm
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên, linh kiện..."
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: '#f4f4f5',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => fetchCommunityProjects()}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#d4d4d8',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Age Bracket Filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  { key: 'all', label: 'Tất cả lứa tuổi', icon: '🌟' },
                  { key: '5-8', label: '5–8 tuổi', icon: '🌱' },
                  { key: '9-13', label: '9–13 tuổi', icon: '🧩' },
                  { key: '14-20', label: '14–20 tuổi', icon: '🚀' },
                ].map((btn) => {
                  const active = communityAgeGroup === btn.key;
                  return (
                    <button
                      key={btn.key}
                      onClick={() => setCommunityAgeGroup(btn.key as AgeGroupFilter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: active ? '#10b981' : '#27272a',
                        color: active ? '#fff' : '#d4d4d8',
                        border: active ? '1px solid #059669' : '1px solid #3f3f46',
                        borderRadius: 16,
                        padding: '4px 12px',
                        fontSize: 11,
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{btn.icon}</span>
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Community Projects Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 14,
                }}
              >
                {communityProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#18181b',
                            color: '#38bdf8',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {p.boardType}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: '#a1a1aa',
                          }}
                        >
                          {p.author.displayName}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f4f4f5' }}>{p.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#a1a1aa',
                          marginTop: 4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <button
                        onClick={() => likeCommunityProject(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: p.hasLiked ? 'rgba(239, 68, 68, 0.2)' : '#18181b',
                          border: p.hasLiked ? '1px solid #ef4444' : '1px solid #3f3f46',
                          color: p.hasLiked ? '#f87171' : '#a1a1aa',
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={12} fill={p.hasLiked ? '#f87171' : 'none'} />
                        <span>{p.likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleCommunityRemix(p)}
                        disabled={remixingCommunityId === p.id}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <GitFork size={13} />
                        <span>🚀 Remix Mạch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
