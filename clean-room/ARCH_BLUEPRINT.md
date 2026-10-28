# Bản Thiết Kế Kiến Trúc Hệ Thống (System Architecture Blueprint) & ADR
## DỰ ÁN: NỀN TẢNG HỌC NHÚNG & MÔ PHỎNG ESP32 ĐA PHÂN TẦNG LỨA TUỔI (5–20 TUỔI)
**Mã dự án:** `EMBEDDED-KIDS-TO-PRO`  
**Chuyên gia kiến trúc:** Code Architect (`code-architect`, Pro Tier) — Enterprise Software Company  
**Tiêu chuẩn tuân thủ:** Clean-Room Epistemic Isolation Protocol, SPEC.approved.md, TASK_BRIEF.md  
**Trạng thái:** `APPROVED FOR CLEAN-ROOM IMPLEMENTATION`  

---

## 1. System Topology & Context

### 1.1. Kiến trúc Tổng thể & Ranh giới Mô-đun (Module Topology)

Hệ thống được thiết kế theo mô hình **Unidirectional Reactive Architecture (Kiến trúc Phản ứng Một chiều)**, phân tách triệt để giữa:
1. **Lớp Lõi Tính Toán Thuần Túy (Pure Deterministic Core Engine - `engine.js`)**: Hoàn toàn độc lập với DOM và Web API của trình duyệt. Đảm bảo 100% khả năng kiểm thử tự động không cần môi trường giả lập DOM (Headless Testing) cho cả Node.js test runner và trình duyệt.
2. **Lớp Định Nghĩa Tri Thức Sư Phạm (Curriculum Knowledge Layer - `lessons.js`)**: Chứa danh mục 20 bài học, bảng ánh xạ chân ESP32 (Pinout Matrix), các câu hỏi đánh giá (Quiz), mã nguồn mẫu (C++ / MicroPython) và tham số tương tác.
3. **Lớp Trình Diễn & Điều Phối Giao Diện (Presentation & UI Orchestration - `app.js`)**: Điều phối sự kiện DOM, vòng lặp hoạt họa `requestAnimationFrame`, Web Audio API, thao tác Camera/Canvas 2D, và đồng bộ hóa `localStorage`.
4. **Lớp Định Phong Cách & Thích Ứng Nhận Thức (Cognitive Styling & Layout - `styles.css`)**: Điều khiển hệ thống biến màu CSS (CSS Variables) và cấu trúc hiển thị tùy biến theo 3 phân tầng tuổi (Band A, Band B, Band C) cùng cơ chế thu gọn màn hình `compact`.
5. **Khung Tài Liệu Ngữ Nghĩa (Semantic Document Shell - `index.html`)**: Cung cấp khung DOM chuẩn trợ năng (ARIA), cấu trúc các bảng điều khiển dạng nổi (Floating Panels) và thanh công cụ góc nhìn.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BROWSER DOM / VIEWPORT                             │
│                                                                                        │
│   ┌──────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐  │
│   │ Viewbar (Góc nhìn / Reset│  │ Simulation Stage (Canvas│  │ Code / Block Deck    │  │
│   │ / Chuyển chế độ Band A-C)│  │ 2D / Vector Board)      │  │ (Monaco / Blockly /  │  │
│   └─────────────┬────────────┘  └────────────┬────────────┘  │  Thẻ tranh Band A)   │  │
│                 │                            │               └──────────┬───────────┘  │
│                 │ User Action / Input Events │                          │              │
│                 ▼                            ▼                          ▼              │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │                        UI ORCHESTRATOR LAYER (`app.js`)                         │  │
│   │  • Age-Band Viewport Switching (RULE-001)                                       │  │
│   │  • Web Audio API Synthesizer (RULE-003, RULE-008, RULE-010)                     │  │
│   │  • Viewport Camera Controller: Pan / Zoom / Turn / Inspect Focus (RULE-009)     │  │
│   │  • Floating Panels: Schematic Card & Part Inspector (RULE-009)                  │  │
│   │  • State Persistence: LocalStorage Sync (RULE-001, RULE-005, RULE-006, RULE-010)│  │
│   └───────────────────────┬───────────────────────────────────▲─────────────────────┘  │
│                           │                                   │                        │
│                           │ Dispatches Actions / Parameters   │ Emits State Diffs &    │
│                           │ & Clock Ticks                     │ Traces ({ text, nth }) │
│                           ▼                                   │                        │
│   ┌───────────────────────────────────────────────────────────┴─────────────────────┐  │
│   │                 PURE DETERMINISTIC SIMULATION CORE (`engine.js`)                │  │
│   │  • Pinout Safety & Thermal Breakdown Engine (RULE-002)                          │  │
│   │  • Band A Sensory Causality Engine (RULE-003)                                   │  │
│   │  • Band B Block-to-AST & Breadboard Component Models (RULE-004)                 │  │
│   │  • Progress & XP Reward Evaluator (RULE-005)                                    │  │
│   │  • Code Runner & Serial Line Tracer FSM (RULE-006)                              │  │
│   │  • Wireless IoT & Virtual Network Simulators (RULE-007)                         │  │
│   │  • Mechatronics & Robotics Hysteresis / Closed-Loop Controllers (RULE-008)       │  │
│   └───────────────────────────────────▲─────────────────────────────────────────────┘  │
│                                       │ Ingests Static Definitions                     │
│   ┌───────────────────────────────────┴─────────────────────────────────────────────┐  │
│   │                     CURRICULUM & PINOUT REGISTRY (`lessons.js`)                 │  │
│   │  • ESP32 30/38-Pin Electrical Matrix Metadata (RULE-002)                        │  │
│   │  • 20 Sequential Lessons Catalog (Curriculum Matrix 01..20) (RULE-005)          │  │
│   │  • Quiz Questions & Interactive Parameter Templates (RULE-005, RULE-006)        │  │
│   │  • Bilingual Audio/Text Story Prompts (RULE-003, RULE-010)                      │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Architecture Decisions (ADR)

