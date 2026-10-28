# BÁO CÁO THIẾT KẾ & KHẢO SÁT CHI TIẾT BỘ KIỂM THỬ MILESTONE 1 (RULE-006 ĐẾN RULE-010)

- **Agent:** `explorer_m1_2` (Exploration Agent for Milestone 1 - Test & Boundary Architecture)
- **Parent Conversation ID:** `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Working Directory:** `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_m1_2`
- **Target Files:**
  - Spec Test Suite: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js`
  - Approved Specification: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/SPEC.approved.md`
  - Engine Core: `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/engine.js`
  - 3-Mutant Verification Harness: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/verify-mutants.mjs`
- **Clean-Room Compliance:** Đã tuân thủ nghiêm ngặt nguyên tắc Clean-Room: KHÔNG đọc `clean-room/SPEC.md` hoặc các tệp cấm trong `clean-room/.forbidden-paths`. Chỉ sử dụng `clean-room/SPEC.approved.md`, mã nguồn và tệp kiểm thử hiện có của dự án.

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1. Hiện Trạng Test Runner và 3-Mutant Harness
1. **Lệnh thực thi kiểm thử hiện tại:**
   ```bash
   npm test && node clean-room/verify-mutants.mjs
   ```
   *Kết quả thực tế trực tiếp từ terminal:*
   - `npm test`: 37 tests passed, 0 failed, 10 suites (thời gian ~1266ms).
   - `node clean-room/verify-mutants.mjs`:
     - `primary` (`src/engine.js`): VERIFIED PASS (37/37 passed, Exit code: 0).
     - `mutant-1` (`clean-room/mutants/mutant-1/engine.js`): KILLED (35 pass, 2 fail, Exit code: 1).
     - `mutant-2` (`clean-room/mutants/mutant-2/engine.js`): KILLED (34 pass, 3 fail, Exit code: 1).
     - `mutant-3` (`clean-room/mutants/mutant-3/engine.js`): KILLED (34 pass, 3 fail, Exit code: 1).
     - Mutation Score: 100% (3/3 killed).

2. **Cơ chế nạp động engine trong `tests/spec.test.js` (Lines 13–17):**
   ```javascript
   const rawEnginePath = process.env.ENGINE_PATH;
   const resolvedPath = rawEnginePath
     ? path.resolve(process.cwd(), rawEnginePath)
     : path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/engine.js');
   const engineUrl = pathToFileURL(resolvedPath).href;
   ```
   Điều này xác nhận rằng bất kỳ assertion nào mở rộng trong `tests/spec.test.js` cũng sẽ được chạy chống lại cả 3 mutant khi thực thi `clean-room/verify-mutants.mjs`.

### 1.2. Phân Tích Đột Biến Cụ Thể (Mutant Sabotage Analysis)
Qua công cụ `diff -u` giữa `src/engine.js` và các mutant:

1. **Mutant 1 (`clean-room/mutants/mutant-1/engine.js`):**
   - Dòng 145: Sabotage `I_MAX_MA: 50.0` (nguyên bản: `40.0`).
   - Dòng 148: Omission of pin 39: `INPUT_ONLY_PINS: [34, 35, 36]` (nguyên bản: `[34, 35, 36, 39]`).
   - Dòng 275: Sabotage `isViolating = clampedAngle >= 12` (nguyên bản: `> 12`).
   - *Tác động đến RULE-006..010:* Không can thiệp vào các quy tắc 6..10. Các bài test mới cho RULE-006..010 sẽ PASS trên Mutant-1, và Mutant-1 vẫn tiếp tục bị KILLED bởi các bài test RULE-002 và RULE-003.

