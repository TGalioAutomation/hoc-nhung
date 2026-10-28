# Đặc Tả Kiến Trúc Trực Quan & Mô Phỏng 3D WebGL (Clean-Room Sanitized Visual & 3D Specification)

Tài liệu này định nghĩa chi tiết các thông số thị giác, hệ màu, kiểu chữ, bố cục giao diện khoá 100vh, mô hình 3D thủ tục (procedural 3D models), kỹ thuật đổ bóng, góc quay camera chuẩn trắc lượng (axonometric/isometric), hiệu ứng viền minh họa kiến trúc (architectural cel-outline post-processing) và thuật toán chiếu tọa độ 3D sang 2D cho hệ thống chỉ dẫn SVG (`#insp-lines`) của ứng dụng học lập trình nhúng ESP32 dành cho lứa tuổi 5–20.

---

## 1. Bố Cục Viewport Khóa 100vh & Tỷ Lệ Không Gian Làm Việc (Layout & Proportions)

### 1.1 Khung Tọa Độ Artboard Chuẩn (Virtual Canvas Coordinates)
- **Tọa độ cơ sở (Design Resolution)**: Chiều rộng cố định $W_{base} = 1672\text{px}$, chiều cao cố định $H_{base} = 941\text{px}$.
- **Nguyên lý khóa 100vh (Zero Scroll Lock)**:
  * Thẻ gốc `html, body` có thuộc tính `height: 100%; margin: 0; padding: 0; overflow: hidden;`.
  * Khung chứa chính `.artboard` sử dụng cơ chế co giãn tỷ lệ đồng dạng (Uniform Scale Factor) và căn giữa màn hình:
    $$s = \min\left(\frac{W_{viewport}}{1672},\ \frac{H_{viewport}}{941}\right)$$
    $$X_{offset} = \frac{W_{viewport} - 1672 \times s}{2},\quad Y_{offset} = \frac{H_{viewport} - 941 \times s}{2}$$
    $$\text{transform} = \text{translate}(X_{offset}\text{px},\ Y_{offset}\text{px})\ \text{scale}(s)$$
  * Trên mọi màn hình máy tính để bàn có độ phân giải $W \ge 1090\text{px}$, toàn bộ giao diện hiển thị trọn vẹn trong một khung nhìn duy nhất, tuyệt đối không xuất hiện thanh cuộn trang (page scrollbar).
  * Chế độ màn hình nhỏ (`compact mode`): Kích hoạt khi $W < 1090\text{px}$ hoặc $H < 800\text{px}$, chuyển đổi sang dạng thanh cuộn dọc cuộn các khối thành phần linh hoạt.

### 1.2 Phân Bố Vùng Không Gian (Spatial Grid Allocation)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Brand Header: top 22, left 32]                         [Status & Clock: top 22, right 32]       │
├─────────────┬────────────────────────────────────────────────────────┬───────────────────────────┤
│             │                                                        │                           │
│             │                                                        │   [Info Card]             │
│             │                                                        │   top: 112px, right: 18px │
│             │                                                        │   width: 486px            │
│  [Sidebar]  │                [3D WebGL Canvas Stage]                 │   height: 405px           │
│  top: 98px  │                inset: 0 500px 140px 72px               ├───────────────────────────┤
│  left: 0    │                (position: relative; overflow: hidden)  │                           │
│  width:     │                                                        │   [Code Card / Serial]    │
│  104px      │                                                        │   top: 527px, right: 18px │
│             │                                                        │   width: 486px            │
│             │                                                        │   height: 384px           │
│             ├────────────────────────────────────────────────────────┴───────────────────────────┤
│             │   [Bottom Lesson Carousel]                                                         │
│             │   bottom: 12px, left: 118px, right: 516px, height: 120px                           │
└─────────────┴────────────────────────────────────────────────────────────────────────────────────┘
```

- **Thanh điều hướng bên trái (`.sidebar`)**:
  * Vị trí: `position: absolute; top: 98px; bottom: 0; left: 0; width: 104px; z-index: 2;`.
  * Đường viền ngăn cách: Đường đổ bóng trong mờ `box-shadow: inset -1.5px 0 0 #efe6d8;`.
  * Biểu tượng điều hướng: Kích thước $32\text{px} \times 32\text{px}$, nhãn văn bản phông chữ cô đọng đặt phía dưới.
