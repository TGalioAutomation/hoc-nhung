# Project: ESP32 & Embedded Systems Learning WebApp (Age 5–20)

## Architecture
Native Zero-Build ESM Web Application:
- **Core Engine (`src/engine.js`)**: Headless, deterministic computation engine. Implements electrical safety limits, Ohm's law current calculations, ADC1/ADC2 Wi-Fi locks, capacitive touch sensing, age-band capabilities, simulation state machines for Band A/B/C, and progress/gamification math. Runs in both Node.js (with `MemoryStorage` fallback) and Browser DOM.
- **Curriculum & Pinout Catalog (`src/lessons.js`)**: 20 progressive lessons across 3 age bands with dual Arduino C++ & MicroPython code, 60 interactive quiz questions with explanations, component specifications, ESP32 DevKit 30/38 pin mappings, and wire color standards.
- **UI & Presentation Controller (`src/app.js` & `index.html`, `src/styles.css`)**: 3-column responsive layout, Web Audio API synthesizer, Age-Band switcher (`band-a`, `band-b`, `band-c`), interactive lesson selector, code editor, resizable Serial Monitor (56px–360px), 4 modal dialogs (Pinout, Quiz, Schematic, Settings), line tracing, and responsive breakpoint (`compact` when W < 1090px or H < 800px).
- **Test Infrastructure (`tests/`)**: Node.js native test runner (`node:test`, `node:assert/strict`) with JSDOM headless DOM simulation.
- **Mutation Verification (`clean-room/verify-mutants.mjs`, `clean-room/mutants/`)**: 3-mutant verification harness testing Boundary, Invariant, and Gamification/Hysteresis corruption.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cognitive Age-Bands | Band A (5–8), Band B (9–13, default), Band C (14–20) capabilities and UI mode switching | M1, M3 | RULE-001 |
| 2 | Age-Band DOM Adaptivity | Synchronize `data-age-band` on `<html>`, toggle story cards, block workspace, code editor, pinout | M2, M3 | RULE-001 |
| 3 | Button Size Constraints | Minimum interactive target sizes: ≥64px (Band A), ≥44px (Band B), ≥36px (Band C) | M1, M3 | RULE-001 |
| 4 | GPIO Voltage Safety | Nominal 3.3V logic level; trigger `OVERVOLTAGE_WARNING` if V > 3.3V | M1 | RULE-002 |
| 5 | Input-Only GPIO Protection | GPIO 34, 35, 36, 39 reject `OUTPUT` configuration with `PIN_CANNOT_BE_OUTPUT` | M1 | RULE-002 |
| 6 | LED Current & Burnout Limits | Ohm's law: $I_{max} = 40\text{mA}$, $I_{safe} \le 20\text{mA}$; trigger `COMPONENT_BURNED_STATE` if $R=0$ or $I > 40\text{mA}$ | M1 | RULE-002 |
| 7 | ADC & Wi-Fi Conflict | 12-bit ADC (0–4095); ADC2 locked (`ADC2_LOCKED_BY_WIFI`) when Wi-Fi active; ADC1 independent | M1 | RULE-002 |
| 8 | Capacitive Touch Sensing | 10 touch channels (GPIO 0, 2, 4, 12, 13, 14, 15, 27, 32, 33); threshold detection | M1 | RULE-002 |
| 9 | Wiring Color Standards | Signal amber/blue, Power 3.3V/5V, Ground graphite | M1 | RULE-002 |
| 10 | Band A Flashing LED | Clamped cycle [100ms, 1500ms] step 50ms; Red, Amber, Green colors | M1 | RULE-003 |
| 11 | Band A Fridge Guard | Alarm 2400Hz when $\theta > 12^\circ$ and open duration > grace period (default 3000ms) | M1 | RULE-003 |
| 12 | Band A Siren Sound | Harmonically oscillating frequency [400Hz, 1200Hz] period 1600ms | M1 | RULE-003 |
| 13 | Band A Touch Piano | 8 touch keys C4 (261.63Hz) to C5 (523.25Hz); latency ≤ 20ms | M1 | RULE-003 |
| 14 | Band A Mood Lamp | 3-channel RGB mixer $R,G,B \in [0, 255]$ updating diffusion lamp | M1 | RULE-003 |
| 15 | Band A Night Light | Automatic LDR threshold switching (default 50%) | M1 | RULE-003 |
| 16 | Band B Neopixel 12-LED Ring | $N_{lit} = \lfloor (ADC / 4095) \times 12 \rfloor$; blue, rainbow, traffic palettes | M1 | RULE-004 |
| 17 | Band B Ultrasonic Rangefinder | Distance $2..400\text{cm}$; pulse duration $\Delta t = (2 \cdot d) / 0.0343\mu\text{s}$; OLED display string | M1 | RULE-004 |
| 18 | Band B Laser Barrier FSM | FSM: Closed ($0^\circ$) -> Opening ($180^\circ/\text{s}$) -> Hold ($3000\text{ms}$) -> Closing -> Closed | M1 | RULE-004 |
| 19 | Band B DC Motor PWM Speed | Linear PWM duty $0..100\%$ to angular velocity and RPM | M1 | RULE-004 |
| 20 | Learning Progress Percentage | $\lfloor (N_{completed} / 20) \times 100 \rfloor\%$; update `aria-valuenow` and text label `"{N}/20"` | M1, M3 | RULE-005 |
| 21 | XP Gamification & Badges | Band A (+50XP), Band B (+100XP), Band C (+150XP); first-try quiz bonus (+25XP); 4 badges | M1, M2, M3 | RULE-005 |
| 22 | Progress Reset Functionality | Reset all progress, clear badges, reset XP to 0 | M1, M3 | RULE-005 |
| 23 | Execution FSM Lifecycle | FSM: `idle` -> `uploading` (600ms + 600ms) -> `running` -> `idle` | M1, M2, M3 | RULE-006 |
| 24 | Code Parameter Interpolation | Interpolate `{{paramKey}}` sliders into C++/MicroPython source | M1 | RULE-006 |
| 25 | Real-time Code Line Tracing | Add `.code-line.is-running` to active executing line, clear on stop | M1, M2, M3 | RULE-006 |
| 26 | Serial Monitor Height Resizing | Height clamp [56px, 360px], default 92px; double-click restore | M1, M3 | RULE-006 |
| 27 | Wi-Fi Web Server Simulation | SoftAP IP 192.168.1.42, HTTP GET `/toggle` flips GPIO 2 LED | M1 | RULE-007 |
| 28 | Bluetooth BLE/SPP Simulation | Receive commands `"ON"`, `"OFF"`, `"DIM"`; error on invalid command | M1 | RULE-007 |
| 29 | ESP-NOW Mesh Protocol | Payload limit 250 bytes (`PAYLOAD_EXCEEDS_250_BYTES`); sigmoidal loss beyond 100m | M1 | RULE-007 |
| 30 | Smart Pump Hysteresis Control | Pump ON when water $\le 20\%$, OFF when $\ge 90\%$, latch state in $20\%..90\%$ | M1 | RULE-008 |
| 31 | 4x3 Keypad Lockout Protection | Clear key `*`, verify key `#`; 3 consecutive failures trigger 10s lockout | M1 | RULE-008 |
| 32 | Dual LDR Solar Tracker | Deadband $\delta = 15$; servo tracking in $[10^\circ, 170^\circ]$ | M1 | RULE-008 |
| 33 | Ultrasonic Polar Radar | Polar to Cartesian $(d, \theta) \to (x, y)$ coordinate transform sweep | M1 | RULE-008 |
| 34 | Stepper Pick & Place Arm | Lead screw pitch 8mm, 200 steps/rev ($0.04\text{mm/step}$); electromagnet toggle | M1 | RULE-008 |
| 35 | Viewport Controls & Shortcuts | Pan (W/A/S/D), Zoom [0.4, 3.0] (+/-), Rotate 90° (Q/E), Reset (R) | M1, M3 | RULE-009 |
| 36 | Floating Schematic Card | Draggable & resizable [200..600]x[140..500]px card; toggle aria-pressed | M2, M3 | RULE-009 |
| 37 | Environment Settings & a11y | 5 flags: labels, grid, autoRotate, sound, reducedMotion (0.05 speed factor) | M1, M3 | RULE-010 |
| 38 | Responsive Compact Layout | Add `.compact` class when W < 1090px or H < 800px; tabbed stack view | M1, M3 | RULE-010 |
| 39 | 20 Curriculum Lessons Catalog | Lesson titles, hardware parts, pins, defaultParams, simConfig | M1 | Curriculum |
| 40 | 60 Quiz Questions & Explanations | 3 questions per lesson, valid answer indices (0..2), detailed explanations | M1 | Curriculum |
| 41 | Pinout Modal 30/38-pin Support | Interactive Pinout dialog with 30-pin and 38-pin DevKit toggle | M2, M3 | UI |
| 42 | Tooltip Hover System | Interactive pin & component tooltips on hover | M2, M3 | UI |
| 43 | 3-Mutant Protocol Killing | Primary 100% pass, Mutant 1/2/3 killed by tests | M1, M4 | Clean-Room |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Specification & Boundary Test Suite Expansion | Expand `tests/spec.test.js` & create `tests/lessons.test.js` covering all 10 rules, exact boundary values, 20 lessons, 60 quizzes; ensure 3 mutants killed | none | COMPLETED |
| M2 | Application Defect Remediation & UI Enhancement | Fix 8 defects in `src/app.js`: FSM integration, schematic drag/resize handlers, tooltip hover, import cleanups, 38-pin modal support, Quiz repeat XP exploit prevention | M1 | COMPLETED |
| M3 | End-to-End DOM & Interactive Simulation Test Suite | Create self-contained zero-dependency DOM harness in `tests/e2e-dom.test.js` covering 3 age bands, 20 lessons, 4 modals, breakpoints, serial resize, execution lifecycle | M1, M2 | COMPLETED |
| M4 | Mutation Testing Audit & Final Verification Gate | Run full test suite (`npm test`), verify 3-mutant harness (`node clean-room/verify-mutants.mjs`), update report | M1, M2, M3 | COMPLETED |
| M5 | Visual & 3D WebGL Workbench (`clean-room/VISUAL_3D_SPEC.md`) | Three.js Orthographic camera, cel-shading outlines, 12 dynamic procedural 3D models, 3D-to-2D projection for SVG leader lines (`#insp-lines`), warm tactile palette, 100vh lock, and `tests/stage3d.test.js` | M1, M2, M3, M4 | COMPLETED |

