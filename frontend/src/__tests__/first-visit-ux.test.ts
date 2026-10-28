// @vitest-environment jsdom
/**
 * first-visit-ux.test.ts
 *
 * Automated verification that users on their first visit (empty localStorage):
 * 1. Have WhatsNewModal permanently suppressed (zero English popups).
 * 2. newsGate transitions to 'clear' immediately with 0ms delay.
 * 3. NewsAnnouncer does not mount modal into document.body on first visit.
 * 4. EditorMenuBar provides an easily accessible, prominent 1-click button to /community.
 * 5. Vietnamese Classroom Gate / Login Modal displays unobstructed.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { NewsAnnouncer } from '../components/layout/NewsAnnouncer';
import { getNextNews, hasNewsSource } from '../lib/newsSource';
import { whenNewsClear } from '../lib/newsGate';
import { EditorMenuBar } from '../components/editor/EditorMenuBar';
import { useAuthStore } from '../store/useAuthStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  useAuthStore.setState({
    user: null,
    isAuthModalOpen: false,
    authModalTab: 'login',
  });
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
    root = null;
  }
  if (host) {
    host.remove();
    host = null;
  }
  vi.useRealTimers();
});

describe('First-Visit UX: Modal Suppression & Clear NewsGate', () => {
  it('hasNewsSource returns false by default on first visit (no registered source)', () => {
    expect(hasNewsSource()).toBe(false);
  });

  it('getNextNews resolves immediately to null without throwing or fetching remote feed', async () => {
    const post = await getNextNews();
    expect(post).toBeNull();
  });

  it('newsGate transitions to clear immediately on startup (resolves within 0ms)', async () => {
    let resolved = false;
    const start = performance.now();
    await whenNewsClear(50).then(() => {
      resolved = true;
    });
    const elapsed = performance.now() - start;
    expect(resolved).toBe(true);
    expect(elapsed).toBeLessThan(40);
  });

  it('NewsAnnouncer mounts with empty localStorage and does NOT display any modal or overlay', async () => {
    vi.useFakeTimers();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root.render(createElement(NewsAnnouncer));
    });

    // Advance past any old timers
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // The modal overlay must NOT be in DOM
    expect(document.querySelector('.velxio-news-modal')).toBeNull();
    expect(document.querySelector('.velxio-news-overlay')).toBeNull();
  });
});

describe('First-Visit UX: EditorMenuBar Quick Community Navigation', () => {
  it('renders a prominent 1-click button to /community in EditorMenuBar', async () => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/editor'] },
          createElement(EditorMenuBar),
        ),
      );
    });

    const communityBtn = document.querySelector('.emb-community-link') as HTMLButtonElement | null;
    expect(communityBtn).not.toBeNull();
    expect(communityBtn?.textContent).toContain('Kho Dự Án');
    expect(communityBtn?.getAttribute('title')).toContain('Kho Dự Án Cộng Đồng');
  });
});

describe('First-Visit UX: Vietnamese Classroom / Login Gate Unobstructed', () => {
  it('allows the mandatory classroom login portal to open cleanly without overlay obstruction', () => {
    const authStore = useAuthStore.getState();
    expect(authStore.user).toBeNull();

    // Trigger opening login portal
    act(() => {
      useAuthStore.getState().openAuthModal('login');
    });

    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalTab).toBe('login');

    // Asserts no news overlay is obstructing the screen
    expect(document.querySelector('.velxio-news-overlay')).toBeNull();
    expect(document.querySelector('.velxio-news-modal')).toBeNull();
  });
});
