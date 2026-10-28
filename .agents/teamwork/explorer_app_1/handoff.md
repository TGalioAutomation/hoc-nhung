# Báo Cáo Khảo Sát Kiến Trúc Ứng Dụng & Bộ Kiểm Thử Đột Biến (App Architecture & Mutation Harness Report)

- **Người thực hiện**: `explorer_app_1` (App Architecture Explorer)
- **Thư mục làm việc**: `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_app_1`
- **Mã đàm thoại phụ huynh**: `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Tuân thủ Clean-Room**: Tuyệt đối không truy cập `clean-room/SPEC.md` hoặc các đường dẫn trong `clean-room/.forbidden-paths`. Chỉ sử dụng `clean-room/SPEC.approved.md` và mã nguồn triển khai thực tế.
- **Thời gian hoàn tất**: 2026-10-28T04:27:00Z

---

## 1. Observation (Dữ Liệu Quan Sát Thực Tế)

### 1.1. Cấu Trúc Mã Nguồn Gốc & Phân Bố Dung Lượng
Hệ thống là ứng dụng web native zero-build thuần chuẩn ES Modules (ESM) chạy trên Node.js $\ge 18$ và trình duyệt hiện đại:
- `package.json` (456 bytes): `"type": "module"`, `"main": "src/engine.js"`, `"scripts": { "test": "node --test tests/spec.test.js", "start": "npx serve ." }`. Không có bất kỳ external runtime/production dependency nào (`dependencies: {}`).
- `index.html` (15,197 bytes, 293 dòng): Tài liệu ngữ nghĩa HTML5 với cấu trúc 3 cột (`.lessons-sidebar`, `.viewport-area`, `.right-panel`), hệ thống 4 modal dialogs (`#modal-pinout`, `#modal-quiz`, `#modal-settings`, `#floating-schematic`), thanh công cụ điều khiển khung nhìn 3D/2D (`.viewport-toolbar`), sân khấu phần cứng SVG ESP32 DevKit V1 (`.esp32-board-svg`), màn hình nạp lệnh UART/Serial Monitor và thanh trượt co giãn chiều cao console (`#serial-grip`).
- `src/styles.css` (23,089 bytes, 1,115 dòng): Hệ thống giao diện thích ứng đa phân tầng tuổi:
  - Band A: `html[data-age-band='band-a']` (dòng 50–74, min button size 64px, ẩn code editor & pinout).
  - Band B: `html[data-age-band='band-b']` (dòng 76–90, min button size 44px, hiển thị Blockly & Breadboard).
  - Band C: `html[data-age-band='band-c']` (dòng 92–106, min button size 36px, hiển thị Pro IDE & Serial).
  - Responsive compact layout: dòng 301–308 kích hoạt khi `body.compact` (`W < 1090px` hoặc `H < 800px`), chuyển layout 3 cột sang 1 cột xếp chồng.
- `src/engine.js` (30,074 bytes, 989 dòng): Lõi tính toán không phụ thuộc DOM (headless deterministic engine), chứa lớp đệm `MemoryStorage` (dòng 8–24) thay thế `localStorage` trong môi trường kiểm thử CLI, hiện thực hóa toàn bộ 10 quy tắc `RULE-001` đến `RULE-010`.
- `src/lessons.js` (86,849 bytes, 2,043 dòng): Cơ sở dữ liệu tĩnh gồm danh mục 20 bài học tuần tự từ 1 đến 20, bảng sơ đồ 30 chân (`ESP32_PINS_30`) và 38 chân (`ESP32_PINS_38`), bảng mã màu dây nối chuẩn (`WIRE_COLORS`).
- `src/app.js` (49,036 bytes, 1,230 dòng): Bộ điều phối giao diện DOM, tích hợp Web Audio API Synthesizer (dòng 75–128), ánh xạ tương tác người dùng, máy trạng thái nạp code và hiển thị mô phỏng phần cứng.
- `tests/spec.test.js` (21,618 bytes, 584 dòng): Bộ kiểm thử đơn vị tự động gồm 37 bài kiểm tra phân bổ trên 10 nhóm `describe()`, sử dụng `node:test` và `node:assert/strict`. Hỗ trợ nạp động đường dẫn engine qua biến môi trường `ENGINE_PATH` (dòng 13–17).
- `clean-room/verify-mutants.mjs` (4,728 bytes, 159 dòng): Bộ kiểm tra đột biến tự động 3-Mutant Protocol, thực thi `node --test tests/spec.test.js` trên 4 mục tiêu (`primary`, `mutant-1`, `mutant-2`, `mutant-3`).
- `clean-room/mutants/`: Chứa 3 bản sao đột biến lỗi có chủ đích của `src/engine.js`:
  - `clean-room/mutants/mutant-1/engine.js` (30,231 bytes)
  - `clean-room/mutants/mutant-2/engine.js` (29,849 bytes)
  - `clean-room/mutants/mutant-3/engine.js` (30,340 bytes)

