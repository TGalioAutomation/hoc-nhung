# Báo Cáo Khảo Sát & Đánh Giá Hạ Tầng Kiểm Thử (Test Infrastructure Explorer Report)

- **Agent:** `explorer_tests_1` (Test Infrastructure Explorer)
- **Working Directory:** `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_tests_1`
- **Parent Conversation ID:** `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Audit Date:** 2026-10-28
- **Target App:** Age-Tiered (5–20) ESP32 & Embedded Systems Learning WebApp

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1. Cấu hình Dự án & Runner (`package.json`)
File: [`package.json`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/package.json)
Lines 7–10:
```json
  "scripts": {
    "test": "node --test tests/spec.test.js",
    "start": "npx serve ."
  },
```
- Không có bất kỳ `dependencies` hoặc `devDependencies` nào được khai báo trong `package.json`.
- Thư mục `node_modules` hiện tại **không tồn tại** trên cây thư mục dự án (`ls -la` chỉ có `.agents`, `clean-room`, `index.html`, `package.json`, `src`, `tests`).
- Test runner đang được sử dụng là **Node.js Native Test Runner** (`node:test`) và thư viện khẳng định **Node.js Native Assert** (`node:assert/strict`), chạy trên Node.js version `v26.7.0`.

### 1.2. Hiện Trạng Bộ Kiểm Thử Hiện Tại (`tests/spec.test.js`)
File: [`tests/spec.test.js`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js) (584 dòng, 37 test cases, 10 suites).
Lệnh thực thi trực tiếp:
```bash
npm test
```
Kết quả thực tế:
```
▶ RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi (AgeBandController) (4 tests)
▶ RULE-002: Ma Trận Sơ Đồ Chân & An Toàn Điện (Esp32SafetyEngine) (5 tests)
▶ RULE-003: Mô Phỏng Band A (Kid Spark: 5–8 Tuổi) (5 tests)
▶ RULE-004: Mô Phỏng Band B (Block Explorer: 9–13 Tuổi) (4 tests)
▶ RULE-005: Hệ Thống Tiến Trình & Gamification (ProgressAndGamificationEngine) (3 tests)
▶ RULE-006: Code Execution Engine & Serial Monitor (3 tests)
▶ RULE-007: Mạng Không Dây IoT & ESP-NOW (WirelessIoTSimulator) (3 tests)
▶ RULE-008: Cơ Điện Tử & Robot STEM (MechatronicsSimulator) (5 tests)
▶ RULE-009 & RULE-010: Viewport, a11y & Environment (3 tests)
▶ Curriculum Matrix & Pinout Catalog Verification (2 tests)
ℹ tests 37 | ℹ pass 37 | ℹ fail 0 | ℹ duration_ms 1257.98ms
```

### 1.3. Cơ Chế Mocking & Dynamic Loading trong `spec.test.js`
- **Dynamic Module Loading** (Lines 13–17):
  ```javascript
  const rawEnginePath = process.env.ENGINE_PATH;
  const resolvedPath = rawEnginePath
    ? path.resolve(process.cwd(), rawEnginePath)
    : path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/engine.js');
  const engineUrl = pathToFileURL(resolvedPath).href;
  const { ... } = await import(engineUrl);
  ```
  Cho phép nạp động bản chính `src/engine.js` hoặc bất kỳ mutant nào từ biến môi trường `ENGINE_PATH`.
- **In-Memory Storage Mock** (Lines 38–46):
  ```javascript
  function createMockStorage(initial = {}) {
    const store = new Map(Object.entries(initial));
    return {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear()
    };
  }
  ```

### 1.4. Ràng Buộc Kiểm Định Đột Biến (`clean-room/verify-mutants.mjs`)
File: [`clean-room/verify-mutants.mjs`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/verify-mutants.mjs)
Line 65:
```javascript
  const child = spawnSync('node', ['--test', 'tests/spec.test.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      ENGINE_PATH: target.enginePath
    },
    encoding: 'utf8'
  });