## Interface Contracts
### `src/engine.js` ↔ `tests/spec.test.js`
- `AgeBandController`: `getBand()`, `setBand(name)`, `getCapabilities()`, `on('ageBandChanged', fn)`
- `Esp32SafetyEngine`: `checkVoltage(voltage, pin)`, `validatePinMode(pin, mode)`, `calculateLedCurrent(vGpio, vFwd, rSeries)`, `readAdc(pin, voltage, wifiActive)`, `readTouch(pin, isTouched, idleThreshold)`
- `BandASimulator`: `clampFlashRate(rate)`, `simulateFridge(angle, duration, grace)`, `getSirenFrequency(elapsed, period)`, `getPianoNoteFrequency(keyIndex)`, `mixRgb(r, g, b)`, `checkNightLight(ldr, threshold)`
- `BandBSimulator`: `calculateNeopixels(adc, mode)`, `calculateEchoTime(distanceCm)`, `stepLaserBarrier(dt, blocked)`, `calculateMotorRpm(duty)`
- `ProgressEngine`: `recordLessonCompletion(lessonId, band, quizScore, isFirstTry)`, `getProgress()`, `resetProgress()`
- `CodeExecutionEngine`: `startUpload(lang, onLog, onStateChange)`, `stop()`, `interpolate(code, params)`, `trace(step)`
- `WirelessIoTSimulator`: `sendEspNow(distMeters, payloadBytes)`, `httpGetToggle(path)`, `bleCommand(cmd)`
- `MechatronicsSimulator`: `updatePumpHysteresis(level)`, `keypadInput(key)`, `updateSolarTracker(ldrL, ldrR, angle)`, `polarToCartesian(dist, angle)`, `stepperMove(steps)`
- `ViewportController`: `pan(dx, dy)`, `zoom(factor)`, `rotate(deg)`, `reset()`
- `EnvironmentController`: `setSetting(key, val)`, `getSettings()`, `checkBreakpoint(w, h)`

