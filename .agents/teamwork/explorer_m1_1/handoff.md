# BÁO CÁO KHẢO SÁT & THIẾT KẾ CHIẾN LƯỢC KIỂM THỬ MILESTONE 1
## Mở Rộng Bộ Kiểm Thử Đặc Tả & Ranh Giới (RULE-001 Đến RULE-005)

- **Agent**: `explorer_m1_1` (Exploration Agent for Milestone 1)
- **Thư mục làm việc**: `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_m1_1`
- **Mã hội thoại Parent**: `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Thời gian lập**: 2026-10-28
- **Tài liệu đặc tả phê duyệt**: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/SPEC.approved.md`
- **Tệp kiểm thử mục tiêu**: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js`

---

## Tóm Tắt Cốt Lõi (Core Findings)
Đã khảo sát toàn diện mã nguồn `src/engine.js`, `src/lessons.js`, tệp kiểm thử `tests/spec.test.js` và 3 bản đột biến (`mutant-1`, `mutant-2`, `mutant-3`). Hiện tại `tests/spec.test.js` chỉ có 21 bài test cho RULE-001..RULE-005; bộ test đề xuất mở rộng lên **27 test suites chuyên sâu** với đầy đủ các điểm biên số học ($3.300\text{V}$ vs $3.301\text{V}$, $I=40\text{mA}$ vs $45\text{mA}$, $\theta=12^\circ$ vs $12.1^\circ$), kiểm tra toàn bộ ma trận chân (4 chân input-only, 6 chân ADC1, 10 chân ADC2, 10 chân Touch), các bảng màu Neopixel/Mood Lamp, và tính toán XP/tiến trình, đã được kiểm chứng thực nghiệm tiếp tục **tiêu diệt 100% cả 3 mutants**.

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1. Tệp tin và Dòng Mã Quan Sát
1. **Đặc tả Clean-Room phê duyệt**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/SPEC.approved.md`
   - Dòng 31–111: Định nghĩa chi tiết từ `RULE-001` đến `RULE-005`.
   - Tuân thủ Clean-Room nghiêm ngặt: Tuyệt đối không đọc `clean-room/SPEC.md` hay URL cấm trong `.forbidden-paths`.

2. **Hiện trạng kiểm thử trong `tests/spec.test.js`**:
   - Dòng 48–103: `RULE-001` có 4 tests.
   - Dòng 105–181: `RULE-002` có 5 tests.
   - Dòng 183–239: `RULE-003` có 5 tests.
   - Dòng 241–293: `RULE-004` có 4 tests.
   - Dòng 295–352: `RULE-005` có 3 tests.
   - Tổng cộng cho nhóm RULE-001..RULE-005: 21 tests (trên tổng số 37 tests của toàn bộ tệp).

3. **Hiện trạng thực thi kiểm thử và Mutant Harness**:
   - Lệnh: `npm test` (`node --test tests/spec.test.js`)
     ```
     ℹ tests 37 | ℹ suites 10 | ℹ pass 37 | ℹ fail 0 | ℹ duration_ms 1257.8ms
     Exit code: 0
     ```
   - Lệnh: `node clean-room/verify-mutants.mjs`
     ```
     ▶ Executing test suite against [primary]: Primary Clean-Room Build...
       Exit Code : 0 | Passed: 37 | Failed: 0 | Verdict: VERIFIED PASS (100%)
     ▶ Executing test suite against [mutant-1]: Mutant 1 (Boundary / Off-by-One)...
       Exit Code : 1 | Passed: 35 | Failed: 2 | Verdict: KILLED (2 assertion failures)
     ▶ Executing test suite against [mutant-2]: Mutant 2 (Invariant / State-Machine Bypass)...
       Exit Code : 1 | Passed: 34 | Failed: 3 | Verdict: KILLED (3 assertion failures)
     ▶ Executing test suite against [mutant-3]: Mutant 3 (Hysteresis & Gamification Corrupted)...
       Exit Code : 1 | Passed: 34 | Failed: 3 | Verdict: KILLED (3 assertion failures)
     Clean-Room Mutation Score: 100% (3/3 mutants killed, 0 survivors).
     ```