2. **Mutant 2 (`clean-room/mutants/mutant-2/engine.js`):**
   - Dòng 49: `currentBand` bị gán mặc định thành `BAND_A` (nguyên bản: `BAND_B`).
   - Dòng 81: Band A bị rò rỉ trình biên tập mã: `showCodeEditor: true` (nguyên bản: `false`).
   - Dòng 624–639: **Bỏ qua máy trạng thái FSM nạp code**:
     ```javascript
     // MUTANT-2: Sabotaged FSM - skips 'uploading' and transitions directly to 'running'
     this.state = 'running';
     if (onStateChange) onStateChange(this.state);
     if (onLog) onLog('Bypassed upload directly to running');
     return Promise.resolve();
     ```
   - *Tác động đến RULE-006:* Trong Mutant-2, `startUpload()` không bao giờ chuyển sang `'uploading'`, không có độ trễ 600ms + 600ms, không phát ra chuỗi log `"Compiling sketch…"` hoặc `"Parsing MicroPython script…"`, không có `"Connecting to ESP32 on USB…"`, và không có `"Writing… 100 %. Hard resetting via RTS pin."`.
   - *Kết luận:* Mở rộng kiểm tra FSM và log strings trong RULE-006 sẽ trực tiếp củng cố việc **tiêu diệt triệt để Mutant-2**.

3. **Mutant 3 (`clean-room/mutants/mutant-3/engine.js`):**
   - Dòng 525: XP bị giảm còn 10/15/20 thay vì 50/100/150.
   - Dòng 565: `getProgressPercentage` dùng `Math.ceil(...) + 5` thay vì `Math.floor(...)`.
   - Dòng 748: **Phá hủy bộ nhớ giữ trạng thái (latch) của máy bơm**:
     ```javascript
     // MUTANT-3: Sabotaged hysteresis memory (resets to false instead of retaining previousPumpState)
     let pumpState = false;
     ```
   - *Tác động đến RULE-008:* Khi mực nước nằm trong khoảng trễ $20\% < H < 90\%$, `updatePumpHysteresis` trong Mutant-3 bị gán cứng về `false`, làm mất hoàn toàn khả năng ghi nhớ trạng thái rơ-le đang đóng trước đó.
   - *Kết luận:* Kiểm thử các giá trị biên chính xác ($20.1\%$, $50\%$, $89.9\%$) với `previousPumpState = true` sẽ **ngay lập tức làm Mutant-3 thất bại và bị tiêu diệt**.

### 1.3. Khảo Sát Hiện Trạng Code Trong Phạm Vi Giao Nhiệm Vụ

#### A. RULE-006 (`src/engine.js:600–660`)
- `CodeExecutionEngine`:
  - `state`: `'idle'`, `'uploading'`, `'running'`.
  - `startUpload({ onLog, onStateChange, isPython })`:
    - Nếu `isPython === false`: emit `"Compiling sketch…"` kèm tag `'txrx-active'`.
    - Nếu `isPython === true`: emit `"Parsing MicroPython script…"` kèm tag `'txrx-active'`.
    - Sau 600ms: emit `"Connecting to ESP32 on USB…"` kèm tag `'txrx-active'`.
    - Sau 600ms tiếp theo (tổng 1200ms): emit `"Writing… 100 %. Hard resetting via RTS pin."` kèm tag `'txrx-done'`. Chuyển state sang `'running'`.
  - `stop({ onStateChange })`: chuyển state về `'idle'`.
  - `substituteParams(template, params)`: regex `/\{\{(\w+)\}\}/g`. Thay thế `key in params ? params[key] : match`.
  - `getSavedConsoleHeight()`: đọc `learn-esp32-serial-h` hoặc `console-height`. Mặc định 92. Kẹp trong $[56, 360]$.
  - `saveConsoleHeight(h)`: làm tròn `Math.round(h)`, kẹp trong $[56, 360]$, lưu vào cả 2 key.
- Line tracing trong `src/app.js:845–859`:
  - `highlightCodeLine(textSubstring)`: thêm lớp `is-running` vào các dòng `.code-line` chứa `textSubstring`, xóa khỏi các dòng khác.
  - `resetExecutionState()`: `document.querySelectorAll('.code-line.is-running').forEach(el => el.classList.remove('is-running'))`.