- **Sân khấu 3D WebGL Trung tâm (`.stage`)**:
  * Vị trí: `position: absolute; inset: 0 500px 140px 72px; z-index: 1;`.
  * Chứa thẻ `#board-canvas` chiếm toàn bộ kích thước (`width: 100%; height: 100%; display: block;`).
  * Lớp phủ SVG chỉ dẫn `#insp-lines`: `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3;`.
  * Thanh công cụ điều khiển góc nhìn 3D (`.viewbar`): Nổi tại góc dưới bên trái của sân khấu (`bottom: 18px; left: 18px; z-index: 3;`).
  * Thẻ sơ đồ nguyên lý nổi (`.schematic-card`): Đặt tại góc dưới bên phải sân khấu (`bottom: 30px; right: 26px; z-index: 2; width: 184px; height: 126px;`).
- **Bảng thông tin bài học (`.info-card`)**:
  * Vị trí: `position: absolute; top: 112px; right: 18px; width: 486px; height: 405px; z-index: 2;`.
  * Bo góc: $16\text{px}$, viền $1.5\text{px}$ màu kem trầm.
- **Bảng mã nguồn & Màn hình nối tiếp (`.code-card`)**:
  * Vị trí: `position: absolute; top: 527px; right: 18px; width: 486px; height: 384px; z-index: 2;`.
  * Tích hợp khay trượt màn hình nối tiếp (Serial Monitor Drawer) ở đáy với chiều cao mặc định $h = 92\text{px}$ có thể co giãn.

---

## 2. Hệ Màu Công Nghiệp Cổ Điển & Kiểu Chữ (Tactile Workbench Palette)

### 2.1 Bảng Màu Tiêu Chuẩn (Color Tokens)
- **Màu nền bàn làm việc (Workbench Background)**:
  * `--bg`: `#f8f1e6` (Màu giấy kem cổ điển, bề mặt bàn kỹ thuật).
  * `--bg-deep`: `#f2e8da` (Màu kem đậm chuyển tiếp).
  * Hiệu ứng chuyển sắc nền sân khấu: `radial-gradient(120% 90% at 40% 45%, #fffcf6b3, transparent 60%), #f8f1e6`.
- **Màu bề mặt thẻ & Kính mờ (Surfaces & Glass Cards)**:
  * `--card`: `#fffbf6` (Màu ngà sáng cao cấp).
  * `--card-soft`: `rgba(255, 251, 245, 0.95)` (Nền thẻ thanh tra linh kiện).
  * `--panel`: `rgba(251, 246, 238, 0.72)` (Mặt kính mờ phủ thẻ thông tin và bảng mã nguồn).
  * `--code-bg`: `#fffcf8` (Nền vùng soạn thảo mã nguồn).
- **Màu đường kẻ & Đường biên (Parchment Borders)**:
  * `--line`: `#e5d8c5` (Đường viền thẻ tiêu chuẩn $1.5\text{px}$).
  * `--line-strong`: `#d6c6af` (Đường viền phân tách nhấn mạnh).
  * `--line-soft`: `#efe6d8` (Đường viền phân vùng mờ nhẹ).
- **Màu mực & Độ tương phản chữ (Ink & Contrast)**:
  * `--navy`: `#0f2239` (Màu mực xanh than công nghiệp đậm nét).
  * `--navy-2`: `#1b2c44` (Màu tiêu đề phụ).
  * `--ink`: `#5b6168` (Màu văn bản mô tả chính).
  * `--muted`: `#6e7277` (Màu nhãn phụ).
  * `--faint`: `#a49a8c` (Màu ghi chú mờ).
- **Màu điểm nhấn xúc giác (Tactile Accents)**:
  * `--accent`: `#f86b1d` (Màu cam kỹ thuật cơ khí rực rỡ).
  * `--accent-deep`: `#dc5812` (Màu cam khi nhấn hover/active).
  * `--accent-soft`: `#fdecdd` (Màu nền hạt nút bấm cam nhạt).
  * `--green`: `#27a689` (Màu xanh ngọc báo trạng thái hoàn thành).
