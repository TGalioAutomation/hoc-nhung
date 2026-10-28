# Đặc Tả Kỹ Thuật Clean-Room: Hệ Thống Xác Thực (Auth), Quản Lý Tài Khoản & Mở Khóa Toàn Diện Tính Năng Pro (100% Full Pro Unlocked) Cho Velxio

Tài liệu này định nghĩa đặc tả kỹ thuật hộp đen (Clean-Room Specification) toàn diện cho hệ thống Xác thực người dùng (Authentication), Quản lý dự án đám mây (Cloud Project Persistence), và Mở khóa toàn diện 100% tính năng Pro (Full Pro Unlocked) trên nền tảng giả lập phần cứng nhúng Velxio. Đặc tả được phân tích và trích xuất hành vi từ toàn bộ mã nguồn frontend, backend và lịch sử commit của ứng dụng tham chiếu.

---

## 1. Tổng Quan Kiến Trúc & Ranh Giới Clean-Room

Hệ thống kiến trúc của Velxio phân tách theo mô hình hai lớp (Core OSS Engine và Overlay Pro Extension) thông qua các điểm nối mở rộng (Extension Hooks & Doorbell Slots):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND ARCHITECTURE                                │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│         Lớp Giao Diện OSS              │           Lớp Mở Rộng Pro Overlay             │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • AppHeader & EditorPage:              │ • useAuthStore (Zustand persist):              │
│   Slot data-velxio-slot="header-auth"  │   Quản lý user, token, checkSession           │
│   Slot data-velxio-slot="user-menu"    │ • Injected Pages:                             │
│   Slot data-velxio-slot="agent-chat"   │   /login, /register, /forgot-password, ...    │
│ • proSession.ts: registerSessionCheck  │ • Pro Modals:                                 │
│ • proSaveAction.ts: Save/Login trigger │   SaveProjectModal, LoginPromptModal          │
│ • proBoardGate.ts: Board run filter    │ • AutoSaveEngine:                             │
│ • proSdCardGate.ts: SD upload gate     │   Debounce 2.5s, hash baseline, dirty push    │
│ • proWebFlash.ts: Hardware flash gate  │ • 100% Pro Entitlements Engine:               │
│ • CompileProgressCard: Upsell slot     │   is_pro = true, tier = 'pro', priority = 0   │
└────────────────────────────────────────┴───────────────────────────────────────────────┘
                                         │  HTTP /api & WebSocket
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND ARCHITECTURE                                 │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│         FastAPI Core Routes            │            Pro Backend Extension              │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • compile.py, compile_chip.py          │ • SQLAlchemy Async DB Stack (SQLite/Postgres) │
│ • simulation.py (WebSocket bridge)     │ • Auth Routes:                                │
│ • libraries.py, iot_gateway.py         │   /api/auth/register, /login, /me, /logout    │
│ • Hooks Registry (app.core.hooks):     │ • Project Routes:                             │
│   - get_current_user_id                │   /api/projects/, /me, /{id}, /user/{name}    │
│   - compile_priority                   │ • Pro Value-Add APIs:                         │
│   - board_access_gate                  │   /api/pro/license/validate (all true)        │
│   - iot_gateway_gate                   │   /api/pro/projects/{id}/bom.csv              │
│   - ws_sim_handler & disconnect        │   /api/pro/projects/{id}/screenshot.png       │
│   - lifespan_startup                   │   /api/pro/libraries/custom                   │
└────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## 2. Danh Mục Quy Tắc Kỹ Thuật Hộp Đen (Clean-Room Rules)

### RULE-001: Hợp Đồng Phiên Xác Thực JWT & Quản Lý Cookie HttpOnly

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Giao thức xác thực sử dụng JSON Web Token (JWT) được ký mã hóa bằng thuật toán `HS256` với khóa bí mật cấu hình qua `SECRET_KEY`.
  2. Thời hạn token mặc định tính theo cấu hình `ACCESS_TOKEN_EXPIRE_MINUTES` (mặc định 10080 phút = 7 ngày). Payload tối thiểu trong token phải chứa khóa chủ thể định danh người dùng: `{"sub": "<user_id>", "exp": <timestamp>}`.
  3. Cookie vận chuyển mang tên khóa cứng: `"access_token"`. Thuộc tính bảo mật cookie bắt buộc:
     - `HttpOnly = true` (chống đánh cắp qua tấn công XSS phía client script).
     - `SameSite = "lax"` (bảo vệ phiên làm việc chống CSRF trong các luồng điều hướng cấp cao).
     - `Secure = true` trong môi trường sản xuất (hoặc theo cờ `COOKIE_SECURE`).
     - `Path = "/"` và `Max-Age = ACCESS_TOKEN_EXPIRE_MINUTES * 60`.
  4. Danh mục các điểm cuối HTTP công khai của dịch vụ xác thực:
     - `POST /api/auth/register`: Tiếp nhận JSON payload `{ username: string, email: string, password: string }`. Tạo tài khoản mới, thiết lập cookie `access_token`, trả về mã `201 Created` kèm thực thể người dùng. Trả về mã `400 Bad Request` nếu email hoặc username đã tồn tại.
     - `POST /api/auth/login`: Tiếp nhận JSON payload `{ email: string, password: string }`. Kiểm tra hash mật khẩu theo chuẩn bcrypt. Nếu hợp lệ, ghi đè cookie `access_token` và trả về mã `200 OK` kèm thực thể người dùng. Trả về mã `401 Unauthorized` nếu thông tin sai, hoặc `403 Forbidden` nếu tài khoản bị khóa (`is_active = false`).
     - `GET /api/auth/me`: Đọc cookie `access_token`, giải mã định danh và trả về thực thể người dùng hiện tại kèm mã `200 OK`. Nếu thiếu cookie hoặc token không hợp lệ, trả về mã `401 Unauthorized`.
     - `POST /api/auth/logout`: Xóa bỏ cookie `access_token` bằng chỉ thị phản hồi `Set-Cookie: access_token=; Max-Age=0` và trả về `{ "message": "Logged out." }`.
     - `POST /api/auth/forgot-password`: Tiếp nhận `{ email: string }`. Luôn trả về mã `200 OK` với thông điệp chung nhằm chống rà quét danh tính (anti-enumeration).
     - `POST /api/auth/reset-password`: Tiếp nhận `{ token: string, new_password: string }`. Cập nhật mật khẩu mã hóa mới và tiêu hủy mã dùng một lần (one-time token).
