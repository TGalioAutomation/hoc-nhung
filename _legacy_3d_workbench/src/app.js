/**
 * src/app.js
 * Master Application Controller wiring all 10 Clean-Room Rules & 20 Lessons
 * Strictly adhering to clean-room/SPEC.approved.md
 */

import {
  AgeBandController,
  AGE_BANDS,
  Esp32SafetyEngine,
  ESP32_CONSTANTS,
  BandASimulator,
  BandBSimulator,
  ProgressAndGamificationEngine,
  BADGES,
  CodeExecutionEngine,
  WirelessIoTSimulator,
  MechatronicsSimulator,
  ViewportAndSchematicController,
  EnvironmentAndA11yController
} from './engine.js';

import {
  LESSONS,
  ESP32_PINS_30,
  ESP32_PINS_38,
  WIRE_COLORS
} from './lessons.js';

import { Stage3D } from './stage3d.js';

/* =========================================================================
   1. State & Singletons Initialization
   ========================================================================= */

const ageBandCtrl = new AgeBandController();
const progressEngine = new ProgressAndGamificationEngine();
const codeEngine = new CodeExecutionEngine();
const wirelessSim = new WirelessIoTSimulator();
const viewportCtrl = new ViewportAndSchematicController();
const envCtrl = new EnvironmentAndA11yController();

let stage3d = null;
let activeLesson = LESSONS[0];
let activeCodeLang = 'cpp'; // 'cpp' or 'python'
let simRunTimer = null;
let simRunStartTime = 0;
let isSimulationActive = false;
let lessonLocalParams = {};

// Managed timer and audio handles
let uploadTimer1 = null;
let uploadTimer2 = null;
let activeAudioInterval = null;

function clearUploadTimers() {
  if (uploadTimer1) {
    clearTimeout(uploadTimer1);
    uploadTimer1 = null;
  }
  if (uploadTimer2) {
    clearTimeout(uploadTimer2);
    uploadTimer2 = null;
  }
}

function clearActiveAudio() {
  if (activeAudioInterval) {
    clearInterval(activeAudioInterval);
    activeAudioInterval = null;
  }
}

/* =========================================================================
   2. Web Audio Synthesizer (Instant sensory feedback - RULE-001, RULE-003)
   ========================================================================= */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, durationSec = 0.15, type = 'sine', volume = 0.2) {
  if (!envCtrl.getSetting('sound')) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch (err) {
    console.warn('Audio playback error', err);
  }
}

function playClickSound() {
  playTone(800, 0.05, 'triangle', 0.1);
}

function playSuccessChime() {
  if (!envCtrl.getSetting('sound')) return;
  playTone(523.25, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 100);
  setTimeout(() => playTone(783.99, 0.25, 'sine', 0.3), 200);
}

function playErrorBuzz() {
  playTone(180, 0.25, 'sawtooth', 0.25);
}

/* =========================================================================
   3. DOM Elements Cache
   ========================================================================= */

const elements = {
  bandTabs: document.querySelectorAll('.band-tab'),
  bandBadge: document.getElementById('band-badge'),
  xpVal: document.getElementById('xp-val'),
  progressBarTrack: document.getElementById('progress-bar-track'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressLabel: document.getElementById('progress-label'),
  lessonsList: document.getElementById('lessons-list'),
  activeLessonCounter: document.getElementById('active-lesson-counter'),

  // Viewport
  artboard: document.getElementById('artboard'),
  webglStage: document.getElementById('webgl-stage'),
  inspLines: document.getElementById('insp-lines'),
  inspectorCardsLayer: document.getElementById('inspector-cards-layer'),
  inspector: document.getElementById('inspector'),
  inspHeader: document.getElementById('insp-header'),
  inspTitle: document.getElementById('insp-title'),
  inspDesc: document.getElementById('insp-desc'),
  inspPins: document.getElementById('insp-pins'),
  btnCloseInspector: document.getElementById('btn-close-inspector'),
  bottomCarousel: document.getElementById('bottom-carousel'),
  carouselTrack: document.getElementById('carousel-track'),
  btnCarouselPrev: document.getElementById('btn-carousel-prev'),
  btnCarouselNext: document.getElementById('btn-carousel-next'),

  // Left Icon Rail & Drawer
  iconRail: document.getElementById('icon-rail'),
  btnRailHome: document.getElementById('btn-rail-home'),
  btnRailLessons: document.getElementById('btn-rail-lessons'),
  btnRailComponents: document.getElementById('btn-rail-components'),
  btnRailReference: document.getElementById('btn-rail-reference'),
  btnRailSettings: document.getElementById('btn-rail-settings'),
  btnRailLanguage: document.getElementById('btn-rail-language'),
  lessonsSidebarDrawer: document.getElementById('lessons-sidebar-drawer'),
  btnCloseLessonsDrawer: document.getElementById('btn-close-lessons-drawer'),

  // Top Card & 5 Tabs
  topLessonBadge: document.getElementById('top-lesson-badge'),
  topLessonTitle: document.getElementById('top-lesson-title'),
  btnPrevLesson: document.getElementById('btn-prev-lesson'),
  btnNextLesson: document.getElementById('btn-next-lesson'),
  tabOverview: document.getElementById('tab-overview'),
  tabPinout: document.getElementById('tab-pinout'),
  tabQuiz: document.getElementById('tab-quiz'),
  tabSafeguard: document.getElementById('tab-safeguard'),
  tabProgress: document.getElementById('tab-progress'),
  btnOpenFullPinout: document.getElementById('btn-open-full-pinout'),
  btnOpenFullQuiz: document.getElementById('btn-open-full-quiz'),
  lessonDescText: document.getElementById('lesson-description-text'),
  tabPinoutBody: document.getElementById('tab-pinout-body'),
  tabQuizBody: document.getElementById('tab-quiz-body'),
  progressTabStats: document.getElementById('progress-tab-stats'),

  // Header Tools
  btnBoard30: document.getElementById('btn-board-30'),
  btnBoard38: document.getElementById('btn-board-38'),
  btnModeBlocks: document.getElementById('btn-mode-blocks'),

  hardwareStage: document.getElementById('hardware-stage'),
  gridOverlay: document.getElementById('grid-overlay'),
  simDynamicActors: document.getElementById('sim-dynamic-actors'),
  ledOnboard: document.getElementById('led-gpio2-indicator'),
  ledPwr: document.getElementById('led-pwr-indicator'),
  ledTx: document.getElementById('led-tx'),
  ledRx: document.getElementById('led-rx'),
  interactiveTitle: document.getElementById('interactive-title'),
  simStatusPill: document.getElementById('sim-status-pill'),
  interactiveControls: document.getElementById('interactive-controls-container'),

  // Viewport Toolbar Buttons
  btnZoomIn: document.getElementById('btn-zoom-in'),
  btnZoomOut: document.getElementById('btn-zoom-out'),
  btnRotLeft: document.getElementById('btn-rot-left'),
  btnRotRight: document.getElementById('btn-rot-right'),
  btnResetView: document.getElementById('btn-reset-view'),
  btnToggleGrid: document.getElementById('btn-toggle-grid'),
  btnToggleSound: document.getElementById('btn-toggle-sound'),

  // Cognitive Panels
  storyCardsContainer: document.getElementById('story-cards-container'),
  blocksWorkspaceContainer: document.getElementById('blocks-workspace-container'),
  blocksList: document.getElementById('blocks-list'),
  btnRunBlocks: document.getElementById('btn-run-blocks'),

  codeEditorContainer: document.getElementById('code-editor-container'),
  btnLangCpp: document.getElementById('btn-lang-cpp'),
  btnLangPy: document.getElementById('btn-lang-py'),
  codeDisplay: document.getElementById('code-display'),
  btnCodeRun: document.getElementById('btn-code-run'),
  btnCodeStop: document.getElementById('btn-code-stop'),
  executionStateLabel: document.getElementById('execution-state-label'),
  serialPanel: document.getElementById('serial-panel'),
  serialGrip: document.getElementById('serial-grip'),
  serialLogs: document.getElementById('serial-logs'),
  btnClearSerial: document.getElementById('btn-clear-serial'),

  // Modals
  floatingSchematic: document.getElementById('floating-schematic'),
  schematicHandle: document.getElementById('schematic-drag-handle'),
  schGrip: document.getElementById('sch-grip'),
  schematicContent: document.getElementById('schematic-content'),
  btnCloseSchematic: document.getElementById('btn-close-schematic'),
  btnSchematic: document.getElementById('btn-schematic'),

  modalPinout: document.getElementById('modal-pinout'),
  pinoutGridContent: document.getElementById('pinout-grid-content'),
  btnPinout: document.getElementById('btn-pinout'),
  btnClosePinout: document.getElementById('btn-close-pinout'),

  modalQuiz: document.getElementById('modal-quiz'),
  quizModalContent: document.getElementById('quiz-modal-content'),
  btnQuiz: document.getElementById('btn-quiz'),
  btnCloseQuiz: document.getElementById('btn-close-quiz'),

  modalSettings: document.getElementById('modal-settings'),
  btnSettings: document.getElementById('btn-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  settingLabels: document.getElementById('setting-labels'),
  settingGrid: document.getElementById('setting-grid'),
  settingSound: document.getElementById('setting-sound'),
  settingReducedMotion: document.getElementById('setting-reduced-motion'),
  btnResetProgress: document.getElementById('btn-reset-progress'),

  tip: document.getElementById('tip')
};

/* =========================================================================
   4. UI Synchronization & Age Band Switching (RULE-001)
   ========================================================================= */

function syncAgeBandUI(band) {
  const cap = ageBandCtrl.getCapabilities(band);

  // Update tabs active state
  elements.bandTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.band === band);
  });

  // Update header text
  if (elements.bandBadge) {
    elements.bandBadge.textContent = `${cap.modeName} (${cap.ageRange})`;
  }

  // Update document attribute
  document.documentElement.setAttribute('data-age-band', band);

  // Render active lesson content for the new band
  renderActiveLesson();
  playClickSound();
}

