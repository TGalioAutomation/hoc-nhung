/**
 * src/engine.js
 * Pure, deterministic core engine implementing RULE-001 through RULE-010
 * Strictly derived from clean-room/SPEC.approved.md
 */

// Memory fallback for localStorage when executing in Node.js test environment
class MemoryStorage {
  constructor() {
    this._data = new Map();
  }
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }
  setItem(key, value) {
    this._data.set(key, String(value));
  }
  removeItem(key) {
    this._data.delete(key);
  }
  clear() {
    this._data.clear();
  }
}

export const safeStorage = (typeof window !== 'undefined' && window.localStorage)
  ? window.localStorage
  : new MemoryStorage();

/* =========================================================================
   RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi & Thích Ứng Giao Diện Người Dùng
   (AgeBandController)
   ========================================================================= */

export const AGE_BANDS = {
  BAND_A: 'band-a', // 5-8 years: Kid Spark
  BAND_B: 'band-b', // 9-13 years: Block Explorer (Default)
  BAND_C: 'band-c'  // 14-20 years: Maker Pro
};

export class AgeBandController {
  constructor(storage = safeStorage) {
    this.storage = storage;
    this.listeners = new Set();
    const saved = this.storage.getItem('user-age-band');
    this.currentBand = (saved === AGE_BANDS.BAND_A || saved === AGE_BANDS.BAND_C)
      ? saved
      : AGE_BANDS.BAND_B;
    this._syncDom();
  }

  getBand() {
    return this.currentBand;
  }

  setBand(band) {
    if (![AGE_BANDS.BAND_A, AGE_BANDS.BAND_B, AGE_BANDS.BAND_C].includes(band)) {
      throw new Error(`Invalid age band: ${band}`);
    }
    this.currentBand = band;
    this.storage.setItem('user-age-band', band);
    this._syncDom();
    const capabilities = this.getCapabilities(band);
    this.listeners.forEach((fn) => {
      try {
        fn({ band, capabilities });
      } catch (err) {
        console.error('AgeBand listener error:', err);
      }
    });
    return capabilities;
  }

  getCapabilities(band = this.currentBand) {
    switch (band) {
      case AGE_BANDS.BAND_A:
        return {
          band: AGE_BANDS.BAND_A,
          modeName: 'Kid Spark',
          ageRange: '5–8',
          showCodeEditor: false,
          showPinout: false,
          showStoryCards: true,
          showBlockWorkspace: false,
          minButtonSizePx: 64,
          interactiveSound: true
        };
      case AGE_BANDS.BAND_B:
        return {
          band: AGE_BANDS.BAND_B,
          modeName: 'Block Explorer',
          ageRange: '9–13',
          showCodeEditor: false,
          showPinout: true,
          showStoryCards: false,
          showBlockWorkspace: true,
          minButtonSizePx: 44,
          interactiveSound: true
        };
      case AGE_BANDS.BAND_C:
        return {
          band: AGE_BANDS.BAND_C,
          modeName: 'Maker Pro',
          ageRange: '14–20',
          showCodeEditor: true,
          showPinout: true,
          showStoryCards: false,
          showBlockWorkspace: false,
          minButtonSizePx: 36,
          interactiveSound: true
        };
      default:
        return this.getCapabilities(AGE_BANDS.BAND_B);
    }
  }

  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  _syncDom() {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-age-band', this.currentBand);
      document.documentElement.dispatchEvent(
        new CustomEvent('ageBandChanged', {
          detail: { band: this.currentBand, capabilities: this.getCapabilities() }
        })
      );
    }
  }
}

/* =========================================================================
   RULE-002: Ma Trận Sơ Đồ Chân ESP32 & Hợp Đồng An Toàn Giới Hạn Điện Áp / Dòng Điện
   (Esp32SafetyEngine)
   ========================================================================= */

export const ESP32_CONSTANTS = {
  V_IO_NOMINAL: 3.3,
  I_MAX_MA: 40.0,
  I_SAFE_MA: 20.0,
  ADC_MAX_VALUE: 4095,
  INPUT_ONLY_PINS: [34, 35, 36, 39],
  ADC1_PINS: [32, 33, 34, 35, 36, 39],
  ADC2_PINS: [0, 2, 4, 12, 13, 14, 15, 25, 26, 27],
  TOUCH_PINS: [0, 2, 4, 12, 13, 14, 15, 27, 32, 33]
};

