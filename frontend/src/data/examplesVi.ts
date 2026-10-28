import type { ExampleProject } from './examples';

/**
 * Bộ từ điển & Engine Việt hóa tự động cho toàn bộ 400+ Dự án Mẫu của Velxio
 * (Bao gồm 100 Days of IoT, Arduino, ESP32, Pico, Mạch Tương Tự SPICE, Mạch Số Logic)
 * đồng thời giữ nguyên từ khóa tiếng Anh trong `tags` để tìm kiếm song ngữ.
 */

const EXACT_TITLE_MAP: Record<string, string> = {
  'Blink': 'Nhấp Nháy Đèn LED (Blink Cơ Bản)',
  'Traffic Light': 'Đèn Giao Thông Thông Minh (Đỏ - Vàng - Xanh)',
  'Button': 'Nút Nhấn Điều Khiển Đèn LED',
  'Fade': 'Hiệu Ứng Đèn LED Sáng Mờ Dần (PWM Fade)',
  'Analog Read Serial': 'Đọc Biến Trở Analog & In Lên Serial',
  'Digital Read Serial': 'Đọc Trạng Thái Nút Nhấn Lên Màn Hình Serial',
  'Servo Sweep': 'Điều Khiển Động Cơ Servo Quay Quét Góc 0°–180°',
  'Servo Knob': 'Điều Khiển Góc Quay Servo Bằng Núm Xoay Biến Trở',
  'Ultrasonic Distance Sensor': 'Đo Khoảng Cách Bằng Cảm Biến Siêu Âm HC-SR04',
  'DHT22 Temperature & Humidity': 'Đo Nhiệt Độ & Độ Ẩm Với Cảm Biến DHT22',
  'LCD 16x2 (I2C)': 'Hiển Thị Chữ Lên Màn Hình LCD 16x2 (Giao Tiếp I2C)',
  'NeoPixel Ring': 'Hiệu Ứng Cầu Vồng Trên Vòng Đèn LED RGB NeoPixel',
  'Buzzer Melody': 'Phát Bản Nhạc Giai Điệu Bằng Còi Chip (Piezo Buzzer)',
  'PIR Motion Alarm': 'Còi Báo Động Phát Hiện Chuyển Động Hồng Ngoại (PIR)',
  'RGB LED Color Mixer': 'Pha Trộn Màu Sắc Với Đèn LED RGB 3 Màu',
  '7-Segment Counter': 'Bộ Đếm Số Từ 0–9 Trên Đèn LED 7 Thanh',
  '4x4 Membrane Keypad': 'Bàn Phím Ma Trận 4x4 Nhập Mật Khẩu',
  'ESP32 WiFi + MQTT': 'ESP32 Kết Nối Wi-Fi & Truyền Dữ Liệu Qua Giao Thức MQTT',
  'ILI9341 TFT Hello — ESP32-S3': 'Màn Hình Màu ILI9341 TFT Trên ESP32-S3',
  'Desktop Robot — Animated Eyes': 'Robot Để Bàn — Đôi Mắt Biểu Cảm Hoạt Hình Trên OLED',
  'Voltage Divider': 'Mạch Phân Áp Điện Trở (Voltage Divider)',
  'RC Low-Pass Filter': 'Mạch Lọc Thông Thấp RC (Low-Pass Filter)',
  'RC High-Pass Filter': 'Mạch Lọc Thông Cao RC (High-Pass Filter)',
  'Wheatstone Bridge': 'Cầu Điện Trở Đo Lường Wheatstone',
  'Half-Wave Rectifier': 'Mạch Chỉnh Lưu Nửa Chu Kỳ Dùng Diode',
  'Full-Wave Bridge Rectifier': 'Mạch Chỉnh Lưu Cầu Toàn Chu Kỳ (4 Diode)',
  'Zener Voltage Regulator': 'Mạch Ổn Áp Dùng Diode Zener',
  'BJT Common-Emitter Amplifier': 'Mạch Khuếch Đại Transistor BJT Cực Phát Chung',
  'MOSFET Switch': 'Mạch Đóng Ngắt Tải Bằng Transistor MOSFET',
  'Inverting Op-Amp': 'Mạch Khuếch Đại Thuật Toán Đảo (Inverting Op-Amp)',
  'Non-Inverting Op-Amp': 'Mạch Khuếch Đại Thuật Toán Không Đảo (Non-Inverting Op-Amp)',
  'AQI ESP': 'Trạm Đo Chỉ Số Chất Lượng Không Khí (AQI) Với ESP32',
  'Auto Night Light using LDR (ESP32 + MicroPython)': 'Đèn Ngủ Tự Động Bật Khi Trời Tối Dùng Quang Trở LDR (ESP32 + MicroPython)',
  'Battery Monitor with Blynk IoT': 'Hệ Thống Giám Sát Pin Từ Xa Qua Blynk IoT',
};