---

### 1.2. Kết Quả Thực Thi Bộ Kiểm Thử & Kiểm Định Đột Biến

Lệnh thực thi 1: `npm test`
```
> esp32-kids-to-pro@1.0.0 test
> node --test tests/spec.test.js

ℹ tests 37
ℹ suites 10
ℹ pass 37
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1258.115375
```
Kết quả: 37/37 tests đạt 100% PASS trên bản chính `src/engine.js`.

Lệnh thực thi 2: `node clean-room/verify-mutants.mjs`
```
================================================================================
  CLEAN-ROOM 3-MUTANT VERIFICATION HARNESS (Flash Tier QA Protocol)
================================================================================
Target       | Status     |  Pass |  Fail |  Exit | Verdict
--------------------------------------------------------------------------------
primary      | PASS       |    37 |     0 |     0 | VERIFIED PASS (100%)
mutant-1     | FAIL       |    35 |     2 |     1 | KILLED (2 assertion failures)
mutant-2     | FAIL       |    34 |     3 |     1 | KILLED (3 assertion failures)
mutant-3     | FAIL       |    34 |     3 |     1 | KILLED (3 assertion failures)
================================================================================
✔ PROTOCOL VERIFIED: Primary build passed 100% and ALL 3 mutants were KILLED.
  Clean-Room Mutation Score: 100% (3/3 mutants killed, 0 survivors).
```
Kết quả: Tỉ lệ tiêu diệt đột biến đạt 100% (3/3 mutants killed, 0 survivors).

---

### 1.3. Chi Tiết So Sánh (Diff) Của 3 Đột Biến (Mutants)

#### A. Mutant 1: Phá hoại giới hạn biên & lỗi lệch 1 đơn vị (Boundary / Off-by-One)
`diff -u src/engine.js clean-room/mutants/mutant-1/engine.js`:
1. Dòng 145: Đổi `I_MAX_MA: 40.0` thành `I_MAX_MA: 50.0` (phá hoại định luật Ohm giới hạn dòng điện tối đa 40mA lên 50mA).
2. Dòng 148: Đổi `INPUT_ONLY_PINS: [34, 35, 36, 39]` thành `INPUT_ONLY_PINS: [34, 35, 36]` (bỏ sót chân 39 khỏi danh sách chân chỉ đọc).
3. Dòng 275: Đổi `clampedAngle > 12` thành `clampedAngle >= 12` (lỗi lệch 1 đơn vị tại góc mở ngưỡng cửa tủ lạnh).

Cơ chế tiêu diệt (Killed by):
- Test `forbids OUTPUT mode on input-only pins 34, 35, 36, 39`: Chân 39 bị cho phép cấu hình `OUTPUT` -> FAIL (`AssertionError: true !== false`).
- Test `triggers 2400Hz Fridge Guard alarm only when angle > 12° and duration > grace`: Góc $12^\circ$ bị coi là vi phạm và kích hoạt chuông -> FAIL (`AssertionError: true !== false`).