export class Esp32SafetyEngine {
  static validateVoltage(voltage, pin = null) {
    if (voltage > ESP32_CONSTANTS.V_IO_NOMINAL) {
      return {
        safe: false,
        code: 'OVERVOLTAGE_WARNING',
        message: `Voltage ${voltage}V exceeds safe nominal V_io (3.3V) on pin ${pin ?? 'GPIO'}! Connecting 5.0V directly to GPIO will destroy the ESP32.`
      };
    }
    return { safe: true, code: 'OK' };
  }

  static validatePinMode(pin, mode) {
    const pinNum = Number(pin);
    const upperMode = String(mode).toUpperCase();
    if (ESP32_CONSTANTS.INPUT_ONLY_PINS.includes(pinNum) && upperMode === 'OUTPUT') {
      return {
        valid: false,
        code: 'PIN_CANNOT_BE_OUTPUT',
        message: `GPIO ${pinNum} is an input-only pin (no output driver/pullups). It cannot be configured as OUTPUT.`
      };
    }
    return { valid: true, code: 'OK' };
  }

  static calculateLedCurrent({ vGpio = 3.3, vForward = 2.0, rSeries = 220 } = {}) {
    if (rSeries <= 0) {
      return {
        currentMa: Infinity,
        isSafe: false,
        isBurned: true,
        state: 'COMPONENT_BURNED_STATE',
        message: 'Series resistance is 0Ω! Instant overcurrent (>40mA) burned the LED.'
      };
    }
    if (vGpio <= vForward) {
      return {
        currentMa: 0,
        isSafe: true,
        isBurned: false,
        state: 'OFF_STATE',
        message: 'GPIO voltage is below forward voltage threshold.'
      };
    }
    const currentA = (vGpio - vForward) / rSeries;
    const currentMa = Math.round(currentA * 1000 * 100) / 100;
    const isBurned = currentMa > ESP32_CONSTANTS.I_MAX_MA;
    const isSafe = currentMa <= ESP32_CONSTANTS.I_SAFE_MA;

    return {
      currentMa,
      isSafe,
      isBurned,
      state: isBurned ? 'COMPONENT_BURNED_STATE' : (isSafe ? 'NORMAL_OPERATION' : 'STRESSED_OPERATION'),
      message: isBurned
        ? `Current ${currentMa}mA exceeds maximum rating 40mA! Component burned.`
        : (isSafe ? `Current ${currentMa}mA is within safe limit (<= 20mA).` : `Current ${currentMa}mA is acceptable but stressed (>20mA).`)
    };
  }

  static readAdc(pin, voltage, wifiActive = false) {
    const pinNum = Number(pin);
    if (ESP32_CONSTANTS.ADC2_PINS.includes(pinNum) && wifiActive) {
      return {
        success: false,
        code: 'ADC2_LOCKED_BY_WIFI',
        value: null,
        message: `GPIO ${pinNum} belongs to ADC2 and cannot be read while Wi-Fi is active.`
      };
    }
    const clampedV = Math.max(0, Math.min(ESP32_CONSTANTS.V_IO_NOMINAL, voltage));
    const adcRaw = Math.round((clampedV / ESP32_CONSTANTS.V_IO_NOMINAL) * ESP32_CONSTANTS.ADC_MAX_VALUE);
    return {
      success: true,
      code: 'OK',
      value: adcRaw,
      voltage: clampedV
    };
  }

  static readTouch(pin, isTouched, idleThreshold = 80) {
    const pinNum = Number(pin);
    if (!ESP32_CONSTANTS.TOUCH_PINS.includes(pinNum)) {
      return {
        success: false,
        code: 'NOT_A_TOUCH_PIN',
        message: `GPIO ${pinNum} does not support capacitive touch.`
      };
    }
    // Touch value drops when finger touches the copper pad
    const value = isTouched ? 18 : 95;
    return {
      success: true,
      pin: pinNum,
      isTouched,
      value,
      threshold: idleThreshold,
      active: value < idleThreshold
    };
  }
}

