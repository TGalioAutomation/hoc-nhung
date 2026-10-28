# BÁO CÁO BÀN GIAO HOÀN THÀNH MILESTONE 1 (M1 HANDOFF REPORT)
## Mở Rộng Bộ Kiểm Thử Đặc Tả Ranh Giới (RULE-001..RULE-010) & Giáo Trình 20 Bài Học, 60 Quizzes

- **Agent:** `worker_m1` (Milestone 1 Test Suite Worker)
- **Thư mục làm việc:** `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/worker_m1`
- **Mã hội thoại Parent:** `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Thời gian hoàn thành:** 2026-10-28T04:49:00Z
- **Loại Handoff:** Hard Handoff (Hoàn thành 100% nhiệm vụ được giao)

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1. Các Tệp Tin Đã Được Chỉnh Sửa & Khởi Tạo
1. **`package.json`**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/package.json`
   - Cập nhật mục `"scripts"`:
     ```json
     "scripts": {
       "test": "node --test \"tests/*.test.js\"",
       "test:spec": "node --test tests/spec.test.js",
       "test:lessons": "node --test tests/lessons.test.js",
       "test:mutants": "node clean-room/verify-mutants.mjs",
       "start": "npx serve ."
     }
     ```

2. **`tests/lessons.test.js`**:
   - Tệp tin mới khởi tạo: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/lessons.test.js` (26 test cases qua 6 suites).
   - Bao phủ toàn diện:
     * Suite 1: Lesson Schema & Metadata Invariants (20 bài học tuần tự 1..20, unique IDs, bi-lingual title/desc, ageBands, components/parts, simConfig, defaultParams).
     * Suite 2: Dual Code Validation (C++ & MicroPython code strings $\ge 20$ chars, C++ structure setup/loop/handlers, MicroPython imports/functions, GPIO configuration).
     * Suite 3: Hardware Pinout & Wiring Catalog Validation (ESP32_PINS_30, ESP32_PINS_38 với pin 37 là GPIO 0, WIRE_COLORS theo RULE-002, hợp lệ hóa các GPIO và kiểm tra chân 34, 35, 36, 39 không bao giờ làm OUTPUT).
     * Suite 4: 60 Quiz Questions Comprehensive Verification (đúng 60 câu hỏi cho 20 bài học, chuỗi câu hỏi rõ ràng $\ge 10$ ký tự, 3-4 lựa chọn duy nhất, chỉ số đáp án đúng nằm trong dải $[0, \text{options.length}-1]$, giải thích sư phạm chi tiết $\ge 15$ ký tự).
     * Suite 5: Parameter Interpolation & Template Verification (toàn bộ 23 thẻ `{{paramKey}}` khớp với `defaultParams`, `substituteParams` giải quyết sạch sẽ 100% không còn thẻ thừa).
     * Suite 6: Pedagogical Alignment Across Age-Bands (Band A story cards, Band B blocks, Band C schematics với rails).

3. **`tests/spec.test.js`**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js` (mở rộng từ 37 lên 46 test cases chuyên sâu, 10 suites).
   - Bao phủ các điểm biên số học, điện học và máy trạng thái:
     * **RULE-001**: Khởi tạo mặc định `band-b` kể cả khi storage có giá trị rác hoặc rỗng; ném ngoại lệ khi truyền band không hợp lệ; lưu và khôi phục hợp lệ; kiểm tra nghiêm ngặt 8 cờ năng lực trên cả 3 band; kích thước nút bấm tối thiểu: Band A $\ge 64\text{px}$, Band B $\ge 44\text{px}$, Band C $\ge 36\text{px}$; chống sập listener và hủy đăng ký listener.
     * **RULE-002**: Điểm biên điện áp $3.300\text{V}$ (an toàn, mã 'OK') vs $3.301\text{V}$ (quá áp, mã 'OVERVOLTAGE_WARNING'); cấm chế độ `OUTPUT` trên tất cả các chân chỉ đầu vào `[34, 35, 36, 39]` (với cả số, chuỗi, và chữ thường); tính toán dòng điện LED theo Định luật Ohm: $R=0 \implies$ cháy linh kiện (`COMPONENT_BURNED_STATE`), $V_{gpio} \le V_{fwd} \implies 0\text{mA}$ (`OFF_STATE`), $I \le 20.0\text{mA}$ (`NORMAL_OPERATION`), $I = 40.0\text{mA}$ (`STRESSED_OPERATION`), $I = 45.0\text{mA} > 40\text{mA} \implies$ cháy linh kiện (`COMPONENT_BURNED_STATE` - tiêu diệt mutant-1); kiểm tra toàn bộ 6 chân ADC1 hoạt động khi WiFi bật vs toàn bộ 10 chân ADC2 bị khóa bởi WiFi; kiểm tra toàn bộ 10 chân cảm ứng điện dung touch và từ chối chân non-touch; hằng số màu dây `WIRE_COLORS`.
     * **RULE-003**: Kẹp chu kỳ nhấp nháy đèn Level Crossing trong $[100\text{ms}, 1500\text{ms}]$ với bước $50\text{ms}$ và bảng màu đèn; ranh giới góc mở cửa tủ lạnh Fridge Guard $\le 12^\circ$ (an toàn) vs $> 12^\circ$ (vi phạm) kèm kiểm tra thời gian ân hạn $3000\text{ms}$, kích hoạt còi $2400\text{Hz}$ tại $3001\text{ms}$; quét còi báo động cứu hỏa điều hòa trong $[400\text{Hz}, 1200\text{Hz}]$ chu kỳ $1600\text{ms}$; đối soát 8 nốt đàn piano C4..C5; hòa trộn RGB Mood Lamp kẹp $[0, 255]$ kèm định dạng hex/css; ngưỡng cảm biến quang trở Đèn ngủ Night Light (mặc định 50%).
     * **RULE-004**: Neopixel 12-LED công thức số nguyên $N_{lit} = \lfloor (ADC/4095) \times 12 \rfloor$ với các điểm biên $341 \to 0$, $342 \to 1$, $2047 \to 5$, $2048 \to 6$, $4095 \to 12$; cả 3 bảng màu Neopixel: blue, traffic (xanh, vàng, đỏ), rainbow; cảm biến siêu âm kẹp $[2\text{cm}, 400\text{cm}]$, công thức $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$, `progressRatio` và chuỗi hiển thị OLED; FSM Servo rào chắn laser qua chu trình đầy đủ `CLOSED` $\to$ `OPENING` $\to$ `OPEN_HOLD` $\to$ `CLOSING` $\to$ `CLOSED`; tính toán RPM tuyến tính từ duty PWM $(0..100\%)$.
     * **RULE-005**: Tính phần trăm tiến trình $\lfloor (N/20) \times 100 \rfloor\%$, chuỗi nhãn $N/20$, và thuộc tính ARIA; cộng điểm kinh nghiệm XP theo từng band (+50 A, +100 B, +150 C); thưởng quiz lần đầu (+25XP) khi đạt đúng 3/3 câu ở lần thi đầu; chống cộng lặp XP khi học sinh học lại bài cũ; mở khóa 4 huy hiệu ("Blink Master", "Acoustic Wizard", "IoT Explorer", "Mechatronics Pro"); khôi phục cài đặt tiến trình `resetProgress`.
     * **RULE-006**: Máy trạng thái nạp code FSM `idle` $\to$ `uploading` $\to$ `running` $\to$ `idle` với độ trễ $600\text{ms} + 600\text{ms}$, bắt buộc trạng thái trung gian tức thời là `'uploading'` (tiêu diệt mutant-2); chuỗi thông điệp biên dịch C++ (`Compiling sketch…`) vs MicroPython (`Parsing MicroPython script…`); thay thế đa tham số, kiểm tra giá trị falsy $0$ (duty = 0), giữ nguyên tham số không cung cấp, và tham số trùng lặp; truy vết dòng mã thực thi với lớp `.code-line.is-running` và xóa khi dừng; kẹp chiều cao cửa sổ Serial Monitor $[56\text{px}, 360\text{px}]$, giá trị hỏng rơi về mặc định $92\text{px}$, và thao tác nhấp đúp phục hồi $92\text{px}$.
     * **RULE-007**: Điểm cuối SoftAP 192.168.1.42 `/toggle` đảo trạng thái đèn LED và trả mã HTTP 200; lệnh Bluetooth `"ON"`, `"OFF"`, `"DIM"`, không phân biệt hoa thường/khoảng trắng, giữ nguyên trạng thái khi nhận `"DIM"`, và từ chối lệnh lạ với mã lỗi `ERROR: UNKNOWN COMMAND`; gói tin ESP-NOW đúng $250\text{ bytes}$ thành công vs $251\text{ bytes}$ bị từ chối với lỗi `PAYLOAD_EXCEEDS_250_BYTES`; mô hình suy hao sigmoidal vượt quá $100\text{m}$ ($0\%$ tại $\le 100\text{m}$, $50\%$ tại $125\text{m}$, $\ge 80\%$ tại $140\text{m}$, $\ge 90\%$ tại $150\text{m}$).
     * **RULE-008**: Các điểm ngưỡng chính xác của độ trễ máy bơm: $20.0\%$ (bật), $20.1\%$ (giữ nguyên trạng thái trước), $50.0\%$ (giữ nguyên trạng thái trước), $89.9\%$ (giữ nguyên trạng thái trước), $90.0\%$ (tắt) - tiêu diệt mutant-3; chu trình bảo vệ bàn phím 4x3: nhập buffer, xóa bằng `*`, giới hạn 4 số, mở khóa thành công, 3 lần sai kích hoạt khóa $10\text{s}$, từ chối khi đang khóa, và tự phục hồi sau $10\text{s}$; vùng chết pin mặt trời $\delta = 15$, bước quay $+1^\circ$ khi $\Delta L = +16$ và $-1^\circ$ khi $\Delta L = -16$, kẹp góc servo $[10^\circ, 170^\circ]$; biến đổi tọa độ cực sang Descartes cho các góc $0^\circ, 45^\circ, 90^\circ, 180^\circ$ và tỷ lệ co giãn; động cơ bước vít me độ phân giải $0.04\text{mm/bước}$ ($8\text{mm}/200$), kẹp hành trình $[0, 200\text{mm}]$.
     * **RULE-009 & RULE-010**: Tích lũy dịch chuyển camera pan, kẹp thu phóng zoom $[0.4, 3.0]$, xoay $90^\circ$ theo modulo $360^\circ$ ($0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 0^\circ$ và $-90^\circ \to 270^\circ$), và khôi phục reset; sơ đồ mạch điện nổi đóng/mở đồng bộ `aria-pressed`, kẹp kích thước $[200..600]\text{px} \times [140..500]\text{px}$; toàn bộ 5 cờ cài đặt môi trường (`labels`, `grid`, `autoRotate`, `sound`, `reducedMotion`), lưu trữ và phục hồi từ JSON trong `localStorage`; hệ số tốc độ tween khi giảm chuyển động ($0.05$ vs $1.0$); điểm ngắt giao diện thu gọn responsive ($W < 1090\text{px}$ hoặc $H < 800\text{px}$).