#### B. Mutant 2: Phá hoại bất biến kiến trúc & Bỏ qua máy trạng thái (Invariant / FSM Bypass)
`diff -u src/engine.js clean-room/mutants/mutant-2/engine.js`:
1. Dòng 46–49: Thay đổi giá trị mặc định khi chưa có cấu hình trong `localStorage` từ `BAND_B` sang `BAND_A`.
2. Dòng 82: Trong `getCapabilities(BAND_A)`, đổi `showCodeEditor: false` thành `showCodeEditor: true` (làm rò rỉ trình soạn thảo code C++ sang dải tuổi 5–8).
3. Dòng 620–639: Trong `startUpload()`, xóa bỏ trạng thái trung gian `'uploading'` (cùng độ trễ 600ms + 600ms giả lập UART) và gán thẳng `this.state = 'running'`.

Cơ chế tiêu diệt (Killed by):
- Test `defaults to band-b when storage is empty`: Nhận được `'band-a'` thay vì `'band-b'` -> FAIL.
- Test `updates capabilities correctly across Band A, B, and C`: `showCodeEditor` trả về `true` cho Band A -> FAIL.
- Test `manages execution finite state machine: idle -> uploading -> running -> idle`: Trạng thái ban đầu sau khi gọi `startUpload()` là `'running'` thay vì `'uploading'` -> FAIL.

#### C. Mutant 3: Phá hoại nhớ trạng thái trễ & Thuật toán Gamification (Hysteresis & XP Corrupted)
`diff -u src/engine.js clean-room/mutants/mutant-3/engine.js`:
1. Dòng 524–527: Phá hoại điểm XP thưởng hoàn thành bài học: Band A chỉ cộng 10 (thay vì 50), Band B cộng 15 (thay vì 100), Band C cộng 20 (thay vì 150).
2. Dòng 565: Phá hoại công thức phần trăm tiến trình: Đổi `Math.floor((completed/total) * 100)` thành `Math.ceil((completed/total) * 100) + 5`.
3. Dòng 745: Phá hoại bộ nhớ điều khiển trễ của máy bơm nước (Hysteresis): Đổi `let pumpState = previousPumpState;` thành `let pumpState = false;` (quên trạng thái rơ-le khi mực nước nằm trong vùng chết $20\% < H < 90\%$).

Cơ chế tiêu diệt (Killed by):
- Test `calculates overall progress percentage floor((N_completed/20) * 100)`: Bài học rỗng trả về $5\%$ thay vì $0\%$ -> FAIL.
- Test `awards XP according to band and quiz performance`: Band A chỉ nhận 10 XP thay vì 50 XP -> FAIL.
- Test `controls smart pump with hysteresis: <=20% ON, >=90% OFF`: Tại mực nước $50\%$, máy bơm bị tắt ngắt quãng thay vì duy trì đóng -> FAIL.

---

### 1.4. Bảng Ánh Xạ Mô-đun Export & Các Lớp Core Engine