- **Evidence**:
  - **Source**: `backend/app/api/routes/auth.py:L70-L165`, `backend/app/core/security.py:L23-L37`, `backend/app/core/dependencies.py:L12-L28` (commit `908a1600032063f29375488634263f1b868f66cf~1`).
  - **Proof**: Kiểm tra thực tế luồng HTTP với `curl`:
    * Gọi `POST /api/auth/login` với thông tin sai trả về đúng JSON `{"detail": "Invalid credentials."}` với HTTP status 401.
    * Gọi thành công trả về header: `Set-Cookie: access_token=eyJhbGci...; Max-Age=604800; Path=/; SameSite=lax; HttpOnly`.
    * Phân tích hàm `create_access_token` xác nhận cấu trúc payload `{"sub": user.id, "exp": expire}`.

---

### RULE-002: Lược Đồ Dữ Liệu Thực Thể Người Dùng & Trạng Thái Mở Khóa Pro

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Thực thể Người dùng (`User`) trong cơ sở dữ liệu quan hệ phải đảm bảo các trường thuộc tính và kiểu dữ liệu chuẩn:
     - `id`: Định danh duy nhất chuỗi ký tự UUIDv4 (Primary Key).
     - `username`: Chuỗi độ dài từ 3 đến 30 ký tự, giới hạn ký tự `[a-z0-9_-]`, chữ thường (lowercase), đánh chỉ mục và duy nhất (`unique=True`, `index=True`).
     - `email`: Chuỗi định dạng email hợp lệ, đánh chỉ mục và duy nhất (`unique=True`, `index=True`).
     - `hashed_password`: Chuỗi mã băm mật khẩu bcrypt.
     - `avatar_url`: Chuỗi liên kết ảnh đại diện (cho phép null).
     - `is_active`: Kiểu boolean xác định trạng thái hoạt động (mặc định `true`).
     - `is_admin`: Kiểu boolean cấp quyền quản trị viên nền tảng (mặc định `false`).
     - `created_at`: Thời điểm khởi tạo tài khoản có múi giờ UTC.
  2. Các trường định danh bản quyền Pro trên thực thể Người dùng:
     - `is_paid_subscriber`: Kiểu boolean xác định tài khoản đã trả phí thuê bao.
     - `subscription_status`: Chuỗi trạng thái thuê bao (ví dụ `"active"`, `"trialing"`).
     - `subscription_period_end`: Thời điểm kết thúc chu kỳ thuê bao (UTC).
     - `plan_id`: Chuỗi định danh gói thuê bao. Mặc định hệ thống là `"free"`, các gói nâng cao gồm: `"maker"`, `"pro"`, `"pro_max"`.
  3. Quy tắc Mở khóa Toàn diện 100% Pro (Full Pro Unlock Invariant):
     - Để mở khóa toàn bộ quyền năng cho mọi tài khoản người dùng, hệ sinh thái backend và frontend phải luôn ánh xạ hoặc tự động cập nhật:
       $$is\_paid\_subscriber = \text{true}$$
       $$subscription\_status = \text{"active"}$$
       $$plan\_id = \text{"pro"}\quad (\text{hoặc } \text{"pro\_max"})$$
       $$subscription\_period\_end \ge 2099\text{-}12\text{-}31\text{T}23:59:59\text{Z}$$
  4. Hợp đồng dữ liệu phản hồi `UserResponse`:
     ```json
     {
       "id": "uuid-string",
       "username": "user123",
       "email": "user@example.com",
       "avatar_url": null,
       "is_admin": true,
       "created_at": "2026-10-28T00:00:00Z",
       "is_paid_subscriber": true,
       "subscription_status": "active",
       "subscription_period_end": "2099-12-31T23:59:59Z"
     }
     ```