### 1.2. Kết Quả Thực Thi Kiểm Thử Trực Tiếp (Verbatim Terminal Output)

1. **Lệnh `npm test`**:
   ```
   > esp32-kids-to-pro@1.0.0 test
   > node --test "tests/*.test.js"

   ▶ Curriculum Lessons Suite (tests/lessons.test.js)
     ✔ Suite 1: Lesson Schema & Metadata Invariants (1.78ms)
     ✔ Suite 2: Dual Code Validation (C++ & MicroPython) (0.61ms)
     ✔ Suite 3: Hardware Pinout & Wiring Catalog Validation (0.44ms)
     ✔ Suite 4: 60 Quiz Questions Comprehensive Verification (0.34ms)
     ✔ Suite 5: Parameter Interpolation & Template Verification (0.38ms)
     ✔ Suite 6: Pedagogical Alignment Across Age-Bands (0.18ms)
   ✔ Curriculum Lessons Suite (tests/lessons.test.js) (4.04ms)

   ▶ RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi (AgeBandController) (1.71ms)
   ▶ RULE-002: Ma Trận Sơ Đồ Chân & An Toàn Điện (Esp32SafetyEngine) (0.75ms)
   ▶ RULE-003: Mô Phỏng Band A (Kid Spark: 5–8 Tuổi) (0.67ms)
   ▶ RULE-004: Mô Phỏng Band B (Block Explorer: 9–13 Tuổi) (0.34ms)
   ▶ RULE-005: Hệ Thống Tiến Trình & Gamification (ProgressAndGamificationEngine) (0.39ms)
   ▶ RULE-006: Code Execution Engine & Serial Monitor (Expanded) (2404.29ms)
   ▶ RULE-007: Mạng Không Dây IoT & ESP-NOW (Expanded) (0.36ms)
   ▶ RULE-008: Cơ Điện Tử & Robot STEM (Expanded) (0.40ms)
   ▶ RULE-009 & RULE-010: Viewport, a11y & Environment (Expanded) (0.39ms)
   ▶ Curriculum Matrix & Pinout Catalog Verification (0.12ms)

   ℹ tests 72
   ℹ suites 17
   ℹ pass 72
   ℹ fail 0
   ℹ cancelled 0
   ℹ skipped 0
   ℹ todo 0
   ℹ duration_ms 2458.4ms
   Exit Code: 0
   ```

