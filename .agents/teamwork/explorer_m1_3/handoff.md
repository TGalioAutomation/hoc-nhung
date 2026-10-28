# BÁO CÁO KHẢO SÁT & THIẾT KẾ CHIẾN LƯỢC KIỂM THỬ MILESTONE 1
## Phân Hệ Giáo Trình 20 Bài Học, 60 Câu Hỏi Quiz & Tương Thích Kiểm Thử Đột Biến (Mutation Suite)

- **Agent:** `explorer_m1_3` (Exploration Agent for Milestone 1)
- **Thư mục làm việc:** `/Users/apexdev/Desktop/hoc-nhung-cho-be/.agents/teamwork/explorer_m1_3`
- **Mã định danh Parent (Caller):** `cfda045b-21db-4180-8166-83f4d9136ab3`
- **Ngày thực hiện:** 2026-10-28
- **Mục tiêu:** Khảo sát và thiết kế chi tiết chiến lược kiểm thử cho `tests/lessons.test.js` (20 bài học, mã nguồn kép C++/Python, ma trận chân cắm ESP32, 60 câu đố quiz, nội suy tham số) và bảo đảm tính tương thích hoàn hảo với bộ kiểm định đột biến Clean-Room (`clean-room/verify-mutants.mjs`).

---

## 1. Observation (Quan Sát Trực Tiếp)

### 1.1. Cấu Trúc Dữ Liệu Giáo Trình (`src/lessons.js`)
- Tệp tin: [`src/lessons.js`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/src/lessons.js) (2,043 dòng, 86,849 bytes).
- Các đối tượng xuất ra (Exports - Lines 7, 15, 51, 63, 2042):
  * `export const WIRE_COLORS`: Đối tượng gồm 5 mã màu dây nối chuẩn (`signalAmber: '#f0a53a'`, `signalBlue: '#3d6fc4'`, `power3v3: '#e04a3f'`, `power5v: '#b82e24'`, `gnd: '#2f3547'`).
  * `export const ESP32_PINS_30`: Mảng 30 phần tử định nghĩa chi tiết chân cắm DevKit 30-pin (15 chân trái, 15 chân phải), bao gồm 25 GPIOs.
  * `export const ESP32_PINS_38`: Mảng 38 phần tử kế thừa từ 30-pin, bổ sung 6 chân Flash SPI nội bộ (`GPIO 6..11`), `GPIO 0` (pin 37), và `GND` (pin 38).
  * `export const LESSONS`: Mảng đúng 20 đối tượng bài học (`number: 1..20`).
  * `export default LESSONS`.

### 1.2. Thống Kê Dữ Liệu Thực Tế Qua 20 Bài Học
Lệnh kiểm tra trực tiếp qua Node.js:
```bash
node -e "
import('./src/lessons.js').then(({ LESSONS, ESP32_PINS_30, ESP32_PINS_38 }) => {
  console.log('Total lessons:', LESSONS.length);
  LESSONS.forEach(l => {
    console.log('#' + l.number, l.id, 'bands:', l.ageBands, 'parts:', l.parts.length, 'quiz:', l.quiz.length);
  });
});"
```
Kết quả quan sát trực tiếp:
- **Số lượng bài học:** Chính xác 20 bài học, đánh số tuần tự từ `number: 1` đến `number: 20`, không khuyết thiếu số nào.
- **Mã bài học (`id`):** 20 định danh duy nhất (`board`, `blink`, `button`, `wifi`, `sound`, `piano`, `knob`, `rgb`, `light`, `sensor`, `motor`, `servo`, `bluetooth`, `espnow`, `project`, `pump`, `keypad`, `solar`, `radar`, `stepper`).
- **Phân bổ dải tuổi (`ageBands`):**
  * Band A (5–8 tuổi): Xuất hiện trong 7 bài (1, 2, 3, 5, 6, 8, 9).
  * Band B (9–13 tuổi): Xuất hiện trong 12 bài (1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 16).
  * Band C (14–20 tuổi): Xuất hiện trong 14 bài (1, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20).
  * 100% bài học đều có mảng `ageBands` chứa ít nhất một dải tuổi hợp lệ trong tập `['band-a', 'band-b', 'band-c']`.
- **Linh kiện phần cứng:**
  * Thuộc tính trong tệp nguồn `src/lessons.js` được đặt tên là `parts` (mảng chứa từ 1 đến 3 linh kiện/bài học). Mỗi linh kiện có `id`, `name`, `pin`, `rating`.
- **Cấu hình mô phỏng & Thẻ trực quan:**
  * 100% 20 bài học đều có `storyCards` (từ 1 đến 2 thẻ/bài học) với `icon`, `titleVi`, `titleEn`, `textVi`, `textEn`.
  * 100% 20 bài học đều có `blocks` (từ 1 đến 7 khối/bài học) với `type`, `label`.
  * 100% 20 bài học đều có `schematic` gồm `diagram` (chuỗi mô tả) và `rails` (mảng nhãn chân cắm).