### `src/lessons.js` ↔ `tests/lessons.test.js`
- `LESSONS`: Array of 20 lesson objects, each having `id`, `number`, `title`, `band`, `components`, `codeCpp`, `codePy`, `quiz` (array of 3 items with `q`, `options`, `answer`, `explain`), `defaultParams`, `simConfig`.
- `ESP32_PINS_30`, `ESP32_PINS_38`, `WIRE_COLORS`, `BADGES`

### `src/app.js` ↔ `tests/e2e-dom.test.js` (DOM interactions)
- Age-band tabs: `.band-tab[data-band="band-a|band-b|band-c"]`
- Lesson items: `.lesson-item[data-id="..."]`
- Run/Stop button: `#btn-run`, `#btn-stop`
- Modals: `#modal-pinout`, `#modal-quiz`, `#modal-settings`, `#floating-schematic`
- Serial monitor: `#console-grip`, `#console-output`, `#console-drawer`
- Progress & Badges: `#progress-fill`, `#progress-count`, `#xp-counter`, `#badge-shelf`

## Code Layout
- `src/engine.js`: Pure mathematical & simulation core
- `src/lessons.js`: Curriculum and pinout data
- `src/stage3d.js`: Three.js 3D WebGL Workbench engine (Orthographic camera, procedural ESP32/Breadboard, wires, 12 lesson models, 3D-to-2D projection)
- `src/app.js`: Browser DOM UI controller & audio synthesizer
- `src/styles.css`: CSS styling and responsive layout rules (100vh lock, warm tactile palette)
- `index.html`: Web application markup with Three.js import map and artboard layout
- `tests/spec.test.js`: Core specification and boundary tests (runs under Node test runner and verify-mutants)
- `tests/lessons.test.js`: Comprehensive 20-lesson & 60-quiz verification
- `tests/stage3d.test.js`: 3D WebGL Workbench unit tests (camera, viewports, projection, procedural actors)
- `tests/e2e-dom.test.js`: E2E DOM & user journey tests
- `clean-room/verify-mutants.mjs`: Clean-room 3-mutant verification harness
- `clean-room/TEST_AND_MUTATION_REPORT.md`: Authoritative verification and audit report