function syncProgressUI() {
  const pct = progressEngine.getProgressPercentage();
  const text = progressEngine.getProgressText();
  const aria = progressEngine.getAriaAttributes();

  if (elements.xpVal) elements.xpVal.textContent = progressEngine.xp;
  if (elements.progressBarFill) elements.progressBarFill.style.width = `${pct}%`;
  if (elements.progressLabel) elements.progressLabel.textContent = text;

  if (elements.progressBarTrack) {
    elements.progressBarTrack.setAttribute('aria-valuemin', aria['aria-valuemin']);
    elements.progressBarTrack.setAttribute('aria-valuemax', aria['aria-valuemax']);
    elements.progressBarTrack.setAttribute('aria-valuenow', aria['aria-valuenow']);
  }

  // Update sidebar checkmarks
  const items = document.querySelectorAll('.lesson-item');
  items.forEach((item) => {
    const id = item.dataset.lessonId;
    const isDone = progressEngine.isLessonCompleted(id);
    item.classList.toggle('completed', isDone);
    const checkEl = item.querySelector('.check-icon');
    if (checkEl) checkEl.style.display = isDone ? 'inline' : 'none';
  });
}

/* =========================================================================
   5. Lessons Catalog & Selection UI (RULE-005)
   ========================================================================= */

function renderLessonsList() {
  if (!elements.lessonsList) return;
  elements.lessonsList.innerHTML = '';

  LESSONS.forEach((lesson) => {
    const li = document.createElement('li');
    li.className = `lesson-item ${lesson.id === activeLesson.id ? 'active' : ''} ${progressEngine.isLessonCompleted(lesson.id) ? 'completed' : ''}`;
    li.dataset.lessonId = lesson.id;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Bài ${lesson.number}: ${lesson.title.vi}`);

    li.innerHTML = `
      <span class="lesson-num">${String(lesson.number).padStart(2, '0')}</span>
      <div class="lesson-info">
        <div class="lesson-title-text">${lesson.title.vi}</div>
        <span class="lesson-badge-tag">${lesson.hardware.vi.split(',')[0]}</span>
      </div>
      <span class="check-icon" style="display: ${progressEngine.isLessonCompleted(lesson.id) ? 'inline' : 'none'};">✓</span>
    `;

    li.addEventListener('click', () => selectLesson(lesson));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectLesson(lesson);
      }
    });

    elements.lessonsList.appendChild(li);
  });

  renderBottomCarousel();
}

function renderBottomCarousel() {
  if (!elements.carouselTrack) return;
  elements.carouselTrack.innerHTML = '';
  LESSONS.forEach((lesson) => {
    const card = document.createElement('div');
    card.className = `carousel-card ${lesson.id === activeLesson.id ? 'active' : ''}`;
    card.dataset.lessonId = lesson.id;
    card.innerHTML = `
      <span class="carousel-card-num">Bài ${String(lesson.number).padStart(2, '0')}</span>
      <span class="carousel-card-title">${lesson.title.vi}</span>
    `;
    card.addEventListener('click', () => {
      selectLesson(lesson);
    });
    elements.carouselTrack.appendChild(card);
  });
}

function syncCarouselActive(lesson) {
  if (!elements.carouselTrack) return;
  const cards = elements.carouselTrack.querySelectorAll('.carousel-card');
  cards.forEach((c) => {
    c.classList.toggle('active', c.dataset.lessonId === lesson.id);
  });
}

function selectLesson(lesson) {
  clearUploadTimers();
  clearActiveAudio();
  activeLesson = lesson;
  lessonLocalParams = { ...lesson.defaultParams };
  stopSimulation();

  // Highlight in sidebar & bottom carousel
  document.querySelectorAll('.lesson-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.lessonId === lesson.id);
  });
  syncCarouselActive(lesson);

  // Sync 3D WebGL Workbench Stage
  if (stage3d) {
    stage3d.setLesson(lesson.number);
  }

  renderActiveLesson();
  playClickSound();
}

/* =========================================================================
   6. Render Active Lesson across 3 Cognitive Bands
   ========================================================================= */

function renderActiveLesson() {
  const band = ageBandCtrl.getBand();

  // 1. Render Band A: Visual Story Cards
  if (elements.storyCardsContainer) {
    elements.storyCardsContainer.innerHTML = '';
    (activeLesson.storyCards || []).forEach((card) => {
      const cardEl = document.createElement('article');
      cardEl.className = 'story-card';
      cardEl.innerHTML = `
        <div class="story-icon">${card.icon}</div>
        <h3 class="story-title">${card.titleVi}</h3>
        <p class="story-text">${card.textVi}</p>
        <button class="btn-story-action btn-action" aria-label="Thử ngay: ${card.titleVi}">
          <span>▶</span> Chạm để tương tác!
        </button>
      `;
      const actionBtn = cardEl.querySelector('.btn-story-action');
      actionBtn.addEventListener('click', () => {
        playTone(587.33, 0.2, 'sine', 0.25);
        startSimulation();
      });
      elements.storyCardsContainer.appendChild(cardEl);
    });
  }

  // 2. Render Band B: Visual Block Workspace
  if (elements.blocksList) {
    elements.blocksList.innerHTML = '';
    (activeLesson.blocks || []).forEach((blk) => {
      const blkEl = document.createElement('div');
      let typeClass = 'output';
      if (blk.type === 'forever' || blk.type === 'on_start') typeClass = 'loop';
      if (blk.type.includes('if') || blk.type.includes('check')) typeClass = 'logic';

      blkEl.className = `block-item ${typeClass}`;
      blkEl.textContent = blk.label || blk.type;
      elements.blocksList.appendChild(blkEl);
    });
  }

  // 3. Render Band C: Code Editor
  renderCodeEditor();

  // 4. Render Interactive Hardware & Controls
  renderSimulationStage();
  renderInteractiveControls();
  renderSchematic();

  // 5. Update Top Right Card Details & Tabs
  if (elements.topLessonBadge) {
    elements.topLessonBadge.textContent = `BÀI ${String(activeLesson.number).padStart(2, '0')} / 20`;
  }
  if (elements.topLessonTitle) {
    elements.topLessonTitle.textContent = activeLesson.title.vi;
  }
  if (elements.lessonDescText) {
    elements.lessonDescText.textContent = activeLesson.description?.vi || '';
  }
  if (elements.tabPinoutBody) {
    const pinsUsed = activeLesson.pins || [];
    elements.tabPinoutBody.innerHTML = `
      <div style="font-size:0.75rem; margin-bottom:6px; color:var(--ink);">Chân sử dụng: <strong style="color:var(--navy);">${pinsUsed.join(', ') || 'Chân tích hợp'}</strong></div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${pinsUsed.map((p) => `<div style="background:var(--bg-deep); padding:4px 8px; border-radius:4px; font-size:0.72rem; font-family:var(--mono);">GPIO ${p}: ${activeLesson.title.vi}</div>`).join('')}
      </div>
    `;
  }
  if (elements.tabQuizBody) {
    const qCount = (activeLesson.quiz || []).length;
    elements.tabQuizBody.innerHTML = `
      <div style="font-size:0.78rem; line-height:1.35; margin-bottom:8px; color:var(--ink);">
        Bài học này gồm <strong>${qCount}</strong> câu đố thử thách. Đạt 2/3 câu để nhận XP và huy hiệu!
      </div>
    `;
  }
  if (elements.progressTabStats) {
    const completedCount = progressEngine.completedLessons.length;
    const xp = progressEngine.xp;
    const badgeCount = progressEngine.badges.length;
    elements.progressTabStats.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem; color:var(--ink);">
        <div>Điểm kinh nghiệm: <strong style="color:var(--accent);">${xp} XP</strong></div>
        <div>Đã hoàn thành: <strong style="color:var(--navy);">${completedCount} / 20 Bài</strong></div>
        <div>Huy hiệu đã mở: <strong style="color:var(--green);">${badgeCount} / ${BADGES.length}</strong></div>
      </div>
    `;
  }
}

function renderCodeEditor() {
  if (!elements.codeDisplay) return;
  const rawCode = activeCodeLang === 'cpp' ? activeLesson.codeCpp : activeLesson.codePy;
  const interpolated = codeEngine.substituteParams(rawCode, lessonLocalParams);

  elements.codeDisplay.innerHTML = '';
  const lines = interpolated.split('\n');
  lines.forEach((line, idx) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'code-line';
    lineEl.dataset.lineIndex = idx;
    lineEl.textContent = line.length > 0 ? line : ' ';
    elements.codeDisplay.appendChild(lineEl);
  });
}