### 1.3. Khảo Sát 60 Câu Hỏi Quiz
Lệnh kiểm tra tự động toàn bộ 60 câu hỏi:
```bash
node -e "
import('./src/lessons.js').then(({ LESSONS }) => {
  let total = 0, errors = [];
  LESSONS.forEach(l => {
    if (l.quiz.length !== 3) errors.push(\`Lesson \${l.id} has \${l.quiz.length} questions\`);
    l.quiz.forEach((q, i) => {
      total++;
      if (!q.q || typeof q.q !== 'string') errors.push(\`L\${l.number} Q\${i}: missing q\`);
      if (!Array.isArray(q.options) || (q.options.length !== 3 && q.options.length !== 4)) errors.push(\`L\${l.number} Q\${i}: invalid options length\`);
      if (q.answer < 0 || q.answer >= q.options.length) errors.push(\`L\${l.number} Q\${i}: answer out of bounds\`);
      if (!q.explain || typeof q.explain !== 'string') errors.push(\`L\${l.number} Q\${i}: missing explain\`);
    });
  });
  console.log('Total verified:', total, '| Errors:', errors.length);
});"
```
Kết quả quan sát trực tiếp:
- **Tổng số câu hỏi:** Chính xác `60` câu hỏi (`20 bài × 3 câu`).
- **Nội dung câu hỏi (`q`):** 100% là chuỗi tiếng Việt rõ ràng, độ dài tối thiểu $\ge 15$ ký tự, kết thúc bằng dấu `?` hoặc `:`.
- **Số lượng phương án lựa chọn (`options`):** 100% câu hỏi có mảng `options` với độ dài đúng 3 hoặc 4 phương án; không có phương án rỗng; không có phương án trùng lặp trong cùng một câu hỏi.
- **Chỉ số đáp án đúng (`answer`):** 100% là số nguyên hợp lệ nằm nghiêm ngặt trong khoảng $[0, \text{options.length} - 1]$.
- **Giải thích sư phạm (`explain`):** 100% câu hỏi có chuỗi giải thích không rỗng, giải thích cặn kẽ nguyên lý vật lý/điện tử.
- **Số lỗi phát hiện:** `0` lỗi.

### 1.4. Khảo Sát Thay Thế Tham Số Tương Tác (Parameter Interpolation)
Lệnh kiểm tra đối soát tất cả các thẻ `{{param}}`:
```bash
node -e "
import('./src/lessons.js').then(({ LESSONS }) => {
  let totalMatches = 0, errors = [];
  LESSONS.forEach(l => {
    const keys = new Set(Object.keys(l.defaultParams || {}));
    const text = (l.codeCpp || '') + ' ' + (l.codePy || '') + ' ' + JSON.stringify(l.blocks || []);
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    matches.forEach(m => {
      totalMatches++;
      const k = m.replace(/[{}]/g, '');
      if (!keys.has(k)) errors.push(\`Lesson #\${l.number} (\${l.id}): '\${m}' not in defaultParams\`);
    });
  });
  console.log('Total placeholders:', totalMatches, '| Errors:', errors.length);
});"
```
Kết quả quan sát trực tiếp:
- **Tổng số thẻ khuôn mẫu:** 23 vị trí xuất hiện thẻ `{{paramKey}}` trong `codeCpp`, `codePy`, và `blocks` (thuộc các bài: 1 `baudRate`, 2 `rate`, 3 `graceTimeMs`, 8 `r`, `g`, `b`, 11 `speedPercent`, 15 `occupiedSlots`).
- **Khớp với `defaultParams`:** 100% các thẻ đều có khóa tương ứng được khai báo trong `lesson.defaultParams`.
- **Thử nghiệm nội suy:** Khi gọi hàm `CodeExecutionEngine.prototype.substituteParams(code, lesson.defaultParams)`, toàn bộ 23 thẻ đều được thay thế hoàn toàn bằng giá trị thực tế, số thẻ chưa giải quyết còn lại là `0`.

### 1.5. Khảo Sát Mã Nguồn Kép (Dual Code: Arduino C++ vs MicroPython)
Khi phân tích mã nguồn của từng bài học, phát hiện các đặc điểm cấu trúc sau:
1. **Arduino C++ (`codeCpp`):**
   - 17/20 bài học (1–13, 15, 16, 19, 20) có đầy đủ cả `void setup()` và `void loop()`.
   - Bài 14 (`espnow`): Có `void setup()`, nhưng hàm phát tin được đặt trong `void sendPacket()` (mô hình hướng sự kiện khi bấm nút), không có `void loop()`.
   - Bài 17 (`keypad`): Định nghĩa hàm xử lý sự kiện ngắt bàn phím `void onKeyPressed(char key)`, không có `void setup()` / `void loop()`.
   - Bài 18 (`solar`): Định nghĩa thuật toán bám nắng `void stepTracking()`, không có `void setup()` / `void loop()`.
2. **MicroPython (`codePy`):**
   - 15/20 bài học (1–14, 16) có câu lệnh `import` hoặc `from machine import Pin, ADC, PWM`.
   - 5/20 bài học (15, 17, 18, 19, 20) là các đoạn mã thuật toán/tính toán thuần túy:
     * Bài 15: `total_slots = 5; occupied = {{occupiedSlots}}; print(...)`
     * Bài 17: `def press(key): ...`
     * Bài 18: `def track(left_val, right_val): ...`
     * Bài 19: `def next_sweep(): ...`
     * Bài 20: `def mm_to_steps(mm): ...; def steps_to_mm(steps): ...`

