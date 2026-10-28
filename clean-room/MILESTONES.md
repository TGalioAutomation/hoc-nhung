# Kế Hoạch Lộ Trình Triển Khai 4 Giai Đoạn (4-Phase Milestone Plan)
## Nền Tảng Học Nhúng & Lập Trình ESP32 Đa Phân Tầng Nhận Thức (5–20 Tuổi)

- **Mã hiệu dự án:** `EMBEDDED-KIDS-TO-PRO`
- **Tài liệu căn cứ:** `clean-room/SPEC.approved.md` & `clean-room/TASK_BRIEF.md`
- **Cơ quan thẩm quyền:** Milestone Planner (`planner`, Flash Tier) — Enterprise Software Company
- **Đích xuất bản:** `clean-room/MILESTONES.md`

---

## 1. Tổng Quan Sáng Kiến (Executive Overview)
Sáng kiến xây dựng một nền tảng WebApp mô phỏng phần cứng vi điều khiển ESP32 DevKit và giáo dục lập trình nhúng thích ứng cao, đáp ứng 3 phân tầng nhận thức từ 5 đến 20 tuổi (Band A: 5–8 tuổi Kid Spark; Band B: 9–13 tuổi Block Explorer; Band C: 14–20 tuổi Maker Pro). Hệ thống hoạt động hoàn toàn ở phía client (Client-side 100%), bảo đảm an toàn điện áp/dòng điện theo thời gian thực, trực quan hóa tín hiệu đa phương thức và hỗ trợ lộ trình sư phạm chuẩn hóa qua 20 bài học tích hợp.

Kế hoạch lộ trình được cấu trúc thành **4 giai đoạn thực thi khép kín độc lập**, kiểm soát chặt chẽ dung lượng mô-đun ($\le 400\text{ dòng/file}$), triệt để tuân thủ Quy tắc Cách ly Phòng sạch (Clean-Room Epistemic Isolation) và ràng buộc kiểm định 3 biến thể đột biến (Mutation Testing).

---

## 2. Yêu Cầu & Ranh Giới Phạm Vi (Requirements & Scope Boundaries)

### 2.1. Yêu cầu Cốt lõi
- **RULE-001**: Bộ điều phối phân tầng độ tuổi (`band-a`, `band-b`, `band-c`), lưu trữ `localStorage("user-age-band")`, phát sự kiện `ageBandChanged`, cập nhật `data-age-band` trên `<html>` trong $\le 50\text{ ms}$.
- **RULE-002**: Bảng ánh xạ chân ESP32 30/38 pin, bảo vệ quá áp logic $5\text{ V}$ (`OVERVOLTAGE_WARNING`), chặn `OUTPUT` trên chân thuần đầu vào GPIO 34/35/36/39 (`PIN_CANNOT_BE_OUTPUT`), tính toán dòng điện Ohm và phá hủy nhiệt (`COMPONENT_BURNED_STATE` khi $R_{series} = 0\ \Omega$ hoặc $I > 40\text{ mA}$), khóa ADC2 khi bật Wi-Fi, mã màu dây tiêu chuẩn.
- **RULE-003**: Trải nghiệm cảm giác trực quan 1-chạm Band A (6 bài học: Blink, Fridge Guard, Siren, Touch Piano latency $\le 20\text{ ms}$, Mood Lamp, Night Light LDR threshold 50%), UI tối giản không chữ, kích thước nút $\ge 64\text{px}$, TTS giọng đọc tiếng Việt.
- **RULE-004**: Không gian kéo thả khối Blockly & mạch cắm Breadboard Band B (4 dự án: WS2812B 12 Neopixel, HC-SR04 siêu âm + OLED SSD1306, Laser barrier + Servo $90^\circ$, Điều tốc DC qua PWM/Cầu H).
- **RULE-005**: Hệ thống tiến trình 20 bài học, lưu `localStorage("learn-esp32-progress")`, điều kiện đạt (chạy $\ge 3000\text{ ms}$ không lỗi hoặc đỗ Quiz $\ge 2/3$), thanh tiến trình ARIA đồng bộ `"{N}/20"`, bảng điểm XP (50/100/150 XP + 25 XP first try) và 4 danh hiệu, tính năng reset `data-reset`.
- **RULE-006**: Máy trạng thái thực thi mã (`idle` $\to$ `uploading` $\to$ `running`), mô phỏng nạp USB UART $1200\text{ ms}$ + LED TX/RX nhấp nháy, thay thế tham số tương tác `{{paramKey}}`, vệt sáng truy vết dòng lệnh `.line.is-running`, Serial Monitor $115200\text{ bps}$ có thanh co giãn độ cao $92\text{px} \le h \le (\text{wrapHeight} - 48\text{px})$.
- **RULE-007**: Mô phỏng mạng không dây Band C (Wi-Fi Web Server SoftAP `192.168.1.42` với endpoint `/toggle`, Bluetooth BLE SPP Serial lệnh `"ON"/"OFF"/"DIM"`, mạng lưới ESP-NOW Board-to-Board độ trễ $<5\text{ ms}$ kèm suy hao mất gói sigmoidal khi khoảng cách $>100\text{ m}$).
- **RULE-008**: Cơ điện tử tự động hóa Band C (Bơm nước trễ Hysteresis $20\% - 90\%$, Khóa ma trận phím 4x3 mật mã `"1234"` kèm khóa 30s sau 3 lần sai, Pin mặt trời bám nắng kép vùng chết $\delta = 15$, Radar siêu âm quét cực Polar display, Cánh tay gắp vi bước vít me AccelStepper nam châm điện).
- **RULE-009**: Không gian mô phỏng 3D/2D, phím tắt camera (`W/A/S/D`, `+/-`, `Q/E`, `R` reset trong $400\text{ ms}$, Double-click focus linh kiện), Part Inspector `#inspector` và dây chỉ dẫn `#insp-lines`, Floating Schematic có thể kéo rê và co giãn kích thước.
- **RULE-010**: Cấu hình môi trường (`labels`, `grid`, `autoRotate` sau $4000\text{ ms}$ idle, `sound` Web Audio mute, `reducedMotion` tween speed factor $0.05$), đa ngôn ngữ Tiếng Việt, responsive compact mode ($W < 1090\text{px}$ hoặc $H < 800\text{px}$).