const TITLE_PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^Day\s+(\d+)\s*[-–:]\s*/i, 'Ngày $1: '],
  [/^Arduino Uno:\s*/i, 'Arduino Uno: '],
  [/^Arduino Nano:\s*/i, 'Arduino Nano: '],
  [/^Arduino Mega:\s*/i, 'Arduino Mega: '],
  [/^ESP32:\s*/i, 'ESP32: '],
  [/^ESP32-S3:\s*/i, 'ESP32-S3: '],
  [/^ESP32-C3:\s*/i, 'ESP32-C3: '],
  [/^Raspberry Pi Pico:\s*/i, 'Raspberry Pi Pico: '],
  [/\bBlinking LED\b/gi, 'Nhấp nháy đèn LED'],
  [/\bBlink LED\b/gi, 'Nhấp nháy đèn LED'],
  [/\bBlink\b/gi, 'Nhấp nháy LED'],
  [/\bTraffic Light(s)?\b/gi, 'Đèn giao thông'],
  [/\bKnight Rider\b/gi, 'Hiệu ứng đèn chạy đuổi Knight Rider'],
  [/\bPush\s*Button\b/gi, 'Nút nhấn'],
  [/\bButton Counter\b/gi, 'Bộ đếm số lần bấm nút'],
  [/\bButton\b/gi, 'Nút nhấn'],
  [/\bPotentiometer\b/gi, 'Biến trở xoay'],
  [/\bUltrasonic Distance\b/gi, 'Đo khoảng cách siêu âm'],
  [/\bUltrasonic Sensor\b/gi, 'Cảm biến siêu âm'],
  [/\bDistance Meter\b/gi, 'Thước đo khoảng cách điện tử'],
  [/\bTemperature\s*(?:&|and)\s*Humidity\b/gi, 'Nhiệt độ & Độ ẩm'],
  [/\bTemperature Sensor\b/gi, 'Cảm biến nhiệt độ'],
  [/\bWeather Station\b/gi, 'Trạm thời tiết thông minh'],
  [/\bSmart Home\b/gi, 'Nhà thông minh (Smart Home)'],
  [/\bSmart Irrigation\b/gi, 'Hệ thống tưới cây tự động'],
  [/\bPlant Watering\b/gi, 'Tưới cây tự động'],
  [/\bSoil Moisture\b/gi, 'Độ ẩm đất'],
  [/\bMotion Detector\b/gi, 'Thiết bị phát hiện chuyển động'],
  [/\bMotion Sensor\b/gi, 'Cảm biến chuyển động PIR'],
  [/\bSecurity Alarm\b/gi, 'Hệ thống báo động an ninh'],
  [/\bFire Alarm\b/gi, 'Cảnh báo cháy sớm'],
  [/\bGas Leakage\b/gi, 'Cảnh báo rò rỉ khí gas'],
  [/\bGas Sensor\b/gi, 'Cảm biến khí gas'],
  [/\bSmoke Detector\b/gi, 'Thiết bị báo khói'],
  [/\bNight Light\b/gi, 'Đèn ngủ tự động'],
  [/\bStreet Light\b/gi, 'Đèn đường tự động'],
  [/\bLight Sensor\b/gi, 'Cảm biến ánh sáng'],
  [/\bServo Motor\b/gi, 'Động cơ Servo'],
  [/\bStepper Motor\b/gi, 'Động cơ bước (Stepper)'],
  [/\bDC Motor\b/gi, 'Động cơ điện một chiều (DC)'],
  [/\bOLED Display\b/gi, 'Màn hình OLED'],
  [/\bSSD1306 OLED\b/gi, 'Màn hình OLED SSD1306'],
  [/\bLCD Display\b/gi, 'Màn hình LCD'],
  [/\b7-Segment Display\b/gi, 'Màn hình LED 7 thanh'],
  [/\b7-Segment\b/gi, 'LED 7 thanh'],
  [/\bDot Matrix\b/gi, 'Ma trận điểm LED'],
  [/\bNeoPixel\b/gi, 'Đèn LED đổi màu NeoPixel'],
  [/\bRGB LED\b/gi, 'Đèn LED đa sắc RGB'],
  [/\bBuzzer\b/gi, 'Còi báo âm thanh (Buzzer)'],
  [/\bPiezo\b/gi, 'Loa gốm Piezo'],
  [/\bIR Remote\b/gi, 'Điều khiển hồng ngoại (IR Remote)'],
  [/\bKeypad\b/gi, 'Bàn phím ma trận'],
  [/\bJoystick\b/gi, 'Cần điều khiển trò chơi (Joystick)'],
  [/\bRotary Encoder\b/gi, 'Bộ mã hóa vòng quay (Rotary Encoder)'],
  [/\bShift Register\b/gi, 'Thanh ghi dịch (Shift Register)'],
  [/\bRelay\b/gi, 'Rơ-le đóng ngắt điện (Relay)'],
  [/\bmicroSD Card\b/gi, 'Thẻ nhớ microSD'],
  [/\bWall Clock\b/gi, 'Đồng hồ treo tường kỹ thuật số'],
  [/\bDigital Clock\b/gi, 'Đồng hồ số'],
  [/\bStopwatch\b/gi, 'Đồng hồ bấm giờ thể thao'],
  [/\bTimer\b/gi, 'Bộ hẹn giờ'],
  [/\bThermometer\b/gi, 'Nhiệt kế điện tử'],
  [/\bVoltmeter\b/gi, 'Vôn kế đo điện áp'],
  [/\bOscilloscope\b/gi, 'Máy hiện sóng'],
  [/\bVoltage Divider\b/gi, 'Mạch phân áp'],
  [/\bLow-Pass Filter\b/gi, 'Mạch lọc thông thấp'],
  [/\bHigh-Pass Filter\b/gi, 'Mạch lọc thông cao'],
  [/\bBand-Pass Filter\b/gi, 'Mạch lọc thông dải'],
  [/\bRectifier\b/gi, 'Mạch chỉnh lưu'],
  [/\bAmplifier\b/gi, 'Mạch khuếch đại'],
  [/\bOscillator\b/gi, 'Mạch tạo dao động'],
  [/\bComparator\b/gi, 'Mạch so sánh điện áp'],
  [/\bLogic Gate(s)?\b/gi, 'Cổng logic số'],
  [/\bHalf Adder\b/gi, 'Mạch cộng bán phần (Half Adder)'],
  [/\bFull Adder\b/gi, 'Mạch cộng toàn phần (Full Adder)'],
  [/\bMultiplexer\b/gi, 'Bộ dồn kênh (Multiplexer)'],
  [/\bDemultiplexer\b/gi, 'Bộ phân kênh (Demultiplexer)'],
  [/\bDecoder\b/gi, 'Bộ giải mã (Decoder)'],
  [/\bEncoder\b/gi, 'Bộ mã hóa (Encoder)'],
  [/\bFlip-Flop\b/gi, 'Mạch chốt nhớ Flip-Flop'],
  [/\bCounter\b/gi, 'Bộ đếm xung số'],
  [/\bSerial Echo\b/gi, 'Phản hồi dữ liệu qua cổng Serial'],
  [/\buse an external library\b/gi, 'Sử dụng thư viện mở rộng ngoài'],
  [/\bone remote, two receivers\b/gi, '1 điều khiển từ xa điều khiển 2 mắt thu'],
  [/\busing\b/gi, 'sử dụng'],
  [/\bwith\b/gi, 'kết hợp'],
];