/* =========================================================================
   RULE-003: Mô Phỏng Trực Quan & Phản Hồi Cảm Giác Tức Thì Cho Band A (Kid Spark)
   (BandASimulator)
   ========================================================================= */

export class BandASimulator {
  // 1. Level Crossing blink rate clamping
  static clampRate(rate) {
    const clamped = Math.max(100, Math.min(1500, rate));
    return Math.round(clamped / 50) * 50;
  }

  static getLevelCrossingColors() {
    return ['#ff3b30', '#ffcc00', '#34c759'];
  }

  // 2. Fridge Guard alarm check
  static checkFridgeAlarm(angleDeg, durationMs, graceMs = 3000) {
    const clampedAngle = Math.max(0, Math.min(90, angleDeg));
    const isViolating = clampedAngle > 12;
    const isAlarming = isViolating && durationMs > graceMs;
    return {
      isViolating,
      isAlarming,
      alarmFreq: 2400,
      redBlink: isAlarming,
      angle: clampedAngle,
      durationMs
    };
  }

  // 3. Siren Sound frequency sweep
  static getSirenFrequency(elapsedMs, periodMs = 1600) {
    const t = (elapsedMs % periodMs) / periodMs;
    // Sinusoidal sweep between 400Hz and 1200Hz
    const minFreq = 400;
    const maxFreq = 1200;
    const center = (minFreq + maxFreq) / 2;
    const span = (maxFreq - minFreq) / 2;
    const freq = center + span * Math.sin(2 * Math.PI * t);
    return Math.round(freq);
  }

  // 4. Mini Touch Piano
  static getPianoNotes() {
    return [
      { name: 'C4', freq: 261.63, key: '1' },
      { name: 'D4', freq: 293.66, key: '2' },
      { name: 'E4', freq: 329.63, key: '3' },
      { name: 'F4', freq: 349.23, key: '4' },
      { name: 'G4', freq: 392.00, key: '5' },
      { name: 'A4', freq: 440.00, key: '6' },
      { name: 'B4', freq: 493.88, key: '7' },
      { name: 'C5', freq: 523.25, key: '8' }
    ];
  }

  // 5. Mood Lamp RGB
  static getMoodLampColor(r, g, b) {
    const cr = Math.max(0, Math.min(255, Math.round(r)));
    const cg = Math.max(0, Math.min(255, Math.round(g)));
    const cb = Math.max(0, Math.min(255, Math.round(b)));
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return {
      r: cr,
      g: cg,
      b: cb,
      hex: `#${toHex(cr)}${toHex(cg)}${toHex(cb)}`,
      css: `rgb(${cr}, ${cg}, ${cb})`
    };
  }

  // 6. Night Light threshold logic
  static evaluateNightLight(ldrVal, threshold = 50) {
    const ledOn = ldrVal < threshold;
    return {
      ledOn,
      ldrVal,
      threshold,
      state: ledOn ? 'ON' : 'OFF'
    };
  }
}

/* =========================================================================
   RULE-004: Lập Trình Khối Kéo-Thả & Mô Phỏng Mạch Điện Cho Band B (Block Explorer)
   (BandBSimulator)
   ========================================================================= */

export class BandBSimulator {
  // 1. Neopixel 12-LED ring formula: N_lit = floor((ADC / 4095) * 12)
  static calculateNeopixelRing(adcVal, totalLeds = 12, mode = 'rainbow') {
    const clampedAdc = Math.max(0, Math.min(4095, adcVal));
    const numLit = Math.floor((clampedAdc / 4095) * totalLeds);
    const leds = [];
    for (let i = 0; i < totalLeds; i++) {
      const isLit = i < numLit;
      let color = '#000000';
      if (isLit) {
        if (mode === 'blue') {
          color = '#0088ff';
        } else if (mode === 'traffic') {
          color = i < 4 ? '#34c759' : (i < 8 ? '#ffcc00' : '#ff3b30');
        } else {
          // Rainbow phase angle (i / totalLeds) * 360
          const hue = Math.round((i / totalLeds) * 360);
          color = `hsl(${hue}, 100%, 55%)`;
        }
      }
      leds.push({ index: i, lit: isLit, color });
    }
    return { numLit, leds, adcVal: clampedAdc };
  }