```
Lệnh thực thi trực tiếp:
```bash
node clean-room/verify-mutants.mjs
```
Kết quả thực tế:
- Primary build: `PASS (37/37)`, exit code `0`.
- `mutant-1`: `FAIL (35 pass, 2 fail)`, exit code `1` (Killed).
- `mutant-2`: `FAIL (34 pass, 3 fail)`, exit code `1` (Killed).
- `mutant-3`: `FAIL (34 pass, 3 fail)`, exit code `1` (Killed).
- Điểm đột biến Clean-Room: **100% (3/3 killed)**.

### 1.5. Hiện Trạng Môi Trường DOM
- File [`src/engine.js`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/src/engine.js): Hoàn toàn chạy được trong môi trường Node.js thuần nhờ lớp bọc `safeStorage` (Line 26 fallback sang `MemoryStorage`) và guard `if (typeof document !== 'undefined' && document.documentElement)` tại `_syncDom()` (Line 127).
- File [`src/app.js`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/src/app.js):
  - Dòng 133–210: Khởi tạo đối tượng `elements = { bandTabs: document.querySelectorAll('.band-tab'), ... }` ngay tại phạm vi cấp module (top-level scope).
  - Khi import `src/app.js` trong Node.js CLI không có DOM: Thất bại ngay lập tức với lỗi:
    `ReferenceError: document is not defined`
  - Dòng 78–82: Khởi tạo `getAudioContext()` phụ thuộc `window.AudioContext`.
  - Dòng 1010–1200: Gắn hàng loạt listener trên `window` (`DOMContentLoaded`, `keydown`, `resize`, `mousemove`, `mouseup`).
- Kiểm tra cài đặt `jsdom`: Thử nghiệm lệnh `npm install --dry-run jsdom` hoàn thành xuất sắc trong 4 giây, giải quyết được gói `jsdom 30.1.3` và 35 gói phụ thuộc, sẵn sàng tích hợp.

---

## 2. Logic Chain (Chuỗi Lập Luận Kỹ Thuật)

### 2.1. Đánh giá Khuyết Thiếu Kiểm Thử (Coverage Gaps)

#### A. Khuyết thiếu về Kiểm thử Quy tắc Đặc tả (`RULE-001` đến `RULE-010`)
1. **`RULE-001` (Age Band Switching & DOM Adaptivity)**:
   - *Đã kiểm tra*: Giá trị mặc định `band-b`, lưu/phục hồi storage, các cờ boolean của capabilities, event listener callback.
   - *Còn thiếu*: Kiểm tra ngoại lệ khi truyền tham số sai (`invalid-band`); kiểm tra thực tế việc cập nhật thuộc tính `data-age-band` trên thẻ gốc `<html>` trong DOM; kiểm tra kích thước tối thiểu nút bấm theo quy tắc ($\ge 64\text{px}$ cho Band A, $44\text{px}$ cho Band B, $36\text{px}$ cho Band C); kiểm tra ẩn/hiện đồng bộ của 3 container giao diện (`.story-cards-container`, `.blocks-workspace-container`, `.code-editor-container`).
2. **`RULE-002` (ESP32 Safety Engine & Wiring)**:
   - *Đã kiểm tra*: $V > 3.3\text{V}$, input-only pins (34, 35, 36, 39) chặn `OUTPUT`, tính dòng LED qua điện trở và cháy khi $R=0$ hoặc $I > 40\text{mA}$, đọc ADC1 và khóa ADC2 khi Wi-Fi bật, cảm ứng chạm.
   - *Còn thiếu*: Biên điện áp chính xác ($3.3\text{V}$ an toàn vs $3.301\text{V}$ cảnh báo); ma trận tất cả các chân ADC1 (32, 33, 34, 35, 36, 39) vs ADC2 (0, 2, 4, 12, 13, 14, 15, 25, 26, 27); các kênh cảm ứng chạm còn lại (0, 2, 12, 13, 14, 15, 27, 32, 33); kiểm định mã màu dây nối chuẩn (`signalAmber: #f0a53a`, `signalBlue: #3d6fc4`, `power3v3: #e04a3f`, `power5v: #b82e24`, `gnd: #2f3547`).
3. **`RULE-003` (Band A Sensory Feedback)**:
   - *Đã kiểm tra*: Kẹp tần số đèn nhấp nháy 100ms..1500ms bước 50ms, góc cửa tủ lạnh $>12^\circ$ báo động 2400Hz sau thời gian gia hạn, dải còi hú 400..1200Hz, 8 nốt piano C4..C5, ngưỡng đèn ngủ 50%.
   - *Còn thiếu*: Bài học Đèn Ngủ Ma Thuật (Mood Lamp - Lesson 8) với bộ trộn màu RGB 3 kênh $0 \le R, G, B \le 255$; chuyển đổi màu đèn nhấp nháy (Đỏ `#ff3b30`, Vàng `#ffcc00`, Xanh lá `#34c759`); độ trễ phát nốt nhạc $\le 20\text{ms}$; kiểm tra toàn bộ tần số 8 phím đàn (D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88).