const DESC_PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bDrive the cheap 4-pin SSD1306 OLED module\b/gi, 'Điều khiển mô-đun màn hình OLED SSD1306 4 chân thông dụng'],
  [/\bover I2C from an\b/gi, 'qua giao tiếp I2C từ bo mạch'],
  [/\bShows\b/gi, 'Hiển thị dòng chữ'],
  [/\bwith a live counter\b/gi, 'kèm bộ đếm số tăng trực tiếp'],
  [/\bBlinks an LED\b/gi, 'Làm nhấp nháy đèn LED'],
  [/\bBlink an LED\b/gi, 'Làm nhấp nháy đèn LED'],
  [/\bReads a pushbutton\b/gi, 'Đọc tín hiệu từ nút nhấn'],
  [/\bMeasures distance\b/gi, 'Đo khoảng cách vật cản'],
  [/\bReads temperature and humidity\b/gi, 'Đọc dữ liệu nhiệt độ và độ ẩm môi trường'],
  [/\bControls a servo motor\b/gi, 'Điều khiển góc quay của động cơ Servo'],
  [/\bconnected to pin\b/gi, 'được nối vào chân'],
  [/\bevery second\b/gi, 'mỗi giây một lần'],
  [/\bonto the Serial Monitor\b/gi, 'lên Màn hình nối tiếp (Serial Monitor)'],
  [/\bin the Serial Monitor\b/gi, 'trên Màn hình nối tiếp (Serial Monitor)'],
  [/\busing PWM\b/gi, 'bằng xung điều chế độ rộng (PWM)'],
  [/\bClick the button\b/gi, 'Nhấn vào nút bấm trên mạch'],
  [/\bDrag the slider\b/gi, 'Kéo thanh trượt trên cảm biến'],
];