function renderSchematic() {
  if (!elements.schematicContent) return;
  const sch = activeLesson.schematic;
  elements.schematicContent.innerHTML = `
    <h4 style="color:var(--color-text-bright); margin-bottom: 0.5rem;">Sơ đồ: ${activeLesson.title.vi}</h4>
    <div style="background:#090d16; padding: 10px; border-radius: var(--radius-md); font-family:var(--font-mono); font-size:0.8rem; margin-bottom: 0.75rem; border:1px solid var(--color-border);">
      ${sch.diagram}
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      ${(sch.rails || []).map(r => `<span class="pin-tag io">${r}</span>`).join('')}
    </div>
  `;
}

/* =========================================================================
   7. Interactive Hardware Simulator & Controls (RULE-002, 003, 004, 007, 008)
   ========================================================================= */

function renderSimulationStage() {
  if (!elements.simDynamicActors) return;
  elements.simDynamicActors.innerHTML = '';

  const id = activeLesson.id;

  if (id === 'blink') {
    // 2 External LEDs (Red GPIO 21, Yellow GPIO 22)
    elements.simDynamicActors.innerHTML = `
      <!-- Breadboard wire lines -->
      <line x1="430" y1="180" x2="350" y2="180" stroke="${WIRE_COLORS.signalAmber}" stroke-width="3" />
      <line x1="430" y1="200" x2="350" y2="200" stroke="${WIRE_COLORS.signalAmber}" stroke-width="3" />
      <!-- External Red LED -->
      <circle cx="320" cy="180" r="10" fill="#ff3b30" id="ext-led-red" data-tip="Đèn LED Đỏ GPIO 21 (Red LED 220Ω)" filter="drop-shadow(0 0 6px #ff3b30)" />
      <text x="320" y="165" fill="#a0aec0" font-size="10" text-anchor="middle">GPIO 21</text>
      <!-- External Yellow LED -->
      <circle cx="320" cy="210" r="10" fill="#554400" id="ext-led-yellow" data-tip="Đèn LED Vàng GPIO 22 (Yellow LED 220Ω)" />
      <text x="320" y="235" fill="#a0aec0" font-size="10" text-anchor="middle">GPIO 22</text>
    `;
  } else if (id === 'knob') {
    // 12-LED Neopixel Ring
    elements.simDynamicActors.innerHTML = `
      <g id="neopixel-ring-group" data-tip="Vòng 12 Neopixel WS2812B RGB (GPIO 18)" transform="translate(340, 130)">
        <circle cx="0" cy="0" r="45" fill="none" stroke="#252b3b" stroke-width="16" />
        <g id="ring-leds-layer"></g>
      </g>
    `;
    updateNeopixelRingVisual(lessonLocalParams.potVal || 2048, lessonLocalParams.mode || 'rainbow');
  } else if (id === 'sensor' || id === 'radar') {
    // Ultrasonic transducer eyes
    elements.simDynamicActors.innerHTML = `
      <g id="hcsr04-mockup" data-tip="Cảm biến siêu âm HC-SR04P 3.3V" transform="translate(320, 90)">
        <rect x="0" y="0" width="70" height="40" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" />
        <circle cx="20" cy="20" r="12" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
        <circle cx="50" cy="20" r="12" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
        <text x="35" y="55" fill="#94a3b8" font-size="9" text-anchor="middle">HC-SR04P</text>
      </g>
    `;
  } else if (id === 'servo' || id === 'solar') {
    // Servo horn
    elements.simDynamicActors.innerHTML = `
      <g id="servo-mockup" data-tip="Động cơ Servo SG90 (GPIO 13)" transform="translate(340, 130)">
        <rect x="-25" y="-20" width="50" height="40" rx="6" fill="#1e293b" stroke="#334155" stroke-width="2" />
        <line x1="0" y1="0" x2="35" y2="0" id="servo-arm" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />
        <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
      </g>
    `;
  } else if (id === 'pump') {
    // Water tank container
    elements.simDynamicActors.innerHTML = `
      <g id="pump-tank" data-tip="Bồn nước tự động (Relay Hysteresis)" transform="translate(310, 60)">
        <rect x="0" y="0" width="80" height="130" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <rect x="2" y="50" width="76" height="78" rx="4" fill="#0284c7" id="tank-water-rect" opacity="0.75" />
        <text x="40" y="-8" fill="#38bdf8" font-size="11" text-anchor="middle">Bồn Nước (Tank)</text>
      </g>
    `;
  }
}

function updateNeopixelRingVisual(potVal, mode) {
  const layer = document.getElementById('ring-leds-layer');
  if (!layer) return;
  const res = BandBSimulator.calculateNeopixelRing(potVal, 12, mode);
  layer.innerHTML = '';

  for (let i = 0; i < 12; i++) {
    const angleRad = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const r = 45;
    const cx = r * Math.cos(angleRad);
    const cy = r * Math.sin(angleRad);

    const ledCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ledCircle.setAttribute('cx', cx);
    ledCircle.setAttribute('cy', cy);
    ledCircle.setAttribute('r', '5');
    ledCircle.setAttribute('fill', res.leds[i].color);
    if (res.leds[i].lit) {
      ledCircle.setAttribute('filter', `drop-shadow(0 0 6px ${res.leds[i].color})`);
    }
    layer.appendChild(ledCircle);
  }
}