| Lớp / Đối Tượng (`src/engine.js`) | Thuộc Quy Tắc | Phương thức chính / Trách nhiệm kỹ thuật |
| :--- | :---: | :--- |
| `MemoryStorage` | Hạ tầng | Fallback thay thế `localStorage` không làm crash môi trường Node.js. |
| `AgeBandController` | `RULE-001` | Quản lý phân tầng `band-a`, `band-b`, `band-c`; phát sự kiện `ageBandChanged`; cấp phát `getCapabilities()`. |
| `Esp32SafetyEngine` | `RULE-002` | `validateVoltage(V, pin)` kiểm tra quá áp 3.3V; `validatePinMode(pin, mode)` chặn `OUTPUT` trên chân 34, 35, 36, 39; `calculateLedCurrent(...)` tính định luật Ohm và kích hoạt `COMPONENT_BURNED_STATE`; `readAdc(...)` khóa ADC2 khi có Wi-Fi; `readTouch(...)` phát hiện tụt ngưỡng chạm. |
| `BandASimulator` | `RULE-003` | `clampRate(rate)` kẹp $100\text{ms} \le t \le 1500\text{ms}$ bước $50\text{ms}$; `checkFridgeAlarm(angle, duration)` chuông $2400\text{Hz}$ khi $\theta > 12^\circ$; `getSirenFrequency(...)` quét $400\text{Hz} - 1200\text{Hz}$; `getPianoNotes()` 8 nốt C4–C5; `evaluateNightLight(...)` so sánh ngưỡng sáng $50\%$. |
| `BandBSimulator` | `RULE-004` | `calculateNeopixelRing(ADC, 12, mode)` tính $N_{lit} = \lfloor (ADC/4095) \times 12 \rfloor$; `calculateUltrasonic(d)` tính $\Delta t = (2d)/0.0343$; `createLaserGateFsm()` máy trạng thái rào chắn laser Servo $0^\circ \leftrightarrow 90^\circ$ giữ 3000ms; `calculateMotorRpm(...)` PWM tuyến tính. |
| `ProgressAndGamificationEngine` | `RULE-005` | Quản lý tiến trình 20 bài học; tính $\lfloor (N/20) \times 100 \rfloor$; cộng 50/100/150 XP; mở khóa 4 huy hiệu (`Blink Master`, `Acoustic Wizard`, `IoT Explorer`, `Mechatronics Pro`); `resetProgress()`. |
| `CodeExecutionEngine` | `RULE-006` | Máy trạng thái `idle -> uploading -> running -> idle`; thay thế biến khuôn mẫu `{{paramKey}}`; kẹp chiều cao Serial Monitor $[56\text{px}, 360\text{px}]$, mặc định $92\text{px}$. |
| `WirelessIoTSimulator` | `RULE-007` | Giả lập Web Server IP `192.168.1.42` nhận `GET /toggle`; phân tích lệnh Bluetooth `ON/OFF/DIM`; mô hình mất gói tin ESP-NOW theo hàm sigmoid khi $d > 100\text{m}$. |
| `MechatronicsSimulator` | `RULE-008` | `updatePumpHysteresis(...)` bơm bật $\le 20\%$, tắt $\ge 90\%$, giữ nguyên giữa chừng; `createKeypadLock(...)` mã 4 số, xóa bằng `*`, khóa 10s sau 3 lần sai; `calculateSolarStep(...)` bám nắng góc $[10^\circ, 170^\circ]$ deadband 15; `polarToCartesian(...)` radar $180^\circ$; `calculateStepperPosition(...)` vít me $200\text{ bước}/8\text{mm}$. |
| `ViewportAndSchematicController`| `RULE-009` | Điều khiển Pan $(x, y)$, Zoom $[0.4, 3.0]$, Xoay $90^\circ$, Reset; quản lý kích thước sơ đồ nguyên lý nổi $[200\times 140, 600\times 500]$. |
| `EnvironmentAndA11yController` | `RULE-010` | Quản lý 5 thiết lập (`labels`, `grid`, `autoRotate`, `sound`, `reducedMotion`); tính hệ số chuyển động $\text{speed} = 0.05$; phát hiện breakpoint `compact` ($W < 1090\text{px}$ hoặc $H < 800\text{px}$). |

---

### 1.5. Bộ Chọn DOM (DOM Selectors) & Thành Phần Giao Diện Trọng Yếu