### 2.2. Ranh giới Ngoài Phạm Vi (Out of Scope)
- Không gọi bất kỳ backend server hay cơ sở dữ liệu từ xa nào; toàn bộ trạng thái lưu trữ Local-first (`localStorage` / Web Worker).
- Không nhúng các thư viện 3D dung lượng lớn (Three.js nặng hoặc asset binary cồng kềnh) vượt quá ngân sách bộ nhớ; ưu tiên kiến trúc Lightweight Canvas/SVG và WebGL thuần để duy trì RAM $<250\text{MB}$ và CPU nhàn rỗi $<40\%$.
- Không lưu thông tin định danh cá nhân của trẻ em (tuân thủ COPPA/GDPR-K).

---

## 3. Kiến Trúc Cấu Trúc Mã Nguồn (Target File Architecture)

Toàn bộ mã nguồn mới được phân rã theo nguyên tắc trách nhiệm đơn lẻ (Single Responsibility Principle) và giới hạn dòng nghiêm ngặt ($<400\text{ dòng/file}$):

```
src/
├── core/
│   ├── constants.js          # Các hằng số điện áp, dòng điện, chân cắm, baudrate, timeouts
│   ├── events.js             # Event Bus trung tâm (ageBandChanged, simulationStateChanged, ...)
│   └── storage.js            # Lớp bọc LocalStorage an toàn (fallback bộ nhớ đệm nếu lỗi quota)
├── engine/
│   ├── pinout.js             # Ma trận chân ESP32 30/38 pin, phân loại GPIO, ADC1/ADC2, Touch
│   ├── circuit-math.js       # Tính toán định luật Ohm, nhiệt trở tải, sóng âm, chia áp LDR
│   ├── safety-guards.js      # Kiểm tra quá áp 5V, chân input-only, ngắt mạch cháy nổ
│   ├── code-runner.js        # Máy trạng thái thực thi (idle/uploading/running), template parser
│   ├── execution-tracer.js   # Quét DOM và đồng bộ highlight vệt sáng dòng lệnh (.is-running)
│   ├── serial-console.js     # Giả lập Serial Monitor 115200 bps, bộ đệm UART, thanh co giãn
│   ├── progress.js           # Bộ tính điểm XP, huy hiệu, tỷ lệ hoàn thành 20 bài học
│   └── engine.js             # Bộ điều phối chính kết nối các mô-đun hạt nhân
├── bands/
│   ├── band-orchestrator.js  # Chuyển đổi giao diện 3 lứa tuổi, cập nhật data-age-band <= 50ms
│   ├── band-a.js             # Logic 6 bài học xúc giác Kid Spark, Web Audio synthesizer
│   ├── band-b.js             # Không gian khối lệnh Blockly, dây cắm testboard, 4 dự án Band B
│   └── band-c.js             # Trình biên tập song song, nạp code, giao thức không dây & cơ điện tử
├── protocols/
│   ├── wifi-server.js        # Mô phỏng Web Server cục bộ 192.168.1.42, nút toggle LED
│   ├── espnow.js             # Mô phỏng lưới ESP-NOW Board-to-Board, tính toán suy hao khoảng cách
│   └── ble-serial.js         # Mô phỏng Bluetooth Serial SPP ghép đôi và giải mã lệnh văn bản
├── mechatronics/
│   ├── pump-controller.js    # Logic trễ Hysteresis 20%-90% điều khiển rơ-le máy bơm
│   ├── keypad-lock.js        # Quét ma trận 4x3, đối soát mật mã 1234, khóa 30 giây
│   ├── solar-tracker.js      # Giải thuật bám nắng 2 cảm biến quang trở, vùng chết delta=15
│   ├── radar-scanner.js      # Quét Servo 0-180 độ, tính toán tọa độ cực Polar, vệt phốt-pho
│   └── stepper-arm.js        # Điều khiển trục vít me vi bước AccelStepper, nam châm gắp phôi
├── viewport/
│   ├── viewport.js           # Bố cục 2D/3D Canvas/SVG, điều khiển chuột và cảm ứng đa điểm
│   ├── camera.js             # Quản lý Pan/Zoom/Rotate/Reset (400ms tween), phím W/A/S/D/Q/E/R
│   ├── inspector.js          # Part Inspector (#inspector), gợi ý (#tip), đường chỉ dẫn (#insp-lines)
│   └── floating-schematic.js # Hộp thoại sơ đồ nguyên lý kéo rê và co giãn (button.sch-grip)
├── settings/
│   ├── settings-manager.js   # 5 cờ tùy chọn (labels, grid, autoRotate, sound, reducedMotion)
│   └── responsive.js         # Bộ giám sát kích thước khung hình compact (W < 1090px, H < 800px)
├── curriculum/
│   └── lessons-data.js       # Bảng cơ sở dữ liệu 20 bài học, câu hỏi Quiz, sơ đồ mạch mẫu
└── i18n/
    └── vi.js                 # Từ điển bản địa hóa tiếng Việt và chuẩn hóa ký hiệu quốc tế
```