function renderInteractiveControls() {
  if (!elements.interactiveControls) return;
  elements.interactiveControls.innerHTML = '';
  const id = activeLesson.id;

  if (id === 'blink') {
    // Level Crossing rate slider
    const group = document.createElement('div');
    group.className = 'slider-group';
    group.innerHTML = `
      <label for="rate-slider"><strong>Chu kỳ trễ (t_rate):</strong> <span id="rate-val">${lessonLocalParams.rate || 500}</span> ms</label>
      <input type="range" id="rate-slider" min="100" max="1500" step="50" value="${lessonLocalParams.rate || 500}">
    `;
    elements.interactiveControls.appendChild(group);

    const slider = group.querySelector('#rate-slider');
    slider.addEventListener('input', (e) => {
      const val = BandASimulator.clampRate(Number(e.target.value));
      lessonLocalParams.rate = val;
      group.querySelector('#rate-val').textContent = val;
      renderCodeEditor();
    });
  } else if (id === 'button') {
    // Fridge door open angle slider
    const group = document.createElement('div');
    group.className = 'slider-group';
    group.innerHTML = `
      <label for="angle-slider"><strong>Góc mở cửa (θ):</strong> <span id="angle-val">0</span>°</label>
      <input type="range" id="angle-slider" min="0" max="90" value="0">
      <span id="fridge-status-msg" style="color:var(--color-success); font-weight:700;">Cửa đóng</span>
    `;
    elements.interactiveControls.appendChild(group);

    const slider = group.querySelector('#angle-slider');
    slider.addEventListener('input', (e) => {
      const angle = Number(e.target.value);
      lessonLocalParams.openAngle = angle;
      group.querySelector('#angle-val').textContent = angle;
      const statusMsg = group.querySelector('#fridge-status-msg');
      if (angle > 12) {
        statusMsg.textContent = 'Cảnh báo: Cửa đang mở!';
        statusMsg.style.color = 'var(--color-warning)';
      } else {
        statusMsg.textContent = 'Cửa đóng an toàn';
        statusMsg.style.color = 'var(--color-success)';
      }
    });
  } else if (id === 'sound') {
    // Siren sweep speed
    const btnSweep = document.createElement('button');
    btnSweep.className = 'btn-run';
    btnSweep.textContent = '🔊 Phát Còi Hú 400Hz - 1200Hz';
    btnSweep.addEventListener('click', () => {
      clearActiveAudio();
      let startTime = Date.now();
      activeAudioInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 3200) {
          clearActiveAudio();
          return;
        }
        const freq = BandASimulator.getSirenFrequency(elapsed, 1600);
        playTone(freq, 0.05, 'sawtooth', 0.15);
      }, 50);
    });
    elements.interactiveControls.appendChild(btnSweep);
  } else if (id === 'piano') {
    // 8 Touch Piano Keys
    const kb = document.createElement('div');
    kb.className = 'piano-keyboard';
    const notes = BandASimulator.getPianoNotes();
    notes.forEach((n) => {
      const keyBtn = document.createElement('div');
      keyBtn.className = 'piano-key';
      keyBtn.dataset.note = n.name;
      keyBtn.innerHTML = `<span>${n.name}</span><small style="font-size:0.65rem;">${Math.round(n.freq)}Hz</small>`;

      const triggerNote = () => {
        keyBtn.classList.add('active');
        playTone(n.freq, 0.25, 'triangle', 0.3);
        setTimeout(() => keyBtn.classList.remove('active'), 200);
        if (elements.ledOnboard) {
          elements.ledOnboard.classList.add('lit');
          setTimeout(() => elements.ledOnboard.classList.remove('lit'), 150);
        }
      };

      keyBtn.addEventListener('mousedown', triggerNote);
      keyBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerNote();
      });
      kb.appendChild(keyBtn);
    });
    elements.interactiveControls.appendChild(kb);
  } else if (id === 'knob') {
    // Neopixel ADC Potentiometer slider
    const group = document.createElement('div');
    group.className = 'slider-group';
    group.innerHTML = `
      <label for="pot-slider"><strong>Biến trở ADC (0..4095):</strong> <span id="pot-val">2048</span></label>
      <input type="range" id="pot-slider" min="0" max="4095" value="2048" style="width:200px;">
      <select id="neopixel-mode-select" style="background:var(--color-bg); color:#fff; border:1px solid var(--color-border); padding:4px; border-radius:4px;">
        <option value="rainbow">Cầu vồng (Rainbow)</option>
        <option value="blue">Xanh Lam (Blue)</option>
        <option value="traffic">Giao thông (Traffic)</option>
      </select>
    `;
    elements.interactiveControls.appendChild(group);

    const slider = group.querySelector('#pot-slider');
    const select = group.querySelector('#neopixel-mode-select');

    slider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      lessonLocalParams.potVal = val;
      group.querySelector('#pot-val').textContent = val;
      updateNeopixelRingVisual(val, select.value);
    });

    select.addEventListener('change', () => {
      lessonLocalParams.mode = select.value;
      updateNeopixelRingVisual(lessonLocalParams.potVal || 2048, select.value);
    });
  } else if (id === 'light') {
    // LDR Dark Slider
    const group = document.createElement('div');
    group.className = 'slider-group';
    group.innerHTML = `
      <label for="ldr-slider"><strong>Ánh sáng môi trường LDR:</strong> <span id="ldr-val">80%</span></label>
      <input type="range" id="ldr-slider" min="0" max="100" value="80">
      <span id="light-state-pill" class="pin-tag gnd">Đèn TẮT</span>
    `;
    elements.interactiveControls.appendChild(group);

    const slider = group.querySelector('#ldr-slider');
    const pill = group.querySelector('#light-state-pill');
    slider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      lessonLocalParams.ldrPercent = val;
      group.querySelector('#ldr-val').textContent = `${val}%`;
      const evalRes = BandASimulator.evaluateNightLight(val, 50);
      if (evalRes.ledOn) {
        pill.textContent = 'Trời tối -> Đèn BẬT';
        pill.className = 'pin-tag power';
        if (elements.ledOnboard) elements.ledOnboard.classList.add('lit');
      } else {
        pill.textContent = 'Trời sáng -> Đèn TẮT';
        pill.className = 'pin-tag gnd';
        if (elements.ledOnboard) elements.ledOnboard.classList.remove('lit');
      }
    });
  } else if (id === 'wifi') {
    // Virtual Smartphone for HTTP GET /toggle
    const phone = document.createElement('div');
    phone.style.cssText = 'background:#1e293b; padding:8px 14px; border-radius:10px; border:1px solid #475569; display:flex; align-items:center; gap:12px;';
    phone.innerHTML = `
      <span style="font-size:1.2rem;">📱</span>
      <span style="font-family:var(--font-mono); font-size:0.8rem; color:#38bdf8;">http://192.168.1.42/</span>
      <button class="btn-run" id="btn-http-toggle" style="padding:4px 12px; font-size:0.8rem;">GET /toggle</button>
    `;
    elements.interactiveControls.appendChild(phone);

    phone.querySelector('#btn-http-toggle').addEventListener('click', () => {
      const res = wirelessSim.handleHttpToggle();
      logSerial(`[HTTP] GET /toggle 200 OK -> LED is now ${res.data.led ? 'HIGH' : 'LOW'}`);
      if (elements.ledOnboard) {
        elements.ledOnboard.classList.toggle('lit', res.data.led);
      }
      playClickSound();
    });
  } else if (id === 'pump') {
    // Pump water level simulation
    const group = document.createElement('div');
    group.className = 'slider-group';
    group.innerHTML = `
      <label for="water-slider"><strong>Mực nước (H):</strong> <span id="water-val">15%</span></label>
      <input type="range" id="water-slider" min="0" max="100" value="15">
      <span id="pump-indicator" class="pin-tag power">Bơm: BẬT (<=20%)</span>
    `;
    elements.interactiveControls.appendChild(group);

    const slider = group.querySelector('#water-slider');
    const indicator = group.querySelector('#pump-indicator');
    slider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      lessonLocalParams.waterLevel = val;
      group.querySelector('#water-val').textContent = `${val}%`;

      const prevActive = lessonLocalParams.pumpActive || false;
      const res = MechatronicsSimulator.updatePumpHysteresis(val, prevActive);
      lessonLocalParams.pumpActive = res.pumpActive;

      indicator.textContent = res.pumpActive ? 'Bơm: BẬT (Kéo Relay HIGH)' : 'Bơm: TẮT (Chống tràn >=90%)';
      indicator.className = res.pumpActive ? 'pin-tag power' : 'pin-tag gnd';

      const waterRect = document.getElementById('tank-water-rect');
      if (waterRect) {
        const height = (val / 100) * 126;
        waterRect.setAttribute('height', height);
        waterRect.setAttribute('y', 130 - height);
      }
    });
  } else if (id === 'keypad') {
    // 4x3 Matrix Keypad Lock
    const keypadBox = document.createElement('div');
    keypadBox.style.cssText = 'display:flex; flex-direction:column; gap:6px; align-items:center;';
    const lockInstance = MechatronicsSimulator.createKeypadLock('1234');

    keypadBox.innerHTML = `
      <div style="background:#090d16; border:1px solid #334155; padding:4px 10px; border-radius:4px; font-family:var(--font-mono); font-size:0.9rem; color:#38ef7d; width:140px; text-align:center;" id="keypad-lcd">____</div>
      <div style="display:grid; grid-template-columns:repeat(3, 40px); gap:4px;" id="keypad-buttons">
        ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => `<button class="band-tab" data-key="${k}" style="padding:6px; font-weight:700; text-align:center;">${k}</button>`).join('')}
      </div>
      <span id="keypad-status" style="font-size:0.75rem; color:var(--color-text-muted);">Mã mẫu: 1234 rồi nhấn #</span>
    `;
    elements.interactiveControls.appendChild(keypadBox);

    const lcd = keypadBox.querySelector('#keypad-lcd');
    const statusMsg = keypadBox.querySelector('#keypad-status');

    keypadBox.querySelectorAll('button[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        const res = lockInstance.press(k);

        if (res.action === 'DIGIT') {
          lcd.textContent = '*'.repeat(lockInstance.buffer.length);
          playTone(1200, 0.05, 'sine', 0.15);
        } else if (res.action === 'CLEAR') {
          lcd.textContent = '____';
          playTone(2000, 0.08, 'sine', 0.2);
          statusMsg.textContent = 'Đã xóa bộ đệm.';
        } else if (res.action === 'UNLOCKED') {
          lcd.textContent = 'OPEN!';
          playSuccessChime();
          statusMsg.textContent = '🎉 MỞ KHÓA THÀNH CÔNG!';
          statusMsg.style.color = 'var(--color-success)';
        } else if (res.action === 'WRONG_PIN') {
          lcd.textContent = 'ERR!';
          playErrorBuzz();
          statusMsg.textContent = `Sai mã! Lần sai: ${res.failedAttempts}/3`;
          statusMsg.style.color = 'var(--color-danger)';
        } else if (res.action === 'LOCKOUT_TRIGGERED') {
          lcd.textContent = 'LOCK!';
          playErrorBuzz();
          statusMsg.textContent = 'Khóa nhập trong 10 giây!';
          statusMsg.style.color = 'var(--color-danger)';
        }
      });
    });
  } else {
    // Default Run/Test Action Button
    const btn = document.createElement('button');
    btn.className = 'btn-run';
    btn.innerHTML = '<span>⚡</span> Kích Hoạt Thử Nghiệm Mô Phỏng';
    btn.addEventListener('click', () => {
      startSimulation();
      playClickSound();
    });
    elements.interactiveControls.appendChild(btn);
  }
}

/* =========================================================================
   8. Simulation Engine Lifecycle & Verification Loop (RULE-005, RULE-006)
   ========================================================================= */