  // 2. Ultrasonic HC-SR04P delta_t = (2 * d) / 0.0343 us
  static calculateUltrasonic(distanceCm) {
    const clampedD = Math.max(2, Math.min(400, distanceCm));
    const echoDurationUs = (2 * clampedD) / 0.0343;
    const progressRatio = (clampedD - 2) / (400 - 2);
    return {
      distanceCm: clampedD,
      echoDurationUs: Math.round(echoDurationUs * 10) / 10,
      displayStr: `${clampedD.toFixed(1)} cm`,
      progressRatio: Math.max(0, Math.min(1, progressRatio))
    };
  }

  // 3. Laser Gate + Servo FSM
  static createLaserGateFsm() {
    return {
      state: 'CLOSED', // CLOSED, OPENING, OPEN_HOLD, CLOSING
      angle: 0,
      holdTimerMs: 0,
      update(dtMs, isBlocked) {
        const speedDegPerSec = 180;
        const speedDegPerMs = speedDegPerSec / 1000;

        if (this.state === 'CLOSED') {
          if (isBlocked) {
            this.state = 'OPENING';
          }
        } else if (this.state === 'OPENING') {
          this.angle = Math.min(90, this.angle + speedDegPerMs * dtMs);
          if (this.angle >= 90) {
            this.state = 'OPEN_HOLD';
            this.holdTimerMs = 0;
          }
        } else if (this.state === 'OPEN_HOLD') {
          this.holdTimerMs += dtMs;
          if (this.holdTimerMs >= 3000) {
            this.state = 'CLOSING';
          }
        } else if (this.state === 'CLOSING') {
          this.angle = Math.max(0, this.angle - speedDegPerMs * dtMs);
          if (this.angle <= 0) {
            this.state = 'CLOSED';
          }
        }
        return { state: this.state, angle: Math.round(this.angle) };
      }
    };
  }

  // 4. DC Motor PWM linear velocity
  static calculateMotorRpm(dutyCyclePercent, maxRpm = 1000) {
    const clampedDuty = Math.max(0, Math.min(100, dutyCyclePercent));
    const rpm = (clampedDuty / 100) * maxRpm;
    return {
      dutyCyclePercent: clampedDuty,
      rpm: Math.round(rpm),
      angularVelocityRadS: (rpm * 2 * Math.PI) / 60
    };
  }

  // Block AST Compiler
  static compileBlocksToCpp(blocks) {
    let setupLines = ['  Serial.begin(115200);'];
    let loopLines = [];

    blocks.forEach((block) => {
      switch (block.type) {
        case 'digital_write':
          setupLines.push(`  pinMode(${block.pin}, OUTPUT);`);
          loopLines.push(`  digitalWrite(${block.pin}, ${block.val});`);
          break;
        case 'delay_ms':
          loopLines.push(`  delay(${block.val});`);
          break;
        case 'pwm_write':
          setupLines.push(`  ledcAttach(${block.pin}, 5000, 8);`);
          loopLines.push(`  ledcWrite(${block.pin}, ${block.val});`);
          break;
        default:
          break;
      }
    });

    return `// Auto-generated Arduino C++ from Blocks
void setup() {
${Array.from(new Set(setupLines)).join('\n')}
}

void loop() {
${loopLines.join('\n')}
}`;
  }
}

/* =========================================================================
   RULE-005: Hệ Thống Tiến Trình Học Tập, Điểm Thưởng XP & Đánh Giá Thử Thách
   (ProgressAndGamificationEngine)
   ========================================================================= */