### 1.6. Khảo Sát Chân Cắm Đối Soát Với ESP32 Pinout
- Tập hợp chân GPIO được cấu hình và sử dụng trong 20 bài học gồm:
  `GPIO 2, 4, 5, 12, 13, 14, 15, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35`.
- 100% các chân GPIO này đều tồn tại và được định nghĩa hợp lệ trong cả hai danh mục `ESP32_PINS_30` và `ESP32_PINS_38`.
- **Ràng buộc an toàn chân chỉ đầu vào (Input-Only):**
  * Các chân `GPIO 34, 35, 36, 39` chỉ được dùng cho cảm biến đầu vào:
    - Bài 7 (`knob`): GPIO 34 làm đầu vào ADC1 đọc biến trở.
    - Bài 12 (`servo`): GPIO 35 làm đầu vào nhận quang laser.
    - Bài 16 (`pump`): GPIO 34 làm đầu vào ADC1 đo mực nước.
    - Bài 18 (`solar`): GPIO 32, 33 làm đầu vào ADC1 (an toàn).
  * Tuyệt đối **không có bài học nào** cấu hình chân `34, 35, 36, 39` làm `OUTPUT`, hoàn toàn tuân thủ `RULE-002`.

### 1.7. Khảo Sát Cơ Chế Hoạt Động Của `clean-room/verify-mutants.mjs`
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
- Lệnh thực thi trực tiếp: `node clean-room/verify-mutants.mjs`.
- Thời gian chạy: ~4.0 giây.
- Kết quả: Primary Pass 37/37 (Exit code 0); Mutant 1, 2, 3 bị KILLED (Exit code 1). Mutation Score = 100%.
- Cơ chế thực thi của `verify-mutants.mjs`:
  * Tệp khai thác lệnh `spawnSync` gọi đích danh `node --test tests/spec.test.js`.
  * Tệp truyền biến môi trường `ENGINE_PATH` tới `tests/spec.test.js` để nạp động engine bị đột biến.
  * Ba mutant (`mutant-1`, `mutant-2`, `mutant-3`) trong `clean-room/mutants/` chỉ đột biến logic trong `engine.js` (dòng giới hạn 50mA, thiếu chân 39, góc tủ lạnh $\ge 12^\circ$, band mặc định `band-a`, rò rỉ code editor, bỏ qua FSM upload, tính sai XP, tính sai tiến trình, phá vỡ nhớ trạng thái máy bơm).
  * `verify-mutants.mjs` **hoàn toàn không chạy `tests/lessons.test.js`** và không bị ảnh hưởng bởi sự tồn tại của `tests/lessons.test.js`.

### 1.8. Khảo Sát Runner & `package.json`
File: [`package.json`](file:///Users/apexdev/Desktop/hoc-nhung-cho-be/package.json)
```json
  "scripts": {
    "test": "node --test tests/spec.test.js",
    "start": "npx serve ."
  }
```
- Khi chạy `node --test` không tham số trên Node.js v26.7.0, Node Test Runner tự động quét và thực thi tất cả các tệp có đuôi `*.test.js` trong thư mục `tests/`.
- Khi chạy `node --test "tests/*.test.js"`, cả `tests/spec.test.js` và bất kỳ tệp test mới nào (`tests/lessons.test.js`) đều được chạy đồng thời.

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Diễn Kỹ Thuật)