- **Màu cú pháp mã nguồn (Syntax Highlighting)**:
  * Từ khóa ngôn ngữ (`--kw`): `#2c5f9e` (Xanh dương kỹ thuật).
  * Tên hàm & phương thức (`--fn`): `#dc6a2a` (Cam đất nung).
  * Hằng số & giá trị số (`--num`): `#3a6aa6` (Xanh thép).
  * Chuỗi ký tự (`--str`): `#3b9450` (Xanh lá thông).
  * Số thứ tự dòng (`--gutter`): `#aea79e`.
- **Độ đổ bóng ấm (Warm Tactile Shadows)**:
  * `--shadow`: `0 10px 26px -20px rgba(110, 78, 38, 0.45)`.
  * Đổ bóng thẻ điều khiển: `0 4px 14px rgba(44, 28, 12, 0.12)`.

### 2.2 Kiểu Chữ (Typography)
- Phông chữ giao diện chính (`--sans`): `"Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Phông chữ nhãn cô đọng (`--cond`): `"Barlow Semi Condensed", "Barlow", sans-serif`, độ dày `font-weight: 500, 600, 700`.
- Phông chữ mã nguồn & ký hiệu chân cắm (`--mono`): `"JetBrains Mono", "Fira Code", monospace`.

---

## 3. Không Gian Mô Phỏng 3D WebGL (Three.js Engine)

### 3.1 Hệ Thống Camera Trắc Lượng & Góc Chiếu Đẳng Cự (Orthographic Camera)
- **Loại Camera**: `THREE.OrthographicCamera(left, right, top, bottom, near, far)`.
  * Ranh giới cắt ban đầu: `left: -1, right: 1, top: 1, bottom: -1`.
  * Mặt phẳng cắt gần/xa: `near: 1, far: 900`.
- **Góc chiếu axonometric chính xác**:
  * Góc phương vị (Azimuth $\theta$): $36^\circ$ ($36 \times \frac{\pi}{180} \approx 0.6283\text{ rad}$).
  * Góc tà / nâng (Elevation $\phi$): $43^\circ$ ($43 \times \frac{\pi}{180} \approx 0.7505\text{ rad}$).
  * Khoảng cách tâm xoay (Orbit Radius): $R = 500$.
  * Tọa độ camera từ góc $(\theta, \phi)$:
    $$X_{cam} = X_{target} + R \times \cos(\phi) \times \sin(\theta)$$
    $$Y_{cam} = Y_{target} + R \times \sin(\phi)$$
    $$Z_{cam} = Z_{target} + R \times \cos(\phi) \times \cos(\theta)$$
- **Tham số thu phóng & mục tiêu cho 20 bài học (Lesson Viewport Matrix)**:
  * Bài 01 (`board`): Mục tiêu `[0, 0, 3.6]`, Zoom `10.6`.
  * Bài 02 (`blink`): Mục tiêu `[30, 0, -6]`, Zoom `7.0`.
  * Bài 03 (`button`): Mục tiêu `[63.7, 0, 2.7]`, Zoom `5.0`.
  * Bài 04 (`wifi`): Mục tiêu `[40, 0, -4]`, Zoom `6.0`.
  * Bài 05 (`sound`): Mục tiêu `[30, 0, -6]`, Zoom `7.0`.
  * Bài 06 (`piano`): Mục tiêu `[38, 0, 8]`, Zoom `5.6`.
  * Bài 07 (`knob`): Mục tiêu `[38.6, 0, 5.9]`, Zoom `6.4`.
  * Bài 08 (`rgb`): Mục tiêu `[33.5, 0, 14.7]`, Zoom `5.0`.
  * Bài 09 (`light`): Mục tiêu `[53.2, 0, 2.7]`, Zoom `6.0`.
  * Bài 10 (`sensor`): Mục tiêu `[49.9, 0, 8.9]`, Zoom `5.6`.
  * Bài 11 (`motor`): Mục tiêu `[61.3, 0, -1.8]`, Zoom `5.4`.
  * Bài 12 (`servo`): Mục tiêu `[18, 0, 56]`, Zoom `4.6`.
  * Bài 13 (`bluetooth`): Mục tiêu `[40, 0, -4]`, Zoom `6.0`.
  * Bài 14 (`espnow`): Mục tiêu `[37.2, 0, -27]`, Zoom `6.4`.
  * Bài 15 (`project`): Mục tiêu `[34, 0, 2]`, Zoom `6.0`.
  * Bài 16 (`pump`): Mục tiêu `[-2.6, 0, -38.7]`, Zoom `3.6`.
  * Bài 17 (`keypad`): Mục tiêu `[-7, 0, 8]`, Zoom `3.4`.
  * Bài 18 (`solar`): Mục tiêu `[-58.4, 0, 11.6]`, Zoom `4.0`.
  * Bài 19 (`radar`): Mục tiêu `[-19, 0, 28.5]`, Zoom `3.4`.
  * Bài 20 (`stepper`): Mục tiêu `[-37.4, 0, -63.5]`, Zoom `3.1`.
- **Ranh giới dịch chuyển góc nhìn (Pan Bounds)**:
  * $\text{minX} = -90$, $\text{maxX} = 150$, $\text{minZ} = -110$, $\text{maxZ} = 90$.

### 3.2 Thiết Lập Chiếu Sáng & Đổ Bóng Mềm Mại (Lighting & Soft Shadows)
- **Ánh sáng bán cầu (HemisphereLight)**:
  * Bầu trời: `#fffaf3` (Ánh nắng kem ấm).
  * Mặt đất: `#c2ae90` (Phản xạ cát vàng).
  * Cường độ: $0.5$.