#### B. RULE-007 (`src/engine.js:667–735`)
- `WirelessIoTSimulator`:
  - `virtualIp = '192.168.1.42'`, `webLedState = false`.
  - `handleHttpToggle()`: đảo `webLedState`, trả `{ status: 200, statusText: 'OK', data: { led, ip } }`.
  - `sendBluetoothCommand(cmd)`: chuẩn hóa `String(cmd).trim().toUpperCase()`.
    - `'ON'`: `lampState = true`, trả `{ success: true, response: 'OK: LAMP IS ON', lampState: true }`.
    - `'OFF'`: `lampState = false`, trả `{ success: true, response: 'OK: LAMP IS OFF', lampState: false }`.
    - `'DIM'`: không đổi `lampState`, trả `{ success: true, response: 'OK: LAMP DIMMED 50%', lampState: this.bluetoothLampState }`.
    - Lệnh khác: trả `{ success: false, response: 'ERROR: UNKNOWN COMMAND' }`.
  - `calculateEspNowPacket(distanceMeters, payloadBytes)`:
    - Nếu `payloadBytes.length > 250`: trả `{ success: false, error: 'PAYLOAD_EXCEEDS_250_BYTES' }`.
    - Kẹp khoảng cách $d \in [0.5, 150]$.
    - Nếu $d \le 100$: `packetLossRate = 0` ($0\%$).
    - Nếu $d > 100$: `packetLossRate = 1 / (1 + Math.exp(-0.1 * (clampedDist - 125)))`.
    - Trả `{ distanceMeters, isDelivered, packetLossPercentage, latencyMs, payloadSize }`.

#### C. RULE-008 (`src/engine.js:742–852`)
- `MechatronicsSimulator`:
  - `updatePumpHysteresis(currentLevelPercent, previousPumpState)`:
    - $H \le 20 \implies \text{pumpActive} = \text{true}$.
    - $H \ge 90 \implies \text{pumpActive} = \text{false}$.
    - $20 < H < 90 \implies \text{pumpActive} = \text{previousPumpState}$.
  - `createKeypadLock(secretPin = '1234')`:
    - `press(key, now = Date.now())`:
      - Nếu `isLockedOut`: nếu `now < lockoutUntil`, trả `LOCKED_OUT`; nếu hết hạn thì giải tỏa.
      - Phím `'*'`: xóa buffer `''`, trả `action: 'CLEAR'`, sound `'BEEP_2000HZ'`.
      - Phím `'#'`: nếu `buffer === secretPin`, trả `action: 'UNLOCKED'`; nếu sai, tăng `failedAttempts`. Khi $\ge 3$ lần, đặt `isLockedOut = true`, `lockoutUntil = now + 10000` (khóa 10s), trả `LOCKOUT_TRIGGERED`.
      - Phím số: nếu `buffer.length < 4`, nối số vào buffer, trả `action: 'DIGIT'`.
  - `calculateSolarStep(ldrLeft, ldrRight, currentAngle = 90, deadband = 15)`:
    - $\Delta L = LDR_{left} - LDR_{right}$.
    - Nếu $|\Delta L| \le \text{deadband} \implies \text{inDeadband: true}, \text{moved: false}$.
    - Nếu $\Delta L > \text{deadband}$ và $\text{angle} < 170 \implies \text{angle} + 1, \text{moved: true}$.
    - Nếu $\Delta L < -\text{deadband}$ và $\text{angle} > 10 \implies \text{angle} - 1, \text{moved: true}$.
  - `polarToCartesian(angleDeg, distanceCm, originX = 150, originY = 150, scale = 1.2)`:
    - $rad = (\text{angleDeg} \cdot \pi) / 180$, $r = \text{distanceCm} \cdot \text{scale}$.
    - $x = \text{originX} + r \cdot \cos(rad)$, $y = \text{originY} - r \cdot \sin(rad)$.
  - `calculateStepperPosition(steps, stepsPerRev = 200, pitchMm = 8)`:
    - $\text{mmPerStep} = \text{pitchMm} / \text{stepsPerRev} = 8 / 200 = 0.04\text{ mm/bước}$.
    - $\text{linearPosMm} = (\text{steps} / \text{stepsPerRev}) \times \text{pitchMm}$, kẹp trong $[0, 200]\text{ mm}$.

#### D. RULE-009 & RULE-010 (`src/engine.js:859–974`)
- `ViewportAndSchematicController`:
  - `pan(dx, dy)`: tích lũy `panX`, `panY`.
  - `setZoom(z)`: kẹp $[0.4, 3.0]$. `zoomBy(factor)`: nhân và kẹp.
  - `rotate(deg)`: `(this.rotationDeg + deg + 360) % 360`.
  - `reset()`: đưa về `panX: 0, panY: 0, zoom: 1.0, rotationDeg: 0`.
  - `toggleSchematic()`: đảo `schematicOpen`.
  - `resizeSchematic(w, h)`: kẹp $w \in [200, 600]$, $h \in [140, 500]$.
