# BÁO CÁO ĐẶC TẢ KỸ THUẬT TOÀN DIỆN (SPECIFICATION MINING REPORT)
**Nền Tảng Web Giáo Dục Lập Trình Nhúng & ESP32 Phân Tầng Nhận Thức (5–20 Tuổi)**

- **Người thực hiện**: `spec_miner_1` (Specification Miner)
- **Nhiệm vụ điều phối**: Khai phá và tài liệu hóa chi tiết toàn bộ đặc tả kỹ thuật từ tài liệu Clean-Room đã phê duyệt (`clean-room/SPEC.approved.md`), bao gồm 10 quy tắc hành vi (`RULE-001` đến `RULE-010`), 20 bài học phần cứng, 3 phân tầng nhận thức độ tuổi, và các yêu cầu tương tác giao diện người dùng.
- **Ngày lập**: 2026-10-28
- **Mã định danh phiên**: `f1ca577c-f9b8-4d2d-b767-c59f20153321`

---

## 1. Observation (Quan Sát Trực Tiếp)

1. **Tài liệu nguồn đặc tả phê duyệt**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/SPEC.approved.md` (253 dòng, 33,395 bytes).
   - Đặc tả quy định toàn bộ 10 quy tắc kỹ thuật hộp đen (`RULE-001` đến `RULE-010`) kèm ma trận phân bổ 20 dự án bài học tuần tự.
   - Tuân thủ nguyên tắc Clean-Room tuyệt đối: Không truy cập `clean-room/SPEC.md` hoặc bất kỳ tệp nào nằm trong danh mục cấm `.forbidden-paths`.

2. **Tài liệu yêu cầu gốc**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/ORIGINAL_REQUEST.md`.
   - Yêu cầu xác minh mở rộng phạm vi kiểm thử cho toàn bộ 10 quy tắc và 20 bài học, kiểm thử E2E DOM/UI qua 3 phân tầng nhận thức (`band-a`, `band-b`, `band-c`), và thực thi kiểm định đột biến 3-Mutant Harness (`clean-room/verify-mutants.mjs`).

3. **Hiện trạng kiểm thử đơn vị & ranh giới đặc tả**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js` (584 dòng, 21,618 bytes).
   - Lệnh thực thi: `npm test` (`node --test tests/spec.test.js`).
   - Kết quả quan sát trực tiếp:
     ```
     ℹ tests 37
     ℹ suites 10
     ℹ pass 37
     ℹ fail 0
     ℹ duration_ms 1257.84525
     Exited with code 0.
     ```

4. **Hiện trạng kiểm định đột biến (3-Mutant Verification Harness)**:
   - Tệp tin: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/verify-mutants.mjs` (159 dòng, 4,728 bytes).
   - Lệnh thực thi: `node clean-room/verify-mutants.mjs`.
   - Kết quả quan sát trực tiếp:
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

5. **Mã nguồn thực thi và danh mục bài học**:
   - `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/engine.js` (989 dòng): Định nghĩa các lớp lõi thuần tính toán, tất cả hằng số điện tử, mô hình toán học và máy trạng thái.
   - `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/lessons.js` (2,043 dòng): Định nghĩa danh mục 20 bài học hoàn chỉnh với mã Arduino C++, MicroPython, 3 câu hỏi trắc nghiệm kèm giải thích chi tiết, thông số linh kiện và cấu hình mô phỏng.
   - `/Users/apexdev/Desktop/hoc-nhung-cho-be/index.html` (293 dòng) & `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/styles.css` (1,115 dòng): Giao diện 3 cột thích ứng, 4 hộp thoại modal (`Pinout`, `Quiz`, `Schematic`, `Settings`), thanh kéo console nối tiếp, điểm thưởng XP/Badge và điểm ngắt responsive `compact`.

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Diễn Kỹ Thuật)

1. **Cơ chế Phân tầng Nhận thức (Cognitive Age-Banding) là trung tâm điều phối UI/UX**:
   - Từ `SPEC.approved.md § RULE-001`, nhu cầu tiếp nhận kiến thức thay đổi cơ bản giữa 3 độ tuổi: Trẻ 5–8 tuổi không thể đọc hiểu cú pháp C++ hay sơ đồ mạch phức tạp, nên bắt buộc ẩn code editor và pinout explorer, thay thế bằng Story Cards trực quan và phím bấm lớn $\ge 64\text{px}$; Nhóm 9–13 tuổi cần tư duy khối và thực hành lắp mạch breadboard nên mở Block Workspace và Pinout; Nhóm 14–20 tuổi hướng nghiệp Maker Pro nên trang bị IDE C++/MicroPython kép và Serial Monitor.
   - Ràng buộc: Chế độ mặc định bắt buộc là `"band-b"` khi `localStorage.getItem("user-age-band")` rỗng; sự kiện `ageBandChanged` phải được kích hoạt và đồng bộ thuộc tính DOM `data-age-band` trong $\le 50\text{ ms}$.

2. **Hợp đồng An toàn Điện tử (Electrical Safety Invariants) bảo vệ tư duy thực hành**:
   - ESP32 hoạt động ở mức logic danh định $3.3\text{ V}$. Bất kỳ kết nối $5.0\text{ V}$ nào vào GPIO đều phá hủy chip, do đó cần phát cảnh báo tức thời `OVERVOLTAGE_WARNING`.
   - Các chân `GPIO 34, 35, 36, 39` là chân chỉ đầu vào (input-only), không có trở kéo nội và không có tầng đệm lái đầu ra bán dẫn. Bất kỳ cấu hình `pinMode(pin, OUTPUT)` nào phải bị chặn tĩnh và trả mã lỗi `PIN_CANNOT_BE_OUTPUT`.
   - Định luật Ohm $I = (V_{GPIO} - V_{forward}) / R_{series}$: Dòng tối đa tuyệt đối là $40.0\text{ mA}$; dòng an toàn liên tục $\le 20.0\text{ mA}$. Nếu $R_{series} = 0\ \Omega$ hoặc $I > 40\text{ mA}$, linh kiện rơi vào trạng thái cháy nhiệt `COMPONENT_BURNED_STATE`.
   - Xung đột phần cứng Wi-Fi / ADC: Kênh ADC2 dùng chung mạch với bộ thu phát Wi-Fi SAR ADC, nên khi Wi-Fi bật, đọc ADC2 bị khóa và trả về lỗi `ADC2_LOCKED_BY_WIFI`, trong khi ADC1 (`GPIO 32, 33, 34, 35, 36, 39`) hoạt động độc lập và an toàn.

3. **Độ chính xác số học và máy trạng thái trong các mô hình mô phỏng**:
   - Band A: Bộ lọc chu kỳ đèn nháy kẹp chặt trong khoảng $[100, 1500]\text{ ms}$ bước nhảy $50\text{ ms}$; Chuông cửa tủ lạnh chỉ báo động còi $2400\text{ Hz}$ khi góc mở $\theta > 12^\circ$ VÀ thời gian mở vượt thời gian gia hạn $t > t_{grace}$ (khi $\theta \le 12^\circ$ không bao giờ báo động); Còi xe cứu hỏa dao động điều hòa trong $[400, 1200]\text{ Hz}$.
   - Band B: Đèn Neopixel 12-LED tính số đèn bật theo tỷ lệ nguyên sàn $N_{lit} = \lfloor (ADC / 4095) \times 12 \rfloor$; Thước siêu âm tính thời gian phản hồi $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$; Cổng rào chắn Laser có máy trạng thái đóng/mở với vận tốc $180^\circ/\text{s}$, giữ $3000\text{ ms}$ tại $90^\circ$ trước khi đóng về $0^\circ$.
   - Band C: Máy bơm nước sử dụng điều khiển trễ (Hysteresis): bật khi nước $\le 20\%$, tắt khi nước $\ge 90\%$, giữ nguyên trạng thái khi nằm giữa; Khóa mã số 4x3 có quy tắc bấm `*` để xóa bộ đệm, `#` để xác thực, và khóa nhập $10\text{s}$ sau 3 lần sai; Pin mặt trời hướng nắng có vùng chết $\delta = 15$ để tránh rung lắc cơ học; Động cơ bước vít me pitch $8\text{mm}$, 200 bước/vòng cho độ phân giải chính xác $0.04\text{ mm/bước}$.

4. **Trình thực thi mã nguồn & Màn hình nối tiếp**:
   - Vòng đời nạp mã nguồn: `idle` $\to$ `uploading` ($600\text{ ms}$ Compiling $\to 600\text{ ms}$ Connecting $\to$ Writing 100% / RTS reset) $\to$ `running`.
   - Màn hình nối tiếp có chiều cao lưu trữ độc lập, chặn dưới $56\text{px}$ và chặn trên $360\text{px}$, mặc định $92\text{px}$, nhấp đúp để khôi phục.

5. **Gamification & Khả năng tiếp cận**:
   - Tiến trình 20 bài học được tính tỷ lệ phần trăm nguyên: $\lfloor (N_{completed} / 20) \times 100 \rfloor\%$.
   - Điểm XP phân cấp: $+50\text{ XP}$ (Band A), $+100\text{ XP}$ (Band B), $+150\text{ XP}$ (Band C), thưởng $+25\text{ XP}$ khi đúng $3/3$ câu đố ngay lần đầu.
   - Giảm chuyển động (Reduced Motion): khi kích hoạt, tốc độ chuyển động giảm còn $0.05$ (gần như tức thời).
   - Điểm ngắt Responsive: Kích hoạt lớp CSS `compact` khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$.

---

## 3. Caveats (Ranh Giới & Giả Định)

1. **Tuân thủ Clean-Room**: Đặc tả này được trích xuất và chứng minh hoàn toàn từ `clean-room/SPEC.approved.md`, `tests/spec.test.js`, và mã nguồn đã được clean-room xây dựng (`src/engine.js`, `src/lessons.js`). Không một dòng mã nguồn nào từ app tham chiếu gốc hay tệp cấm bị rò rỉ.
2. **Web Audio API**: Trong môi trường kiểm thử CLI (Node.js test runner), đối tượng `window.AudioContext` và DOM được giả lập hoặc bỏ qua an toàn; khi chạy trên trình duyệt thực, âm thanh phụ thuộc vào cử chỉ tương tác đầu tiên của người dùng theo chính sách Autoplay của trình duyệt.
3. **Mô phỏng Wi-Fi & ESP-NOW**: Được thiết kế dưới dạng mô phỏng thời gian thực trên trình duyệt với các thông số trễ và xác suất mất gói theo mô hình hàm sigmoidal, không yêu cầu kết nối mạng vật lý.

---

## 4. Conclusion (Kết Luận Đánh Giá)

Hệ thống sở hữu kiến trúc đặc tả hoàn chỉnh, nhất quán và có tính đóng kín cao:
- Đã khai phá và chuẩn hóa đầy đủ **10/10 Quy tắc Kỹ thuật Hộp Đen** (`RULE-001` đến `RULE-010`) với đầy đủ các công thức toán lý, các ngưỡng số học chính xác, giới hạn an toàn điện áp/dòng điện và máy trạng thái hữu hạn.
- Đã khai phá và lập hồ sơ chi tiết cho toàn bộ **20/20 Bài học Phần cứng** thuộc ma trận chương trình đào tạo, bao gồm sơ đồ chân, linh kiện, mã nguồn kép C++/Python, 3 câu hỏi trắc nghiệm và tiêu chí hoàn thành.
- Ba phân tầng nhận thức (`band-a`, `band-b`, `band-c`) định hình rõ nét toàn bộ trải nghiệm người dùng từ giao diện, kích thước nút bấm, quyền mở tính năng đến hệ thống điểm thưởng XP và huy hiệu.
- Bộ kiểm định đột biến 3-Mutant Harness đã chứng minh năng lực phát hiện lỗi biên, lỗi máy trạng thái và lỗi tính toán tiến trình với tỷ lệ tiêu diệt đạt **100%**.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