- **Đèn chiếu sáng chính (Key Directional Light)**:
  * Màu sắc: `#fff6ea`.
  * Cường độ: $1.2$.
  * Tọa độ vị trí: `(-55, 100, 62)`.
  * Không bật tính năng tạo bóng trên đèn này để tránh bóng cứng trùng lặp.
- **Đèn tạo bóng chuyên dụng (Shadow-Caster Light)**:
  * Loại: `THREE.DirectionalLight('#ffffff', 0.001)` (cường độ sáng mắt thường không thấy nhưng kích hoạt kênh bóng đổ).
  * Vị trí nguồn sáng: Đặt cách tâm mục tiêu một véctơ bù $\vec{Z}_u = (80, 208, -68)$.
  * Bản đồ bóng (Shadow Map):
    - Thuộc tính renderer: `shadowMap.enabled = true`, `shadowMap.type = THREE.VSMShadowMap` (loại 3).
    - Độ phân giải: $2048 \times 2048$.
    - Bán kính làm nhòe bóng (Shadow Radius): $11.0$.
    - Mẫu làm mờ (Blur Samples): $20$.
    - Độ lệch triệt tiêu sọc bóng (Shadow Bias): $-0.0004$.
    - Cập nhật bóng theo yêu cầu (`shadowMap.autoUpdate = false`, chỉ cập nhật khi linh kiện thay đổi trạng thái hoặc chuyển bài học).
- **Mặt đất hứng bóng & Lưới sàn kỹ thuật**:
  * Tọa độ độ cao mặt sàn: $Y_{ground} = -4.0$.
  * Tấm hứng bóng: `THREE.PlaneGeometry(900, 900)`, sử dụng `THREE.ShadowMaterial({ color: '#7a5532', opacity: 0.32, depthWrite: false })`, xoay góc $-90^\circ$ theo trục X (`rotation.x = -Math.PI / 2`).
  * Lưới tọa độ sàn: Nằm tại độ cao $Y = -4.01$, đường lưới đan mắt vuông $10\text{mm}$, nét kẻ mờ màu `#e5d8c5` độ mờ $0.25$.

### 3.3 Hiệu Ứng Hậu Kỳ Viền Nét Kiến Trúc (Architectural Cel-Outline Post-Processing)
Để đạt được hiệu ứng hình minh họa kỹ thuật như một bản vẽ kiến trúc sống động:
- Bộ xử lý hậu kỳ (Outline Composer) sử dụng bộ đổ bóng phát hiện cạnh dựa trên độ sâu và pháp tuyến bề mặt (Depth & Normal Discontinuity Edge Detection):
  * **Màu nét viền (`lineColor`)**: `#141a2c` (Màu xanh đen mực kỹ thuật).
  * **Độ dày nét viền (`thickness`)**: $1.3\text{px}$.
  * **Ngưỡng độ sâu (`depthThreshold`)**: $0.35$.
  * **Ngưỡng góc pháp tuyến (`normalThreshold`)**: $0.22$.
  * **Độ trong suốt viền (`lineOpacity`)**: $1.0$.
  * Cơ chế kết hợp: Nét viền được nhân đè (multiply / alpha composite) lên hình ảnh render gốc của Three.js, bao quanh toàn bộ cạnh mép của linh kiện, bo mạch và dây dẫn.