4. **`RULE-004` (Band B Block Explorer & Math Formulas)**:
   - *Đã kiểm tra*: Neopixel $N_{lit} = \lfloor (ADC/4095) \times 12 \rfloor$, siêu âm $\Delta t = (2 \times d) / 0.0343$, FSM cổng laser barie $90^\circ$ tại $180^\circ/\text{s}$, DC motor linear RPM.
   - *Còn thiếu*: 3 chế độ màu Neopixel (`blue`, `rainbow` pha $i/12$, `traffic` xanh sang đỏ); kiểm tra góc trung gian của cổng rào chắn laser (ở $250\text{ms}$ phải đạt $45^\circ$); giới hạn khoảng cách siêu âm kẹp $[2\text{cm}, 400\text{cm}]$.
5. **`RULE-005` (Gamification & Progress System)**:
   - *Đã kiểm tra*: Công thức phần trăm tiến trình $\lfloor (N/20) \times 100 \rfloor$, điểm XP theo band, mở khóa 3 huy hiệu mẫu, reset tiến trình.
   - *Còn thiếu*: Điều kiện ghi nhận hoàn thành bài học qua chạy mô phỏng $\ge 3000\text{ms}$ không lỗi; điều kiện đỗ Quiz $\ge 2/3$; thưởng điểm lần đầu $25\text{ XP}$; chống cộng dồn điểm trùng lặp khi hoàn thành lại bài cũ; mở khóa đầy đủ cả 4 huy hiệu ("Blink Master", "Acoustic Wizard", "IoT Explorer", "Mechatronics Pro").
6. **`RULE-006` (Code Execution Engine & Serial Monitor)**:
   - *Đã kiểm tra*: FSM 3 trạng thái `idle` $\to$ `uploading` $\to$ `running` $\to$ `idle`, thay thế tham số template `{{paramKey}}`, co giãn chiều cao console kẹp $[56\text{px}, 360\text{px}]$, mặc định $92\text{px}$.
   - *Còn thiếu*: Thông điệp nạp cho Python (`"Parsing MicroPython script…"`) vs C++ (`"Compiling sketch…"`); các dòng log nối tiếp theo chu kỳ $600\text{ms}$ (`"Connecting to ESP32 on USB…"`, `"Writing… 100 %. Hard resetting via RTS pin."`); chức năng truy vết vệt sáng dòng lệnh `.code-line.is-running` và xóa vệt sáng khi Stop.
7. **`RULE-007` (IoT Wireless & Protocols)**:
   - *Đã kiểm tra*: HTTP GET `/toggle` trên `192.168.1.42`, Bluetooth lệnh ON/OFF, ESP-NOW suy hao sóng khi $>100\text{m}$ và giới hạn payload 250 bytes.
   - *Còn thiếu*: Lệnh Bluetooth `"DIM"`; xử lý lệnh Bluetooth không hợp lệ; kiểm tra đường cong suy hao gói tin tại các mốc cự ly $0.5\text{m}$, $50\text{m}$, $100\text{m}$, $125\text{m}$ (đạt 50%), $150\text{m}$ ($>90\%$).
8. **`RULE-008` (Mechatronics & Robotics)**:
   - *Đã kiểm tra*: Bơm nước hysteresis $20\%-90\%$, bàn phím 4x3 PIN 1234, `*` clear, khóa 3 lần sai, solar tracker vùng chết 15, radar polar to cartesian, stepper linear mm.
   - *Còn thiếu*: Hysteresis tại điểm biên chính xác ($20\%$, $20.1\%$, $89.9\%$, $90\%$); solar tracker bước quay sang phải khi $\Delta L < -15$; solar tracker kẹp biên dưới $10^\circ$; radar tại các góc biên $0^\circ$, $45^\circ$, $180^\circ$; trạng thái nam châm điện trong Pick & Place (Lesson 20).
9. **`RULE-009 & RULE-010` (Viewport, a11y & Settings)**:
   - *Đã kiểm tra*: Pan/zoom kẹp $[0.4, 3.0]$, reset view, cờ reducedMotion factor $0.05$, compact breakpoint khi $W < 1090$ hoặc $H < 800$.
   - *Còn thiếu*: Xoay góc nhìn $90^\circ$ (trái/phải); phím tắt bàn phím (`W/A/S/D`, `Q/E`, `+/-`, `R`, `Escape`, `Space`); cả 5 cờ cài đặt (`labels`, `grid`, `autoRotate`, `sound`, `reducedMotion`); toggle Floating Schematic và đồng bộ `aria-pressed`.