- `EnvironmentAndA11yController`:
  - 5 cờ cài đặt: `labels` (true), `grid` (true), `autoRotate` (false), `sound` (true), `reducedMotion` (false). Thêm `lang: 'vi'`.
  - `getTweenSpeedFactor()`: nếu `reducedMotion === true` trả `0.05`, ngược lại `1.0`.
  - `isCompactViewport(width, height)`: `width < 1090 || height < 800`.

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Diễn Kỹ Thuật)

Dựa trên các quan sát trực tiếp, chúng tôi thiết lập chuỗi suy luận kỹ thuật từ yêu cầu tới thiết kế kiểm thử:

1. **RULE-006: Tính toàn vẹn FSM và đa ngôn ngữ biên dịch**:
   - *Suy luận từ Obs 1.2.2 & 1.3.A*: Việc kiểm tra `startUpload` không chỉ đơn thuần là kiểm tra kết thúc ở `'running'`. Để giết Mutant-2, bài test **phải khẳng định trạng thái trung gian tức thời** là `'uploading'` trước khi promise hoàn thành.
   - Cần kiểm tra độc lập 2 luồng: `isPython: false` phát chuỗi log `"Compiling sketch…"` và `isPython: true` phát chuỗi log `"Parsing MicroPython script…"`. Cả 2 luồng đều phải trải qua đúng $600\text{ ms} + 600\text{ ms}$ trễ, kèm thông điệp kết thúc `"Writing… 100 %. Hard resetting via RTS pin."`.
   - Tham số khuôn mẫu `{{paramKey}}`: Phải kiểm tra trường hợp tham số mang giá trị `0` (số không) để đảm bảo không bị lỗi falsy check vô tình bỏ qua việc thay thế, và tham số chưa được định nghĩa phải giữ nguyên thẻ `{{unknown}}`.
   - Chiều cao Console: Phải kiểm tra cả 2 biên dưới $56\text{px}$ và trên $360\text{px}$, trường hợp giá trị lưu trong storage bị hỏng (NaN) phải rơi về mặc định $92\text{px}$, và thao tác nhấp đúp khôi phục về đúng $92\text{px}$.

2. **RULE-007: Tính xác thực mạng không dây & Biên dung lượng ESP-NOW**:
   - *Suy luận từ Obs 1.3.B*: Web Server tại IP `192.168.1.42` phải đảo trạng thái liên tục qua các lần gọi `/toggle`, đảm bảo trả đúng mã HTTP 200.
   - Bluetooth: Lệnh `"DIM"` mang đặc tính quan trọng là **không làm thay đổi trạng thái bật/tắt của đèn**, trong khi lệnh lạ (`"BLINK"`, `""`, null) phải trả về lỗi tĩnh `ERROR: UNKNOWN COMMAND` mà không làm thay đổi đèn.
   - ESP-NOW: Giới hạn 250 bytes là biên cứng của phần cứng ESP32. Gói tin 250 bytes phải truyền thành công, trong khi gói tin 251 bytes phải bị chặn và trả mã lỗi `PAYLOAD_EXCEEDS_250_BYTES`.
   - Về mô hình mất gói tin: Tại $d = 100\text{m}$, tỷ lệ mất gói bắt buộc là $0\%$. Tại điểm uốn $d = 125\text{m}$, hàm sigmoidal đạt chính xác $1 / (1 + e^0) = 50\%$. Tại $d = 140\text{m}$ và $150\text{m}$, tỷ lệ mất gói tăng lũy tiến lên $>80\%$ và $>90\%$.