---

## 4. Các Giai Đoạn Triển Khai Chi Tiết (Implementation Steps)

### Giai Đoạn 1: Minimum Viable Slice (MVS) — Hạt Nhân Động Cơ Mô Phỏng (Core Engine)
*Mục tiêu:* Thiết lập nền tảng động cơ xử lý logic điện tử, quản lý ma trận chân ESP32, cơ chế an toàn điện áp, máy trạng thái nạp mã, bộ đệm Serial và tính toán tiến trình học tập.

1. **Khởi tạo Hằng số & Hệ Thống Sự Kiện Nền Tảng** (`src/core/constants.js`, `src/core/events.js`, `src/core/storage.js`)
   - **Hành động**: Định nghĩa các hằng số điện tử danh định ($V_{IO} = 3.3\text{ V}$, $V_{5V} = 5.0\text{ V}$, $I_{max} = 40\text{ mA}$, $I_{safe} = 20\text{ mA}$, baudrate $115200$). Xây dựng Event Bus nội bộ không phụ thuộc framework ngoài và lớp truy xuất `LocalStorage` có bọc cơ chế xử lý ngoại lệ (QuotaExceeded / Private Mode).
   - **Lý do**: Chuẩn hóa toàn bộ tham số kỹ thuật theo RULE-001, RULE-002, RULE-005, RULE-006, loại bỏ giá trị cứng phân tán (magic numbers).
   - **Phụ thuộc**: Không có.
   - **Rủi ro**: Thấp (Low).

2. **Xây dựng Bảng Ánh Xạ Chân & Ma Trận Ràng Buộc Điện Tử** (`src/engine/pinout.js`)
   - **Hành động**: Lập chỉ mục đầy đủ 30 chân và 38 chân của ESP32 DevKit V1. Gắn cờ thuộc tính: Chân đầu vào thuần túy (`isInputOnly`: GPIO 34, 35, 36, 39); Kênh ADC1 (`GPIO 32..36, 39`) và ADC2; 8 kênh cảm ứng Touch (`GPIO 0, 2, 4, 12, 13, 14, 15, 27, 32, 33`).
   - **Lý do**: Hiện thực hóa hợp đồng dữ liệu cho RULE-002.
   - **Phụ thuộc**: `src/core/constants.js`.
   - **Rủi ro**: Trung bình (Medium) — cần kiểm tra chính xác từng chân để tránh báo lỗi sai lệch.

3. **Hiện thực Hàng Rào An Toàn Điện Tử & Mô Phỏng Vật Lý Cháy Nổ** (`src/engine/safety-guards.js`, `src/engine/circuit-math.js`)
   - **Hành động**: Cài đặt kiểm tra kết nối:
     * Cảnh báo `OVERVOLTAGE_WARNING` nếu nguồn cấp chân tín hiệu vượt $3.3\text{ V}$ (đặc biệt nguồn $5\text{ V}$).
     * Ném lỗi tĩnh `PIN_CANNOT_BE_OUTPUT` nếu cấu hình `pinMode(pin, OUTPUT)` trên các chân GPIO 34/35/36/39.
     * Tính toán dòng điện theo định luật Ohm $I = (V_{GPIO} - V_{forward}) / R_{series}$. Chuyển linh kiện sang `COMPONENT_BURNED_STATE` nếu $R_{series} = 0\ \Omega$ hoặc $I > 40\text{ mA}$.
     * Khóa kênh ADC2 khi Wi-Fi được kích hoạt.
   - **Lý do**: Bảo đảm tính chân thực và tính giáo dục về an toàn phần cứng theo RULE-002.
   - **Phụ thuộc**: `src/engine/pinout.js`.
   - **Rủi ro**: Trung bình (Medium).

4. **Xây dựng Bộ Điều Phối Lứa Tuổi & Bộ Theo Dõi Tiến Trình** (`src/bands/band-orchestrator.js`, `src/engine/progress.js`)
   - **Hành động**: Xây dựng hàm chuyển đổi chế độ (`band-a`, `band-b`, `band-c`), lưu trữ `localStorage("user-age-band")`, bắn sự kiện `ageBandChanged` và gán thuộc tính `data-age-band` trên `<html>` trong $\le 50\text{ ms}$. Hiện thực bộ đếm tiến trình 20 bài học, công thức phần trăm $\lfloor (N_{completed} / 20) \times 100 \rfloor\%$, thuộc tính ARIA, tính điểm XP (50/100/150 + 25), danh hiệu và hành vi xóa sạch `data-reset`.
   - **Lý do**: Đáp ứng trọn vẹn RULE-001 và RULE-005.
   - **Phụ thuộc**: `src/core/events.js`, `src/core/storage.js`.
   - **Rủi ro**: Thấp (Low).