---

## 4. Mô Hình 3D Thủ Tục Cho Bo Mạch ESP32, Breadboard & Linh Kiện

### 4.1 Bo Mạch Vi Điều Khiển ESP32 DevKit V1
- **Kích thước bo mạch PCB**: Chiều rộng $28.0\text{mm}$, chiều dài $51.5\text{mm}$, chiều dày $1.6\text{mm}$.
- **Vật liệu PCB**: Màu xanh đen mờ đặc trưng (`#19232d` hoặc `#161e26`), độ gồ ghề (roughness) $0.4$, kim loại (metalness) $0.1$.
- **Hàng chân cắm hai bên (Pin Headers)**:
  * Khoảng cách bước chân tiêu chuẩn (Pin Pitch): $q = 2.54\text{mm}$.
  * 15 chân mỗi bên (tổng cộng 30 chân).
  * Vỏ nhựa thanh cắm: Khối hộp chữ nhật nhựa đen bóng chạy dọc thân bo mạch.
  * Lỗ cắm / chân hàn: Vuông kích thước $0.64\text{mm} \times 0.64\text{mm}$, mạ vàng bóng (`#f5c542`, metalness $0.9$, roughness $0.2$).
- **Vỏ kim loại mô-đun Wi-Fi ESP-WROOM-32**:
  * Tọa độ đặt: Tâm bo mạch phía trên. Kích thước $18.0\text{mm} \times 15.0\text{mm} \times 2.8\text{mm}$.
  * Bề mặt nắp che: Nhôm xước màu bạc sáng (`#d8dee9`, metalness $0.85$, roughness $0.25$).
  * Ăng-ten PCB: Vùng mạch đồng zíc-zắc in chìm ở đầu trên bo mạch.
- **Cổng giao tiếp USB-C / Micro-USB**: Đặt tại đáy bo mạch, vỏ kim loại thép không gỉ.
- **Nút nhấn vật lý EN và BOOT**: Khối đế nhựa chữ nhật với nắp nút bấm hình trụ tròn màu đen/bạc bóng, có hành trình nhấn lún $0.5\text{mm}$ khi người dùng click chuột.
- **Đèn LED báo hiệu SMD tích hợp**:
  * Đèn nguồn đỏ (`PWR`): Tọa độ $(8.6, 20.8, 0.62)$, phát quang màu đỏ rực rỡ (`#ff3b30`), cường độ phát xạ `emissiveIntensity: 1.2`.
  * Đèn tín hiệu xanh lam (`GPIO 2`): Tọa độ $(19.7, 20.8, 0.62)$, phát quang xanh dương (`#007aff`).
  * Đèn TX / RX: Phát quang vàng hổ phách nhấp nháy mô phỏng truyền dữ liệu UART khi nạp code.

### 4.2 Bảng Cắm Mạch Thử Nghiệm Solderless Breadboard
- **Kích thước thân**: Chiều rộng $55\text{mm}$, chiều dài $165\text{mm}$, chiều cao $8.5\text{mm}$.
- **Màu sắc thân**: Nhựa trắng ngà nhám nhẹ (`#f7f4ee`, roughness $0.6$).
- **Lưới lỗ cắm**:
  * Bước lưới vuông $q = 2.54\text{mm}$.
  * Cột đánh số từ 1 đến 30 (hoặc 60).
  * Hàng chữ cái `a, b, c, d, e` và `f, g, h, i, j` chia tách bởi rãnh phân cách giữa rộng $7.62\text{mm}$ (vừa vặn cắm bo mạch ESP32 hoặc IC).
  * Hai dải đường ray nguồn dọc biên: Đường viền in màu đỏ cho cực dương (`+`) và xanh lam cho cực âm (`-`).