2. **Lệnh `npm run test:mutants` (`node clean-room/verify-mutants.mjs`)**:
   ```
   ================================================================================
     CLEAN-ROOM 3-MUTANT VERIFICATION HARNESS (Flash Tier QA Protocol)
   ================================================================================
   Root Directory: /Users/apexdev/Desktop/hoc-nhung-cho-be

   ▶ Executing test suite against [primary]: Primary Clean-Room Build...
     Exit Code : 0
     Passed    : 46 tests
     Failed    : 0 tests
     Duration  : 2499ms
     Verdict   : VERIFIED PASS (100%)

   ▶ Executing test suite against [mutant-1]: Mutant 1 (Boundary / Off-by-One)...
     Exit Code : 1
     Passed    : 43 tests
     Failed    : 3 tests
     Duration  : 2500ms
     Verdict   : KILLED (3 assertion failures)

   ▶ Executing test suite against [mutant-2]: Mutant 2 (Invariant / State-Machine Bypass)...
     Exit Code : 1
     Passed    : 43 tests
     Failed    : 3 tests
     Duration  : 99ms
     Verdict   : KILLED (3 assertion failures)

   ▶ Executing test suite against [mutant-3]: Mutant 3 (Hysteresis & Gamification Corrupted)...
     Exit Code : 1
     Passed    : 41 tests
     Failed    : 5 tests
     Duration  : 2501ms
     Verdict   : KILLED (5 assertion failures)

   ================================================================================
     MUTATION TESTING AUDIT MATRIX
   ================================================================================
   Target       | Status     |  Pass |  Fail |  Exit | Verdict
   --------------------------------------------------------------------------------
   primary      | PASS       |    46 |     0 |     0 | VERIFIED PASS (100%)
   mutant-1     | FAIL       |    43 |     3 |     1 | KILLED (3 assertion failures)
   mutant-2     | FAIL       |    43 |     3 |     1 | KILLED (3 assertion failures)
   mutant-3     | FAIL       |    41 |     5 |     1 | KILLED (5 assertion failures)
   ================================================================================
   ✔ PROTOCOL VERIFIED: Primary build passed 100% and ALL 3 mutants were KILLED.
     Clean-Room Mutation Score: 100% (3/3 mutants killed, 0 survivors).
   Exit Code: 0
   ```