5. **Xây dựng Máy Trạng Thái Thực Thi Mã & Console Nối Tiếp** (`src/engine/code-runner.js`, `src/engine/execution-tracer.js`, `src/engine/serial-console.js`)
   - **Hành động**: Xây dựng bộ điều khiển trạng thái `.code-card[data-state]` (`idle` $\to$ `uploading` $\to$ `running`). Giả lập chuỗi thông báo nạp USB qua RTS pin với 2 nhịp trễ $600\text{ ms}$ (tổng $1200\text{ ms}$), chớp nháy đèn TX/RX ảo. Hiện thực bộ thay thế tham số tương tác `{{paramKey}}`. Cài đặt phương thức `trace({ text, nth })` gắn nhãn `.is-running` cho dòng mã đang chạy. Xây dựng Serial Monitor $115200\text{ bps}$ có thanh kéo co giãn chiều cao chặn dưới $92\text{px}$.
   - **Lý do**: Đáp ứng trọn vẹn RULE-006.
   - **Phụ thuộc**: `src/core/events.js`, `src/core/constants.js`.
   - **Rủi ro**: Trung bình (Medium).

6. **Tích hợp Hạt Nhân Động Cơ Mô Phỏng Hoàn Chỉnh** (`src/engine/engine.js`)
   - **Hành động**: Kết nối toàn bộ các mô-đun trên thành một API hợp nhất (`ESP32Engine`), cung cấp vòng lặp mô phỏng `update(timestamp)`, quản lý tải linh kiện và phát các tín hiệu vòng đời.
   - **Lý do**: Hoàn tất Minimum Viable Slice (MVS) cho phép chạy thử nghiệm độc lập ở tầng logic.
   - **Phụ thuộc**: Các bước 1, 2, 3, 4, 5.
   - **Rủi ro**: Thấp (Low).

---

### Giai Đoạn 2: Core Capability — Hoàn Thiện 3 Phân Tầng Lứa Tuổi & 20 Dự Án Sư Phạm
*Mục tiêu:* Hiện thực đầy đủ trải nghiệm sư phạm cho cả 3 phân khúc lứa tuổi, tích hợp khối lệnh Blockly, tương tác mạch ảo Breadboard, giả lập mạng không dây IoT và các hệ cơ điện tử phức hợp.

1. **Hiện thực Tầng Nhận Thức Band A: Trải Nghiệm Xúc Giác Kid Spark** (`src/bands/band-a.js`)
   - **Hành động**: Xây dựng giao diện thẻ tranh tối giản không văn bản, các nút bấm biểu tượng kích thước $\ge 64\text{px} \times 64\text{px}$. Triển khai 6 kịch bản học tập xúc giác:
     1. `blink`: Đèn nhấp nháy chạm đổi chu kỳ $100\text{ ms} - 1500\text{ ms}$ (bước $50\text{ ms}$), 3 màu Đỏ/Vàng/Xanh lá.
     2. `button`: Tủ lạnh góc mở $\theta > 12^\circ$, quá thời gian chờ gia hạn $t_{grace} \in [1000, 10000\text{ ms}]$ thì hú còi Web Audio $2400\text{ Hz}$ và nháy đèn đỏ.
     3. `sound`: Còi xe cứu hỏa trượt tần số dao động hình sin $400\text{ Hz} - 1200\text{ Hz}$.
     4. `piano`: 8 phím đồng cảm ứng chạm nốt C4–C5, độ trễ phát âm thanh $\le 20\text{ ms}$.
     5. `rgb`: Quả cầu mờ khuếch tán ánh sáng hòa trộn RGB $0..255$.
     6. `light`: Cảm biến LDR thanh trượt che tối, ngưỡng kích hoạt $50\%$.
     Tích hợp Web Audio API synthesizer và phát âm tên linh kiện tiếng Việt.
   - **Lý do**: Đáp ứng trọn vẹn RULE-003.
   - **Phụ thuộc**: `src/engine/engine.js`.
   - **Rủi ro**: Trung bình (Medium) — cần kiểm soát latency âm thanh trên thiết bị di động.

2. **Hiện thực Tầng Nhận Thức Band B: Lập Trình Khối & Breadboard** (`src/bands/band-b.js`)
   - **Hành động**: Tích hợp bộ tạo khối trực quan (Block-to-AST Compiler) hỗ trợ `setup()`, `loop()`, `delay()`, `digitalWrite()`, `digitalRead()`, `analogWrite()`, `analogRead()`, cấu trúc điều kiện `if/else`. Triển khai 4 dự án thực hành:
     1. `knob`: Vòng 12 Neopixel WS2812B điều khiển bởi biến trở ADC $0..4095$ theo công thức $N_{lit} = \lfloor (ADC/4095) \times 12 \rfloor$, 3 chế độ màu (`blue`, `rainbow`, `traffic`).
     2. `sensor`: Thước đo siêu âm HC-SR04 ($d \in [2, 400\text{ cm}]$, $\Delta t = 2d / 0.0343$) hiển thị màn hình OLED SSD1306 và thanh đo đồ họa.
     3. `servo`: Rào chắn laser đỏ, ngắt tia quang học làm Servo quay từ $0^\circ \to 90^\circ$ vận tốc $180^\circ/\text{s}$, giữ $3000\text{ ms}$ rồi hồi vị.
     4. `motor`: Điều tốc động cơ DC qua cầu H với chu kỳ PWM $0..100\%$, vận tốc quay $\omega$ tuyến tính.
   - **Lý do**: Đáp ứng trọn vẹn RULE-004.
   - **Phụ thuộc**: `src/engine/engine.js`.
   - **Rủi ro**: Trung bình (Medium).