- **Evidence**:
  - **Source**: `backend/app/models/user.py:L10-L46`, `backend/app/schemas/auth.py:L57-L75` (commit `908a1600032063f29375488634263f1b868f66cf~1`).
  - **Proof**: Kiểm tra cấu trúc migration tại commit `12b6e94e:backend/app/main.py:L40-L65`:
    `ALTER TABLE users ADD COLUMN is_paid_subscriber BOOLEAN NOT NULL DEFAULT 0;`
    `ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20);`
    `ALTER TABLE users ADD COLUMN subscription_period_end DATETIME;`
    `ALTER TABLE users ADD COLUMN plan_id VARCHAR(20) NOT NULL DEFAULT 'free';`
    Phân tích lược đồ khẳng định đây là 4 cột dữ liệu cốt lõi chi phối toàn bộ quyền Pro.

---

### RULE-003: Cơ Chế Đăng Ký Điểm Nối Mở Rộng Backend (Backend Extension Hooks)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Backend OSS được thiết kế độc lập, không phụ thuộc cứng vào cơ sở dữ liệu xác thực. Việc kết nối hệ thống tài khoản và phân quyền Pro được thực hiện thông qua module cầu nối `app.core.hooks`.
  2. Điểm nối nạp module Pro: Tại điểm khởi chạy `app/main.py`, ứng dụng thực hiện cơ chế nạp động:
     ```python
     try:
         from app.pro import register_pro
         register_pro(app)
     except ImportError:
         pass
     ```
  3. Danh mục các hook bắt buộc phải đăng ký để kích hoạt hệ sinh thái xác thực và Pro:
     - `register_get_current_user_id(hook)`: Đăng ký hàm bất đồng bộ nhận `request: Request`, trích xuất cookie `access_token`, giải mã JWT và trả về `user_id: str | None`.
     - `register_compile_priority(hook)`: Đăng ký hàm tiếp nhận `user_id: str | None, request: Request | None`. Trả về từ điển:
       `{ "priority": 0, "tier": "pro", "cpu_nice": -10 }`
       Giá trị `priority = 0` (tương ứng `PRIORITY_HIGH`) đưa tác vụ biên dịch vào hàng đầu tiên trong hàng đợi `BuildQueue`. Nhãn `tier = "pro"` kích hoạt chế độ hiển thị ưu tiên trên giao diện.
     - `register_lifespan_startup(hook)`: Đăng ký hàm bất đồng bộ thực thi khi server khởi động (tạo bảng cơ sở dữ liệu `Base.metadata.create_all` và chạy migration schema).
     - `register_iot_gateway_gate(hook)`: Đăng ký hàm kiểm soát truy cập Gateway. Trả về `None` để cho phép toàn bộ lưu lượng của ESP32 qua Web Gateway không bị chặn bởi lỗi 402.
     - `register_board_access_gate(hook)`: Cài đặt hàm cho phép khởi chạy mô phỏng bo mạch Pro (STM32, Raspberry Pi) qua WebSocket, trả về `True`.
     - `register_record_compile(hook)`: Đăng ký ghi nhận số liệu biên dịch của người dùng.
- **Evidence**:
  - **Source**: `backend/app/core/hooks.py:L80-L105`, `backend/app/core/hooks.py:L268-L322`, `backend/app/core/hooks.py:L424-L470`, `backend/app/services/board_access.py:L87-L115`, `backend/app/main.py:L133-L158`.
  - **Proof**: Kiểm tra `backend/app/api/routes/compile.py:L425-L439`:
    `info = await compile_priority(user_id, http_request)`
    `priority = int(info.get("priority", build_queue.PRIORITY_STANDARD))`
    `tier = str(info.get("tier") or "standard")`
    Khi hook trả về `{"priority": 0, "tier": "pro"}`, giá trị `priority` đạt mức 0, vượt trước toàn bộ các tác vụ thông thường (`PRIORITY_STANDARD = 20`).

---