function startSimulation() {
  if (isSimulationActive) return;
  clearUploadTimers();
  isSimulationActive = true;
  simRunStartTime = Date.now();
  codeEngine.state = 'uploading';

  if (elements.simStatusPill) {
    elements.simStatusPill.textContent = 'Đang chạy mô phỏng…';
    elements.simStatusPill.style.background = 'var(--color-success)';
    elements.simStatusPill.style.color = '#fff';
  }

  if (elements.btnCodeRun) elements.btnCodeRun.style.display = 'none';
  if (elements.btnCodeStop) elements.btnCodeStop.style.display = 'inline-flex';
  if (elements.executionStateLabel) elements.executionStateLabel.textContent = 'Trạng thái: Đang thực thi';

  // Code uploading sequence (RULE-006: 600ms compile + 600ms connecting -> running)
  logSerial(`Compiling sketch for [${activeLesson.title.vi}]…`, 'info');
  if (elements.ledTx) elements.ledTx.classList.add('blinking');
  if (elements.ledRx) elements.ledRx.classList.add('blinking');

  uploadTimer1 = setTimeout(() => {
    logSerial('Connecting to ESP32 on USB…', 'info');
    uploadTimer2 = setTimeout(() => {
      logSerial('Writing… 100 %. Hard resetting via RTS pin.', 'info');
      logSerial('ESP32 setup() executed successfully.');
      if (elements.ledTx) elements.ledTx.classList.remove('blinking');
      if (elements.ledRx) elements.ledRx.classList.remove('blinking');
      uploadTimer1 = null;
      uploadTimer2 = null;
      codeEngine.state = 'running';
      runSimulationLoop();
    }, 600);
  }, 600);
}

function runSimulationLoop() {
  if (!isSimulationActive) return;

  const elapsed = Date.now() - simRunStartTime;

  // RULE-005 completion condition: Simulation runs error-free for >= 3000ms
  if (elapsed >= 3000 && !progressEngine.isLessonCompleted(activeLesson.id)) {
    const band = ageBandCtrl.getBand();
    const result = progressEngine.markLessonComplete(activeLesson.id, activeLesson.number, band);
    syncProgressUI();
    logSerial(`[HOÀN THÀNH] Bài học hoàn thành! +XP thưởng. Tiến trình: ${result.progressPercentage}%`, 'info');
    playSuccessChime();
  }

  // Visual simulation step
  if (activeLesson.id === 'blink') {
    const rate = lessonLocalParams.rate || 500;
    const isRedPhase = Math.floor(elapsed / rate) % 2 === 0;
    const redLed = document.getElementById('ext-led-red');
    const yelLed = document.getElementById('ext-led-yellow');
    if (redLed && yelLed) {
      redLed.setAttribute('fill', isRedPhase ? '#ff3b30' : '#441111');
      yelLed.setAttribute('fill', isRedPhase ? '#443300' : '#ffcc00');
    }
    // Line tracing (RULE-006)
    highlightCodeLine(isRedPhase ? 'digitalWrite(PIN_RED, HIGH)' : 'digitalWrite(PIN_YELLOW, HIGH)');

    if (stage3d) {
      stage3d.updateActorState('ledRed', isRedPhase);
      stage3d.updateActorState('ledGreen', !isRedPhase);
      stage3d.updateActorState('gpio2', isRedPhase);
    }
  } else if (activeLesson.id === 'servo' || activeLesson.id === 'solar') {
    const arm = document.getElementById('servo-arm');
    if (arm) {
      const angle = 45 + 45 * Math.sin(elapsed / 1000);
      arm.setAttribute('transform', `rotate(${angle})`);
    }
    if (stage3d) {
      if (activeLesson.id === 'servo') stage3d.updateActorState('servoGate', 45 + 45 * Math.sin(elapsed / 1000));
      if (activeLesson.id === 'solar') stage3d.updateActorState('solarTracker', 90 + 40 * Math.sin(elapsed / 1500));
    }
  } else if (stage3d) {
    if (activeLesson.id === 'motor') stage3d.updateActorState('dcMotor', 80);
    else if (activeLesson.id === 'pump') stage3d.updateActorState('waterLevel', 20 + 70 * (0.5 + 0.5 * Math.sin(elapsed / 2000)));
    else if (activeLesson.id === 'stepper') stage3d.updateActorState('stepperPosition', 100 + 80 * Math.sin(elapsed / 1200));
    stage3d.updateActorState('gpio2', true);
  }

  simRunTimer = requestAnimationFrame(runSimulationLoop);
}

function stopSimulation() {
  isSimulationActive = false;
  codeEngine.stop();
  clearUploadTimers();
  clearActiveAudio();
  if (simRunTimer) cancelAnimationFrame(simRunTimer);
  simRunTimer = null;

  if (stage3d) {
    stage3d.updateActorState('gpio2', false);
    stage3d.updateActorState('ledRed', false);
    stage3d.updateActorState('ledGreen', false);
  }

  if (elements.simStatusPill) {
    elements.simStatusPill.textContent = 'Đã dừng';
    elements.simStatusPill.style.background = 'var(--color-surface)';
    elements.simStatusPill.style.color = 'var(--color-text)';
  }

  if (elements.btnCodeRun) elements.btnCodeRun.style.display = 'inline-flex';
  if (elements.btnCodeStop) elements.btnCodeStop.style.display = 'none';
  if (elements.executionStateLabel) elements.executionStateLabel.textContent = 'Trạng thái: Sẵn sàng';

  // Remove line tracing glow
  document.querySelectorAll('.code-line.is-running').forEach(el => el.classList.remove('is-running'));
  if (elements.ledTx) elements.ledTx.classList.remove('blinking');
  if (elements.ledRx) elements.ledRx.classList.remove('blinking');
}

function highlightCodeLine(textSubstring) {
  const lines = document.querySelectorAll('.code-line');
  lines.forEach((el) => {
    if (el.textContent.includes(textSubstring)) {
      el.classList.add('is-running');
    } else {
      el.classList.remove('is-running');
    }
  });
}

function logSerial(msg, type = 'normal') {
  if (!elements.serialLogs) return;
  const line = document.createElement('span');
  line.className = `serial-line ${type}`;
  line.textContent = `> ${msg}`;
  elements.serialLogs.appendChild(line);
  elements.serialLogs.scrollTop = elements.serialLogs.scrollHeight;
}

/* =========================================================================
   9. Modals (Pinout, Quiz, Settings, Schematic)
   ========================================================================= */

// Pinout Modal with 30-pin / 38-pin toggle
let pinoutVariant = 30;

function renderPinoutGrid() {
  if (!elements.pinoutGridContent) return;
  elements.pinoutGridContent.innerHTML = '';

  const toggleBar = document.createElement('div');
  toggleBar.style.cssText = 'grid-column: 1 / -1; display: flex; gap: 8px; margin-bottom: 0.75rem;';
  toggleBar.innerHTML = `
    <button class="band-tab ${pinoutVariant === 30 ? 'active' : ''}" id="btn-pinout-30">Bo 30 Chân (NodeMCU DevKit V1)</button>
    <button class="band-tab ${pinoutVariant === 38 ? 'active' : ''}" id="btn-pinout-38">Bo 38 Chân (ESP-WROOM-38)</button>
  `;
  elements.pinoutGridContent.appendChild(toggleBar);

  toggleBar.querySelector('#btn-pinout-30').addEventListener('click', () => {
    pinoutVariant = 30;
    renderPinoutGrid();
  });
  toggleBar.querySelector('#btn-pinout-38').addEventListener('click', () => {
    pinoutVariant = 38;
    renderPinoutGrid();
  });

  const pins = pinoutVariant === 38 ? ESP32_PINS_38 : ESP32_PINS_30;
  const half = Math.ceil(pins.length / 2);

  const leftCol = document.createElement('div');
  const rightCol = document.createElement('div');

  pins.slice(0, half).forEach((p) => {
    const row = document.createElement('div');
    row.className = 'pin-row';
    row.innerHTML = `<span>#${p.pin} ${p.name}</span> <span class="pin-tag ${p.type}">${p.type}</span>`;
    leftCol.appendChild(row);
  });

  pins.slice(half).forEach((p) => {
    const row = document.createElement('div');
    row.className = 'pin-row';
    row.innerHTML = `<span>#${p.pin} ${p.name}</span> <span class="pin-tag ${p.type}">${p.type}</span>`;
    rightCol.appendChild(row);
  });

  elements.pinoutGridContent.appendChild(leftCol);
  elements.pinoutGridContent.appendChild(rightCol);
}

function openPinoutModal() {
  if (!elements.modalPinout) return;
  renderPinoutGrid();
  elements.modalPinout.classList.add('open');
}

// Quiz Modal (RULE-005: 2/3 pass, 3/3 first-try +25 XP bonus)
let currentQuizQuestionIdx = 0;
let currentQuizScore = 0;

function openQuizModal() {
  if (!elements.modalQuiz || !elements.quizModalContent) return;
  currentQuizQuestionIdx = 0;
  currentQuizScore = 0;
  renderQuizQuestion();
  elements.modalQuiz.classList.add('open');
}