### ADR-001: Zero-Build Native ES Module Architecture + Headless Deterministic Engine for Automated 3-Mutant Verification

- **Ngày quyết định:** 2026-10-28
- **Trạng thái:** `ACCEPTED`
- **Người quyết định:** Code Architect (`code-architect`, Pro Tier)

#### Bối cảnh (Context)
Dự án yêu cầu xây dựng một ứng dụng web giáo dục lập trình nhúng ESP32 tương tác cao, hoạt động mượt mà trên nhiều thiết bị (kể cả iPad học sinh, Chromebook trường học mà không cần build step cồng kềnh), đồng thời phải tuân thủ nghiêm ngặt quy trình **Clean-Room Mutation Testing**:
- Bộ kiểm thử độc lập (`clean-room-tester`) cần chạy kiểm thử tự động trên cả bản chính và 3 bản đột biến (`mutant-1`, `mutant-2`, `mutant-3`).
- Nếu mã nguồn cốt lõi bị gắn chặt với DOM (`window`, `document`, HTML elements), các bài kiểm thử toán học, điện tử và logic chuyển trạng thái sẽ buộc phải khởi chạy headless browser nặng nề (như Playwright/Puppeteer), gây chậm chạp và khó cô lập lỗi đột biến.

#### Các phương án xem xét (Alternatives Considered)

##### Phương án 1: Dùng Bundler (Vite + Webpack + TypeScript Build Pipeline)
- **Ưu điểm:** Có kiểm tra tĩnh TypeScript lúc biên dịch; gom gói file thành một bundle duy nhất.
- **Nhược điểm:** Phụ thuộc nặng vào hệ sinh thái Node.js/npm; thời gian build kéo dài; không thể mở trực tiếp file `index.html` hoặc chạy cục bộ zero-install; khó khăn cho người dùng học sinh khi muốn tải về khám phá mã nguồn.
- **Lý do loại trừ:** Vi phạm tiêu chí "Sàn thấp" và tạo sự phức tạp không cần thiết cho quy trình Clean-Room isolated build.

##### Phương án 2: Ghép toàn bộ mã nguồn vào 1 file JS duy nhất gắn liền DOM
- **Ưu điểm:** Dễ viết nhanh trong thời gian ngắn.
- **Nhược điểm:** Vi phạm giới hạn kích thước file (<800 dòng); biến mã nguồn thành "spaghetti code"; ghép chặt tính toán vật lý với hiển thị DOM, khiến việc kiểm thử đột biến (Mutation Testing) của Tester bị tê liệt.
- **Lý do loại trừ:** Vi phạm nguyên tắc phân tách trách nhiệm và tiêu chuẩn Enterprise Architecture.

##### Phương án 3 (Được chọn): Kiến trúc Native ES Modules (ESM) + Headless Pure Deterministic Engine (`engine.js`)
- **Ưu điểm:**
  1. **Zero-Build**: Trình duyệt hiện đại hỗ trợ 100% `type="module"`. Chạy ngay lập tức với bất kỳ HTTP server tĩnh nào (hoặc chạy trực tiếp).
  2. **Headless Engine**: Toàn bộ logic vi điều khiển, tính toán định luật Ohm, bộ chuyển đổi ADC, bộ đếm thời gian, máy trạng thái FSM được đóng gói thành các hàm thuần túy (pure functions / deterministic classes) trong `engine.js` không gọi bất kỳ API DOM nào.
  3. **Mutation Testing Cực Nhanh**: Subagent `clean-room-tester` có thể import trực tiếp `engine.js` trong môi trường Node.js (sử dụng Native ESM runner) để kiểm thử hàng nghìn ca kiểm thử trong vài giây mà không cần trình duyệt.

#### Quyết định & Biện minh (Decision & Justification)
Quyết định triển khai hệ thống theo chuẩn **Zero-Build ES Modules**:
- `src/engine.js`: Export các hàm thuần và Engine Class không phụ thuộc môi trường DOM.
- `src/lessons.js`: Export dữ liệu bất biến (Object.freeze) chứa cấu hình bài học và ma trận chân.
- `src/app.js`: Nhập (`import`) `engine.js` và `lessons.js`, đóng vai trò adapter kết nối với DOM và Web Audio API.

#### Hệ quả (Consequences)
- **Tích cực:** Tốc độ thực thi cực nhanh, kiểm thử tự động độc lập 100%, dễ dàng tạo các bản đột biến logic toán học/điện tử mà không lo lỗi crash giao diện.
- **Tiêu cực:** Không có compiler kiểm tra kiểu tĩnh lúc runtime; cần sử dụng JSDoc và hợp đồng dữ liệu nghiêm ngặt để đảm bảo an toàn kiểu.
- **Biện pháp giảm thiểu:** Định nghĩa đầy đủ Type Contracts và Assertions trong phần 3 của tài liệu này; chạy linter và kiểm thử kiểm tra kiểu nghiêm ngặt.

---

### ADR-002: 3-Band Cognitive UI Adaptation for Ages 5–20 with Dynamic CSS Projections

- **Ngày quyết định:** 2026-10-28
- **Trạng thái:** `ACCEPTED`
- **Người quyết định:** Code Architect (`code-architect`, Pro Tier)