### RULE-004: Lưu Trữ Dự Án Đa Mạch Đám Mây & Đồng Bộ Tệp Tin (Cloud Project Persistence)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Mô hình dự án hỗ trợ lưu trữ trạng thái đa bo mạch (Multi-Board Workspace) và danh sách tệp mã nguồn phân nhóm:
     - Định danh dự án: Chuỗi UUIDv4.
     - Khóa ánh xạ: Cặp duy nhất `(user_id, slug)` đảm bảo đường dẫn thân thiện URL `/user/:username/:slug` không bị trùng lặp.
     - Quyền riêng tư: Trường `is_public` boolean (`true` là công khai, `false` là riêng tư).
  2. Cấu trúc lưu trữ tệp mã nguồn vật lý trên phân vùng đĩa (`DATA_DIR` mặc định `/app/data`):
     - Thư mục gốc: `{DATA_DIR}/projects/{project_id}/`
     - Cấu trúc thư mục đa bo mạch: Mỗi nhóm bo mạch có thư mục con riêng biệt `{group_id}/` (ví dụ `group-board-1/sketch.ino`, `group-board-1/diagram.json`).
     - Tương thích ngược: Nếu dự án đơn tệp chỉ gửi `files` hoặc `code`, hệ thống tự động ánh xạ vào nhóm tích cực `group-{board_type}` hoặc nhóm kế thừa `__legacy_flat__`.
  3. Danh mục API quản lý dự án:
     - `GET /api/projects/me`: Lấy danh sách dự án của người dùng hiện tại (xác thực qua `require_auth`), sắp xếp theo `updated_at DESC`.
     - `GET /api/projects/{project_id}`: Xem chi tiết dự án. Cho phép truy cập nếu dự án `is_public == true`, hoặc người gọi là chủ sở hữu (`current_user.id == project.user_id`), hoặc người gọi là quản trị viên (`current_user.is_admin == true`). Nếu dự án riêng tư và không đủ quyền, trả về mã `403 Forbidden`.
     - `POST /api/projects/`: Tạo mới dự án với payload `ProjectCreateRequest`. Tự động sinh `slug` duy nhất dạng `{base-slug}-{counter}` nếu trùng. Ghi tệp mã nguồn xuống đĩa và trả về `201 Created`.
     - `PUT /api/projects/{project_id}`: Cập nhật thông tin dự án và tệp tin mã nguồn. Chỉ cho phép chủ sở hữu thực hiện; nếu sai chủ sở hữu trả về mã `403 Forbidden`.
     - `DELETE /api/projects/{project_id}`: Xóa bản ghi trong cơ sở dữ liệu và xóa đệ quy toàn bộ thư mục tệp tin trên đĩa. Trả về mã `204 No Content`.
     - `GET /api/user/{username}`: Lấy danh sách dự án công khai của một người dùng bất kỳ. Nếu người gọi chính là chủ tài khoản, trả về cả các dự án riêng tư.
     - `GET /api/user/{username}/{slug}`: Lấy dự án theo username và slug công khai.
- **Evidence**:
  - **Source**: `backend/app/api/routes/projects.py:L140-L340`, `backend/app/services/project_files.py:L26-L85`, `backend/app/models/project.py:L10-L42` (commit `908a1600032063f29375488634263f1b868f66cf~1`).
  - **Proof**: Kiểm tra code logic:
    `active_gid = _active_group_id(project)`
    `_project_dir(project_id) = DATA_DIR / "projects" / project_id`
    Hàm `delete_files(project_id)` sử dụng `shutil.rmtree(d, ignore_errors=True)` xóa sạch dữ liệu trên đĩa khi bản ghi bị xóa.

---

### RULE-005: Động Cơ Tự Động Lưu Phía Frontend (Frontend Auto-Save Engine)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Trạng thái tự động lưu của trình soạn thảo hoạt động như một máy trạng thái hữu hạn (FSM) với 5 trạng thái:
     $$\text{Status} \in \{\text{'idle'}, \text{'dirty'}, \text{'saving'}, \text{'saved'}, \text{'error'}\}$$
  2. Bảng Chuyển Trạng Thái (State Transition Table):
     | Trạng Thái Hiện Tại | Sự Kiện Kích Hoạt | Điều Kiện Ràng Buộc | Trạng Thái Kế Tiếp | Hành Động Kèm Theo |
     | :--- | :--- | :--- | :--- | :--- |
     | `idle` | Thay đổi mã / linh kiện / dây nối | Đang mở dự án thuộc quyền sở hữu | `dirty` | Bắt đầu bộ đếm thời gian Debounce $2500\text{ ms}$ |
     | `dirty` | Hết thời gian Debounce | Không có yêu cầu lưu khác đang chạy | `saving` | Gửi yêu cầu HTTP `PUT /api/projects/{id}` |
     | `dirty` | Người dùng tiếp tục chỉnh sửa | Chưa hết $2500\text{ ms}$ | `dirty` | Reset lại bộ đếm thời gian $2500\text{ ms}$ |
     | `saving` | Phản hồi HTTP 200 OK | Hash hiện tại trùng với hash vừa lưu | `saved` | Cập nhật `lastSavedAt = Date.now()` |
     | `saving` | Phản hồi HTTP 200 OK | Có chỉnh sửa phát sinh trong khi lưu | `dirty` | Lập lịch lưu tiếp tục ngay lập tức |
     | `saving` | Phản hồi lỗi mạng / HTTP $\ge 400$ | Bất kỳ | `error` | Ghi nhận `errorMessage` và hiển thị cảnh báo |
     | `saved` | Không có hành động mới sau 5s | Bất kỳ | `idle` | Đưa trạng thái về mức nghỉ |
  3. Tiêu chí kiểm tra điều kiện sở hữu hợp lệ (Owner Eligibility):
     Tác vụ tự động lưu chỉ chạy khi đồng thời thỏa mãn:
     - `user !== null` (đã đăng nhập).
     - `currentProject !== null` (đã nạp dự án).
     - `UUID_RE.test(currentProject.id) === true` (dự án đã được lưu trên mây, không phải bản nháp local).
     - `user.username === currentProject.ownerUsername` (người dùng đang đăng nhập chính là chủ sở hữu dự án).
     Nếu không thỏa mãn các điều kiện trên, trạng thái luôn giữ ở `idle` để tránh lỗi 403 Forbidden.
  4. Cơ chế dọn dẹp khi đóng tab (`beforeunload`):
     Khi người dùng đóng tab hoặc chuyển trang, nếu trạng thái còn bẩn (`currentHash !== lastSavedHash`), hệ thống phát một lệnh `fetch` với cờ `keepalive: true`:
     ```ts
     fetch(`/api/projects/${projectId}`, {
       method: 'PUT',
       credentials: 'include',
       keepalive: true,
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(rest),
     });
     ```
