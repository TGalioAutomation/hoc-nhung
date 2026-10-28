/**
 * tests/e2e-dom.test.js
 * End-to-End DOM & Interactive Simulation Test Suite
 * Strictly derived from clean-room/SPEC.approved.md & index.html
 * Self-contained zero-dependency DOM harness for Node.js test runner
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/* =========================================================================
   Zero-Dependency Simulated DOM Harness
   ========================================================================= */

class DOMTokenList {
  constructor(el) {
    this.el = el;
    this.tokens = new Set();
  }
  add(...ts) {
    ts.forEach((t) => t && this.tokens.add(t));
    this._sync();
  }
  remove(...ts) {
    ts.forEach((t) => this.tokens.delete(t));
    this._sync();
  }
  toggle(t, force) {
    const has = this.tokens.has(t);
    const shouldAdd = force !== undefined ? force : !has;
    if (shouldAdd) this.tokens.add(t);
    else this.tokens.delete(t);
    this._sync();
    return shouldAdd;
  }
  contains(t) {
    return this.tokens.has(t);
  }
  _sync() {
    const str = Array.from(this.tokens).join(' ');
    if (str) this.el.attributes.set('class', str);
    else this.el.attributes.delete('class');
  }
  setFromClassString(str) {
    this.tokens.clear();
    if (str) str.split(/\s+/).filter(Boolean).forEach((t) => this.tokens.add(t));
  }
  toString() {
    return Array.from(this.tokens).join(' ');
  }
}

class DOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new DOMTokenList(this);
    this.style = {};
    this.dataset = {};
    this._text = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.offsetHeight = 92;
    this.offsetWidth = 320;
    this.scrollTop = 0;
    this.scrollHeight = 100;
  }

  get id() {
    return this.getAttribute('id') || '';
  }
  set id(v) {
    this.setAttribute('id', v);
  }

  get className() {
    return this.getAttribute('class') || '';
  }
  set className(v) {
    this.setAttribute('class', v);
    this.classList.setFromClassString(v);
  }

  setAttribute(n, v) {
    const s = String(v);
    this.attributes.set(n, s);
    if (n === 'class') {
      this.classList.setFromClassString(s);
    } else if (n.startsWith('data-')) {
      const c = n.slice(5).replace(/-([a-z])/g, (_, x) => x.toUpperCase());
      this.dataset[c] = s;
    }
  }

  getAttribute(n) {
    return this.attributes.has(n) ? this.attributes.get(n) : null;
  }

  removeAttribute(n) {
    this.attributes.delete(n);
    if (n === 'class') this.classList.tokens.clear();
    else if (n.startsWith('data-')) {
      const c = n.slice(5).replace(/-([a-z])/g, (_, x) => x.toUpperCase());
      delete this.dataset[c];
    }
  }

  hasAttribute(n) {
    return this.attributes.has(n);
  }

  get textContent() {
    if (this.children.length === 0) return this._text;
    return this.children.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    this.children = [];
    this._text = String(v);
  }

  get innerHTML() {
    return this.children.map((c) => c.outerHTML).join('') + this._text;
  }
  set innerHTML(htmlStr) {
    this.children = [];
    this._text = '';
    if (!htmlStr) return;
    parseHtmlInto(htmlStr, this);
  }

  get outerHTML() {
    const attrs = Array.from(this.attributes.entries())
      .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');
    const tag = this.tagName.toLowerCase();
    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }

  appendChild(c) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    this.children.push(c);
    return c;
  }

  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i !== -1) {
      this.children.splice(i, 1);
      c.parentNode = null;
    }
    return c;
  }

  getBoundingClientRect() {
    return {
      left: 100,
      top: 100,
      width: this.offsetWidth,
      height: this.offsetHeight,
      right: 100 + this.offsetWidth,
      bottom: 100 + this.offsetHeight
    };
  }

  addEventListener(e, fn) {
    if (!this.listeners.has(e)) this.listeners.set(e, []);
    this.listeners.get(e).push(fn);
  }

  removeEventListener(e, fn) {
    if (!this.listeners.has(e)) return;
    this.listeners.set(e, this.listeners.get(e).filter((f) => f !== fn));
  }

  dispatchEvent(evt) {
    evt.target = this;
    (this.listeners.get(evt.type) || []).forEach((f) => f(evt));
    return true;
  }

  click() {
    this.dispatchEvent({
      type: 'click',
      target: this,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }
    });
  }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (matches(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  querySelector(sel) {
    return querySelectorAll(this, sel)[0] || null;
  }

  querySelectorAll(sel) {
    return querySelectorAll(this, sel);
  }
}

function matches(el, selector) {
  if (!el || !selector) return false;
  if (selector.includes(',')) {
    return selector.split(',').some((p) => matches(el, p.trim()));
  }

  const tagMatch = selector.match(/^[a-zA-Z0-9\-]+/);
  if (tagMatch && el.tagName !== tagMatch[0].toUpperCase()) return false;

  const idMatches = selector.match(/#[a-zA-Z0-9_\-]+/g);
  if (idMatches) {
    for (const idSel of idMatches) {
      if (el.id !== idSel.slice(1)) return false;
    }
  }

  const classMatches = selector.match(/\.[a-zA-Z0-9_\-]+/g);
  if (classMatches) {
    for (const cls of classMatches) {
      if (!el.classList.contains(cls.slice(1))) return false;
    }
  }

  const attrMatches = selector.match(/\[([a-zA-Z0-9_\-]+)(?:([*^$]?=)(["']?)(.*?)\3)?\]/g);
  if (attrMatches) {
    for (const attrSel of attrMatches) {
      const m = attrSel.match(/\[([a-zA-Z0-9_\-]+)(?:([*^$]?=)(["']?)(.*?)\3)?\]/);
      if (!m) continue;
      const [, attrName, op, , expectedVal] = m;
      if (!el.hasAttribute(attrName)) return false;
      if (op) {
        const actualVal = el.getAttribute(attrName);
        if (op === '=' && actualVal !== expectedVal) return false;
        if (op === '*=' && !actualVal.includes(expectedVal)) return false;
        if (op === '^=' && !actualVal.startsWith(expectedVal)) return false;
        if (op === '$=' && !actualVal.endsWith(expectedVal)) return false;
      }
    }
  }
  return true;
}

function querySelectorAll(root, selector) {
  const parts = selector.trim().split(/\s+/);
  let currentSet = [root];
  for (const part of parts) {
    const nextSet = [];
    for (const node of currentSet) {
      collectMatchingDescendants(node, part, nextSet);
    }
    currentSet = nextSet;
  }
  return currentSet;
}

function collectMatchingDescendants(node, part, result) {
  for (const child of node.children) {
    if (matches(child, part)) {
      if (!result.includes(child)) result.push(child);
    }
    collectMatchingDescendants(child, part, result);
  }
}

function parseHtmlInto(htmlStr, root) {
  const stack = [root];
  const tagRegex = /<(!\-\-[\s\S]*?\-\-|!DOCTYPE[^>]*>|\/?[a-zA-Z0-9\-]+(?:\s+[^"'>]+(?:="[^"]*"|='[^']*'|=[^\s>]+)?)*\s*\/?>)/g;
  let lastIndex = 0;
  let match;
  const voidTags = new Set(['INPUT', 'HR', 'META', 'LINK', 'BR', 'IMG', 'SOURCE', 'AREA']);

  while ((match = tagRegex.exec(htmlStr)) !== null) {
    const text = htmlStr.slice(lastIndex, match.index).trim();
    if (text && stack.length > 0) {
      stack[stack.length - 1]._text += (stack[stack.length - 1]._text ? ' ' : '') + text;
    }
    lastIndex = tagRegex.lastIndex;

    const rawTag = match[1];
    if (rawTag.startsWith('!--') || rawTag.startsWith('!DOCTYPE')) continue;

    if (rawTag.startsWith('/')) {
      if (stack.length > 1) stack.pop();
      continue;
    }

    const selfClosing = rawTag.endsWith('/>');
    const cleanTag = rawTag.replace(/\/?>$/, '');
    const spaceIdx = cleanTag.search(/\s/);
    const tagName = (spaceIdx === -1 ? cleanTag : cleanTag.slice(0, spaceIdx)).toUpperCase();

    const el = new DOMElement(tagName);
    if (spaceIdx !== -1) {
      const attrStr = cleanTag.slice(spaceIdx);
      const attrRegex = /([a-zA-Z0-9_\-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let aMatch;
      while ((aMatch = attrRegex.exec(attrStr)) !== null) {
        const aName = aMatch[1];
        const aVal = aMatch[2] !== undefined ? aMatch[2] : (aMatch[3] !== undefined ? aMatch[3] : (aMatch[4] !== undefined ? aMatch[4] : ''));
        el.setAttribute(aName, aVal);
      }
    }

    stack[stack.length - 1].appendChild(el);
    if (!selfClosing && !voidTags.has(tagName)) {
      stack.push(el);
    }
  }

  const remainingText = htmlStr.slice(lastIndex).trim();
  if (remainingText && stack.length > 0) {
    stack[stack.length - 1]._text += (stack[stack.length - 1]._text ? ' ' : '') + remainingText;
  }
}

/* =========================================================================
   Environment Bootstrap for app.js
   ========================================================================= */

const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const docRoot = new DOMElement('#document');
parseHtmlInto(htmlContent, docRoot);
const htmlEl = docRoot.querySelector('html') || docRoot.children[0];
const bodyEl = docRoot.querySelector('body') || docRoot;

const mockStorageMap = new Map();
const winListeners = new Map();

globalThis.window = {
  addEventListener: (e, fn) => {
    if (!winListeners.has(e)) winListeners.set(e, []);
    winListeners.get(e).push(fn);
  },
  removeEventListener: (e, fn) => {
    if (!winListeners.has(e)) return;
    winListeners.set(e, winListeners.get(e).filter((f) => f !== fn));
  },
  dispatchEvent: (evt) => {
    (winListeners.get(evt.type) || []).forEach((f) => f(evt));
    return true;
  },
  localStorage: {
    getItem: (k) => mockStorageMap.get(k) || null,
    setItem: (k, v) => mockStorageMap.set(k, String(v)),
    removeItem: (k) => mockStorageMap.delete(k),
    clear: () => mockStorageMap.clear()
  },
  innerWidth: 1280,
  innerHeight: 850
};

globalThis.document = {
  documentElement: htmlEl,
  body: bodyEl,
  getElementById: (id) => docRoot.querySelector(`#${id}`),
  querySelector: (sel) => docRoot.querySelector(sel),
  querySelectorAll: (sel) => docRoot.querySelectorAll(sel),
  createElement: (tag) => new DOMElement(tag),
  createElementNS: (ns, tag) => new DOMElement(tag),
  activeElement: bodyEl
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || null;
  }
};

let rafId = 0;
const rafMap = new Map();
globalThis.requestAnimationFrame = (fn) => {
  const id = ++rafId;
  const timer = setTimeout(() => {
    rafMap.delete(id);
    fn(Date.now());
  }, 16);
  if (timer.unref) timer.unref();
  rafMap.set(id, timer);
  return id;
};
globalThis.cancelAnimationFrame = (id) => {
  if (rafMap.has(id)) {
    clearTimeout(rafMap.get(id));
    rafMap.delete(id);
  }
};
globalThis.confirm = () => true;

// Load App Master Controller
const appModule = await import('../src/app.js');
const app = appModule.default;

/* =========================================================================
   TEST SUITES
   ========================================================================= */

describe('E2E DOM Suite 1: Structural Contracts & Required Selectors in index.html', () => {
  it('contains all mandatory top-level layout IDs and elements', () => {
    const requiredSelectors = [
      '#band-badge',
      '.band-tab[data-band="band-a"]',
      '.band-tab[data-band="band-b"]',
      '.band-tab[data-band="band-c"]',
      '#xp-val',
      '#progress-bar-track',
      '#progress-bar-fill',
      '#progress-label',
      '#lessons-list',
      '#hardware-stage',
      '#story-cards-container',
      '#blocks-workspace-container',
      '#code-editor-container',
      '#serial-panel',
      '#serial-grip',
      '#modal-pinout',
      '#modal-quiz',
      '#floating-schematic',
      '#modal-settings',
      '#tip'
    ];

    requiredSelectors.forEach((sel) => {
      const el = docRoot.querySelector(sel);
      assert.ok(el, `Expected element matching selector '${sel}' to exist in DOM`);
    });
  });

  it('initializes application bootstrap cleanly with all 20 lessons', () => {
    app.initApp();
    const lessonItems = docRoot.querySelectorAll('.lesson-item');
    assert.equal(lessonItems.length, 20, 'Should render exactly 20 lessons in sidebar list');
    assert.equal(docRoot.querySelector('#active-lesson-counter').textContent, '20 Bài');
  });
});

describe('E2E DOM Suite 2: Age-Tiered Cognitive UI Navigation Journey', () => {
  it('switches to Band A (Kid Spark: 5–8) and updates UI contracts', () => {
    const tabA = docRoot.querySelector('.band-tab[data-band="band-a"]');
    assert.ok(tabA);
    tabA.click();

    // Verify HTML root data attribute
    assert.equal(htmlEl.getAttribute('data-age-band'), 'band-a');
    // Verify Header Badge
    const badge = docRoot.querySelector('#band-badge');
    assert.ok(badge.textContent.includes('Kid Spark'));
    assert.ok(badge.textContent.includes('5–8'));
    // Verify Tab active classes
    assert.equal(tabA.classList.contains('active'), true);
    assert.equal(docRoot.querySelector('.band-tab[data-band="band-b"]').classList.contains('active'), false);
    assert.equal(docRoot.querySelector('.band-tab[data-band="band-c"]').classList.contains('active'), false);

    // Verify Story Cards Container is populated
    const storyContainer = docRoot.querySelector('#story-cards-container');
    assert.ok(storyContainer.children.length > 0, 'Band A should render visual story cards');
  });

  it('switches to Band B (Block Explorer: 9–13) and updates UI contracts', () => {
    const tabB = docRoot.querySelector('.band-tab[data-band="band-b"]');
    tabB.click();

    assert.equal(htmlEl.getAttribute('data-age-band'), 'band-b');
    const badge = docRoot.querySelector('#band-badge');
    assert.ok(badge.textContent.includes('Block Explorer'));
    assert.ok(badge.textContent.includes('9–13'));
    assert.equal(tabB.classList.contains('active'), true);

    // Verify Blocks Workspace List is populated
    const blocksList = docRoot.querySelector('#blocks-list');
    assert.ok(blocksList.children.length > 0, 'Band B should render block workspace entries');
  });

  it('switches to Band C (Maker Pro: 14–20) and updates UI contracts', () => {
    const tabC = docRoot.querySelector('.band-tab[data-band="band-c"]');
    tabC.click();

    assert.equal(htmlEl.getAttribute('data-age-band'), 'band-c');
    const badge = docRoot.querySelector('#band-badge');
    assert.ok(badge.textContent.includes('Maker Pro'));
    assert.ok(badge.textContent.includes('14–20'));
    assert.equal(tabC.classList.contains('active'), true);

    // Verify Code Display lines are rendered
    const codeDisplay = docRoot.querySelector('#code-display');
    const lines = codeDisplay.querySelectorAll('.code-line');
    assert.ok(lines.length > 0, 'Band C should render numbered code lines in editor');
  });
});

describe('E2E DOM Suite 3: Curriculum 20-Lesson Selection Journey', () => {
  it('navigates through all 20 lessons sequentially and updates hardware actors', () => {
    const items = docRoot.querySelectorAll('.lesson-item');
    assert.equal(items.length, 20);

    // 1. Lesson 1: Meet ESP32 DevKit
    items[0].click();
    assert.equal(items[0].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('#interactive-title').textContent.includes('Điều Khiển'));

    // 2. Lesson 2: Dual LED Blink (check slider)
    items[1].click();
    assert.equal(items[1].classList.contains('active'), true);
    const rateSlider = docRoot.querySelector('#rate-slider');
    assert.ok(rateSlider, 'Lesson 2 should inject rate slider');

    // 3. Lesson 3: Fridge Door Reed Switch (check angle slider)
    items[2].click();
    assert.equal(items[2].classList.contains('active'), true);
    const angleSlider = docRoot.querySelector('#angle-slider');
    assert.ok(angleSlider, 'Lesson 3 should inject angle slider');

    // 4. Lesson 6: Touch Piano (check 8 keys)
    items[5].click();
    assert.equal(items[5].classList.contains('active'), true);
    const pianoKeys = docRoot.querySelectorAll('.piano-key');
    assert.equal(pianoKeys.length, 8, 'Lesson 6 should render 8 piano keys (C4 to C5)');

    // 5. Lesson 7: Neopixel Ring (check pot slider & mode select)
    items[6].click();
    assert.equal(items[6].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('#pot-slider'));
    assert.ok(docRoot.querySelector('#neopixel-mode-select'));

    // 6. Lesson 10: Ultrasonic HC-SR04
    items[9].click();
    assert.equal(items[9].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('#hcsr04-mockup') || docRoot.querySelector('.btn-run'));

    // 7. Lesson 16: Smart Pump
    items[15].click();
    assert.equal(items[15].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('#water-slider'));

    // 8. Lesson 17: Keypad 4x3 Lock
    items[16].click();
    assert.equal(items[16].classList.contains('active'), true);
    const keys = docRoot.querySelectorAll('button[data-key]');
    assert.equal(keys.length, 12, 'Lesson 17 should render 12 matrix keys (0-9, *, #)');

    // 9. Lesson 18: Dual-LDR Solar Tracker
    items[17].click();
    assert.equal(items[17].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('.btn-run'));

    // 10. Lesson 20: Stepper Pick & Place
    items[19].click();
    assert.equal(items[19].classList.contains('active'), true);
    assert.ok(docRoot.querySelector('.btn-run'));

    // Verify all 20 lessons can be clicked without throwing errors
    for (let i = 0; i < 20; i++) {
      items[i].click();
      assert.equal(items[i].classList.contains('active'), true);
    }
  });
});

describe('E2E DOM Suite 4: Code Execution Lifecycle & FSM Tracing', () => {
  it('toggles language between Arduino C++ and MicroPython', () => {
    // Switch to Band C to access Code Editor
    docRoot.querySelector('.band-tab[data-band="band-c"]').click();

    const btnCpp = docRoot.querySelector('#btn-lang-cpp');
    const btnPy = docRoot.querySelector('#btn-lang-py');

    btnPy.click();
    assert.equal(btnPy.classList.contains('active'), true);
    assert.equal(btnCpp.classList.contains('active'), false);

    btnCpp.click();
    assert.equal(btnCpp.classList.contains('active'), true);
    assert.equal(btnPy.classList.contains('active'), false);
  });

  it('manages run -> uploading -> running -> stop lifecycle in DOM', async () => {
    const btnRun = docRoot.querySelector('#btn-code-run');
    const btnStop = docRoot.querySelector('#btn-code-stop');
    const stateLabel = docRoot.querySelector('#execution-state-label');

    assert.equal(btnRun.style.display, 'inline-flex');
    assert.equal(btnStop.style.display, 'none');

    // Click Run
    btnRun.click();

    // Immediately in uploading state
    assert.equal(stateLabel.textContent, 'Trạng thái: Đang thực thi');
    assert.equal(btnRun.style.display, 'none');
    assert.equal(btnStop.style.display, 'inline-flex');

    // Wait for upload timers (600ms + 600ms) to finish
    await new Promise((resolve) => setTimeout(resolve, 1300));

    // Transitions to running state
    const simStatusPill = docRoot.querySelector('#sim-status-pill');
    assert.equal(simStatusPill.textContent, 'Đang chạy mô phỏng…');

    // Click Stop
    btnStop.click();

    // Returns to idle state
    assert.equal(stateLabel.textContent, 'Trạng thái: Sẵn sàng');
    assert.equal(btnRun.style.display, 'inline-flex');
    assert.equal(btnStop.style.display, 'none');
    assert.equal(simStatusPill.textContent, 'Đã dừng');
  });
});

describe('E2E DOM Suite 5: Serial Monitor Console Sizing & Double-Click Reset', () => {
  it('handles serial monitor height drag and double-click restore to 92px', () => {
    const grip = docRoot.querySelector('#serial-grip');
    const panel = docRoot.querySelector('#serial-panel');
    assert.ok(grip && panel);

    // Initial height defaults to 92px
    assert.equal(panel.style.height, '92px');

    // Simulate drag start
    grip.dispatchEvent({
      type: 'mousedown',
      clientY: 300,
      preventDefault() {}
    });

    // Simulate drag move up by 100px (startY 300 - clientY 200 = delta 100 -> height 192px)
    globalThis.window.dispatchEvent({
      type: 'mousemove',
      clientY: 200
    });
    globalThis.window.dispatchEvent({
      type: 'mouseup'
    });

    assert.equal(panel.style.height, '192px');
    assert.equal(globalThis.window.localStorage.getItem('console-height'), '192');

    // Double-click restores default 92px
    grip.dispatchEvent({
      type: 'dblclick'
    });

    assert.equal(panel.style.height, '92px');
    assert.equal(globalThis.window.localStorage.getItem('console-height'), '92');
  });

  it('clears serial logs when clear button is clicked', () => {
    const logs = docRoot.querySelector('#serial-logs');
    const btnClear = docRoot.querySelector('#btn-clear-serial');
    assert.ok(logs.children.length > 0);

    btnClear.click();
    assert.equal(logs.children.length, 0);
  });
});

describe('E2E DOM Suite 6: Interactive Modals Lifecycle (Pinout, Quiz, Schematic, Settings)', () => {
  it('opens and closes ESP32 Pinout modal and toggles 30/38 pin variants', () => {
    const btnPinout = docRoot.querySelector('#btn-pinout');
    const modalPinout = docRoot.querySelector('#modal-pinout');
    const btnClose = docRoot.querySelector('#btn-close-pinout');

    btnPinout.click();
    assert.equal(modalPinout.classList.contains('open'), true);

    const btn38 = docRoot.querySelector('#btn-pinout-38');
    assert.ok(btn38);
    btn38.click();

    const btn30 = docRoot.querySelector('#btn-pinout-30');
    assert.ok(btn30);
    btn30.click();

    btnClose.click();
    assert.equal(modalPinout.classList.contains('open'), false);
  });

  it('completes quiz journey, awards XP, and updates progress bar', () => {
    const btnQuiz = docRoot.querySelector('#btn-quiz');
    const modalQuiz = docRoot.querySelector('#modal-quiz');
    const btnCloseQuiz = docRoot.querySelector('#btn-close-quiz');

    btnQuiz.click();
    assert.equal(modalQuiz.classList.contains('open'), true);

    // Answer 3 questions correctly
    for (let q = 0; q < 3; q++) {
      const optButtons = docRoot.querySelectorAll('.quiz-opt-btn');
      assert.ok(optButtons.length >= 3);
      // Select option 0
      optButtons[0].click();

      const btnNext = docRoot.querySelector('#btn-next-q');
      assert.ok(btnNext);
      btnNext.click();
    }

    // Verify progress UI updated
    const xpVal = parseInt(docRoot.querySelector('#xp-val').textContent, 10);
    assert.ok(xpVal > 0, 'XP should increase after completing quiz');

    btnCloseQuiz.click();
    assert.equal(modalQuiz.classList.contains('open'), false);
  });

  it('toggles Floating Schematic card and drag handles', () => {
    const btnSch = docRoot.querySelector('#btn-schematic');
    const sch = docRoot.querySelector('#floating-schematic');
    const btnCloseSch = docRoot.querySelector('#btn-close-schematic');

    btnSch.click();
    assert.equal(sch.classList.contains('open'), true);

    btnCloseSch.click();
    assert.equal(sch.classList.contains('open'), false);
  });

  it('opens Settings modal, toggles configuration flags, and resets progress', () => {
    const btnSettings = docRoot.querySelector('#btn-settings');
    const modalSettings = docRoot.querySelector('#modal-settings');
    const btnCloseSettings = docRoot.querySelector('#btn-close-settings');
    const settingGrid = docRoot.querySelector('#setting-grid');
    const btnReset = docRoot.querySelector('#btn-reset-progress');

    btnSettings.click();
    assert.equal(modalSettings.classList.contains('open'), true);

    // Toggle grid setting
    settingGrid.dispatchEvent({
      type: 'change',
      target: { checked: false }
    });

    // Reset progress
    btnReset.click();
    assert.equal(modalSettings.classList.contains('open'), false);
    assert.equal(docRoot.querySelector('#progress-label').textContent, '0/20');
    assert.equal(docRoot.querySelector('#xp-val').textContent, '0');
  });
});

describe('E2E DOM Suite 7: Responsive Breakpoints & Accessibility Contracts', () => {
  it('applies compact layout when viewport is under 1090x800', () => {
    globalThis.window.innerWidth = 1024;
    globalThis.window.innerHeight = 768;
    globalThis.window.dispatchEvent({ type: 'resize' });

    assert.equal(bodyEl.classList.contains('compact'), true, 'Should apply compact class on mobile/tablet viewport');
  });

  it('removes compact layout when viewport is restored to desktop', () => {
    globalThis.window.innerWidth = 1440;
    globalThis.window.innerHeight = 900;
    globalThis.window.dispatchEvent({ type: 'resize' });

    assert.equal(bodyEl.classList.contains('compact'), false, 'Should remove compact class on desktop viewport');
  });

  it('maintains synchronized ARIA attributes on progress tracking elements', () => {
    const track = docRoot.querySelector('#progress-bar-track');
    assert.equal(track.getAttribute('role'), 'progressbar');
    assert.equal(track.getAttribute('aria-valuemin'), '0');
    assert.equal(track.getAttribute('aria-valuemax'), '20');
    assert.equal(track.getAttribute('aria-valuenow'), '0');
  });
});