1. **Thực thi bộ kiểm tra đặc tả và biên kiểm thử**:
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   npm test
   ```
   *Tiêu chí đạt*: 37/37 tests pass, 0 fail, exit code 0.

2. **Thực thi bộ kiểm định đột biến Clean-Room (3-Mutant Harness)**:
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Tiêu chí đạt*:
   - Primary Build: Pass 37/37 tests (Exit code 0).
   - Mutant 1 (Boundary/Off-by-one): KILLED (Fail $\ge 2$ tests, Exit code 1).
   - Mutant 2 (State-Machine/Invariant bypass): KILLED (Fail $\ge 3$ tests, Exit code 1).
   - Mutant 3 (Hysteresis/Gamification corrupted): KILLED (Fail $\ge 3$ tests, Exit code 1).
   - Mutation Score: 100%.

3. **Điều kiện mất hiệu lực (Invalidation Conditions)**:
   - Nếu bất kỳ chân input-only nào (`34, 35, 36, 39`) cho phép cấu hình `OUTPUT` mà không báo lỗi.
   - Nếu dòng tải $> 40\text{ mA}$ hoặc $R_{series} = 0\ \Omega$ không chuyển sang `COMPONENT_BURNED_STATE`.
   - Nếu chế độ mặc định khi chưa có dữ liệu lưu trữ không phải là `band-b`.
   - Nếu chuông tủ lạnh báo động khi góc cửa $\le 12^\circ$.
   - Nếu máy bơm tự động bị đảo trạng thái khi nước ở mức $50\%$ mà không có biến động vượt ngưỡng trễ.

---

## Features Discovered (Danh Mục Tính Năng Khai Phá Được)

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Age Band | Phân tầng nhận thức Band A (Kid Spark) | Chế độ 5–8 tuổi: Ẩn code editor & pinout; hiển thị Story Cards, nút bấm $\ge 64\text{px}$, âm thanh tức thời | `setBand('band-a')` | Theme tím ấm, ẩn code, hiện thẻ tranh | Ném `Error` nếu tên band không hợp lệ | `RULE-001`, `SPEC.approved.md:35` |
| 2 | Age Band | Phân tầng nhận thức Band B (Block Explorer) | Chế độ 9–13 tuổi mặc định: Kích hoạt Block Workspace kéo thả, mô phỏng breadboard, nút bấm $\ge 44\text{px}$ | `setBand('band-b')` | Theme xanh đại dương, hiện khối lệnh & pinout | Ném `Error` nếu band sai | `RULE-001`, `SPEC.approved.md:36` |
| 3 | Age Band | Phân tầng nhận thức Band C (Maker Pro) | Chế độ 14–20 tuổi: IDE kép Arduino C++/MicroPython, Pinout 30/38 pin, Serial Monitor, nút $\ge 36\text{px}$ | `setBand('band-c')` | Theme IDE tối, hiện code editor & serial monitor | Ném `Error` nếu band sai | `RULE-001`, `SPEC.approved.md:37` |
| 4 | Safety | Cảnh báo quá áp GPIO (Overvoltage) | Kiểm tra điện áp logic $V_{IO} \le 3.3\text{ V}$. Nghiêm cấm cắm trực tiếp $5.0\text{ V}$ vào chân GPIO | `voltage`, `pin` | `{ safe: true/false, code: 'OK' / 'OVERVOLTAGE_WARNING' }` | Trả cảnh báo nguy hiểm phá hủy chip | `RULE-002`, `SPEC.approved.md:46` |
| 5 | Safety | Khóa chân chỉ đầu vào (Input-Only Pins) | Cấm cấu hình `OUTPUT` trên các chân `GPIO 34, 35, 36, 39` | `pin`, `mode` (`INPUT` / `OUTPUT`) | `{ valid: true/false, code: 'OK' / 'PIN_CANNOT_BE_OUTPUT' }` | Trả lỗi tĩnh `PIN_CANNOT_BE_OUTPUT` | `RULE-002`, `SPEC.approved.md:47` |
| 6 | Safety | Giới hạn dòng điện & Cháy nhiệt linh kiện | Tính dòng theo định luật Ohm: $I_{max} = 40\text{ mA}$, $I_{safe} \le 20\text{ mA}$. Cháy khi $R=0$ hoặc $I > 40\text{ mA}$ | `vGpio`, `vForward`, `rSeries` | `currentMa`, `state` (`NORMAL`, `STRESSED`, `COMPONENT_BURNED_STATE`) | Chuyển sang màu xám đen và biểu tượng tia lửa | `RULE-002`, `SPEC.approved.md:48` |
| 7 | Safety | ADC 12-bit & Khóa ADC2 khi bật Wi-Fi | Đọc ADC 12-bit ($0..4095$). Chân ADC2 bị khóa khi Wi-Fi kích hoạt | `pin`, `voltage`, `wifiActive` | `{ success, value, code }` | Trả lỗi `ADC2_LOCKED_BY_WIFI` | `RULE-002`, `SPEC.approved.md:51` |
| 8 | Safety | Cảm ứng điện dung 10 chân (Touch Pins) | 10 kênh cảm ứng chạm (`GPIO 0,2,4,12,13,14,15,27,32,33`). Giá trị giảm mạnh khi chạm ngón tay | `pin`, `isTouched`, `idleThreshold` | `{ active, value, threshold }` | Trả `NOT_A_TOUCH_PIN` nếu pin không hỗ trợ | `RULE-002`, `SPEC.approved.md:52` |
| 9 | Sim Band A | Đèn nhấp nháy (Level Crossing) | Chu kỳ nháy kẹp chặt $[100, 1500]\text{ ms}$ bước $50\text{ ms}$, 3 màu đỏ/vàng/xanh | `rate` | `clampedRate`, màu sắc LED | Tự động làm tròn về bội số gần nhất của $50\text{ ms}$ | `RULE-003`, `SPEC.approved.md:65` |
| 10 | Sim Band A | Chuông tủ lạnh (Fridge Guard) | Báo động còi $2400\text{ Hz}$ khi góc mở $\theta > 12^\circ$ và thời gian mở vượt thời gian gia hạn $t_{grace}$ | `angleDeg`, `durationMs`, `graceMs` | `{ isViolating, isAlarming, alarmFreq, redBlink }` | Báo động đỏ và còi $2400\text{ Hz}$ | `RULE-003`, `SPEC.approved.md:66` |
| 11 | Sim Band A | Còi xe cứu hỏa (Siren Sound) | Âm tần quét hình sin dao động nghiêm ngặt trong khoảng $[400, 1200]\text{ Hz}$ chu kỳ $1600\text{ ms}$ | `elapsedMs`, `periodMs` | `freq` ($400\text{ Hz} .. 1200\text{ Hz}$) | Tự động giới hạn trong dải tần số an toàn | `RULE-003`, `SPEC.approved.md:67` |
| 12 | Sim Band A | Đàn Piano phím cảm ứng (Touch Piano) | 8 phím đồng cảm ứng ứng với nốt nhạc C4 ($261.63\text{ Hz}$) đến C5 ($523.25\text{ Hz}$), trễ $\le 20\text{ ms}$ | Phím chạm $1..8$ | Tần số âm thanh nốt nhạc chuẩn | Bỏ qua nếu chạm ngoài 8 phím | `RULE-003`, `SPEC.approved.md:68` |
| 13 | Sim Band A | Đèn ngủ đổi màu ma thuật (Mood Lamp) | Bánh xe màu chọn phối hợp 3 kênh màu RGB ($0..255$), cập nhật quả cầu khuếch tán | $R, G, B \in [0, 255]$ | Màu sắc HEX và chuỗi CSS `rgb(...)` | Kẹp giá trị trong dải hợp lệ $0..255$ | `RULE-003`, `SPEC.approved.md:69` |
| 14 | Sim Band A | Đèn tự động khi trời tối (Night Light) | Bật đèn vàng khi quang trở $LDR < \text{Threshold}$ (mặc định $50\%$), tắt khi $\ge 50\%$ | `ldrVal`, `threshold` | `{ ledOn: true/false, state: 'ON'/'OFF' }` | Đèn tắt khi môi trường sáng | `RULE-003`, `SPEC.approved.md:70` |
| 15 | Sim Band B | Vòng 12 LED Neopixel (WS2812B) | Đọc ADC biến trở xoay, tính số đèn sáng $N_{lit} = \lfloor (ADC/4095) \times 12 \rfloor$ với 3 chế độ màu | `adcVal`, `mode` (`blue`, `rainbow`, `traffic`) | `{ numLit, leds }` | Tự động kẹp ADC trong $[0, 4095]$ | `RULE-004`, `SPEC.approved.md:83` |
| 16 | Sim Band B | Thước đo khoảng cách siêu âm & OLED | Kéo thả vật cản $2..400\text{ cm}$, tính thời gian xung $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$, hiện OLED | `distanceCm` | `{ distanceCm, echoDurationUs, displayStr }` | Kẹp khoảng cách trong $[2, 400]\text{ cm}$ | `RULE-004`, `SPEC.approved.md:86` |
| 17 | Sim Band B | Cổng rào chắn Laser & Động cơ Servo | Khi tia laser bị chắn, FSM mở servo $0^\circ \to 90^\circ$ ($180^\circ/\text{s}$), giữ $3000\text{ ms}$, đóng về $0^\circ$ | `dtMs`, `isBlocked` | `{ state, angle }` | Đóng lại an toàn khi hết thời gian giữ | `RULE-004`, `SPEC.approved.md:89` |
| 18 | Sim Band B | Điều tốc động cơ DC qua cầu H | Xuất xung PWM duty $0..100\%$, tốc độ quay tỷ lệ tuyến tính với độ rộng xung | `dutyCyclePercent`, `maxRpm` | `{ rpm, angularVelocityRadS }` | Giới hạn duty cycle trong $[0, 100]\%$ | `RULE-004`, `SPEC.approved.md:90` |
| 19 | Gamification | Tiến trình học tập & Thanh đo a11y | Tính tỷ lệ hoàn thành $\lfloor (N_{completed} / 20) \times 100 \rfloor\%$, đồng bộ `aria-valuenow` | `lessonId`, `lessonNumber`, `band` | `progressPercentage`, `progressText` | Bỏ qua trùng lặp bài đã hoàn thành | `RULE-005`, `SPEC.approved.md:97` |
| 20 | Gamification | Hệ thống thưởng XP & Danh hiệu | Thưởng $+50\text{ XP}$ (A), $+100\text{ XP}$ (B), $+150\text{ XP}$ (C), bonus $+25\text{ XP}$ khi đúng $3/3$ câu đố lần đầu | `band`, `quizScore`, `isFirstTry` | Tổng XP tích lũy và danh hiệu mở khóa | Không cộng dồn bonus cho lần làm lại | `RULE-005`, `SPEC.approved.md:104` |
| 21 | Gamification | Mở khóa Huy hiệu (Badges) | Mở 4 huy hiệu tại các cột mốc: Blink Master (Bài 2), Acoustic Wizard (Bài 6), IoT Explorer (Bài 4/14), Mechatronics Pro (Bài 20) | `lessonNumber` | Danh sách mảng `badges` | Chỉ cấp huy hiệu một lần duy nhất | `RULE-005`, `SPEC.approved.md:109` |
| 22 | Execution | Máy trạng thái nạp mã nguồn FSM | Vòng đời 3 trạng thái: `idle` $\to$ `uploading` (chờ $600\text{ ms} + 600\text{ ms}$) $\to$ `running` | Lệnh `startUpload()`, `stop()` | Thuộc tính `data-state`, log biên dịch, LED TX/RX | Nút dừng đưa trạng thái về `idle` ngay | `RULE-006`, `SPEC.approved.md:117` |
| 23 | Execution | Thay thế tham số tương tác trong Code | Thay thế các thẻ mẫu `{{paramKey}}` trong mã nguồn C++/Python bằng giá trị slider thực tế | `template`, `params` | Chuỗi mã nguồn hoàn chỉnh đã nội suy | Giữ nguyên thẻ nếu tham số chưa định nghĩa | `RULE-006`, `SPEC.approved.md:125` |
| 24 | Execution | Truy vết dòng lệnh thời gian thực (Trace) | Thêm lớp CSS `is-running` vào dòng `<pre><code>` đang thi hành trên giao diện | `text`, `nth` | Hiệu ứng vệt sáng đánh dấu dòng code | Gỡ bỏ vệt sáng khi dừng chạy | `RULE-006`, `SPEC.approved.md:126` |
| 25 | UI / Serial | Màn hình nối tiếp (Serial Monitor Console) | Console $115200\text{ bps}$, tay kéo đổi chiều cao $[56\text{px}, 360\text{px}]$, mặc định $92\text{px}$, nhấp đúp đặt lại | Kéo rê chuột, nhấp đúp | Chiều cao console cập nhật và lưu trữ | Kẹp chặt kích thước trong khoảng an toàn | `RULE-006`, `SPEC.approved.md:130` |
| 26 | IoT / Wi-Fi | Máy chủ Web Wi-Fi cục bộ (Lesson 4) | ESP32 đóng vai trò máy chủ tại IP ảo `192.168.1.42`, endpoint `/toggle` đảo trạng thái đèn LED GPIO 2 | HTTP GET `/toggle` | HTTP 200 OK, `{ led, ip }` | Trả 404 nếu truy cập sai đường dẫn | `RULE-007`, `SPEC.approved.md:141` |
| 27 | IoT / BLE | Điều khiển nối tiếp Bluetooth (Lesson 13) | ESP32 Bluetooth BLE/SPP nhận chuỗi lệnh `"ON"`, `"OFF"`, `"DIM"` để điều khiển tải | Chuỗi lệnh text qua Bluetooth | Trạng thái đèn và phản hồi `OK: ...` | Trả về `ERROR: UNKNOWN COMMAND` | `RULE-007`, `SPEC.approved.md:145` |
| 28 | IoT / Mesh | Giao thức truyền tin lưới ESP-NOW (Lesson 14) | Truyền tin ngang hàng Board A $\to$ Board B không cần router, trễ $< 5\text{ ms}$, mất gói quá $100\text{ m}$ | `distanceMeters`, `payloadBytes` | `{ isDelivered, packetLossPercentage, latencyMs }` | Trả lỗi nếu gói tin vượt quá $250\text{ bytes}$ | `RULE-007`, `SPEC.approved.md:148` |
| 29 | Robotics | Máy bơm nước thông minh hồi tiếp trễ (Lesson 16) | Điều khiển rơ-le chống tràn/chống cạn: Bật khi nước $\le 20\%$, Tắt khi $\ge 90\%$, giữ nguyên khi $20..90\%$ | Mực nước $H \in [0, 100]\%$ | Trạng thái đóng/ngắt rơ-le bơm | Tránh hiện tượng đóng ngắt liên tục (chatter) | `RULE-008`, `SPEC.approved.md:160` |
| 30 | Robotics | Khóa cửa bàn phím ma trận 4x3 (Lesson 17) | 7 GPIO quét phím, nút `*` xóa bộ đệm, nút `#` xác thực mã (mặc định 1234), khóa $10\text{s}$ sau 3 lần sai | Phím nhấn ma trận | Mở chốt servo hoặc còi báo lỗi | Khóa mọi thao tác khi rơi vào `LOCKED_OUT` | `RULE-008`, `SPEC.approved.md:166` |
| 31 | Robotics | Pin mặt trời hướng nắng kép (Lesson 18) | 2 cảm biến quang trở so lệch, vùng chết $\delta = 15$, xoay servo bám nắng trong $[10^\circ, 170^\circ]$ | $LDR_{left}, LDR_{right}, \theta_{current}$ | Góc xoay servo mới và cờ dịch chuyển | Dừng xoay nếu chênh lệch trong vùng chết | `RULE-008`, `SPEC.approved.md:170` |
| 32 | Robotics | Radar siêu âm quét góc tọa độ cực (Lesson 19) | Servo quét $0^\circ..180^\circ$ mang cảm biến HC-SR04, chuyển tọa độ cực sang Descartes vẽ vệt quét radar | Góc quét $\theta$, khoảng cách $d$ | Tọa độ $(x, y)$ và đường quét phốt-pho | Giới hạn khoảng cách hiển thị tối đa | `RULE-008`, `SPEC.approved.md:175` |
| 33 | Robotics | Cánh tay gắp phôi động cơ bước (Lesson 20) | Động cơ bước vít me pitch $8\text{mm}$, $200\text{ bước/vòng}$ ($0.04\text{ mm/bước}$), nam châm điện hút nhả phôi | Số bước xung `steps` | Vị trí tuyến tính $\text{linearPosMm} \in [0, 200]$ | Kẹp vị trí cơ học trong hành trình tối đa | `RULE-008`, `SPEC.approved.md:178` |
| 34 | Viewport | Điều khiển góc nhìn camera & Reset | Phím `W,A,S,D` pan, `+,-` zoom $[0.4, 3.0]$, `Q,E` xoay $90^\circ$, `R` reset về mặc định trong $400\text{ ms}$ | Phím bấm, kéo chuột, cuộn bánh xe | Tọa độ và ma trận biến đổi camera | Kẹp mức zoom trong khoảng an toàn | `RULE-009`, `SPEC.approved.md:187` |
| 35 | UI / Schematic | Thẻ sơ đồ nguyên lý mạch nổi | Thẻ sơ đồ có thể kéo rê, chỉnh kích thước $[200..600]\text{px} \times [140..500]\text{px}$, bật/tắt đồng bộ aria | Kéo header, kéo grip | Vị trí và kích thước sơ đồ mạch | Đóng sơ đồ khi bấm phím Escape | `RULE-009`, `SPEC.approved.md:197` |
| 36 | Accessibility | Tùy chọn môi trường & Giảm chuyển động | Quản lý 5 cờ cài đặt: `labels`, `grid`, `autoRotate`, `sound`, `reducedMotion`. Giảm tốc tween xuống $0.05$ | Tùy chọn trong modal Cài đặt | Trạng thái hiển thị và cờ giảm giật | Ngắt tiếng Web Audio khi tắt âm thanh | `RULE-010`, `SPEC.approved.md:207` |
| 37 | Responsive | Bố cục thích ứng điểm ngắt Compact | Tự động kích hoạt lớp CSS `compact` khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$, chuyển từ 3 cột sang 1 cột | Kích thước cửa sổ trình duyệt | Layout dạng thẻ xếp chồng (Tabbed Stack) | Duy trì tính năng đầy đủ trên màn hình nhỏ | `RULE-010`, `SPEC.approved.md:216` |