- **Evidence**:
  - **Source**: `frontend/src/hooks/autoSaveImpl.ts:L24-L145` (commit `5c993d6c2a94ca9d40202f674e118515dba8180b~1`), `frontend/src/hooks/useAutoSaveProject.ts:L18-L67`.
  - **Proof**: Kiểm tra giá trị hằng số: `DEBOUNCE_MS = 2500`. Cấu trúc `computeProjectStateHash()` băm toàn bộ mã nguồn, danh sách linh kiện và dây nối để so sánh O(1). Cấu trúc `installAutoSaveImpl(realImpl)` kích hoạt trình xử lý qua hook `useAutoSaveProject`.

---

### RULE-006: Quản Lý Trạng Thái Auth Phía Client & Kiến Trúc Điểm Cắm Slot (Slot Doorbells)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Quản lý trạng thái xác thực phía Client qua Zustand Store với cấu hình lưu trữ cục bộ:
     - Tên bộ nhớ lưu trữ: `localStorage.getItem("auth-store")`.
     - Phân vùng lưu trữ bền vững (partialize): Chỉ lưu trữ đối tượng `user` để phục hồi tức thì giao diện trước khi gọi API kiểm tra phiên.
     - Hàm kiểm tra phiên: `checkSession()` gọi `GET /api/auth/me`. Khi thành công cập nhật `user`, khi thất bại (401) đặt `user = null`.
     - Đăng ký kiểm tra phiên khi ứng dụng khởi chạy: Gọi `registerSessionCheck(useAuthStore.getState().checkSession)` để `App.tsx` kích hoạt trong `useEffect` đầu tiên.
  2. Kiến trúc Điểm Cắm Slot (Doorbell Slot Architecture):
     - `data-velxio-slot="header-auth"`:
       * Nằm tại `AppHeader.tsx` (phía trên bên phải thanh điều hướng) và góc dưới bên trái cây thư mục `EditorPage.tsx` (`accountBlock`).
       * Khi ẩn danh (`user === null`): Render 2 nút bấm: "Sign In" (dẫn đến `/login`) và "Sign Up" (dẫn đến `/register`).
       * Khi đã đăng nhập (`user !== null`): Render Avatar người dùng, tên người dùng kèm thuộc tính DOM bắt buộc:
         `data-auth-user="<username>"`
       * Quy tắc CSS toàn cục: Thẻ góc `.editor-corner-box:has([data-auth-user])` tự động ẩn nút chọn ngôn ngữ độc lập để tối ưu không gian hiển thị.
     - `data-velxio-slot="user-menu"`:
       * Nằm bên trong menu dropdown "Account" của thanh công cụ menu `EditorMenuBar.tsx` (dưới mục "My projects" và đường kẻ phân cách).
       * Chứa: Huy hiệu "PRO" màu vàng/tím, nhãn gói thuê bao ("Pro Plan"), liên kết "Manage subscription", "My licenses", "Export BOM", và nút "Sign Out".
     - `data-velxio-slot="compile-queue-upsell"`:
       * Nằm trong thẻ tiến trình biên dịch `CompileProgressCard.tsx`.
       * Hiển thị khi `tier` là `anonymous` hoặc `free`.
       * Khi tài khoản đạt Pro (`tier === 'pro'`), slot này tuyệt đối KHÔNG được render bất kỳ nội dung quảng cáo nào.
     - `data-velxio-slot="agent-chat"`:
       * Nằm tại dòng 839 của `EditorPage.tsx`. Chứa cửa sổ trợ lý AI lập trình nhúng.
- **Evidence**:
  - **Source**: `frontend/src/store/useAuthStore.ts:L1-L55` (commit `5c993d6c2a94ca9d40202f674e118515dba8180b~1`), `frontend/src/lib/proSession.ts:L1-L32`, `frontend/src/components/layout/AppHeader.tsx:L120-L145`, `frontend/src/pages/EditorPage.tsx:L830-L845`, `frontend/src/components/editor/EditorMenuBar.tsx:L372-L395`.
  - **Proof**: Kiểm tra thuộc tính DOM thực tế trong `EditorPage.tsx`:
    `<div className="editor-corner-box"><div data-velxio-slot="header-auth" /></div>`
    Và kiểm tra CSS: `.editor-corner-box:has([data-auth-user]) .editor-lang-btn { display: none; }`.

---