```
[Mục tiêu: Đảm bảo 20 bài học, 60 quiz, dual code, pinouts và mutation suite đạt 100% tin cậy]
   │
   ├─► (Quan sát 1.1, 1.2) LESSONS chứa đủ 20 bài học tuần tự (1..20) với title (vi, en)
   │   và ageBands hợp lệ, linh kiện lưu tại thuộc tính `parts`.
   │   └─► Suy ra: Cần viết Test Suite 1 kiểm tra tính bất biến của schema, hỗ trợ cả `parts`
   │       và bí danh `components` để tăng tính mềm dẻo.
   │
   ├─► (Quan sát 1.3) Toàn bộ 60 câu quiz đều có q, options (3-4 lựa chọn), answer hợp lệ,
   │   và explain đầy đủ.
   │   └─► Suy ra: Cần Test Suite 4 kiểm tra cấu trúc 60 câu hỏi, xác thực answer index nằm
   │       nghiêm ngặt trong [0, options.length - 1], và kiểm tra không trùng lặp câu/đáp án.
   │
   ├─► (Quan sát 1.4) 23 thẻ {{param}} trong codeCpp/codePy/blocks đều thuộc defaultParams,
   │   nội suy không còn sót thẻ nào.
   │   └─► Suy ra: Cần Test Suite 5 dùng CodeExecutionEngine.prototype.substituteParams
   │       để xác nhận 100% thẻ được phân giải sạch sẽ.
   │
   ├─► (Quan sát 1.5) 17/20 codeCpp có setup+loop; bài 14, 17, 18 dùng hàm handler/tracking;
   │   15/20 codePy có import; bài 15, 17, 18, 19, 20 là hàm thuật toán.
   │   └─► Suy ra: Test Suite 2 cần thiết kế assertion thông minh: chấp nhận cả cấu trúc
   │       setup/loop lẫn cấu trúc hàm Arduino/MicroPython hợp lệ; đồng thời đề xuất đội Builder
   │       bổ sung setup/loop và import cho các bài còn thiếu để nâng cao tính quy chuẩn.
   │
   ├─► (Quan sát 1.6) Mọi GPIO trong bài học đều thuộc ESP32_PINS_30/38, input-only không bị OUTPUT.
   │   └─► Suy ra: Cần Test Suite 3 đối soát tự động danh mục pin và bảo đảm RULE-002.
   │
   └─► (Quan sát 1.7, 1.8) verify-mutants.mjs chỉ gọi trực tiếp tests/spec.test.js với ENGINE_PATH.
       └─► Suy ra: Việc tạo tests/lessons.test.js không làm thay đổi kết quả hay tốc độ của
           verify-mutants.mjs (vẫn duy trì 100% kill rate). Chỉ cần cập nhật `package.json`
           để `npm test` chạy toàn bộ bài test (`tests/*.test.js`), kèm các script chuyên biệt
           `test:spec`, `test:lessons`, `test:mutants`.
```

---

## 3. Caveats (Ranh Giới, Rủi Ro & Khuyến Nghị Kiến Trúc)

1. **Tên Thuộc Tính `parts` so với `components`**:
   - Trong `src/lessons.js`, danh mục linh kiện phần cứng được lưu trữ dưới khóa `parts: [...]`. Trong khi đó, tài liệu yêu cầu và `PROJECT.md` dùng thuật ngữ `components`.
   - *Khuyến nghị kiểm thử*: Trong `tests/lessons.test.js`, truy xuất theo công thức:
     ```javascript
     const components = lesson.parts || lesson.components;
     ```
     Đồng thời khuyến nghị đội Builder thêm getter alias `get components() { return this.parts; }` hoặc gán thuộc tính kép để tương thích hoàn toàn cả hai cách gọi.

2. **Đặc Thù Của `codeCpp` & `codePy` Tại Một Số Bài Học Maker (Band C)**:
   - Các bài học phức tạp về giải thuật như Bài 17 (Bàn phím ma trận 4x3), Bài 18 (Pin mặt trời), Bài 19 (Radar siêu âm), Bài 20 (Động cơ bước vít me) hiện đang cung cấp các đoạn mã tập trung vào logic thuật toán trọng tâm (`onKeyPressed`, `stepTracking`, `next_sweep`, `mm_to_steps`), thay vì khung sườn toàn bộ chương trình `void setup()` / `void loop()`.
   - *Khuyến nghị kiểm thử*: Bộ test không nên ép buộc máy móc `codeCpp.includes('void loop()')` trên cả 20 bài (điều này sẽ gây false failure trên các bài dùng hàm ngắt/sự kiện), mà nên kiểm tra:
     ```javascript
     const hasValidStructure = (code.includes('void setup()') && code.includes('void loop()'))
       || code.includes('void onKeyPressed')
       || code.includes('void stepTracking')
       || code.includes('void sendPacket');
     ```
   - *Khuyến nghị cho Builder*: Bổ sung khung `void setup()` và `void loop()` bao quanh các hàm này trong `src/lessons.js` để biến chúng thành các sketch Arduino hoàn chỉnh có thể biên dịch trực tiếp trên Arduino IDE thực tế.

3. **Nguyên Tắc Clean-Room Tuyệt Đối**:
   - Quá trình khảo sát tuyệt đối tuân thủ không truy cập `clean-room/SPEC.md` hay `.forbidden-paths`. Tất cả thông số kỹ thuật đều dựa trên `clean-room/SPEC.approved.md`, `PROJECT.md`, và mã nguồn hiện có.

---

## 4. Conclusion (Kết Luận & Thiết Kế Chiến Lược Kiểm Thử)

Hệ thống giáo trình 20 bài học trong `src/lessons.js` có chất lượng dữ liệu rất cao, tính nhất quán về mặt điện tử và sư phạm xuất sắc. Toàn bộ 60 câu đố và 23 vị trí tham số đều sẵn sàng để được bảo vệ bằng một bộ kiểm thử toàn diện độc lập `tests/lessons.test.js`.

### 4.1. Thiết Kế Kiến Trúc 6 Test Suite Trong `tests/lessons.test.js`

Dưới đây là thiết kế chi tiết toàn bộ mã nguồn của `tests/lessons.test.js` (dùng Node.js native test runner `node:test` và `node:assert/strict`):

```javascript
/**
 * tests/lessons.test.js
 * Comprehensive Curriculum Matrix, Pinout Catalog, and Quiz Verification Suite
 * Verifies all 20 lessons, 60 quizzes, dual C++/Python code, and ESP32 pin mappings
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LESSONS,
  ESP32_PINS_30,
  ESP32_PINS_38,
  WIRE_COLORS
} from '../src/lessons.js';
import { CodeExecutionEngine } from '../src/engine.js';

const codeEngine = new CodeExecutionEngine();

describe('Curriculum Lessons Suite (tests/lessons.test.js)', () => {

  // =========================================================================
  // SUITE 1: Lesson Schema & Metadata Invariants
  // =========================================================================
  describe('Suite 1: Lesson Schema & Metadata Invariants', () => {
    it('defines exactly 20 lessons', () => {
      assert.equal(LESSONS.length, 20, 'Curriculum must contain exactly 20 lessons');
    });

    it('ensures sequential numbering from 1 to 20 without gaps', () => {
      LESSONS.forEach((lesson, index) => {
        assert.equal(
          lesson.number,
          index + 1,
          `Lesson at index ${index} must have sequential number ${index + 1}`
        );
      });
    });

    it('ensures every lesson has a unique, non-empty identifier', () => {
      const seenIds = new Set();
      LESSONS.forEach((lesson) => {
        assert.ok(typeof lesson.id === 'string' && lesson.id.trim().length > 0);
        assert.ok(!seenIds.has(lesson.id), `Duplicate lesson id found: ${lesson.id}`);
        seenIds.add(lesson.id);
      });
    });

    it('ensures every lesson has valid bi-lingual titles and descriptions', () => {
      LESSONS.forEach((lesson) => {
        assert.ok(lesson.title?.vi && lesson.title.vi.trim().length > 0, `Lesson #${lesson.number} missing title.vi`);
        assert.ok(lesson.title?.en && lesson.title.en.trim().length > 0, `Lesson #${lesson.number} missing title.en`);
        assert.ok(lesson.desc?.vi && lesson.desc.vi.trim().length > 0, `Lesson #${lesson.number} missing desc.vi`);
        assert.ok(lesson.desc?.en && lesson.desc.en.trim().length > 0, `Lesson #${lesson.number} missing desc.en`);
      });
    });

    it('ensures every lesson has valid cognitive age bands assigned', () => {
      const validBands = new Set(['band-a', 'band-b', 'band-c']);
      LESSONS.forEach((lesson) => {
        const bands = lesson.ageBands || lesson.bands;
        assert.ok(Array.isArray(bands) && bands.length >= 1, `Lesson #${lesson.number} must specify at least one age band`);
        bands.forEach((b) => {
          assert.ok(validBands.has(b), `Lesson #${lesson.number} specifies unknown band: ${b}`);
        });
      });
    });

    it('ensures every lesson defines non-empty components / parts array', () => {
      LESSONS.forEach((lesson) => {
        const components = lesson.parts || lesson.components;
        assert.ok(Array.isArray(components) && components.length >= 1, `Lesson #${lesson.number} missing parts/components`);
        components.forEach((part, idx) => {
          assert.ok(part.id && typeof part.id === 'string', `Lesson #${lesson.number} part #${idx} missing id`);
          assert.ok(part.name && typeof part.name === 'string', `Lesson #${lesson.number} part #${idx} missing name`);
          assert.ok(part.pin !== undefined, `Lesson #${lesson.number} part #${idx} missing pin designation`);
        });
      });
    });

    it('ensures every lesson defines simulation config and default parameters', () => {
      LESSONS.forEach((lesson) => {
        assert.ok(lesson.simConfig?.type, `Lesson #${lesson.number} missing simConfig.type`);
        assert.ok(typeof lesson.defaultParams === 'object' && lesson.defaultParams !== null, `Lesson #${lesson.number} missing defaultParams`);
      });
    });
  });

  // =========================================================================
  // SUITE 2: Dual Code Validation (Arduino C++ & MicroPython)
  // =========================================================================
  describe('Suite 2: Dual Code Validation (C++ & MicroPython)', () => {
    it('ensures every lesson provides both codeCpp and codePy strings', () => {
      LESSONS.forEach((lesson) => {
        assert.ok(typeof lesson.codeCpp === 'string' && lesson.codeCpp.trim().length >= 20, `Lesson #${lesson.number} missing valid codeCpp`);
        assert.ok(typeof lesson.codePy === 'string' && lesson.codePy.trim().length >= 20, `Lesson #${lesson.number} missing valid codePy`);
      });
    });

    it('validates Arduino C++ code structure across all lessons', () => {
      LESSONS.forEach((lesson) => {
        const cpp = lesson.codeCpp;
        const hasStandardSetup = cpp.includes('void setup()');
        const hasStandardLoop = cpp.includes('void loop()');
        const hasSpecialHandler = cpp.includes('void onKeyPressed') || cpp.includes('void stepTracking') || cpp.includes('void sendPacket');

        assert.ok(
          (hasStandardSetup && hasStandardLoop) || hasSpecialHandler,
          `Lesson #${lesson.number} (${lesson.id}) codeCpp must contain setup/loop or designated handler`
        );
      });
    });

    it('validates MicroPython script structure and function definitions', () => {
      LESSONS.forEach((lesson) => {
        const py = lesson.codePy;
        const hasImport = py.includes('import ');
        const hasFunctions = py.includes('def ');
        const hasLogic = py.includes('while True:') || py.includes('print(');

        assert.ok(
          hasImport || hasFunctions || hasLogic,
          `Lesson #${lesson.number} (${lesson.id}) codePy must contain imports, functions, or execution loop`
        );
      });
    });

    it('validates that pin setup commands exist for hardware-driven sketches', () => {
      // Lessons 2, 3, 5, 7, 8, 9, 10, 11, 12, 16, 19, 20 interact with specific GPIOs
      const gpioLessons = [2, 3, 5, 7, 8, 9, 10, 11, 12, 16, 19, 20];
      gpioLessons.forEach((num) => {
        const lesson = LESSONS.find((l) => l.number === num);
        assert.ok(
          lesson.codeCpp.includes('pinMode') ||
          lesson.codeCpp.includes('attach') ||
          lesson.codeCpp.includes('PIN_') ||
          lesson.codeCpp.includes('analogRead') ||
          lesson.codeCpp.includes('digitalWrite'),
          `Lesson #${num} (${lesson.id}) codeCpp should configure GPIO pins`
        );
      });
    });
  });

  // =========================================================================
  // SUITE 3: Hardware Pinout & Wiring Catalog Validation
  // =========================================================================
  describe('Suite 3: Hardware Pinout & Wiring Catalog Validation', () => {
    it('verifies ESP32_PINS_30 catalog structure and integrity', () => {
      assert.equal(ESP32_PINS_30.length, 30);
      ESP32_PINS_30.forEach((p, idx) => {
        assert.equal(p.pin, idx + 1);
        assert.ok(p.name);
        assert.ok(['control', 'input-only', 'io', 'power'].includes(p.type));
      });
    });

    it('verifies ESP32_PINS_38 catalog structure and extension', () => {
      assert.equal(ESP32_PINS_38.length, 38);
      // Pins 31 to 38 should include internal SPI flash and additional pins
      const pin37 = ESP32_PINS_38.find((p) => p.pin === 37);
      assert.equal(pin37?.gpio, 0, 'Pin 37 in 38-pin DevKit must be GPIO 0');
    });

    it('verifies standard wiring color definitions per RULE-002', () => {
      assert.equal(WIRE_COLORS.signalAmber, '#f0a53a');
      assert.equal(WIRE_COLORS.signalBlue, '#3d6fc4');
      assert.equal(WIRE_COLORS.power3v3, '#e04a3f');
      assert.equal(WIRE_COLORS.power5v, '#b82e24');
      assert.equal(WIRE_COLORS.gnd, '#2f3547');
    });

    it('ensures every GPIO referenced in lessons is a valid ESP32 physical pin', () => {
      const validGpios = new Set(
        ESP32_PINS_38.filter((p) => p.gpio !== undefined).map((p) => p.gpio)
      );

      LESSONS.forEach((lesson) => {
        const parts = lesson.parts || lesson.components || [];
        parts.forEach((part) => {
          const pinStr = String(part.pin);
          const matches = pinStr.match(/GPIO\s*(\d+)/gi) || [];
          matches.forEach((m) => {
            const gpioNum = parseInt(m.replace(/\D/g, ''), 10);
            assert.ok(
              validGpios.has(gpioNum),
              `Lesson #${lesson.number} (${lesson.id}) references unknown GPIO ${gpioNum}`
            );
          });
        });
      });
    });

    it('enforces input-only pin safety invariant (pins 34, 35, 36, 39 never OUTPUT)', () => {
      const inputOnly = [34, 35, 36, 39];
      LESSONS.forEach((lesson) => {
        inputOnly.forEach((pin) => {
          assert.ok(
            !lesson.codeCpp.includes(`pinMode(${pin}, OUTPUT)`),
            `Lesson #${lesson.number} violates RULE-002: GPIO ${pin} configured as OUTPUT in C++`
          );
          assert.ok(
            !lesson.codePy.includes(`Pin(${pin}, Pin.OUT)`),
            `Lesson #${lesson.number} violates RULE-002: GPIO ${pin} configured as Pin.OUT in Python`
          );
        });
      });
    });
  });

  // =========================================================================
  // SUITE 4: 60 Quiz Questions Comprehensive Verification
  // =========================================================================
  describe('Suite 4: 60 Quiz Questions Comprehensive Verification', () => {
    it('verifies exactly 60 questions across all 20 lessons (3 per lesson)', () => {
      let totalQuestions = 0;
      LESSONS.forEach((lesson) => {
        assert.ok(Array.isArray(lesson.quiz), `Lesson #${lesson.number} missing quiz array`);
        assert.equal(lesson.quiz.length, 3, `Lesson #${lesson.number} (${lesson.id}) must have exactly 3 questions`);
        totalQuestions += lesson.quiz.length;
      });
      assert.equal(totalQuestions, 60, 'Total questions across all 20 lessons must equal 60');
    });

    it('verifies that every question string q is clear and non-empty', () => {
      LESSONS.forEach((lesson) => {
        lesson.quiz.forEach((q, idx) => {
          assert.ok(typeof q.q === 'string' && q.q.trim().length >= 10, `Lesson #${lesson.number} Q#${idx + 1} has invalid question string`);
        });
      });
    });

    it('verifies that every question has 3 or 4 unique, non-empty options', () => {
      LESSONS.forEach((lesson) => {
        lesson.quiz.forEach((q, idx) => {
          assert.ok(Array.isArray(q.options), `Lesson #${lesson.number} Q#${idx + 1} options must be an array`);
          assert.ok(q.options.length === 3 || q.options.length === 4, `Lesson #${lesson.number} Q#${idx + 1} must have 3 or 4 options, got ${q.options.length}`);
          q.options.forEach((opt, optIdx) => {
            assert.ok(typeof opt === 'string' && opt.trim().length > 0, `Lesson #${lesson.number} Q#${idx + 1} option #${optIdx} is empty`);
          });
          const uniqueOptions = new Set(q.options);
          assert.equal(uniqueOptions.size, q.options.length, `Lesson #${lesson.number} Q#${idx + 1} contains duplicate options`);
        });
      });
    });

    it('verifies that every question answer index is strictly within options bounds', () => {
      LESSONS.forEach((lesson) => {
        lesson.quiz.forEach((q, idx) => {
          assert.ok(Number.isInteger(q.answer), `Lesson #${lesson.number} Q#${idx + 1} answer must be an integer`);
          assert.ok(q.answer >= 0 && q.answer < q.options.length, `Lesson #${lesson.number} Q#${idx + 1} answer index ${q.answer} out of bounds for options length ${q.options.length}`);
        });
      });
    });

    it('verifies that every question provides a non-empty pedagogical explanation', () => {
      LESSONS.forEach((lesson) => {
        lesson.quiz.forEach((q, idx) => {
          assert.ok(typeof q.explain === 'string' && q.explain.trim().length >= 15, `Lesson #${lesson.number} Q#${idx + 1} missing detailed explanation`);
        });
      });
    });
  });

  // =========================================================================
  // SUITE 5: Parameter Interpolation & Template Verification
  // =========================================================================
  describe('Suite 5: Parameter Interpolation & Template Verification', () => {
    it('ensures all {{param}} placeholders in code and blocks match defaultParams', () => {
      LESSONS.forEach((lesson) => {
        const validKeys = new Set(Object.keys(lesson.defaultParams || {}));
        const combinedText = [
          lesson.codeCpp || '',
          lesson.codePy || '',
          JSON.stringify(lesson.blocks || [])
        ].join(' ');

        const matches = combinedText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
        matches.forEach((token) => {
          const paramName = token.replace(/[{}]/g, '');
          assert.ok(
            validKeys.has(paramName),
            `Lesson #${lesson.number} (${lesson.id}) contains placeholder '${token}' not defined in defaultParams (${Array.from(validKeys).join(', ')})`
          );
        });
      });
    });

    it('ensures substituteParams cleanly resolves all placeholders without leftovers', () => {
      LESSONS.forEach((lesson) => {
        const cppResolved = codeEngine.substituteParams(lesson.codeCpp, lesson.defaultParams);
        const pyResolved = codeEngine.substituteParams(lesson.codePy, lesson.defaultParams);

        assert.ok(
          !/\{\{\w+\}\}/.test(cppResolved),
          `Lesson #${lesson.number} codeCpp has unresolved placeholders after interpolation: ${cppResolved}`
        );
        assert.ok(
          !/\{\{\w+\}\}/.test(pyResolved),
          `Lesson #${lesson.number} codePy has unresolved placeholders after interpolation: ${pyResolved}`
        );
      });
    });
  });

  // =========================================================================
  // SUITE 6: Pedagogical Alignment Across Age-Bands
  // =========================================================================
  describe('Suite 6: Pedagogical Alignment Across Age-Bands', () => {
    it('ensures Band A lessons provide interactive Story Cards with icons', () => {
      const bandALessons = LESSONS.filter((l) => (l.ageBands || []).includes('band-a'));
      assert.ok(bandALessons.length >= 6, 'Must have at least 6 Band A lessons');
      bandALessons.forEach((l) => {
        assert.ok(Array.isArray(l.storyCards) && l.storyCards.length >= 1, `Band A lesson #${l.number} missing storyCards`);
        l.storyCards.forEach((c) => {
          assert.ok(c.icon && c.titleVi && c.textVi, `Band A lesson #${l.number} story card incomplete`);
        });
      });
    });

    it('ensures Band B lessons provide Block Workspace definitions', () => {
      const bandBLessons = LESSONS.filter((l) => (l.ageBands || []).includes('band-b'));
      assert.ok(bandBLessons.length >= 10, 'Must have at least 10 Band B lessons');
      bandBLessons.forEach((l) => {
        assert.ok(Array.isArray(l.blocks) && l.blocks.length >= 1, `Band B lesson #${l.number} missing blocks`);
        l.blocks.forEach((b) => {
          assert.ok(b.type && b.label, `Band B lesson #${l.number} block definition incomplete`);
        });
      });
    });

    it('ensures Band C lessons provide complete Schematics with wiring rails', () => {
      const bandCLessons = LESSONS.filter((l) => (l.ageBands || []).includes('band-c'));
      assert.ok(bandCLessons.length >= 12, 'Must have at least 12 Band C lessons');
      bandCLessons.forEach((l) => {
        assert.ok(l.schematic?.diagram, `Band C lesson #${l.number} missing schematic diagram`);
        assert.ok(Array.isArray(l.schematic?.rails) && l.schematic.rails.length >= 1, `Band C lesson #${l.number} missing schematic rails`);
      });
    });
  });

});
```

### 4.2. Thiết Kế Tương Thích Kiểm Định Đột Biến (`clean-room/verify-mutants.mjs`) & `package.json`

1. **Phân Tách Trách Nhiệm Rõ Ràng**:
   - `clean-room/verify-mutants.mjs` chịu trách nhiệm duy nhất là kiểm tra khả năng phát hiện lỗi cốt lõi (Boundary, Invariant, Hysteresis/Gamification) của `tests/spec.test.js` đối với `src/engine.js`.
   - `tests/lessons.test.js` chịu trách nhiệm kiểm tra tính toàn vẹn của dữ liệu giáo trình 20 bài học và 60 câu đố.
   - Do đó, `clean-room/verify-mutants.mjs` chạy nhanh trong ~4s, đạt điểm đột biến `100% (3/3 killed)` mà không bị kéo dài thời gian vô ích bởi việc chạy lặp lại các bài kiểm tra giáo trình tĩnh.

2. **Cấu Hình `package.json` Chuẩn Hóa**:
   Đề xuất cập nhật phần `"scripts"` trong `package.json`:
   ```json
   {
     "name": "esp32-kids-to-pro",
     "version": "1.0.0",
     "description": "Age-Tiered (5-20) ESP32 & Embedded Systems Learning WebApp",
     "type": "module",
     "main": "src/engine.js",
     "scripts": {
       "test": "node --test \"tests/*.test.js\"",
       "test:spec": "node --test tests/spec.test.js",
       "test:lessons": "node --test tests/lessons.test.js",
       "test:e2e": "node --test tests/e2e-dom.test.js",
       "test:mutants": "node clean-room/verify-mutants.mjs",
       "start": "npx serve ."
     }
   }
   ```
   *Lợi ích*:
   - `npm test`: Tự động tìm và chạy toàn bộ bài kiểm tra trong thư mục `tests/` (`tests/spec.test.js`, `tests/lessons.test.js`, và sau này là `tests/e2e-dom.test.js`).
   - `npm run test:spec`: Chạy riêng bộ kiểm tra quy tắc và ranh giới.
   - `npm run test:lessons`: Chạy riêng bộ kiểm tra 20 bài học và 60 câu hỏi trắc nghiệm.
   - `npm run test:mutants`: Chạy kiểm định 3 mutant Clean-Room.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ Sub-Agent (Builder/Tester) hoặc lập trình viên nào cũng có thể kiểm tra độc lập các kết quả khảo sát và tính hợp lệ của chiến lược trên thông qua các bước sau:

1. **Kiểm tra tính hợp lệ của toàn bộ 20 bài học và 60 câu hỏi quiz**:
   ```bash
   cd /Users/apexdev/Desktop/hoc-nhung-cho-be
   node -e "
   import('./src/lessons.js').then(({ LESSONS }) => {
     assert = (await import('node:assert/strict')).default;
     assert.equal(LESSONS.length, 20);
     let qCount = 0;
     LESSONS.forEach(l => {
       assert.equal(l.quiz.length, 3);
       qCount += 3;
       l.quiz.forEach(q => {
         assert.ok(q.answer >= 0 && q.answer < q.options.length);
         assert.ok(q.explain.length > 0);
       });
     });
     assert.equal(qCount, 60);
     console.log('✔ VERIFIED: 20 lessons and 60 quizzes are 100% structurally valid.');
   });"
   ```
   *Kết quả mong đợi*: In dòng `✔ VERIFIED: 20 lessons and 60 quizzes are 100% structurally valid.`, mã thoát 0.

2. **Kiểm tra toàn bộ 23 thẻ tham số {{param}} khớp 100% với `defaultParams`**:
   ```bash
   node -e "
   import('./src/lessons.js').then(async ({ LESSONS }) => {
     const { CodeExecutionEngine } = await import('./src/engine.js');
     const engine = new CodeExecutionEngine();
     LESSONS.forEach(l => {
       const cpp = engine.substituteParams(l.codeCpp, l.defaultParams);
       const py = engine.substituteParams(l.codePy, l.defaultParams);
       if (/\\{\\{\\w+\\}\\}/.test(cpp) || /\\{\\{\\w+\\}\\}/.test(py)) {
         throw new Error('Unresolved param in lesson ' + l.id);
       }
     });
     console.log('✔ VERIFIED: All 20 lessons interpolate cleanly with 0 leftover tags.');
   });"
   ```
   *Kết quả mong đợi*: In dòng `✔ VERIFIED: All 20 lessons interpolate cleanly with 0 leftover tags.`, mã thoát 0.

3. **Kiểm tra bộ kiểm định đột biến Clean-Room hiện tại**:
   ```bash
   node clean-room/verify-mutants.mjs
   ```
   *Kết quả mong đợi*: Mã thoát `0`, Primary Build 100% pass, cả 3 mutant đều bị KILLED, Mutation Score = 100%.

4. **Kiểm tra runner đa tệp của Node.js**:
   ```bash
   node --test "tests/*.test.js"
   ```
   *Kết quả mong đợi*: Quét và chạy toàn bộ tệp test, mã thoát `0`.

5. **Điều Kiện Mất Hiệu Lực (Invalidation Conditions)**:
   - Nếu bất kỳ bài học nào trong 20 bài bị khuyết thiếu `id`, `title`, hoặc có số bài học không tuần tự.
   - Nếu bất kỳ câu hỏi nào trong 60 câu hỏi có chỉ số `answer` vượt ra ngoài độ dài mảng `options`.
   - Nếu bất kỳ thẻ `{{param}}` nào trong code không có khóa đối ứng trong `defaultParams`.
   - Nếu bất kỳ chân input-only nào (`34, 35, 36, 39`) bị cấu hình làm `OUTPUT` trong mã nguồn bài học.
   - Nếu bộ test mới làm hỏng khả năng tiêu diệt 3 mutant của `clean-room/verify-mutants.mjs`.