#### Bối cảnh (Context)
Dự án phục vụ dải tuổi rất rộng từ 5 đến 20 tuổi (Mầm non $\to$ Học sinh THCS $\to$ Sinh viên kỹ thuật):
- Bé 5 tuổi cần giao diện trực quan, biểu tượng to ($\ge 64\text{px}$), phản hồi âm thanh tức thì, không có chữ phức tạp và không hiển thị code editor.
- Học sinh 9–13 tuổi cần không gian lắp ghép mạch Breadboard và lập trình khối Blockly.
- Bạn trẻ 14–20 tuổi cần môi trường IDE chuyên nghiệp, màn hình Serial Monitor, sơ đồ chân 30/38 pin và trình biên tập mã kép C++ / MicroPython.
- Nếu chia thành 3 trang web riêng biệt, việc chia sẻ trạng thái tiến độ, tái sử dụng động cơ mô phỏng mạch điện và bảo trì mã nguồn sẽ bị phân mảnh gấp 3 lần.

#### Các phương án xem xét (Alternatives Considered)

##### Phương án 1: Xây dựng 3 trang WebApp độc lập cho 3 lứa tuổi
- **Ưu điểm:** Mỗi trang hoàn toàn tách biệt về mặt thẩm mỹ.
- **Nhược điểm:** Trùng lặp mã nguồn (Engine, Pinout, Audio Synthesizer); trẻ em khi lớn lên hoặc muốn học nâng cao phải chuyển sang đường dẫn khác và mất toàn bộ tiến trình XP đã đạt được.
- **Lý do loại trừ:** Chi phí bảo trì cao, vi phạm nguyên tắc "Low floor, Wide walls, High ceiling".

##### Phương án 2: Một giao diện duy nhất hiển thị tất cả các tính năng cho mọi lứa tuổi
- **Ưu điểm:** Không cần code chuyển đổi giao diện.
- **Nhược điểm:** Trẻ 5 tuổi bị choáng ngợp trước hàng chục nút bấm, thanh điều khiển, chân GPIO và khung soạn thảo code; hoàn toàn thất bại về mặt sư phạm.
- **Lý do loại trừ:** Vi phạm trực tiếp RULE-001 trong SPEC.approved.md.

##### Phương án 3 (Được chọn): Bộ Điều Phối Phân Tầng Nhận Thức Phản Ứng (Reactive Age-Tier Projection)
- **Ưu điểm:**
  1. Chỉ một ứng dụng duy nhất, chia sẻ cùng một Động cơ Mô phỏng Cốt lõi (`engine.js`) và một cơ sở dữ liệu tiến trình học tập (`learn-esp32-progress`).
  2. Thuộc tính `data-age-band` được đặt trực tiếp trên thẻ gốc `<html>` (`"band-a"`, `"band-b"`, `"band-c"`). CSS áp dụng kỹ thuật hiển thị chọn lọc (Selective Viewport Projections) để ẩn/hiện hoặc tái cấu trúc các khối giao diện trong thời gian $\le 50\text{ ms}$.
  3. Cho phép chuyển đổi mượt mà giữa các chế độ bất kỳ lúc nào qua nút bấm Mode Switcher trên thanh công cụ; lưu trạng thái vào `localStorage.getItem("user-age-band")` (mặc định là `"band-b"`).

#### Quyết định & Biện minh (Decision & Justification)
Quyết định áp dụng **Mô hình 3 Phân tầng Nhận thức Tích hợp**:
- `band-a` (Kid Spark): Ẩn code editor, hiển thị Visual Story Cards, nút bấm $\ge 64\text{px}$, phản hồi âm thanh tức thì.
- `band-b` (Block Explorer): Kích hoạt không gian Breadboard dây cắm và khối lệnh logic.
- `band-c` (Maker Pro): Kích hoạt IDE đầy đủ với Dual Code Editor, Pinout Explorer, Serial Console, và các dự án IoT/Robotics.

#### Hệ quả (Consequences)
- **Tích cực:** Trải nghiệm sư phạm hoàn hảo cho từng nhóm tuổi, chia sẻ 100% dữ liệu tiến trình và lõi mô phỏng, người học có thể chuyển đổi chế độ để khám phá khi sẵn sàng.
- **Tiêu cực:** CSS cần được tổ chức quy củ theo các namespace và CSS variables để không xảy ra xung đột hiển thị.
- **Biện pháp giảm thiểu:** Định nghĩa ranh giới CSS rõ ràng bằng thuộc tính `html[data-age-band="..."]` và kiểm tra chuyển đổi giao diện với tiêu chuẩn thời gian $\le 50\text{ ms}$.

---

## 3. Data Models & API Contracts

Dưới đây là các định nghĩa giao diện (Type Contracts) và đặc tả máy trạng thái xác định (Deterministic State Machines) cho toàn bộ 10 quy tắc kỹ thuật trong `SPEC.approved.md`.

### 3.1. Core Type Definitions (TypeScript / JSDoc Standards)