export const BADGES = {
  BLINK_MASTER: { id: 'blink_master', name: 'Blink Master', lessonNumber: 2, icon: '💡' },
  ACOUSTIC_WIZARD: { id: 'acoustic_wizard', name: 'Acoustic Wizard', lessonNumber: 6, icon: '🎵' },
  IOT_EXPLORER: { id: 'iot_explorer', name: 'IoT Explorer', lessonNumber: 4, altLesson: 14, icon: '🌐' },
  MECHATRONICS_PRO: { id: 'mechatronics_pro', name: 'Mechatronics Pro', lessonNumber: 20, icon: '🦾' }
};

export class ProgressAndGamificationEngine {
  constructor(storage = safeStorage) {
    this.storage = storage;
    this.totalLessons = 20;
    this._load();
  }

  _load() {
    const raw = this.storage.getItem('learn-esp32-progress');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.completedLessons = Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [];
        this.xp = typeof parsed.xp === 'number' ? parsed.xp : 0;
        this.badges = Array.isArray(parsed.badges) ? parsed.badges : [];
        this.quizScores = typeof parsed.quizScores === 'object' && parsed.quizScores !== null ? parsed.quizScores : {};
        return;
      } catch (e) {
        console.error('Failed to parse saved progress, resetting to defaults', e);
      }
    }
    this.completedLessons = [];
    this.xp = 0;
    this.badges = [];
    this.quizScores = {};
  }

  _save() {
    const data = {
      completedLessons: this.completedLessons,
      xp: this.xp,
      badges: this.badges,
      quizScores: this.quizScores
    };
    this.storage.setItem('learn-esp32-progress', JSON.stringify(data));
  }

  isLessonCompleted(lessonId) {
    return this.completedLessons.includes(lessonId);
  }

  markLessonComplete(lessonId, lessonNumber, band = AGE_BANDS.BAND_B, quizScore = null, isFirstTry = false) {
    let newlyCompleted = false;
    if (!this.completedLessons.includes(lessonId)) {
      this.completedLessons.push(lessonId);
      newlyCompleted = true;

      // Award XP based on Band
      if (band === AGE_BANDS.BAND_A) this.xp += 50;
      else if (band === AGE_BANDS.BAND_C) this.xp += 150;
      else this.xp += 100;
    }

    if (quizScore !== null) {
      const alreadyHadPerfectQuiz = this.quizScores[lessonId] === 3;
      this.quizScores[lessonId] = quizScore;
      if (quizScore === 3 && isFirstTry && !alreadyHadPerfectQuiz) {
        this.xp += 25; // Bonus for perfect first-try quiz
      }
    }

    // Check badge unlocks
    this._checkBadgeUnlock(lessonId, lessonNumber);
    this._save();

    return {
      newlyCompleted,
      progressPercentage: this.getProgressPercentage(),
      xp: this.xp,
      badges: this.badges
    };
  }

  _checkBadgeUnlock(lessonId, lessonNumber) {
    if (lessonNumber === 2 && !this.badges.includes(BADGES.BLINK_MASTER.name)) {
      this.badges.push(BADGES.BLINK_MASTER.name);
    }
    if (lessonNumber === 6 && !this.badges.includes(BADGES.ACOUSTIC_WIZARD.name)) {
      this.badges.push(BADGES.ACOUSTIC_WIZARD.name);
    }
    if ((lessonNumber === 4 || lessonNumber === 14) && !this.badges.includes(BADGES.IOT_EXPLORER.name)) {
      this.badges.push(BADGES.IOT_EXPLORER.name);
    }
    if (lessonNumber === 20 && !this.badges.includes(BADGES.MECHATRONICS_PRO.name)) {
      this.badges.push(BADGES.MECHATRONICS_PRO.name);
    }
  }

  getProgressPercentage() {
    return Math.floor((this.completedLessons.length / this.totalLessons) * 100);
  }

  getProgressText() {
    return `${this.completedLessons.length}/${this.totalLessons}`;
  }

  getAriaAttributes() {
    return {
      'aria-valuemin': '0',
      'aria-valuemax': String(this.totalLessons),
      'aria-valuenow': String(this.completedLessons.length)
    };
  }

  resetProgress() {
    this.completedLessons = [];
    this.xp = 0;
    this.badges = [];
    this.quizScores = {};
    this._save();
    return {
      progressPercentage: 0,
      progressText: '0/20',
      xp: 0,
      badges: []
    };
  }
}