### 1.2. Phân Tích Đột Biến (Mutant Sabotage Analysis)
Qua lệnh `diff -u src/engine.js clean-room/mutants/mutant-*/engine.js`:
- **`mutant-1`**:
  1. `ESP32_CONSTANTS.I_MAX_MA`: Thay đổi từ `40.0` thành `50.0`.
  2. `ESP32_CONSTANTS.INPUT_ONLY_PINS`: Bỏ sót chân `39` (chỉ còn `[34, 35, 36]`).
  3. `BandASimulator.checkFridgeAlarm`: Thay đổi `clampedAngle > 12` thành `clampedAngle >= 12`.
- **`mutant-2`**:
  1. `AgeBandController`: Giá trị mặc định khi chưa có storage bị đổi thành `BAND_A` (thay vì `BAND_B`).
  2. `AgeBandController.getCapabilities(BAND_A)`: Đổi `showCodeEditor: false` thành `true` (rò rỉ code editor cho lứa tuổi 5–8).
  3. `CodeExecutionEngine.startUpload`: Bỏ qua trạng thái `'uploading'` và gán trực tiếp `'running'`.
- **`mutant-3`**:
  1. `ProgressAndGamificationEngine.markLessonComplete`: Thay đổi XP cộng từ `50 / 100 / 150` thành `10 / 15 / 20`.
  2. `ProgressAndGamificationEngine.getProgressPercentage`: Thay đổi `Math.floor(...)` thành `Math.ceil(...) + 5`.
  3. `MechatronicsSimulator.updatePumpHysteresis`: Khởi tạo `let pumpState = false;` thay vì giữ `previousPumpState`.

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Diễn Kỹ Thuật)

### 2.1. Phân Tích Lỗ Hổng Kiểm Thử & Thiết Kế Khẳng Định Cho Từng Quy Tắc

#### RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi (AgeBandController)
- **Thiếu sót hiện tại**:
  1. Chưa kiểm tra ngoại lệ khi gọi `setBand('invalid-band')`, `setBand('')`, `setBand(null)`.
  2. Chưa kiểm tra khởi tạo khi `user-age-band` trong `localStorage` chứa giá trị rác hoặc chuỗi rỗng.
  3. Chưa kiểm tra đầy đủ toàn bộ 8 trường năng lực (`capabilities`) cho cả 3 band (`band`, `modeName`, `ageRange`, `showCodeEditor`, `showPinout`, `showStoryCards`, `showBlockWorkspace`, `minButtonSizePx`, `interactiveSound`).
  4. Chưa kiểm tra hàm hủy đăng ký (`unsubscribe`) từ `addListener()` và khả năng chống sập khi listener khác ném lỗi.
  5. Chưa kiểm tra đồng bộ thuộc tính DOM `data-age-band` và sự kiện `ageBandChanged`.
- **Chiến lược khẳng định (Assertion Strategy)**:
  - Khẳng định giá trị mặc định luôn là `band-b` kể cả khi storage có `{ 'user-age-band': 'invalid-xyz' }` hoặc `{ 'user-age-band': '' }`.
  - Khẳng định `setBand('xyz')` ném ngoại lệ khớp regex `/Invalid age band: xyz/`.
  - Khẳng định kích thước nút bấm: Band A $\ge 64\text{px}$, Band B $\ge 44\text{px}$, Band C $\ge 36\text{px}$.
  - Khẳng định Band A: `showCodeEditor === false`, `showPinout === false`, `showStoryCards === true`. (Đảm bảo giết `mutant-2`).

#### RULE-002: Ma Trận Sơ Đồ Chân & An Toàn Điện (Esp32SafetyEngine)
- **Thiếu sót hiện tại**:
  1. Chưa kiểm tra điểm ranh giới điện áp chính xác: $3.300\text{V}$ (an toàn) vs $3.301\text{V}$ (quá áp `OVERVOLTAGE_WARNING`).
  2. Chưa kiểm tra từng chân input-only riêng lẻ với cả chữ hoa `'OUTPUT'`, chữ thường `'output'`, và kiểu chuỗi `'39'`. (Lưu ý: `mutant-1` bỏ sót chân 39).
  3. Chưa kiểm tra giới hạn dòng điện $I = 45\text{mA} > 40\text{mA}$ gây cháy linh kiện (`COMPONENT_BURNED_STATE`). Hiện tại bài test cũ dùng $R=10\ \Omega \implies 130\text{mA}$, nên `mutant-1` (giới hạn 50mA) vẫn vô tình pass nhánh này.
  4. Chưa quét toàn bộ 6 chân ADC1 (`32, 33, 34, 35, 36, 39`) và toàn bộ 10 chân ADC2 (`0, 2, 4, 12, 13, 14, 15, 25, 26, 27`).
  5. Chưa quét đủ 10 kênh cảm ứng điện dung (`0, 2, 4, 12, 13, 14, 15, 27, 32, 33`) và từ chối chân không hỗ trợ touch (`21, 34, 39`).
  6. Chưa kiểm tra các hằng số màu dây `WIRE_COLORS`.
