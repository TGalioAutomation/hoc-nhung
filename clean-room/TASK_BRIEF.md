# BẢN ĐẶC TẢ CHIẾN LƯỢC SẢN PHẨM & TASK BRIEF ĐIỀU HÀNH
## DỰ ÁN: NỀN TẢNG HỌC NHÚNG & LẬP TRÌNH ESP32 ĐA PHÂN TẦNG LỨA TUỔI (5–20 TUỔI)
**Mã hiệu dự án:** `EMBEDDED-KIDS-TO-PRO`  
**Cơ quan điều hành:** Chief of Staff (`chief-of-staff`) — Enterprise Software Company  
**Phân loại sáng kiến (4-Tier Classification):** `action_required` (Tier 4)  
**Địa chỉ tài liệu:** `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/TASK_BRIEF.md`

---

## 1. PHÂN LOẠI & BỐI CẢNH CHIẾN LƯỢC (STRATEGIC INTAKE & TRIAGE)

### 1.1. Đánh giá phân loại theo Khung 4 Cấp (4-Tier Classification)
- **Cấp độ:** `action_required` (Tier 4).
- **Căn cứ phân loại:** Yêu cầu tái thiết kế toàn diện một nền tảng học lập trình nhúng ESP32 hiện có thành một WebApp học tập tương tác, ứng dụng cơ chế trò chơi hóa (gamification) thích ứng linh hoạt theo độ tuổi trải dài từ **5 đến 20 tuổi**. Đây là sáng kiến kỹ thuật cấp chiến lược đòi hỏi thiết kế kiến trúc hệ thống (System Architecture), phân tách sư phạm theo lứa tuổi, tuân thủ nghiêm ngặt Quy trình Phòng sạch (Clean-Room Protocol) và điều phối đa chuyên gia (Multi-Agent Squad).

### 1.2. Tầm nhìn Sản phẩm (Product Vision)
Xây dựng một nền tảng WebApp mô phỏng phần cứng nhúng và lập trình IoT tương tác hàng đầu, hiện thực hóa triết lý giáo dục hiện đại:
> *"Sàn thấp, Tường rộng, Trần cao (Low Floor, Wide Walls, High Ceiling)"*
- **Sàn thấp (Low floor):** Một bé 5 tuổi chưa biết đọc chữ vẫn có thể tự tin chạm ghép mạch điện phát sáng đèn LED và phát nhạc qua truyện kể hoạt hình.
- **Tường rộng (Wide walls):** Cung cấp vô số chủ đề ứng dụng sáng tạo (nhà thông minh, robot thám hiểm, âm nhạc điện tử, bảo vệ môi trường, xe tự hành).
- **Trần cao (High ceiling):** Một bạn học sinh THPT hay sinh viên đại học 20 tuổi có thể đi sâu vào thanh ghi vi điều khiển ESP32, lập trình C++ FreeRTOS, vi mạch IoT kết nối WiFi/MQTT và nạp trực tiếp vào bo mạch thật qua Web Serial API.

---

## 2. KIẾN TRÚC SƯ PHẠM & 3 PHÂN TẦNG LỨA TUỔI (AGE-TIER SPECIFICATION)