3. **RULE-008: Biên độ trễ cơ điện tử & Bảo vệ bàn phím**:
   - *Suy luận từ Obs 1.2.3 & 1.3.C*: Logic trễ (Hysteresis) của máy bơm nước là bài kiểm tra sống còn để tiêu diệt Mutant-3.
     - Tại $H = 20.0\%$: Bắt buộc bật bơm (`pumpActive: true`).
     - Tại $H = 20.1\%$: Nằm trong vùng trễ, nếu trạng thái trước là `false` thì phải giữ `false`, nếu trạng thái trước là `true` thì phải giữ `true`.
     - Tại $H = 50.0\%$: Giữ nguyên trạng thái trước (test cả 2 trường hợp `previousPumpState: false` và `true`).
     - Tại $H = 89.9\%$: Nằm trong vùng trễ, nếu trước đó là `true` thì phải giữ `true`.
     - Tại $H = 90.0\%$: Bắt buộc tắt bơm (`pumpActive: false`).
     - *Bằng chứng tiêu diệt mutant:* Mutant-3 gán `let pumpState = false;`, do đó các test tại $20.1\%$, $50.0\%$, và $89.9\%$ với `previousPumpState = true` sẽ thất bại hoàn toàn trên Mutant-3!
   - Khóa bàn phím 4x3: Bắt buộc thử nghiệm chuỗi sự kiện: nhập mã 4 số, xóa bằng `*`, gõ quá 4 số (bị chặn tại 4 số), nhập sai lần 1, lần 2, lần 3 (kích hoạt khóa 10s `LOCKOUT_TRIGGERED`). Khi đang bị khóa, mọi phím bấm đều bị từ chối với hành động `LOCKED_OUT`. Khi hết 10s (`now + 10100`), hệ thống tự động mở khóa và nhận phím bình thường.
   - Pin mặt trời: Vùng chết $\delta = 15$ nghĩa là sai số ánh sáng $\Delta L = \pm 15$ không được phép sinh chuyển động. Chỉ khi $\Delta L = +16$ mới quay sang trái $+1^\circ$ và $\Delta L = -16$ mới quay sang phải $-1^\circ$. Đồng thời kiểm tra kẹp biên an toàn tại $10^\circ$ và $170^\circ$.
   - Radar siêu âm: Tọa độ cực sang Descartes $(r, \theta) \to (x, y)$ cần kiểm tra tại các góc chuẩn: $0^\circ$ (Đông: $x=originX+r, y=originY$), $90^\circ$ (Bắc: $x=originX, y=originY-r$), $180^\circ$ (Tây: $x=originX-r, y=originY$), và $45^\circ$ ($x \approx originX + r\sqrt{2}/2$).
   - Động cơ bước vít me: Kiểm tra độ phân giải $8\text{mm} / 200 = 0.04\text{ mm/bước}$ và kẹp hành trình cơ học $[0, 200]\text{ mm}$.

4. **RULE-009 & RULE-010: Trợ năng, Viewport & Điểm ngắt Responsive**:
   - *Suy luận từ Obs 1.3.D*:
   - Viewport: Cần kiểm tra xoay $90^\circ$ theo modulo $360^\circ$ ($0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 0^\circ$ và góc âm $-90^\circ \to 270^\circ$). Thu phóng phải kẹp chặt trong $[0.4, 3.0]$.
   - Sơ đồ mạch điện nổi: Thao tác `toggleSchematic()` phải đồng bộ trạng thái mở/đóng với `aria-pressed`. Việc thay đổi kích thước phải được kẹp chặt trong $[200..600]\text{px} \times [140..500]\text{px}$.
   - Tùy chọn môi trường: Cần kiểm tra trọn vẹn cả 5 cờ cài đặt (`labels`, `grid`, `autoRotate`, `sound`, `reducedMotion`), kiểm tra tuần tự hóa JSON vào `localStorage`.
   - Giảm chuyển động (Reduced Motion): Khi cờ `reducedMotion` bật, hệ số tốc độ tween phải giảm từ $1.0$ xuống chính xác $0.05$.
   - Điểm ngắt Responsive: Kiểm tra ma trận biên $W < 1090\text{px}$ hoặc $H < 800\text{px}$:
     - $(1089, 800) \implies \text{true}$
     - $(1090, 799) \implies \text{true}$
     - $(1090, 800) \implies \text{false}$ (màn hình chuẩn)
     - $(1091, 801) \implies \text{false}$

---

## 3. Caveats (Các Điểm Lưu Ý & Giới Hạn)

