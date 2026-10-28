/**
 * Scratch test runner validation for explorer_m1_1
 * Verifies that all designed Milestone 1 tests pass on primary
 * and successfully kill mutant-1, mutant-2, and mutant-3.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

async function runTestSuite(enginePath) {
  const fullPath = path.resolve(rootDir, enginePath);
  const engine = await import(pathToFileURL(fullPath).href);
  const {
    AgeBandController,
    AGE_BANDS,
    Esp32SafetyEngine,
    ESP32_CONSTANTS,
    BandASimulator,
    BandBSimulator,
    ProgressAndGamificationEngine,
    BADGES
  } = engine;

  const { WIRE_COLORS } = await import(pathToFileURL(path.resolve(rootDir, 'src/lessons.js')).href);

  const testResults = [];

  function test(name, fn) {
    try {
      fn();
      testResults.push({ name, passed: true });
    } catch (err) {
      testResults.push({ name, passed: false, error: err.message });
    }
  }

  // --- RULE-001 ---
  test('RULE-001: defaults to band-b when storage is empty or invalid', () => {
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

  test('RULE-001: rejects invalid age bands in setBand with descriptive Error', () => {
    const c = new AgeBandController(createMockStorage());
    assert.throws(() => c.setBand('unknown'), /Invalid age band: unknown/);
    assert.throws(() => c.setBand(''), /Invalid age band:/);
    assert.throws(() => c.setBand(null), /Invalid age band:/);
  });

  test('RULE-001: persists and restores valid bands A, B, C', () => {
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

  test('RULE-001: enforces capabilities contract for all 3 age bands', () => {
    const c = new AgeBandController(createMockStorage());

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

  test('RULE-001: listener registration, error tolerance, and unsubscribe', () => {
    const c = new AgeBandController(createMockStorage());
    let notified = null;
    const unsub = c.addListener((evt) => {
      notified = evt;
    });

    // Error-throwing listener should not disrupt others
    c.addListener(() => {
      throw new Error('Boom');
    });

    c.setBand(AGE_BANDS.BAND_C);
    assert.ok(notified);
    assert.equal(notified.band, AGE_BANDS.BAND_C);

    // Unsubscribe
    notified = null;
    unsub();
    c.setBand(AGE_BANDS.BAND_B);
    assert.equal(notified, null);
  });

  // --- RULE-002 ---
  test('RULE-002: exact 3.3V voltage threshold (3.300V safe vs 3.301V overvoltage)', () => {
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

  test('RULE-002: all input-only pins (34, 35, 36, 39) reject OUTPUT mode', () => {
    const inputPins = [34, 35, 36, 39];
    inputPins.forEach((pin) => {
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

    // Regular GPIO pins allow OUTPUT
    [2, 4, 18, 19, 21, 22, 23].forEach((pin) => {
      assert.equal(Esp32SafetyEngine.validatePinMode(pin, 'OUTPUT').valid, true);
    });
  });

  test('RULE-002: Ohm law calculations, R=0 burnout, stressed 20-40mA, and >40mA burnout', () => {
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

  test('RULE-002: ADC1 pins readable with WiFi, ADC2 pins locked with WiFi', () => {
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

  test('RULE-002: all 10 capacitive touch channels and rejection of non-touch pins', () => {
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

    // Non-touch pins
    [16, 17, 21, 22, 23, 34, 35, 36, 39].forEach((pin) => {
      const bad = Esp32SafetyEngine.readTouch(pin, false);
      assert.equal(bad.success, false);
      assert.equal(bad.code, 'NOT_A_TOUCH_PIN');
    });
  });

  test('RULE-002: standard wire color constants', () => {
    assert.equal(WIRE_COLORS.signalAmber, '#f0a53a');
    assert.equal(WIRE_COLORS.signalBlue, '#3d6fc4');
    assert.equal(WIRE_COLORS.power3v3, '#e04a3f');
    assert.equal(WIRE_COLORS.power5v, '#b82e24');
    assert.equal(WIRE_COLORS.gnd, '#2f3547');
  });

  // --- RULE-003 ---
  test('RULE-003: Band A Level Crossing clamp rate and color palette', () => {
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

  test('RULE-003: Fridge Guard boundary <=12° (safe) vs >12° (violating), grace period', () => {
    // Angle boundary at exactly 12 degrees
    const b12 = BandASimulator.checkFridgeAlarm(12, 10000, 3000);
    assert.equal(b12.isViolating, false);
    assert.equal(b12.isAlarming, false);

    const b10 = BandASimulator.checkFridgeAlarm(10, 5000, 3000);
    assert.equal(b10.isViolating, false);
    assert.equal(b10.isAlarming, false);

    // Angle > 12 degrees
    const b12_1 = BandASimulator.checkFridgeAlarm(12.1, 1000, 3000);
    assert.equal(b12_1.isViolating, true);
    assert.equal(b12_1.isAlarming, false); // Within grace

    const b45_grace = BandASimulator.checkFridgeAlarm(45, 3000, 3000);
    assert.equal(b45_grace.isViolating, true);
    assert.equal(b45_grace.isAlarming, false);

    const b45_alarm = BandASimulator.checkFridgeAlarm(45, 3001, 3000);
    assert.equal(b45_alarm.isViolating, true);
    assert.equal(b45_alarm.isAlarming, true);
    assert.equal(b45_alarm.alarmFreq, 2400);
    assert.equal(b45_alarm.redBlink, true);
  });

  test('RULE-003: Siren frequency harmonic oscillation [400Hz, 1200Hz]', () => {
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

  test('RULE-003: Mini Touch Piano 8 notes C4..C5', () => {
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

  test('RULE-003: Mood Lamp RGB mixing and clamping [0, 255]', () => {
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

  test('RULE-003: Night Light threshold logic (default 50%)', () => {
    assert.equal(BandASimulator.evaluateNightLight(30, 50).ledOn, true);
    assert.equal(BandASimulator.evaluateNightLight(50, 50).ledOn, false);
    assert.equal(BandASimulator.evaluateNightLight(75, 50).ledOn, false);
  });

  // --- RULE-004 ---
  test('RULE-004: Neopixel integer division N_lit = floor((ADC/4095) * 12)', () => {
    assert.equal(BandBSimulator.calculateNeopixelRing(0).numLit, 0);
    assert.equal(BandBSimulator.calculateNeopixelRing(341).numLit, 0);
    assert.equal(BandBSimulator.calculateNeopixelRing(342).numLit, 1);
    assert.equal(BandBSimulator.calculateNeopixelRing(2047).numLit, 5);
    assert.equal(BandBSimulator.calculateNeopixelRing(2048).numLit, 6);
    assert.equal(BandBSimulator.calculateNeopixelRing(4095).numLit, 12);
  });

  test('RULE-004: Neopixel color modes (blue, traffic, rainbow)', () => {
    const blueMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'blue');
    blueMode.leds.forEach((l) => assert.equal(l.color, '#0088ff'));

    const trafficMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'traffic');
    assert.equal(trafficMode.leds[0].color, '#34c759');
    assert.equal(trafficMode.leds[4].color, '#ffcc00');
    assert.equal(trafficMode.leds[8].color, '#ff3b30');

    const rainbowMode = BandBSimulator.calculateNeopixelRing(4095, 12, 'rainbow');
    assert.equal(rainbowMode.leds[0].color, 'hsl(0, 100%, 55%)');
  });

  test('RULE-004: HC-SR04 ultrasonic echo timing and clamping [2, 400]cm', () => {
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

  test('RULE-004: Laser barrier servo FSM angles and hold time', () => {
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

  test('RULE-004: DC motor PWM linear velocity and duty clamping', () => {
    const zero = BandBSimulator.calculateMotorRpm(0, 1000);
    assert.equal(zero.rpm, 0);

    const half = BandBSimulator.calculateMotorRpm(50, 1000);
    assert.equal(half.rpm, 500);

    const full = BandBSimulator.calculateMotorRpm(100, 1000);
    assert.equal(full.rpm, 1000);

    const clamped = BandBSimulator.calculateMotorRpm(150, 1000);
    assert.equal(clamped.rpm, 1000);
  });

  // --- RULE-005 ---
  test('RULE-005: progress percentage floor((N/20)*100) and aria attributes', () => {
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

  test('RULE-005: XP awards by band (+50 A, +100 B, +150 C)', () => {
    const g = new ProgressAndGamificationEngine(createMockStorage());
    g.markLessonComplete('l1', 1, AGE_BANDS.BAND_A);
    assert.equal(g.xp, 50);

    g.markLessonComplete('l2', 2, AGE_BANDS.BAND_B);
    assert.equal(g.xp, 150);

    g.markLessonComplete('l3', 3, AGE_BANDS.BAND_C);
    assert.equal(g.xp, 300);
  });

  test('RULE-005: first-try quiz bonus (+25XP) only when 3/3 on first try', () => {
    const g1 = new ProgressAndGamificationEngine(createMockStorage());
    g1.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 3, true);
    assert.equal(g1.xp, 125); // 100 + 25

    const g2 = new ProgressAndGamificationEngine(createMockStorage());
    g2.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 2, true);
    assert.equal(g2.xp, 100); // no bonus for 2/3

    const g3 = new ProgressAndGamificationEngine(createMockStorage());
    g3.markLessonComplete('l1', 1, AGE_BANDS.BAND_B, 3, false);
    assert.equal(g3.xp, 100); // no bonus for repeat attempt
  });

  test('RULE-005: anti-repeat XP logic', () => {
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

  test('RULE-005: badge unlocks at milestones and resetProgress()', () => {
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

  return testResults;
}

// Run against primary and mutants
const targets = [
  { id: 'primary', path: 'src/engine.js', expectPass: true },
  { id: 'mutant-1', path: 'clean-room/mutants/mutant-1/engine.js', expectPass: false },
  { id: 'mutant-2', path: 'clean-room/mutants/mutant-2/engine.js', expectPass: false },
  { id: 'mutant-3', path: 'clean-room/mutants/mutant-3/engine.js', expectPass: false }
];

console.log('='.repeat(80));
console.log('  MILESTONE 1 VALIDATION TEST SUITE RUNNER');
console.log('='.repeat(80));

for (const t of targets) {
  const results = await runTestSuite(t.path);
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Target: [${t.id}] (${t.path})`);
  console.log(`  Total Tests : ${total}`);
  console.log(`  Passed      : ${passed}`);
  console.log(`  Failed      : ${failed}`);

  if (failed > 0) {
    console.log('  Failures:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`    - ${r.name}: ${r.error}`);
    });
  }

  const isKilled = failed > 0;
  if (t.expectPass) {
    if (passed === total) {
      console.log('  Verdict: PASS 100% (CLEAN)\n');
    } else {
      console.error('  Verdict: UNEXPECTED FAILURE ON PRIMARY!\n');
      process.exit(1);
    }
  } else {
    if (isKilled) {
      console.log(`  Verdict: KILLED (${failed} assertion failures)\n`);
    } else {
      console.error(`  Verdict: SURVIVED MUTANT [${t.id}]!\n`);
      process.exit(1);
    }
  }
}

console.log('All targets validated successfully! Proposed tests pass on primary and kill all 3 mutants.');