```
       5–8 Tuổi                   9–13 Tuổi                  14–20 Tuổi
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│       TIER 1         │   │       TIER 2         │   │       TIER 3         │
│   Kid Spark          │──►│   Block Explorer     │──►│   Maker Pro          │
│ (Mầm Non Công Nghệ)  │   │  (Nhà Thám Hiểm Nhí) │   │  (Kỹ Sư Tương Lai)   │
├──────────────────────┤   ├──────────────────────┤   ├──────────────────────┤
│ • Chạm - Kéo - Thả   │   │ • Khối Blockly/      │   │ • Blockly ◄► Code    │
│ • Không dùng chữ     │   │   Scratch logic      │   │   MicroPython / C++  │
│ • LED RGB, Còi Chip  │   │ • Virtual Breadboard │   │ • ESP32 GPIO/I2C/ADC │
│ • Truyện tranh audio │   │ • Gamification: XP,  │   │ • WiFi/MQTT/IoT Dash │
│ • Âm thanh/Màu sắc   │   │   Huy hiệu, Mini-bot │   │ • Web Serial nạp nạp │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

---

### 2.1. TIER 1: "MẦM NON CÔNG NGHỆ" (KID SPARK — 5 ĐẾN 8 TUỔI)

#### Đối tượng & Tâm lý lứa tuổi
- Trẻ mẫu giáo lớn và học sinh lớp 1–2.
- Khả năng đọc chữ và vận động tinh (fine motor skills) đang phát triển; tư duy hình tượng, phản ứng cực nhạy với màu sắc rực rỡ, âm thanh vui nhộn và hiệu ứng nguyên nhân - kết quả (Cause & Effect) tức thì.

#### Giao diện & Trải nghiệm tương tác (Interaction Paradigm)
- **Giao diện không cần chữ (Zero-Text / Minimal Text UI):** Sử dụng các biểu tượng (Iconographic Cards) khổ lớn, bo góc tròn thân thiện, màu sắc pastel sinh động.
- **Chạm & Bắt dính thông minh (Magnetic Snap Touch):** Trẻ chỉ cần kéo thẻ đèn hoặc còi lại gần bo mạch, dây nối tự động bắt dính với hiệu ứng rung nhẹ (haptic) và âm thanh "tách" vui tai.
- **Hỗ trợ giọng đọc Audio/TTS:** Toàn bộ nhiệm vụ được kể qua giọng đọc hoạt hình truyền cảm (Story-driven Audio Prompts), ví dụ: *"Bé ơi, trời tối rồi, hãy giúp bạn Thỏ bật chiếc đèn ngủ nhé!"*.

#### Mô-đun phần cứng mô phỏng & Thí nghiệm mẫu
- **Đèn LED RGB 7 màu:** Chạm đổi màu sắc (Đỏ, Vàng, Xanh, Tím...), điều chỉnh độ sáng bằng thanh trượt mặt trời.
- **Còi chip Buzzer:** Bộ phím đàn nốt nhạc Đồ - Rê - Mi - Pha - Son, mô phỏng còi xe cứu hỏa, chuông cửa.
- **Cảm biến ánh sáng (LDR):** Kéo biểu tượng đám mây che ông mặt trời -> Đèn tự động bừng sáng.
- **Quạt động cơ Mini:** Thổi gió xua tan mây, quay chong chóng 7 màu.

#### Cơ chế Gamification
- Cốt truyện phiêu lưu hoạt hình: *"Hành trình thắp sáng Vương quốc Ánh sáng"*.
- Phần thưởng: Pháo hoa Confetti, huy hiệu sao lấp lánh, sticker hoạt hình vui nhộn được dán vào sổ tay kỹ sư nhí.

---

### 2.2. TIER 2: "NHÀ THÁM HIỂM NHÍ" (BLOCK EXPLORER — 9 ĐẾN 13 TUỔI)

#### Đối tượng & Tâm lý lứa tuổi
- Học sinh tiểu học cuối cấp và THCS.
- Bắt đầu hình thành tư duy trừu tượng, logic tuần tự (sequence), câu lệnh điều kiện (`nếu ... thì`), vòng lặp (`lặp lại 10 lần`), biến số (`điểm số`, `khoảng cách`).

#### Giao diện & Trải nghiệm tương tác (Interaction Paradigm)
- **Lập trình kéo thả khối chuẩn mực (Blockly / Scratch-Style):** Các khối lệnh màu sắc phân theo danh mục: Sự kiện (Events), Chân I/O (Pins), Logic, Vòng lặp (Loops), Toán học (Math), Biến (Variables).
- **Bo mạch thử nghiệm ảo (Virtual Breadboard & Interactive Wiring):** Người học tự tay chọn dây cắm (jumper wires) với màu sắc tùy ý (Đỏ: VCC, Đen: GND, Xanh: Signal), cắm vào các lỗ trên testboard mô phỏng, nhận diện chân cắm đúng/sai có phản hồi tức thì.

#### Mô-đun phần cứng mô phỏng & Thí nghiệm mẫu
- **Cảm biến siêu âm HC-SR04:** Mô phỏng vật cản di động bằng chuột -> ESP32 đọc khoảng cách tính bằng centimet.
- **Màn hình OLED 0.96 inch (I2C):** Hiển thị văn bản, icon trái tim, mặt cười, đồng hồ đếm ngược.
- **Cảm biến nhiệt độ & độ ẩm DHT11:** Giả lập nhiệt độ phòng, kích hoạt quạt làm mát khi trời nóng.
- **Động cơ Servo SG90 (PWM):** Điều khiển góc quay 0° - 180° làm thanh chắn barie bãi đỗ xe hoặc cửa tự động.

#### Cơ chế Gamification & Thử thách STEM
- **Hệ thống nhiệm vụ cốt truyện Smart Home & Robot:**
  - *Thử thách 1:* "Đèn đường tự động thông minh".
  - *Thử thách 2:* "Hệ thống báo trộm bằng cảm biến siêu âm".
  - *Thử thách 3:* "Thùng rác thông minh tự động mở nắp khi có tay lại gần".
- **Hệ thống thưởng:** Điểm kinh nghiệm XP, cấp độ Maker Rank (Tập sự -> Thợ máy -> Nhà phát minh), Bộ sưu tập linh kiện ảo trong kho đồ (Inventory).

---

### 2.3. TIER 3: "KỸ SƯ TƯƠNG LAI" (MAKER PRO — 14 ĐẾN 20 TUỔI)

#### Đối tượng & Tâm lý lứa tuổi
- Học sinh THPT, sinh viên đại học kỹ thuật (Điện tử, CNTT, Cơ điện tử, Tự động hóa) và cộng đồng Maker trẻ.
- Nhu cầu học tập thực chất, chuẩn bị cho các kỳ thi Khoa học Kỹ thuật (ISEF), Tin học trẻ, thi Robocon, xây dựng đồ án môn học và định hướng nghề nghiệp kỹ sư nhúng/IoT.

#### Giao diện & Trải nghiệm tương tác (Interaction Paradigm)
- **Trình biên tập đa phương thức kép (Dual-Pane Editor):**
  - Cửa sổ song song: Khối lệnh (Blockly) bên trái ◄—► Mã nguồn thực bên phải (MicroPython / C++ Arduino Framework).
  - Tự động sinh mã (Live Code Generation) mượt mà không độ trễ.
  - Cho phép chuyển đổi linh hoạt: Bắt đầu từ khối để dựng khung nhanh, sau đó chuyển hẳn sang Pro Code Mode với bộ gõ Monacó/VS Code, syntax highlighting, autocompletion và inline linting.
- **Mô phỏng phần cứng chuyên sâu (Deep ESP32 SoC Emulation):**
  - Mô phỏng chân GPIO Digital I/O (INPUT, OUTPUT, INPUT_PULLUP).
  - Ngắt ngoài (Hardware Interrupts: `attachInterrupt`).
  - Điều chế độ rộng xung PWM phần cứng (LEDC / Timer PWM).
  - Đọc tín hiệu tương tự ADC 12-bit & DAC 8-bit.
  - Giao thức truyền thông nối tiếp: UART (Serial Monitor tương tác 2 chiều), I2C Bus, SPI Bus.
- **Mô phỏng mạng & IoT Dashboard (WiFi / MQTT Simulation):**
  - Giả lập kết nối mạng WiFi ảo (STA / AP mode).
  - Gửi dữ liệu telemetry qua MQTT Broker giả lập; bảng điều khiển IoT Dashboard tích hợp sẵn (nút bấm điều khiển từ xa qua mạng, đồng hồ đo gauge, biểu đồ đường vẽ nhiệt độ thời gian thực).
- **Tích hợp nạp phần cứng thực tế (Web Serial API Hardware Flashing):**
  - Kết nối trực tiếp bo mạch ESP32 thật qua cáp USB từ trình duyệt Chrome/Edge bằng Web Serial API.
  - Biên dịch và nạp code (MicroPython REPL hoặc C++ compiled binary) trực tiếp từ WebApp xuống bo mạch vật lý mà không cần cài đặt Arduino IDE hay driver phức tạp.

---

## 3. QUY TRÌNH ĐIỀU PHỐI TỔ ĐỘI CHUYÊN GIA (SQUAD DELEGATION PLAN)

Theo Quy chế Vận hành Enterprise Software Company và Quy tắc Clean-Room Epistemic Isolation, toàn bộ nhiệm vụ được phân rã cho các Sub-Agent chuyên trách với phân bổ Model Tier chuẩn xác:

| Sub-Agent (`TypeName`) | Phân hạng Model | Vai trò & Trách nhiệm Độc lập trong Dự án | Deliverable / Output Yêu cầu |
| :--- | :--- | :--- | :--- |
| **`rea`** | `pro` | **Chuyên viên Phân tích Đảo ngược (Reverse Engineering Analyst)**.<br>Khảo sát các tính năng cơ bản của app tham khảo qua góc nhìn hộp đen (Black-box), trích xuất toàn bộ hành vi, nguyên lý mạch và quy tắc sư phạm vào `clean-room/SPEC.md` kèm bằng chứng xác thực (`Proof`). Tuyệt đối không sao chép mã nguồn gốc. | `clean-room/SPEC.md` |
| **`jev`** | `flash` (CLI `typesafe/jev-1.13`) | **Thẩm tra viên & Cổng phê duyệt (Judge & Evidence Verifier)**.<br>Chạy `jev --audit clean-room/SPEC.md` (nơi duy nhất dùng `OPENROUTER_API_KEY`), kiểm định độ tin cậy Noul (Evidence >= 0.50, Deterministic >= 0.50, Clean-Room >= 0.60), loại bỏ toàn bộ dấu vết mã gốc, sản sinh bản đặc tả hợp chuẩn. | `clean-room/SPEC.approved.md` |
| **`planner`** | `flash` | **Chuyên gia Lập lộ trình (Milestone Planner)**.<br>Phân rã dự án thành 4 giai đoạn độc lập: Phase 1 (MVS), Phase 2 (Core Capability), Phase 3 (Resilience & Edge Cases), Phase 4 (Polish & Optimization) với ranh giới file rõ ràng và tiêu chí nghiệm thu nhị phân. | `clean-room/MILESTONES.md` |
| **`code-architect`** | `pro` | **Kiến trúc sư Hệ thống (Principal System Architect)**.<br>Thiết kế cấu trúc tổng thể: Simulator Engine Core, Web Workers xử lý tín hiệu, Reactive State Management, Blockly Custom Blocks, Web Serial Interface, lưu trữ tiến độ học tập và kiểm soát kích thước file (<400 dòng). | `clean-room/ARCH_BLUEPRINT.md` |
| **`clean-room-builder`** | `pro` | **Lập trình viên Phòng sạch (Clean-Room Builder)**.<br>Triển khai mã nguồn độc lập từ `clean-room/SPEC.approved.md` và `ARCH_BLUEPRINT.md` dưới sự bảo vệ của Antigravity Firewall Hook. Không bao giờ được đọc app gốc hay `SPEC.md` thô. Chỉ hoạt động sau khi có lệnh `"go"`. | Toàn bộ mã nguồn WebApp trong `/src` |
| **`clean-room-tester`** | `flash` | **Kiểm thử viên Đột biến (Clean-Room Mutation Tester)**.<br>Xây dựng bộ kiểm thử tự động độc lập từ Spec; tạo 3 phiên bản đột biến cố tình phá vỡ logic (`mutant-1`, `mutant-2`, `mutant-3`) trong `clean-room/mutants/`. Đảm bảo bản chính PASS 100% và cả 3 mutants đều FAIL. | Test Suite & Báo cáo Mutation Testing |

---

## 4. PHẠM VI DỰ ÁN (SCOPE SPECIFICATION)

### 4.1. Mục tiêu Cốt lõi (Explicit Goals)
1. **Kiến trúc WebApp Thống nhất & Tương thích Đa nền tảng:**
   - Ứng dụng PWA (Progressive Web App) chạy mượt mà trên iPad/Tablet màn hình cảm ứng (cho lứa tuổi 5–8) lẫn Laptop/Máy tính để bàn (cho lứa tuổi 9–20).
   - Tự động lưu trữ tiến độ (Local-first qua IndexedDB/LocalStorage), bảo vệ dữ liệu cá nhân theo đạo luật COPPA/GDPR cho trẻ em.
2. **Động cơ Mô phỏng Phần cứng Trực quan (Virtual Hardware Engine):**
   - Bộ mô phỏng chạy 100% Client-side bằng JavaScript / Web Workers / WebAssembly; không phụ thuộc vào máy chủ backend, đạt độ trễ tương tác dưới 50ms.
   - Thư viện linh kiện mô phỏng chân thực: ESP32 DevKit V1, Breadboard 830 lỗ, LED 5mm, LED RGB Common Cathode/Anode, Điện trở (hỗ trợ đọc dải màu), Còi Buzzer chủ động/bị động, Cảm biến ánh sáng LDR, Cảm biến siêu âm HC-SR04, Cảm biến DHT11, Servo SG90, Màn hình OLED SSD1306.
3. **Bộ chuyển đổi Mã nguồn & Khối lệnh Đồng bộ:**
   - Blockly Engine tùy biến riêng cho ESP32.
   - Trình chuyển đổi 2 chiều thời gian thực (Real-time Code Generator) sang MicroPython và C++ (Arduino).
4. **Cổng Kết nối Phần cứng Thật (Web Serial Hardware Bridge):**
   - Hỗ trợ giao tiếp qua cổng USB nối tiếp ngay trên trình duyệt (Web Serial API), gửi lệnh REPL trực tiếp tới ESP32 thật.

### 4.2. Ranh giới & Giới hạn Kỹ thuật (Boundaries & Constraints)
- **Tối ưu hóa hiệu năng thiết bị thấp:** Không sử dụng các thư viện 3D cồng kềnh gây tụt khung hình trên Chromebook hoặc iPad học sinh. Mô hình mạch điện 2D SVG/Canvas được tối ưu hóa vector sắc nét, hỗ trợ zoom/pan mượt 60 FPS.
- **Ranh giới lứa tuổi linh hoạt:** Cho phép người dùng chuyển đổi tự do giữa các phân tầng (Mode Switcher) kèm mã khóa phụ huynh/giáo viên (Parental Gate) nếu muốn cố định chế độ cho trẻ nhỏ.
- **Phạm vi bảo mật:** Tuyệt đối không lưu trữ thông tin nhạy cảm của trẻ em. Không yêu cầu đăng ký tài khoản bắt buộc để bắt đầu học.

### 4.3. Các Hành động Bị Cấm (Prohibited Actions)
- **CẤM VI PHẠM CLEAN-ROOM:** Tuyệt đối không để bất kỳ model hoặc agent nào viết mã tham chiếu trực tiếp mã nguồn của trang `https://learn-esp32.vercel.app`.
- **CẤM PHỨC TẠP HÓA NGÔN NGỮ Ở TIER 1 & 2:** Nghiêm cấm đưa thuật ngữ kỹ thuật hàn lâm (như `bitmask`, `register`, `hex address`, `null pointer`) vào giao diện của lứa tuổi 5–13.
- **CẤM RÒ RỈ OPENROUTER API KEY:** Chỉ duy nhất công cụ CLI `jev` được phép gọi model `typesafe/jev-1.13`. Toàn bộ quá trình lập luận, viết code, review của các agent khác phải chạy 100% native trên hạ tầng Antigravity.