function renderQuizQuestion() {
  const quizList = activeLesson.quiz || [];
  if (currentQuizQuestionIdx >= quizList.length) {
    // Finished Quiz
    const isPass = currentQuizScore >= 2;
    const isPerfect = currentQuizScore === 3;

    if (isPass) {
      const band = ageBandCtrl.getBand();
      progressEngine.markLessonComplete(activeLesson.id, activeLesson.number, band, currentQuizScore, isPerfect);
      syncProgressUI();
      playSuccessChime();
    } else {
      playErrorBuzz();
    }

    elements.quizModalContent.innerHTML = `
      <div style="text-align:center; padding: 1.5rem;">
        <h3 style="font-size: 1.5rem; color:${isPass ? 'var(--color-success)' : 'var(--color-danger)'}; margin-bottom: 0.5rem;">
          ${isPass ? '🎉 Chúc Mừng Bạn Đã Vượt Qua!' : 'Cố Gắng Lần Sau Nhé!'}
        </h3>
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">
          Kết quả của bạn: <strong>${currentQuizScore} / 3 câu đúng</strong>
        </p>
        ${isPerfect ? '<p style="color:#ffd166; font-weight:700;">⭐ Thưởng thêm +25 XP vì trả lời đúng 100%!</p>' : ''}
        <button class="btn-run" id="btn-quiz-finish" style="margin: 1rem auto;">Đóng Thử Thách</button>
      </div>
    `;
    elements.quizModalContent.querySelector('#btn-quiz-finish').addEventListener('click', () => {
      elements.modalQuiz.classList.remove('open');
    });
    return;
  }

  const qData = quizList[currentQuizQuestionIdx];
  elements.quizModalContent.innerHTML = `
    <div style="margin-bottom: 0.5rem; font-size:0.8rem; color:var(--color-primary); font-weight:700;">
      CÂU HỎI ${currentQuizQuestionIdx + 1} / 3
    </div>
    <div class="quiz-question">${qData.q}</div>
    <div class="quiz-options">
      ${qData.options.map((opt, i) => `
        <button class="quiz-opt-btn" data-opt-idx="${i}">
          ${String.fromCharCode(65 + i)}. ${opt}
        </button>
      `).join('')}
    </div>
    <div id="quiz-feedback-box" style="display:none;"></div>
  `;

  elements.quizModalContent.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = Number(btn.dataset.optIdx);
      const isCorrect = selected === qData.answer;
      if (isCorrect) currentQuizScore++;

      // Highlight buttons
      elements.quizModalContent.querySelectorAll('.quiz-opt-btn').forEach((b, i) => {
        b.disabled = true;
        if (i === qData.answer) b.classList.add('correct');
        else if (i === selected && !isCorrect) b.classList.add('wrong');
      });

      const feedback = document.getElementById('quiz-feedback-box');
      feedback.style.display = 'block';
      feedback.className = `quiz-feedback ${isCorrect ? 'success' : 'fail'}`;
      feedback.innerHTML = `
        <strong>${isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác.'}</strong>
        <p>${qData.explain}</p>
        <button class="btn-run" id="btn-next-q" style="margin-top: 8px; padding: 4px 12px; font-size: 0.8rem;">
          ${currentQuizQuestionIdx < 2 ? 'Câu tiếp theo ➡' : 'Xem kết quả 🏁'}
        </button>
      `;

      if (isCorrect) playTone(659.25, 0.15, 'sine', 0.2);
      else playErrorBuzz();

      feedback.querySelector('#btn-next-q').addEventListener('click', () => {
        currentQuizQuestionIdx++;
        renderQuizQuestion();
      });
    });
  });
}

// Floating Schematic (RULE-009)
function toggleSchematic() {
  const isOpen = viewportCtrl.toggleSchematic();
  elements.floatingSchematic?.classList.toggle('open', isOpen);
  elements.floatingSchematic?.classList.toggle('hidden', !isOpen);
  elements.btnSchematic?.classList.toggle('active', isOpen);
  playClickSound();
}

/* =========================================================================
   10. Global Event Listeners & Keyboard Shortcuts
   ========================================================================= */