3. **Hiện thực Mô Phỏng Không Dây IoT Band C** (`src/protocols/wifi-server.js`, `src/protocols/espnow.js`, `src/protocols/ble-serial.js`)
   - **Hành động**: Triển khai 3 giao thức mạng:
     * Máy chủ Web Wi-Fi ảo (Bài 4): IP tĩnh `192.168.1.42`, giao diện điện thoại ảo gửi GET `/toggle` đảo trạng thái GPIO 2 LED và phản hồi HTTP 200.
     * Bluetooth Serial SPP (Bài 13): Nhận dạng `ESP32-Lamp` / `Night-Light`, ghép đôi ảo, xử lý lệnh `"ON"`, `"OFF"`, `"DIM"`.
     * Lưới không dây ESP-NOW (Bài 14): Bo mạch phát gửi MAC broadcast, bo mạch thu nhận ngắt `OnDataRecv` với độ trễ $t < 5\text{ ms}$; thanh trượt khoảng cách $0.5\text{ m} - 150\text{ m}$, mô hình mất gói tin tăng lũy tiến sigmoidal khi $d > 100\text{ m}$.
   - **Lý do**: Đáp ứng trọn vẹn RULE-007.
   - **Phụ thuộc**: `src/engine/engine.js`.
   - **Rủi ro**: Trung bình (Medium).

4. **Hiện thực Hệ Thống Cơ Điện Tử & Robot STEM Band C** (`src/mechatronics/*.js`, `src/bands/band-c.js`)
   - **Hành động**: Triển khai 5 mô hình cơ điện tử chuyên sâu:
     * `pump-controller.js`: Điều khiển bơm nước hồi tiếp trễ (Hysteresis) đóng rơ-le bơm khi $H \le 20\%$ ($+5\%/\text{s}$), ngắt rơ-le khi $H \ge 90\%$, giữ nguyên khi $20\% < H < 90\%$.
     * `keypad-lock.js`: Bàn phím ma trận 4x3 (7 GPIOs), phím `*` xóa chuỗi + bíp $2000\text{ Hz}$, phím `#` đối soát mật mã `"1234"` (mở chốt Servo), báo âm trầm $400\text{ Hz}$ khi sai, khóa 30 giây nếu sai quá 3 lần.
     * `solar-tracker.js`: Pin mặt trời 2 quang trở $LDR_{left}, LDR_{right}$, góc quét $\theta_{sun} \in [0^\circ, 180^\circ]$, vùng chết $\delta = 15$; điều chỉnh góc bước $\pm 1^\circ$ khi lệch vượt vùng chết.
     * `radar-scanner.js`: Cảm biến siêu âm quét Servo $0^\circ - 180^\circ$ bước $1^\circ$, vẽ màn hình tọa độ cực Polar plot vệt phốt-pho xanh lục lưu ảnh mờ dần.
     * `stepper-arm.js`: Cánh tay gắp vi bước vít me ($1.8^\circ/\text{bước}$, độ chính xác $\pm 0.04\text{ mm}$), nam châm điện kích hoạt hút/thả bi thép phân loại.
   - **Lý do**: Đáp ứng trọn vẹn RULE-008.
   - **Phụ thuộc**: `src/engine/engine.js`.
   - **Rủi ro**: Cao (High) — độ phức tạp tính toán mô phỏng vật lý cao, cần tối ưu render.

5. **Hoàn Thiện Cơ Sở Dữ Liệu 20 Bài Học Sư Phạm** (`src/curriculum/lessons-data.js`)
   - **Hành động**: Nạp đầy đủ thông số cấu hình, linh kiện, sơ đồ dây cắm và bộ 3 câu hỏi Quiz tương tác cho toàn bộ 20 bài học từ Bài 01 đến Bài 20 theo đúng Bảng Ma Trận Phân Bổ (Curriculum Matrix).
   - **Lý do**: Cung cấp nội dung hoàn chỉnh kết nối trực tiếp với thanh tiến trình học tập.
   - **Phụ thuộc**: Các bước triển khai bài học ở trên.
   - **Rủi ro**: Thấp (Low).

---

### Giai Đoạn 3: Resilience & Edge Cases — Khung Nhìn 3D/2D, Camera, Sơ Đồ Mạch Nổi & An Toàn Biên
*Mục tiêu:* Xây dựng khung nhìn đồ họa tương tác mượt mà, bộ điều khiển camera với cử chỉ phím/chuột, hộp thoại kiểm tra linh kiện, sơ đồ nguyên lý nổi và xử lý triệt để toàn bộ các ca lỗi biên.

1. **Xây dựng Bộ Điều Khiển Camera & Khung Nhìn Đồ Họa** (`src/viewport/viewport.js`, `src/viewport/camera.js`)
   - **Hành động**: Triển khai các thao tác điều khiển khung nhìn:
     * Pan: Phím `W`, `A`, `S`, `D` hoặc kéo chuột/chạm.
     * Zoom: Phím `+`, `-`, cuộn chuột hoặc thao tác chụm 2 ngón (Pinch).
     * Turn 90°: Phím `Q` (trái $90^\circ$), `E` (phải $90^\circ$), hoặc kéo chuột giữa.
     * Reset View: Phím `R` hoặc nhấn đúp vùng trống chuyển động camera mượt về mặc định trong $400\text{ ms}$.
     * Focus linh kiện: Nhấn đúp linh kiện di chuyển camera lại gần và mở `#inspector`. Phím `Escape` đóng hộp thoại.
   - **Lý do**: Hiện thực hóa tương tác không gian theo RULE-009.
   - **Phụ thuộc**: Không có (độc lập tầng hiển thị).
   - **Rủi ro**: Trung bình (Medium).