Trong `src/app.js` (dòng 133–210) và `index.html`:
- **Chuyển dải tuổi (RULE-001)**: `.band-tab[data-band="band-a|band-b|band-c"]`, nhãn `#band-badge`, thuộc tính gốc `html[data-age-band]`.
- **Thanh đo Gamification (RULE-005)**: `#xp-val`, `#progress-bar-track`, `#progress-bar-fill`, `#progress-label`.
- **Danh mục 20 bài học (RULE-005)**: `#lessons-list`, `.lesson-item[data-lesson-id]`, `#active-lesson-counter`.
- **Khung nhìn phần cứng & Sân khấu SVG (RULE-002, 009)**: `#hardware-stage`, `.esp32-board-svg`, `#grid-overlay`, `#sim-dynamic-actors`, `#led-pwr-indicator`, `#led-gpio2-indicator`, `#led-tx`, `#led-rx`.
- **Thanh công cụ Viewport (RULE-009)**: `#btn-zoom-in`, `#btn-zoom-out`, `#btn-rot-left`, `#btn-rot-right`, `#btn-reset-view`, `#btn-toggle-grid`, `#btn-toggle-sound`.
- **Bảng điều khiển nhận thức (RULE-001, 004, 006)**:
  - Band A: `#story-cards-container` (thẻ truyện tranh, nút bấm `.btn-story-action` $\ge 64\text{px}$).
  - Band B: `#blocks-workspace-container`, `#blocks-list`, `#btn-run-blocks`.
  - Band C: `#code-editor-container`, `#btn-lang-cpp`, `#btn-lang-py`, `#code-display` (`.code-line`), `#btn-code-run`, `#btn-code-stop`, `#execution-state-label`.
- **Serial Monitor (RULE-006)**: `#serial-panel`, `#serial-grip`, `#serial-logs`, `#btn-clear-serial`.
- **Hệ thống 4 Modal Dialogs**:
  1. Pinout: `#modal-pinout`, `#btn-pinout`, `#btn-close-pinout`, `#pinout-grid-content`.
  2. Quiz: `#modal-quiz`, `#btn-quiz`, `#btn-close-quiz`, `#quiz-modal-content`.
  3. Schematic: `#floating-schematic`, `#btn-schematic`, `#schematic-drag-handle`, `#sch-grip`, `#schematic-content`, `#btn-close-schematic`.
  4. Settings: `#modal-settings`, `#btn-settings`, `#btn-close-settings`, `#setting-labels`, `#setting-grid`, `#setting-sound`, `#setting-reduced-motion`, `#btn-reset-progress`.
- **Thẻ chú giải linh kiện (RULE-009)**: `#tip`.

---

## 2. Logic Chain (Chuỗi Lập Luận Từ Quan Sát Đến Đánh Giá)

1. **Từ cấu trúc dự án (Mục 1.1) và ADR-001**: Hệ thống chọn mô hình phân tách triệt để giữa lõi tính toán không DOM (`engine.js`) và tầng giao diện (`app.js`). Lựa chọn này cho phép chạy kiểm thử đơn vị và kiểm thử đột biến cực nhanh trên Node.js mà không phụ thuộc vào JSDOM hay Puppeteer.
2. **Từ kết quả thực thi kiểm thử và đột biến (Mục 1.2)**: Toàn bộ 37 ca kiểm thử hiện tại đã đạt 100% PASS trên bản chính, và bộ kiểm thử đã thành công trong việc tiêu diệt cả 3 mutants nhờ các khẳng định cứng về:
   - Chân chỉ đọc (pin 39) và góc mở cửa tủ lạnh $12^\circ$ (giết Mutant 1).
   - Dải tuổi mặc định `band-b`, cô lập editor ở Band A, và máy trạng thái `'uploading'` (giết Mutant 2).
   - Phần trăm tiến trình không cộng sai số, điểm thưởng XP Band A, và tính duy trì trạng thái của rơ-le máy bơm (giết Mutant 3).
3. **Từ việc phân tích chi tiết mã nguồn `src/app.js` đối chiếu với `src/engine.js`**:
   - Mặc dù `engine.js` rất hoàn thiện, việc kết nối thực tế giữa `app.js` và `engine.js` xuất hiện một số điểm bị ngắt quãng hoặc tái lập cục bộ (xem chi tiết tại Mục 4).
   - Đặc biệt, `CodeExecutionEngine` được khởi tạo trong `app.js` nhưng phương thức chuyển trạng thái `codeEngine.startUpload()` không được gọi khi người dùng nhấn nút `#btn-code-run`; thay vào đó, `app.js` tự chạy các biến hẹn giờ riêng (`uploadTimer1`, `uploadTimer2`), khiến trạng thái của đối tượng `codeEngine` luôn dừng ở `'idle'`.