function bindEvents() {
  // Age Band Switcher
  elements.bandTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const band = tab.dataset.band;
      ageBandCtrl.setBand(band);
      syncAgeBandUI(band);
    });
  });

  // Modals Toggles
  if (elements.btnPinout) elements.btnPinout.addEventListener('click', openPinoutModal);
  if (elements.btnClosePinout) elements.btnClosePinout.addEventListener('click', () => elements.modalPinout.classList.remove('open'));

  if (elements.btnQuiz) elements.btnQuiz.addEventListener('click', openQuizModal);
  if (elements.btnCloseQuiz) elements.btnCloseQuiz.addEventListener('click', () => elements.modalQuiz.classList.remove('open'));

  if (elements.btnSchematic) elements.btnSchematic.addEventListener('click', toggleSchematic);
  if (elements.btnCloseSchematic) elements.btnCloseSchematic.addEventListener('click', toggleSchematic);

  if (elements.btnSettings) elements.btnSettings.addEventListener('click', () => elements.modalSettings.classList.add('open'));
  if (elements.btnCloseSettings) elements.btnCloseSettings.addEventListener('click', () => elements.modalSettings.classList.remove('open'));

  // Settings Toggles (RULE-010)
  if (elements.settingGrid) {
    elements.settingGrid.addEventListener('change', (e) => {
      envCtrl.setSetting('grid', e.target.checked);
      if (elements.gridOverlay) elements.gridOverlay.style.display = e.target.checked ? 'block' : 'none';
    });
  }
  if (elements.settingSound) {
    elements.settingSound.addEventListener('change', (e) => {
      envCtrl.setSetting('sound', e.target.checked);
    });
  }
  if (elements.settingReducedMotion) {
    elements.settingReducedMotion.addEventListener('change', (e) => {
      envCtrl.setSetting('reducedMotion', e.target.checked);
      document.documentElement.setAttribute('data-reduced-motion', e.target.checked ? 'true' : 'false');
    });
  }

  // Reset Progress Button (RULE-005)
  if (elements.btnResetProgress) {
    elements.btnResetProgress.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ điểm kinh nghiệm và tiến trình học?')) {
        progressEngine.resetProgress();
        syncProgressUI();
        elements.modalSettings.classList.remove('open');
        playClickSound();
      }
    });
  }

  // Code Language Toggle (C++ / Python)
  if (elements.btnLangCpp) {
    elements.btnLangCpp.addEventListener('click', () => {
      activeCodeLang = 'cpp';
      elements.btnLangCpp.classList.add('active');
      elements.btnLangPy.classList.remove('active');
      renderCodeEditor();
      playClickSound();
    });
  }
  if (elements.btnLangPy) {
    elements.btnLangPy.addEventListener('click', () => {
      activeCodeLang = 'python';
      elements.btnLangPy.classList.add('active');
      elements.btnLangCpp.classList.remove('active');
      renderCodeEditor();
      playClickSound();
    });
  }

  // Code Run/Stop
  if (elements.btnCodeRun) elements.btnCodeRun.addEventListener('click', startSimulation);
  if (elements.btnCodeStop) elements.btnCodeStop.addEventListener('click', stopSimulation);
  if (elements.btnRunBlocks) elements.btnRunBlocks.addEventListener('click', startSimulation);
  if (elements.btnClearSerial) elements.btnClearSerial.addEventListener('click', () => {
    if (elements.serialLogs) elements.serialLogs.innerHTML = '';
  });

  // Serial Monitor Height Resize (RULE-006: 56px to 360px, double-click restores 92px)
  if (elements.serialGrip) {
    let isResizing = false;
    let startY = 0;
    let startH = 92;

    const savedH = codeEngine.getSavedConsoleHeight();
    if (elements.serialPanel) elements.serialPanel.style.height = `${savedH}px`;

    elements.serialGrip.addEventListener('mousedown', (e) => {
      isResizing = true;
      startY = e.clientY;
      if (elements.serialPanel) {
        startH = elements.serialPanel.offsetHeight;
      }
      document.body.style.cursor = 'row-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const delta = startY - e.clientY;
      const newH = codeEngine.saveConsoleHeight(startH + delta);
      if (elements.serialPanel) elements.serialPanel.style.height = `${newH}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
      }
    });

    elements.serialGrip.addEventListener('dblclick', () => {
      const defH = codeEngine.saveConsoleHeight(92);
      if (elements.serialPanel) elements.serialPanel.style.height = `${defH}px`;
    });
  }

  // Viewport Toolbar actions (RULE-009 & Stage3D)
  if (elements.btnZoomIn) {
    elements.btnZoomIn.addEventListener('click', () => {
      applyViewportTransform(viewportCtrl.zoomBy(1.15));
      if (stage3d) stage3d.zoomBy(1.15);
    });
  }
  if (elements.btnZoomOut) {
    elements.btnZoomOut.addEventListener('click', () => {
      applyViewportTransform(viewportCtrl.zoomBy(0.85));
      if (stage3d) stage3d.zoomBy(0.85);
    });
  }
  if (elements.btnRotLeft) {
    elements.btnRotLeft.addEventListener('click', () => {
      applyViewportTransform(viewportCtrl.rotate(-90));
      if (stage3d) stage3d.rotateAzimuth(-Math.PI / 8);
    });
  }
  if (elements.btnRotRight) {
    elements.btnRotRight.addEventListener('click', () => {
      applyViewportTransform(viewportCtrl.rotate(90));
      if (stage3d) stage3d.rotateAzimuth(Math.PI / 8);
    });
  }
  if (elements.btnResetView) {
    elements.btnResetView.addEventListener('click', () => {
      applyViewportTransform(viewportCtrl.reset());
      if (stage3d) stage3d.resetView();
    });
  }
  if (elements.btnToggleGrid) {
    elements.btnToggleGrid.addEventListener('click', () => {
      const cur = envCtrl.getSetting('grid');
      envCtrl.setSetting('grid', !cur);
      elements.btnToggleGrid.classList.toggle('active', !cur);
      if (elements.gridOverlay) elements.gridOverlay.style.display = !cur ? 'block' : 'none';
      if (stage3d) stage3d.setGridVisible(!cur);
    });
  }
  if (elements.btnToggleSound) {
    elements.btnToggleSound.addEventListener('click', () => {
      const cur = envCtrl.getSetting('sound');
      envCtrl.setSetting('sound', !cur);
      elements.btnToggleSound.classList.toggle('active', !cur);
      elements.btnToggleSound.textContent = !cur ? '🔊 Âm thanh' : '🔇 Tắt tiếng';
    });
  }

  // Floating Inspector Close & Drag (VISUAL_3D_SPEC.md: Section 5.3)
  if (elements.btnCloseInspector) {
    elements.btnCloseInspector.addEventListener('click', () => {
      if (elements.inspector) elements.inspector.classList.remove('open');
      if (elements.inspLines) elements.inspLines.innerHTML = '';
    });
  }

  if (elements.inspHeader && elements.inspector) {
    let isDraggingInsp = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    elements.inspHeader.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDraggingInsp = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = elements.inspector.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingInsp) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      elements.inspector.style.left = `${initialLeft + dx}px`;
      elements.inspector.style.top = `${initialTop + dy}px`;
      if (stage3d) {
        updateLeaderLines(stage3d.inspectionAnchors);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingInsp) {
        isDraggingInsp = false;
        document.body.style.userSelect = '';
      }
    });
  }

  // Floating Schematic Drag & Resize
  if (elements.schematicHandle && elements.floatingSchematic) {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    elements.schematicHandle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = elements.floatingSchematic.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      elements.floatingSchematic.style.right = 'auto';
      elements.floatingSchematic.style.left = `${initialLeft}px`;
      elements.floatingSchematic.style.top = `${initialTop}px`;

      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const newLeft = Math.max(0, Math.min(window.innerWidth - 100, initialLeft + dx));
      const newTop = Math.max(0, Math.min(window.innerHeight - 50, initialTop + dy));
      elements.floatingSchematic.style.left = `${newLeft}px`;
      elements.floatingSchematic.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
      }
    });
  }

  if (elements.schGrip && elements.floatingSchematic) {
    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let startW = 0;
    let startH = 0;

    elements.schGrip.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      startW = elements.floatingSchematic.offsetWidth;
      startH = elements.floatingSchematic.offsetHeight;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'se-resize';
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - resizeStartX;
      const dy = e.clientY - resizeStartY;
      const { width, height } = viewportCtrl.resizeSchematic(startW + dx, startH + dy);
      elements.floatingSchematic.style.width = `${width}px`;
      elements.floatingSchematic.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    });
  }

  // Component Hover Tooltip (#tip)
  if (elements.hardwareStage && elements.tip) {
    elements.hardwareStage.addEventListener('mouseover', (e) => {
      if (!envCtrl.getSetting('labels')) return;
      const target = e.target.closest('[data-tip]');
      if (target && target.dataset.tip) {
        elements.tip.textContent = target.dataset.tip;
        elements.tip.style.display = 'block';
      }
    });

    elements.hardwareStage.addEventListener('mousemove', (e) => {
      if (elements.tip.style.display === 'block') {
        elements.tip.style.left = `${e.pageX + 12}px`;
        elements.tip.style.top = `${e.pageY + 12}px`;
      }
    });

    elements.hardwareStage.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tip]');
      if (target) {
        elements.tip.style.display = 'none';
      }
    });
  }

  // Right Top Card 5 Tabs Switching
  const cardTabs = document.querySelectorAll('.card-tab');
  cardTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.dataset.tab;
      cardTabs.forEach((t) => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `tab-panel-${tabTarget}`);
      });
      playClickSound();
    });
  });

  // Left Icon Rail Navigation & Drawer
  if (elements.btnRailHome) {
    elements.btnRailHome.addEventListener('click', () => {
      selectLesson(LESSONS[0]);
    });
  }
  if (elements.btnRailLessons) {
    elements.btnRailLessons.addEventListener('click', () => {
      const isOpen = elements.lessonsSidebarDrawer?.classList.toggle('open');
      elements.btnRailLessons.classList.toggle('active', isOpen);
      playClickSound();
    });
  }
  if (elements.btnCloseLessonsDrawer) {
    elements.btnCloseLessonsDrawer.addEventListener('click', () => {
      elements.lessonsSidebarDrawer?.classList.remove('open');
      elements.btnRailLessons?.classList.remove('active');
      playClickSound();
    });
  }
  if (elements.btnRailComponents) {
    elements.btnRailComponents.addEventListener('click', () => {
      if (elements.inspectorCardsLayer) {
        elements.inspectorCardsLayer.style.display = elements.inspectorCardsLayer.style.display === 'none' ? 'block' : 'none';
      }
      playClickSound();
    });
  }
  if (elements.btnRailReference) {
    elements.btnRailReference.addEventListener('click', openPinoutModal);
  }
  if (elements.btnRailSettings) {
    elements.btnRailSettings.addEventListener('click', () => {
      elements.modalSettings?.classList.add('open');
      playClickSound();
    });
  }

  // Previous & Next Lesson Controls
  if (elements.btnPrevLesson) {
    elements.btnPrevLesson.addEventListener('click', () => {
      const prevIdx = (activeLesson.number - 2 + LESSONS.length) % LESSONS.length;
      selectLesson(LESSONS[prevIdx]);
    });
  }
  if (elements.btnNextLesson) {
    elements.btnNextLesson.addEventListener('click', () => {
      const nextIdx = activeLesson.number % LESSONS.length;
      selectLesson(LESSONS[nextIdx]);
    });
  }

  // Carousel Arrow Controls
  if (elements.btnCarouselPrev) {
    elements.btnCarouselPrev.addEventListener('click', () => {
      elements.carouselTrack?.scrollBy({ left: -240, behavior: 'smooth' });
      playClickSound();
    });
  }
  if (elements.btnCarouselNext) {
    elements.btnCarouselNext.addEventListener('click', () => {
      elements.carouselTrack?.scrollBy({ left: 240, behavior: 'smooth' });
      playClickSound();
    });
  }

  // Board Selector (30-pin vs 38-pin)
  if (elements.btnBoard30 && elements.btnBoard38) {
    elements.btnBoard30.addEventListener('click', () => {
      elements.btnBoard30.classList.add('active');
      elements.btnBoard38.classList.remove('active');
      pinoutVariant = 30;
      renderPinoutGrid();
      playClickSound();
    });
    elements.btnBoard38.addEventListener('click', () => {
      elements.btnBoard38.classList.add('active');
      elements.btnBoard30.classList.remove('active');
      pinoutVariant = 38;
      renderPinoutGrid();
      playClickSound();
    });
  }

  // Quick Action Buttons in Tabs
  if (elements.btnOpenFullPinout) {
    elements.btnOpenFullPinout.addEventListener('click', openPinoutModal);
  }
  if (elements.btnOpenFullQuiz) {
    elements.btnOpenFullQuiz.addEventListener('click', openQuizModal);
  }
  if (elements.btnModeBlocks) {
    elements.btnModeBlocks.addEventListener('click', () => {
      ageBandCtrl.setBand('band-b');
      syncAgeBandUI('band-b');
    });
  }

  // Viewport Keyboard Shortcuts (RULE-006 & RULE-009)
  window.addEventListener('keydown', (e) => {
    // Escape closes modals, inspector & drawer
    if (e.key === 'Escape') {
      elements.modalPinout?.classList.remove('open');
      elements.modalQuiz?.classList.remove('open');
      elements.modalSettings?.classList.remove('open');
      elements.floatingSchematic?.classList.remove('open');
      elements.lessonsSidebarDrawer?.classList.remove('open');
      elements.btnRailLessons?.classList.remove('active');
      if (elements.inspector) elements.inspector.classList.remove('open');
      if (elements.inspLines) elements.inspLines.innerHTML = '';
      return;
    }

    // Cmd+K or Ctrl+K search shortcut
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      elements.lessonsSidebarDrawer?.classList.toggle('open');
      return;
    }

    // Do not capture if focused on input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (isSimulationActive) stopSimulation();
      else startSimulation();
    } else if (e.key.toLowerCase() === 'w') {
      applyViewportTransform(viewportCtrl.pan(0, 20));
    } else if (e.key.toLowerCase() === 's') {
      applyViewportTransform(viewportCtrl.pan(0, -20));
    } else if (e.key.toLowerCase() === 'a') {
      applyViewportTransform(viewportCtrl.pan(20, 0));
    } else if (e.key.toLowerCase() === 'd') {
      applyViewportTransform(viewportCtrl.pan(-20, 0));
    } else if (e.key === '+' || e.key === '=') {
      applyViewportTransform(viewportCtrl.zoomBy(1.15));
      if (stage3d) stage3d.zoomBy(1.15);
    } else if (e.key === '-' || e.key === '_') {
      applyViewportTransform(viewportCtrl.zoomBy(0.85));
      if (stage3d) stage3d.zoomBy(0.85);
    } else if (e.key.toLowerCase() === 'q') {
      applyViewportTransform(viewportCtrl.rotate(-90));
      if (stage3d) stage3d.rotateAzimuth(-Math.PI / 8);
    } else if (e.key.toLowerCase() === 'e') {
      applyViewportTransform(viewportCtrl.rotate(90));
      if (stage3d) stage3d.rotateAzimuth(Math.PI / 8);
    } else if (e.key.toLowerCase() === 'r') {
      applyViewportTransform(viewportCtrl.reset());
      if (stage3d) stage3d.resetView();
    }
  });

  // Responsive Breakpoint check (RULE-010: W < 1090 or H < 800) & Uniform Scale Artboard
  function handleResize() {
    const isCompact = envCtrl.isCompactViewport(window.innerWidth, window.innerHeight);
    document.body.classList.toggle('compact', isCompact);

    if (elements.artboard) {
      if (isCompact) {
        elements.artboard.style.transform = 'none';
      } else {
        const s = Math.min(window.innerWidth / 1672, window.innerHeight / 941);
        const offsetX = (window.innerWidth - 1672 * s) / 2;
        const offsetY = (window.innerHeight - 941 * s) / 2;
        elements.artboard.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${s})`;
      }
    }

    if (stage3d && elements.webglStage) {
      stage3d.updateCameraProjection(
        elements.webglStage.clientWidth || 800,
        elements.webglStage.clientHeight || 600
      );
    }
  }
  window.addEventListener('resize', handleResize);
  handleResize();
}