2. **Hiện thực Hộp Thoại Kiểm Tra Linh Kiện & Đường Chỉ Dẫn Động** (`src/viewport/inspector.js`)
   - **Hành động**: Xây dựng tooltip gợi ý hover `#tip`. Khi chọn linh kiện, mở `#inspector` hiển thị thông số điện tử và thanh trượt tham số. Tự động tính toán tọa độ chiếu 3D sang màn hình và vẽ các đường véc-tơ `#insp-lines` nối từ tâm linh kiện tới thẻ thông tin.
   - **Lý do**: Đáp ứng yêu cầu Part Inspector Dialog trong RULE-009.
   - **Phụ thuộc**: `src/viewport/camera.js`.
   - **Rủi ro**: Trung bình (Medium) — cần cập nhật tọa độ liên tục khi camera di chuyển.

3. **Hiện thực Thẻ Sơ Đồ Mạch Điện Nguyên Lý Nổi (Floating Schematic Card)** (`src/viewport/floating-schematic.js`)
   - **Hành động**: Xây dựng thẻ sơ đồ nổi: Kéo rê phần đầu thẻ để di chuyển tự do khắp màn hình; góc trên bên trái gắn nút tay nắm `button.sch-grip` hỗ trợ kéo co giãn kích thước sơ đồ; nút đóng `×` và nút bật/tắt trên thanh công cụ `viewbar button[data-view="schematic"]` đồng bộ thuộc tính `aria-pressed="true|false"`.
   - **Lý do**: Đáp ứng yêu cầu Floating Schematic Card trong RULE-009.
   - **Phụ thuộc**: `src/core/events.js`.
   - **Rủi ro**: Thấp (Low).

4. **Kiểm Soát Rắn Rỏi Toàn Bộ Biên Lỗi Điện Tử & Phục Hồi Trạng Thái** (`src/engine/safety-guards.js`)
   - **Hành động**: Tăng cường khả năng chịu lỗi và phản hồi an toàn:
     * Chặn ngay lập tức các xung đột chân cắm (chân cấu hình trùng lặp, cấp nguồn ngắn mạch).
     * Bẫy ngoại lệ và hiển thị giao diện đồ họa cho `OVERVOLTAGE_WARNING`, `PIN_CANNOT_BE_OUTPUT`, `COMPONENT_BURNED_STATE` (hiệu ứng tia lửa và đổi màu xám than chì).
     * Khóa an toàn 30 giây của bàn phím ma trận (Keypad Lockout) có bộ đếm thời gian thực và tự phục hồi.
     * Ngăn chặn rò rỉ bộ nhớ (Memory Leak) trong Web Audio API khi người dùng chuyển bài học liên tục.
   - **Lý do**: Bảo đảm tính kiên cường (Resilience) của hệ thống trước thao tác sai của người học.
   - **Phụ thuộc**: `src/engine/circuit-math.js`, `src/engine/safety-guards.js`.
   - **Rủi ro**: Trung bình (Medium).

---

### Giai Đoạn 4: Optimization, A11y, i18n & Kiểm Thử Đột Biến 3 Biến Thể
*Mục tiêu:* Tối ưu hóa hiệu năng thiết bị thấp, hoàn thiện khả năng trợ năng, bản địa hóa tiếng Việt, quản lý cài đặt môi trường và xác minh độc lập qua bộ test suite kết hợp 3 bản đột biến (Mutation Testing).

1. **Hiện thực Trình Quản Lý Cài Đặt Môi Trường** (`src/settings/settings-manager.js`)
   - **Hành động**: Lưu trữ và áp dụng đối tượng cấu hình tại `localStorage("learn-esp32-settings")` với 5 cờ:
     1. `labels`: Bật/tắt nhãn văn bản và mũi tên không gian (mặc định: `true`).
     2. `grid`: Bật/tắt lưới tọa độ sàn (mặc định: `true`).
     3. `autoRotate`: Tự động quay bàn xoay chậm sau $4000\text{ ms}$ không có tương tác người dùng (mặc định: `false`).
     4. `sound`: Ngắt tiếng toàn bộ Web Audio khi `false` (mặc định: `true`).
     5. `reducedMotion`: Giảm hệ số tốc độ chuyển động Tween xuống $0.05$ khi bật hoặc khi trình duyệt kích hoạt `@media (prefers-reduced-motion: reduce)` (mặc định: `false`).
   - **Lý do**: Đáp ứng đầy đủ RULE-010.
   - **Phụ thuộc**: `src/core/storage.js`, `src/core/events.js`.
   - **Rủi ro**: Thấp (Low).

2. **Bản Địa Hóa Tiếng Việt & Thiết Kế Thích Ứng Màn Hình Nhỏ** (`src/i18n/vi.js`, `src/settings/responsive.js`)
   - **Hành động**:
     * Cung cấp từ điển tiếng Việt chuẩn mực cho toàn bộ nhãn, hướng dẫn bài học, giải thích thuật toán; bảo lưu chính xác các ký hiệu quốc tế: `GPIO`, `PWM`, `ADC`, `DAC`, `I2C`, `SPI`, `UART`, `Baud`, `OLED`, `Servo`, `Stepper`, `Relay`, `Neopixel`, `ESP-NOW`.
     * Theo dõi kích thước màn hình: Khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$, tự động kích hoạt lớp CSS `compact`, chuyển đổi sang bố cục thẻ xếp chồng (Tabbed Mobile Stack) tối ưu cho tablet.
   - **Lý do**: Đáp ứng tiêu chuẩn trải nghiệm và quy tắc giao diện trong RULE-010.
   - **Phụ thuộc**: Không có.
   - **Rủi ro**: Thấp (Low).