```typescript
/**
 * RULE-001: 3 Phân tầng lứa tuổi
 */
export type AgeBand = 'band-a' | 'band-b' | 'band-c';

/**
 * RULE-010: Cấu hình môi trường người dùng
 */
export interface UserSettings {
  labels: boolean;        // Mặc định: true - Hiển thị nhãn văn bản và mũi tên chỉ dẫn
  grid: boolean;          // Mặc định: true - Hiển thị lưới tọa độ sàn
  autoRotate: boolean;    // Mặc định: false - Tự xoay camera sau 4000ms idle
  sound: boolean;         // Mặc định: true - Bật âm thanh Web Audio API
  reducedMotion: boolean; // Mặc định: false - Giảm chuyển động (speed = 0.05)
}

/**
 * RULE-005: Dữ liệu tiến trình học tập
 */
export interface UserProgress {
  completedLessons: string[]; // Mảng các ID bài học đã hoàn thành (ví dụ: ['board', 'blink'])
  xp: number;                 // Tổng điểm kinh nghiệm tích lũy
  unlockedBadges: string[];   // Danh sách huy hiệu đã đạt (ví dụ: ['Blink Master'])
}

/**
 * RULE-005: Câu hỏi trắc nghiệm kiểm tra bài học
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * RULE-002: Ma trận chân ESP32 DevKit V1
 */
export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'ANALOG' | 'TOUCH';

export interface PinDefinition {
  pinNumber: number;          // Số hiệu chân vật lý (1..30 hoặc 1..38)
  gpioNumber: number | null;  // Số hiệu GPIO (null nếu là 3V3, 5V, GND, EN)
  name: string;               // Tên nhãn chân (ví dụ: 'GPIO2', '3V3', 'GND', 'SENSOR_VP')
  type: 'POWER' | 'GROUND' | 'GPIO_STD' | 'INPUT_ONLY' | 'ANALOG_CH1' | 'ANALOG_CH2' | 'TOUCH';
  isInputOnly: boolean;       // True với GPIO 34, 35, 36, 39
  adcChannel: 1 | 2 | null;   // Kênh ADC1 hoặc ADC2 (null nếu không hỗ trợ)
  touchIndex: number | null;  // Chỉ số kênh chạm T0..T7 (null nếu không hỗ trợ)
  maxVoltage: 3.3;            // Giới hạn điện áp tối đa an toàn (3.3V)
  maxCurrentMa: 40;           // Giới hạn dòng điện cực đại (40mA)
}

/**
 * RULE-002: Trạng thái điện tử của một chân tại runtime
 */
export interface PinRuntimeState {
  mode: PinMode;
  digitalValue: 0 | 1;        // Mức logic LOW (0) hoặc HIGH (1)
  analogValue: number;        // Giá trị ADC 12-bit (0..4095) hoặc PWM 8-bit (0..255)
  voltage: number;            // Điện áp tính toán (V)
  currentMa: number;          // Dòng điện tính toán chạy qua chân (mA)
  isBurned: boolean;          // Trạng thái hỏng hóc nhiệt do quá tải
  errorWarning: string | null;// Mã cảnh báo (ví dụ: 'OVERVOLTAGE_WARNING', 'PIN_CANNOT_BE_OUTPUT')
}

/**
 * RULE-006: Máy trạng thái thực thi mã nguồn
 */
export type ExecutionState = 'idle' | 'uploading' | 'running';

export interface TraceEvent {
  text: string;               // Đoạn mã nguồn cần truy vết (ví dụ: 'digitalWrite(LEFT, HIGH)')
  nth: number;                // Lần xuất hiện thứ n trong mã nguồn (mặc định: 1)
}

/**
 * Cấu trúc định nghĩa một bài học hoàn chỉnh
 */
export interface LessonDef {
  id: string;                 // Mã định danh duy nhất (ví dụ: 'blink', 'fridge', 'pump')
  index: number;              // Thứ tự bài học từ 1 đến 20
  title: string;              // Tên bài học tiếng Việt
  subtitle: string;           // Tóm tắt sư phạm
  targetBands: AgeBand[];     // Các phân tầng lứa tuổi hỗ trợ bài học này
  primaryComponent: string;   // Tên linh kiện trung tâm
  defaultParameters: Record<string, number | string | boolean>;
  quiz: QuizQuestion[];       // Bộ 3 câu hỏi trắc nghiệm
  badgeReward?: string;       // Huy hiệu đạt được khi hoàn thành bài này (nếu có)
  cppCode: string;            // Bản mã nguồn mẫu Arduino C++
  pythonCode: string;         // Bản mã nguồn mẫu MicroPython
}
```

---

### 3.2. Deterministic State Machines & Business Invariants (RULE-001 .. RULE-010)

#### RULE-001: Bộ Điều Phối Phân Tầng Độ Tuổi (Age-Tier Dispatcher FSM)
- **Không gian trạng thái:** $\mathcal{S}_{age} = \{\text{'band-a'}, \text{'band-b'}, \text{'band-c'}\}$.
- **Khởi tạo:**
  ```javascript
  const storedBand = localStorage.getItem('user-age-band');
  const activeBand = (storedBand === 'band-a' || storedBand === 'band-b' || storedBand === 'band-c') 
    ? storedBand 
    : 'band-b';
  ```
- **Hành vi chuyển đổi:**
  - Cập nhật thuộc tính `document.documentElement.setAttribute('data-age-band', newBand)`.
  - Lưu trữ: `localStorage.setItem('user-age-band', newBand)`.
  - Phát sự kiện: `window.dispatchEvent(new CustomEvent('ageBandChanged', { detail: { band: newBand } }))`.
  - **Ràng buộc thời gian:** Thời gian phản hồi cập nhật layout DOM $\le 50\text{ ms}$.

#### RULE-002: Ma Trận Sơ Đồ Chân & Ràng Buộc An Toàn Điện Học
- **Ràng buộc 1 (Input-Only):**
  $$\text{pin} \in \{34, 35, 36, 39\} \land \text{mode} == \text{'OUTPUT'} \implies \text{Error('PIN\_CANNOT\_BE\_OUTPUT')}$$
- **Ràng buộc 2 (Quá Áp - Overvoltage):**
  $$V_{applied} > 3.3\text{ V} \implies \text{Warning('OVERVOLTAGE\_WARNING')}$$