/* =========================================================================
   RULE-006: Trình Thực Thi Code Đa Nền Tảng (C++ / MicroPython) & Truy Vết Dòng Lệnh
   (CodeExecutionEngine)
   ========================================================================= */

export class CodeExecutionEngine {
  constructor(storage = safeStorage) {
    this.storage = storage;
    this.state = 'idle'; // idle -> uploading -> running
    this.mode = 'cpp';   // 'cpp' or 'python'
    this.baudRate = 115200;
  }

  setMode(mode) {
    if (mode === 'cpp' || mode === 'python') {
      this.mode = mode;
    }
  }

  substituteParams(template, params = {}) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return key in params ? params[key] : match;
    });
  }

  // Simulates finite state machine: idle -> uploading (600ms + 600ms) -> running
  startUpload({ onLog, onStateChange, isPython = false } = {}) {
    if (this.state !== 'idle') return Promise.resolve();

    this.state = 'uploading';
    if (onStateChange) onStateChange(this.state);

    const firstMsg = isPython ? 'Parsing MicroPython script…' : 'Compiling sketch…';
    if (onLog) onLog(firstMsg, 'txrx-active');

    return new Promise((resolve) => {
      setTimeout(() => {
        if (onLog) onLog('Connecting to ESP32 on USB…', 'txrx-active');
        setTimeout(() => {
          if (onLog) onLog('Writing… 100 %. Hard resetting via RTS pin.', 'txrx-done');
          this.state = 'running';
          if (onStateChange) onStateChange(this.state);
          resolve();
        }, 600);
      }, 600);
    });
  }

  stop({ onStateChange } = {}) {
    this.state = 'idle';
    if (onStateChange) onStateChange(this.state);
  }

  // Serial Monitor Height Persistence
  getSavedConsoleHeight() {
    const saved = this.storage.getItem('learn-esp32-serial-h') || this.storage.getItem('console-height');
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? 92 : Math.max(56, Math.min(360, parsed));
  }

  saveConsoleHeight(h) {
    const clamped = Math.max(56, Math.min(360, Math.round(h)));
    this.storage.setItem('learn-esp32-serial-h', String(clamped));
    this.storage.setItem('console-height', String(clamped));
    return clamped;
  }
}

/* =========================================================================
   RULE-007: Mô Phỏng Mạng Không Dây IoT, Wi-Fi Web Server & Giao Thức ESP-NOW
   (WirelessIoTSimulator)
   ========================================================================= */

export class WirelessIoTSimulator {
  constructor() {
    // 1. Wi-Fi Server
    this.virtualIp = '192.168.1.42';
    this.webLedState = false;

    // 2. Bluetooth Serial
    this.bluetoothName = 'ESP32-Lamp';
    this.bluetoothConnected = false;
    this.bluetoothLampState = false;

    // 3. ESP-NOW Mesh
    this.espNowDistanceMeters = 25;
  }

  // HTTP GET /toggle
  handleHttpToggle() {
    this.webLedState = !this.webLedState;
    return {
      status: 200,
      statusText: 'OK',
      data: { led: this.webLedState, ip: this.virtualIp }
    };
  }

  // Bluetooth command parser
  sendBluetoothCommand(cmd) {
    const trimmed = String(cmd).trim().toUpperCase();
    if (trimmed === 'ON') {
      this.bluetoothLampState = true;
      return { success: true, response: 'OK: LAMP IS ON', lampState: true };
    }
    if (trimmed === 'OFF') {
      this.bluetoothLampState = false;
      return { success: true, response: 'OK: LAMP IS OFF', lampState: false };
    }
    if (trimmed === 'DIM') {
      return { success: true, response: 'OK: LAMP DIMMED 50%', lampState: this.bluetoothLampState };
    }
    return { success: false, response: 'ERROR: UNKNOWN COMMAND' };
  }