---

## 5. CỔNG DỪNG BẮT BUỘC (STOP CONDITIONS)

Quá trình điều phối bắt buộc phải kích hoạt DỪNG KHẨN CẤP hoặc CHỜ PHÊ DUYỆT trong các tình huống sau:

1. **Cổng Dừng Độc quyền Phê duyệt Người dùng (The Human "go" Stop Gate):**
   - Sau khi `rea` hoàn thành `clean-room/SPEC.md` và `jev` audit thành công ra `clean-room/SPEC.approved.md`, **HỆ THỐNG DỪNG LẠI HOÀN TOÀN**.
   - Tuyệt đối không kích hoạt `clean-room-builder` cho đến khi người dùng (Executive / PO) trực tiếp kiểm tra đặc tả và đưa ra phê duyệt chính thức bằng mệnh lệnh `"go"`.
2. **Cổng Dừng Kiểm định Jev (Audit Rejection Gate):**
   - Nếu `jev --audit` trả về điểm số dưới ngưỡng quy định:
     - `Evidence Score < 0.50`
     - `Deterministic Score < 0.50`
     - `Clean-Room Score < 0.60`
     - Hoặc có bất kỳ quy tắc nào bị đánh dấu `REJECTED`.
   - Lập tức dừng chuỗi, trả lại cho `rea` điều tra và bổ sung căn cứ thực nghiệm hộp đen cho đến khi đạt chuẩn 100%.