---

## Edge Cases (Các Trường Hợp Ranh Giới & Ngoại Lệ Đã Kiểm Chứng)

| # | Feature | Input / Kịch Bản | Observed Behavior (Hành Vi Quan Sát Thực Tế) |
|---|---------|------------------|----------------------------------------------|
| 1 | `RULE-001`: AgeBandController | Khởi động ứng dụng khi `localStorage` rỗng | Hệ thống tự động gán giá trị mặc định là `"band-b"` (Block Explorer), không bị `null` hay gán nhầm sang `"band-a"`. |
| 2 | `RULE-001`: AgeBandController | Gọi `setBand("invalid-band")` với tham số lạ | Ném ngoại lệ `Error: Invalid age band: invalid-band`, bảo vệ tính toàn vẹn trạng thái hệ thống. |
| 3 | `RULE-002`: Esp32SafetyEngine | Điện áp đặt vào chân GPIO $V = 3.3\text{ V}$ | Trả về `{ safe: true, code: 'OK' }` (vùng biên an toàn tuyệt đối). |
| 4 | `RULE-002`: Esp32SafetyEngine | Điện áp đặt vào chân GPIO $V = 3.31\text{ V}$ hoặc $5.0\text{ V}$ | Ngay lập tức trả về `{ safe: false, code: 'OVERVOLTAGE_WARNING' }`, ngăn chặn kết nối quá áp phá hỏng chip. |
| 5 | `RULE-002`: Esp32SafetyEngine | Cấu hình `pinMode(34, 'OUTPUT')` trên chân input-only | Trả về `{ valid: false, code: 'PIN_CANNOT_BE_OUTPUT' }`. Áp dụng tương tự cho các chân `35, 36, 39`. |
| 6 | `RULE-002`: Esp32SafetyEngine | Cấu hình `pinMode(34, 'INPUT')` trên chân input-only | Trả về `{ valid: true, code: 'OK' }` (cho phép chân làm đầu vào an toàn). |
| 7 | `RULE-002`: Esp32SafetyEngine | Mạch LED mắc điện trở nối tiếp $R_{series} = 0\ \Omega$ | Dòng điện tính toán bằng $\infty$, hệ thống kích hoạt ngay `COMPONENT_BURNED_STATE` với biểu tượng tia lửa. |
| 8 | `RULE-002`: Esp32SafetyEngine | Mạch LED với $R_{series} = 50\ \Omega$ tạo dòng $I = 40.0\text{ mA}$ | Dòng điện đúng bằng giới hạn tối đa $40\text{ mA}$, linh kiện KHÔNG bị cháy (`isBurned: false`), nhưng cảnh báo hoạt động căng thẳng (`STRESSED_OPERATION`). |
| 9 | `RULE-002`: Esp32SafetyEngine | Mạch LED với $R_{series} = 10\ \Omega$ tạo dòng $I = 130.0\text{ mA} > 40\text{ mA}$ | Dòng vượt $40\text{ mA}$, linh kiện rơi vào `COMPONENT_BURNED_STATE` (`isBurned: true`). |
| 10 | `RULE-002`: Esp32SafetyEngine | Điện áp GPIO nhỏ hơn điện áp mở LED ($V_{GPIO} \le V_{forward}$) | Dòng điện $I = 0\text{ mA}$, trạng thái là `OFF_STATE`, không phát sinh dòng rò tiêu hao. |
| 11 | `RULE-002`: Esp32SafetyEngine | Đọc kênh ADC1 (`GPIO 32`) khi Wi-Fi đang hoạt động | Đọc thành công giá trị ADC 12-bit ($0..4095$), không bị ảnh hưởng bởi mô-đun phát sóng Wi-Fi. |
| 12 | `RULE-002`: Esp32SafetyEngine | Đọc kênh ADC2 (`GPIO 4`) khi Wi-Fi đang hoạt động | Trả về thất bại với mã lỗi `ADC2_LOCKED_BY_WIFI`, ngăn chặn đọc dữ liệu rác do xung đột phần cứng. |
| 13 | `RULE-002`: Esp32SafetyEngine | Đọc chân chạm cảm ứng không hợp lệ (`GPIO 21`) | Trả về mã lỗi `NOT_A_TOUCH_PIN` vì chân không có phần cứng cảm ứng điện dung. |
| 14 | `RULE-003`: BandASimulator | Chu kỳ nhấp nháy đèn $t_{rate} = 50\text{ ms}$ (dưới mức tối thiểu) | Được kẹp chặt tự động lên giới hạn dưới $100\text{ ms}$. |
| 15 | `RULE-003`: BandASimulator | Chu kỳ nhấp nháy đèn $t_{rate} = 480\text{ ms}$ | Được làm tròn tự động theo bước nhảy $50\text{ ms}$ về giá trị $500\text{ ms}$. |
| 16 | `RULE-003`: BandASimulator | Cửa tủ lạnh mở đúng góc ranh giới $\theta = 12^\circ$ trong $5000\text{ ms}$ | `isViolating = false`, `isAlarming = false` (nghiêm ngặt $\le 12^\circ$ nằm trong dung sai cho phép, không báo động). |
| 17 | `RULE-003`: BandASimulator | Cửa tủ lạnh mở góc $\theta = 45^\circ$ nhưng thời gian mở mới được $1000\text{ ms} < 3000\text{ ms}$ | `isViolating = true` nhưng `isAlarming = false` (chưa hết thời gian gia hạn, còi chưa hú). |
| 18 | `RULE-003`: BandASimulator | Cửa tủ lạnh mở góc $\theta = 45^\circ$ trong thời gian $3500\text{ ms} > 3000\text{ ms}$ | Còi báo động $2400\text{ Hz}$ kích hoạt tức thời kèm nhấp nháy đỏ (`isAlarming = true`). |
| 19 | `RULE-004`: BandBSimulator | Đọc biến trở Neopixel giá trị $ADC = 0$ | $N_{lit} = \lfloor (0 / 4095) \times 12 \rfloor = 0$ đèn LED sáng. |
| 20 | `RULE-004`: BandBSimulator | Đọc biến trở Neopixel giá trị $ADC = 2047$ | $N_{lit} = \lfloor (2047 / 4095) \times 12 \rfloor = 5$ đèn LED sáng. |
| 21 | `RULE-004`: BandBSimulator | Đọc biến trở Neopixel giá trị $ADC = 4095$ | $N_{lit} = \lfloor (4095 / 4095) \times 12 \rfloor = 12$ đèn LED sáng toàn bộ vòng. |
| 22 | `RULE-004`: BandBSimulator | Cảm biến siêu âm với khoảng cách $d < 2\text{ cm}$ hoặc $d > 400\text{ cm}$ | Giá trị khoảng cách được kẹp chặt chính xác trong phạm vi vật lý $[2, 400]\text{ cm}$. |
| 23 | `RULE-005`: ProgressEngine | Hoàn thành 5/20 bài học | Tỷ lệ tiến trình được tính chính xác bằng $\lfloor (5/20) \times 100 \rfloor = 25\%$; nhãn hiển thị `"5/20"`. |
| 24 | `RULE-005`: ProgressEngine | Hoàn thành bài học lần 2 | Không cộng dồn XP lần thứ hai; giữ nguyên danh sách mảng hoàn thành không trùng lặp. |
| 25 | `RULE-005`: ProgressEngine | Bấm nút xóa tiến trình (`data-reset`) | Xóa sạch mảng hoàn thành, đặt lại XP về 0, xóa huy hiệu, đưa nhãn đếm về `"0/20"` và thanh đo về 0%. |
| 26 | `RULE-006`: CodeExecutionEngine | Thay đổi chiều cao Serial Monitor xuống $20\text{px}$ hoặc lên $500\text{px}$ | Tự động kẹp chặt vào giới hạn an toàn $[56\text{px}, 360\text{px}]$. |
| 27 | `RULE-006`: CodeExecutionEngine | Nhấn đúp chuột vào thanh kéo Serial Monitor | Khôi phục chiều cao ngay lập tức về giá trị tiêu chuẩn $92\text{px}$. |
| 28 | `RULE-007`: WirelessIoTSimulator | Gửi gói tin ESP-NOW có kích thước $251\text{ bytes}$ | Trả về lỗi `PAYLOAD_EXCEEDS_250_BYTES` do vượt quá dung lượng đệm gói tin 250 byte của ESP-NOW. |
| 29 | `RULE-007`: WirelessIoTSimulator | Khoảng cách 2 bo ESP-NOW $d \le 100\text{ m}$ | Tỷ lệ mất gói bằng $0\%$; độ trễ mô phỏng nhỏ hơn $5\text{ ms}$. |
| 30 | `RULE-007`: WirelessIoTSimulator | Khoảng cách 2 bo ESP-NOW $d = 140\text{ m} > 100\text{ m}$ | Tỷ lệ mất gói tăng lũy tiến vượt trên $50\%$ theo đường cong hàm sigmoidal. |
| 31 | `RULE-008`: MechatronicsSimulator | Máy bơm nước khi mực nước giảm xuống $15\%$ | Rơ-le kích hoạt đóng tiếp điểm `pumpActive = true` để bơm nước. |
| 32 | `RULE-008`: MechatronicsSimulator | Máy bơm nước khi mực nước tăng dần lên $50\%$ (nằm trong khoảng $20..90\%$) | Rơ-le duy trì trạng thái đóng trước đó (`pumpActive = true`), không bị ngắt giữa chừng. |
| 33 | `RULE-008`: MechatronicsSimulator | Máy bơm nước khi mực nước đạt $92\%$ | Rơ-le ngắt tiếp điểm `pumpActive = false` chống tràn. |
| 34 | `RULE-008`: MechatronicsSimulator | Máy bơm nước khi mực nước xả bớt về $50\%$ | Rơ-le duy trì trạng thái ngắt trước đó (`pumpActive = false`), không tự ý bật lại khi chưa dưới $20\%$. |
| 35 | `RULE-008`: MechatronicsSimulator | Nhập sai mã PIN bàn phím 4x3 đủ 3 lần liên tiếp | Kích hoạt trạng thái khóa bảo vệ `LOCKOUT_TRIGGERED`, từ chối nhận thêm phím trong thời gian khóa. |
| 36 | `RULE-008`: MechatronicsSimulator | Pin mặt trời có độ chênh lệch quang trở $|\Delta L| \le 15$ | Động cơ servo dừng yên không xoay, ngăn chặn hiện tượng rung lắc tiêu hao điện năng. |
| 37 | `RULE-009`: ViewportController | Phóng to góc nhìn với hệ số $5.0\times$ | Mức thu phóng tự động kẹp chặt tại trần tối đa $3.0\times$. |
| 38 | `RULE-010`: EnvironmentController | Cửa sổ trình duyệt có kích thước $1024 \times 768$ | Phát hiện kích thước nằm dưới ngưỡng $W < 1090\text{px}$ hoặc $H < 800\text{px}$, kích hoạt bố cục `compact`. |

---

## 6. Chi Tiết Toàn Bộ 10 Quy Tắc Kỹ Thuật Hộp Đen (RULE-001 Đến RULE-010)

### RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi & Thích Ứng Giao Diện Người Dùng
- **Mục tiêu**: Điều chỉnh toàn bộ hệ thống giao diện và năng lực tương tác theo 3 phân khúc nhận thức độ tuổi:
  1. `mode = "band-a"` (Kid Spark: 5–8 tuổi):
     - Giao diện dạng truyện tranh với thẻ minh họa (Story Cards).
     - Ẩn hoàn toàn trình biên tập mã nguồn văn bản (`showCodeEditor: false`) và sơ đồ chân kỹ thuật số (`showPinout: false`).
     - Nút bấm điều khiển kích thước lớn $\ge 64\text{px} \times 64\text{px}$ (`minButtonSizePx: 64`).
     - Trợ lý âm thanh giọng đọc tiếng Việt khi tương tác linh kiện.
  2. `mode = "band-b"` (Block Explorer: 9–13 tuổi):
     - Không gian kéo-thả khối lệnh trực quan Blockly/Scratch-style (`showBlockWorkspace: true`).
     - Mô phỏng cắm dây mạch điện trên Breadboard tích hợp.
     - Hiện sơ đồ chân linh kiện (`showPinout: true`); kích thước nút bấm $\ge 44\text{px}$.
  3. `mode = "band-c"` (Maker Pro: 14–20 tuổi):
     - IDE chuyên nghiệp với mã nguồn kép Arduino C++ và MicroPython (`showCodeEditor: true`).
     - Sơ đồ chân chi tiết ESP32 DevKit 30/38-pin (`showPinout: true`).
     - Màn hình giám sát truyền thông nối tiếp (Serial Monitor) với tay kéo điều chỉnh chiều cao.
     - Kích thước nút bấm $\ge 36\text{px}$.
- **Hợp đồng lưu trữ & Đồng bộ**:
  - Trạng thái lưu trữ tại `localStorage.getItem("user-age-band")`. Mặc định khi chưa có dữ liệu là `"band-b"`.
  - Đồng bộ thuộc tính `data-age-band` trên thẻ gốc `<html>` và phát sự kiện `CustomEvent('ageBandChanged', { detail })` với thời gian trễ cập nhật $\le 50\text{ ms}$.