  // ESP-NOW packet loss and latency calculation
  calculateEspNowPacket(distanceMeters = this.espNowDistanceMeters, payloadBytes = [0x43, 0x4c, 0x49, 0x43, 0x4b]) {
    const clampedDist = Math.max(0.5, Math.min(150, distanceMeters));
    if (payloadBytes.length > 250) {
      return { success: false, error: 'PAYLOAD_EXCEEDS_250_BYTES' };
    }

    // Packet loss sigmoid starting at d > 100m
    let packetLossRate = 0;
    if (clampedDist > 100) {
      // Sigmoidal increase from 0 to 1
      packetLossRate = 1 / (1 + Math.exp(-0.1 * (clampedDist - 125)));
    }

    const isDelivered = Math.random() >= packetLossRate;
    // Latency < 5ms (e.g. 2.1ms - 4.5ms)
    const latencyMs = Math.round((2.0 + Math.random() * 2.5) * 10) / 10;

    return {
      distanceMeters: clampedDist,
      isDelivered,
      packetLossPercentage: Math.round(packetLossRate * 100),
      latencyMs: isDelivered ? latencyMs : null,
      payloadSize: payloadBytes.length
    };
  }
}

/* =========================================================================
   RULE-008: Cơ Điện Tử Tự Động Hóa & Hệ Thống Robot STEM Thông Minh
   (MechatronicsSimulator)
   ========================================================================= */

export class MechatronicsSimulator {
  // 1. Smart Pump with Hysteresis
  static updatePumpHysteresis(currentLevelPercent, previousPumpState) {
    let pumpState = previousPumpState;
    if (currentLevelPercent <= 20) {
      pumpState = true; // Turn ON pump
    } else if (currentLevelPercent >= 90) {
      pumpState = false; // Turn OFF pump
    }
    return {
      pumpActive: pumpState,
      relayHigh: pumpState,
      waterLevelPercent: currentLevelPercent
    };
  }

  // 2. 4x3 Matrix Keypad Lock
  static createKeypadLock(secretPin = '1234') {
    return {
      secretPin,
      buffer: '',
      failedAttempts: 0,
      isLockedOut: false,
      lockoutUntil: 0,
      press(key, now = Date.now()) {
        if (this.isLockedOut) {
          if (now < this.lockoutUntil) {
            const remainingSec = Math.ceil((this.lockoutUntil - now) / 1000);
            return { action: 'LOCKED_OUT', remainingSec, sound: 'ERROR' };
          }
          this.isLockedOut = false;
          this.failedAttempts = 0;
        }

        if (key === '*') {
          this.buffer = '';
          return { action: 'CLEAR', buffer: '', sound: 'BEEP_2000HZ' };
        }

        if (key === '#') {
          if (this.buffer === this.secretPin) {
            this.buffer = '';
            this.failedAttempts = 0;
            return { action: 'UNLOCKED', success: true, sound: 'CHIME' };
          }
          this.buffer = '';
          this.failedAttempts++;
          if (this.failedAttempts >= 3) {
            this.isLockedOut = true;
            this.lockoutUntil = now + 10000; // 10s lockout
            return { action: 'LOCKOUT_TRIGGERED', failedAttempts: this.failedAttempts, sound: 'BUZZ_400HZ' };
          }
          return { action: 'WRONG_PIN', failedAttempts: this.failedAttempts, sound: 'BUZZ_400HZ' };
        }

        if (this.buffer.length < 4 && !isNaN(parseInt(key, 10))) {
          this.buffer += key;
          return { action: 'DIGIT', buffer: this.buffer, sound: 'KEY_CLICK' };
        }

        return { action: 'NO_OP', buffer: this.buffer };
      }
    };
  }

  // 3. Dual-LDR Solar Tracker
  static calculateSolarStep(ldrLeft, ldrRight, currentAngle = 90, deadband = 15) {
    const diff = ldrLeft - ldrRight;
    let newAngle = currentAngle;
    let moved = false;

    if (Math.abs(diff) > deadband) {
      if (diff > 0 && currentAngle < 170) {
        newAngle = currentAngle + 1;
        moved = true;
      } else if (diff < 0 && currentAngle > 10) {
        newAngle = currentAngle - 1;
        moved = true;
      }
    }

    return {
      angle: newAngle,
      diff,
      deadband,
      inDeadband: Math.abs(diff) <= deadband,
      moved
    };
  }