- **Ràng buộc 3 (Định luật Ohm & Hỏng Hóc Nhiệt - Thermal Burn):**
  $$I = \begin{cases} \frac{V_{GPIO} - V_{forward}}{R_{series}} & \text{khi } R_{series} > 0 \\ \infty & \text{khi } R_{series} = 0 \end{cases}$$
  Nếu $R_{series} = 0\ \Omega$ hoặc $I > 40\text{ mA}$, chuyển trạng thái sang `COMPONENT_BURNED_STATE`:
  - `pinState.isBurned = true`
  - Đồ họa hiển thị màu xám đen than chì (`#222222`) kèm biểu tượng tia lửa.
- **Ràng buộc 4 (ADC & Wi-Fi):**
  - ADC1 (GPIO 32, 33, 34, 35, 36, 39): Luôn hoạt động.
  - ADC2 (GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27): Bị khóa khi `wifiActive == true`.
- **Mã màu dây chuẩn:** Tín hiệu/PWM: `#f0a53a` / `#3d6fc4`, Nguồn 3.3V: `#e04a3f`, Nguồn 5V: `#b82e24`, GND: `#2f3547`.

#### RULE-003: Mô Phỏng Cảm Giác Tức Thì Band A (Kid Spark)
1. *Blink (Level Crossing):* Chu kỳ nhấp nháy $100\text{ ms} \le t_{rate} \le 1500\text{ ms}$ (bước $50\text{ ms}$). Màu sắc: Đỏ (`#ff3b30`), Vàng (`#ffcc00`), Xanh lá (`#34c759`).
2. *Fridge Guard:* Góc mở cửa $\theta \in [0^\circ, 90^\circ]$. Thời gian gia hạn $t_{grace} \in [1000\text{ ms}, 10000\text{ ms}]$.
   $$\theta > 12^\circ \land t_{open} > t_{grace} \implies \text{TriggerSiren}(2400\text{ Hz}) \land \text{BlinkLedRed}()$$
3. *Siren Sound:* Tần số sóng sin dao động theo thời gian:
   $$f(t) = 400 + 800 \times \frac{1 + \sin(2\pi \cdot t / T_{siren})}{2}\quad [400\text{ Hz} \le f \le 1200\text{ Hz}]$$
4. *Touch Piano:* 8 nốt nhạc với độ trễ phát âm $\le 20\text{ ms}$:
   - C4: $261.63\text{ Hz}$, D4: $293.66\text{ Hz}$, E4: $329.63\text{ Hz}$, F4: $349.23\text{ Hz}$
   - G4: $392.00\text{ Hz}$, A4: $440.00\text{ Hz}$, B4: $493.88\text{ Hz}$, C5: $523.25\text{ Hz}$
5. *Mood Lamp:* Hòa trộn 3 kênh màu RGB với $R, G, B \in [0, 255]$.
6. *Night Light:* Cảm biến ánh sáng $LDR_{val} \in [0\%, 100\%]$.
   $$\text{LED\_STATE} = \begin{cases} \text{ON} & \text{khi } LDR_{val} < 50\% \\ \text{OFF} & \text{khi } LDR_{val} \ge 50\% \end{cases}$$

#### RULE-004: Mô Phỏng Linh Kiện Band B (Block Explorer)
1. *Vòng 12 LED Neopixel WS2812B:*
   $$N_{lit} = \left\lfloor \frac{ADC}{4095} \times 12 \right\rfloor \quad (ADC \in [0, 4095])$$
   - Đèn $i$ ($0 \le i < 12$) sáng nếu $i < N_{lit}$.
   - Chế độ màu: `blue`, `rainbow` (pha góc $i/12$), `traffic` (chuyển dần xanh $\to$ đỏ).
2. *Thước Đo Siêu Âm HC-SR04 & SSD1306:*
   $$\Delta t = \frac{2 \times d}{0.0343\text{ cm}/\mu\text{s}} \quad (2\text{ cm} \le d \le 400\text{ cm})$$
3. *Cổng Rào Chắn Laser & Servo SG90:*
   - Tia laser bị chắn $\implies \text{LaserRx} = 0$.
   - Động cơ Servo quay từ $0^\circ \to 90^\circ$ với vận tốc $180^\circ/\text{s}$ (thời gian chuyển động $500\text{ ms}$).
   - Giữ trạng thái mở trong $3000\text{ ms}$, sau đó tự động quay về $0^\circ$.
4. *Điều Tốc Động Cơ DC Qua Cầu H:* Vận tốc góc $\omega = \text{DutyCycle} \times \omega_{max}$ ($0 \le \text{DutyCycle} \le 1.0$).

#### RULE-005: Động Cơ Đánh Giá Tiến Trình & Điểm Thưởng XP
- **Tiêu chí Hoàn thành Bài học (`isCompleted = true`):**
  $$\text{isCompleted} \iff (\text{executionTimeWithoutError} \ge 3000\text{ ms}) \lor (\text{quizScore} \ge 2 / 3)$$
- **Công thức phần trăm tiến trình:**
  $$\text{ProgressPercentage} = \left\lfloor \frac{N_{completed}}{20} \times 100 \right\rfloor\%$$
  - Thuộc tính ARIA: `aria-valuemin="0"`, `aria-valuemax="20"`, `aria-valuenow="N_completed"`.
  - Nhãn hiển thị: `"${N_completed}/20"`.