### 4.3 Dây Nối Mạch Mềm Mại Uốn Cong (3D Curved Jumper Wires)
- **Hình học đường ống (TubeGeometry)**:
  * Bán kính dây dẫn chuẩn: $R_{wire} = 0.72\text{mm}$ (dây nối thông thường) hoặc $R_{link} = 0.55\text{mm}$ (dây nối ngắn phẳng trên breadboard).
  * Phân đoạn theo chiều dọc: $96$ đốt (tubular segments) bảo đảm đường cong mượt mà không gãy góc.
  * Phân đoạn hướng kính: $8$ cạnh (radial segments).
- **Thuật toán sinh đường cong trọng lực (3D Catenary / Bezier Wire Curve)**:
  * Điểm đầu $P_0(x_0, y_0, z_0)$ và Điểm cuối $P_1(x_1, y_1, z_1)$ là tọa độ các chân cắm hoặc lỗ breadboard.
  * Dây có đầu cắm kim loại hình trụ cắm thẳng đứng theo trục Y lên cao $6\text{mm}$.
  * Vòm cong (Arch Height) tỷ lệ thuận với khoảng cách không gian:
    $$h_{arch} = \max\left(12\text{mm},\ 0.25 \times \|P_1 - P_0\|\right)$$
  * Điểm uốn cong tự nhiên giữa dây chịu độ võng trọng lực:
    $$P_{mid} = \frac{P_0 + P_1}{2} + \begin{pmatrix} 0 \\ h_{arch} \\ 0 \end{pmatrix}$$
  * Khởi tạo đường cong bằng `THREE.CatmullRomCurve3([P_0, P_{start\_up}, P_{mid}, P_{end\_up}, P_1])`.
- **Bảng màu dây nối**:
  * Đen Than (`GND`): `#2f3547`
  * Đỏ Cờ (`VCC 3.3V / 5V`): `#e04a3f`
  * Vàng Hổ Phách (`Signal GPIO 2`): `#f0a53a`
  * Xanh Dương (`Signal GPIO 4`): `#3d6fc4`
  * Xanh Lá Ngọc (`Analog / Sensor`): `#27a689`
  * Tím Thạch Anh: `#8e44ad`
  * Trắng Bạc: `#ecf0f1`

### 4.4 Danh Mục 12 Mô Hình 3D Linh Kiện Động Theo Bài Học
1. **Bóng Đèn LED 5mm Trực Quan (Bài 2, 8)**: Thấu kính vòm nhựa bán trong suốt (Roughness $0.1$, Transmission $0.6$). Khi bật sáng, kích hoạt `THREE.PointLight` nội tại màu đỏ/xanh/vàng với bán kính chiếu sáng $35\text{mm}$.
2. **Cảm Biến Đóng Mở Cửa Tủ Lạnh (Bài 3)**: Thân tủ chữ nhật kèm cánh cửa có trục bản lề quay góc mở $\theta \in [0^\circ, 90^\circ]$ khi người dùng kéo rê chuột.
3. **Còi Chíp Buzzer Thụ Động (Bài 5)**: Trụ tròn nhựa đen với lỗ thoát âm ở giữa, màng loa kim loại dao động vi mô khi phát âm thanh.
4. **8 Phím Đàn Piano Lá Đồng Cảm Ứng (Bài 6)**: 8 thanh đồng hình chữ nhật mỏng mạ màu pastel (`#f7c6c0`, `#f9d6b2`, `#f7e7a8`, `#d3eab9`, v.v.), lún sáng khi được nhấn.
5. **Biến Trở Xoay Potentiometer (Bài 7)**: Khối đế kim loại kèm núm xoay tròn có vạch chỉ thị, góc xoay giới hạn $270^\circ$ (từ $-135^\circ$ đến $+135^\circ$).
6. **Vòng 12 Đèn Neopixel WS2812B (Bài 7)**: Vòng mạch tròn đường kính $45\text{mm}$, gắn 12 mắt LED vuông $5\text{mm} \times 5\text{mm}$ phát sáng độc lập theo góc pha màu.
7. **Cảm Biến Khoảng Cách Siêu Âm HC-SR04P (Bài 10, 19)**: Bo mạch PCB màu xanh lam với 2 mắt phát/thu kim loại lưới mạ crom bóng đường kính $16\text{mm}$. Kèm màn hình OLED I2C $0.96$ inch hiển thị số đo kỹ thuật số.
8. **Động Cơ DC Kèm Bánh Xe Vàng (Bài 11)**: Khối hộp giảm tốc màu vàng nổi bật kèm lốp cao su có vân gai quay tròn quanh trục X khi cấp xung PWM.
9. **Cổng Rào Chắn Động Cơ Servo (Bài 12)**: Vỏ động cơ Micro Servo 9g màu xanh lam trong mờ, cánh tay servo gắn cần chắn sọc trắng đỏ quay nâng từ $0^\circ$ lên $90^\circ$ khi xe đồ chơi cắt ngang tia laser đỏ.
10. **Bồn Chứa Nước & Bơm Tự Động (Bài 16)**: Bồn trụ tròn trong suốt có mặt nước màu xanh lơ dâng lên hạ xuống theo biến trạng thái mực nước; mô-đun rơ-le cơ màu xanh lam có đèn LED báo tiếp điểm đóng/ngắt.
11. **Bàn Phím Ma Trận 4x3 (Bài 17)**: Bàn phím màng gồm 12 nút bấm nổi có in ký tự số `1..9, *, 0, #` với độ lún phản hồi khi nhấn.
12. **Hệ Thống Pin Mặt Trời Tự Xoay (Bài 18)**: Tấm pin năng lượng mặt trời bề mặt tế bào quang điện màu xanh biển đậm, gắn trên khớp quay servo điều khiển góc phương vị bám theo tọa độ quả cầu mặt trời mô phỏng.