function updateLeaderLines(anchors) {
  if (!elements.inspLines) return;
  if (!anchors || anchors.length === 0) {
    elements.inspLines.innerHTML = '';
    if (elements.inspectorCardsLayer) elements.inspectorCardsLayer.innerHTML = '';
    return;
  }

  const primaryAnchor = anchors[0];
  if (elements.inspTitle) elements.inspTitle.textContent = primaryAnchor.title;
  if (elements.inspDesc) elements.inspDesc.textContent = primaryAnchor.desc;

  const stageW = elements.webglStage ? (elements.webglStage.clientWidth || 800) : 800;
  const stageH = elements.webglStage ? (elements.webglStage.clientHeight || 600) : 600;

  // Mount/update perimeter cards in inspectorCardsLayer
  if (elements.inspectorCardsLayer) {
    const existingCards = elements.inspectorCardsLayer.querySelectorAll('.inspector-callout-card');
    if (existingCards.length !== anchors.length) {
      elements.inspectorCardsLayer.innerHTML = '';
      anchors.forEach((anchor, idx) => {
        const card = document.createElement('div');
        card.className = `inspector-callout-card slot-${anchor.slot || 'top-left'}`;
        card.dataset.index = idx;
        card.innerHTML = `
          <span class="callout-tag" style="color:${anchor.color || '#f86b1d'}">${anchor.tag || 'LINH KIỆN'}</span>
          <div class="callout-title">${anchor.title}</div>
          <div class="callout-desc">${anchor.desc}</div>
          ${anchor.pin ? `<div class="callout-pin">${anchor.pin}</div>` : ''}
        `;
        card.addEventListener('click', () => {
          elements.inspectorCardsLayer.querySelectorAll('.inspector-callout-card').forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          if (elements.inspector) {
            elements.inspector.classList.add('open');
            if (elements.inspTitle) elements.inspTitle.textContent = anchor.title;
            if (elements.inspDesc) elements.inspDesc.textContent = anchor.desc;
          }
          playTone(660, 0.08, 'triangle', 0.2);
        });
        elements.inspectorCardsLayer.appendChild(card);
      });
    }
  }

  // Draw orthogonal & dashed SVG lines for all anchors
  let svgContent = '';
  const cardNodes = elements.inspectorCardsLayer ? elements.inspectorCardsLayer.querySelectorAll('.inspector-callout-card') : [];

  anchors.forEach((anchor, idx) => {
    const pt = stage3d ? stage3d.projectToScreen(anchor.pos, stageW, stageH) : { x: stageW * 0.5, y: stageH * 0.5 };
    const cardEl = cardNodes[idx];
    let cardX = 0;
    let cardY = 0;

    const slot = anchor.slot || 'top-left';
    if (cardEl && cardEl.offsetWidth) {
      if (slot.includes('left')) {
        cardX = cardEl.offsetLeft + cardEl.offsetWidth;
        cardY = cardEl.offsetTop + cardEl.offsetHeight * 0.5;
      } else if (slot.includes('right')) {
        cardX = cardEl.offsetLeft;
        cardY = cardEl.offsetTop + cardEl.offsetHeight * 0.5;
      } else {
        cardX = cardEl.offsetLeft + cardEl.offsetWidth * 0.5;
        cardY = cardEl.offsetTop + cardEl.offsetHeight;
      }
    } else {
      if (slot === 'top-left') { cardX = 196; cardY = 50; }
      else if (slot === 'top-center') { cardX = stageW * 0.5; cardY = 70; }
      else if (slot === 'mid-right') { cardX = stageW - 196; cardY = stageH * 0.35; }
      else if (slot === 'bottom-left') { cardX = 196; cardY = stageH - 120; }
      else if (slot === 'bottom-right') { cardX = stageW - 196; cardY = stageH - 220; }
      else { cardX = 196; cardY = 50; }
    }

    const midX = (cardX + pt.x) * 0.5;
    const midY = (cardY + pt.y) * 0.5;
    const d = `M ${cardX} ${cardY} Q ${midX} ${midY} ${pt.x} ${pt.y}`;
    const col = anchor.color || '#f86b1d';

    svgContent += `
      <g class="insp-leader" data-slot="${slot}">
        <path d="${d}" stroke="${col}" stroke-width="1.8" stroke-dasharray="5,4" fill="none" opacity="0.85" />
        <circle class="dot-end" cx="${pt.x}" cy="${pt.y}" r="4.5" fill="${col}" stroke="#fffbf6" stroke-width="1.5" />
      </g>
    `;
  });

  // Single inspector card leader line for legacy tests
  if (elements.inspector && elements.inspector.classList.contains('open')) {
    const pt = stage3d ? stage3d.projectToScreen(primaryAnchor.pos, stageW, stageH) : { x: stageW * 0.5, y: stageH * 0.5 };
    const cardX = elements.inspector.offsetLeft + elements.inspector.offsetWidth;
    const cardY = elements.inspector.offsetTop + 26;
    const elbowY = Math.max(pt.y + 4, cardY - 22);
    const d = `M ${cardX} ${cardY} L ${cardX} ${elbowY} L ${pt.x} ${pt.y}`;
    svgContent += `
      <g class="insp-leader legacy-insp-leader">
        <circle class="dot-end" cx="${pt.x}" cy="${pt.y}" r="4.6" fill="#fffbf6" stroke="#0f2239" stroke-width="1.5" />
        <path d="${d}" stroke="#141a2c" stroke-width="1.2" fill="none" />
      </g>
    `;
  }

  elements.inspLines.innerHTML = svgContent;
}

function applyViewportTransform(state) {
  if (!elements.hardwareStage) return;
  elements.hardwareStage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom}) rotate(${state.rotationDeg}deg)`;
}

/* =========================================================================
   11. App Bootstrap
   ========================================================================= */

function initApp() {
  const currentBand = ageBandCtrl.getBand();
  if (elements.webglStage) {
    stage3d = new Stage3D(elements.webglStage, {
      onLeaderLinesUpdate: (anchors) => updateLeaderLines(anchors)
    });
  }

  if (elements.ledPwr) elements.ledPwr.setAttribute('data-tip', 'Đèn nguồn PWR (3.3V Power LED)');
  if (elements.ledOnboard) elements.ledOnboard.setAttribute('data-tip', 'Đèn LED tích hợp GPIO 2 (Onboard Blue LED)');
  if (elements.ledTx) elements.ledTx.setAttribute('data-tip', 'Đèn truyền dữ liệu UART TX');
  if (elements.ledRx) elements.ledRx.setAttribute('data-tip', 'Đèn nhận dữ liệu UART RX');
  renderLessonsList();
  syncAgeBandUI(currentBand);
  syncProgressUI();
  bindEvents();
  logSerial('System ready. Welcome to ESP32 Kids-to-Pro Learning Platform!');
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initApp);
}

export default {
  initApp,
  selectLesson,
  startSimulation,
  stopSimulation
};