- **Bảng phân phối XP:**
  - Hoàn thành bài Band A: $+50\text{ XP}$.
  - Hoàn thành bài Band B: $+100\text{ XP}$.
  - Hoàn thành bài Band C: $+150\text{ XP}$.
  - Trả lời đúng $3/3$ câu đố ngay lần đầu: Thưởng $+25\text{ XP}$.
- **Quy trình Reset Tiến trình (`data-reset`):**
  - Hiển thị hộp thoại xác nhận. Khi người dùng đồng ý:
    `completedLessons = []`, `xp = 0`, cập nhật hiển thị về `0/20` và thanh đo `0%`, ghi `localStorage.setItem('learn-esp32-progress', JSON.stringify({ completedLessons: [], xp: 0 }))`.

#### RULE-006: Máy Trạng Thái Thực Thi Mã Nguồn (Code Runner FSM)
```
       ┌───────────┐
       │   IDLE    │◄───────────────────────────┐
       └─────┬─────┘                            │
             │ User clicks "Run" / Press Space  │
             ▼                                  │
      ┌─────────────┐                           │ User clicks "Stop"
      │  UPLOADING  │                           │
      │ data-state= │                           │
      │ "uploading" │                           │
      └──────┬──────┘                           │
             │ T+0ms:   "Compiling sketch…" (TX/RX LED blinks)
             │ T+600ms: "Connecting to ESP32 on USB…"
             │ T+1200ms:"Writing… 100 %. Hard resetting via RTS pin."
             ▼                                  │
       ┌───────────┐                            │
       │  RUNNING  │────────────────────────────┘
       │ data-state=
       │ "running" │
       └───────────┘
```
- **Line Tracing:** Gọi `trace({ text, nth })` $\implies$ tìm phần tử `.line` khớp chuỗi trong `<pre><code>` và gán class `.is-running`. Khi Stop, gỡ bỏ toàn bộ `.is-running`.
- **Serial Console Resize:** Chiều cao $h_{console} \in [92\text{px}, \text{wrapHeight} - 48\text{px}]$, lưu tại `localStorage.getItem('console-height')`. Double-click thanh grip khôi phục về $92\text{px}$.

#### RULE-007: Mô Phỏng Mạng Không Dây IoT Cho Band C
1. *Wi-Fi Web Server (Bài 04):* IP ảo `192.168.1.42`. Khung điện thoại ảo truy cập `http://192.168.1.42/`. Nhấn `/toggle` $\implies$ gửi HTTP GET $\implies$ vi điều khiển đảo trạng thái chân GPIO 2 $\implies$ phản hồi `200 OK`.
2. *Bluetooth Serial (Bài 13):* Tên nhận diện `ESP32-Lamp`. Gửi chuỗi lệnh `"ON"`, `"OFF"`, `"DIM"`.
3. *ESP-NOW (Bài 14):* Truyền Board A $\to$ Board B với độ trễ $t_{latency} < 5\text{ ms}$.
   - Khoảng cách $d \in [0.5\text{ m}, 150\text{ m}]$.
   - Tỷ lệ mất gói tin (Packet Loss Rate):
     $$\text{LossRate}(d) = \begin{cases} 0\% & \text{khi } d \le 100\text{ m} \\ \frac{1}{1 + e^{-0.15(d - 125)}} \times 100\% & \text{khi } d > 100\text{ m} \end{cases}$$

#### RULE-008: Cơ Điện Tử & Điều Khiển Tự Động Hóa Band C
1. *Bơm Nước Tự Động Với Hồi Tiếp Rơ-le (Hysteresis Control - Bài 16):*
   $$RELAY_{state}(t) = \begin{cases} \text{HIGH (Pump ON)} & \text{khi } H \le 20\% \\ \text{LOW (Pump OFF)} & \text{khi } H \ge 90\% \\ RELAY_{state}(t-1) & \text{khi } 20\% < H < 90\% \end{cases}$$
   Khi Bơm ON, mức nước $H$ tăng $+5\%/\text{s}$.
2. *Khóa Cửa Bàn Phím Ma Trận 4x3 (Bài 17):*
   - Nhấn `*` $\implies$ xóa bộ đệm (`buffer = ""`), phát còi $2000\text{ Hz}$ ngắn.
   - Nhấn `#` $\implies$ kiểm tra `buffer === "1234"`. Đúng $\implies$ mở chốt Servo + âm báo thành công. Sai $\implies$ âm báo lỗi $400\text{ Hz}$ + tăng `failCount`. Nếu `failCount >= 3` $\implies$ khóa nhập $30\text{ s}$.
3. *Pin Mặt Trời Hướng Nắng Kép (Bài 18):*
   $$\Delta L = LDR_{left} - LDR_{right}, \quad \text{Deadband } \delta = 15$$
   - Nếu $\Delta L > 15 \implies \theta_{servo} \leftarrow \theta_{servo} + 1^\circ$.
   - Nếu $\Delta L < -15 \implies \theta_{servo} \leftarrow \theta_{servo} - 1^\circ$.
   - Nếu $|\Delta L| \le 15 \implies$ giữ nguyên góc (tránh dao động rung giật).
4. *Radar Quét Siêu Âm Góc Rộng (Bài 19):*
   - Quét liên tục từ $0^\circ \to 180^\circ$ (bước $1^\circ$). Vẽ trên tọa độ cực Polar Display với hiệu ứng vệt quét phốt-pho xanh lục lưu ảnh mờ dần.
5. *Cánh Tay Gắp Phôi Động Cơ Bước (Bài 20):*
   - Độ chính xác vi bước $\pm 0.04\text{ mm}$, nam châm điện kích hoạt hút/thả phôi theo chu kỳ.