---

## 5. Hệ Thống Thanh Tra Linh Kiện Chiếu Tọa Độ 3D Sang 2D & Đường Dẫn SVG (`#insp-lines`)

### 5.1 Thuật Toán Chiếu Tọa Độ (3D World to 2D Screen Projection)
Mỗi linh kiện hoặc điểm neo (anchor) trên bo mạch 3D mang một tọa độ thế giới $\vec{P}_{world} = (x, y, z)$. Để xác định vị trí tương ứng trên mặt phẳng màn hình 2D của sân khấu:
1. Nhân tọa độ thế giới với ma trận chiếu của Camera:
   $$\vec{P}_{ndc} = \vec{P}_{world} \cdot M_{view} \cdot M_{proj}$$
   Véctơ kết quả $\vec{P}_{ndc} = (x_{ndc}, y_{ndc}, z_{ndc})$ nằm trong không gian chuẩn hóa Normalized Device Coordinates (NDC) trên khoảng $[-1, 1]$.
2. Chuyển đổi từ NDC sang tọa độ điểm ảnh pixel trong thẻ sân khấu $(W_{stage}, H_{stage})$:
   $$X_{screen} = \left(\frac{x_{ndc} + 1}{2}\right) \times W_{stage}$$
   $$Y_{screen} = \left(\frac{-y_{ndc} + 1}{2}\right) \times H_{stage}$$

### 5.2 Cơ Chế Vẽ Đường Chỉ Dẫn SVG Gấp Khúc (Orthogonal SVG Leader Lines)
Đường chỉ dẫn kết nối từ điểm neo linh kiện $(X_{screen}, Y_{screen})$ đến điểm ghim trên thẻ thông tin Inspector $(X_{card}, Y_{card})$:
- Phần tử SVG: Nằm trong thẻ `<g class="insp-leader">` trên lớp `#insp-lines`.
- Điểm tròn neo tại linh kiện: `<circle class="dot-end" cx="{X_screen}" cy="{Y_screen}" r="4.6" />`.
  * Màu sắc: Nền trắng ngà `#fffbf6`, viền xanh đen `--navy` dày $1.5\text{px}$.
- Đường gấp khúc chữ L hoặc Z mượt mà:
  * Điểm bắt đầu tại mép thẻ Inspector: $(X_{card}, Y_{card})$.
  * Điểm gấp khúc trung gian: Đoạn gãy góc vuông cách điểm neo một khoảng an toàn $22\text{px}$.
  * Lệnh vẽ đường dẫn véc-tơ:
    $$d = \text{"M } X_{card}\ Y_{card}\text{ L } X_{card}\ \max(Y_{screen} + 4,\ Y_{card} - 22)\text{ L } X_{screen}\ Y_{screen}\text{"}$$
  * Kiểu nét vẽ: Nét liền màu xanh đen `--navy` (`#141a2c`), nét thanh dày $1.2\text{px}$.