1. **Tuân thủ Clean-Room tuyệt đối**:
   - Không được tham chiếu trực tiếp đến bất kỳ file nào trong `clean-room/.forbidden-paths`. Mọi thiết kế kiểm thử chỉ dựa trên hành vi hộp đen được định nghĩa trong `clean-room/SPEC.approved.md`.
2. **Môi trường chạy `tests/spec.test.js`**:
   - File `spec.test.js` được thực thi trực tiếp bởi `clean-room/verify-mutants.mjs` trong môi trường Node.js thuần (không có JSDOM toàn cục).
   - Do đó, các bài test trong `spec.test.js` phải sử dụng các mock nhẹ (`createMockStorage`, mock line objects) hoặc gọi trực tiếp các phương thức của `engine.js` mà không dựa dẫm vào các biến toàn cục trình duyệt chưa được định nghĩa.
3. **Thời gian chạy kiểm thử (Timeout & Timing)**:
   - Trong `CodeExecutionEngine.startUpload()`, thời gian thực thi cần $600\text{ ms} + 600\text{ ms} = 1200\text{ ms}$ để hoàn thành chu trình.
   - Để giữ tổng thời lượng chạy kiểm thử nhanh gọn (dưới 3 giây trên toàn suite), không nên lặp lại `startUpload()` quá nhiều lần trong các test case đồng bộ. Nên kết hợp kiểm tra cả C++ và Python một cách thông minh hoặc kiểm tra từng giai đoạn FSM.

---

## 4. Conclusion & Test Expansion Strategy (Đề Xuất Bộ Test Case Chi Tiết)

Chúng tôi đã thiết kế chi tiết bộ test case sẵn sàng bổ sung vào `tests/spec.test.js` cho toàn bộ dải RULE-006 đến RULE-010. Dưới đây là mã nguồn kiểm thử đề xuất với đầy đủ assertion và bao phủ tất cả các ca biên.

### 4.1. Đề Xuất Mở Rộng RULE-006 (Code Execution Engine & Serial Monitor)

```javascript
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
```

---

### 4.2. Đề Xuất Mở Rộng RULE-007 (Mạng Không Dây IoT & Giao Thức ESP-NOW)

```javascript
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
```

---

### 4.3. Đề Xuất Mở Rộng RULE-008 (Cơ Điện Tử Tự Động Hóa & Robot STEM)

```javascript
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
```

---

### 4.4. Đề Xuất Mở Rộng RULE-009 & RULE-010 (Viewport, Trợ Năng & Môi Trường)

```javascript
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
```

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ thành viên nào trong đội ngũ hoặc subagent kế tiếp (`clean-room-builder` / `clean-room-tester`) đều có thể kiểm tra độc lập các khẳng định trên qua các bước sau:

1. **Kiểm tra tương thích mã nguồn hiện tại:**
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   npm test
   ```
   *Tiêu chí đạt:* Toàn bộ các test hiện có tiếp tục PASS 100%, thời gian thi hành < 2.0s.

2. **Kiểm tra tiêu diệt 3-Mutant Harness:**
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Tiêu chí đạt:*
   - `primary`: VERIFIED PASS (Exit Code 0).
   - `mutant-1`: KILLED (Exit Code 1).
   - `mutant-2`: KILLED (Exit Code 1).
   - `mutant-3`: KILLED (Exit Code 1).
   - Mutation Score: 100%.

3. **Điều kiện mất hiệu lực (Invalidation Conditions):**
   - Nếu `startUpload` trong `mutant-2` không bị phát hiện khi bỏ qua trạng thái `'uploading'`.
   - Nếu `updatePumpHysteresis(50, true)` hoặc `(20.1, true)` trong `mutant-3` trả về `pumpActive: true` thay vì bị lỗi do mất biến nhớ trạng thái rơ-le.
   - Nếu chiều cao console cho phép lưu giá trị ngoài dải $[56\text{px}, 360\text{px}]$.
   - Nếu gói tin ESP-NOW $251\text{ bytes}$ được chấp nhận mà không báo lỗi `PAYLOAD_EXCEEDS_250_BYTES`.
   - Nếu ngưỡng responsive compact kích hoạt tại kích thước $1090 \times 800$.