- **Chiến lược khẳng định (Assertion Strategy)**:
  - Khẳng định `validateVoltage(3.300)` trả về `safe: true`, `validateVoltage(3.301)` trả về `safe: false, code: 'OVERVOLTAGE_WARNING'`.
  - Khẳng định vòng lặp trên `[34, 35, 36, 39]` đều trả về `valid: false, code: 'PIN_CANNOT_BE_OUTPUT'`.
  - Khẳng định tính dòng LED:
    - $R \le 0 \implies \text{isBurned: true, state: 'COMPONENT_BURNED_STATE'}$.
    - $V_{GPIO} \le V_{forward} \implies \text{currentMa: 0, state: 'OFF_STATE'}$.
    - $I = 20.0\text{mA} \implies \text{NORMAL_OPERATION, isSafe: true}$.
    - $I = 40.0\text{mA} \implies \text{STRESSED_OPERATION, isSafe: false, isBurned: false}$.
    - $I = 45.0\text{mA} \implies \text{COMPONENT_BURNED_STATE, isBurned: true}$ (Tiêu diệt `mutant-1` ngay tại ngưỡng dòng!).
  - Khẳng định toàn bộ 6 chân ADC1 đọc được khi WiFi bật; toàn bộ 10 chân ADC2 bị khóa và trả `ADC2_LOCKED_BY_WIFI`.
  - Khẳng định toàn bộ 10 chân Touch chuyển giá trị từ $\ge 80$ xuống $< 40$ khi chạm.

#### RULE-003: Mô Phỏng Band A (Kid Spark: 5–8 Tuổi) (BandASimulator)
- **Thiếu sót hiện tại**:
  1. Chưa kiểm tra làm tròn bước nhảy $50\text{ms}$ của đèn nhấp nháy ở các điểm lân cận ($120\text{ms} \to 100\text{ms}$, $130\text{ms} \to 150\text{ms}$, $1501\text{ms} \to 1500\text{ms}$).
  2. Chưa kiểm tra bảng màu đèn nháy `getLevelCrossingColors()` (`['#ff3b30', '#ffcc00', '#34c759']`).
  3. Cửa tủ lạnh (Fridge Guard): Chưa kiểm tra kẹp góc $[-10^\circ, 120^\circ] \to [0^\circ, 90^\circ]$, và điểm biên nghiêm ngặt $\theta = 12^\circ$ (không vi phạm) vs $\theta = 12.1^\circ$ (vi phạm). (Tiêu diệt `mutant-1`).
  4. Còi báo xe cứu hỏa: Chưa kiểm tra chu kỳ điều hòa tại các mốc thời gian $0\text{ms} (800\text{Hz})$, $400\text{ms} (1200\text{Hz})$, $800\text{ms} (800\text{Hz})$, $1200\text{ms} (400\text{Hz})$, $1600\text{ms} (800\text{Hz})$.
  5. Đàn Piano cảm ứng: Chưa đối soát đủ 8 nốt nhạc C4 ($261.63\text{Hz}$) đến C5 ($523.25\text{Hz}$).
  6. Chưa có bài test cho Đèn ngủ ma thuật (Mood Lamp): hòa trộn RGB, kẹp $[0, 255]$, định dạng hex `#rrggbb` và CSS `rgb(...)`.
- **Chiến lược khẳng định (Assertion Strategy)**:
  - Khẳng định `checkFridgeAlarm(12, 10000, 3000).isViolating === false`.
  - Khẳng định `checkFridgeAlarm(12.1, 1000, 3000).isViolating === true && isAlarming === false`.
  - Khẳng định `checkFridgeAlarm(45, 3001, 3000).isAlarming === true && alarmFreq === 2400`.
  - Khẳng định `getMoodLampColor(300, -50, 128.8)` trả về `{ r: 255, g: 0, b: 129, hex: '#ff0081', css: 'rgb(255, 0, 129)' }`.

