import React from 'react';
import { Crown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderAccountButtonProps {
  compact?: boolean;
}

export const HeaderAccountButton: React.FC<HeaderAccountButtonProps> = ({ compact = false }) => {
  const { user, openAccountModal } = useAuthStore();

  if (!user) {
    return (
      <div className="velxio-header-auth-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => openAccountModal('profile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            color: 'var(--color-text-primary, #2c2219)',
            padding: compact ? '3px 8px' : '4px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          title="Tài khoản & Dự án Cộng đồng (100% Miễn phí cho Cộng đồng)"
        >
          <Crown size={14} style={{ color: '#10b981' }} />
          <span>{compact ? '🌱 MIỄN PHÍ' : '🌱 100% MIỄN PHÍ CHO CỘNG ĐỒNG (OPEN COMMUNITY)'}</span>
        </button>
      </div>
    );
  }

  // User is logged in
  const displayName = user.display_name || user.username;
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <div
      data-auth-user={user.username}
      className="velxio-header-auth-user"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <button
        onClick={() => openAccountModal('profile')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--color-surface-1, rgba(255, 255, 255, 0.06))',
          border: '1px solid rgba(16, 185, 129, 0.55)',
          borderRadius: 6,
          padding: compact ? '2px 6px' : '3px 10px',
          color: 'var(--color-text-primary, #2c2219)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        title={`Tài khoản: ${displayName} (${user.role === 'admin' ? 'Quản trị viên' : 'Học viên'})`}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: user.is_admin
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>

        {!compact && (
          <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </span>
        )}

        {/* Community Free Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 4,
            letterSpacing: '0.02em',
          }}
        >
          {compact ? '🌱 FREE' : '🌱 100% MIỄN PHÍ CHO CỘNG ĐỒNG (OPEN COMMUNITY)'}
        </span>

        {user.is_admin && !compact && (
          <span
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              fontWeight: 600,
            }}
          >
            ADMIN
          </span>
        )}
      </button>
    </div>
  );
};
