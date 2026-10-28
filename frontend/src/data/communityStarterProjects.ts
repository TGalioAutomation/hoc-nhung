/**
 * Vietnamese Youth Community Starter Projects
 *
 * 9 curated, interactive, and 100% open projects created for and by Vietnamese students
 * across three age brackets: 5–8 tuổi (Khởi động), 9–13 tuổi (Khám phá), and 14–20 tuổi (Sáng chế).
 *
 * Each project contains complete circuit diagrams (components & wires) and C++ source code,
 * ready for 1-Click Instant Remix in the Velxio simulator without network access.
 */

import type { CommunityProject, LeaderboardEntry, CommunityProjectFilter } from '../types/community';

// Helper to construct a standard wire definition
function makeWire(id: string, from: [string, string], to: [string, string], color: string) {
  return {
    id,
    start: { componentId: from[0], pinName: from[1] },
    end: { componentId: to[0], pinName: to[1] },
    color,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. NHÓM 5–8 TUỔI (Tia Lửa Nhỏ — Khám Phá & Trực Quan)
// ════════════════════════════════════════════════════════════════════════════

// Dự án 1: 🚦 Đèn Giao Thông Ngã Tư Phố Cổ
const codeTrafficLight = `// 🚦 Đèn Giao Thông Ngã Tư Phố Cổ (Bé Minh Khang - 7 tuổi, Hà Nội)
// Chu kỳ chuẩn an toàn: Đỏ (3s) -> Vàng (1s) -> Xanh (3s) -> Vàng (1s)

const int LED_DO = 13;
const int LED_VANG = 12;
const int LED_XANH = 11;

void setup() {
  Serial.begin(9600);
  pinMode(LED_DO, OUTPUT);
  pinMode(LED_VANG, OUTPUT);
  pinMode(LED_XANH, OUTPUT);
  Serial.println("🚦 He thong den giao thong Pho Co da khoi dong!");
}

void loop() {
  // 1. Đèn ĐỎ sáng - Yêu cầu xe dừng lại, bé đi bộ qua đường an toàn
  Serial.println("🔴 DEN DO: Dung lai nao!");
  digitalWrite(LED_DO, HIGH);
  digitalWrite(LED_VANG, LOW);
  digitalWrite(LED_XANH, LOW);
  delay(3000);

  // 2. Đèn VÀNG sáng - Chuẩn bị sẵn sàng
  Serial.println("🟡 DEN VANG: Di cham thoi nhe!");
  digitalWrite(LED_DO, LOW);
  digitalWrite(LED_VANG, HIGH);
  delay(1000);

  // 3. Đèn XANH sáng - Xe được phép di chuyển
  Serial.println("🟢 DEN XANH: Xe duoc phep di!");
  digitalWrite(LED_VANG, LOW);
  digitalWrite(LED_XANH, HIGH);
  delay(3000);

  // 4. Đèn VÀNG sáng lại trước khi chuyển sang Đỏ
  digitalWrite(LED_XANH, LOW);
  digitalWrite(LED_VANG, HIGH);
  delay(1000);
}
`;

const componentsTrafficLight = [
  { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 80, y: 100, properties: {} },
  { type: 'wokwi-led', id: 'led-red', x: 440, y: 80, properties: { color: 'red', label: 'Đèn Đỏ' } },
  { type: 'wokwi-led', id: 'led-yellow', x: 440, y: 170, properties: { color: 'yellow', label: 'Đèn Vàng' } },
  { type: 'wokwi-led', id: 'led-green', x: 440, y: 260, properties: { color: 'green', label: 'Đèn Xanh' } },
  { type: 'wokwi-resistor', id: 'r-red', x: 320, y: 90, properties: { value: '220' } },
  { type: 'wokwi-resistor', id: 'r-yellow', x: 320, y: 180, properties: { value: '220' } },
  { type: 'wokwi-resistor', id: 'r-green', x: 320, y: 270, properties: { value: '220' } },
];

const wiresTrafficLight = [
  makeWire('w1', ['arduino-uno', '13'], ['r-red', '1'], '#ff2222'),
  makeWire('w2', ['r-red', '2'], ['led-red', 'A'], '#ff2222'),
  makeWire('w3', ['arduino-uno', '12'], ['r-yellow', '1'], '#ffaa00'),
  makeWire('w4', ['r-yellow', '2'], ['led-yellow', 'A'], '#ffaa00'),
  makeWire('w5', ['arduino-uno', '11'], ['r-green', '1'], '#00dd44'),
  makeWire('w6', ['r-green', '2'], ['led-green', 'A'], '#00dd44'),
  makeWire('w7', ['led-red', 'C'], ['arduino-uno', 'GND.1'], '#222222'),
  makeWire('w8', ['led-yellow', 'C'], ['arduino-uno', 'GND.1'], '#222222'),
  makeWire('w9', ['led-green', 'C'], ['arduino-uno', 'GND.1'], '#222222'),
];

// Dự án 2: 🎵 Chuông Cửa Giai Điệu Doraemon
const codeDoorbell = `// 🎵 Chuông Cửa Giai Điệu Doraemon (Bé An Nhiên - 6 tuổi, TP.HCM)
// Bấm nút chuông để phát bài hát Doraemon và chớp đèn LED xanh!

const int PIN_COI = 8;
const int PIN_NUT_CHUONG = 2;
const int PIN_LED = 9;

// Tần số các nốt nhạc
#define NOTE_C4 262
#define NOTE_D4 294
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_G4 392
#define NOTE_A4 440
#define NOTE_B4 494
#define NOTE_C5 523

int melody[] = {
  NOTE_E4, NOTE_G4, NOTE_A4, NOTE_G4, NOTE_E4, NOTE_C4, NOTE_D4, NOTE_E4,
  NOTE_D4, NOTE_C4, NOTE_E4, NOTE_G4, NOTE_A4, NOTE_C5, NOTE_A4, NOTE_G4
};

int noteDurations[] = {
  4, 4, 4, 4, 4, 4, 4, 2,
  4, 4, 4, 4, 4, 4, 4, 2
};

void setup() {
  Serial.begin(9600);
  pinMode(PIN_COI, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_NUT_CHUONG, INPUT_PULLUP);
  Serial.println("🎵 Chuong cua Doraemon san sang don khach!");
}

void playDoraemon() {
  Serial.println("🔔 Khach bam chuong! Dang phat bai hat Doraemon...");
  int totalNotes = sizeof(melody) / sizeof(melody[0]);
  for (int thisNote = 0; thisNote < totalNotes; thisNote++) {
    digitalWrite(PIN_LED, HIGH);
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(PIN_COI, melody[thisNote], noteDuration);
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(PIN_COI);
    digitalWrite(PIN_LED, LOW);
  }
}

void loop() {
  // Khi nút nhấn được bấm (chân nối đất -> LOW)
  if (digitalRead(PIN_NUT_CHUONG) == LOW) {
    playDoraemon();
    delay(500); // Tránh bấm liên tục
  }
}
`;

const componentsDoorbell = [
  { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 80, y: 100, properties: {} },
  { type: 'wokwi-buzzer', id: 'buzzer', x: 420, y: 80, properties: { volume: '0.6' } },
  { type: 'wokwi-pushbutton', id: 'btn-doorbell', x: 400, y: 220, properties: { color: 'green', label: 'Bấm Chuông' } },
  { type: 'wokwi-led', id: 'led-bell', x: 500, y: 220, properties: { color: 'blue', label: 'Đèn Báo' } },
  { type: 'wokwi-resistor', id: 'r-bell', x: 460, y: 310, properties: { value: '220' } },
];

const wiresDoorbell = [
  makeWire('w1', ['arduino-uno', '8'], ['buzzer', '2'], '#9933cc'),
  makeWire('w2', ['buzzer', '1'], ['arduino-uno', 'GND.1'], '#222222'),
  makeWire('w3', ['arduino-uno', '2'], ['btn-doorbell', '2.1'], '#ff8800'),
  makeWire('w4', ['btn-doorbell', '1.1'], ['arduino-uno', 'GND.2'], '#222222'),
  makeWire('w5', ['arduino-uno', '9'], ['r-bell', '1'], '#0088ff'),
  makeWire('w6', ['r-bell', '2'], ['led-bell', 'A'], '#0088ff'),
  makeWire('w7', ['led-bell', 'C'], ['arduino-uno', 'GND.3'], '#222222'),
];

// Dự án 3: 🌈 Vòng LED Cầu Vồng Kỳ Diệu
const codeRainbow = `// 🌈 Vòng LED Cầu Vồng Kỳ Diệu (Bé Bảo Nam - 8 tuổi, Đà Nẵng)
// Xoay biến trở để điều chỉnh tốc độ dải màu cầu vồng NeoPixel 16 LED!

#include <Adafruit_NeoPixel.h>

#define PIN_LED       6
#define SO_LUONG_LED  16
#define PIN_BIEN_TRO  A0

Adafruit_NeoPixel strip(SO_LUONG_LED, PIN_LED, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(9600);
  strip.begin();
  strip.show(); // Tắt toàn bộ LED lúc khởi động
  strip.setBrightness(120);
  Serial.println("🌈 Vong LED Cau Vong NeoPixel da sang!");
}

// Tạo màu cầu vồng mượt mà
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}

void loop() {
  int potValue = analogRead(PIN_BIEN_TRO);
  int delayTime = map(potValue, 0, 1023, 5, 60);

  for(long firstPixelHue = 0; firstPixelHue < 256; firstPixelHue += 2) {
    for(int i = 0; i < strip.numPixels(); i++) {
      int pixelHue = (firstPixelHue + (i * 256 / strip.numPixels())) % 256;
      strip.setPixelColor(i, Wheel(pixelHue));
    }
    strip.show();
    delay(delayTime);
  }
}
`;

const componentsRainbow = [
  { type: 'wokwi-arduino-nano', id: 'arduino-nano', x: 80, y: 100, properties: {} },
  { type: 'wokwi-neopixel-ring', id: 'ring-16', x: 380, y: 80, properties: { pixels: '16' } },
  { type: 'wokwi-potentiometer', id: 'pot-speed', x: 380, y: 260, properties: { label: 'Tốc Độ Xoay' } },
];

const wiresRainbow = [
  makeWire('w1', ['arduino-nano', '5V'], ['ring-16', 'VCC'], '#ff0000'),
  makeWire('w2', ['arduino-nano', 'GND.1'], ['ring-16', 'GND'], '#000000'),
  makeWire('w3', ['arduino-nano', 'D6'], ['ring-16', 'DIN'], '#00ff88'),
  makeWire('w4', ['arduino-nano', '5V'], ['pot-speed', 'VCC'], '#ff0000'),
  makeWire('w5', ['arduino-nano', 'GND.2'], ['pot-speed', 'GND'], '#000000'),
  makeWire('w6', ['arduino-nano', 'A0'], ['pot-speed', 'SIG'], '#0088ff'),
];

// ════════════════════════════════════════════════════════════════════════════
// 2. NHÓM 9–13 TUỔI (Thợ Điện & Khám Phá Mạch)
// ════════════════════════════════════════════════════════════════════════════

// Dự án 4: 🌱 Tưới Cây Thông Minh Tự Động
const codeSmartGarden = `// 🌱 Tưới Cây Thông Minh Tự Động (Bạn Gia Huy - 11 tuổi, Cần Thơ)
// Đo độ ẩm đất, hiển thị LCD 16x2 I2C và tự động kích hoạt Relay bơm nước

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int PIN_CAM_BIEN_DAT = A0;
const int PIN_RELAY_BOM = 7;
const int NGUONG_DAT_KHO = 40; // Dưới 40% là đất khô cần tưới

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAY_BOM, OUTPUT);
  digitalWrite(PIN_RELAY_BOM, LOW); // Tắt bơm lúc đầu

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("HE THONG TUOI");
  lcd.setCursor(0, 1);
  lcd.print("CAY THONG MINH");
  delay(1500);
  lcd.clear();
}

void loop() {
  int giaTriDoc = analogRead(PIN_CAM_BIEN_DAT);
  // Quy đổi giá trị ADC 0-1023 sang phần trăm độ ẩm 0-100%
  int doAm = map(giaTriDoc, 0, 1023, 0, 100);

  lcd.setCursor(0, 0);
  lcd.print("Do am: ");
  lcd.print(doAm);
  lcd.print("%   ");

  lcd.setCursor(0, 1);
  if (doAm < NGUONG_DAT_KHO) {
    // Đất khô -> Bật bơm
    digitalWrite(PIN_RELAY_BOM, HIGH);
    lcd.print("Trang thai: BOM ");
    Serial.println("🌱 Dat kho! Dang bom nuoc cho cay...");
  } else {
    // Đất đủ ẩm -> Tắt bơm
    digitalWrite(PIN_RELAY_BOM, LOW);
    lcd.print("Trang thai: DU AM");
    Serial.println("✅ Dat du am. Da tat bom.");
  }
  delay(1000);
}
`;

const componentsSmartGarden = [
  { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 80, y: 100, properties: {} },
  { type: 'wokwi-lcd1602', id: 'lcd', x: 400, y: 60, properties: { pins: 'i2c' } },
  { type: 'wokwi-potentiometer', id: 'soil-sensor', x: 380, y: 220, properties: { label: 'Độ Ẩm Đất' } },
  { type: 'wokwi-relay-module', id: 'relay', x: 420, y: 340, properties: {} },
  { type: 'wokwi-led', id: 'led-pump', x: 580, y: 340, properties: { color: 'cyan', label: 'Máy Bơm' } },
  { type: 'wokwi-resistor', id: 'r-pump', x: 540, y: 420, properties: { value: '220' } },
];

const wiresSmartGarden = [
  makeWire('w1', ['arduino-uno', '5V'], ['lcd', 'VCC'], '#ff0000'),
  makeWire('w2', ['arduino-uno', 'GND.1'], ['lcd', 'GND'], '#000000'),
  makeWire('w3', ['arduino-uno', 'A4'], ['lcd', 'SDA'], '#00aaff'),
  makeWire('w4', ['arduino-uno', 'A5'], ['lcd', 'SCL'], '#ffaa00'),
  makeWire('w5', ['arduino-uno', '5V'], ['soil-sensor', 'VCC'], '#ff0000'),
  makeWire('w6', ['arduino-uno', 'GND.2'], ['soil-sensor', 'GND'], '#000000'),
  makeWire('w7', ['arduino-uno', 'A0'], ['soil-sensor', 'SIG'], '#00cc44'),
  makeWire('w8', ['arduino-uno', '7'], ['relay', 'IN'], '#ff6600'),
  makeWire('w9', ['arduino-uno', '5V'], ['relay', 'VCC'], '#ff0000'),
  makeWire('w10', ['arduino-uno', 'GND.3'], ['relay', 'GND'], '#000000'),
  makeWire('w11', ['relay', 'NO'], ['led-pump', 'A'], '#00eeff'),
  makeWire('w12', ['led-pump', 'C'], ['r-pump', '1'], '#00eeff'),
  makeWire('w13', ['r-pump', '2'], ['arduino-uno', 'GND.1'], '#000000'),
];

// Dự án 5: 🦇 Gậy Dò Đường Tránh Vật Cản
const codeSmartCane = `// 🦇 Gậy Dò Đường Tránh Vật Cản (Bạn Tuệ Lâm - 12 tuổi, Hải Phòng)
// Raspberry Pi Pico + Cảm biến siêu âm HC-SR04 cảnh báo bằng còi Buzzer nhịp dồn dập

const int PIN_TRIG = 2;
const int PIN_ECHO = 3;
const int PIN_COI = 15;
const int PIN_LED = 14;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_COI, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  Serial.println("🦇 Gay do duong thong minh Pi Pico da san sang!");
}

long measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 400; // Không có vật cản
  return duration * 0.034 / 2;
}

void loop() {
  long distance = measureDistanceCm();
  Serial.print("Khoang cach vat can: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (distance < 30) {
    // RẤT GẦN (< 30cm) -> Còi kêu liên tục nguy hiểm!
    digitalWrite(PIN_LED, HIGH);
    tone(PIN_COI, 1200);
    delay(100);
  } else if (distance < 80) {
    // GẦN (30 - 80cm) -> Còi kêu bíp dồn dập
    digitalWrite(PIN_LED, HIGH);
    tone(PIN_COI, 800, 60);
    delay(120);
    digitalWrite(PIN_LED, LOW);
    noTone(PIN_COI);
    delay(120);
  } else {
    // AN TOÀN (> 80cm) -> Không kêu
    digitalWrite(PIN_LED, LOW);
    noTone(PIN_COI);
    delay(250);
  }
}
`;

const componentsSmartCane = [
  { type: 'wokwi-pi-pico', id: 'pi-pico', x: 80, y: 100, properties: {} },
  { type: 'wokwi-hc-sr04', id: 'sonar', x: 380, y: 80, properties: {} },
  { type: 'wokwi-buzzer', id: 'buzzer', x: 400, y: 230, properties: { volume: '0.7' } },
  { type: 'wokwi-led', id: 'led-warn', x: 480, y: 230, properties: { color: 'red', label: 'Cảnh Báo' } },
  { type: 'wokwi-resistor', id: 'r-warn', x: 440, y: 310, properties: { value: '220' } },
];

const wiresSmartCane = [
  makeWire('w1', ['pi-pico', 'VBUS'], ['sonar', 'VCC'], '#ff0000'),
  makeWire('w2', ['pi-pico', 'GND.1'], ['sonar', 'GND'], '#000000'),
  makeWire('w3', ['pi-pico', 'GP2'], ['sonar', 'TRIG'], '#ffaa00'),
  makeWire('w4', ['pi-pico', 'GP3'], ['sonar', 'ECHO'], '#00ccff'),
  makeWire('w5', ['pi-pico', 'GP15'], ['buzzer', '2'], '#9933cc'),
  makeWire('w6', ['buzzer', '1'], ['pi-pico', 'GND.2'], '#000000'),
  makeWire('w7', ['pi-pico', 'GP14'], ['r-warn', '1'], '#ff2222'),
  makeWire('w8', ['r-warn', '2'], ['led-warn', 'A'], '#ff2222'),
  makeWire('w9', ['led-warn', 'C'], ['pi-pico', 'GND.3'], '#000000'),
];

// Dự án 6: 👀 Robot Để Bàn Mắt Biểu Cảm
const codeAnimatedEyes = `// 👀 Robot Để Bàn Mắt Biểu Cảm (Bạn Quang Anh - 10 tuổi, Hà Nội)
// ESP32-S3 điều khiển màn hình OLED SSD1306 vẽ đôi mắt hoạt hình chớp mắt và đổi biểu cảm

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int PIN_NUT_CHUYEN = 0; // Nút nhấn đổi biểu cảm

int mood = 0; // 0: Vui vẻ, 1: Chớp mắt, 2: Ngạc nhiên, 3: Nhìn sang trái/phải

void setup() {
  Serial.begin(115200);
  pinMode(PIN_NUT_CHUYEN, INPUT_PULLUP);

  Wire.begin(4, 5); // SDA = 4, SCL = 5 trên ESP32-S3
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Loi ket noi man hinh OLED SSD1306!");
    for(;;);
  }
  display.clearDisplay();
  display.display();
  Serial.println("👀 Robot mat bieu cam ESP32-S3 da san sang!");
}

void drawEyes(int leftX, int leftY, int w, int h, int pupilOffsetX) {
  display.clearDisplay();
  // Mắt trái
  display.fillRoundRect(leftX, leftY, w, h, 8, SSD1306_WHITE);
  display.fillCircle(leftX + (w / 2) + pupilOffsetX, leftY + (h / 2), 6, SSD1306_BLACK);

  // Mắt phải (đối xứng)
  int rightX = SCREEN_WIDTH - leftX - w;
  display.fillRoundRect(rightX, leftY, w, h, 8, SSD1306_WHITE);
  display.fillCircle(rightX + (w / 2) + pupilOffsetX, leftY + (h / 2), 6, SSD1306_BLACK);

  display.display();
}

void loop() {
  if (digitalRead(PIN_NUT_CHUYEN) == LOW) {
    mood = (mood + 1) % 4;
    delay(300);
  }

  switch(mood) {
    case 0: // Bình thường / Vui vẻ
      drawEyes(24, 16, 34, 32, 0);
      delay(800);
      // Tự động chớp mắt
      drawEyes(24, 28, 34, 6, 0);
      delay(150);
      break;

    case 1: // Liếc mắt sang trái rồi sang phải
      drawEyes(24, 16, 34, 32, -8);
      delay(700);
      drawEyes(24, 16, 34, 32, 8);
      delay(700);
      break;

    case 2: // Mắt to ngạc nhiên O_O
      drawEyes(20, 10, 38, 44, 0);
      delay(1000);
      break;

    case 3: // Tinh nghịch nháy mắt
      display.clearDisplay();
      display.fillRoundRect(24, 16, 34, 32, 8, SSD1306_WHITE); // Mắt trái mở
      display.fillCircle(24 + 17, 16 + 16, 6, SSD1306_BLACK);
      display.drawFastHLine(72, 32, 34, SSD1306_WHITE); // Mắt phải nháy
      display.display();
      delay(1000);
      break;
  }
}
`;

const componentsAnimatedEyes = [
  { type: 'wokwi-esp32-s3-devkitc-1', id: 'esp32-s3', x: 80, y: 100, properties: {} },
  { type: 'wokwi-ssd1306', id: 'oled', x: 420, y: 80, properties: {} },
  { type: 'wokwi-pushbutton', id: 'btn-mood', x: 420, y: 260, properties: { color: 'blue', label: 'Đổi Biểu Cảm' } },
];

const wiresAnimatedEyes = [
  makeWire('w1', ['esp32-s3', '3V3'], ['oled', 'VCC'], '#ff0000'),
  makeWire('w2', ['esp32-s3', 'GND.1'], ['oled', 'GND'], '#000000'),
  makeWire('w3', ['esp32-s3', '4'], ['oled', 'SDA'], '#00aaff'),
  makeWire('w4', ['esp32-s3', '5'], ['oled', 'SCL'], '#ffaa00'),
  makeWire('w5', ['esp32-s3', '0'], ['btn-mood', '2.1'], '#ff8800'),
  makeWire('w6', ['btn-mood', '1.1'], ['esp32-s3', 'GND.2'], '#000000'),
];

// ════════════════════════════════════════════════════════════════════════════
// 3. NHÓM 14–20 TUỔI (Kỹ Sư IoT & Kiến Trúc Sư Nhúng)
// ════════════════════════════════════════════════════════════════════════════

// Dự án 7: ☁️ Trạm Đo Chất Lượng Không Khí AQI IoT
const codeAqiStation = `// ☁️ Trạm Đo Chất Lượng Không Khí AQI IoT (Nhóm STEM Lê Hồng Phong - 15 tuổi, TP.HCM)
// ESP32 Wi-Fi + Cảm biến DHT22 + Cảm biến bụi/khí gas tính chỉ số VN-AQI và xuất dữ liệu JSON IoT

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int PIN_GAS_ADC = 34; // Biến trở mô phỏng nồng độ bụi PM2.5 / khí gas
const int PIN_LED_TOT = 18;
const int PIN_LED_XAU = 19;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_TOT, OUTPUT);
  pinMode(PIN_LED_XAU, OUTPUT);

  dht.begin();
  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("TRAM QUAN TRAC AQI");
  display.println("LHP STEM VIET NAM");
  display.display();
  delay(1500);
}

void loop() {
  float nhietDo = dht.readTemperature();
  float doAm = dht.readHumidity();
  int rawGas = analogRead(PIN_GAS_ADC);

  // Thuật toán tính VN-AQI ước tính
  int aqi = map(rawGas, 0, 4095, 15, 220);

  // Xuất gói tin Telemetry IoT qua Serial (sẵn sàng gửi MQTT / Blynk)
  Serial.print("{\\"station\\":\\"LHP-STEM-01\\",\\"temp\\":");
  Serial.print(nhietDo, 1);
  Serial.print(",\\"humidity\\":");
  Serial.print(doAm, 1);
  Serial.print(",\\"aqi\\":");
  Serial.print(aqi);
  Serial.println("}");

  // Điều khiển LED cảnh báo
  if (aqi <= 100) {
    digitalWrite(PIN_LED_TOT, HIGH);
    digitalWrite(PIN_LED_XAU, LOW);
  } else {
    digitalWrite(PIN_LED_TOT, LOW);
    digitalWrite(PIN_LED_XAU, HIGH);
  }

  // Cập nhật màn hình OLED
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("AQI: ");
  display.setTextSize(2);
  display.print(aqi);

  display.setTextSize(1);
  display.setCursor(80, 0);
  if (aqi <= 50) display.print("TOT");
  else if (aqi <= 100) display.print("V.DUOC");
  else if (aqi <= 150) display.print("K.TOT");
  else display.print("NGUY HAI");

  display.drawFastHLine(0, 20, 128, SSD1306_WHITE);
  display.setCursor(0, 26);
  display.print("Nhiet do : ");
  display.print(nhietDo, 1);
  display.print(" C");

  display.setCursor(0, 40);
  display.print("Do am    : ");
  display.print(doAm, 1);
  display.print(" %");

  display.setCursor(0, 54);
  display.print("Ket noi  : Wi-Fi OK");
  display.display();

  delay(2000);
}
`;

const componentsAqiStation = [
  { type: 'wokwi-esp32-devkit-v1', id: 'esp32', x: 80, y: 100, properties: {} },
  { type: 'wokwi-dht22', id: 'dht', x: 400, y: 60, properties: { temperature: '28.5', humidity: '72' } },
  { type: 'wokwi-potentiometer', id: 'pm25-sensor', x: 400, y: 190, properties: { label: 'Bụi PM2.5' } },
  { type: 'wokwi-ssd1306', id: 'oled', x: 400, y: 320, properties: {} },
  { type: 'wokwi-led', id: 'led-good', x: 580, y: 60, properties: { color: 'green', label: 'AQI Tốt' } },
  { type: 'wokwi-led', id: 'led-bad', x: 580, y: 160, properties: { color: 'red', label: 'AQI Xấu' } },
  { type: 'wokwi-resistor', id: 'r-good', x: 530, y: 100, properties: { value: '220' } },
  { type: 'wokwi-resistor', id: 'r-bad', x: 530, y: 200, properties: { value: '220' } },
];

const wiresAqiStation = [
  makeWire('w1', ['esp32', '3V3'], ['dht', 'VCC'], '#ff0000'),
  makeWire('w2', ['esp32', 'GND.1'], ['dht', 'GND'], '#000000'),
  makeWire('w3', ['esp32', '4'], ['dht', 'SDA'], '#ffaa00'),
  makeWire('w4', ['esp32', '3V3'], ['pm25-sensor', 'VCC'], '#ff0000'),
  makeWire('w5', ['esp32', 'GND.2'], ['pm25-sensor', 'GND'], '#000000'),
  makeWire('w6', ['esp32', '34'], ['pm25-sensor', 'SIG'], '#00ccff'),
  makeWire('w7', ['esp32', '3V3'], ['oled', 'VCC'], '#ff0000'),
  makeWire('w8', ['esp32', 'GND.3'], ['oled', 'GND'], '#000000'),
  makeWire('w9', ['esp32', '21'], ['oled', 'SDA'], '#00aaff'),
  makeWire('w10', ['esp32', '22'], ['oled', 'SCL'], '#ffaa00'),
  makeWire('w11', ['esp32', '18'], ['r-good', '1'], '#00ff44'),
  makeWire('w12', ['r-good', '2'], ['led-good', 'A'], '#00ff44'),
  makeWire('w13', ['led-good', 'C'], ['esp32', 'GND.1'], '#000000'),
  makeWire('w14', ['esp32', '19'], ['r-bad', '1'], '#ff2222'),
  makeWire('w15', ['r-bad', '2'], ['led-bad', 'A'], '#ff2222'),
  makeWire('w16', ['led-bad', 'C'], ['esp32', 'GND.2'], '#000000'),
];

// Dự án 8: 🎹 Đàn Piano Cảm Ứng Điện Dung 8 Nốt
const codePiano = `// 🎹 Đàn Piano Cảm Ứng 8 Nốt (Bạn Hoàng Phúc - 16 tuổi, TP. Huế)
// Vi điều khiển STM32 ARM Cortex-M3 tổng hợp âm thanh PWM chuẩn tần số âm nhạc quốc tế

const int PIN_COI = PB0;

// Các chân phím bấm (Đồ, Rê, Mi, Pha, Son, La, Si, Đố)
const int PHIM_PINS[8] = {PA0, PA1, PA2, PA3, PA4, PA5, PA6, PA7};

// Bảng tần số chuẩn Hertz
const int NOTE_FREQ[8] = {
  262, // C4 (Đồ)
  294, // D4 (Rê)
  330, // E4 (Mi)
  349, // F4 (Pha)
  392, // G4 (Son)
  440, // A4 (La)
  494, // B4 (Si)
  523  // C5 (Đố)
};

const char* NOTE_NAMES[8] = {"Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do2"};

void setup() {
  Serial.begin(115200);
  pinMode(PIN_COI, OUTPUT);

  for (int i = 0; i < 8; i++) {
    pinMode(PHIM_PINS[i], INPUT_PULLUP);
  }
  Serial.println("🎹 Dan Piano Dien Tu STM32 da san sang trinh dien!");
}

void loop() {
  bool isPlaying = false;

  for (int i = 0; i < 8; i++) {
    if (digitalRead(PHIM_PINS[i]) == LOW) {
      tone(PIN_COI, NOTE_FREQ[i]);
      Serial.print("Not: ");
      Serial.println(NOTE_NAMES[i]);
      isPlaying = true;
      delay(80);
      break;
    }
  }

  if (!isPlaying) {
    noTone(PIN_COI);
  }
}
`;

const componentsPiano = [
  { type: 'wokwi-stm32-f103c8', id: 'stm32', x: 80, y: 120, properties: {} },
  { type: 'wokwi-buzzer', id: 'buzzer', x: 420, y: 80, properties: { volume: '0.8' } },
  { type: 'wokwi-pushbutton', id: 'key-1', x: 380, y: 220, properties: { color: 'white', label: 'C4 Đồ' } },
  { type: 'wokwi-pushbutton', id: 'key-2', x: 430, y: 220, properties: { color: 'white', label: 'D4 Rê' } },
  { type: 'wokwi-pushbutton', id: 'key-3', x: 480, y: 220, properties: { color: 'white', label: 'E4 Mi' } },
  { type: 'wokwi-pushbutton', id: 'key-4', x: 530, y: 220, properties: { color: 'white', label: 'F4 Pha' } },
  { type: 'wokwi-pushbutton', id: 'key-5', x: 580, y: 220, properties: { color: 'white', label: 'G4 Son' } },
  { type: 'wokwi-pushbutton', id: 'key-6', x: 630, y: 220, properties: { color: 'white', label: 'A4 La' } },
  { type: 'wokwi-pushbutton', id: 'key-7', x: 680, y: 220, properties: { color: 'white', label: 'B4 Si' } },
  { type: 'wokwi-pushbutton', id: 'key-8', x: 730, y: 220, properties: { color: 'white', label: 'C5 Đố' } },
];

const wiresPiano = [
  makeWire('w1', ['stm32', 'PB0'], ['buzzer', '2'], '#9933cc'),
  makeWire('w2', ['buzzer', '1'], ['stm32', 'GND.1'], '#000000'),
  makeWire('w3', ['stm32', 'PA0'], ['key-1', '2.1'], '#ffaa00'),
  makeWire('w4', ['key-1', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w5', ['stm32', 'PA1'], ['key-2', '2.1'], '#ffaa00'),
  makeWire('w6', ['key-2', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w7', ['stm32', 'PA2'], ['key-3', '2.1'], '#ffaa00'),
  makeWire('w8', ['key-3', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w9', ['stm32', 'PA3'], ['key-4', '2.1'], '#ffaa00'),
  makeWire('w10', ['key-4', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w11', ['stm32', 'PA4'], ['key-5', '2.1'], '#ffaa00'),
  makeWire('w12', ['key-5', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w13', ['stm32', 'PA5'], ['key-6', '2.1'], '#ffaa00'),
  makeWire('w14', ['key-6', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w15', ['stm32', 'PA6'], ['key-7', '2.1'], '#ffaa00'),
  makeWire('w16', ['key-7', '1.1'], ['stm32', 'GND.2'], '#000000'),
  makeWire('w17', ['stm32', 'PA7'], ['key-8', '2.1'], '#ffaa00'),
  makeWire('w18', ['key-8', '1.1'], ['stm32', 'GND.2'], '#000000'),
];

// Dự án 9: 🔒 Khóa Cửa Mật Mã Điện Tử An Toàn
const codeKeypadLock = `// 🔒 Khóa Cửa Mật Mã Điện Tử An Toàn (Bạn Khánh Vy - 17 tuổi, Bình Dương)
// Bàn phím ma trận 4x4 + Động cơ Servo chốt khóa + Màn hình LCD I2C + Còi báo động khi sai 3 lần

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo lockServo;

const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

const int PIN_SERVO = 11;
const int PIN_COI = 12;
const int PIN_LED_KHOA = 13;
const int PIN_LED_MO = 10;

String masterCode = "1234";
String inputCode = "";
int saiCount = 0;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_COI, OUTPUT);
  pinMode(PIN_LED_KHOA, OUTPUT);
  pinMode(PIN_LED_MO, OUTPUT);

  lockServo.attach(PIN_SERVO);
  lockDoor();

  lcd.init();
  lcd.backlight();
  showPrompt();
}

void lockDoor() {
  lockServo.write(0); // 0 độ: Chốt đóng
  digitalWrite(PIN_LED_KHOA, HIGH);
  digitalWrite(PIN_LED_MO, LOW);
}

void unlockDoor() {
  lockServo.write(90); // 90 độ: Chốt mở
  digitalWrite(PIN_LED_KHOA, LOW);
  digitalWrite(PIN_LED_MO, HIGH);
}

void showPrompt() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("NHAP MAT MA PIN:");
  lcd.setCursor(0, 1);
  lcd.print("____");
}

void loop() {
  char key = keypad.getKey();
  if (key) {
    if (key == '#') {
      // Xác nhận mật mã
      if (inputCode == masterCode) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("DUNG MAT MA!");
        lcd.setCursor(0, 1);
        lcd.print("MO CUA TRONG 5S");
        unlockDoor();
        tone(PIN_COI, 1000, 200);
        delay(5000);
        lockDoor();
        saiCount = 0;
        inputCode = "";
        showPrompt();
      } else {
        saiCount++;
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("SAI MAT MA!");
        lcd.setCursor(0, 1);
        lcd.print("Lan sai: ");
        lcd.print(saiCount);
        tone(PIN_COI, 400, 500);
        delay(1500);

        if (saiCount >= 3) {
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("CANH BAO AN NINH!");
          lcd.setCursor(0, 1);
          lcd.print("KHOA 10 GIAY...");
          for (int i = 0; i < 10; i++) {
            tone(PIN_COI, 1500, 300);
            delay(500);
          }
          saiCount = 0;
        }
        inputCode = "";
        showPrompt();
      }
    } else if (key == '*') {
      // Xóa nhập lại
      inputCode = "";
      showPrompt();
    } else {
      if (inputCode.length() < 4) {
        inputCode += key;
        lcd.setCursor(inputCode.length() - 1, 1);
        lcd.print("*");
        tone(PIN_COI, 800, 50);
      }
    }
  }
}
`;

const componentsKeypadLock = [
  { type: 'wokwi-arduino-mega', id: 'arduino-mega', x: 80, y: 100, properties: {} },
  { type: 'wokwi-membrane-keypad', id: 'keypad', x: 420, y: 60, properties: {} },
  { type: 'wokwi-servo', id: 'servo', x: 420, y: 260, properties: { label: 'Chốt Khóa' } },
  { type: 'wokwi-lcd1602', id: 'lcd', x: 420, y: 400, properties: { pins: 'i2c' } },
  { type: 'wokwi-buzzer', id: 'buzzer', x: 640, y: 260, properties: { volume: '0.6' } },
  { type: 'wokwi-led', id: 'led-locked', x: 640, y: 360, properties: { color: 'red', label: 'Khóa' } },
  { type: 'wokwi-led', id: 'led-unlocked', x: 640, y: 430, properties: { color: 'green', label: 'Mở' } },
  { type: 'wokwi-resistor', id: 'r-lock', x: 600, y: 380, properties: { value: '220' } },
  { type: 'wokwi-resistor', id: 'r-unlock', x: 600, y: 450, properties: { value: '220' } },
];

const wiresKeypadLock = [
  makeWire('w1', ['arduino-mega', '9'], ['keypad', 'R1'], '#ffaa00'),
  makeWire('w2', ['arduino-mega', '8'], ['keypad', 'R2'], '#ffaa00'),
  makeWire('w3', ['arduino-mega', '7'], ['keypad', 'R3'], '#ffaa00'),
  makeWire('w4', ['arduino-mega', '6'], ['keypad', 'R4'], '#ffaa00'),
  makeWire('w5', ['arduino-mega', '5'], ['keypad', 'C1'], '#00aaff'),
  makeWire('w6', ['arduino-mega', '4'], ['keypad', 'C2'], '#00aaff'),
  makeWire('w7', ['arduino-mega', '3'], ['keypad', 'C3'], '#00aaff'),
  makeWire('w8', ['arduino-mega', '2'], ['keypad', 'C4'], '#00aaff'),
  makeWire('w9', ['arduino-mega', '5V'], ['servo', 'V+'], '#ff0000'),
  makeWire('w10', ['arduino-mega', 'GND.1'], ['servo', 'GND'], '#000000'),
  makeWire('w11', ['arduino-mega', '11'], ['servo', 'PWM'], '#ff8800'),
  makeWire('w12', ['arduino-mega', '5V'], ['lcd', 'VCC'], '#ff0000'),
  makeWire('w13', ['arduino-mega', 'GND.2'], ['lcd', 'GND'], '#000000'),
  makeWire('w14', ['arduino-mega', '20'], ['lcd', 'SDA'], '#00aaff'),
  makeWire('w15', ['arduino-mega', '21'], ['lcd', 'SCL'], '#ffaa00'),
  makeWire('w16', ['arduino-mega', '12'], ['buzzer', '2'], '#9933cc'),
  makeWire('w17', ['buzzer', '1'], ['arduino-mega', 'GND.3'], '#000000'),
  makeWire('w18', ['arduino-mega', '13'], ['r-lock', '1'], '#ff2222'),
  makeWire('w19', ['r-lock', '2'], ['led-locked', 'A'], '#ff2222'),
  makeWire('w20', ['led-locked', 'C'], ['arduino-mega', 'GND.4'], '#000000'),
  makeWire('w21', ['arduino-mega', '10'], ['r-unlock', '1'], '#00ff44'),
  makeWire('w22', ['r-unlock', '2'], ['led-unlocked', 'A'], '#00ff44'),
  makeWire('w23', ['led-unlocked', 'C'], ['arduino-mega', 'GND.5'], '#000000'),
];

// ════════════════════════════════════════════════════════════════════════════
// TỔNG HỢP 9 DỰ ÁN MẪU CỘNG ĐỒNG CỦA THIẾU NHI VIỆT NAM
// ════════════════════════════════════════════════════════════════════════════

function buildProjectData(
  id: string,
  name: string,
  slug: string,
  description: string,
  boardType: string,
  code: string,
  components: any[],
  wires: any[],
  libraries: string[] = [],
  ownerUsername: string = 'congdong'
) {
  return {
    id,
    name,
    slug,
    description,
    is_public: true,
    visibility: 'public' as const,
    board_type: boardType,
    components_json: JSON.stringify(components),
    wires_json: JSON.stringify(wires),
    boards_json: JSON.stringify([
      {
        id: boardType,
        boardKind: boardType,
        x: 80,
        y: 100,
        running: false,
        compiledProgram: null,
        serialOutput: '',
        serialBaudRate: 115200,
        serialMonitorOpen: false,
        activeFileGroupId: `group-${boardType}`,
        languageMode: 'arduino',
        libraries,
      },
    ]),
    libraries_json: JSON.stringify(libraries),
    files: [{ name: 'sketch.ino', content: code }],
    file_groups: [
      {
        groupId: `group-${boardType}`,
        files: [{ name: 'sketch.ino', content: code }],
      },
    ],
    code,
    owner_username: ownerUsername,
    created_at: '2026-10-28T08:00:00Z',
    updated_at: '2026-10-28T10:30:00Z',
  };
}

export const COMMUNITY_STARTER_PROJECTS: CommunityProject[] = [
  // ── 5–8 tuổi ─────────────────────────────────────────────────────────────
  {
    id: 'vn-starter-traffic-light',
    name: '🚦 Đèn Giao Thông Ngã Tư Phố Cổ',
    slug: 'den-giao-thong-nga-tu-pho-co',
    description:
      'Mô phỏng cột đèn giao thông 3 màu (Đỏ - Vàng - Xanh) chuẩn chu kỳ an toàn cho người đi bộ tại ngã tư Hàng Đào - Hàng Ngang, Hà Nội.',
    boardType: 'arduino-uno',
    ageGroup: '5-8',
    difficulty: 'beginner',
    likesCount: 68,
    forksCount: 29,
    hasLiked: false,
    author: {
      username: 'minhkhang_hn',
      displayName: 'Bé Minh Khang (7 tuổi)',
      age: 7,
      location: 'Hoàn Kiếm, Hà Nội',
      level: 'Tia Lửa Nhỏ',
      streakDays: 14,
      badges: ['Tia Lửa Đầu Tiên', 'Giao Thông Thông Minh'],
    },
    tags: ['arduino-uno', 'led', 'giao-thong', '5-8-tuoi', 'co-ban'],
    createdAt: '2026-10-28T08:00:00Z',
    updatedAt: '2026-10-28T09:15:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-traffic-light',
      '🚦 Đèn Giao Thông Ngã Tư Phố Cổ',
      'den-giao-thong-nga-tu-pho-co',
      'Mô phỏng cột đèn giao thông 3 màu chuẩn an toàn với Arduino Uno',
      'arduino-uno',
      codeTrafficLight,
      componentsTrafficLight,
      wiresTrafficLight,
      [],
      'minhkhang_hn'
    ),
  },
  {
    id: 'vn-starter-doorbell-doraemon',
    name: '🎵 Chuông Cửa Giai Điệu Doraemon',
    slug: 'chuong-cua-giai-dieu-doraemon',
    description:
      'Chiếc chuông cửa thông minh phát giai điệu quen thuộc của chú mèo máy Doraemon khi khách bấm nút trước cửa nhà, kèm hiệu ứng đèn LED báo hiệu.',
    boardType: 'arduino-uno',
    ageGroup: '5-8',
    difficulty: 'beginner',
    likesCount: 94,
    forksCount: 42,
    hasLiked: false,
    author: {
      username: 'annhien_hcm',
      displayName: 'Bé An Nhiên (6 tuổi)',
      age: 6,
      location: 'Quận 1, TP. Hồ Chí Minh',
      level: 'Tia Lửa Nhỏ',
      streakDays: 21,
      badges: ['Tia Lửa Đầu Tiên', 'Nhạc Công Nhí'],
    },
    tags: ['arduino-uno', 'buzzer', 'am-nhac', 'doraemon', '5-8-tuoi'],
    createdAt: '2026-10-28T08:30:00Z',
    updatedAt: '2026-10-28T09:45:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-doorbell-doraemon',
      '🎵 Chuông Cửa Giai Điệu Doraemon',
      'chuong-cua-giai-dieu-doraemon',
      'Chuông cửa phát giai điệu Doraemon vui nhộn với buzzer và nút bấm',
      'arduino-uno',
      codeDoorbell,
      componentsDoorbell,
      wiresDoorbell,
      [],
      'annhien_hcm'
    ),
  },
  {
    id: 'vn-starter-rainbow-ring',
    name: '🌈 Vòng LED Cầu Vồng Kỳ Diệu',
    slug: 'vong-led-cau-vong-ky-dieu',
    description:
      'Vòng 16 đèn LED NeoPixel RGB biến hóa dải màu cầu vồng huyền ảo, cho phép bé vặn núm xoay biến trở để tăng giảm tốc độ dải màu sống động.',
    boardType: 'arduino-nano',
    ageGroup: '5-8',
    difficulty: 'beginner',
    likesCount: 82,
    forksCount: 35,
    hasLiked: false,
    author: {
      username: 'baonam_dn',
      displayName: 'Bé Bảo Nam (8 tuổi)',
      age: 8,
      location: 'Hải Châu, Đà Nẵng',
      level: 'Thợ Điện Nhí',
      streakDays: 18,
      badges: ['Phù Thủy Ánh Sáng', 'Thợ Điện Nhí'],
    },
    tags: ['arduino-nano', 'neopixel', 'rgb', 'cau-vong', '5-8-tuoi'],
    createdAt: '2026-10-28T08:45:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-rainbow-ring',
      '🌈 Vòng LED Cầu Vồng Kỳ Diệu',
      'vong-led-cau-vong-ky-dieu',
      'Vòng 16 LED NeoPixel đổi màu cầu vồng tương tác qua núm xoay biến trở',
      'arduino-nano',
      codeRainbow,
      componentsRainbow,
      wiresRainbow,
      ['Adafruit NeoPixel'],
      'baonam_dn'
    ),
  },

  // ── 9–13 tuổi ────────────────────────────────────────────────────────────
  {
    id: 'vn-starter-smart-garden',
    name: '🌱 Tưới Cây Thông Minh Tự Động',
    slug: 'tuoi-cay-thong-minh-tu-dong',
    description:
      'Hệ thống tự động đo độ ẩm đất, hiển thị phần trăm độ ẩm lên màn hình LCD 16x2 I2C và kích hoạt Relay bơm nước tưới rau khi đất bị khô.',
    boardType: 'arduino-uno',
    ageGroup: '9-13',
    difficulty: 'intermediate',
    likesCount: 118,
    forksCount: 56,
    hasLiked: false,
    author: {
      username: 'giahuy_ct',
      displayName: 'Bạn Gia Huy (11 tuổi)',
      age: 11,
      location: 'Ninh Kiều, Cần Thơ',
      level: 'Nhà Thám Hiểm Mạch',
      streakDays: 32,
      badges: ['Nông Dân Số', 'Chuyên Gia Cảm Biến', 'Thám Hiểm Mạch'],
    },
    tags: ['arduino-uno', 'lcd-i2c', 'cam-bien-dat', 'relay', '9-13-tuoi'],
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T10:15:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-smart-garden',
      '🌱 Tưới Cây Thông Minh Tự Động',
      'tuoi-cay-thong-minh-tu-dong',
      'Hệ thống tưới cây tự động với cảm biến độ ẩm đất và LCD I2C',
      'arduino-uno',
      codeSmartGarden,
      componentsSmartGarden,
      wiresSmartGarden,
      ['LiquidCrystal I2C'],
      'giahuy_ct'
    ),
  },
  {
    id: 'vn-starter-smart-cane',
    name: '🦇 Gậy Dò Đường Tránh Vật Cản',
    slug: 'gay-do-duong-tranh-vat-can',
    description:
      'Gậy thông minh hỗ trợ người khiếm thị sử dụng Raspberry Pi Pico và cảm biến siêu âm HC-SR04, phát âm thanh cảnh báo dồn dập khi tiến gần chướng ngại vật.',
    boardType: 'raspberry-pi-pico',
    ageGroup: '9-13',
    difficulty: 'intermediate',
    likesCount: 105,
    forksCount: 48,
    hasLiked: false,
    author: {
      username: 'tuelam_hp',
      displayName: 'Bạn Tuệ Lâm (12 tuổi)',
      age: 12,
      location: 'Ngô Quyền, Hải Phòng',
      level: 'Nhà Thám Hiểm Mạch',
      streakDays: 29,
      badges: ['Sáng Chế Vì Cộng Đồng', 'Siêu Âm HC-SR04'],
    },
    tags: ['raspberry-pi-pico', 'hc-sr04', 'sieu-am', 'buzzer', '9-13-tuoi'],
    createdAt: '2026-10-28T09:15:00Z',
    updatedAt: '2026-10-28T10:30:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-smart-cane',
      '🦇 Gậy Dò Đường Tránh Vật Cản',
      'gay-do-duong-tranh-vat-can',
      'Thiết bị dò đường tránh vật cản dùng sóng siêu âm trên Raspberry Pi Pico',
      'raspberry-pi-pico',
      codeSmartCane,
      componentsSmartCane,
      wiresSmartCane,
      [],
      'tuelam_hp'
    ),
  },
  {
    id: 'vn-starter-robot-eyes',
    name: '👀 Robot Để Bàn Mắt Biểu Cảm',
    slug: 'robot-de-ban-mat-bieu-cam',
    description:
      'Người bạn robot để bàn với đôi mắt biểu cảm sống động (Vui, Chớp mắt, Ngạc nhiên, Tinh nghịch) hiển thị mượt mà trên màn hình OLED SSD1306 với vi xử lý ESP32-S3.',
    boardType: 'esp32-s3',
    ageGroup: '9-13',
    difficulty: 'intermediate',
    likesCount: 142,
    forksCount: 71,
    hasLiked: false,
    author: {
      username: 'quanganh_hn',
      displayName: 'Bạn Quang Anh (10 tuổi)',
      age: 10,
      location: 'Cầu Giấy, Hà Nội',
      level: 'Nhà Thám Hiểm Mạch',
      streakDays: 45,
      badges: ['Chế Tạo Robot', 'Đồ Họa OLED', 'Streak Siêu Đẳng'],
    },
    tags: ['esp32-s3', 'oled', 'ssd1306', 'robot', 'hoat-hinh', '9-13-tuoi'],
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-28T10:45:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-robot-eyes',
      '👀 Robot Để Bàn Mắt Biểu Cảm',
      'robot-de-ban-mat-bieu-cam',
      'Đôi mắt robot hoạt hình OLED chuyển đổi cảm xúc trên ESP32-S3',
      'esp32-s3',
      codeAnimatedEyes,
      componentsAnimatedEyes,
      wiresAnimatedEyes,
      ['Adafruit SSD1306', 'Adafruit GFX Library'],
      'quanganh_hn'
    ),
  },

  // ── 14–20 tuổi ───────────────────────────────────────────────────────────
  {
    id: 'vn-starter-aqi-iot',
    name: '☁️ Trạm Đo Chất Lượng Không Khí AQI IoT',
    slug: 'tram-do-chat-luong-khong-khi-aqi-iot',
    description:
      'Trạm quan trắc vi khí hậu thời gian thực sử dụng ESP32 Wi-Fi, cảm biến DHT22 và cảm biến bụi/khí gas. Tự động tính chỉ số VN-AQI, cảnh báo LED và xuất dữ liệu JSON IoT.',
    boardType: 'esp32',
    ageGroup: '14-20',
    difficulty: 'advanced',
    likesCount: 168,
    forksCount: 84,
    hasLiked: false,
    author: {
      username: 'stem_lhp_hcm',
      displayName: 'Nhóm STEM Lê Hồng Phong (15 tuổi)',
      age: 15,
      location: 'Quận 5, TP. Hồ Chí Minh',
      level: 'Kỹ Sư ESP32 IoT',
      streakDays: 60,
      badges: ['Kỹ Sư IoT Bậc Thầy', 'Vì Môi Trường Xanh', 'Chuyên Gia Telemetry'],
    },
    tags: ['esp32', 'dht22', 'aqi', 'iot', 'wifi', 'oled', '14-20-tuoi'],
    createdAt: '2026-10-28T09:45:00Z',
    updatedAt: '2026-10-28T11:00:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-aqi-iot',
      '☁️ Trạm Đo Chất Lượng Không Khí AQI IoT',
      'tram-do-chat-luong-khong-khi-aqi-iot',
      'Hệ thống đo chất lượng không khí và tính chỉ số AQI gửi dữ liệu qua Wi-Fi',
      'esp32',
      codeAqiStation,
      componentsAqiStation,
      wiresAqiStation,
      ['DHT sensor library', 'Adafruit SSD1306', 'Adafruit GFX Library'],
      'stem_lhp_hcm'
    ),
  },
  {
    id: 'vn-starter-piano-stm32',
    name: '🎹 Đàn Piano Cảm Ứng Điện Dung 8 Nốt',
    slug: 'dan-piano-cam-ung-8-not-stm32',
    description:
      'Bàn phím piano 8 phím cảm ứng nốt nhạc (Đồ - Rê - Mi - Pha - Son - La - Si - Đố) trên vi điều khiển ARM Cortex-M3 STM32 Blue Pill với bộ phát âm thanh PWM tần số chuẩn.',
    boardType: 'stm32-bluepill',
    ageGroup: '14-20',
    difficulty: 'advanced',
    likesCount: 126,
    forksCount: 62,
    hasLiked: false,
    author: {
      username: 'hoangphuc_hue',
      displayName: 'Bạn Hoàng Phúc (16 tuổi)',
      age: 16,
      location: 'TP. Huế',
      level: 'Kỹ Sư ESP32 IoT',
      streakDays: 52,
      badges: ['Kiến Trúc Sư ARM', 'Âm Nhạc Số STM32'],
    },
    tags: ['stm32-bluepill', 'arm-cortex-m3', 'piano', 'pwm', '14-20-tuoi'],
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T11:15:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-piano-stm32',
      '🎹 Đàn Piano Cảm Ứng Điện Dung 8 Nốt',
      'dan-piano-cam-ung-8-not-stm32',
      'Đàn piano điện tử 8 nốt trên chip STM32 Blue Pill ARM Cortex-M3',
      'stm32-bluepill',
      codePiano,
      componentsPiano,
      wiresPiano,
      [],
      'hoangphuc_hue'
    ),
  },
  {
    id: 'vn-starter-keypad-lock',
    name: '🔒 Khóa Cửa Mật Mã Điện Tử An Toàn',
    slug: 'khoa-cua-mat-ma-dien-tu-an-toan',
    description:
      'Hệ thống khóa cửa bảo mật công nghiệp nhập mã PIN trên bàn phím ma trận 4x4, điều khiển Servo mở chốt cửa, hiển thị LCD I2C và hú còi cảnh báo khi nhập sai quá 3 lần.',
    boardType: 'arduino-mega',
    ageGroup: '14-20',
    difficulty: 'advanced',
    likesCount: 154,
    forksCount: 78,
    hasLiked: false,
    author: {
      username: 'khanhvy_bd',
      displayName: 'Bạn Khánh Vy (17 tuổi)',
      age: 17,
      location: 'Thủ Dầu Một, Bình Dương',
      level: 'Kiến Trúc Sư Nhúng',
      streakDays: 75,
      badges: ['Kiến Trúc Sư Nhúng', 'Bảo Mật Hệ Thống', 'Mega Master'],
    },
    tags: ['arduino-mega', 'keypad-4x4', 'servo', 'lcd-i2c', 'bao-mat', '14-20-tuoi'],
    createdAt: '2026-10-28T10:15:00Z',
    updatedAt: '2026-10-28T11:30:00Z',
    isFeatured: true,
    projectData: buildProjectData(
      'vn-starter-keypad-lock',
      '🔒 Khóa Cửa Mật Mã Điện Tử An Toàn',
      'khoa-cua-mat-ma-dien-tu-an-toan',
      'Hệ thống khóa mật mã điện tử bàn phím ma trận 4x4 và servo Arduino Mega',
      'arduino-mega',
      codeKeypadLock,
      componentsKeypadLock,
      wiresKeypadLock,
      ['Keypad', 'Servo', 'LiquidCrystal I2C'],
      'khanhvy_bd'
    ),
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 🏆 BẢNG VÀNG SÁNG TẠO CỘNG ĐỒNG (HALL OF FAME LEADERBOARD)
// ════════════════════════════════════════════════════════════════════════════

export const COMMUNITY_HALL_OF_FAME: LeaderboardEntry[] = [
  {
    rank: 1,
    id: 'user-top-1',
    username: 'khanhvy_bd',
    displayName: 'Khánh Vy (17t)',
    location: 'Bình Dương',
    age: 17,
    xp: 4850,
    level: 'Kiến Trúc Sư Nhúng (17–20t)',
    levelNumber: 5,
    streakDays: 75,
    projectsShared: 14,
    likesReceived: 420,
    badges: ['🥇 Quán Quân Sáng Tạo', 'Kiến Trúc Sư Nhúng', 'Bảo Mật Hệ Thống', 'Mega Master'],
  },
  {
    rank: 2,
    id: 'user-top-2',
    username: 'stem_lhp_hcm',
    displayName: 'Nhóm STEM Lê Hồng Phong (15t)',
    location: 'TP. Hồ Chí Minh',
    age: 15,
    xp: 4200,
    level: 'Kỹ Sư ESP32 IoT (14–17t)',
    levelNumber: 4,
    streakDays: 60,
    projectsShared: 12,
    likesReceived: 385,
    badges: ['🥈 Á Quân Sáng Tạo', 'Kỹ Sư IoT Bậc Thầy', 'Vì Môi Trường Xanh'],
  },
  {
    rank: 3,
    id: 'user-top-3',
    username: 'quanganh_hn',
    displayName: 'Quang Anh (10t)',
    location: 'Hà Nội',
    age: 10,
    xp: 3650,
    level: 'Nhà Thám Hiểm Mạch (10–13t)',
    levelNumber: 3,
    streakDays: 45,
    projectsShared: 9,
    likesReceived: 310,
    badges: ['🥉 Quý Quân Sáng Tạo', 'Chế Tạo Robot', 'Đồ Họa OLED'],
  },
  {
    rank: 4,
    id: 'user-top-4',
    username: 'hoangphuc_hue',
    displayName: 'Hoàng Phúc (16t)',
    location: 'TP. Huế',
    age: 16,
    xp: 3150,
    level: 'Kỹ Sư ESP32 IoT (14–17t)',
    levelNumber: 4,
    streakDays: 52,
    projectsShared: 8,
    likesReceived: 275,
    badges: ['Kiến Trúc Sư ARM', 'Âm Nhạc Số STM32'],
  },
  {
    rank: 5,
    id: 'user-top-5',
    username: 'giahuy_ct',
    displayName: 'Gia Huy (11t)',
    location: 'Cần Thơ',
    age: 11,
    xp: 2850,
    level: 'Nhà Thám Hiểm Mạch (10–13t)',
    levelNumber: 3,
    streakDays: 32,
    projectsShared: 7,
    likesReceived: 240,
    badges: ['Nông Dân Số', 'Chuyên Gia Cảm Biến'],
  },
  {
    rank: 6,
    id: 'user-top-6',
    username: 'tuelam_hp',
    displayName: 'Tuệ Lâm (12t)',
    location: 'Hải Phòng',
    age: 12,
    xp: 2450,
    level: 'Nhà Thám Hiểm Mạch (10–13t)',
    levelNumber: 3,
    streakDays: 29,
    projectsShared: 6,
    likesReceived: 195,
    badges: ['Sáng Chế Vì Cộng Đồng', 'Siêu Âm HC-SR04'],
  },
  {
    rank: 7,
    id: 'user-top-7',
    username: 'annhien_hcm',
    displayName: 'An Nhiên (6t)',
    location: 'TP. Hồ Chí Minh',
    age: 6,
    xp: 1950,
    level: 'Tia Lửa Nhỏ (5–8t)',
    levelNumber: 1,
    streakDays: 21,
    projectsShared: 5,
    likesReceived: 180,
    badges: ['Tia Lửa Đầu Tiên', 'Nhạc Công Nhí'],
  },
  {
    rank: 8,
    id: 'user-top-8',
    username: 'baonam_dn',
    displayName: 'Bảo Nam (8t)',
    location: 'Đà Nẵng',
    age: 8,
    xp: 1800,
    level: 'Thợ Điện Nhí (8–10t)',
    levelNumber: 2,
    streakDays: 18,
    projectsShared: 4,
    likesReceived: 165,
    badges: ['Phù Thủy Ánh Sáng', 'Thợ Điện Nhí'],
  },
  {
    rank: 9,
    id: 'user-top-9',
    username: 'minhkhang_hn',
    displayName: 'Minh Khang (7t)',
    location: 'Hà Nội',
    age: 7,
    xp: 1650,
    level: 'Tia Lửa Nhỏ (5–8t)',
    levelNumber: 1,
    streakDays: 14,
    projectsShared: 4,
    likesReceived: 150,
    badges: ['Tia Lửa Đầu Tiên', 'Giao Thông Thông Minh'],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// TIỆN ÍCH TRUY VẤN VÀ LỌC DỰ ÁN CỘNG ĐỒNG CLIENT-SIDE
// ════════════════════════════════════════════════════════════════════════════

export function getCommunityStarterProjects(): CommunityProject[] {
  return [...COMMUNITY_STARTER_PROJECTS];
}

export function getStarterProjectById(id: string): CommunityProject | undefined {
  return COMMUNITY_STARTER_PROJECTS.find((p) => p.id === id);
}

export function filterStarterProjects(filter: CommunityProjectFilter): CommunityProject[] {
  let list = [...COMMUNITY_STARTER_PROJECTS];

  // Lọc theo độ tuổi
  if (filter.ageGroup && filter.ageGroup !== 'all') {
    list = list.filter((p) => p.ageGroup === filter.ageGroup || p.ageGroup === 'all');
  }

  // Lọc theo bo mạch
  if (filter.boardType && filter.boardType !== 'all') {
    list = list.filter((p) => p.boardType.toLowerCase() === filter.boardType!.toLowerCase());
  }

  // Lọc theo từ khóa tìm kiếm
  if (filter.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.displayName.toLowerCase().includes(q) ||
        p.author.location?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sắp xếp
  if (filter.sort === 'most_liked') {
    list.sort((a, b) => b.likesCount - a.likesCount);
  } else if (filter.sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filter.sort === 'most_forked') {
    list.sort((a, b) => b.forksCount - a.forksCount);
  } else {
    // Trending: kết hợp tim + fork
    list.sort((a, b) => b.likesCount * 2 + b.forksCount - (a.likesCount * 2 + a.forksCount));
  }

  return list;
}