### RULE-002: Ma Trận Sơ Đồ Chân ESP32 & Hợp Đồng An Toàn Giới Hạn Điện Áp / Dòng Điện
- **Điện áp hoạt động**: Điện áp danh định $V_{IO} = 3.3\text{ V}$. Bất kỳ điện áp nào $V > 3.3\text{ V}$ đưa trực tiếp vào chân GPIO sẽ phát cảnh báo `OVERVOLTAGE_WARNING`.
- **Chân đầu vào thuần túy (Input-Only Pins)**: `GPIO 34, 35, 36, 39`.
  - Không có điện trở kéo nội (pull-up/pull-down).
  - Nghiêm cấm cấu hình làm `OUTPUT`. Hàm `validatePinMode(pin, 'OUTPUT')` trả về lỗi tĩnh `PIN_CANNOT_BE_OUTPUT`.
- **Ràng buộc dòng điện & Bảo vệ nhiệt**:
  - Dòng tối đa định mức: $I_{max} = 40.0\text{ mA}$.
  - Dòng an toàn liên tục: $I_{safe} \le 20.0\text{ mA}$.
  - Định luật Ohm: $I = (V_{GPIO} - V_{forward}) / R_{series}$.
  - Nếu $R_{series} = 0\ \Omega$ hoặc $I > 40\text{ mA}$, linh kiện chuyển sang `COMPONENT_BURNED_STATE` kèm đổi màu xám đen và biểu tượng tia lửa.
- **Kênh ADC & Xung đột Wi-Fi**:
  - ADC 12-bit ($0$ đến $4095$) tương ứng dải $0\text{ V} \le V_{in} \le 3.3\text{ V}$.
  - ADC1 (`GPIO 32, 33, 34, 35, 36, 39`): Hoạt động bình thường khi bật Wi-Fi.
  - ADC2 (`GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27`): Bị khóa hoàn toàn khi Wi-Fi kích hoạt, trả lỗi `ADC2_LOCKED_BY_WIFI`.
- **Cảm ứng điện dung**: 10 chân cảm ứng chạm (`GPIO 0, 2, 4, 12, 13, 14, 15, 27, 32, 33`). Trạng thái chạm kích hoạt khi giá trị đọc suy giảm dưới ngưỡng nhàn rỗi: $\text{TouchVal} < \text{Threshold}$ (chạm: $\approx 18$, nhàn rỗi: $\approx 95$).
- **Mã màu dây nối**: Tín hiệu/PWM (`#f0a53a` cam hoặc `#3d6fc4` xanh); Nguồn 3.3V (`#e04a3f` đỏ cờ); Nguồn 5V (`#b82e24` đỏ sẫm); Đất GND (`#2f3547` than chì).

### RULE-003: Mô Phỏng Trực Quan & Phản Hồi Cảm Giác Tức Thì Cho Band A (Kid Spark)
- **Chuỗi 6 bài học trải nghiệm giác quan**:
  1. *Level Crossing*: Tốc độ chớp tắt được kẹp chặt $100\text{ ms} \le t_{rate} \le 1500\text{ ms}$ (bước nhảy $50\text{ ms}$); 3 màu đèn `#ff3b30` (đỏ), `#ffcc00` (vàng), `#34c759` (xanh).
  2. *Fridge Guard*: Góc mở cửa $\theta \in [0^\circ, 90^\circ]$. Nếu $\theta > 12^\circ$ và thời gian mở vượt thời gian gia hạn $t_{grace} \in [1000, 10000]\text{ ms}$ (mặc định $3000\text{ ms}$), phát còi báo động $2400\text{ Hz}$ và nhấp nháy đèn cảnh báo đỏ.
  3. *Siren Sound*: Âm tần quét điều hòa hình sin từ $400\text{ Hz}$ đến $1200\text{ Hz}$ với chu kỳ $1600\text{ ms}$.
  4. *Mini Touch Piano*: 8 phím đồng cảm ứng ứng với 8 nốt nhạc C4 ($261.63\text{ Hz}$), D4 ($293.66\text{ Hz}$), E4 ($329.63\text{ Hz}$), F4 ($349.23\text{ Hz}$), G4 ($392.00\text{ Hz}$), A4 ($440.00\text{ Hz}$), B4 ($493.88\text{ Hz}$), C5 ($523.25\text{ Hz}$). Độ trễ âm thanh $\le 20\text{ ms}$.
  5. *Mood Lamp*: Phối màu bánh xe RGB với 3 kênh $0 \le R, G, B \le 255$, đổi màu quả cầu khuếch tán tương ứng.
  6. *Night Light*: Cảm biến quang trở LDR với ngưỡng mặc định $50\%$. Khi $LDR < 50\%$, đèn LED vàng tự động bật sáng; khi $\ge 50\%$, đèn tắt.

### RULE-004: Lập Trình Khối Kéo-Thả & Mô Phỏng Mạch Điện Breadboard Cho Band B (Block Explorer)
- **Trình biên dịch Block-to-AST**: Chuyển đổi đồ thị khối lệnh sang mã nguồn Arduino C++ chuẩn với các hàm `setup()`, `loop()`, `pinMode()`, `digitalWrite()`, `ledcAttach()`.
- **4 mô hình phần cứng tích hợp**:
  1. *Vòng 12 LED Neopixel WS2812B*: Đọc biến trở ADC ($0..4095$), tính số đèn sáng theo công thức $N_{lit} = \lfloor (ADC / 4095) \times 12 \rfloor$. Hỗ trợ 3 chế độ màu sắc: `blue` (`#0088ff`), `rainbow` (pha góc $i/12 \times 360^\circ$), `traffic` (xanh lá $\to$ vàng $\to$ đỏ).
  2. *Thước đo siêu âm HC-SR04P & OLED SSD1306*: Khoảng cách $2\text{ cm} \le d \le 400\text{ cm}$. Thời gian xung phản hồi $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$. Màn hình OLED hiển thị số đo và thanh tiến trình đồ họa.
  3. *Cổng rào chắn Laser & Động cơ Servo*: Khi xe chắn tia laser, FSM kích hoạt: `CLOSED` ($0^\circ$) $\to$ `OPENING` ($0^\circ \to 90^\circ$ tốc độ $180^\circ/\text{s}$, mất $500\text{ ms}$) $\to$ `OPEN_HOLD` (giữ $90^\circ$ trong $3000\text{ ms}$) $\to$ `CLOSING` ($90^\circ \to 0^\circ$ trong $500\text{ ms}$) $\to$ `CLOSED`.
  4. *Điều tốc động cơ DC qua cầu H*: Xung PWM điều khiển vận tốc quay với duty cycle $0..100\%$, vận tốc góc và RPM tỷ lệ tuyến tính với độ rộng xung.

### RULE-005: Hệ Thống Tiến Trình Học Tập, Điểm Thưởng XP & Đánh Giá Thử Thách
- **Theo dõi tiến trình**: Mảng `completedLessons` lưu tại `localStorage.getItem("learn-esp32-progress")`.
- **Điều kiện hoàn thành bài học** (thỏa 1 trong 2):
  1. Nhấn chạy mô phỏng không phát sinh lỗi trong tối thiểu $3000\text{ ms}$.
  2. Trả lời đúng tối thiểu $2/3$ câu hỏi trắc nghiệm (Quiz) ở cuối bài học.
- **Công thức tiến trình**: $\text{ProgressPercentage} = \lfloor (N_{completed} / 20) \times 100 \rfloor\%$. Đồng bộ các thuộc tính trợ năng: `aria-valuemin="0"`, `aria-valuemax="20"`, `aria-valuenow="N_completed"`. Nhãn đếm: `"{N_completed}/20"`.
- **Điểm kinh nghiệm (XP)**:
  - Band A: $+50\text{ XP}$ / bài học.
  - Band B: $+100\text{ XP}$ / bài học.
  - Band C: $+150\text{ XP}$ / bài học.
  - Thưởng đúng toàn bộ $3/3$ câu đố lần đầu: $+25\text{ XP}$.
- **Huy hiệu mở khóa**: "Blink Master" (Bài 2), "Acoustic Wizard" (Bài 6), "IoT Explorer" (Bài 4 hoặc 14), "Mechatronics Pro" (Bài 20).
- **Thiết lập lại (Reset)**: Xóa toàn bộ tiến trình, đưa XP về 0, xóa huy hiệu và làm rỗng bộ nhớ lưu trữ sau khi xác nhận.

### RULE-006: Trình Thực Thi Code Đa Nền Tảng (C++ / MicroPython) & Truy Vết Dòng Lệnh
- **Máy trạng thái thực thi**: $\text{State} \in \{\text{idle},\ \text{uploading},\ \text{running}\}$.
- **Trình tự chuyển đổi khi nhấn Run**:
  1. `idle` $\to$ `uploading`. Thuộc tính `data-state="uploading"`.
  2. Log dòng 1: `"Compiling sketch…"` (hoặc `"Parsing MicroPython script…"`). Đèn LED UART TX/RX nhấp nháy.
  3. Sau $600\text{ ms}$: Log dòng 2: `"Connecting to ESP32 on USB…"`.
  4. Sau $600\text{ ms}$ tiếp theo: Log dòng 3: `"Writing… 100 %. Hard resetting via RTS pin."`.
  5. `uploading` $\to$ `running`. Thuộc tính `data-state="running"`. Vòng lặp mô phỏng mạch điện hoạt động.
- **Truy vết dòng lệnh (Line Tracing)**: Gọi `trace({ text, nth })`. Khối DOM `.line` tương ứng được thêm lớp CSS `is-running` tạo hiệu ứng vệt sáng theo bước thi hành của vi điều khiển.
- **Màn hình nối tiếp (Serial Monitor)**: Baud rate $115200\text{ bps}$. Thanh kéo thay đổi chiều cao kẹp trong khoảng $[56\text{px}, 360\text{px}]$, mặc định $92\text{px}$. Nhấp đúp chuột khôi phục về $92\text{px}$. Lưu cấu hình tại `localStorage.getItem("console-height")`.

### RULE-007: Mô Phỏng Mạng Không Dây IoT, Wi-Fi Web Server & Giao Thức ESP-NOW
- **3 giao thức không dây**:
  1. *Máy chủ Web Wi-Fi (Lesson 4)*: Bo mạch đóng vai trò SoftAP tại IP ảo tĩnh `192.168.1.42`. Trình duyệt điện thoại ảo gửi yêu cầu HTTP GET `/toggle`, vi điều khiển đảo trạng thái đèn LED `GPIO 2` và phản hồi HTTP 200 OK.
  2. *Bluetooth Serial BLE/SPP (Lesson 13)*: Thiết bị nhận diện `ESP32-Lamp`. Tiếp nhận chuỗi lệnh văn bản: `"ON"` (bật đèn), `"OFF"` (tắt đèn), `"DIM"` (giảm sáng 50%).
  3. *Lưới không dây ESP-NOW (Lesson 14)*: Truyền tin ngang hàng Board A $\to$ Board B không cần router. Độ trễ mô phỏng $t_{latency} < 5\text{ ms}$. Kích thước gói tin tối đa $250\text{ bytes}$ (vượt quá báo lỗi `PAYLOAD_EXCEEDS_250_BYTES`). Khoảng cách $d \in [0.5, 150]\text{ m}$; khi $d > 100\text{ m}$, tỷ lệ mất gói tăng lũy tiến từ $0\%$ lên $100\%$ theo hàm sigmoidal: $P(d) = 1 / (1 + e^{-0.1(d - 125)})$.

### RULE-008: Cơ Điện Tử Tự Động Hóa & Hệ Thống Robot STEM Thông Minh Cho Band C
- **5 hệ thống cơ điện tử phức hợp**:
  1. *Bơm nước thông minh với hồi tiếp trễ (Lesson 16)*: Mức nước $H \in [0\%, 100\%]$. Logic trễ: Nếu $H \le 20\%$, bật rơ-le bơm nước tốc độ $+5\%/\text{s}$; Nếu $H \ge 90\%$, ngắt rơ-le chống tràn; Khi $20\% < H < 90\%$, giữ nguyên trạng thái trước đó.
  2. *Khóa cửa mã số ma trận 4x3 (Lesson 17)*: 7 chân GPIO (4 hàng, 3 cột). Nút `*` xóa bộ đệm (phát bíp $2000\text{ Hz}$); Nút `#` xác thực mã (mặc định `"1234"`). Sai 3 lần liên tiếp kích hoạt khóa hệ thống `LOCKOUT_TRIGGERED` từ chối nhập trong $10\text{s}$ (hoặc $30\text{s}$).
  3. *Pin mặt trời hướng nắng kép (Lesson 18)*: 2 cảm biến quang trở so lệch $\Delta L = LDR_{left} - LDR_{right}$. Vùng chết $\delta = 15$. Nếu $\Delta L > 15$, xoay servo $+1^\circ$; nếu $\Delta L < -15$, xoay servo $-1^\circ$; nếu $|\Delta L| \le 15$, dừng yên chống rung lắc. Phạm vi góc kẹp $[10^\circ, 170^\circ]$.
  4. *Radar siêu âm quét góc tọa độ cực (Lesson 19)*: Cảm biến HC-SR04 gắn trên servo xoay quét $0^\circ..180^\circ$ (bước $1^\circ$). Chuyển đổi tọa độ cực $(d, \theta)$ sang Descartes $(x, y)$ và vẽ vệt quét radar xanh phốt-pho.
  5. *Cánh tay gắp phôi động cơ bước (Lesson 20)*: Động cơ bước NEMA17 điều khiển vít me pitch $8\text{mm}$, 200 bước/vòng cho độ chính xác $0.04\text{ mm/bước}$. Vị trí tuyến tính $\text{linearPosMm} = \text{steps} \times 0.04\text{ mm}$ (kẹp trong $[0, 200]\text{ mm}$). Nam châm điện điều khiển qua MOSFET chân `GPIO 22` để hút nhả phôi.

### RULE-009: Không Gian Mô Phỏng 3D/2D, Bộ Điều Khiển Camera & Sơ Đồ Mạch Điện Nổi
- **Điều khiển góc nhìn camera**:
  - Pan: Phím `W, A, S, D` hoặc kéo rê chuột.
  - Zoom: Phím `+` (phóng to), `-` (thu nhỏ), cuộn chuột. Mức zoom kẹp trong khoảng $[0.4, 3.0]$, mặc định $1.0$.
  - Xoay: Phím `Q` (xoay trái $90^\circ$), `E` (xoay phải $90^\circ$).
  - Đặt lại (Reset): Phím `R` hoặc nhấp đúp vào vùng trống của khung nhìn, chuyển động mượt về mặc định trong $400\text{ ms}$.
  - Phóng nhanh vào linh kiện: Nhấp đúp trực tiếp vào linh kiện để zoom gần và mở Part Inspector. Đóng bằng phím `Escape`.