### 5.3 Thẻ Thanh Tra Linh Kiện Nổi (`#inspector`)
- Chiều rộng: $292\text{px}$, bo góc $14\text{px}$.
- Nền: `#fffbf5fa` (ngà ấm bán trong suốt phủ mờ), viền $1.5\text{px}$ màu `--line`.
- Tự do kéo rê vị trí (Draggable): Người dùng có thể nhấn giữ chuột vào thanh tiêu đề để kéo thẻ inspector đến bất kỳ vị trí thuận tiện nào trên sân khấu 3D; vị trí tùy chỉnh được ghi nhớ trong `localStorage`.
- Phím tắt đóng: Nhấn phím `Escape` lập tức ẩn thẻ inspector và đường chỉ dẫn SVG trong thời gian chuyển tiếp $\le 180\text{ ms}$.

---

## 6. Thẻ Sơ Đồ Nguyên Lý Mạch Điện Nổi (`#schematic-card`)

- **Bố cục & Vị trí**:
  * Vị trí neo góc dưới bên phải sân khấu 3D: `position: absolute; bottom: 30px; right: 26px; z-index: 2;`.
  * Kích thước ban đầu: Chiều rộng $184\text{px}$, chiều cao $126\text{px}$.
  * Bo góc: $13\text{px}$, viền $1.5\text{px}$ màu kem trầm `--line`, đổ bóng `--shadow`.
- **Tay Nắm Điều Chỉnh Kích Thước (Resize Grip `button.sch-grip`)**:
  * Nằm ở góc trên bên trái của thẻ sơ đồ nguyên lý.
  * Hiển thị biểu tượng 2 đường gạch chéo song song.
  * Khi người dùng nhấn giữ chuột vào tay nắm và kéo rê theo phương chéo: Tỷ lệ co giãn chiều rộng và chiều cao thay đổi mượt mà theo độ dời con trỏ chuột, giới hạn chiều rộng trong khoảng $[184\text{px}, 500\text{px}]$ và chiều cao trong khoảng $[126\text{px}, 380\text{px}]$.
- **Di chuyển vị trí (Draggable Header)**: Kéo rê chuột tại bất kỳ điểm nào trên thanh tiêu đề ngoài nút đóng và tay nắm sẽ di chuyển thẻ tự do khắp màn hình.
- **Bật/Tắt sơ đồ**:
  * Nút đóng `button.sch-close` trên góc phải thẻ ẩn thẻ đi.
  * Nút công tắc sơ đồ trên thanh công cụ góc nhìn (`viewbar button[data-view="schematic"]`) đồng bộ thuộc tính `aria-pressed="true|false"` cho phép ẩn/hiện sơ đồ bất cứ lúc nào.

---

## 7. Ràng Buộc Triển Khai Cho Clean-Room Builder

1. **Tuân thủ tuyệt đối thẩm mỹ công nghiệp cổ điển (Retro-tactile workbench)**:
   Mọi thành phần UI và 3D phải mang lại cảm giác chân thực như một bàn thí nghiệm cơ điện tử bằng gỗ sáng màu, linh kiện bóng bẩy tinh tế, dây nối mềm mại có trọng lực uốn cong tự nhiên, và hiệu ứng nét viền kiến trúc sắc nét.
2. **Khóa 100vh tuyệt đối trên màn hình lớn**:
   Không để bất kỳ phần tử nào gây tràn chiều dọc làm sinh thanh cuộn trang chính khi cửa sổ trình duyệt có kích thước $\ge 1090\text{px} \times 800\text{px}$.
3. **Hiệu năng 3D 60 FPS**:
   Sử dụng hình học thủ tục tối ưu hóa đốt lưới, chỉ cập nhật ma trận đổ bóng khi có sự thay đổi trạng thái mạch điện (`shadowMap.autoUpdate = false`), bảo đảm trải nghiệm tương tác xoay lật mượt mà trên mọi card đồ họa tích hợp.