#### RULE-004: Lập Trình Khối & Công Thức Mô Phỏng Band B (BandBSimulator)
- **Thiếu sót hiện tại**:
  1. Neopixel: Chưa kiểm tra 3 chế độ màu (`blue`, `traffic`, `rainbow`).
  2. Neopixel: Chưa kiểm tra chuyển mức số đèn tại các giá trị biên của ADC ($341 \to 0$, $342 \to 1$, $2047 \to 5$, $2048 \to 6$).
  3. Cảm biến siêu âm: Chưa kiểm tra kẹp khoảng cách dưới $2\text{cm}$ và trên $400\text{cm}$, công thức $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$, và tỷ lệ thanh đo `progressRatio`.
  4. Rào chắn laser Servo: Chưa kiểm tra góc trung gian $45^\circ$ ở $250\text{ms}$, thời gian giữ $3000\text{ms}$ tại $90^\circ$, và quá trình đóng về $0^\circ$.
  5. Động cơ DC: Chưa kiểm tra kẹp duty cycle và vận tốc góc $\omega = (\text{rpm} \cdot 2\pi) / 60\text{ rad/s}$.
  6. Chưa kiểm tra AST Compiler xuất mã C++ (`compileBlocksToCpp`).
- **Chiến lược khẳng định (Assertion Strategy)**:
  - Khẳng định Neopixel: ADC 341 cho 0 LED, ADC 342 cho 1 LED; mode traffic chia đúng 3 dải xanh ($0..3$), vàng ($4..7$), đỏ ($8..11$).
  - Khẳng định siêu âm: $d=1\text{cm} \to$ kẹp $2\text{cm}$, $d=450\text{cm} \to$ kẹp $400\text{cm}$.
  - Khẳng định Servo: FSM chuyển đổi chính xác qua 4 trạng thái `CLOSED` $\to$ `OPENING` $\to$ `OPEN_HOLD` $\to$ `CLOSING` $\to$ `CLOSED`.

#### RULE-005: Tiến Trình Học Tập & Gamification (ProgressAndGamificationEngine)
- **Thiếu sót hiện tại**:
  1. Chưa kiểm tra phần trăm tiến trình ở các giá trị $N=1 (5\%)$, $N=19 (95\%)$, $N=20 (100\%)$.
  2. Chưa kiểm tra thưởng quiz lần đầu $+25\text{XP}$ bị từ chối khi chỉ đúng $2/3$ câu hoặc khi thi lại lần 2.
  3. Chưa kiểm tra logic chống cộng dồn XP (Anti-Repeat XP) khi học sinh hoàn thành lại bài học cũ.
  4. Chưa kiểm tra mở khóa toàn bộ 4 huy hiệu ("Blink Master", "Acoustic Wizard", "IoT Explorer", "Mechatronics Pro").
- **Chiến lược khẳng định (Assertion Strategy)**:
  - Khẳng định 5 bài hoàn thành $\to \lfloor (5/20) \times 100 \rfloor = 25\%$ (Tiêu diệt `mutant-3`).
  - Khẳng định hoàn thành bài 1 Band A $\to 50\text{XP}$, bài 2 Band B $\to 150\text{XP}$, bài 3 Band C $\to 300\text{XP}$ (Tiêu diệt `mutant-3`).
  - Khẳng định hoàn thành lại bài cũ trả về `newlyCompleted: false`, không tăng XP, không tăng độ dài mảng.

---

## 3. Bằng Chứng Thực Nghiệm Tiêu Diệt Mutant (Mutation Killing Proof)

Tệp xác thực kịch bản kiểm thử độc lập đã được khởi tạo và chạy trực tiếp tại:
`/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_m1_1/test_runner_validation.mjs`