- **Thẻ sơ đồ nguyên lý nổi (Floating Schematic)**:
  - Header kéo rê tự do khắp màn hình.
  - Tay nắm điều chỉnh kích thước `sch-grip`: Chiều rộng $[200, 600]\text{px}$, chiều cao $[140, 500]\text{px}$.
  - Nút bật/tắt sơ đồ đồng bộ thuộc tính `aria-pressed="true|false"`.

### RULE-010: Khả Năng Tiếp Cận Trợ Năng (a11y), Đa Ngôn Ngữ (i18n) & Tùy Chọn Môi Trường
- **Quản lý cài đặt môi trường**: Lưu đối tượng tại `localStorage.getItem("learn-esp32-settings")`:
  1. `labels` (mặc định: `true`): Bật/tắt nhãn văn bản và mũi tên chỉ dẫn 3D.
  2. `grid` (mặc định: `true`): Hiện/ẩn lưới tọa độ sàn mờ.
  3. `autoRotate` (mặc định: `false`): Chế độ bàn xoay tự động sau $4000\text{ ms}$ không có tương tác.
  4. `sound` (mặc định: `true`): Bật/tắt toàn bộ âm thanh Web Audio (khi tắt, toàn bộ kênh bị mute).
  5. `reducedMotion` (mặc định: `false`): Giảm giật/chuyển động. Khi bật hoặc khi hệ điều hành có `@media (prefers-reduced-motion: reduce)`, hệ số tween giảm xuống $0.05$ (gần như tức thời).
  6. `lang` (mặc định: `'vi'`): Bản địa hóa tiếng Việt toàn bộ nhãn và hướng dẫn, giữ nguyên các thuật ngữ kỹ thuật điện tử chuẩn quốc tế (`GPIO`, `PWM`, `ADC`, `DAC`, `I2C`, `SPI`, `UART`, `Baud`, `OLED`, `Servo`, `Stepper`, `Relay`, `Neopixel`, `ESP-NOW`).
- **Thiết kế thích ứng màn hình (Responsive Breakpoints)**:
  - Khi chiều rộng $W < 1090\text{px}$ hoặc chiều cao $H < 800\text{px}$, kích hoạt lớp CSS `compact`.
  - Bố cục chuyển từ 3 cột song song (`280px 1fr 400px`) sang dạng thẻ xếp chồng (Tabbed Mobile Stack) và thu gọn thanh công cụ.

---

## 7. Toàn Bộ 20 Bài Học Chương Trình (20 Curriculum Lessons Catalog)

Dưới đây là hồ sơ đặc tả chi tiết của toàn bộ 20 bài học phần cứng:

### Bài 1: Gặp gỡ ESP32 & Nguồn 3.3V (`id: "board"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Bo ESP32 DevKit V1, Cáp nạp USB-C, Đèn LED báo nguồn đỏ (Power LED).
- **Chân kết nối**: Toàn bộ bo mạch, Bus nguồn 3.3V, Bus đất GND, Cổng USB-C.
- **Hành vi kỳ vọng**: Bo mạch nhận nguồn, đèn đỏ PWR sáng rực rỡ; truyền thông UART khởi tạo ở tốc độ 115200 bps in ra dòng thông điệp `"Hello ESP32 World! 3.3V Logic Ready."`.
- **Mã C++ Template**:
  ```cpp
  void setup() {
    Serial.begin({{baudRate}});
    Serial.println("Hello ESP32 World! 3.3V Logic Ready.");
  }
  void loop() {
    delay(1000);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  import time
  print("Hello ESP32 World! 3.3V Logic Ready.")
  while True:
      time.sleep(1)
  ```
- **Trắc nghiệm Quiz (3 câu)**:
  1. Điện áp làm việc danh định của các chân GPIO trên ESP32 là bao nhiêu? $\to$ **3.3V** (Giải thích: ESP32 dùng logic 3.3V, cắm 5V trực tiếp sẽ gây hỏng chip).
  2. Cổng USB-C trên bo mạch ESP32 dùng để làm gì? $\to$ **Cấp nguồn và nạp mã lệnh/giao tiếp Serial**.
  3. Chân GND trên bo ESP32 có ý nghĩa là gì? $\to$ **Đất chung 0V (Ground)**, tạo vòng kín cho dòng điện.
- **Tiêu chí hoàn thành**: Chạy mô phỏng không lỗi trong $\ge 3000\text{ ms}$ hoặc trả lời đúng $\ge 2/3$ câu hỏi quiz.

### Bài 2: Chớp nháy 2 đèn LED (`id: "blink"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: LED đỏ 5mm (GPIO 21), LED vàng 5mm (GPIO 22), 2 Điện trở hạn dòng $220\ \Omega$, Breadboard.
- **Chân kết nối**: `GPIO 21`, `GPIO 22`, GND.
- **Hành vi kỳ vọng**: Hai đèn LED chớp nháy so le nhau với chu kỳ trễ `{{rate}}` ms (mặc định $300\text{ ms}$). Khi đèn này sáng thì đèn kia tắt.
- **Mã C++ Template**:
  ```cpp
  const int LED_RED = 21;
  const int LED_YELLOW = 22;
  void setup() {
    pinMode(LED_RED, OUTPUT);
    pinMode(LED_YELLOW, OUTPUT);
  }
  void loop() {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    delay({{rate}});
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
    delay({{rate}});
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin
  import time
  led_r = Pin(21, Pin.OUT)
  led_y = Pin(22, Pin.OUT)
  while True:
      led_r.value(1)
      led_y.value(0)
      time.sleep_ms({{rate}})
      led_r.value(0)
      led_y.value(1)
      time.sleep_ms({{rate}})
  ```
- **Trắc nghiệm Quiz**:
  1. Lệnh nào trong Arduino C++ dùng để cấu hình chân vi điều khiển làm ngõ xuất tín hiệu? $\to$ `pinMode(pin, OUTPUT)`.
  2. Tại sao cần phải mắc thêm điện trở $220\ \Omega$ nối tiếp với đèn LED? $\to$ **Để hạn dòng điện**, tránh làm cháy đèn LED và bảo vệ chân GPIO vi điều khiển.
  3. Mức logic HIGH trong hệ thống ESP32 tương ứng với mức điện áp xấp xỉ bao nhiêu? $\to$ **3.3V**.
- **Huy hiệu mở khóa**: `Blink Master`.

### Bài 3: Chuông báo tủ lạnh (`id: "button"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: Công tắc từ cửa tủ lạnh (Reed Switch / Tilt sensor) nối `GPIO 4` với trở kéo nội, Còi chíp chủ động $2400\text{ Hz}$ nối `GPIO 15`, Đèn LED cảnh báo `GPIO 2`.
- **Chân kết nối**: `GPIO 4`, `GPIO 15`, `GPIO 2`, GND.
- **Hành vi kỳ vọng**: Khi góc mở cửa tủ lạnh $\theta > 12^\circ$ trong thời gian vượt quá thời gian gia hạn $t_{grace}$ ($3000\text{ ms}$), còi $2400\text{ Hz}$ hú vang và đèn báo nhấp nháy đỏ liên tục.
- **Mã C++ Template**:
  ```cpp
  const int DOOR_SENSOR = 4;
  const int BUZZER = 15;
  const int WARN_LED = 2;
  void setup() {
    pinMode(DOOR_SENSOR, INPUT_PULLUP);
    pinMode(BUZZER, OUTPUT);
    pinMode(WARN_LED, OUTPUT);
  }
  void loop() {
    int doorOpen = digitalRead(DOOR_SENSOR);
    if (doorOpen == HIGH) {
      delay({{graceTimeMs}});
      if (digitalRead(DOOR_SENSOR) == HIGH) {
        digitalWrite(BUZZER, HIGH);
        digitalWrite(WARN_LED, HIGH);
        delay(100);
        digitalWrite(WARN_LED, LOW);
      }
    } else {
      digitalWrite(BUZZER, LOW);
      digitalWrite(WARN_LED, LOW);
    }
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin
  import time
  door = Pin(4, Pin.IN, Pin.PULL_UP)
  buzzer = Pin(15, Pin.OUT)
  led = Pin(2, Pin.OUT)
  while True:
      if door.value() == 1:
          time.sleep_ms({{graceTimeMs}})
          if door.value() == 1:
              buzzer.value(1)
              led.value(1)
              time.sleep_ms(100)
              led.value(0)
      else:
          buzzer.value(0)
          led.value(0)
      time.sleep_ms(50)
  ```
- **Trắc nghiệm Quiz**:
  1. Chế độ INPUT_PULLUP trên chân vi điều khiển có tác dụng gì? $\to$ **Kích hoạt điện trở kéo lên nguồn 3.3V nội bộ**, giúp chân không bị trôi nổi logic khi chưa nhấn nút.
  2. Khi cửa tủ lạnh đóng hoàn toàn, công tắc từ nối chân với GND sẽ đọc được mức logic nào? $\to$ **Mức LOW (0V)**.
  3. Tần số âm thanh còi cảnh báo tủ lạnh chuẩn là bao nhiêu Hz? $\to$ **2400Hz**.

### Bài 4: Máy chủ Web Wi-Fi (`id: "wifi"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: Chip Wi-Fi nội bộ ESP32, Đèn LED tích hợp chân `GPIO 2`.
- **Chân kết nối**: `GPIO 2`, Anten Wi-Fi tích hợp.
- **Hành vi kỳ vọng**: Bo mạch phát trạm SoftAP hoặc kết nối Wi-Fi tại IP `192.168.1.42`. Trình duyệt điện thoại ảo truy cập web và gửi yêu cầu HTTP GET `/toggle` làm đảo trạng thái đèn LED `GPIO 2`.
- **Mã C++ Template**:
  ```cpp
  #include <WiFi.h>
  #include <WebServer.h>
  WebServer server(80);
  bool ledState = false;
  void handleToggle() {
    ledState = !ledState;
    digitalWrite(2, ledState ? HIGH : LOW);
    server.send(200, "text/plain", ledState ? "LED: ON" : "LED: OFF");
  }
  void setup() {
    Serial.begin(115200);
    pinMode(2, OUTPUT);
    WiFi.softAP("ESP32-Kids-Server", "12345678");
    server.on("/toggle", handleToggle);
    server.begin();
    Serial.println("Server running at http://192.168.1.42");
  }
  void loop() {
    server.handleClient();
  }
  ```
- **Mã MicroPython Template**:
  ```python
  import socket
  from machine import Pin
  led = Pin(2, Pin.OUT)
  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  s.bind(('192.168.1.42', 80))
  s.listen(5)
  print("MicroPython HTTP Web Server running...")
  ```
- **Trắc nghiệm Quiz**:
  1. Giao thức mạng tầng ứng dụng nào được sử dụng để trình duyệt gửi yêu cầu tới ESP32? $\to$ **HTTP**.
  2. Mã phản hồi trạng thái HTTP 200 OK từ máy chủ ESP32 có ý nghĩa gì? $\to$ **Yêu cầu đã được xử lý thành công**.
  3. Địa chỉ IP ảo tĩnh mặc định của máy chủ ESP32 trong môi trường học tập này là gì? $\to$ **192.168.1.42**.
- **Huy hiệu mở khóa**: `IoT Explorer`.

### Bài 5: Còi hú xe cứu hỏa (`id: "sound"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: Còi chíp thụ động (Passive Piezo Buzzer) nối `GPIO 25`, điện trở $100\ \Omega$.
- **Chân kết nối**: `GPIO 25`, GND.
- **Hành vi kỳ vọng**: Phát âm tần còi hú biến thiên hình sin từ $400\text{ Hz}$ lên $1200\text{ Hz}$ và hạ xuống tuần hoàn theo chu kỳ $1600\text{ ms}$.
- **Mã C++ Template**:
  ```cpp
  const int BUZZER_PIN = 25;
  void setup() {
    ledcAttach(BUZZER_PIN, 400, 8);
  }
  void loop() {
    for (int freq = 400; freq <= 1200; freq += 20) {
      ledcWriteTone(BUZZER_PIN, freq);
      delay(20);
    }
    for (int freq = 1200; freq >= 400; freq -= 20) {
      ledcWriteTone(BUZZER_PIN, freq);
      delay(20);
    }
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, PWM
  import time
  buzzer = PWM(Pin(25))
  while True:
      for freq in range(400, 1200, 20):
          buzzer.freq(freq)
          buzzer.duty(512)
          time.sleep_ms(20)
  ```
- **Trắc nghiệm Quiz**:
  1. Sự khác biệt cơ bản giữa còi chủ động (Active Buzzer) và còi thụ động (Passive Buzzer) là gì? $\to$ **Còi thụ động cần cấp xung dao động tần số ngoài** để phát ra nốt nhạc, trong khi còi chủ động chỉ cần cấp nguồn DC là tự kêu một tiếng cố định.
  2. Đơn vị đo tần số âm thanh là gì? $\to$ **Hertz (Hz)**.
  3. Tai người bình thường có thể nghe được dải âm thanh trong khoảng nào? $\to$ **20Hz đến 20,000Hz**.

### Bài 6: Đàn Piano phím chạm cảm ứng (`id: "piano"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: 8 lá đồng cảm ứng chạm (Touch pins), Còi loa phát âm thanh.
- **Chân kết nối**: `GPIO 4 (T0), 0 (T1), 2 (T2), 15 (T3), 13 (T4), 12 (T5), 14 (T6), 27 (T7)`.
- **Hành vi kỳ vọng**: Nhấn hoặc chạm vào các lá đồng sẽ phát ngay nốt nhạc C4 ($261.63\text{ Hz}$) đến C5 ($523.25\text{ Hz}$) với độ trễ $\le 20\text{ ms}$.
- **Mã C++ Template**:
  ```cpp
  const int TOUCH_PINS[8] = {4, 0, 2, 15, 13, 12, 14, 27};
  const int NOTES[8] = {262, 294, 330, 349, 392, 440, 494, 523};
  void setup() {
    Serial.begin(115200);
  }
  void loop() {
    for (int i = 0; i < 8; i++) {
      if (touchRead(TOUCH_PINS[i]) < {{threshold}}) {
        Serial.printf("Note triggered: %d Hz\n", NOTES[i]);
      }
    }
    delay(50);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import TouchPad, Pin
  import time
  t = TouchPad(Pin(4))
  while True:
      val = t.read()
      if val < {{threshold}}:
          print("Key C4 Touched! Value:", val)
      time.sleep_ms(50)
  ```