---

## 2. Logic Chain (Chuỗi Lập Luận Kỹ Thuật)

1. **Từ Yêu Cầu R1 & Đề Xuất Explorer đến Cấu Trúc Kiểm Thử**:
   - *Bước 1 (Obs 1.1.3 & 1.2.2)*: `verify-mutants.mjs` thực thi `node --test tests/spec.test.js` kèm biến môi trường `ENGINE_PATH`. Việc mở rộng toàn bộ 10 quy tắc hành vi trong `tests/spec.test.js` cho phép harness kiểm tra trực tiếp và đánh giá điểm đột biến cho từng thay đổi trong logic `engine.js`.
   - *Bước 2 (Obs 1.2.2 - Mutant 1)*: Mutant-1 cố tình tăng dòng cực đại $I_{max}$ lên $50\text{mA}$, bỏ sót chân $39$ khỏi `INPUT_ONLY_PINS`, và thay đổi ngưỡng góc tủ lạnh $\ge 12^\circ$. Bài test mở rộng đã khẳng định:
     * Chân 39 từ chối `OUTPUT`.
     * Dòng $45\text{mA}$ phải gây cháy (`COMPONENT_BURNED_STATE`), phát hiện ngay sai lệch $50\text{mA}$.
     * Góc $12^\circ$ không vi phạm, phát hiện ngay sai lệch $\ge 12^\circ$.
     $\implies$ Kết quả: Mutant-1 thất bại ở đúng 3 khẳng định và bị KILLED (Exit Code 1).
   - *Bước 3 (Obs 1.2.2 - Mutant 2)*: Mutant-2 gán band mặc định là `band-a`, rò rỉ trình biên tập mã cho Band A, và bỏ qua giai đoạn FSM upload để nhảy thẳng sang `running`. Bài test mở rộng đã khẳng định:
     * Band mặc định khi storage trống hoặc chứa chuỗi lạ là `band-b`.
     * Năng lực của Band A có `showCodeEditor === false`.
     * Trạng thái ngay khi gọi `startUpload()` phải là `'uploading'` và phát thông điệp log tương ứng.
     $\implies$ Kết quả: Mutant-2 thất bại ở đúng 3 khẳng định và bị KILLED (Exit Code 1).
   - *Bước 4 (Obs 1.2.2 - Mutant 3)*: Mutant-3 tính sai XP (+10/+15/+20), tính sai phần trăm tiến trình (`Math.ceil + 5`), và phá hỏng biến nhớ trạng thái rơ-le máy bơm (`let pumpState = false;`). Bài test mở rộng đã khẳng định:
     * Tiến trình 5 bài hoàn thành phải bằng đúng $25\%$ (`Math.floor((5/20)*100)`).
     * Điểm thưởng XP cho Band A/B/C là 50/100/150 và quiz 3/3 lần đầu là +25XP.
     * Vùng trễ $20.1\%$, $50.0\%$, $89.9\%$ với `previousPumpState = true` bắt buộc duy trì `pumpActive: true`.
     $\implies$ Kết quả: Mutant-3 thất bại ở đúng 5 khẳng định và bị KILLED (Exit Code 1).