export const CATEGORY_LABELS_VI: Record<ExampleProject['category'], string> = {
  basics: 'Cơ bản',
  sensors: 'Cảm biến',
  displays: 'Màn hình',
  communication: 'Truyền thông & IoT',
  games: 'Trò chơi',
  robotics: 'Robot & Động cơ',
  circuits: 'Mạch điện SPICE',
};

export const DIFFICULTY_META_VI: Record<
  ExampleProject['difficulty'],
  { label: string; ageBand: string; xp: number }
> = {
  beginner: { label: '🌱 Cơ bản (+50 XP)', ageBand: '5–8 tuổi', xp: 50 },
  intermediate: { label: '🧩 Trung cấp (+100 XP)', ageBand: '9–13 tuổi', xp: 100 },
  advanced: { label: '🚀 Nâng cao (+200 XP)', ageBand: '14–20 tuổi', xp: 200 },
};

export function translateTitleToVi(title: string, category: ExampleProject['category']): string {
  const trimmed = (title || '').trim();
  if (EXACT_TITLE_MAP[trimmed]) {
    return EXACT_TITLE_MAP[trimmed];
  }
  let out = trimmed;
  for (const [pattern, replacement] of TITLE_PHRASE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  // Nếu tiêu đề vẫn hoàn toàn bằng tiếng Anh chưa có tiền tố tiếng Việt, gắn nhãn chủ đề dễ hiểu
  if (out === trimmed && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(out)) {
    const prefixMap: Record<ExampleProject['category'], string> = {
      basics: 'Bài tập Cơ bản: ',
      sensors: 'Thực hành Cảm biến: ',
      displays: 'Thực hành Màn hình: ',
      communication: 'Kết nối & IoT: ',
      games: 'Trò chơi Điện tử: ',
      robotics: 'Điều khiển Robot: ',
      circuits: 'Thí nghiệm Mạch điện: ',
    };
    return `${prefixMap[category] ?? 'Dự án: '}${out}`;
  }
  return out;
}

export function translateDescriptionToVi(
  description: string,
  difficulty: ExampleProject['difficulty'],
  category: ExampleProject['category'],
): string {
  const trimmed = (description || '').trim();
  let out = trimmed;
  for (const [pattern, replacement] of DESC_PHRASE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  const meta = DIFFICULTY_META_VI[difficulty] ?? DIFFICULTY_META_VI.beginner;
  const catLabel = CATEGORY_LABELS_VI[category] ?? 'Điện tử nhúng';
  if (!out.includes('Nhiệm vụ XP')) {
    out = `[Chủ đề: ${catLabel} · Độ tuổi gợi ý: ${meta.ageBand} · Thưởng: +${meta.xp} XP] ${out}`;
  }
  return out;
}

export function localizeExampleProjectVi(example: ExampleProject): ExampleProject {
  const origTitle = example.title || '';
  const origDesc = example.description || '';
  const viTitle = translateTitleToVi(origTitle, example.category);
  const viDesc = translateDescriptionToVi(origDesc, example.difficulty, example.category);

  // Giữ nguyên từ khóa tiếng Anh trong tags để tìm kiếm song ngữ Việt - Anh đều khớp 100%
  const extraTags = [
    origTitle.toLowerCase(),
    CATEGORY_LABELS_VI[example.category]?.toLowerCase() ?? '',
    DIFFICULTY_META_VI[example.difficulty]?.ageBand ?? '',
  ].filter(Boolean);

  return {
    ...example,
    title: viTitle,
    description: viDesc,
    tags: Array.from(new Set([...(example.tags ?? []), ...extraTags])),
  };
}