  // 4. Polar to Cartesian for 180° Radar
  static polarToCartesian(angleDeg, distanceCm, originX = 150, originY = 150, scale = 1.2) {
    const rad = (angleDeg * Math.PI) / 180;
    const r = distanceCm * scale;
    // Angle 0 is East, 90 is North, 180 is West
    const x = originX + r * Math.cos(rad);
    const y = originY - r * Math.sin(rad);
    return { x: Math.round(x), y: Math.round(y), angleDeg, distanceCm };
  }

  // 5. Stepper Pick & Place kinematics
  static calculateStepperPosition(steps, stepsPerRev = 200, pitchMm = 8) {
    const linearPosMm = (steps / stepsPerRev) * pitchMm;
    const clampedMm = Math.max(0, Math.min(200, linearPosMm));
    return {
      steps,
      linearPosMm: Math.round(clampedMm * 100) / 100,
      mmPerStep: pitchMm / stepsPerRev
    };
  }
}

/* =========================================================================
   RULE-009: Không Gian Mô Phỏng 3D/2D, Bộ Điều Khiển Camera & Sơ Đồ Mạch Điện Nổi
   (ViewportAndSchematicController)
   ========================================================================= */

export class ViewportAndSchematicController {
  constructor() {
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
    this.rotationDeg = 0;
    this.schematicOpen = false;
    this.schematicWidth = 320;
    this.schematicHeight = 220;
  }

  reset() {
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
    this.rotationDeg = 0;
    return this.getState();
  }

  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
    return this.getState();
  }

  setZoom(z) {
    this.zoom = Math.max(0.4, Math.min(3.0, z));
    return this.getState();
  }

  zoomBy(factor) {
    return this.setZoom(this.zoom * factor);
  }

  rotate(deg) {
    this.rotationDeg = (this.rotationDeg + deg + 360) % 360;
    return this.getState();
  }

  toggleSchematic() {
    this.schematicOpen = !this.schematicOpen;
    return this.schematicOpen;
  }

  resizeSchematic(w, h) {
    this.schematicWidth = Math.max(200, Math.min(600, w));
    this.schematicHeight = Math.max(140, Math.min(500, h));
    return { width: this.schematicWidth, height: this.schematicHeight };
  }

  getState() {
    return {
      panX: this.panX,
      panY: this.panY,
      zoom: Math.round(this.zoom * 100) / 100,
      rotationDeg: this.rotationDeg,
      schematicOpen: this.schematicOpen
    };
  }
}

/* =========================================================================
   RULE-010: Khả Năng Tiếp Cận Trợ Năng (a11y), Đa Ngôn Ngữ (i18n) & Tùy Chọn Môi Trường
   (EnvironmentAndA11yController)
   ========================================================================= */

export class EnvironmentAndA11yController {
  constructor(storage = safeStorage) {
    this.storage = storage;
    this._load();
  }

  _load() {
    const raw = this.storage.getItem('learn-esp32-settings');
    const defaults = {
      labels: true,
      grid: true,
      autoRotate: false,
      sound: true,
      reducedMotion: false,
      lang: 'vi'
    };

    if (raw) {
      try {
        this.settings = { ...defaults, ...JSON.parse(raw) };
        return;
      } catch (err) {
        console.error('Failed to parse settings', err);
      }
    }
    this.settings = defaults;
  }

  _save() {
    this.storage.setItem('learn-esp32-settings', JSON.stringify(this.settings));
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, val) {
    this.settings[key] = val;
    this._save();
    return this.settings;
  }

  getTweenSpeedFactor() {
    return this.settings.reducedMotion ? 0.05 : 1.0;
  }

  isCompactViewport(width, height) {
    return width < 1090 || height < 800;
  }
}

export default {
  safeStorage,
  AgeBandController,
  Esp32SafetyEngine,
  BandASimulator,
  BandBSimulator,
  ProgressAndGamificationEngine,
  CodeExecutionEngine,
  WirelessIoTSimulator,
  MechatronicsSimulator,
  ViewportAndSchematicController,
  EnvironmentAndA11yController
};