2. **Từ Yêu Cầu Giáo Trình Đến Tách Biệt Kiểm Thử Độc Lập**:
   - *Bước 5 (Obs 1.1.2 & 1.2.1)*: `tests/lessons.test.js` kiểm tra toàn bộ 20 bài học, 60 câu hỏi trắc nghiệm, và mã Arduino C++ / MicroPython. Việc tách biệt tệp này đảm bảo tính module hóa cao:
     * `clean-room/verify-mutants.mjs` chạy nhanh gọn trong ~2.5s (do chỉ nạp `tests/spec.test.js`).
     * `npm test` tự động quét tất cả tệp `tests/*.test.js`, chạy đồng thời cả 72 tests chỉ trong 2.45s.

---

## 3. Caveats (Các Điểm Lưu Ý & Giới Hạn)

1. **Tuân Thủ Clean-Room Tuyệt Đối**:
   - Trong toàn bộ quá trình thực hiện, tuyệt đối không truy cập hoặc đọc tệp `clean-room/SPEC.md` hoặc các tệp trong `clean-room/.forbidden-paths`. Tất cả các ca kiểm thử đều được xây dựng từ `clean-room/SPEC.approved.md` và mã nguồn hiện có.
2. **Thuộc Tính Linh Kiện (`parts` vs `components`)**:
   - Dữ liệu gốc trong `src/lessons.js` sử dụng khóa `parts: [...]`. Bộ test trong `tests/lessons.test.js` truy xuất theo mẫu mềm dẻo: `const components = lesson.parts || lesson.components;` để tương thích hoàn toàn nếu đội Builder ở Milestone 2 có bổ sung getter alias.