- **Trắc nghiệm Quiz**:
  1. Công nghệ cảm ứng điện dung tích hợp trên ESP32 hoạt động dựa trên nguyên lý nào? $\to$ **Đo sự thay đổi điện dung** khi ngón tay mang điện tích chạm vào điện cực làm giá trị đọc suy giảm.
  2. Nốt nhạc chuẩn A4 (La quốc tế) có tần số dao động là bao nhiêu Hz? $\to$ **440Hz**.
  3. Hàm nào trong Arduino Core dùng để đọc giá trị cảm ứng chạm trên ESP32? $\to$ `touchRead(pin)`.
- **Huy hiệu mở khóa**: `Acoustic Wizard`.

### Bài 7: Vòng 12 Đèn LED Màu Neopixel (`id: "knob"`)
- **Phân khúc tuổi**: Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Vòng 12 LED WS2812B (GPIO 18), Biến trở xoay 10k (GPIO 34), Nguồn cấp.
- **Chân kết nối**: `GPIO 18` (Data), `GPIO 34` (ADC1 Input), 3.3V/5V, GND.
- **Hành vi kỳ vọng**: Xoay biến trở điều chỉnh điện áp từ 0 đến 3.3V ($ADC \in [0, 4095]$). Số lượng đèn LED bật sáng trên vòng tỷ lệ nguyên $N_{lit} = \lfloor (ADC / 4095) \times 12 \rfloor$.
- **Mã C++ Template**:
  ```cpp
  #include <Adafruit_NeoPixel.h>
  #define PIN_LED 18
  #define NUM_LEDS 12
  #define PIN_POT 34
  Adafruit_NeoPixel ring(NUM_LEDS, PIN_LED, NEO_GRB + NEO_KHZ800);
  void setup() {
    ring.begin();
    ring.show();
  }
  void loop() {
    int pot = analogRead(PIN_POT);
    int numLit = map(pot, 0, 4095, 0, NUM_LEDS);
    for (int i = 0; i < NUM_LEDS; i++) {
      if (i < numLit) ring.setPixelColor(i, ring.Color(0, 150, 255));
      else ring.setPixelColor(i, 0);
    }
    ring.show();
    delay(50);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, ADC
  import neopixel
  np = neopixel.NeoPixel(Pin(18), 12)
  pot = ADC(Pin(34))
  while True:
      val = pot.read()
      num = int((val / 4095) * 12)
      for i in range(12):
          np[i] = (0, 150, 255) if i < num else (0, 0, 0)
      np.write()
  ```
- **Trắc nghiệm Quiz**:
  1. Bộ chuyển đổi tín hiệu tương tự sang số (ADC) trên ESP32 có độ phân giải bao nhiêu bit? $\to$ **12-bit (0 đến 4095)**.
  2. Chân GPIO 34 trên bo ESP32 có đặc điểm kỹ thuật quan trọng nào cần lưu ý? $\to$ **Là chân chỉ đầu vào (Input Only)**, không có điện trở kéo nội và không thể xuất mức HIGH.
  3. Giao thức truyền dữ liệu tới LED Neopixel WS2812B sử dụng bao nhiêu dây tín hiệu số? $\to$ **1 dây dữ liệu duy nhất** với tốc độ truyền 800kHz.

### Bài 8: Đèn ngủ đổi màu ma thuật (`id: "rgb"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: LED 3 màu RGB cathode chung nối GND, 3 chân anode nối `GPIO 25, 26, 27` qua điện trở hạn dòng $220\ \Omega$, quả cầu tán xạ.
- **Chân kết nối**: `GPIO 25` (R), `GPIO 26` (G), `GPIO 27` (B), GND.
- **Hành vi kỳ vọng**: Điều chỉnh bánh xe màu xuất 3 kênh PWM trộn màu ánh sáng dịu mắt phát sáng quả cầu.
- **Mã C++ Template**:
  ```cpp
  const int PIN_R = 25;
  const int PIN_G = 26;
  const int PIN_B = 27;
  void setup() {
    ledcAttach(PIN_R, 5000, 8);
    ledcAttach(PIN_G, 5000, 8);
    ledcAttach(PIN_B, 5000, 8);
  }
  void loop() {
    ledcWrite(PIN_R, {{r}});
    ledcWrite(PIN_G, {{g}});
    ledcWrite(PIN_B, {{b}});
    delay(100);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, PWM
  r = PWM(Pin(25), freq=5000)
  g = PWM(Pin(26), freq=5000)
  b = PWM(Pin(27), freq=5000)
  r.duty(int(({{r}} / 255) * 1023))
  g.duty(int(({{g}} / 255) * 1023))
  b.duty(int(({{b}} / 255) * 1023))
  ```
- **Trắc nghiệm Quiz**:
  1. Ba màu sắc cơ bản được dùng để pha trộn toàn bộ dải màu trên màn hình điện tử là gì? $\to$ **Đỏ (Red), Xanh lá (Green), Xanh dương (Blue)**.
  2. Khi cả 3 kênh màu RGB đều phát sáng ở mức công suất tối đa (255, 255, 255), mắt ta sẽ nhìn thấy màu gì? $\to$ **Màu Trắng**.
  3. Kỹ thuật điều chế độ rộng xung (PWM) dùng để làm gì đối với bóng đèn LED? $\to$ **Điều chỉnh độ sáng tối mượt mà** của đèn LED bằng cách thay đổi tỷ lệ thời gian bật/tắt ở tần số cao.

### Bài 9: Bật đèn khi trời tối (`id: "light"`)
- **Phân khúc tuổi**: Band A (5–8), Band B (9–13).
- **Linh kiện phần cứng**: Quang trở LDR GL5528, Điện trở $10\text{k}\Omega$ tạo cầu phân áp vào `GPIO 32`, Đèn LED vàng `GPIO 21`.
- **Chân kết nối**: `GPIO 32` (ADC1), `GPIO 21` (LED), 3.3V, GND.
- **Hành vi kỳ vọng**: Kéo thanh trượt che tối quang trở, khi độ sáng giảm dưới ngưỡng $50\%$, đèn LED vàng tự động bật; khi trời sáng trở lại ($\ge 50\%$), đèn tắt.
- **Mã C++ Template**:
  ```cpp
  const int PIN_LDR = 32;
  const int PIN_LED = 21;
  void setup() {
    pinMode(PIN_LED, OUTPUT);
  }
  void loop() {
    int lightVal = analogRead(PIN_LDR);
    int percent = map(lightVal, 0, 4095, 0, 100);
    if (percent < {{threshold}}) {
      digitalWrite(PIN_LED, HIGH);
    } else {
      digitalWrite(PIN_LED, LOW);
    }
    delay(100);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, ADC
  import time
  ldr = ADC(Pin(32))
  led = Pin(21, Pin.OUT)
  while True:
      percent = int((ldr.read() / 4095) * 100)
      led.value(1 if percent < {{threshold}} else 0)
      time.sleep_ms(100)
  ```
- **Trắc nghiệm Quiz**:
  1. Khi ánh sáng chiếu vào quang trở (LDR) tăng lên, điện trở của nó thay đổi như thế nào? $\to$ **Điện trở giảm xuống** (điện trở tối khoảng $1\text{M}\Omega$, khi sáng giảm còn vài chục $\text{k}\Omega$).
  2. Mạch cầu phân áp trong bài học này có vai trò gì? $\to$ **Chuyển đổi sự thay đổi điện trở thành sự thay đổi điện áp** để chân ADC của ESP32 có thể đọc được.
  3. Ứng dụng thực tế phổ biến nhất của mạch cảm biến ánh sáng này là gì? $\to$ **Hệ thống đèn đường thông minh** tự động bật khi trời tối và tắt khi trời sáng.

### Bài 10: Thước đo khoảng cách siêu âm (`id: "sensor"`)
- **Phân khúc tuổi**: Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Cảm biến siêu âm HC-SR04P 3.3V (Trig `GPIO 5`, Echo `GPIO 18`), Màn hình OLED SSD1306 I2C (`GPIO 21` SDA, `GPIO 22` SCL).
- **Chân kết nối**: `GPIO 5` (Trig), `GPIO 18` (Echo), `GPIO 21` (SDA), `GPIO 22` (SCL), 3.3V, GND.
- **Hành vi kỳ vọng**: Kéo vật cản từ $2\text{ cm}$ đến $400\text{ cm}$, vi điều khiển tính thời gian phản hồi $\Delta t = (2 \cdot d) / 0.0343\ \mu\text{s}$, màn hình OLED hiển thị con số khoảng cách và thanh đo tỷ lệ.
- **Mã C++ Template**:
  ```cpp
  const int TRIG = 5;
  const int ECHO = 18;
  void setup() {
    Serial.begin(115200);
    pinMode(TRIG, OUTPUT);
    pinMode(ECHO, INPUT);
  }
  void loop() {
    digitalWrite(TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG, LOW);
    long duration = pulseIn(ECHO, HIGH);
    float distance = duration * 0.0343 / 2.0;
    Serial.printf("Distance: %.1f cm\n", distance);
    delay(200);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, time_pulse_us
  import time
  trig = Pin(5, Pin.OUT)
  echo = Pin(18, Pin.IN)
  while True:
      trig.value(0)
      time.sleep_us(2)
      trig.value(1)
      time.sleep_us(10)
      trig.value(0)
      d_us = time_pulse_us(echo, 1, 30000)
      dist_cm = (d_us * 0.0343) / 2
      print("Distance:", dist_cm, "cm")
      time.sleep_ms(200)
  ```
- **Trắc nghiệm Quiz**:
  1. Tốc độ lan truyền của sóng âm thanh trong không khí ở điều kiện thường xấp xỉ bao nhiêu? $\to$ **$343\text{ m/s}$ (tương đương $0.0343\text{ cm}/\mu\text{s}$)**.
  2. Tại sao công thức tính khoảng cách siêu âm cần phải chia cho 2? $\to$ **Vì sóng âm phải đi 2 chiều**: từ cảm biến tới vật cản rồi dội ngược trở lại.
  3. Màn hình OLED SSD1306 trong bài học giao tiếp với ESP32 thông qua chuẩn giao thức nào? $\to$ **I2C (2 dây: SDA và SCL)**.

### Bài 11: Điều tốc động cơ DC qua mạch cầu H (`id: "motor"`)
- **Phân khúc tuổi**: Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Động cơ DC mini $3\text{V}–6\text{V}$, Mạch công suất Transistor / Cầu H (L298N/L9110S) nối `GPIO 19, 23`, Nguồn pin ngoài.
- **Chân kết nối**: `GPIO 19` (PWM IN1), `GPIO 23` (IN2), GND chung.
- **Hành vi kỳ vọng**: Xuất xung PWM duty $0..100\%$, bánh xe mô hình quay với vận tốc tỷ lệ tuyến tính với độ rộng xung; đảo chiều quay khi hoán đổi chân mức HIGH/LOW.
- **Mã C++ Template**:
  ```cpp
  const int PWM_PIN = 19;
  const int DIR_PIN = 23;
  void setup() {
    pinMode(DIR_PIN, OUTPUT);
    digitalWrite(DIR_PIN, LOW);
    ledcAttach(PWM_PIN, 1000, 8);
  }
  void loop() {
    int duty = map({{speedPercent}}, 0, 100, 0, 255);
    ledcWrite(PWM_PIN, duty);
    delay(100);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, PWM
  pwm = PWM(Pin(19), freq=1000)
  dir_pin = Pin(23, Pin.OUT)
  dir_pin.value(0)
  duty_10bit = int(({{speedPercent}} / 100) * 1023)
  pwm.duty(duty_10bit)
  ```
- **Trắc nghiệm Quiz**:
  1. Tại sao không được nối trực tiếp động cơ DC công suất vào chân GPIO của vi điều khiển ESP32? $\to$ **Vì động cơ tiêu thụ dòng điện lớn (vài trăm mA)**, vượt quá mức dòng tối đa $40\text{ mA}$ của chân GPIO sẽ làm cháy chân vi điều khiển.
  2. Mạch cầu H (H-Bridge) có khả năng thực hiện chức năng cơ bản nào? $\to$ **Điều khiển động cơ DC quay thuận, quay ngược và hãm tốc**.
  3. Linh kiện nào trong mạch cầu H giúp triệt tiêu dòng điện tự cảm ngược sinh ra từ cuộn dây động cơ? $\to$ **Đi-ốt bảo vệ (Flyback Diode)**.

### Bài 12: Cổng rào chắn Laser tự động (`id: "servo"`)
- **Phân khúc tuổi**: Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Mô-đun Laser Đỏ 650nm ($5\text{V}$), Cảm biến quang thu nối `GPIO 35`, Động cơ Servo SG90 nối `GPIO 13`.
- **Chân kết nối**: `GPIO 35` (Sensor), `GPIO 13` (Servo PWM 50Hz), Nguồn 5V cho Servo/Laser, GND.
- **Hành vi kỳ vọng**: Xe di chuyển cắt ngang tia laser, cảm biến phát hiện ngắt quang, động cơ Servo quay cần chắn từ $0^\circ$ lên $90^\circ$ ($180^\circ/\text{s}$), giữ mở trong $3000\text{ ms}$, sau đó tự hạ cần về $0^\circ$.
- **Mã C++ Template**:
  ```cpp
  #include <ESP32Servo.h>
  Servo barrierServo;
  const int LASER_SENSOR = 35;
  void setup() {
    barrierServo.attach(13);
    barrierServo.write(0); // Dong cong
    pinMode(LASER_SENSOR, INPUT);
  }
  void loop() {
    if (digitalRead(LASER_SENSOR) == LOW) { // Tia laser bi chan
      barrierServo.write(90); // Mo cong 90 do
      delay({{holdTimeMs}});
      barrierServo.write(0);  // Dong lai
    }
    delay(50);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, PWM
  import time
  servo = PWM(Pin(13), freq=50)
  sensor = Pin(35, Pin.IN)
  def set_angle(deg):
      duty = int(40 + (deg / 180) * 75)
      servo.duty(duty)
  while True:
      if sensor.value() == 0:
          set_angle(90)
          time.sleep_ms({{holdTimeMs}})
          set_angle(0)
      time.sleep_ms(50)
  ```