#### RULE-009: Không Gian Mô Phỏng & Bộ Điều Khiển Viewport
- **Phím tắt điều khiển:**
  - `W, A, S, D` / Drag: Tịnh tiến camera (Pan).
  - `+, -` / Wheel / Pinch: Thu phóng (Zoom).
  - `Q, E` / Middle Drag: Xoay $90^\circ$ (Turn).
  - `R` / Double-click khoảng trống: Khôi phục góc nhìn gốc (Reset View trong $400\text{ ms}$).
  - Double-click vào linh kiện: Phóng to vào linh kiện (Inspect Focus) + mở `#inspector`.
  - `Escape`: Đóng `#inspector`.
- **Hộp thoại Part Inspector (`#inspector`):**
  - Hiển thị thông số điện tử và thanh trượt tinh chỉnh tham số. Vẽ đường véc-tơ `#insp-lines` nối từ linh kiện trên mạch đến thẻ thông tin.
- **Thẻ Sơ Đồ Mạch Nổi (Floating Schematic Card):**
  - Kéo rê phần Header để di chuyển thẻ. Tay nắm co giãn kích thước `button.sch-grip`. Nút đóng đồng bộ `aria-pressed` trên nút viewbar.

#### RULE-010: Khả Năng Tiếp Cận (a11y), Đa Ngôn Ngữ (i18n) & Môi Trường
- **Tùy chọn môi trường (`learn-esp32-settings`):**
  - `labels` (mặc định `true`), `grid` (`true`), `autoRotate` (`false`, idle $4000\text{ ms}$ tự xoay), `sound` (`true`, khi `false` ngắt toàn bộ Web Audio API), `reducedMotion` (`false`, khi `true` tốc độ chuyển động $\text{speed} = 0.05$).
- **i18n Tiếng Việt Chuẩn Ngành:** Giữ nguyên các thuật ngữ kỹ thuật quốc tế: `GPIO, PWM, ADC, DAC, I2C, SPI, UART, Baud, OLED, Servo, Stepper, Relay, Neopixel, ESP-NOW`.
- **Breakpoint Compact:** Khi chiều rộng $W < 1090\text{px}$ hoặc chiều cao $H < 800\text{px}$, gán class `compact` vào `<body>`, chuyển layout 3 cột sang dạng thẻ xếp chồng (Tabbed Mobile Stack).

---

## 4. Component Manifest

Toàn bộ ứng dụng được cấu trúc chặt chẽ trong 5 tập tin chính, tuân thủ giới hạn kích thước file dưới 400 dòng (trần tuyệt đối không vượt quá 800 dòng):

### Files to Create

| File Path | Trách nhiệm Kiến trúc & Nghiệp vụ | Lớp Kiến trúc (Layer) | Định mức Dòng (LOC Budget) |
|---|---|---|:---:|
| `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/engine.js` | Lõi mô phỏng vật lý & điện tử thuần túy (Headless Engine), tính toán định luật Ohm, quá tải nhiệt, ADC/PWM, máy trạng thái FSM (Bơm, Keypad, Solar, Neopixel, Radar, Còi hú, Cổng barie). Không phụ thuộc DOM. | Core Domain & Math Simulation | 300 – 380 dòng |
| `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/lessons.js` | Cơ sở tri thức sư phạm: Ma trận 30/38 chân ESP32, 20 bài học tuần tự (Bilingual story, Quiz, C++/Python templates, Audio notes, Hardware pin assignments). | Curriculum & Knowledge Base | 320 – 390 dòng |
| `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/app.js` | Bộ điều phối giao diện (UI Orchestrator): Điều phối vòng lặp hoạt họa, Web Audio API Synthesizer, xử lý sự kiện người dùng (Pan/Zoom/Inspect), đồng bộ hóa LocalStorage và điều phối chế độ lứa tuổi Band A/B/C. | Presentation & UI Orchestrator | 350 – 400 dòng |
| `/Users/apexdev/Desktop/hoc-nhung-cho-be/src/styles.css` | Hệ thống kiểu dáng đáp ứng nhận thức: Thiết lập Theme CSS Variables, phong cách Band A (nút $\ge 64\text{px}$, thẻ tranh truyện), Band B (Blockly & Breadboard), Band C (Dark IDE, Pinout, Serial Monitor), hiệu ứng vệt sáng Line Tracer và layout `compact`. | Styling & Responsive Layout | 320 – 380 dòng |
| `/Users/apexdev/Desktop/hoc-nhung-cho-be/index.html` | Khung giao diện HTML5 chuẩn ngữ nghĩa, tích hợp đầy đủ thuộc tính ARIA (`aria-valuenow`, `aria-pressed`, `role="region"`), các hộp thoại nổi (Floating Schematic, Part Inspector), thanh công cụ Viewbar và Console Grip. | Semantic Document Shell | 180 – 240 dòng |

---

## 5. Build & Dependency Sequence (Kế Hoạch Triển Khai Tuần Tự)

Để đảm bảo quy trình xây dựng phòng sạch không lỗi và tương thích tuyệt đối với bộ kiểm thử đột biến (Mutation Testing), quá trình lập trình của `clean-room-builder` phải tuân theo thứ tự phụ thuộc chặt chẽ:

```
┌────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 1: ĐỊNH NGHĨA DỮ LIỆU BẤT BIẾN (`lessons.js`)│
│  • Ma trận chân ESP32 (RULE-002)                       │
│  • Danh mục 20 bài học & câu đố trắc nghiệm (RULE-005) │
│  • Mẫu code C++ / MicroPython & tham số thay thế       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 2: LÕI MÔ PHỎNG THUẦN TÚY (`engine.js`)     │
│  • Tính toán điện học, Ohm, quá áp, hỏng nhiệt (R-002) │
│  • Bộ mô phỏng cảm giác Band A (RULE-003)              │
│  • Bộ mô phỏng khối & linh kiện Band B (RULE-004)      │
│  • Máy trạng thái FSM IoT & Cơ điện tử Band C (R-007,8)│
│  • Động cơ tính XP, tiến trình & Line Tracer (R-005,6) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 3: GIAO DIỆN & STYLE (`index.html`, CSS)    │
│  • Khung HTML ngữ nghĩa ARIA, Viewbar, Floating Panels │
│  • CSS 3 Phân tầng `data-age-band` A/B/C & `compact`   │
│  • Hiệu ứng vệt sáng `is-running`, console resize      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 4: ĐIỀU PHỐI TƯƠNG TÁC (`app.js`)           │
│  • Kết nối DOM với `engine.js` và `lessons.js`         │
│  • Web Audio API Synthesizer (còi hú, piano, bíp)      │
│  • Bộ điều khiển Viewport (Pan, Zoom, Inspect, Reset)  │
│  • Đồng bộ LocalStorage (tiến trình, cài đặt, lứa tuổi)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 5: KIỂM THỬ ĐỘT BIẾN PHÒNG SẠCH             │
│  • Xây dựng bộ test suite tự động                      │
│  • Bản chính: PASS 100%                                │
│  • 3 Mutants (Phá vỡ Ohm, Phá vỡ Band, Phá vỡ FSM):   │
│    FAIL 100%                                           │
└────────────────────────────────────────────────────────┘
```

---

## 6. Chiến Lược Kiểm Thử Đột Biến (Mutation Testing Oracle Matrix)

Nhằm đáp ứng yêu cầu của quy chế Enterprise Software Company và hướng dẫn kiểm thử của `clean-room-tester`, kiến trúc định nghĩa 3 điểm phá vỡ đột biến chuẩn xác (3 Mutants) để chứng minh năng lực của bộ kiểm thử:

| Bản Đột Biến | Quy Tắc Nhắm Tới | Vị Trí Đột Biến Cố Ý Trong Code | Hành Vi Sai Lệch Kỳ Vọng | Điều Kiện Bắt Lỗi Của Test Suite (Oracle Assertion) |
|---|---|---|---|---|
| **`mutant-1`** (Thermal & Safety Bypass) | **RULE-002** | Trong hàm `calculatePinCurrent()` của `engine.js`, bỏ qua kiểm tra $R_{series} = 0$ hoặc cho phép `pinMode(34, 'OUTPUT')` không ném ngoại lệ. | Mạch không kích hoạt `COMPONENT_BURNED_STATE` khi nối tắt LED trực tiếp vào chân GPIO, hoặc chân 34 được cấu hình làm đầu ra mà không báo lỗi. | `expect(() => engine.setPinMode(34, 'OUTPUT')).toThrow('PIN_CANNOT_BE_OUTPUT')`<br>`expect(engine.connectDirectLed(2, 0).isBurned).toBe(true)` $\implies$ **Bắt buộc FAIL trên Mutant 1**. |
| **`mutant-2`** (Band Isolation Leak) | **RULE-001** | Trong bộ điều phối chế độ lứa tuổi, chuyển sang `'band-a'` nhưng không ẩn trình biên tập code hoặc thời gian chuyển đổi vượt quá $50\text{ ms}$. | Bé 5 tuổi vẫn nhìn thấy màn hình gõ code hoặc thuộc tính `data-age-band` không được gán đúng lên thẻ gốc `<html>`. | `expect(document.documentElement.getAttribute('data-age-band')).toBe('band-a')`<br>`expect(document.querySelector('.code-card').classList.contains('hidden-for-band-a')).toBe(true)` $\implies$ **Bắt buộc FAIL trên Mutant 2**. |
| **`mutant-3`** (Mechatronics FSM Inversion) | **RULE-008 & RULE-005** | Trong logic trễ máy bơm tự động (`pumpHysteresis`), đảo ngược logic: ngắt bơm khi $H \le 20\%$ và bật bơm khi $H \ge 90\%$, hoặc tính sai tỷ lệ phần trăm tiến trình học tập. | Bồn nước cạn nhưng rơ-le không đóng, bồn nước tràn nhưng rơ-le tiếp tục bơm; hoặc tiến trình trả về sai lệch so với công thức chuẩn. | `expect(engine.updateWaterLevel(15).relayState).toBe('HIGH')`<br>`expect(engine.updateWaterLevel(95).relayState).toBe('LOW')` $\implies$ **Bắt buộc FAIL trên Mutant 3**. |

---

## 7. Kết Luận & Chuyển Giao Kiến Trúc

Bản thiết kế này đáp ứng đầy đủ và toàn diện 100% các yêu cầu kỹ thuật trong `clean-room/SPEC.approved.md` và định hướng chiến lược trong `clean-room/TASK_BRIEF.md`. Bản thiết kế tuân thủ nghiêm ngặt:
1. Tính module cao, phân tách rõ ràng trách nhiệm.
2. Quy định giới hạn kích thước file không quá 400 dòng cho mỗi tệp nguồn.
3. Không sao chép mã nguồn tham khảo, giữ vững ranh giới phòng sạch.
4. Đảm bảo nền tảng kiến trúc vững chắc để `clean-room-builder` tiến hành xây dựng và `clean-room-tester` xây dựng bộ test suite cùng 3 bản đột biến hoàn hảo.

---
*Tài liệu được phê duyệt kiến trúc bởi Code Architect — Enterprise Software Company.*