#### B. Khuyết thiếu về Kiểm thử 20 Bài Học (Curriculum Matrix)
- Hiện tại trong `tests/spec.test.js` chỉ có 1 test kiểm tra mảng `LESSONS` có 20 phần tử và mỗi bài có 3 câu quiz.
- **Hoàn toàn chưa có kiểm thử chuyên sâu cho từng bài học trong số 20 bài**:
  - Chưa kiểm tra tính hợp lệ của câu hỏi Quiz (đáp án đúng `answer` phải nằm trong khoảng `0..options.length-1`, có phần giải thích `explain`).
  - Chưa kiểm tra mã nguồn C++ (`codeCpp`) và MicroPython (`codePy`) của từng bài chứa đúng các hàm khởi tạo và chân cắm tương ứng.
  - Chưa kiểm tra cấu hình tham số mặc định (`defaultParams`) và mô hình mạch (`simConfig`).

#### C. Khuyết thiếu về Kiểm thử Giao Diện & DOM E2E
- Hiện tại dự án **chưa có bất kỳ test DOM nào**.
- Không có kiểm thử tích hợp cho:
  - Chuyển đổi Age-band trên thanh điều hướng (`.band-tab`) và kiểm tra phản ứng của DOM.
  - Chọn bài học trong danh sách 20 bài (`.lesson-item`) và kiểm tra DOM cập nhật nội dung bài.
  - Mở/đóng 4 hộp thoại modal: Sơ đồ chân (`#modal-pinout`), Câu đố Quiz (`#modal-quiz`), Sơ đồ nguyên lý nổi (`#floating-schematic`), Cài đặt (`#modal-settings`).
  - Chạy quy trình làm bài Quiz trên giao diện (chọn đáp án, xem phản hồi, tính điểm, đóng modal).
  - Thao tác kéo đổi kích thước Serial Monitor và nhấn đúp chuột khôi phục $92\text{px}$.
  - Kích hoạt lớp CSS `.compact` khi cửa sổ thu nhỏ $<1090\text{px}$ hoặc $<800\text{px}$.

---

### 2.2. Đề Xuất Thiết Kế Kiến Trúc Kiểm Thử 3 Tầng (3-Tier Test Architecture)

Để đáp ứng đầy đủ yêu cầu R1, R2, R3 của `ORIGINAL_REQUEST.md` mà không làm phá vỡ cơ chế `clean-room/verify-mutants.mjs`, cấu trúc kiểm thử tối ưu như sau:

```
tests/
├── spec.test.js              # [Tầng 1: Unit & Boundary Rules] (Giữ nguyên mục tiêu kiểm định mutant)
│                             # Mở rộng toàn bộ biên số học, an toàn điện, FSM, toán học mô phỏng
│                             # Chạy độc lập trong Node.js CLI không cần DOM, tương thích 100% với verify-mutants.mjs
├── lessons.test.js           # [Tầng 2: Curriculum & Quiz Catalog Verification]
│                             # Kiểm tra 100% cả 20 bài học: mã code C++/Python, 60 câu quiz, chân cắm, tham số
├── e2e-dom.test.js           # [Tầng 3: End-to-End DOM & Interactive Simulation Verification]
│                             # Sử dụng JSDOM nạp index.html và bootstrap src/app.js
│                             # Kiểm thử User Journeys 3 Age-Bands, chuyển 20 bài, 4 Modals, Breakpoints, Serial
└── helpers/
    └── dom-setup.js          # Shared test helper khởi tạo môi trường JSDOM + mock Web Audio / Canvas
```

#### Tích hợp `package.json`:
```json
"scripts": {
  "test": "node --test \"tests/*.test.js\"",
  "test:spec": "node --test tests/spec.test.js",
  "test:lessons": "node --test tests/lessons.test.js",
  "test:e2e": "node --test tests/e2e-dom.test.js",
  "test:mutants": "node clean-room/verify-mutants.mjs"
}
```

---

## 3. Caveats (Các Điểm Lưu Ý & Giới Hạn)

1. **Tuân thủ Clean-Room**:
   - Quá trình khảo sát tuyệt đối **không đọc** `clean-room/SPEC.md` hoặc bất kỳ file nào trong `.forbidden-paths` (`https://learn-esp32.vercel.app`).
   - Mọi đặc tả được trích xuất hoàn toàn từ tài liệu đã được phê duyệt: `clean-room/SPEC.approved.md`.
2. **Tính Tương Thích của `clean-room/verify-mutants.mjs`**:
   - `verify-mutants.mjs` hiện tại gọi lệnh cứng `spawnSync('node', ['--test', 'tests/spec.test.js'], ...)`.
   - Do đó, **tất cả các test case dùng để tiêu diệt 3 mutant PHẢI nằm trong `tests/spec.test.js`**. Các file test mới (`lessons.test.js`, `e2e-dom.test.js`) phục vụ việc mở rộng phạm vi kiểm thử toàn diện của hệ thống và chạy qua `npm test`.
