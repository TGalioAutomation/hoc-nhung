// @vitest-environment jsdom
/**
 * vietnamese-seo-pwa.test.ts
 *
 * Comprehensive verification of:
 * 1. frontend/index.html 100% Vietnamese SEO metadata, canonical link, OpenGraph, Twitter, and JSON-LD
 * 2. frontend/public/manifest.webmanifest & manifest.json PWA specifications
 * 3. frontend/src/seoRoutes.ts and routes metadata (/editor, /community, /classroom)
 * 4. frontend/src/utils/useSEO.ts dynamic DOM synchronization with https://hocnhung.apexdev.website
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createElement, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SEO_ROUTES, getSeoMeta } from '../seoRoutes';
import { useSEO } from '../utils/useSEO';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ROOT_DIR = resolve(__dirname, '../..');
const INDEX_HTML_PATH = resolve(ROOT_DIR, 'index.html');
const MANIFEST_WEB_PATH = resolve(ROOT_DIR, 'public/manifest.webmanifest');
const MANIFEST_JSON_PATH = resolve(ROOT_DIR, 'public/manifest.json');

describe('Static HTML Vietnamese SEO & Canonical Standard', () => {
  const indexHtml = readFileSync(INDEX_HTML_PATH, 'utf-8');

  it('declares Vietnamese language attribute on html root tag', () => {
    expect(indexHtml).toMatch(/<html\s+lang=["']vi["']/);
  });

  it('sets exact required title for Học Nhúng Cho Bé Open Community Edition', () => {
    expect(indexHtml).toContain(
      '<title>Học Nhúng Cho Bé — Phòng Thí Nghiệm Nhúng & Vi Điều Khiển (5–20 Tuổi) | Open Community Edition</title>',
    );
  });

  it('includes static canonical link tag pointing to https://hocnhung.apexdev.website/', () => {
    expect(indexHtml).toContain('<link rel="canonical" href="https://hocnhung.apexdev.website/" />');
  });

  it('standardizes primary meta description, keywords, and author to Vietnamese', () => {
    expect(indexHtml).toMatch(/<meta\s+name=["']description["']\s+content=["'][^"']*Học Nhúng Cho Bé[^"']*["']/);
    expect(indexHtml).toMatch(/<meta\s+name=["']keywords["']\s+content=["'][^"']*học nhúng cho bé[^"']*["']/);
    expect(indexHtml).toMatch(/<meta\s+name=["']author["']\s+content=["']Học Nhúng Cho Bé — Open Community Team["']/);
  });

  it('standardizes OpenGraph tags to Vietnamese and https://hocnhung.apexdev.website', () => {
    expect(indexHtml).toContain('<meta property="og:site_name" content="Học Nhúng Cho Bé" />');
    expect(indexHtml).toContain('<meta property="og:url" content="https://hocnhung.apexdev.website/" />');
    expect(indexHtml).toContain('<meta property="og:image" content="https://hocnhung.apexdev.website/og-image.png" />');
    expect(indexHtml).toContain('<meta property="og:locale" content="vi_VN" />');
    expect(indexHtml).toContain(
      '<meta property="og:title" content="Học Nhúng Cho Bé — Phòng Thí Nghiệm Nhúng & Vi Điều Khiển (5–20 Tuổi) | Open Community Edition" />',
    );
  });

  it('standardizes Twitter Cards and application name to Vietnamese', () => {
    expect(indexHtml).toContain('<meta name="twitter:image" content="https://hocnhung.apexdev.website/og-image.png" />');
    expect(indexHtml).toContain('<meta name="application-name" content="Học Nhúng Cho Bé" />');
  });

  it('has valid Vietnamese JSON-LD schema without commercial pricing links', () => {
    const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).not.toBeNull();
    const parsed = JSON.parse(jsonLdMatch![1]);
    expect(parsed['@graph']).toBeDefined();

    const graph = parsed['@graph'];
    const website = graph.find((item: any) => item['@type'] === 'WebSite');
    expect(website).toBeDefined();
    expect(website.url).toBe('https://hocnhung.apexdev.website/');
    expect(website.inLanguage).toBe('vi-VN');

    const app = graph.find((item: any) => item['@type'] === 'SoftwareApplication');
    expect(app).toBeDefined();
    expect(app.name).toBe('Học Nhúng Cho Bé — Open Community Edition');
    expect(app.url).toBe('https://hocnhung.apexdev.website/');
    expect(app.offers.price).toBe('0');
    expect(app.offers.priceCurrency).toBe('VND');

    // Confirm commercial pricing is removed
    expect(indexHtml).not.toContain('https://velxio.dev/pricing');
  });

  it('standardizes #root-seo crawler fallback content to Vietnamese', () => {
    expect(indexHtml).toContain(
      '<h1 style="margin:0;font-size:1.5rem;">Học Nhúng Cho Bé — Phòng Thí Nghiệm Nhúng &amp; Vi Điều Khiển (5–20 Tuổi) | Open Community Edition</h1>',
    );
    expect(indexHtml).toContain('href="/community"');
    expect(indexHtml).toContain('Kho Dự Án Cộng Đồng');
  });
});

describe('PWA Manifest Compliance (manifest.webmanifest & manifest.json)', () => {
  it('manifest.webmanifest exists and has Vietnamese configuration', () => {
    expect(existsSync(MANIFEST_WEB_PATH)).toBe(true);
    const content = JSON.parse(readFileSync(MANIFEST_WEB_PATH, 'utf-8'));
    expect(content.name).toBe('Học Nhúng Cho Bé — Open Community Edition');
    expect(content.short_name).toBe('Học Nhúng');
    expect(content.lang).toBe('vi');
    expect(content.description).toContain('Học Nhúng');
    expect(content.screenshots[0].label).toBe('Phòng Thí Nghiệm Học Nhúng Cho Bé');
  });

  it('manifest.json exists and mirrors manifest.webmanifest configuration', () => {
    expect(existsSync(MANIFEST_JSON_PATH)).toBe(true);
    const content = JSON.parse(readFileSync(MANIFEST_JSON_PATH, 'utf-8'));
    expect(content.name).toBe('Học Nhúng Cho Bé — Open Community Edition');
    expect(content.short_name).toBe('Học Nhúng');
    expect(content.lang).toBe('vi');
    expect(content.start_url).toBe('/editor');
  });
});

describe('seoRoutes Configuration & Domain Standard', () => {
  it('configures default domain as https://hocnhung.apexdev.website in root route', () => {
    const rootMeta = getSeoMeta('/');
    expect(rootMeta).toBeDefined();
    expect(rootMeta?.url).toBe('https://hocnhung.apexdev.website/');
    expect(rootMeta?.title).toContain('Học Nhúng Cho Bé');
  });

  it('configures editor route with Vietnamese title and hocnhung.apexdev.website domain', () => {
    const editorMeta = getSeoMeta('/editor');
    expect(editorMeta).toBeDefined();
    expect(editorMeta?.url).toBe('https://hocnhung.apexdev.website/editor');
    expect(editorMeta?.title).toContain('Học Nhúng Cho Bé');
  });

  it('includes /community route with Vietnamese metadata in SEO_ROUTES', () => {
    const communityMeta = getSeoMeta('/community');
    expect(communityMeta).toBeDefined();
    expect(communityMeta?.url).toBe('https://hocnhung.apexdev.website/community');
    expect(communityMeta?.title).toContain('Kho Dự Án Cộng Đồng');
  });

  it('ensures classroom route is free community curriculum without commercial fees', () => {
    const classroomMeta = getSeoMeta('/classroom');
    expect(classroomMeta).toBeDefined();
    expect(classroomMeta?.title).toContain('Cổng Lớp Học Nhúng Cho Bé');
    expect(classroomMeta?.description).not.toContain('$40');
    expect(classroomMeta?.description).toContain('100% miễn phí');
  });
});

describe('useSEO Dynamic Hook DOM Synchronization', () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    // Setup minimal document head elements
    document.title = 'Original Title';
    let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!desc) {
      desc = document.createElement('meta');
      desc.name = 'description';
      document.head.appendChild(desc);
    }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://hocnhung.apexdev.website/';
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
  });

  it('updates document.title and canonical URL with https://hocnhung.apexdev.website', async () => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);

    function TestComponent() {
      useSEO({
        title: 'Học Nhúng Cho Bé — Test Page',
        description: 'Mô tả trang thử nghiệm SEO Tiếng Việt',
        url: 'https://hocnhung.apexdev.website/community',
      });
      return createElement('div', null, 'SEO Test Page');
    }

    await act(async () => {
      root!.render(createElement(TestComponent));
    });

    expect(document.title).toBe('Học Nhúng Cho Bé — Test Page');
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical.href).toContain('https://hocnhung.apexdev.website/community');
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(desc.content).toBe('Mô tả trang thử nghiệm SEO Tiếng Việt');
  });
});