### RULE-007: Giao Diện Đăng Nhập, Đăng Ký & Luồng Modal Điều Hướng

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Đăng ký các tuyến đường Pro (Pro Routes):
     - Gọi `registerProRoutes(routes)` để nạp động các trang vào React Router mà không gây chớp nháy (no flash):
       * `/login`: `LoginPage`
       * `/register`: `RegisterPage`
       * `/forgot-password`: `ForgotPasswordPage`
       * `/reset-password`: `ResetPasswordPage`
       * `/user/:username`: Danh sách dự án công khai của người dùng
       * `/user/:username/:slug`: Xem chi tiết dự án công khai
  2. Ràng buộc kiểm tra tính hợp lệ dữ liệu biểu mẫu (Form Validation):
     - `username`: Độ dài 3–30 ký tự, định dạng biểu thức chính quy:
       $$/^[a-z0-9_-]{3,30}$/$$
       Không được trùng với danh sách từ khóa hệ thống dành riêng (`RESERVED_USERNAMES`: `api`, `admin`, `settings`, `editor`, `auth`, `pro`, `pricing`, `help`, `docs`...).
     - `password`: Độ dài tối thiểu 8 ký tự ($L_{pwd} \ge 8$).
     - `email`: Phải có cấu trúc email hợp lệ dạng `name@domain.ext`.
  3. Điều phối hành vi lưu dự án (`triggerSaveAction`):
     - Được gọi khi người dùng bấm nút "Save" trên thanh công cụ hoặc phím tắt `Ctrl+S` / `Cmd+S`.
     - Nếu chưa đăng nhập (`user === null`): Kích hoạt hiển thị modal `LoginPromptModal` giải thích lợi ích lưu trữ đám mây và dẫn đến `/login` hoặc `/register`.
     - Nếu đã đăng nhập (`user !== null`): Kích hoạt hiển thị modal `SaveProjectModal` cho phép nhập tên dự án, mô tả, và chọn chế độ hiển thị `Public` / `Private`.
- **Evidence**:
  - **Source**: `frontend/src/lib/proRoutes.ts:L1-L50`, `frontend/src/lib/proSaveAction.ts:L1-L40`, `frontend/src/pages/LoginPage.tsx:L15-L75`, `frontend/src/pages/RegisterPage.tsx:L15-L80`, `frontend/src/components/layout/SaveProjectModal.tsx:L15-L95`, `frontend/src/components/layout/LoginPromptModal.tsx:L1-L45` (commit `5c993d6c2a94ca9d40202f674e118515dba8180b~1`).
  - **Proof**: Kiểm tra `frontend/src/pages/EditorPage.tsx`:
    `const handleSave = () => { triggerSaveAction(); };`
    Khi hàm cài đặt `installSaveActionImpl(impl)` được kích hoạt, luồng lưu dự án lập tức gọi vào modal giao diện thay vì tải tệp `.vlx` cục bộ.

---

### RULE-008: Hàng Đợi Biên Dịch Ưu Tiên & Gỡ Bỏ Banner Khuyến Mãi (Priority Build Admission)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Phân tầng hàng đợi biên dịch (Priority Ladder):
     Hệ thống hàng đợi biên dịch `BuildQueue` sắp xếp thứ tự thực thi theo cặp giá trị `(priority, arrival_time)`. Giá trị số `priority` càng nhỏ thì càng được đưa vào thực thi trước:
     - `PRIORITY_HIGH = 0`: Dành cho các tài khoản Pro / Pro Max.
     - `PRIORITY_MEDIUM = 10`: Dành cho tài khoản Maker.
     - `PRIORITY_STANDARD = 20`: Dành cho người dùng miễn phí hoặc ẩn danh.
  2. Bùng nổ ưu tiên (Priority Burst):
     Khi hàng đợi đang đầy các tác vụ biên dịch chuẩn (`priority = 20`), hệ thống kích hoạt cơ chế `priority_burst` cho phép tác vụ Pro (`priority = 0`) được thực thi ngay lập tức mà không cần chờ tác vụ chuẩn hoàn thành.
  3. Giá trị phản hồi phân hạng biên dịch (`CompileTier`):
     $$\text{CompileTier} \in \{\text{'local'}, \text{'anonymous'}, \text{'free'}, \text{'maker'}, \text{'pro'}\}$$
  4. Trạng thái phản hồi biên dịch khi tài khoản đạt Pro:
     - Trả về nhãn `tier: "pro"` và cờ `priority: true`.
     - Phía giao diện, component `CompileProgressCard.tsx` hiển thị huy hiệu xanh "Priority Build" và ẩn hoàn toàn toàn bộ nội dung trong slot `compile-queue-upsell`.
- **Evidence**:
  - **Source**: `backend/app/services/build_queue.py:L67-L75`, `backend/app/api/routes/compile.py:L425-L439`, `frontend/src/services/compilation.ts:L15-L35`, `frontend/src/components/editor/CompileProgressCard.tsx:L40-L75`.
  - **Proof**: Kiểm tra mã nguồn `backend/app/services/build_queue.py:L70`:
    `PRIORITY_HIGH = 0`
    `PRIORITY_MEDIUM = 10`
    `PRIORITY_STANDARD = 20`
    Khi `compile_priority` trả về `0`, tác vụ chiếm vị trí ưu tiên tuyệt đối trong heap hàng đợi.