4. **Từ yêu cầu kiểm thử E2E & DOM (R2 trong ORIGINAL_REQUEST.md)**: Hiện tại, thư mục `tests/` chỉ có duy nhất `tests/spec.test.js` kiểm tra trực tiếp các class trong `engine.js` và mảng dữ liệu trong `lessons.js`. Hoàn toàn chưa có bộ kiểm tra tích hợp DOM mô phỏng hành vi click chuột chuyển dải tuổi, chọn 20 bài học, mở/đóng 4 modal dialogs, thay đổi kích thước Serial Monitor, hoặc kiểm tra class `.compact` khi kích thước cửa sổ thu nhỏ.

---

## 3. Caveats (Các Vấn Đề Chưa Khảo Sát & Giả Định)

1. **Môi trường Web Audio thực tế trên trình duyệt**: Web Audio API yêu cầu tương tác người dùng (User Gesture) trước khi phát âm thanh do chính sách Autoplay của các trình duyệt như Chrome/Safari. Mặc dù `getAudioContext()` đã có logic resume, trong môi trường kiểm thử CLI không có Web Audio context native.
2. **WebGL / Canvas 3D nâng cao**: Hiện tại bo mạch ESP32 và các linh kiện đang được dựng bằng SVG 2D tương tác (`.esp32-board-svg`), chưa có thư viện Three.js/WebGL 3D phức hợp. Mọi logic pan/zoom/rotate đang tác động thông qua CSS Transform trên container `#hardware-stage`.
3. **Giới hạn phạm vi**: Bản thân agent `explorer_app_1` hoạt động ở chế độ Read-Only, không thực hiện chỉnh sửa trực tiếp vào mã nguồn sản phẩm.

---

## 4. Potential Defect Points & Architectural Gaps (8 Điểm Khiếm Khuyết Tiềm Ẩn)

Dưới đây là 8 điểm phát hiện kỹ thuật quan trọng cần được lưu ý và khắc phục/bổ sung kiểm thử:

### Khiếm khuyết 1: Máy trạng thái FSM bị tách rời giữa `app.js` và `engine.js`
- **Vị trí**: `src/app.js` dòng 755–788 (`startSimulation`) so với `src/engine.js` dòng 620–640 (`startUpload`).
- **Chi tiết**: `src/app.js` tạo thể hiện `const codeEngine = new CodeExecutionEngine();`, nhưng hàm `startSimulation()` tự lập trình lại chuỗi `setTimeout` 600ms + 600ms bằng biến cục bộ `uploadTimer1`, `uploadTimer2`. `codeEngine.startUpload()` và `codeEngine.stop()` không bao giờ được gọi. Trạng thái nội tại `codeEngine.state` luôn là `'idle'`.
- **Rủi ro**: Nếu bất kỳ thành phần nào khác đọc `codeEngine.state`, trạng thái sẽ không phản ánh đúng thực tế đang chạy trên màn hình.

### Khiếm khuyết 2: Thao tác Kéo rê (Drag) & Co giãn (Resize Grip) Sơ đồ Mạch chưa được gắn Event Listener
- **Vị trí**: `src/app.js` dòng 184–185 và dòng 999–1004.
- **Chi tiết**: `elements.schematicHandle` (`#schematic-drag-handle`) và `elements.schGrip` (`#sch-grip`) được truy vấn và lưu vào bộ nhớ cache `elements`, nhưng trong hàm `bindEvents()` hoàn toàn không có `addEventListener` cho sự kiện `mousedown` hay `mousemove` để di chuyển hoặc co giãn thẻ sơ đồ nổi (`#floating-schematic`). Trong khi đó, `ViewportAndSchematicController.resizeSchematic(w, h)` đã được viết sẵn trong `engine.js`.

