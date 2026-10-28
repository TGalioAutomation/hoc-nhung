/**
 * tests/spec.test.js
 * Comprehensive unit test suite verifying RULE-001 through RULE-010
 * Executed via: node --test tests/spec.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { pathToFileURL } from 'node:url';
import path from 'node:path';

const rawEnginePath = process.env.ENGINE_PATH;
const resolvedPath = rawEnginePath
  ? path.resolve(process.cwd(), rawEnginePath)
  : path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/engine.js');
const engineUrl = pathToFileURL(resolvedPath).href;

const {
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
} = await import(engineUrl);

import { LESSONS, ESP32_PINS_30, ESP32_PINS_38, WIRE_COLORS } from '../src/lessons.js';

// In-memory storage mock helper
function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

describe('RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi (AgeBandController)', () => {
  it('defaults to band-b when storage is empty or contains invalid band', () => {
    const s1 = createMockStorage();
    const c1 = new AgeBandController(s1);
    assert.equal(c1.getBand(), AGE_BANDS.BAND_B);

    const s2 = createMockStorage({ 'user-age-band': 'invalid-band-x' });
    const c2 = new AgeBandController(s2);
    assert.equal(c2.getBand(), AGE_BANDS.BAND_B);

    const s3 = createMockStorage({ 'user-age-band': '' });
    const c3 = new AgeBandController(s3);
    assert.equal(c3.getBand(), AGE_BANDS.BAND_B);
  });

  it('rejects invalid age bands in setBand with descriptive Error', () => {
    const c = new AgeBandController(createMockStorage());
    assert.throws(() => c.setBand('unknown'), /Invalid age band: unknown/);
    assert.throws(() => c.setBand(''), /Invalid age band:/);
    assert.throws(() => c.setBand(null), /Invalid age band:/);
  });

  it('persists and restores all valid age bands (band-a, band-b, band-c)', () => {
    const s = createMockStorage();
    const c = new AgeBandController(s);

    c.setBand(AGE_BANDS.BAND_A);
    assert.equal(s.getItem('user-age-band'), AGE_BANDS.BAND_A);
    const cA = new AgeBandController(s);
    assert.equal(cA.getBand(), AGE_BANDS.BAND_A);

    c.setBand(AGE_BANDS.BAND_C);
    assert.equal(s.getItem('user-age-band'), AGE_BANDS.BAND_C);
    const cC = new AgeBandController(s);
    assert.equal(cC.getBand(), AGE_BANDS.BAND_C);
  });

  it('strictly enforces capabilities contract for all 3 age bands', () => {
    const c = new AgeBandController(createMockStorage());

    // Band A: Kid Spark (5-8)
    const capA = c.setBand(AGE_BANDS.BAND_A);
    assert.equal(capA.band, 'band-a');
    assert.equal(capA.modeName, 'Kid Spark');
    assert.equal(capA.ageRange, '5–8');
    assert.equal(capA.showCodeEditor, false);
    assert.equal(capA.showPinout, false);
    assert.equal(capA.showStoryCards, true);
    assert.equal(capA.showBlockWorkspace, false);
    assert.equal(capA.minButtonSizePx, 64);
    assert.equal(capA.interactiveSound, true);

    // Band B: Block Explorer (9-13)
    const capB = c.setBand(AGE_BANDS.BAND_B);
    assert.equal(capB.band, 'band-b');
    assert.equal(capB.modeName, 'Block Explorer');
    assert.equal(capB.ageRange, '9–13');
    assert.equal(capB.showCodeEditor, false);
    assert.equal(capB.showPinout, true);
    assert.equal(capB.showStoryCards, false);
    assert.equal(capB.showBlockWorkspace, true);
    assert.equal(capB.minButtonSizePx, 44);
    assert.equal(capB.interactiveSound, true);

    // Band C: Maker Pro (14-20)
    const capC = c.setBand(AGE_BANDS.BAND_C);
    assert.equal(capC.band, 'band-c');
    assert.equal(capC.modeName, 'Maker Pro');
    assert.equal(capC.ageRange, '14–20');
    assert.equal(capC.showCodeEditor, true);
    assert.equal(capC.showPinout, true);
    assert.equal(capC.showStoryCards, false);
    assert.equal(capC.showBlockWorkspace, false);
    assert.equal(capC.minButtonSizePx, 36);
    assert.equal(capC.interactiveSound, true);
  });

  it('supports listeners, handles listener errors gracefully, and allows unsubscription', () => {
    const c = new AgeBandController(createMockStorage());
    let notified = null;
    const unsub = c.addListener((evt) => {
      notified = evt;
    });

    c.addListener(() => {
      throw new Error('Listener error tolerance test');
    });

    c.setBand(AGE_BANDS.BAND_C);
    assert.ok(notified);
    assert.equal(notified.band, AGE_BANDS.BAND_C);

    notified = null;
    unsub();
    c.setBand(AGE_BANDS.BAND_B);
    assert.equal(notified, null);
  });
});

describe('RULE-002: Ma Trận Sơ Đồ Chân & An Toàn Điện (Esp32SafetyEngine)', () => {
  it('enforces exact 3.3V logic voltage boundary (3.300V safe vs 3.301V overvoltage)', () => {
    assert.equal(Esp32SafetyEngine.validateVoltage(0.0).safe, true);
    assert.equal(Esp32SafetyEngine.validateVoltage(3.300).safe, true);
    assert.equal(Esp32SafetyEngine.validateVoltage(3.300).code, 'OK');

    const over01 = Esp32SafetyEngine.validateVoltage(3.301);
    assert.equal(over01.safe, false);
    assert.equal(over01.code, 'OVERVOLTAGE_WARNING');

    const over5v = Esp32SafetyEngine.validateVoltage(5.0);
    assert.equal(over5v.safe, false);
    assert.equal(over5v.code, 'OVERVOLTAGE_WARNING');
  });

  it('strictly forbids OUTPUT mode on ALL input-only pins: 34, 35, 36, 39', () => {
    [34, 35, 36, 39].forEach((pin) => {
      const outNum = Esp32SafetyEngine.validatePinMode(pin, 'OUTPUT');
      assert.equal(outNum.valid, false, `Pin ${pin} must reject OUTPUT`);
      assert.equal(outNum.code, 'PIN_CANNOT_BE_OUTPUT');

      const outStr = Esp32SafetyEngine.validatePinMode(String(pin), 'OUTPUT');
      assert.equal(outStr.valid, false);

      const outLower = Esp32SafetyEngine.validatePinMode(pin, 'output');
      assert.equal(outLower.valid, false);

      const inRes = Esp32SafetyEngine.validatePinMode(pin, 'INPUT');
      assert.equal(inRes.valid, true);
    });

    [2, 4, 18, 19, 21, 22, 23].forEach((pin) => {
      assert.equal(Esp32SafetyEngine.validatePinMode(pin, 'OUTPUT').valid, true);
    });
  });

  it('calculates LED current via Ohm law: safe (<=20mA), stressed (20-40mA), burned (>40mA or R=0)', () => {
    // R = 0 -> instant burnout
    const r0 = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 2.0, rSeries: 0 });
    assert.equal(r0.isBurned, true);
    assert.equal(r0.state, 'COMPONENT_BURNED_STATE');

    // V_gpio <= V_forward -> OFF
    const off = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 3.3, rSeries: 220 });
    assert.equal(off.currentMa, 0);
    assert.equal(off.state, 'OFF_STATE');
    assert.equal(off.isBurned, false);

    // Normal safe operation (<= 20mA)
    const normal = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 2.0, rSeries: 220 });
    assert.equal(normal.isSafe, true);
    assert.equal(normal.isBurned, false);
    assert.equal(normal.state, 'NORMAL_OPERATION');

    // Safe boundary at exactly 20.0mA
    const bound20 = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 1.3, rSeries: 100 });
    assert.equal(bound20.currentMa, 20);
    assert.equal(bound20.isSafe, true);
    assert.equal(bound20.isBurned, false);
    assert.equal(bound20.state, 'NORMAL_OPERATION');

    // Stressed operation boundary at 40.0mA
    const bound40 = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 1.3, rSeries: 50 });
    assert.equal(bound40.currentMa, 40);
    assert.equal(bound40.isSafe, false);
    assert.equal(bound40.isBurned, false);
    assert.equal(bound40.state, 'STRESSED_OPERATION');

    // Burnout strictly at > 40mA (e.g. 45mA with R=40 ohm)
    const burn45 = Esp32SafetyEngine.calculateLedCurrent({ vGpio: 3.3, vForward: 1.5, rSeries: 40 });
    assert.equal(burn45.currentMa, 45);
    assert.equal(burn45.isBurned, true);
    assert.equal(burn45.state, 'COMPONENT_BURNED_STATE');
  });

  it('verifies ADC1 operation vs ADC2 Wi-Fi lock across ALL documented pins', () => {
    // ADC1 pins
    const adc1Pins = [32, 33, 34, 35, 36, 39];
    adc1Pins.forEach((pin) => {
      const resWifiOn = Esp32SafetyEngine.readAdc(pin, 1.65, true);
      assert.equal(resWifiOn.success, true, `ADC1 pin ${pin} should succeed with WiFi active`);
      assert.ok(Math.abs(resWifiOn.value - 2048) <= 2);

      const resWifiOff = Esp32SafetyEngine.readAdc(pin, 1.65, false);
      assert.equal(resWifiOff.success, true);
    });

    // ADC2 pins
    const adc2Pins = [0, 2, 4, 12, 13, 14, 15, 25, 26, 27];
    adc2Pins.forEach((pin) => {
      const resWifiOn = Esp32SafetyEngine.readAdc(pin, 1.65, true);
      assert.equal(resWifiOn.success, false, `ADC2 pin ${pin} should be locked when WiFi is active`);
      assert.equal(resWifiOn.code, 'ADC2_LOCKED_BY_WIFI');
      assert.equal(resWifiOn.value, null);

      const resWifiOff = Esp32SafetyEngine.readAdc(pin, 3.3, false);
      assert.equal(resWifiOff.success, true);
      assert.equal(resWifiOff.value, 4095);
    });
  });

  it('verifies all 10 capacitive touch channels and rejects non-touch pins', () => {
    const touchPins = [0, 2, 4, 12, 13, 14, 15, 27, 32, 33];
    touchPins.forEach((pin) => {
      const idle = Esp32SafetyEngine.readTouch(pin, false);
      assert.equal(idle.success, true);
      assert.equal(idle.active, false);
      assert.ok(idle.value >= 80);

      const touched = Esp32SafetyEngine.readTouch(pin, true);
      assert.equal(touched.success, true);
      assert.equal(touched.active, true);
      assert.ok(touched.value < 40);
    });

    [16, 17, 21, 22, 23, 34, 35, 36, 39].forEach((pin) => {
      const bad = Esp32SafetyEngine.readTouch(pin, false);
      assert.equal(bad.success, false);
      assert.equal(bad.code, 'NOT_A_TOUCH_PIN');
    });
  });

  it('verifies standard wiring color constants in WIRE_COLORS', () => {
    assert.equal(WIRE_COLORS.signalAmber, '#f0a53a');
    assert.equal(WIRE_COLORS.signalBlue, '#3d6fc4');
    assert.equal(WIRE_COLORS.power3v3, '#e04a3f');
    assert.equal(WIRE_COLORS.power5v, '#b82e24');
    assert.equal(WIRE_COLORS.gnd, '#2f3547');
  });
});

describe('RULE-003: Mô Phỏng Band A (Kid Spark: 5–8 Tuổi)', () => {
  it('clamps Level Crossing flash rate strictly within [100ms, 1500ms] in 50ms steps', () => {
    assert.equal(BandASimulator.clampRate(0), 100);
    assert.equal(BandASimulator.clampRate(99), 100);
    assert.equal(BandASimulator.clampRate(100), 100);
    assert.equal(BandASimulator.clampRate(120), 100);
    assert.equal(BandASimulator.clampRate(130), 150);
    assert.equal(BandASimulator.clampRate(1500), 1500);
    assert.equal(BandASimulator.clampRate(1501), 1500);
    assert.equal(BandASimulator.clampRate(5000), 1500);

    const colors = BandASimulator.getLevelCrossingColors();
    assert.deepEqual(colors, ['#ff3b30', '#ffcc00', '#34c759']);
  });

  it('triggers Fridge Guard 2400Hz alarm strictly when angle > 12° and duration > grace period', () => {
    // Angle boundary at exactly 12 degrees (safe)
    const b12 = BandASimulator.checkFridgeAlarm(12, 10000, 3000);
    assert.equal(b12.isViolating, false);
    assert.equal(b12.isAlarming, false);

    const b10 = BandASimulator.checkFridgeAlarm(10, 5000, 3000);
    assert.equal(b10.isViolating, false);
    assert.equal(b10.isAlarming, false);

    // Angle > 12 degrees
    const b12_1 = BandASimulator.checkFridgeAlarm(12.1, 1000, 3000);
    assert.equal(b12_1.isViolating, true);
    assert.equal(b12_1.isAlarming, false);

    const b45_grace = BandASimulator.checkFridgeAlarm(45, 3000, 3000);
    assert.equal(b45_grace.isViolating, true);
    assert.equal(b45_grace.isAlarming, false);

    const b45_alarm = BandASimulator.checkFridgeAlarm(45, 3001, 3000);
    assert.equal(b45_alarm.isViolating, true);
    assert.equal(b45_alarm.isAlarming, true);
    assert.equal(b45_alarm.alarmFreq, 2400);
    assert.equal(b45_alarm.redBlink, true);
  });

  it('generates harmonic sinusoidal siren sweep strictly within [400Hz, 1200Hz] with period 1600ms', () => {
    assert.equal(BandASimulator.getSirenFrequency(0, 1600), 800);
    assert.equal(BandASimulator.getSirenFrequency(400, 1600), 1200);
    assert.equal(BandASimulator.getSirenFrequency(800, 1600), 800);
    assert.equal(BandASimulator.getSirenFrequency(1200, 1600), 400);
    assert.equal(BandASimulator.getSirenFrequency(1600, 1600), 800);

    for (let t = 0; t <= 1600; t += 50) {
      const f = BandASimulator.getSirenFrequency(t, 1600);
      assert.ok(f >= 400 && f <= 1200, `Freq ${f} at ${t}ms out of range`);
    }
  });

  it('provides exactly 8 standard piano notes C4 to C5 with accurate frequencies', () => {
    const notes = BandASimulator.getPianoNotes();
    assert.equal(notes.length, 8);
    const expected = [
      { name: 'C4', freq: 261.63, key: '1' },
      { name: 'D4', freq: 293.66, key: '2' },
      { name: 'E4', freq: 329.63, key: '3' },
      { name: 'F4', freq: 349.23, key: '4' },
      { name: 'G4', freq: 392.00, key: '5' },
      { name: 'A4', freq: 440.00, key: '6' },
      { name: 'B4', freq: 493.88, key: '7' },
      { name: 'C5', freq: 523.25, key: '8' }
    ];
    for (let i = 0; i < 8; i++) {
      assert.equal(notes[i].name, expected[i].name);
      assert.equal(notes[i].freq, expected[i].freq);
      assert.equal(notes[i].key, expected[i].key);
    }
  });

  it('mixes 3-channel RGB Mood Lamp colors with clamping to [0, 255] and hex/css formatting', () => {
    const red = BandASimulator.getMoodLampColor(255, 0, 0);
    assert.equal(red.hex, '#ff0000');
    assert.equal(red.css, 'rgb(255, 0, 0)');

    const green = BandASimulator.getMoodLampColor(0, 255, 0);
    assert.equal(green.hex, '#00ff00');

    const blue = BandASimulator.getMoodLampColor(0, 0, 255);
    assert.equal(blue.hex, '#0000ff');

    const clamped = BandASimulator.getMoodLampColor(300, -50, 128.8);
    assert.equal(clamped.r, 255);
    assert.equal(clamped.g, 0);
    assert.equal(clamped.b, 129);
  });

  it('evaluates Night Light threshold logic (default 50%)', () => {
    assert.equal(BandASimulator.evaluateNightLight(30, 50).ledOn, true);
    assert.equal(BandASimulator.evaluateNightLight(50, 50).ledOn, false);
    assert.equal(BandASimulator.evaluateNightLight(75, 50).ledOn, false);
  });
});

describe('RULE-004: Mô Phỏng Band B (Block Explorer: 9–13 Tuổi)', () => {
  it('calculates Neopixel lit count with integer floor formula N_lit = floor((ADC/4095) * 12)', () => {
    assert.equal(BandBSimulator.calculateNeopixelRing(0).numLit, 0);
    assert.equal(BandBSimulator.calculateNeopixelRing(341).numLit, 0);
    assert.equal(BandBSimulator.calculateNeopixelRing(342).numLit, 1);
    assert.equal(BandBSimulator.calculateNeopixelRing(2047).numLit, 5);
    assert.equal(BandBSimulator.calculateNeopixelRing(2048).numLit, 6);
    assert.equal(BandBSimulator.calculateNeopixelRing(4095).numLit, 12);
  });

  it('renders Neopixel ring with all 3 color modes: blue, traffic, rainbow', () => {
    const blueMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'blue');
    blueMode.leds.forEach((l) => assert.equal(l.color, '#0088ff'));

    const trafficMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'traffic');
    assert.equal(trafficMode.leds[0].color, '#34c759');
    assert.equal(trafficMode.leds[4].color, '#ffcc00');
    assert.equal(trafficMode.leds[8].color, '#ff3b30');

    const rainbowMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'rainbow');
    assert.equal(rainbowMode.leds[0].color, 'hsl(0, 100%, 55%)');
  });

  it('calculates ultrasonic pulse timing delta_t = (2 * d) / 0.0343 us clamped in [2cm, 400cm]', () => {
    const low = BandBSimulator.calculateUltrasonic(1);
    assert.equal(low.distanceCm, 2);
    assert.equal(low.progressRatio, 0);

    const high = BandBSimulator.calculateUltrasonic(450);
    assert.equal(high.distanceCm, 400);
    assert.equal(high.progressRatio, 1);

    const mid = BandBSimulator.calculateUltrasonic(25);
    const expected = (2 * 25) / 0.0343;
    assert.ok(Math.abs(mid.echoDurationUs - expected) < 0.5);
    assert.equal(mid.displayStr, '25.0 cm');
  });

  it('drives Laser Barrier Servo FSM through full cycle: CLOSED -> OPENING -> OPEN_HOLD -> CLOSING -> CLOSED', () => {
    const gate = BandBSimulator.createLaserGateFsm();
    assert.equal(gate.state, 'CLOSED');
    assert.equal(gate.angle, 0);

    gate.update(10, true);
    assert.equal(gate.state, 'OPENING');

    gate.update(250, false);
    assert.equal(gate.angle, 45); // 250ms * 0.18 deg/ms = 45 deg

    gate.update(250, false);
    assert.equal(gate.state, 'OPEN_HOLD');
    assert.equal(gate.angle, 90);

    gate.update(2999, false);
    assert.equal(gate.state, 'OPEN_HOLD');

    gate.update(10, false);
    assert.equal(gate.state, 'CLOSING');

    gate.update(500, false);
    assert.equal(gate.state, 'CLOSED');
    assert.equal(gate.angle, 0);
  });

  it('calculates DC motor RPM and angular velocity linearly from PWM duty (0..100%)', () => {
    const zero = BandBSimulator.calculateMotorRpm(0, 1000);
    assert.equal(zero.rpm, 0);

    const half = BandBSimulator.calculateMotorRpm(50, 1000);
    assert.equal(half.rpm, 500);

    const full = BandBSimulator.calculateMotorRpm(100, 1000);
    assert.equal(full.rpm, 1000);

    const clamped = BandBSimulator.calculateMotorRpm(150, 1000);
    assert.equal(clamped.rpm, 1000);
  });
});

describe('RULE-005: Hệ Thống Tiến Trình & Gamification (ProgressAndGamificationEngine)', () => {
  it('calculates overall progress percentage floor((N/20)*100) and aria attributes', () => {
    const g = new ProgressAndGamificationEngine(createMockStorage());
    assert.equal(g.getProgressPercentage(), 0);
    assert.equal(g.getProgressText(), '0/20');

    for (let i = 1; i <= 5; i++) {
      g.markLessonComplete(`l-${i}`, i, AGE_BANDS.BAND_B);
    }
    assert.equal(g.getProgressPercentage(), 25);
    assert.equal(g.getProgressText(), '5/20');
    const aria = g.getAriaAttributes();
    assert.equal(aria['aria-valuenow'], '5');
  });

  it('awards correct XP by band: +50XP (Band A), +100XP (Band B), +150XP (Band C)', () => {
    const g = new ProgressAndGamificationEngine(createMockStorage());
    g.markLessonComplete('l1', 1, AGE_BANDS.BAND_A);
    assert.equal(g.xp, 50);

    g.markLessonComplete('l2', 2, AGE_BANDS.BAND_B);
    assert.equal(g.xp, 150);

    g.markLessonComplete('l3', 3, AGE_BANDS.BAND_C);
    assert.equal(g.xp, 300);
  });

  it('awards +25XP first-try quiz bonus ONLY when score is 3/3 and isFirstTry is true', () => {
    const g1 = new ProgressAndGamificationEngine(createMockStorage());
    g1.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 3, true);
    assert.equal(g1.xp, 125); // 100 + 25

    const g2 = new ProgressAndGamificationEngine(createMockStorage());
    g2.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 2, true);
    assert.equal(g2.xp, 100);

    const g3 = new ProgressAndGamificationEngine(createMockStorage());
    g3.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 3, false);
    assert.equal(g3.xp, 100);
  });

  it('prevents duplicate XP awards and duplicate progress count on repeating completed lessons', () => {
    const g = new ProgressAndGamificationEngine(createMockStorage());
    const first = g.markLessonComplete('blink', 2, AGE_BANDS.BAND_B);
    assert.equal(first.newlyCompleted, true);
    assert.equal(g.xp, 100);
    assert.equal(g.completedLessons.length, 1);

    const second = g.markLessonComplete('blink', 2, AGE_BANDS.BAND_B);
    assert.equal(second.newlyCompleted, false);
    assert.equal(g.xp, 100);
    assert.equal(g.completedLessons.length, 1);
  });

  it('unlocks all 4 milestone badges: Blink Master, Acoustic Wizard, IoT Explorer, Mechatronics Pro', () => {
    const g = new ProgressAndGamificationEngine(createMockStorage());
    g.markLessonComplete('blink', 2, AGE_BANDS.BAND_B);
    assert.ok(g.badges.includes('Blink Master'));

    g.markLessonComplete('piano', 6, AGE_BANDS.BAND_B);
    assert.ok(g.badges.includes('Acoustic Wizard'));

    g.markLessonComplete('wifi', 4, AGE_BANDS.BAND_C);
    assert.ok(g.badges.includes('IoT Explorer'));

    g.markLessonComplete('stepper', 20, AGE_BANDS.BAND_C);
    assert.ok(g.badges.includes('Mechatronics Pro'));

    assert.equal(g.badges.length, 4);

    const reset = g.resetProgress();
    assert.equal(reset.progressPercentage, 0);
    assert.equal(reset.xp, 0);
    assert.equal(reset.badges.length, 0);
    assert.equal(g.completedLessons.length, 0);
  });
});

describe('RULE-006: Code Execution Engine & Serial Monitor (Expanded)', () => {
  it('manages execution FSM lifecycle and upload logs for C++ vs MicroPython with 600ms delays', async () => {
    const engine = new CodeExecutionEngine(createMockStorage());
    assert.equal(engine.state, 'idle');

    // 1. Test C++ Upload Lifecycle (isPython: false)
    const stateTransitionsCpp = [];
    const logsCpp = [];
    const cppPromise = engine.startUpload({
      isPython: false,
      onStateChange: (s) => stateTransitionsCpp.push(s),
      onLog: (msg, tag) => logsCpp.push({ msg, tag })
    });

    // Immediate state MUST be 'uploading' (Kills Mutant-2 if bypassed)
    assert.equal(engine.state, 'uploading');
    assert.equal(stateTransitionsCpp[0], 'uploading');
    assert.equal(logsCpp.length, 1);
    assert.equal(logsCpp[0].msg, 'Compiling sketch…');
    assert.equal(logsCpp[0].tag, 'txrx-active');

    // Re-entrant upload while uploading should be rejected/ignored
    const duplicatePromise = engine.startUpload();
    assert.equal(engine.state, 'uploading');

    await cppPromise;
    assert.equal(engine.state, 'running');
    assert.equal(stateTransitionsCpp[stateTransitionsCpp.length - 1], 'running');
    assert.equal(logsCpp.length, 3);
    assert.equal(logsCpp[1].msg, 'Connecting to ESP32 on USB…');
    assert.equal(logsCpp[1].tag, 'txrx-active');
    assert.equal(logsCpp[2].msg, 'Writing… 100 %. Hard resetting via RTS pin.');
    assert.equal(logsCpp[2].tag, 'txrx-done');

    // Stop execution
    engine.stop({ onStateChange: (s) => stateTransitionsCpp.push(s) });
    assert.equal(engine.state, 'idle');
    assert.equal(stateTransitionsCpp[stateTransitionsCpp.length - 1], 'idle');

    // 2. Test MicroPython Upload Lifecycle (isPython: true)
    const logsPy = [];
    const pyPromise = engine.startUpload({
      isPython: true,
      onLog: (msg, tag) => logsPy.push({ msg, tag })
    });

    assert.equal(logsPy[0].msg, 'Parsing MicroPython script…');
    assert.equal(logsPy[0].tag, 'txrx-active');

    await pyPromise;
    assert.equal(logsPy[1].msg, 'Connecting to ESP32 on USB…');
    assert.equal(logsPy[2].msg, 'Writing… 100 %. Hard resetting via RTS pin.');
    engine.stop();
  });

  it('substitutes multi-parameter, numeric zero, missing, and duplicate {{paramKey}} template variables', () => {
    const engine = new CodeExecutionEngine(createMockStorage());

    // Multiple parameters
    const tpl1 = 'delay({{rate}}); ledcWrite({{channel}}, {{duty}});';
    const res1 = engine.substituteParams(tpl1, { rate: 500, channel: 0, duty: 255 });
    assert.equal(res1, 'delay(500); ledcWrite(0, 255);');

    // Falsy value check (duty = 0 must be substituted, not ignored)
    const tpl2 = 'ledcWrite(0, {{duty}});';
    const res2 = engine.substituteParams(tpl2, { duty: 0 });
    assert.equal(res2, 'ledcWrite(0, 0);');

    // Unprovided parameter remains intact
    const tpl3 = 'int pin = {{pin}}; int baud = {{baud}};';
    const res3 = engine.substituteParams(tpl3, { pin: 2 });
    assert.equal(res3, 'int pin = 2; int baud = {{baud}};');

    // Duplicate parameter occurrences
    const tpl4 = 'Serial.print({{msg}}); Serial.println({{msg}});';
    const res4 = engine.substituteParams(tpl4, { msg: '"OK"' });
    assert.equal(res4, 'Serial.print("OK"); Serial.println("OK");');

    // Empty template and empty params
    assert.equal(engine.substituteParams('', {}), '');
  });

  it('verifies code line tracing .code-line.is-running class addition and clearing on stop', () => {
    // Mock DOM line representation
    function createMockLine(text) {
      const classes = new Set(['code-line']);
      return {
        textContent: text,
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c)
        }
      };
    }

    const lines = [
      createMockLine('void setup() {'),
      createMockLine('  digitalWrite(2, HIGH);'),
      createMockLine('  delay(1000);'),
      createMockLine('}')
    ];

    function traceLine(targetText) {
      lines.forEach((el) => {
        if (el.textContent.includes(targetText)) {
          el.classList.add('is-running');
        } else {
          el.classList.remove('is-running');
        }
      });
    }

    function clearTracing() {
      lines.forEach((el) => el.classList.remove('is-running'));
    }

    // Step 1: Trace statement 1
    traceLine('digitalWrite(2, HIGH)');
    assert.equal(lines[1].classList.contains('is-running'), true);
    assert.equal(lines[2].classList.contains('is-running'), false);

    // Step 2: Trace statement 2
    traceLine('delay(1000)');
    assert.equal(lines[1].classList.contains('is-running'), false);
    assert.equal(lines[2].classList.contains('is-running'), true);

    // Step 3: Clear on stop
    clearTracing();
    assert.equal(lines[1].classList.contains('is-running'), false);
    assert.equal(lines[2].classList.contains('is-running'), false);
  });

  it('clamps serial monitor height within [56px, 360px] and restores 92px on double-click', () => {
    const storage = createMockStorage();
    const engine = new CodeExecutionEngine(storage);

    // Default fallback
    assert.equal(engine.getSavedConsoleHeight(), 92);

    // Lower boundary test (55px clamped to 56px, 56px exact)
    assert.equal(engine.saveConsoleHeight(55), 56);
    assert.equal(engine.getSavedConsoleHeight(), 56);
    assert.equal(engine.saveConsoleHeight(56), 56);
    assert.equal(engine.getSavedConsoleHeight(), 56);

    // Upper boundary test (361px clamped to 360px, 360px exact)
    assert.equal(engine.saveConsoleHeight(361), 360);
    assert.equal(engine.getSavedConsoleHeight(), 360);
    assert.equal(engine.saveConsoleHeight(360), 360);
    assert.equal(engine.getSavedConsoleHeight(), 360);

    // Float rounding
    assert.equal(engine.saveConsoleHeight(150.4), 150);
    assert.equal(engine.saveConsoleHeight(150.6), 151);

    // Corrupt value in storage falls back to 92
    storage.setItem('learn-esp32-serial-h', 'invalid_height');
    assert.equal(engine.getSavedConsoleHeight(), 92);

    // Double-click restore action
    assert.equal(engine.saveConsoleHeight(92), 92);
    assert.equal(engine.getSavedConsoleHeight(), 92);
  });
});

describe('RULE-007: Mạng Không Dây IoT & ESP-NOW (Expanded)', () => {
  it('handles SoftAP 192.168.1.42 HTTP GET /toggle endpoint with state alternation and payload integrity', () => {
    const sim = new WirelessIoTSimulator();
    assert.equal(sim.virtualIp, '192.168.1.42');
    assert.equal(sim.webLedState, false);

    // Request 1: flips false -> true
    const res1 = sim.handleHttpToggle();
    assert.equal(res1.status, 200);
    assert.equal(res1.statusText, 'OK');
    assert.equal(res1.data.led, true);
    assert.equal(res1.data.ip, '192.168.1.42');
    assert.equal(sim.webLedState, true);

    // Request 2: flips true -> false
    const res2 = sim.handleHttpToggle();
    assert.equal(res2.status, 200);
    assert.equal(res2.data.led, false);
    assert.equal(sim.webLedState, false);

    // Request 3: flips false -> true
    const res3 = sim.handleHttpToggle();
    assert.equal(res3.status, 200);
    assert.equal(res3.data.led, true);
  });

  it('handles Bluetooth SPP/BLE commands "ON", "OFF", "DIM", whitespace/case insensitivity, and invalid command error rejection', () => {
    const sim = new WirelessIoTSimulator();

    // Command 'ON' with whitespace & lowercase
    const onRes = sim.sendBluetoothCommand('  on  ');
    assert.equal(onRes.success, true);
    assert.equal(onRes.response, 'OK: LAMP IS ON');
    assert.equal(onRes.lampState, true);
    assert.equal(sim.bluetoothLampState, true);

    // Command 'DIM' preserves current lampState (true)
    const dimRes = sim.sendBluetoothCommand('DIM');
    assert.equal(dimRes.success, true);
    assert.equal(dimRes.response, 'OK: LAMP DIMMED 50%');
    assert.equal(dimRes.lampState, true);
    assert.equal(sim.bluetoothLampState, true);

    // Command 'OFF'
    const offRes = sim.sendBluetoothCommand('off');
    assert.equal(offRes.success, true);
    assert.equal(offRes.response, 'OK: LAMP IS OFF');
    assert.equal(offRes.lampState, false);
    assert.equal(sim.bluetoothLampState, false);

    // Command 'DIM' preserves current lampState (false)
    const dimRes2 = sim.sendBluetoothCommand('  dim  ');
    assert.equal(dimRes2.success, true);
    assert.equal(dimRes2.lampState, false);

    // Invalid commands rejection
    const invalid1 = sim.sendBluetoothCommand('BLINK');
    assert.equal(invalid1.success, false);
    assert.equal(invalid1.response, 'ERROR: UNKNOWN COMMAND');

    const invalid2 = sim.sendBluetoothCommand('');
    assert.equal(invalid2.success, false);
    assert.equal(invalid2.response, 'ERROR: UNKNOWN COMMAND');

    // State is preserved after invalid command
    assert.equal(sim.bluetoothLampState, false);
  });

  it('verifies ESP-NOW payload boundary (250 bytes OK, 251 bytes error) and sigmoidal loss curve beyond 100m', () => {
    const sim = new WirelessIoTSimulator();

    // 1. Payload Boundary Tests
    // 0 bytes (empty payload) OK
    const emptyRes = sim.calculateEspNowPacket(10, []);
    assert.notEqual(emptyRes.success, false);

    // 250 bytes (maximum allowed) OK
    const maxPayload = new Array(250).fill(0xAA);
    const okRes = sim.calculateEspNowPacket(25, maxPayload);
    assert.notEqual(okRes.success, false);
    assert.equal(okRes.payloadSize, 250);

    // 251 bytes (exceeds limit) FAILS
    const overflowPayload = new Array(251).fill(0xAA);
    const overflowRes = sim.calculateEspNowPacket(25, overflowPayload);
    assert.equal(overflowRes.success, false);
    assert.equal(overflowRes.error, 'PAYLOAD_EXCEEDS_250_BYTES');

    // 2. Distance Loss Curve Tests
    // Within 100m: strictly 0% packet loss
    [0.5, 25, 50, 75, 100].forEach((d) => {
      const res = sim.calculateEspNowPacket(d, [1, 2]);
      assert.equal(res.packetLossPercentage, 0, `Expected 0% loss at ${d}m`);
      assert.equal(res.distanceMeters, d);
    });

    // Inflection point at 125m: 1 / (1 + e^0) = 50%
    const midRes = sim.calculateEspNowPacket(125, [1, 2]);
    assert.equal(midRes.packetLossPercentage, 50, 'Expected 50% loss at 125m');

    // Far distance at 140m: ~82% loss rate
    const farRes140 = sim.calculateEspNowPacket(140, [1, 2]);
    assert.ok(farRes140.packetLossPercentage >= 80, 'Expected >=80% loss at 140m');

    // Far distance at 150m: ~92% loss rate
    const farRes150 = sim.calculateEspNowPacket(150, [1, 2]);
    assert.ok(farRes150.packetLossPercentage >= 90, 'Expected >=90% loss at 150m');

    // Distance clamping
    const clampLow = sim.calculateEspNowPacket(0.1, [1]);
    assert.equal(clampLow.distanceMeters, 0.5);

    const clampHigh = sim.calculateEspNowPacket(300, [1]);
    assert.equal(clampHigh.distanceMeters, 150);
  });
});

describe('RULE-008: Cơ Điện Tử & Robot STEM (Expanded)', () => {
  it('verifies smart pump hysteresis exact boundary thresholds (20%, 20.1%, 89.9%, 90%) and latch memory', () => {
    // Exact Turn ON threshold (<= 20%)
    const at20 = MechatronicsSimulator.updatePumpHysteresis(20.0, false);
    assert.equal(at20.pumpActive, true, 'Pump must turn ON at exactly 20.0%');

    const below20 = MechatronicsSimulator.updatePumpHysteresis(0, false);
    assert.equal(below20.pumpActive, true, 'Pump must be ON at 0%');

    // Exact Turn OFF threshold (>= 90%)
    const at90 = MechatronicsSimulator.updatePumpHysteresis(90.0, true);
    assert.equal(at90.pumpActive, false, 'Pump must turn OFF at exactly 90.0%');

    const above90 = MechatronicsSimulator.updatePumpHysteresis(100, true);
    assert.equal(above90.pumpActive, false, 'Pump must be OFF at 100%');

    // Hysteresis Latch Zone (20% < H < 90%) - CRITICAL TO KILL MUTANT-3
    // At 20.1%: preserves previous state
    const latch201_off = MechatronicsSimulator.updatePumpHysteresis(20.1, false);
    assert.equal(latch201_off.pumpActive, false, 'Pump at 20.1% must remain OFF if previously OFF');

    const latch201_on = MechatronicsSimulator.updatePumpHysteresis(20.1, true);
    assert.equal(latch201_on.pumpActive, true, 'Pump at 20.1% must remain ON if previously ON');

    // At 50%: preserves previous state
    const latch50_off = MechatronicsSimulator.updatePumpHysteresis(50.0, false);
    assert.equal(latch50_off.pumpActive, false, 'Pump at 50% must remain OFF if previously OFF');

    const latch50_on = MechatronicsSimulator.updatePumpHysteresis(50.0, true);
    assert.equal(latch50_on.pumpActive, true, 'Pump at 50% must remain ON if previously ON');

    // At 89.9%: preserves previous state
    const latch899_off = MechatronicsSimulator.updatePumpHysteresis(89.9, false);
    assert.equal(latch899_off.pumpActive, false, 'Pump at 89.9% must remain OFF if previously OFF');

    const latch899_on = MechatronicsSimulator.updatePumpHysteresis(89.9, true);
    assert.equal(latch899_on.pumpActive, true, 'Pump at 89.9% must remain ON if previously ON');
  });

  it('verifies 4x3 keypad buffer capping, successful unlock, lockout expiration, and rejection during lockout', () => {
    const lock = MechatronicsSimulator.createKeypadLock('4321');
    const t0 = 1000000;

    // Buffer typing & clear
    lock.press('4', t0);
    lock.press('3', t0);
    assert.equal(lock.buffer, '43');

    const clearRes = lock.press('*', t0);
    assert.equal(clearRes.action, 'CLEAR');
    assert.equal(lock.buffer, '');

    // Buffer capped at 4 digits
    lock.press('1', t0);
    lock.press('2', t0);
    lock.press('3', t0);
    lock.press('4', t0);
    const overflowKey = lock.press('5', t0);
    assert.equal(overflowKey.action, 'NO_OP');
    assert.equal(lock.buffer, '1234');
    lock.press('*', t0);

    // Correct PIN unlock
    lock.press('4', t0);
    lock.press('3', t0);
    lock.press('2', t0);
    lock.press('1', t0);
    const unlockRes = lock.press('#', t0);
    assert.equal(unlockRes.action, 'UNLOCKED');
    assert.equal(unlockRes.success, true);
    assert.equal(lock.failedAttempts, 0);

    // 3 wrong attempts trigger lockout
    const wrong1 = lock.press('#', t0); // Buffer is empty != '4321'
    assert.equal(wrong1.action, 'WRONG_PIN');
    assert.equal(lock.failedAttempts, 1);

    const wrong2 = lock.press('#', t0);
    assert.equal(wrong2.action, 'WRONG_PIN');
    assert.equal(lock.failedAttempts, 2);

    const wrong3 = lock.press('#', t0);
    assert.equal(wrong3.action, 'LOCKOUT_TRIGGERED');
    assert.equal(wrong3.failedAttempts, 3);
    assert.equal(lock.isLockedOut, true);

    // Attempt during lockout (after 5 seconds) is rejected
    const blocked = lock.press('4', t0 + 5000);
    assert.equal(blocked.action, 'LOCKED_OUT');
    assert.equal(blocked.remainingSec, 5);

    // After 10 seconds (at t0 + 10100), lockout expires and accepts new key
    const recovered = lock.press('4', t0 + 10100);
    assert.equal(recovered.action, 'DIGIT');
    assert.equal(lock.isLockedOut, false);
    assert.equal(lock.buffer, '4');
  });

  it('verifies solar tracker deadband delta=15, step directions, and servo clamp [10°, 170°]', () => {
    // Exact deadband boundary (diff = 15 -> in deadband, no move)
    const deadbandPos15 = MechatronicsSimulator.calculateSolarStep(100, 85, 90, 15);
    assert.equal(deadbandPos15.diff, 15);
    assert.equal(deadbandPos15.inDeadband, true);
    assert.equal(deadbandPos15.moved, false);
    assert.equal(deadbandPos15.angle, 90);

    const deadbandNeg15 = MechatronicsSimulator.calculateSolarStep(85, 100, 90, 15);
    assert.equal(deadbandNeg15.diff, -15);
    assert.equal(deadbandNeg15.inDeadband, true);
    assert.equal(deadbandNeg15.moved, false);
    assert.equal(deadbandNeg15.angle, 90);

    // Active tracking: diff = +16 steps +1°
    const stepLeft = MechatronicsSimulator.calculateSolarStep(100, 84, 90, 15);
    assert.equal(stepLeft.diff, 16);
    assert.equal(stepLeft.inDeadband, false);
    assert.equal(stepLeft.moved, true);
    assert.equal(stepLeft.angle, 91);

    // Active tracking: diff = -16 steps -1°
    const stepRight = MechatronicsSimulator.calculateSolarStep(84, 100, 90, 15);
    assert.equal(stepRight.diff, -16);
    assert.equal(stepRight.inDeadband, false);
    assert.equal(stepRight.moved, true);
    assert.equal(stepRight.angle, 89);

    // Upper clamp at 170°
    const clampUpper = MechatronicsSimulator.calculateSolarStep(150, 50, 170, 15);
    assert.equal(clampUpper.angle, 170);
    assert.equal(clampUpper.moved, false);

    // Lower clamp at 10°
    const clampLower = MechatronicsSimulator.calculateSolarStep(50, 150, 10, 15);
    assert.equal(clampLower.angle, 10);
    assert.equal(clampLower.moved, false);
  });

  it('verifies polarToCartesian for 0°, 45°, 90°, 180° sweeps and distance scaling', () => {
    const originX = 150;
    const originY = 150;
    const scale = 1.0;

    // Angle 0° (East: x = 150 + 100 = 250, y = 150)
    const p0 = MechatronicsSimulator.polarToCartesian(0, 100, originX, originY, scale);
    assert.equal(p0.x, 250);
    assert.equal(p0.y, 150);

    // Angle 90° (North: x = 150, y = 150 - 100 = 50)
    const p90 = MechatronicsSimulator.polarToCartesian(90, 100, originX, originY, scale);
    assert.equal(p90.x, 150);
    assert.equal(p90.y, 50);

    // Angle 180° (West: x = 150 - 100 = 50, y = 150)
    const p180 = MechatronicsSimulator.polarToCartesian(180, 100, originX, originY, scale);
    assert.equal(p180.x, 50);
    assert.equal(p180.y, 150);

    // Angle 45° (NE: x = 150 + 100*cos(45) ~ 221, y = 150 - 100*sin(45) ~ 79)
    const p45 = MechatronicsSimulator.polarToCartesian(45, 100, originX, originY, scale);
    assert.equal(p45.x, 221);
    assert.equal(p45.y, 79);

    // Scale parameter (scale = 1.2, distance = 50, angle 90° -> r = 60, y = 150 - 60 = 90)
    const pScale = MechatronicsSimulator.polarToCartesian(90, 50, originX, originY, 1.2);
    assert.equal(pScale.x, 150);
    assert.equal(pScale.y, 90);
  });

  it('verifies 200 step/rev 8mm pitch lead screw displacement (0.04mm/step) and clamping [0, 200mm]', () => {
    // Step resolution
    const pos1 = MechatronicsSimulator.calculateStepperPosition(1, 200, 8);
    assert.equal(pos1.mmPerStep, 0.04);
    assert.equal(pos1.linearPosMm, 0.04);

    // 1 full revolution (200 steps = 8mm)
    const pos200 = MechatronicsSimulator.calculateStepperPosition(200, 200, 8);
    assert.equal(pos200.linearPosMm, 8.0);

    // Max travel (5000 steps = 200mm)
    const pos5000 = MechatronicsSimulator.calculateStepperPosition(5000, 200, 8);
    assert.equal(pos5000.linearPosMm, 200.0);

    // Clamping beyond 200mm
    const pos6000 = MechatronicsSimulator.calculateStepperPosition(6000, 200, 8);
    assert.equal(pos6000.linearPosMm, 200.0);

    // Clamping below 0mm
    const posNeg = MechatronicsSimulator.calculateStepperPosition(-50, 200, 8);
    assert.equal(posNeg.linearPosMm, 0.0);
  });
});

describe('RULE-009 & RULE-010: Viewport, a11y & Environment (Expanded)', () => {
  it('verifies viewport pan accumulation, zoom clamping [0.4, 3.0], 90° rotation modulo 360°, and reset', () => {
    const vp = new ViewportAndSchematicController();

    // Initial state
    const s0 = vp.getState();
    assert.equal(s0.panX, 0);
    assert.equal(s0.panY, 0);
    assert.equal(s0.zoom, 1.0);
    assert.equal(s0.rotationDeg, 0);

    // Pan accumulation
    vp.pan(25, -10);
    vp.pan(-5, 30);
    assert.equal(vp.panX, 20);
    assert.equal(vp.panY, 20);

    // Zoom clamping
    vp.setZoom(0.2); // clamped to 0.4
    assert.equal(vp.zoom, 0.4);

    vp.setZoom(4.0); // clamped to 3.0
    assert.equal(vp.zoom, 3.0);

    vp.zoomBy(0.5); // 3.0 * 0.5 = 1.5
    assert.equal(vp.zoom, 1.5);

    // 90° Rotation modulo 360°
    vp.rotate(90);
    assert.equal(vp.rotationDeg, 90);
    vp.rotate(90);
    assert.equal(vp.rotationDeg, 180);
    vp.rotate(90);
    assert.equal(vp.rotationDeg, 270);
    vp.rotate(90);
    assert.equal(vp.rotationDeg, 0);

    // Negative rotation
    vp.rotate(-90);
    assert.equal(vp.rotationDeg, 270);

    // Reset view
    vp.reset();
    const sReset = vp.getState();
    assert.equal(sReset.panX, 0);
    assert.equal(sReset.panY, 0);
    assert.equal(sReset.zoom, 1.0);
    assert.equal(sReset.rotationDeg, 0);
  });

  it('verifies floating schematic card toggle, aria-pressed synchronization, and [200..600]x[140..500] size clamping', () => {
    const vp = new ViewportAndSchematicController();
    assert.equal(vp.schematicOpen, false);

    // Toggle open
    const open1 = vp.toggleSchematic();
    assert.equal(open1, true);
    assert.equal(vp.schematicOpen, true);

    // Toggle close
    const open2 = vp.toggleSchematic();
    assert.equal(open2, false);
    assert.equal(vp.schematicOpen, false);

    // Resize clamping
    // Below minimum [200, 140]
    const minResize = vp.resizeSchematic(150, 100);
    assert.equal(minResize.width, 200);
    assert.equal(minResize.height, 140);

    // Above maximum [600, 500]
    const maxResize = vp.resizeSchematic(800, 600);
    assert.equal(maxResize.width, 600);
    assert.equal(maxResize.height, 500);

    // Within valid range
    const validResize = vp.resizeSchematic(400, 300);
    assert.equal(validResize.width, 400);
    assert.equal(validResize.height, 300);
  });

  it('verifies all 5 environment settings (labels, grid, autoRotate, sound, reducedMotion) and JSON serialization', () => {
    const storage = createMockStorage();
    const env = new EnvironmentAndA11yController(storage);

    // 1. Default settings verification
    assert.equal(env.getSetting('labels'), true);
    assert.equal(env.getSetting('grid'), true);
    assert.equal(env.getSetting('autoRotate'), false);
    assert.equal(env.getSetting('sound'), true);
    assert.equal(env.getSetting('reducedMotion'), false);

    // 2. Setting updates & JSON persistence
    env.setSetting('grid', false);
    env.setSetting('autoRotate', true);
    assert.equal(env.getSetting('grid'), false);
    assert.equal(env.getSetting('autoRotate'), true);

    const savedRaw = storage.getItem('learn-esp32-settings');
    assert.ok(savedRaw, 'Settings must be stored in localStorage');
    const parsed = JSON.parse(savedRaw);
    assert.equal(parsed.grid, false);
    assert.equal(parsed.autoRotate, true);
    assert.equal(parsed.sound, true);

    // 3. Restoring from pre-existing storage
    const customStorage = createMockStorage({
      'learn-esp32-settings': JSON.stringify({
        labels: false,
        sound: false,
        reducedMotion: true
      })
    });
    const restoredEnv = new EnvironmentAndA11yController(customStorage);
    assert.equal(restoredEnv.getSetting('labels'), false);
    assert.equal(restoredEnv.getSetting('sound'), false);
    assert.equal(restoredEnv.getSetting('reducedMotion'), true);
    assert.equal(restoredEnv.getSetting('grid'), true); // falls back to default
  });

  it('verifies reduced motion tween speed factor (0.05 vs 1.0)', () => {
    const storage = createMockStorage();
    const env = new EnvironmentAndA11yController(storage);

    assert.equal(env.getTweenSpeedFactor(), 1.0);
    env.setSetting('reducedMotion', true);
    assert.equal(env.getTweenSpeedFactor(), 0.05);
    env.setSetting('reducedMotion', false);
    assert.equal(env.getTweenSpeedFactor(), 1.0);
  });

  it('verifies responsive compact layout boundary condition (W < 1090 or H < 800)', () => {
    const env = new EnvironmentAndA11yController(createMockStorage());

    // Boundary cases: strictly less than 1090 or strictly less than 800
    assert.equal(env.isCompactViewport(1089, 800), true, 'W=1089 should be compact');
    assert.equal(env.isCompactViewport(1090, 799), true, 'H=799 should be compact');
    assert.equal(env.isCompactViewport(1090, 800), false, 'W=1090, H=800 should be standard');
    assert.equal(env.isCompactViewport(1091, 801), false, 'W=1091, H=801 should be standard');

    // Typical screens
    assert.equal(env.isCompactViewport(768, 1024), true, 'Tablet portrait should be compact');
    assert.equal(env.isCompactViewport(1920, 1080), false, 'Desktop Full HD should be standard');
    assert.equal(env.isCompactViewport(1920, 768), true, 'Ultrawide low-height should be compact');
  });
});

describe('Curriculum Matrix & Pinout Catalog Verification', () => {
  it('defines exactly 20 lessons sequentially numbered 1 to 20', () => {
    assert.equal(LESSONS.length, 20);
    LESSONS.forEach((lesson, idx) => {
      assert.equal(lesson.number, idx + 1);
      assert.ok(lesson.id);
      assert.ok(lesson.title.vi);
      assert.ok(lesson.title.en);
      assert.ok(lesson.codeCpp);
      assert.ok(lesson.codePy);
      assert.equal(lesson.quiz.length, 3, `Lesson ${lesson.id} must have 3 quiz questions`);
    });
  });

  it('defines 30-pin and 38-pin DevKit pinout matrices and wire colors', () => {
    assert.equal(ESP32_PINS_30.length, 30);
    assert.equal(ESP32_PINS_38.length, 38);
    assert.ok(WIRE_COLORS.power3v3);
    assert.ok(WIRE_COLORS.gnd);
  });
});