3. **Tối Ưu Hóa Hiệu Năng & Trợ Năng Đạt Chuẩn WCAG** (`src/viewport/viewport.js`, `src/bands/band-orchestrator.js`)
   - **Hành động**:
     * Tối ưu hóa chu kỳ render bằng `requestAnimationFrame`, loại bỏ tính toán dư thừa khi nhàn rỗi, bảo đảm CPU $<40\%$ và RAM $<250\text{MB}$.
     * Bổ sung đầy đủ nhãn ngữ nghĩa ARIA: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-pressed`, `aria-live="polite"` cho các thông báo trạng thái mô phỏng.
     * Đảm bảo mọi nút tương tác trên Band A có vùng chạm $\ge 48\text{px}$ (ưu tiên $\ge 64\text{px}$).
   - **Lý do**: Đảm bảo tiêu chuẩn sư phạm trẻ em và tính ổn định trên máy tính học sinh cấu hình thấp.
   - **Phụ thuộc**: Các mô-đun giao diện.
   - **Rủi ro**: Thấp (Low).

4. **Xây Dựng Bộ Kiểm Thử Tự Động Toàn Diện** (`tests/unit/`, `tests/integration/`)
   - **Hành động**: Soạn thảo bộ test tự động kiểm tra 100% các quy tắc từ RULE-001 đến RULE-010:
     * `test_rule_001_age_orchestrator.js`: Kiểm tra chuyển chế độ, lưu storage, bắn sự kiện trong $\le 50\text{ ms}$.
     * `test_rule_002_pinout_safety.js`: Kiểm tra `OVERVOLTAGE_WARNING`, chặn `OUTPUT` trên GPIO 34..39, công thức Ohm và `COMPONENT_BURNED_STATE` khi $R = 0\ \Omega$ hoặc $I > 40\text{ mA}$.
     * `test_rule_003_band_a.js`: Kiểm tra 6 bài học Band A, độ trễ âm thanh $\le 20\text{ ms}$, ngưỡng LDR $50\%$, tủ lạnh góc $12^\circ$.
     * `test_rule_004_band_b.js`: Kiểm tra công thức Neopixel $N_{lit}$, đo xung siêu âm $\Delta t$, Servo $90^\circ$ và PWM động cơ.
     * `test_rule_005_progress_xp.js`: Kiểm tra điều kiện hoàn thành bài học, công thức phần trăm, cộng XP, danh hiệu, reset.
     * `test_rule_006_code_runner.js`: Kiểm tra 3 trạng thái, nhịp trễ $1200\text{ ms}$, vệt sáng `.is-running`, console $92\text{px}$.
     * `test_rule_007_wireless_iot.js`: Kiểm tra Web Server `/toggle`, Bluetooth lệnh text, ESP-NOW độ trễ $<5\text{ ms}$ và hàm suy hao.
     * `test_rule_008_mechatronics.js`: Kiểm tra Hysteresis bơm $20\%-90\%$, mã khóa 1234 và lockout 30s, vùng chết bám nắng $\delta = 15$.
     * `test_rule_009_viewport_camera.js`: Kiểm tra phím tắt W/A/S/D/Q/E/R, reset $400\text{ ms}$, floating schematic.
     * `test_rule_010_settings_i18n.js`: Kiểm tra 5 cờ cấu hình, responsive compact $W < 1090\text{px}$.
   - **Lý do**: Đáp ứng phương pháp luận Verification-Driven Engineering.
   - **Phụ thuộc**: Toàn bộ mã nguồn hoàn thiện.
   - **Rủi ro**: Thấp (Low).

5. **Xây Dựng & Xác Minh 3 Bản Biến Thể Đột Biến (3-Mutant Verification)** (`clean-room/mutants/`)
   - **Hành động**: Thiết lập 3 biến thể cố tình làm sai lệch logic theo yêu cầu Clean-Room Testing:
     * `mutant-1` (Phá vỡ hàng rào an toàn điện tử): Cho phép cấu hình GPIO 34 làm `OUTPUT` hoặc bỏ qua kiểm tra dòng $I > 40\text{ mA}$, không kích hoạt `COMPONENT_BURNED_STATE`.
     * `mutant-2` (Phá vỡ logic phân tầng & tiến trình): Tính sai công thức tỷ lệ tiến trình hoặc không phát sự kiện `ageBandChanged` trong thời gian $\le 50\text{ ms}$, hoặc cộng sai điểm XP.
     * `mutant-3` (Phá vỡ giải thuật vật lý & cơ điện tử): Tính sai công thức thời gian phản hồi siêu âm $\Delta t$ hoặc đảo ngược vùng chết bám nắng $\delta = 15$ làm hệ thống rung lắc liên tục.
   - **Lý do**: Chứng minh năng lực phát hiện lỗi của bộ test suite (Bản chính PASS 100%, 3 Mutants FAIL 100%).
   - **Phụ thuộc**: Bộ test suite hoàn chỉnh.
   - **Rủi ro**: Trung bình (Medium).

---

## 5. Chiến Lược Kiểm Thử & Nghiệm Thu (Testing & Verification Strategy)

### 5.1. Bảng Ma Trận Lệnh Thực Thi Kiểm Thử
| Mục Tiêu Kiểm Thử | Lệnh Shell / Script Thực Thi | Tiêu Chuẩn Nghiệm Thu Nhị Phân |
| :--- | :--- | :--- |
| **Lint & Cú Pháp** | `npm run lint` hoặc `node --check src/**/*.js` | Exit code 0, 0 error, 0 warning. |
| **Kiểm Thử Đơn Vị (Unit Tests)** | `npm test` hoặc `node --test tests/unit/*.test.js` | 100% test cases PASS, độ bao phủ logic $\ge 85\%$. |
| **Kiểm Thử Tích Hợp (Integration)** | `node --test tests/integration/*.test.js` | 100% test luồng chuyển trạng thái và sự kiện PASS. |
| **Kiểm Thử Đột Biến (Mutants)** | `npm run test:mutants` | Bản chính PASS 100%; Cả 3 Mutants **FAIL 100%**. |
| **Hiệu Năng & Tài Nguyên** | Đo kiểm bộ nhớ qua Node/Headless Browser | RAM $\le 250\text{MB}$, CPU nhàn rỗi $\le 40\%$. |

---

## 6. Đánh Giá Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)

| Rủi Ro Nhận Diện | Mức Độ | Tác Động Tiềm Ẩn | Biện Pháp Giảm Thiểu Chủ Động |
| :--- | :---: | :--- | :--- |
| **Tràn bộ đệm âm thanh Web Audio trên iPad** | Cao | Gây nghẽn âm thanh hoặc treo trình duyệt khi trẻ em bấm phím đàn liên tục. | Sử dụng hồ chứa âm thanh đối tượng (Audio Context Object Pool) và tái sử dụng các bộ dao động (Oscillator nodes) thay vì tạo mới liên tục. |
| **Độ trễ render Canvas khi mô phỏng động cơ/radar** | Trung bình | Tụt khung hình dưới 60 FPS trên máy tính cấu hình yếu của trường học. | Phân tách lớp vẽ: Nền tĩnh (Background/Grid) vẽ 1 lần trên OffscreenCanvas, chỉ vẽ lại các thành phần động (tia quét radar, bánh xe quay) trong `requestAnimationFrame`. |
| **Xung đột sự kiện chuyển chế độ lứa tuổi** | Thấp | Giao diện bị trộn lẫn giữa khối Blockly và giao diện tranh minh họa. | Áp dụng cờ trạng thái đơn nguyên (Atomic State Flag) và dọn dẹp (cleanup/unmount) triệt để DOM của phân tầng cũ trước khi khởi tạo phân tầng mới. |
| **Lỗi Quota bộ nhớ LocalStorage trên trình duyệt ẩn danh** | Thấp | Trình duyệt ném ngoại lệ làm gián đoạn việc lưu điểm XP và tiến trình. | Bọc toàn bộ các hàm đọc/ghi `storage.js` trong khối `try/catch` với bộ nhớ đệm dự phòng trên RAM (In-Memory Map Fallback). |

---

## 7. Tiêu Chí Hoàn Thành Nhị Phân (Binary Success Criteria)

Dự án chỉ được coi là hoàn thành khi đáp ứng toàn bộ các tiêu chí nhị phân kiểm chứng được dưới đây:

- [ ] **Kế hoạch Lộ trình Hoàn thiện**: File `clean-room/MILESTONES.md` tồn tại, phân rã đầy đủ 4 giai đoạn với đường dẫn file cụ thể, lý do, phụ thuộc và phân loại rủi ro.
- [ ] **Phase 1 (MVS) Hoàn Thành**: Động cơ hạt nhân `src/engine/engine.js` và các mô-đun an toàn điện tử vượt qua 100% các bài kiểm tra cho RULE-001, RULE-002, RULE-005, RULE-006.
- [ ] **Phase 2 (Core Capability) Hoàn Thành**: Cả 3 dải tuổi Band A, Band B, Band C và đủ 20 bài học sư phạm hoạt động chính xác theo RULE-003, RULE-004, RULE-007, RULE-008.
- [ ] **Phase 3 (Resilience) Hoàn Thành**: Khung nhìn đồ họa, camera tương tác phím/chuột, hộp thoại linh kiện, sơ đồ mạch nổi và toàn bộ các hàng rào an toàn điện tử (`OVERVOLTAGE_WARNING`, `PIN_CANNOT_BE_OUTPUT`, `COMPONENT_BURNED_STATE`) vận hành trơn tru theo RULE-009.
- [ ] **Phase 4 (Polish & Verification) Hoàn Thành**: Quản lý cài đặt môi trường, bản địa hóa tiếng Việt, responsive compact mode hoạt động hoàn hảo theo RULE-010.
- [ ] **Xác Minh Đột Biến Tuyệt Đối**: Bản triển khai chính đạt tỷ lệ kiểm thử **PASS 100%**; đồng thời cả 3 bản đột biến (`mutant-1`, `mutant-2`, `mutant-3`) đạt kết quả **FAIL 100%**.
- [ ] **Không Vi Phạm Clean-Room**: 100% mã nguồn được xây dựng mới từ đầu dựa trên bản đặc tả `clean-room/SPEC.approved.md`, không sao chép bất kỳ đoạn mã gốc nào.