3. **Môi trường JSDOM trong Node 26**:
   - Node 26 hỗ trợ ESM và `import.meta.resolve` hoàn hảo. Cài đặt `jsdom` qua `npm install --save-dev jsdom` diễn ra mượt mà, không yêu cầu cờ thực thi thử nghiệm nào.
   - Các API đồ họa và âm thanh trình duyệt như `HTMLCanvasElement.getContext('2d')` và `window.AudioContext` cần được tạo mock nhẹ trong `helpers/dom-setup.js` để tránh phát sinh cảnh báo không cần thiết.

---

## 4. Conclusion (Kết Luận & Kế Hoạch Triển Khai)

1. **Đánh giá Hiện Trạng**:
   - Bộ test hiện tại (`tests/spec.test.js`) rất gọn gàng và chạy nhanh (~1.25s), đạt 100% pass và tiêu diệt 3/3 mutant.
   - Tuy nhiên, độ phủ chỉ dừng lại ở các nhánh chính cơ bản; thiếu vắng toàn bộ kiểm thử DOM E2E, thiếu kiểm tra chi tiết 20 bài học và 60 câu hỏi quiz, thiếu các kịch bản biên sâu theo `SPEC.approved.md`.
2. **Kế hoạch Mở Rộng Cụ Thể Cho Đội Ngũ Triển Khai (Builder / Tester)**:
   - **Bước 1**: Mở rộng `tests/spec.test.js` bổ sung các bài test biên cho RULE-001 đến RULE-010 (đặc biệt là Mood Lamp RGB, Neopixel palette, ESP-NOW sigmoid, Solar deadband, Hysteresis edge values). Đảm bảo chạy `node clean-room/verify-mutants.mjs` vẫn tiêu diệt 3/3 mutants và pass 100% trên primary.
   - **Bước 2**: Tạo file `tests/lessons.test.js` kiểm tra tuần tự 20 bài học, đối soát toàn bộ 60 câu hỏi quiz (đáp án hợp lệ, giải thích rõ ràng), kiểm tra các tham số `defaultParams` và cú pháp code C++/Python.
   - **Bước 3**: Cài đặt `jsdom` (`npm i -D jsdom`) và xây dựng `tests/helpers/dom-setup.js` nạp `index.html`.
   - **Bước 4**: Tạo file `tests/e2e-dom.test.js` thực hiện 7 nhóm test E2E tương tác DOM:
     - Nhóm 1: Age-band switcher (Band A $\leftrightarrow$ Band B $\leftrightarrow$ Band C), kiểm tra `data-age-band` và tính thích ứng UI.
     - Nhóm 2: Lesson navigation (chọn qua lại giữa các bài trong 20 bài).
     - Nhóm 3: Code execution lifecycle (`idle` $\to$ `uploading` $\to$ `running` $\to$ `idle`), line tracing `.code-line.is-running`, serial monitor logging.
     - Nhóm 4: Modals interaction (Pinout modal, Quiz modal, Floating schematic toggle, Settings modal).
     - Nhóm 5: Gamification progression (hoàn thành bài, cộng XP, cập nhật thanh progress bar `"{N}/20"`, mở khóa huy hiệu, nút xóa sạch tiến trình).
     - Nhóm 6: Serial monitor resizing (kéo grip chuột, nhấn đúp chuột về 92px).
     - Nhóm 7: Responsive breakpoint (`compact` class toggle khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$).
   - **Bước 5**: Cập nhật script `npm test` trong `package.json` thành `node --test "tests/*.test.js"`.

---

## 5. Verification Method (Phương Pháp Tự Kiểm Tra Độc Lập)

Bất kỳ chuyên gia hoặc Sub-Agent nào cũng có thể kiểm tra độc lập các quan sát và kết luận trên bằng các lệnh sau:

1. **Kiểm tra bộ test hiện tại**:
   ```bash
   npm test
   ```
   *Kết quả mong đợi*: Thoát mã `0`, 37 tests passed.

2. **Kiểm tra bộ đánh giá mutant**:
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Kết quả mong đợi*: Thoát mã `0`, primary pass 100%, 3 mutants bị tiêu diệt (killed).

3. **Kiểm tra khả năng chạy kiểm thử đa file**:
   ```bash
   node --test "tests/*.test.js"
   ```
   *Kết quả mong đợi*: Khớp với `npm test`.

4. **Kiểm tra khả năng tích hợp JSDOM**:
   ```bash
   npm install --dry-run jsdom
   ```
   *Kết quả mong đợi*: Hoàn thành giải quyết gói trong $\le 5$ giây, mã thoát `0`.