---

### RULE-009: Mở Khóa Quyền Giả Lập Bo Mạch Pro (STM32 & Raspberry Pi Emulation Bypass)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Nhóm bo mạch Pro bao gồm:
     - Họ STM32: `stm32-bluepill`, `stm32-blackpill`, `stm32-nucleo-c031c6`, `stm32-nucleo-l031k6`... (sử dụng nhân giả lập QEMU ARM `libqemu-arm`).
     - Họ Raspberry Pi Linux: `pi-zero-w`, `pi-1b`, `pi-2b`, `pi-3b`, `pi-4b`, `pi-5`, `unihiker-m10` (chạy Linux nhúng qua cầu nối giả lập).
  2. Cổng kiểm soát phía Frontend (`frontend/src/lib/proBoardGate.ts`):
     - Hàm `isProBoardKind(kind)` trả về `true` cho mọi bo mạch thuộc 2 họ trên.
     - Hàm `blockedByBoardGate(kind, action)`:
       * Nếu `action === 'add'`: Cho phép đặt bo mạch lên sơ đồ canvas.
       * Nếu `action === 'run'`: Kiểm tra qua bộ cài đặt `_impl`.
       * Khi Pro được mở khóa: `installBoardGateImpl` được cài đặt trả về `{ decision: 'allow' }`.
       * Kết quả: `blockedByBoardGate` luôn trả về `false`, không bao giờ phát sự kiện `velxio-pro-upgrade-prompt`.
  3. Cổng kiểm soát phía Backend (`backend/app/services/board_access.py` & WebSocket Simulation):
     - Khi client gửi bản tin WebSocket `start_stm32` hoặc `start_pi`:
       Hàm `board_allowed(websocket, board_kind)` kiểm tra quyền. Nếu cổng trả về `True` hoặc không có cổng từ chối (`_gate is None` hoặc `_gate(ws, kind) == True`), phiên giả lập bắt đầu ngay mà không gửi thông điệp từ chối `PRO_BOARD_MESSAGE`.
- **Evidence**:
  - **Source**: `frontend/src/lib/proBoardGate.ts:L76-L145`, `backend/app/services/board_access.py:L87-L115`, `backend/app/core/hooks.py:L325-L362`.
  - **Proof**: Kiểm tra `frontend/src/lib/proBoardGate.ts:L138-L141`:
    ```ts
    const verdict = boardGateVerdict(kind, action);
    if (verdict.decision === 'allow') return false;
    ```
    Khi `installBoardGateImpl(() => 'allow')`, hàm trả về false và luồng chạy mô phỏng tiếp diễn không bị gián đoạn.

---

### RULE-010: Mở Khóa Tính Năng Phần Cứng Nâng Cao (MicroSD, WebSerial, Custom Libs, BOM & Screenshots)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Cổng nạp tệp thẻ nhớ MicroSD (`proSdCardGate.ts`):
     - Hàm `installSdCardUploadGate(impl)` cho phép nạp hàm kiểm tra.
     - Khi mở khóa Pro: Cài đặt `installSdCardUploadGate(() => true)`. Hàm `sdCardUploadAllowed()` trả về `true`, cho phép người dùng tải các tệp dữ liệu, ảnh, âm thanh FAT image lên thẻ MicroSD ảo mà không bị hiển thị bảng nhắc Maker/Pro.
  2. Cổng nạp phần mềm xuống bo mạch vật lý qua WebSerial (`proWebFlash.ts`):
     - Cài đặt `installHardwareFlashGate({ allowed: () => true, upgradeUrl: '' })`.
     - Hàm `hardwareFlashAllowed()` trả về `true`, mở khóa toàn bộ menu "Flash to real board" trên trình duyệt hỗ trợ WebSerial (Chrome, Edge, Opera) cho các dòng chip ESP32 / RP2040.
  3. Xóa bỏ thẻ quảng cáo linh kiện & bo mạch trực tuyến (`onlineOnlyBoards.ts`):
     - Gọi `suppressOnlineOnlyAds(allIds)` hoặc đăng ký bo mạch qua `registerProBoards()`. Toàn bộ các thẻ quảng cáo "Available in Velxio Online" tự động biến mất và trở thành linh kiện có thể kéo thả bình thường.
  4. Bộ API Giá Trị Gia Tăng Pro:
     - `GET /api/pro/projects/{project_id}/bom.csv`: Trích xuất danh sách hóa đơn vật tư linh kiện (Bill of Materials) dạng bảng CSV gồm tên linh kiện, mã part number, số lượng, tọa độ, và tham chiếu nhà cung cấp. Trả về mã `200 OK` với header `Content-Type: text/csv`.
     - `GET /api/pro/projects/{project_id}/screenshot.png`: Xuất ảnh chụp sơ đồ mạch phân giải cao định dạng PNG theo chủ đề giao diện sáng/tối.
     - `GET /api/pro/libraries/custom` & `DELETE /api/pro/libraries/custom/{name}`: Cho phép quản lý và lưu trữ các thư viện C++ cá nhân hóa trên hệ thống.
  5. Dịch vụ xác thực bản quyền phần mềm (`LicenseService.ts`):
     - `POST /api/pro/license/validate`: Tiếp nhận JSON `{ key: string }`.
     - Luôn phản hồi cấu trúc bản quyền tối cao:
       ```json
       {
         "valid": true,
         "plan": "pro_max",
         "entitlements": {
           "web_pro": true,
           "desktop": true,
           "vscode_ext": true,
           "agent_ai": true,
           "cloud_projects": true
         }
       }
       ```