- **Trắc nghiệm Quiz**:
  1. Tần số tín hiệu PWM tiêu chuẩn dùng để điều khiển động cơ servo thông dụng (như SG90) là bao nhiêu? $\to$ **50Hz (chu kỳ 20ms)**.
  2. Độ rộng xung PWM tương ứng với góc quay $0^\circ$ và $90^\circ$ trên servo thường là bao nhiêu? $\to$ **$1.0\text{ ms}$ ($0^\circ$) và $1.5\text{ ms}$ ($90^\circ$)**.
  3. Cảm biến quang thu bị che khuất tia sáng sẽ làm chân tín hiệu chuyển về mức logic nào? $\to$ **Mức LOW (0V)**.

### Bài 13: Đàm thoại Bluetooth & Điều khiển không dây (`id: "bluetooth"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: Mô-đun Bluetooth BLE / SPP tích hợp trên ESP32, Đèn LED báo hiệu.
- **Chân kết nối**: Anten Bluetooth nội bộ, Đèn LED `GPIO 2`.
- **Hành vi kỳ vọng**: Thiết bị nhận diện Bluetooth với tên `ESP32-Lamp`. Tiếp nhận chuỗi lệnh qua cổng Serial Bluetooth: `"ON"`, `"OFF"`, `"DIM"` để điều khiển mạch điện tử.
- **Mã C++ Template**:
  ```cpp
  #include "BluetoothSerial.h"
  BluetoothSerial SerialBT;
  const int LAMP_PIN = 2;
  void setup() {
    pinMode(LAMP_PIN, OUTPUT);
    SerialBT.begin("ESP32-Lamp");
  }
  void loop() {
    if (SerialBT.available()) {
      String cmd = SerialBT.readStringUntil('\n');
      cmd.trim();
      if (cmd == "ON") digitalWrite(LAMP_PIN, HIGH);
      else if (cmd == "OFF") digitalWrite(LAMP_PIN, LOW);
    }
  }
  ```
- **Mã MicroPython Template**:
  ```python
  import bluetooth
  print("ESP32 Bluetooth BLE Advertising as ESP32-Lamp...")
  ```
- **Trắc nghiệm Quiz**:
  1. Giao thức Bluetooth Low Energy (BLE) có ưu điểm nổi bật nào so với Bluetooth cổ điển (Classic)? $\to$ **Tiêu thụ điện năng cực thấp**, phù hợp cho thiết bị IoT chạy pin.
  2. Băng tần số phát sóng không dây của Wi-Fi và Bluetooth trên chip ESP32 là bao nhiêu? $\to$ **2.4 GHz**.
  3. Cấu hình Profile BLE GATT (Generic Attribute Profile) quản lý dữ liệu dưới dạng cấu trúc nào? $\to$ **Services và Characteristics**.

### Bài 14: Giao thức lưới không dây ESP-NOW tốc độ cao (`id: "espnow"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: 2 Bo mạch ESP32 độc lập (Board A - Phát, Board B - Thu), Nút nhấn phát `GPIO 4`, Còi báo nhận tin `GPIO 15`.
- **Chân kết nối**: Board A: `GPIO 4`; Board B: `GPIO 15`.
- **Hành vi kỳ vọng**: Board A gửi gói tin MAC broadcast trực tiếp tới Board B. Board B nhận gói tin qua hàm ngắt `OnDataRecv` với độ trễ $t < 5\text{ ms}$, kích hoạt còi chíp ngay lập tức. Khoảng cách truyền $d \in [0.5, 150]\text{ m}$; mất gói khi $d > 100\text{ m}$.
- **Mã C++ Template**:
  ```cpp
  #include <esp_now.h>
  #include <WiFi.h>
  typedef struct struct_message {
    char action[32];
    int buttonState;
  } struct_message;
  struct_message myData;
  void setup() {
    WiFi.mode(WIFI_STA);
    esp_now_init();
  }
  void loop() {
    strcpy(myData.action, "BUZZER_ON");
    myData.buttonState = 1;
    esp_now_send(NULL, (uint8_t *) &myData, sizeof(myData));
    delay(1000);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  import network, espnow
  sta = network.WLAN(network.STA_IF)
  sta.active(True)
  e = espnow.ESPNow()
  e.active(True)
  e.send(b'\xff\xff\xff\xff\xff\xff', b'PING')
  ```
- **Trắc nghiệm Quiz**:
  1. Giao thức ESP-NOW có đặc điểm kỹ thuật nổi trội nào so với kết nối Wi-Fi thông thường? $\to$ **Truyền tin trực tiếp ngang hàng giữa các bo mạch** với độ trễ cực thấp (< 5ms) mà không cần Router Wi-Fi trung gian.
  2. Kích thước dữ liệu tải trọng (Payload) tối đa cho một gói tin ESP-NOW là bao nhiêu byte? $\to$ **250 bytes**.
  3. Để gửi dữ liệu tới một bo mạch đích xác định qua ESP-NOW, ta cần biết thông tin phần cứng duy nhất nào của bo đó? $\to$ **Địa chỉ MAC (Media Access Control)** của bo nhận.
- **Huy hiệu mở khóa**: `IoT Explorer`.

### Bài 15: Bãi đỗ xe thông minh tích hợp (`id: "project"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: ESP32, Cảm biến siêu âm (`GPIO 5, 18`), Cụm đèn LED Xanh/Đỏ (`GPIO 21, 22`), Màn hình OLED SSD1306.
- **Chân kết nối**: `GPIO 5, 18, 21, 22`, I2C OLED `GPIO 21, 22`.
- **Hành vi kỳ vọng**: Giám sát vị trí đỗ xe. Khi có xe vào vị trí ($d < 15\text{ cm}$), đèn LED chuyển sang Đỏ (bận), màn hình OLED cập nhật số chỗ trống còn lại và gửi cập nhật lên web.
- **Mã C++ Template**:
  ```cpp
  int totalSlots = 5;
  int occupiedSlots = {{occupiedSlots}};
  void setup() {
    Serial.begin(115200);
    Serial.printf("Smart Parking: %d/%d available\n", totalSlots - occupiedSlots, totalSlots);
  }
  void loop() {
    delay(1000);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  total = 5
  occupied = {{occupiedSlots}}
  print("Available slots:", total - occupied)
  ```
- **Trắc nghiệm Quiz**:
  1. Thuật ngữ "IoT" (Internet of Things) nghĩa là gì? $\to$ **Mạng lưới vạn vật kết nối Internet**, nơi các thiết bị vật lý thu thập và trao đổi dữ liệu với nhau.
  2. Trong hệ thống bãi đỗ xe thông minh, cảm biến siêu âm đóng vai trò gì? $\to$ **Phát hiện vật thể xe có đang chiếm dụng vị trí đỗ hay không**.
  3. Phương thức truyền tin nào thích hợp để gửi dữ liệu chỗ trống bãi đỗ xe lên dịch vụ đám mây định kỳ? $\to$ **Giao thức MQTT hoặc HTTP POST**.

### Bài 16: Máy bơm nước tự động hồi tiếp rơ-le (`id: "pump"`)
- **Phân khúc tuổi**: Band B (9–13), Band C (14–20).
- **Linh kiện phần cứng**: Đầu dò mực nước analog nối `GPIO 34`, Mô-đun Rơ-le cơ 5V cách ly quang nối `GPIO 26`, Máy bơm nước mini 5V.
- **Chân kết nối**: `GPIO 34` (ADC1 Input), `GPIO 26` (Relay Control Output), GND, Nguồn 5V cho Bơm.
- **Hành vi kỳ vọng**: Logic trễ: Khi mực nước $H \le 20\%$, rơ-le đóng mức `HIGH` kích hoạt máy bơm nước dâng $+5\%/\text{s}$; Khi nước dâng tới $H \ge 90\%$, rơ-le ngắt mức `LOW` chống tràn; Khi nước nằm trong khoảng $20\% < H < 90\%$, giữ nguyên trạng thái đóng/ngắt trước đó.
- **Mã C++ Template**:
  ```cpp
  const int SENSOR_PIN = 34;
  const int RELAY_PIN = 26;
  bool pumpState = false;
  void setup() {
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
  }
  void loop() {
    int raw = analogRead(SENSOR_PIN);
    int levelPercent = map(raw, 0, 4095, 0, 100);
    if (levelPercent <= 20) {
      pumpState = true;
    } else if (levelPercent >= 90) {
      pumpState = false;
    }
    digitalWrite(RELAY_PIN, pumpState ? HIGH : LOW);
    delay(200);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, ADC
  import time
  sensor = ADC(Pin(34))
  relay = Pin(26, Pin.OUT)
  pump = False
  while True:
      lvl = int((sensor.read() / 4095) * 100)
      if lvl <= 20: pump = True
      elif lvl >= 90: pump = False
      relay.value(1 if pump else 0)
      time.sleep_ms(200)
  ```
- **Trắc nghiệm Quiz**:
  1. Nguyên lý điều khiển trễ (Hysteresis Control) mang lại lợi ích kỹ thuật quan trọng nào? $\to$ **Ngăn chặn hiện tượng đóng ngắt liên tục (chatter)** làm mòn cơ khí và cháy tiếp điểm rơ-le khi mực nước dao động quanh một ngưỡng duy nhất.
  2. Mạch cách ly quang (Optocoupler) trên mô-đun rơ-le có chức năng gì? $\to$ **Cách ly điện hoàn toàn giữa mạch điều khiển 3.3V và mạch tải công suất cao**, ngăn xung điện áp ngược làm cháy ESP32.
  3. Tiếp điểm thường mở (NO - Normally Open) trên rơ-le hoạt động như thế nào? $\to$ **Ở trạng thái nghỉ tiếp điểm hở mạch**, khi kích hoạt cuộn hút tiếp điểm sẽ đóng lại cấp điện cho tải.

### Bài 17: Khóa cửa mã số an toàn bàn phím 4x3 (`id: "keypad"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: Bàn phím ma trận màng 4x3 (Hàng: `GPIO 12, 14, 27, 26`; Cột: `GPIO 25, 33, 32`), Động cơ chốt khóa Servo `GPIO 13`, Còi chip báo hiệu `GPIO 15`.
- **Chân kết nối**: 4 hàng (`GPIO 12, 14, 27, 26`), 3 cột (`GPIO 25, 33, 32`), `GPIO 13` (Servo), `GPIO 15` (Buzzer).
- **Hành vi kỳ vọng**: Nhấn phím số lưu vào bộ đệm tối đa 4 ký tự; phím `*` xóa bộ đệm (bíp ngắn $2000\text{ Hz}$); phím `#` xác thực mã (mặc định `"1234"`). Đúng mã: mở chốt servo, chuông chúc mừng; Sai mã: còi phát tiếng kêu trầm $400\text{ Hz}$. Sai 3 lần liên tiếp: khóa hệ thống trong $10\text{s}$ (hoặc $30\text{s}$).
- **Mã C++ Template**:
  ```cpp
  #include <Keypad.h>
  const byte ROWS = 4;
  const byte COLS = 3;
  char keys[ROWS][COLS] = {
    {'1','2','3'},
    {'4','5','6'},
    {'7','8','9'},
    {'*','0','#'}
  };
  byte rowPins[ROWS] = {12, 14, 27, 26};
  byte colPins[COLS] = {25, 33, 32};
  Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
  String buffer = "";
  void setup() {
    Serial.begin(115200);
  }
  void loop() {
    char key = keypad.getKey();
    if (key) {
      if (key == '*') buffer = "";
      else if (key == '#') {
        if (buffer == "{{secretPin}}") Serial.println("UNLOCKED!");
        else Serial.println("WRONG PIN!");
        buffer = "";
      } else if (buffer.length() < 4) buffer += key;
    }
  }
  ```
- **Mã MicroPython Template**:
  ```python
  # Quét ma trận phím 4x3 trên MicroPython
  print("Keypad Lock Matrix ready. Enter 4-digit PIN followed by #")
  ```
- **Trắc nghiệm Quiz**:
  1. Kỹ thuật quét ma trận phím (Matrix Scanning) giúp tiết kiệm tài nguyên chân vi điều khiển như thế nào? $\to$ **Điều khiển 12 phím bấm chỉ với 7 chân GPIO** (4 hàng + 3 cột) thay vì cần 12 chân độc lập.
  2. Tại sao sau 3 lần nhập sai mật mã, hệ thống cần kích hoạt cơ chế khóa thời gian (Lockout)? $\to$ **Để ngăn chặn tấn công dò mật khẩu tự động (Brute-force attack)**.
  3. Khi không có phím nào được nhấn, các điện trở kéo nội bộ giữ mức điện áp trên các chân đầu vào ở trạng thái nào? $\to$ **Mức logic HIGH ổn định (3.3V)**.

### Bài 18: Pin mặt trời hướng nắng kép (`id: "solar"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: 2 Cảm biến quang trở LDR (Trái `GPIO 32`, Phải `GPIO 33`), Động cơ Servo xoay trục `GPIO 18`, Tấm pin quang điện mô hình.
- **Chân kết nối**: `GPIO 32` (LDR Left), `GPIO 33` (LDR Right), `GPIO 18` (Servo PWM), GND, 5V.
- **Hành vi kỳ vọng**: Vị trí mặt trời có góc $\theta_{sun} \in [0^\circ, 180^\circ]$. Tính sai lệch $\Delta L = LDR_{left} - LDR_{right}$. Vùng chết $\delta = 15$. Nếu $\Delta L > 15$, xoay servo sang trái $+1^\circ$; nếu $\Delta L < -15$, xoay servo sang phải $-1^\circ$; nếu $|\Delta L| \le 15$, dừng yên. Góc quay kẹp chặt trong $[10^\circ, 170^\circ]$.
- **Mã C++ Template**:
  ```cpp
  #include <ESP32Servo.h>
  Servo trackerServo;
  const int LDR_L = 32;
  const int LDR_R = 33;
  int currentAngle = 90;
  void setup() {
    trackerServo.attach(18);
    trackerServo.write(currentAngle);
  }
  void loop() {
    int valL = analogRead(LDR_L);
    int valR = analogRead(LDR_R);
    int diff = valL - valR;
    if (abs(diff) > {{deadband}}) {
      if (diff > 0 && currentAngle < 170) currentAngle += 1;
      else if (diff < 0 && currentAngle > 10) currentAngle -= 1;
      trackerServo.write(currentAngle);
    }
    delay(50);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, ADC, PWM
  import time
  ldr_l = ADC(Pin(32))
  ldr_r = ADC(Pin(33))
  servo = PWM(Pin(18), freq=50)
  angle = 90
  while True:
      diff = ldr_l.read() - ldr_r.read()
      if abs(diff) > {{deadband}}:
          if diff > 0 and angle < 170: angle += 1
          elif diff < 0 and angle > 10: angle -= 1
      time.sleep_ms(50)
  ```