### Kết quả chạy thực nghiệm trên cả 4 mục tiêu:
```
Target: [primary] (src/engine.js)
  Total Tests : 27
  Passed      : 27
  Failed      : 0
  Verdict: PASS 100% (CLEAN)

Target: [mutant-1] (clean-room/mutants/mutant-1/engine.js)
  Total Tests : 27
  Passed      : 24
  Failed      : 3
  Failures:
    - RULE-002: all input-only pins (34, 35, 36, 39) reject OUTPUT mode: Pin 39 must reject OUTPUT
    - RULE-002: Ohm law calculations, R=0 burnout, stressed 20-40mA, and >40mA burnout (45mA check)
    - RULE-003: Fridge Guard boundary <=12° (safe) vs >12° (violating), grace period
  Verdict: KILLED (3 assertion failures)

Target: [mutant-2] (clean-room/mutants/mutant-2/engine.js)
  Total Tests : 27
  Passed      : 25
  Failed      : 2
  Failures:
    - RULE-001: defaults to band-b when storage is empty or invalid: 'band-a' !== 'band-b'
    - RULE-001: enforces capabilities contract for all 3 age bands: showCodeEditor true !== false
  Verdict: KILLED (2 assertion failures)

Target: [mutant-3] (clean-room/mutants/mutant-3/engine.js)
  Total Tests : 27
  Passed      : 23
  Failed      : 4
  Failures:
    - RULE-005: progress percentage floor((N/20)*100) and aria attributes: 5 !== 0
    - RULE-005: XP awards by band (+50 A, +100 B, +150 C): 10 !== 50
    - RULE-005: first-try quiz bonus (+25XP) only when 3/3 on first try: 40 !== 125
    - RULE-005: anti-repeat XP logic: 15 !== 100
  Verdict: KILLED (4 assertion failures)
```

**Nhận xét**: Bộ test đề xuất không chỉ tiếp tục tiêu diệt cả 3 mutants mà còn **tăng số lượng điểm phát hiện lỗi**:
- `mutant-1`: Tăng từ 2 lên 3 lỗi phát hiện (bổ sung bẫy dòng điện $45\text{mA}$).
- `mutant-3`: Tăng từ 3 lên 4 lỗi phát hiện (bổ sung bẫy chống lặp XP).

---

## 4. Caveats (Các Điểm Lưu Ý & Giới Hạn)

1. **Ranh giới thực thi Read-Only**: Agent này là Explorer nên không trực tiếp chỉnh sửa `tests/spec.test.js`. Toàn bộ mã nguồn đề xuất được cung cấp hoàn chỉnh ở Mục 5 để Builder / Tester áp dụng.
2. **Tương thích `clean-room/verify-mutants.mjs`**: Harness này thực thi lệnh `node --test tests/spec.test.js` với biến môi trường `ENGINE_PATH`. Do đó, các bài test mở rộng cho RULE-001..RULE-005 bắt buộc phải được ghép vào `tests/spec.test.js`.
3. **Môi trường DOM**: Phương thức `_syncDom()` trong `AgeBandController` có điều kiện kiểm tra an toàn `if (typeof document !== 'undefined')`. Trong Node.js thuần, kiểm thử logic bộ điều khiển chạy trơn tru với `createMockStorage()`. Để kiểm tra việc đồng bộ thuộc tính trên DOM thực, cần sử dụng mock nhẹ hoặc chờ JSDOM ở Milestone 3.

---

## 5. Conclusion & Đề Xuất Mã Nguồn Cụ Thể (Actionable Test Code)

Dưới đây là mã nguồn hoàn chỉnh sẵn sàng ghép vào `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js` để thay thế hoặc mở rộng các suite tương ứng từ RULE-001 đến RULE-005:

```javascript
/* =========================================================================
   EXPANDED MILESTONE 1 TEST SUITES: RULE-001 THROUGH RULE-005
   ========================================================================= */

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
```

---

## 6. Verification Method (Phương Pháp Xác Minh Độc Lập)

1. **Kiểm tra bộ xác thực Milestone 1**:
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   node .agents/teamwork/explorer_m1_1/test_runner_validation.mjs
   ```
   *Tiêu chí đạt*:
   - Primary: `PASS 100% (27/27 passed)`.
   - Mutant 1: `KILLED (3 failures)`.
   - Mutant 2: `KILLED (2 failures)`.
   - Mutant 3: `KILLED (4 failures)`.
   - Mã thoát: `0`.

2. **Kiểm tra bộ kiểm định đột biến Clean-Room chính thức**:
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Tiêu chí đạt*:
   - Primary Build: Pass 100% (Mã thoát `0`).
   - Cả 3 mutants đều bị tiêu diệt (Mã thoát `0`).

3. **Điều kiện mất hiệu lực (Invalidation Conditions)**:
   - Nếu bất kỳ bài test nào trong số 27 bài test mới bị thất bại trên bản chính `src/engine.js`.
   - Nếu bất kỳ bản đột biến nào trong số `mutant-1`, `mutant-2`, `mutant-3` sống sót (`SURVIVED MUTANT`).