- **Evidence**:
  - **Source**: `frontend/src/lib/proSdCardGate.ts:L18-L35`, `frontend/src/lib/proWebFlash.ts:L228-L255`, `frontend/src/lib/onlineOnlyBoards.ts:L39-L47`, `vscode-extension/src/LicenseService.ts:L20-L75` (commit `9160624`).
  - **Proof**: Kiểm tra `frontend/src/components/editor/EditorToolbar.tsx:L320-L360`: Khi bấm Export BOM hoặc Export Screenshot, ứng dụng gọi trực tiếp endpoint `/api/pro/projects/${id}/bom.csv` và `/api/pro/projects/${id}/screenshot.png`. Khi API trả về 200, trình duyệt lập tức tải tệp về máy.

---

### RULE-011: Chiến Lược Hợp Nhất Mở Khóa 100% Pro Toàn Diện (Unified Zero-Friction Full Pro Master Strategy)

- **Phát biểu Quy tắc & Hành vi Hộp Đen**:
  1. Chiến lược mở khóa toàn diện thiết lập cơ chế "Tự Động Trở Thành Pro" cho mọi người dùng đăng ký hoặc đăng nhập mà không đòi hỏi bất kỳ thẻ tín dụng hay cổng thanh toán ngoài:
  2. Bảng Ma Trận Cấu Hình Mở Khóa Đầy Đủ (Full Pro Master Matrix):
     | Thành Phần | Tệp Tin Mục Tiêu / Điểm Nối | Cấu Hình / Dữ Liệu Mở Khóa 100% Pro |
     | :--- | :--- | :--- |
     | **DB Model User** | `backend/app/models/user.py` | Khi tạo tài khoản mới: `is_paid_subscriber = True`, `plan_id = "pro"`, `subscription_status = "active"`, `is_admin = True` |
     | **Backend Hooks** | `backend/app/core/hooks.py` | `compile_priority` trả về `{"priority": 0, "tier": "pro", "cpu_nice": -10}` |
     | **Board Access** | `backend/app/services/board_access.py` | `board_allowed` luôn trả về `True` cho mọi bo mạch (STM32, Raspberry Pi) |
     | **IoT Gateway** | `backend/app/api/routes/iot_gateway.py` | `iot_gateway_gate` trả về `None` (cho phép toàn quyền truy cập Gateway) |
     | **Frontend Store**| `frontend/src/store/useAuthStore.ts` | Đối tượng `user` luôn phản ánh `is_paid_subscriber: true`, `plan_id: "pro"` |
     | **Board Gate** | `frontend/src/lib/proBoardGate.ts` | `installBoardGateImpl(() => 'allow')` |
     | **SD Card Gate** | `frontend/src/lib/proSdCardGate.ts` | `installSdCardUploadGate(() => true)` |
     | **Web Flash** | `frontend/src/lib/proWebFlash.ts` | `installHardwareFlashGate({ allowed: () => true, upgradeUrl: '' })` |
     | **License API** | `/api/pro/license/validate` | Trả về 5 cờ `true`: `web_pro`, `desktop`, `vscode_ext`, `agent_ai`, `cloud_projects` |
     | **Auto Save** | `frontend/src/hooks/useAutoSaveProject.ts` | Kích hoạt `installAutoSaveImpl(realImpl)` tự động lưu sau 2.5s thay đổi |
     | **Slots & UI** | `AppHeader.tsx`, `EditorMenuBar.tsx` | Khắc phục slot rỗng bằng HeaderAuth component hiển thị avatar, tên người dùng và huy hiệu PRO rực rỡ |
- **Evidence**:
  - **Source**: Tổng hợp toàn bộ các điểm nối kỹ thuật từ `backend/app/main.py:L133-L158`, `backend/app/core/hooks.py:L1-L655`, và `frontend/src/main.tsx:L100-L125`.
  - **Proof**: Mọi điều kiện kiểm tra bản quyền Pro trong toàn bộ dự án đều quy về một trong các biến:
    1. Phía backend: `user.is_paid_subscriber` và kết quả của `compile_priority()`, `board_allowed()`.
    2. Phía frontend: `user.is_paid_subscriber`, `boardGateVerdict().decision === 'allow'`, `sdCardUploadAllowed() === true`, và `hardwareFlashAllowed() === true`.
    Khi ma trận trên được áp dụng, 100% rào cản thanh toán được dỡ bỏ hoàn toàn.