- **Trắc nghiệm Quiz**:
  1. Mục đích chính của việc chế tạo hệ thống pin mặt trời tự động hướng nắng (Solar Tracker) là gì? $\to$ **Tăng hiệu suất thu nhận năng lượng ánh sáng lên 25–40%** so với giàn pin đặt cố định một góc.
  2. Khái niệm "Vùng chết" (Deadband) trong thuật toán bám nắng có vai trò kỹ thuật gì? $\to$ **Ngăn chặn hiện tượng động cơ rung lắc liên tục** qua lại khi hai bên cảm biến chênh lệch ánh sáng rất nhỏ, giúp tiết kiệm năng lượng và tăng tuổi thọ động cơ.
  3. Khi mặt trời lặn về hướng Tây, góc quay trục xoay servo của hệ thống sẽ tiến gần về góc bao nhiêu độ? $\to$ **$170^\circ$ (hoặc $180^\circ$)**.

### Bài 19: Radar siêu âm quét góc tọa độ cực (`id: "radar"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: Động cơ Servo quét góc `GPIO 14`, Cảm biến siêu âm HC-SR04P (Trig `GPIO 12`, Echo `GPIO 13`), Màn hình hiển thị tọa độ cực Radar.
- **Chân kết nối**: `GPIO 14` (Servo), `GPIO 12` (Trig), `GPIO 13` (Echo), GND, 5V.
- **Hành vi kỳ vọng**: Servo xoay quét qua lại từ $0^\circ$ đến $180^\circ$ (bước $1^\circ$). Cảm biến đo khoảng cách tại mỗi góc quét, chuyển đổi tọa độ cực $(\theta, d)$ sang Descartes và vẽ vệt quét phát quang màu xanh phốt-pho lưu ảnh mờ dần.
- **Mã C++ Template**:
  ```cpp
  #include <ESP32Servo.h>
  Servo radarServo;
  const int TRIG = 12;
  const int ECHO = 13;
  void setup() {
    Serial.begin(115200);
    radarServo.attach(14);
    pinMode(TRIG, OUTPUT);
    pinMode(ECHO, INPUT);
  }
  void loop() {
    for (int angle = 0; angle <= 180; angle += 2) {
      radarServo.write(angle);
      delay(30);
      digitalWrite(TRIG, HIGH);
      delayMicroseconds(10);
      digitalWrite(TRIG, LOW);
      long dur = pulseIn(ECHO, HIGH, 25000);
      float d = dur * 0.0343 / 2.0;
      Serial.printf("%d,%.1f.\n", angle, d);
    }
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin, PWM
  import time
  servo = PWM(Pin(14), freq=50)
  print("Ultrasonic Radar 180-deg sweep active...")
  ```
- **Trắc nghiệm Quiz**:
  1. Hệ tọa độ cực (Polar Coordinate System) xác định vị trí của một mục tiêu trong không gian bằng 2 thông số nào? $\to$ **Khoảng cách bán kính ($r$) và Góc phương vị ($\theta$)**.
  2. Công thức lượng giác chuẩn nào dùng để đổi tọa độ cực $(r, \theta)$ sang tọa độ Descartes $(x, y)$? $\to$ **$x = r \cdot \cos(\theta)$ và $y = r \cdot \sin(\theta)$**.
  3. Tại sao trong thuật toán quét góc radar, cần phải có khoảng thời gian trễ nhỏ (delay khoảng 30ms) sau mỗi bước quay servo? $\to$ **Chờ cho động cơ servo quay ổn định vào vị trí góc mới** trước khi phát xung siêu âm để tránh sai số đo động.

### Bài 20: Cánh tay gắp phôi động cơ bước (`id: "stepper"`)
- **Phân khúc tuổi**: Band C (14–20).
- **Linh kiện phần cứng**: Động cơ bước NEMA17 lưỡng cực, Mạch điều khiển A4988 / DRV8825 (STEP `GPIO 19`, DIR `GPIO 21`), Nam châm điện 5V nối qua transistor MOSFET `GPIO 22`, Trục vít me $8\text{mm}$.
- **Chân kết nối**: `GPIO 19` (Step), `GPIO 21` (Dir), `GPIO 22` (Magnet), Nguồn công suất 12V cho Stepper, GND.
- **Hành vi kỳ vọng**: Động cơ bước quay 200 bước/vòng ($1.8^\circ/\text{bước}$) dẫn động vít me pitch $8\text{mm}$, đạt độ phân giải chính xác $0.04\text{ mm/bước}$. Kích hoạt nam châm điện chân `GPIO 22` để hút viên bi thép, di chuyển tới tọa độ đích và thả vào khay phân loại.
- **Mã C++ Template**:
  ```cpp
  #include <AccelStepper.h>
  #define STEP_PIN 19
  #define DIR_PIN 21
  #define MAGNET_PIN 22
  AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);
  void setup() {
    pinMode(MAGNET_PIN, OUTPUT);
    stepper.setMaxSpeed(1000);
    stepper.setAcceleration(500);
  }
  void loop() {
    // Di chuyen toi khay phoi va hut bi thep
    stepper.moveTo(2000); // 2000 buoc = 80mm
    stepper.runToPosition();
    digitalWrite(MAGNET_PIN, HIGH); // Bat nam cham
    delay(500);
    stepper.moveTo(500);
    stepper.runToPosition();
    digitalWrite(MAGNET_PIN, LOW);  // Tha phoi
    delay(1000);
  }
  ```
- **Mã MicroPython Template**:
  ```python
  from machine import Pin
  import time
  step = Pin(19, Pin.OUT)
  dir_p = Pin(21, Pin.OUT)
  mag = Pin(22, Pin.OUT)
  dir_p.value(1)
  mag.value(1)
  for _ in range(2000):
      step.value(1); time.sleep_us(500)
      step.value(0); time.sleep_us(500)
  mag.value(0)
  ```
- **Trắc nghiệm Quiz**:
  1. Một động cơ bước tiêu chuẩn 200 bước/vòng (1.8° mỗi bước) điều khiển trục vít me có bước ren (Pitch) là 8mm. Mỗi một xung bước (Step) cánh tay sẽ dịch chuyển tịnh tiến được bao nhiêu mm? $\to$ **$0.04\text{ mm}$** ($8\text{mm} / 200 = 0.04\text{ mm}$).
  2. Ưu điểm vượt trội của động cơ bước (Stepper Motor) so với động cơ DC thông thường là gì? $\to$ **Khả năng định vị vị trí góc chính xác tuyệt đối mà không cần cảm biến hồi tiếp góc (Encoder)**.
  3. Để điều khiển đóng ngắt dòng điện cho nam châm điện hoặc van điện từ cuộn dây công suất, ta cần sử dụng linh kiện trung gian bán dẫn nào? $\to$ **Transistor MOSFET công suất (hoặc Relay)** kèm đi-ốt dập xung ngược.
- **Huy hiệu mở khóa**: `Mechatronics Pro`.

---

## 8. Ma Trận Phân Tầng Nhận Thức & Gamification (Age Bands Matrix)

| Thuộc Tính / Năng Lực | Band A: Kid Spark | Band B: Block Explorer | Band C: Maker Pro |
| :--- | :--- | :--- | :--- |
| **Độ tuổi mục tiêu** | 5 – 8 tuổi | 9 – 13 tuổi (Mặc định) | 14 – 20 tuổi |
| **Trọng tâm sư phạm** | Cảm giác trực quan, tương tác chạm, âm thanh tức thì | Logic trực quan, cấu trúc rẽ nhánh, lắp ráp breadboard | Lập trình văn bản C++/MicroPython, IoT, Cơ điện tử |
| **Trình soạn thảo Code** | Ẩn hoàn toàn (`showCodeEditor: false`) | Ẩn (`showCodeEditor: false`) | Kích hoạt mã kép C++/Python (`showCodeEditor: true`) |
| **Sơ đồ chân Pinout** | Ẩn hoàn toàn (`showPinout: false`) | Hiển thị (`showPinout: true`) | Hiển thị đầy đủ 30/38 chân (`showPinout: true`) |
| **Visual Story Cards** | Hiển thị (`showStoryCards: true`) | Ẩn (`showStoryCards: false`) | Ẩn (`showStoryCards: false`) |
| **Visual Block Workspace** | Ẩn (`showBlockWorkspace: false`) | Hiển thị (`showBlockWorkspace: true`) | Ẩn (`showBlockWorkspace: false`) |
| **Kích thước nút bấm tối thiểu** | $\ge 64\text{px} \times 64\text{px}$ | $\ge 44\text{px} \times 44\text{px}$ | $\ge 36\text{px} \times 36\text{px}$ |
| **Phản hồi âm thanh** | Web Audio tức thời $\le 20\text{ ms}$ | Có âm click & chime khi chạy khối | Có âm UART, còi báo lỗi & chime |
| **Chủ đề màu sắc (CSS Theme)**| Tím ấm (`#1a162b`), bo tròn $24\text{px}$ | Xanh đại dương (`#0b1528`), bo $16\text{px}$ | Slate IDE tối (`#0a0d14`), bo $10\text{px}$ |
| **Điểm kinh nghiệm (XP)** | $+50\text{ XP}$ / bài học hoàn thành | $+100\text{ XP}$ / bài học hoàn thành | $+150\text{ XP}$ / bài học hoàn thành |
| **Thưởng Quiz lần đầu** | N/A | $+25\text{ XP}$ khi đúng $3/3$ | $+25\text{ XP}$ khi đúng $3/3$ |
| **Huy hiệu đạt được** | "Blink Master", "Acoustic Wizard" | "Blink Master", "Acoustic Wizard", "Mechatronics Pro" | Toàn bộ 4 huy hiệu ("IoT Explorer", "Mechatronics Pro") |

---

## 9. Đặc Tả Tương Tác Giao Diện Người Dùng & Các Hộp Thoại (UI & Modals)

1. **Vòng đời thực thi mã nguồn (Execution State Machine)**:
   - Các trạng thái hợp lệ: `idle`, `uploading`, `running`.
   - Chuỗi nạp chương trình:
     ```
     [User clicks Run / Spacebar]
                  │
                  ▼
     data-state="uploading"
     Log: "Compiling sketch…" (hoặc "Parsing MicroPython script…")
     Đèn UART TX/RX nhấp nháy mô phỏng truyền dữ liệu
                  │ (delay 600ms)
                  ▼
     Log: "Connecting to ESP32 on USB…"
                  │ (delay 600ms)
                  ▼
     Log: "Writing… 100 %. Hard resetting via RTS pin."
                  │
                  ▼
     data-state="running"
     Mô phỏng chu kỳ cập nhật phần cứng update(time) bắt đầu
                  │
     [User clicks Stop / Spacebar]
                  ▼
     data-state="idle"
     Gỡ bỏ toàn bộ vệt sáng line-tracing is-running
     ```

2. **Các hộp thoại Modal**:
   - **Hộp thoại Sơ đồ chân (Pinout Modal `#modal-pinout`)**:
     - Nút kích hoạt: `#btn-pinout`.
     - Phím tắt / Đóng: `#btn-close-pinout` hoặc phím `Escape`.
     - Nội dung: Bảng ma trận 30/38 chân với 4 nhóm nhãn mã màu: Nguồn (`power`), Đất (`gnd`), Chỉ đầu vào (`input-only`), Tín hiệu/PWM/ADC (`io`).
   - **Hộp thoại Câu đố thử thách (Quiz Modal `#modal-quiz`)**:
     - Nút kích hoạt: `#btn-quiz` hoặc tự động hiển thị sau khi chạy code.
     - Phím tắt / Đóng: `#btn-close-quiz` hoặc phím `Escape`.
     - Nội dung: 3 câu hỏi trắc nghiệm có 4 phương án lựa chọn, nút kiểm tra kết quả, hiển thị giải thích đáp án khoa học tức thì. Đạt $\ge 2/3$ câu được ghi nhận hoàn thành bài học.
   - **Hộp thoại Cài đặt hệ thống (Settings Modal `#modal-settings`)**:
     - Nút kích hoạt: `#btn-settings`.
     - Phím tắt / Đóng: `#btn-close-settings` hoặc phím `Escape`.
     - Nội dung: 5 tùy chọn bật/tắt (Nhãn chỉ dẫn 3D, Lưới tọa độ sàn mờ, Bàn xoay tự động, Âm thanh Web Audio, Giảm chuyển động Reduced Motion), kèm nút xóa sạch toàn bộ tiến trình (`#btn-reset-progress`).
   - **Thẻ sơ đồ nguyên lý nổi (Floating Schematic `#floating-schematic`)**:
     - Nút kích hoạt: `#btn-schematic` (đồng bộ `aria-pressed`).
     - Thanh kéo kích thước `#sch-grip`: Kẹp trong khoảng $[200\text{px}, 600\text{px}] \times [140\text{px}, 500\text{px}]$.
     - Tiêu đề header có thể kéo rê chuột/chạm tự do trên khung hình.

3. **Màn hình giám sát nối tiếp (Serial Monitor Resizing)**:
   - Phần tử: `#serial-panel` và `#serial-grip`.
   - Vùng kích thước cho phép: Chiều cao bị chặn dưới bởi $56\text{px}$ và chặn trên bởi $360\text{px}$ (hoặc chiều cao khung bao trừ $48\text{px}$). Chiều cao chuẩn mặc định $92\text{px}$.
   - Cử chỉ chuột: Nhấn đúp chuột vào tay kéo `#serial-grip` lập tức khôi phục về $92\text{px}$.
   - Lưu trữ trạng thái: Lưu trong `localStorage.getItem("learn-esp32-serial-h")` hoặc `localStorage.getItem("console-height")`.

4. **Điểm ngắt Responsive (Responsive Breakpoints)**:
   - Ngưỡng kích hoạt: Chiều rộng cửa sổ $W < 1090\text{px}$ HOẶC chiều cao cửa sổ $H < 800\text{px}$.
   - Hành vi DOM: Bổ sung lớp CSS `compact` lên thẻ `<body>` hoặc phần tử `.app-workspace`.
   - Bố cục biến đổi: Chuyển đổi từ bố cục 3 cột cố định (`280px 1fr 400px`) sang bố cục 1 cột cuộn xếp tầng (`grid-template-columns: 1fr`, `grid-template-rows: auto 1fr auto`).

---
*Báo cáo được hoàn thành và đối chiếu 100% với đặc tả kỹ thuật hộp đen clean-room đã phê duyệt.*