### Khiếm khuyết 3: Thẻ Chú giải Linh kiện (`#tip`) không có Event Listener Hover
- **Vị trí**: `src/app.js` dòng 209 (`tip: document.getElementById('tip')`).
- **Chi tiết**: Không có đoạn mã nào đăng ký sự kiện `mouseenter` / `mouseleave` trên các linh kiện phần cứng để hiển thị hoặc ẩn thẻ `#tip` theo yêu cầu của `RULE-009`.

### Khiếm khuyết 4: Các thư viện Import dư thừa trong `app.js`
- **Vị trí**: `src/app.js` dòng 10–11, dòng 15, dòng 26.
- **Chi tiết**: `Esp32SafetyEngine`, `ESP32_CONSTANTS`, `BADGES`, và `ESP32_PINS_38` được import ở đầu file nhưng không hề được sử dụng ở bất kỳ dòng nào trong `app.js`.

### Khiếm khuyết 5: Modal Pinout chỉ hiển thị sơ đồ 30 chân, thiếu lựa chọn 38 chân
- **Vị trí**: `src/app.js` dòng 875–899 (`openPinoutModal`).
- **Chi tiết**: Tiêu đề modal ghi rõ *"Sơ Đồ Chân ESP32 DevKit V1 (30 / 38 Pinout)"*, nhưng mã nguồn chỉ duyệt qua `ESP32_PINS_30.slice(0, 15)` và `ESP32_PINS_30.slice(15, 30)`. Không có nút bấm chuyển đổi để người dùng xem phiên bản 38 chân (`ESP32_PINS_38`).

### Khiếm khuyết 6: Lỗ hổng cộng dồn XP khi làm lại Quiz nhiều lần
- **Vị trí**: `src/engine.js` dòng 529–534 (`markLessonComplete`):
  ```javascript
  if (quizScore !== null) {
    this.quizScores[lessonId] = quizScore;
    if (quizScore === 3 && isFirstTry) {
      this.xp += 25; // Bonus for perfect first-try quiz
    }
  }
  ```
- **Chi tiết**: Nếu hàm `markLessonComplete` được gọi lại với `quizScore === 3` và `isFirstTry === true`, hệ thống không kiểm tra xem bài học đó đã từng được nhận 25 XP thưởng hay chưa, dẫn đến việc người chơi có thể được cộng thêm 25 XP nhiều lần.

### Khiếm khuyết 7: Đột biến 50mA trong Mutant-1 chưa có ca kiểm thử trực tiếp
- **Vị trí**: `tests/spec.test.js` dòng 131–153.
- **Chi tiết**: Trong `mutant-1`, giá trị `I_MAX_MA` bị đổi từ `40.0` thành `50.0`. Ca kiểm thử hiện tại kiểm tra tại $40\text{mA}$ (cả 2 bên đều coi là chưa cháy) và $130\text{mA}$ (cả 2 bên đều coi là cháy). Mặc dù `mutant-1` đã bị giết bởi 2 lỗi khác (chân 39 và góc $12^\circ$), việc bổ sung kiểm thử tại dòng điện $45\text{mA}$ (nằm giữa 40mA và 50mA) sẽ đảm bảo mọi đột biến trong `mutant-1` đều bị bắt độc lập.

### Khiếm khuyết 8: Hoàn toàn thiếu bộ kiểm thử End-to-End (E2E) DOM
- **Vị trí**: Thư mục `tests/`.
- **Chi tiết**: Dự án hiện chỉ có `tests/spec.test.js` (headless unit test). Cần xây dựng thêm một bộ kiểm thử DOM (dùng Node.js với JSDOM hoặc `globalThis.window/document` mock) để đáp ứng trọn vẹn yêu cầu **R2** của bản yêu cầu gốc (`ORIGINAL_REQUEST.md`).