3. **Phạm Vi Sở Hữu Tệp Tin (Write Ownership)**:
   - Worker này chỉ sửa đổi và tạo mới đúng các tệp được phân công:
     * `package.json`
     * `tests/spec.test.js`
     * `tests/lessons.test.js`
     * `.agents/teamwork/worker_m1/*`
   - Không can thiệp vào `src/app.js` (thuộc sở hữu của Milestone 2 Builder).

---

## 4. Conclusion (Kết Luận & Trạng Thái Hoàn Thành)

Milestone 1 Test Suite Expansion đã hoàn thành xuất sắc và vượt chỉ tiêu:
- Toàn bộ 10 quy tắc hành vi (`RULE-001` qua `RULE-010`) được kiểm thử chặt chẽ với 46 test cases chuyên sâu.
- Toàn bộ 20 bài học, 60 câu đố trắc nghiệm và 23 vị trí tham số nội suy được xác thực 100% trong `tests/lessons.test.js`.
- Cấu hình `package.json` chuẩn hóa với 4 script: `test`, `test:spec`, `test:lessons`, `test:mutants`.
- `npm test` đạt `72/72 PASS` (100% Pass, 0 failures).
- `node clean-room/verify-mutants.mjs` đạt `100% Mutation Score` (Primary PASS 100%, 3/3 mutants KILLED).

---

## 5. Verification Method (Phương Pháp Tự Kiểm Tra Độc Lập)

Bất kỳ reviewer, auditor hoặc orchestrator nào cũng có thể kiểm tra độc lập bằng các lệnh sau từ thư mục gốc của dự án:

1. **Chạy toàn bộ test suite dự án**:
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   npm test
   ```
   *Tiêu chí đạt:* Exit code `0`, 72 tests passed, 0 failures.

2. **Chạy kiểm thử đặc tả và ranh giới**:
   ```bash
   npm run test:spec
   ```
   *Tiêu chí đạt:* Exit code `0`, 46 tests passed, 0 failures.

3. **Chạy kiểm thử giáo trình 20 bài học và 60 quiz**:
   ```bash
   npm run test:lessons
   ```
   *Tiêu chí đạt:* Exit code `0`, 26 tests passed, 0 failures.

4. **Chạy kiểm thử bộ kiểm định đột biến Clean-Room**:
   ```bash
   npm run test:mutants
   ```
   *Tiêu chí đạt:* Exit code `0`, Primary Build PASS 100%, Mutant 1 KILLED (3 failures), Mutant 2 KILLED (3 failures), Mutant 3 KILLED (5 failures), Mutation Score = 100%.

5. **Điều kiện mất hiệu lực (Invalidation Conditions)**:
   - Nếu `npm test` có bất kỳ bài test nào bị thất bại (Exit code $\ne 0$).
   - Nếu bất kỳ bản đột biến nào trong số `mutant-1`, `mutant-2`, `mutant-3` sống sót (`SURVIVED MUTANT`).
   - Nếu có bất kỳ bài học nào trong 20 bài học thiếu `id`, `quiz` ($<3$ câu) hoặc có thẻ `{{param}}` chưa được thay thế.