3. **Cổng Dừng Tràn Tài Nguyên & Hiệu Năng (Resource Budget Gate):**
   - Nếu giải pháp mô phỏng chạy thử nghiệm trên máy client làm CPU vượt quá 40% ở chế độ nhàn rỗi hoặc RAM vượt 250MB, hệ thống phải dừng lại để xem xét lại kiến trúc rendering.

---

## 6. TIÊU CHÍ HOÀN THÀNH NHỊ PHÂN (DONE-WHEN CRITERIA)

Dự án chỉ được coi là hoàn thành khi thỏa mãn toàn bộ các điều kiện nhị phân (Đạt / Không đạt) dưới đây:

- [ ] **Tài liệu Task Brief & Chiến lược Sản phẩm:** File `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/TASK_BRIEF.md` tồn tại, bao hàm đầy đủ 3 phân tầng tuổi (5–8, 9–13, 14–20), quy định rõ Scope, Stop Conditions, Done-When và kế hoạch squad.
- [ ] **Bản Đặc tả Hành vi Phòng sạch:** File `clean-room/SPEC.md` được tạo bởi `rea`, trích xuất 100% hành vi chức năng mà không mang mã nguồn sao chép.
- [ ] **Kiểm định Jev Thành công:** File `clean-room/SPEC.approved.md` được sinh tự động bởi lệnh `jev --audit`, đạt chỉ số Noul hợp lệ và xóa sạch mọi tham chiếu file nội bộ cũ.
- [ ] **Phê duyệt Cổng Người dùng:** Có xác nhận văn bản `"go"` từ Executive / PO trong phiên làm việc.
- [ ] **Triển khai Mã nguồn Phòng sạch:** `clean-room-builder` hoàn tất mã nguồn độc lập, sạch 100%, tuân thủ kiến trúc mô-đun (<400 dòng/file).
- [ ] **Xác minh Kiểm thử Đột biến:** `clean-room-tester` chạy bộ test suite tự động:
  - Bản chính: **PASS 100%**.
  - Cả 3 biến thể đột biến `mutant-1`, `mutant-2`, `mutant-3`: **FAIL 100%** (chứng minh test suite đủ sâu sắc để bắt lỗi sai lệch spec).
- [ ] **Build Xanh & Zero Linter Warning:** Lệnh build dự án chạy thành công, mã nguồn vượt qua toàn bộ quy chuẩn typing và kiểm tra cú pháp.

---
*Tài liệu được phê chuẩn bởi Chief of Staff — Enterprise Software Company.*  
*Bảo lưu mọi tiêu chuẩn quản trị kỹ thuật phòng sạch của Antigravity Platform.*