---

## 5. Conclusion (Kết Luận & Kiến Nghị Hành Động)

1. **Đánh giá chung**:
   - Ứng dụng đã được xây dựng theo một kiến trúc rất sáng sủa, tuân thủ nghiêm ngặt chuẩn Clean-Room, phân tách rành mạch 3 tầng nhận thức (Band A, Band B, Band C), 20 bài học và 10 quy tắc hộp đen.
   - Cơ chế kiểm thử đột biến 3-Mutant Protocol (`clean-room/verify-mutants.mjs`) đang hoạt động hoàn hảo, đạt điểm tối đa $100\%$ ($3/3$ mutants killed, $0$ survivors).
2. **Kế hoạch hành động đề xuất cho các bước tiếp theo**:
   - **Giai đoạn R1 (Mở rộng Boundary Test)**: Bổ sung các bài kiểm tra ranh giới điện trở/dòng điện tại $41\text{mA}$ và $45\text{mA}$ trong `tests/spec.test.js` để bắt chết đột biến 50mA; bổ sung kiểm thử cho toàn bộ 20 bài học trong danh mục.
   - **Giai đoạn R2 (Xây dựng E2E DOM Test Suite)**: Tạo file kiểm thử mới `tests/dom.test.js` mô phỏng đầy đủ chu trình DOM của người dùng:
     - Chuyển dải tuổi Band A, B, C và kiểm tra hiển thị/ẩn các container (`#story-cards-container`, `#blocks-workspace-container`, `#code-editor-container`).
     - Duyệt chọn qua 20 bài học và kiểm tra highlight trên danh sách `#lessons-list`.
     - Kích hoạt `#btn-code-run`, kiểm tra đèn LED TX/RX nhấp nháy, log nạp code UART, và dòng code sáng lên (`.is-running`).
     - Đóng mở 4 modal dialogs và bấm phím `Escape` để thoát.
     - Kiểm tra co giãn Serial Monitor từ 56px đến 360px và nhấn đúp chuột khôi phục về 92px.
     - Kiểm tra sự kiện resize cửa sổ kích hoạt class `compact` khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$.
   - **Giai đoạn R3 (Hoàn thiện & Remediation)**: Sửa chữa các khiếm khuyết liên kết giữa `app.js` và `engine.js` (đồng bộ trạng thái FSM, gắn listener kéo rê sơ đồ mạch, bổ sung toggle 38-pin trong Pinout modal).

---

## 6. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ thành viên nào trong đội ngũ đều có thể tái tạo và xác minh độc lập toàn bộ các kết luận trong báo cáo này bằng các lệnh sau:

1. **Xác minh kiểm thử đơn vị bản chính**:
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   npm test
   ```
   *Điều kiện hợp lệ*: Thoát với exit code `0`, hiển thị `37 passed`, `0 failed`.

2. **Xác minh bộ kiểm thử đột biến (3-Mutant Protocol)**:
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Điều kiện hợp lệ*: Thoát với exit code `0`, primary build đạt 37/37 passed, mutant-1 bị giết (2 fails), mutant-2 bị giết (3 fails), mutant-3 bị giết (3 fails), tổng điểm đạt `100% (3/3 mutants killed)`.

3. **Xác minh nội dung đột biến từng file**:
   ```bash
   diff -u src/engine.js clean-room/mutants/mutant-1/engine.js
   diff -u src/engine.js clean-room/mutants/mutant-2/engine.js
   diff -u src/engine.js clean-room/mutants/mutant-3/engine.js
   ```

4. **Xác minh các phần tử DOM và bộ chọn**:
   Mở trực tiếp file `index.html` trên trình duyệt hoặc chạy `npx serve .` và mở DevTools Console để kiểm tra các selector `#band-badge`, `.band-tab`, `#modal-pinout`, `#modal-quiz`, `#serial-panel`, `#floating-schematic`.
