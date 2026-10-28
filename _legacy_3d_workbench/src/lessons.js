/**
 * src/lessons.js
 * Comprehensive 20-lesson catalog, ESP32 pinout matrices, and wiring standards
 * Derived exclusively from clean-room/SPEC.approved.md
 */

export const WIRE_COLORS = {
  signalAmber: '#f0a53a',
  signalBlue: '#3d6fc4',
  power3v3: '#e04a3f',
  power5v: '#b82e24',
  gnd: '#2f3547'
};

export const ESP32_PINS_30 = [
  // Left side (1..15)
  { pin: 1, name: 'EN', type: 'control', desc: 'Enable / Reset (Active Low)' },
  { pin: 2, name: 'GPIO 36', gpio: 36, type: 'input-only', adc: 'ADC1_CH0', touch: null, desc: 'SENSOR_VP (Input Only)' },
  { pin: 3, name: 'GPIO 39', gpio: 39, type: 'input-only', adc: 'ADC1_CH3', touch: null, desc: 'SENSOR_VN (Input Only)' },
  { pin: 4, name: 'GPIO 34', gpio: 34, type: 'input-only', adc: 'ADC1_CH6', touch: null, desc: 'Input Only (No Pull-up)' },
  { pin: 5, name: 'GPIO 35', gpio: 35, type: 'input-only', adc: 'ADC1_CH7', touch: null, desc: 'Input Only (No Pull-up)' },
  { pin: 6, name: 'GPIO 32', gpio: 32, type: 'io', adc: 'ADC1_CH4', touch: 'T9', desc: 'Touch 9 / ADC1' },
  { pin: 7, name: 'GPIO 33', gpio: 33, type: 'io', adc: 'ADC1_CH5', touch: 'T8', desc: 'Touch 8 / ADC1' },
  { pin: 8, name: 'GPIO 25', gpio: 25, type: 'io', adc: 'ADC2_CH8', dac: 'DAC1', desc: 'DAC 1 / ADC2' },
  { pin: 9, name: 'GPIO 26', gpio: 26, type: 'io', adc: 'ADC2_CH9', dac: 'DAC2', desc: 'DAC 2 / ADC2' },
  { pin: 10, name: 'GPIO 27', gpio: 27, type: 'io', adc: 'ADC2_CH7', touch: 'T7', desc: 'Touch 7 / ADC2' },
  { pin: 11, name: 'GPIO 14', gpio: 14, type: 'io', adc: 'ADC2_CH6', touch: 'T6', desc: 'Touch 6 / HSPI_CLK' },
  { pin: 12, name: 'GPIO 12', gpio: 12, type: 'io', adc: 'ADC2_CH5', touch: 'T5', desc: 'Touch 5 / MTDI (Boot Strapping)' },
  { pin: 13, name: 'GPIO 13', gpio: 13, type: 'io', adc: 'ADC2_CH4', touch: 'T4', desc: 'Touch 4 / MTCK' },
  { pin: 14, name: 'GND', type: 'power', desc: 'Ground Reference' },
  { pin: 15, name: 'VIN', type: 'power', desc: 'External 5V Power Input' },

  // Right side (16..30)
  { pin: 16, name: '3V3', type: 'power', desc: 'Regulated 3.3V Output' },
  { pin: 17, name: 'GND', type: 'power', desc: 'Ground Reference' },
  { pin: 18, name: 'GPIO 15', gpio: 15, type: 'io', adc: 'ADC2_CH3', touch: 'T3', desc: 'Touch 3 / MTDO' },
  { pin: 19, name: 'GPIO 2', gpio: 2, type: 'io', adc: 'ADC2_CH2', touch: 'T2', desc: 'Touch 2 / Onboard Blue LED' },
  { pin: 20, name: 'GPIO 4', gpio: 4, type: 'io', adc: 'ADC2_CH0', touch: 'T0', desc: 'Touch 0 / ADC2' },
  { pin: 21, name: 'GPIO 16', gpio: 16, type: 'io', desc: 'UART2 RX' },
  { pin: 22, name: 'GPIO 17', gpio: 17, type: 'io', desc: 'UART2 TX' },
  { pin: 23, name: 'GPIO 5', gpio: 5, type: 'io', desc: 'VSPI CS' },
  { pin: 24, name: 'GPIO 18', gpio: 18, type: 'io', desc: 'VSPI SCK' },
  { pin: 25, name: 'GPIO 19', gpio: 19, type: 'io', desc: 'VSPI MISO' },
  { pin: 26, name: 'GPIO 21', gpio: 21, type: 'io', desc: 'I2C SDA' },
  { pin: 27, name: 'GPIO 3', gpio: 3, type: 'io', desc: 'U0RXD (Serial USB)' },
  { pin: 28, name: 'GPIO 1', gpio: 1, type: 'io', desc: 'U0TXD (Serial USB)' },
  { pin: 29, name: 'GPIO 22', gpio: 22, type: 'io', desc: 'I2C SCL' },
  { pin: 30, name: 'GPIO 23', gpio: 23, type: 'io', desc: 'VSPI MOSI' }
];

export const ESP32_PINS_38 = [
  ...ESP32_PINS_30,
  { pin: 31, name: 'GPIO 6', gpio: 6, type: 'internal', desc: 'Integrated SPI Flash CLK' },
  { pin: 32, name: 'GPIO 7', gpio: 7, type: 'internal', desc: 'Integrated SPI Flash SDO' },
  { pin: 33, name: 'GPIO 8', gpio: 8, type: 'internal', desc: 'Integrated SPI Flash SDI' },
  { pin: 34, name: 'GPIO 9', gpio: 9, type: 'internal', desc: 'Integrated SPI Flash SHD' },
  { pin: 35, name: 'GPIO 10', gpio: 10, type: 'internal', desc: 'Integrated SPI Flash SWP' },
  { pin: 36, name: 'GPIO 11', gpio: 11, type: 'internal', desc: 'Integrated SPI Flash SCS' },
  { pin: 37, name: 'GPIO 0', gpio: 0, type: 'io', adc: 'ADC2_CH1', touch: 'T1', desc: 'Bootloader Pin / Touch 1' },
  { pin: 38, name: 'GND', type: 'power', desc: 'Additional Ground Pin' }
];

export const LESSONS = [
  {
    id: 'board',
    number: 1,
    ageBands: ['band-a', 'band-b', 'band-c'],
    title: {
      vi: 'Gặp gỡ ESP32 & Nguồn 3.3V',
      en: 'Meet ESP32 & 3.3V Power'
    },
    desc: {
      vi: 'Khám phá bo mạch vi điều khiển ESP32 với chip Wi-Fi/Bluetooth, cổng USB-C và hệ thống chân cấp nguồn 3.3V an toàn.',
      en: 'Discover the ESP32 microcontroller with built-in Wi-Fi/Bluetooth, USB-C port, and safe 3.3V power rails.'
    },
    hardware: {
      vi: 'Bo mạch ESP32 DevKit V1, cáp USB-C, đèn LED báo nguồn',
      en: 'ESP32 DevKit V1, USB-C Cable, Power LED'
    },
    pedagogy: {
      vi: 'Làm quen với khái niệm bộ não điện tử, điện áp làm việc 3.3V và cổng nạp chương trình.',
      en: 'Understand the electronic brain concept, 3.3V logic levels, and program flashing.'
    },
    defaultParams: { baudRate: 115200, powerState: true },
    simConfig: { type: 'board-intro' },
    storyCards: [
      {
        icon: '⚡',
        titleVi: 'Bộ Não Siêu Tốc ESP32',
        titleEn: 'Super Brain ESP32',
        textVi: 'ESP32 là một chiếc máy vi tính tí hon có 2 lõi xử lý và biết phát sóng Wi-Fi!',
        textEn: 'ESP32 is a tiny computer with dual cores and built-in Wi-Fi!'
      },
      {
        icon: '🔌',
        titleVi: 'Cắm Cáp USB',
        titleEn: 'Plug In USB',
        textVi: 'Năng lượng 3.3V chạy vào bo mạch, đèn đỏ Power sáng rực rỡ.',
        textEn: '3.3V power enters the board, red power LED glows bright.'
      }
    ],
    blocks: [
      { type: 'on_start', label: 'Khi ESP32 khởi động / On start' },
      { type: 'serial_begin', baud: 115200, label: 'Bật cổng nối tiếp 115200' },
      { type: 'serial_print', message: 'Hello ESP32 World!', label: 'In chữ ra màn hình' }
    ],
    codeCpp: `void setup() {
  Serial.begin({{baudRate}});
  Serial.println("Hello ESP32 World! 3.3V Logic Ready.");
}

void loop() {
  delay(1000);
}`,
    codePy: `import time

print("Hello ESP32 World! 3.3V Logic Ready.")
while True:
    time.sleep(1)
`,
    schematic: {
      diagram: 'ESP32 DevKit V1 [USB-C 5V] -> 3.3V LDO Regulator -> ESP32 Core [Vio = 3.3V, GND]',
      rails: ['3V3', 'GND', 'VIN (5V)']
    },
    parts: [
      { id: 'esp32', name: 'ESP32 DevKit V1', pin: 'All', rating: '3.3V Logic, 240MHz Dual-Core' },
      { id: 'led-pwr', name: 'Power LED (Red)', pin: '3V3 Bus', rating: 'Safe continuous' }
    ],
    quiz: [
      {
        q: 'Điện áp làm việc danh định của các chân GPIO trên ESP32 là bao nhiêu?',
        options: ['5.0V', '3.3V', '12.0V', '1.5V'],
        answer: 1,
        explain: 'ESP32 sử dụng điện áp logic 3.3V. Đưa 5.0V trực tiếp vào GPIO sẽ gây cháy chip!'
      },
      {
        q: 'Cổng USB-C trên bo mạch ESP32 dùng để làm gì?',
        options: ['Chỉ để sạc pin', 'Cấp nguồn và nạp mã lệnh/giao tiếp Serial', 'Nối loa nghe nhạc', 'Chống sét'],
        answer: 1,
        explain: 'Cáp USB cung cấp nguồn 5V (được hạ xuống 3.3V) và truyền dữ liệu UART để nạp code.'
      },
      {
        q: 'Chân GND trên bo ESP32 có ý nghĩa là gì?',
        options: ['Nguồn điện dương 5V', 'Đất chung 0V (Ground)', 'Chân phát sóng Bluetooth', 'Chân kết nối micro'],
        answer: 1,
        explain: 'GND là viết tắt của Ground (cực âm / 0V), tạo vòng kín cho dòng điện.'
      }
    ]
  },
  {
    id: 'blink',
    number: 2,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Chớp nháy 2 đèn LED (Level Crossing)',
      en: 'Blink 2 LEDs (Level Crossing)'
    },
    desc: {
      vi: 'Điều khiển 2 đèn LED đỏ và vàng nhấp nháy luân phiên như rào chắn đường tàu hỏa.',
      en: 'Alternate blinking between red and yellow LEDs like a railroad level crossing signal.'
    },
    hardware: {
      vi: 'LED Đỏ (GPIO 21), LED Vàng (GPIO 22), 2 Điện trở 220Ω, Breadboard',
      en: 'Red LED (GPIO 21), Yellow LED (GPIO 22), two 220Ω resistors, Breadboard'
    },
    pedagogy: {
      vi: 'Hiểu về mức logic HIGH (3.3V) và LOW (0V), chu kỳ trễ delay và điện trở hạn dòng bảo vệ LED.',
      en: 'Learn digital HIGH/LOW states, delay cycles, and current-limiting series resistors.'
    },
    defaultParams: { rate: 500, colorA: '#ff3b30', colorB: '#ffcc00' },
    simConfig: { type: 'level-crossing', minRate: 100, maxRate: 1500, stepRate: 50 },
    storyCards: [
      {
        icon: '🚦',
        titleVi: 'Rào Chắn Đường Tàu',
        titleEn: 'Level Crossing Signal',
        textVi: 'Chạm vào đèn để tăng giảm tốc độ nháy. Đèn đỏ nháy thì xe phải dừng lại nhé!',
        textEn: 'Tap lamps to adjust blink rate. When red flashes, cars must stop!'
      },
      {
        icon: '⚡',
        titleVi: 'Bảo Vệ Đèn LED',
        titleEn: 'Protect the LED',
        textVi: 'Cần điện trở 220Ω để dòng điện không vượt quá 20mA, giúp đèn bền lâu.',
        textEn: 'A 220Ω resistor prevents current exceeding 20mA, keeping the LED safe.'
      }
    ],
    blocks: [
      { type: 'forever', label: 'Lặp lại mãi mãi / Loop forever' },
      { type: 'digital_write', pin: 21, val: 'HIGH', label: 'Bật Đèn Đỏ GPIO 21' },
      { type: 'digital_write', pin: 22, val: 'LOW', label: 'Tắt Đèn Vàng GPIO 22' },
      { type: 'delay_ms', val: '{{rate}}', label: 'Chờ {{rate}} ms' },
      { type: 'digital_write', pin: 21, val: 'LOW', label: 'Tắt Đèn Đỏ GPIO 21' },
      { type: 'digital_write', pin: 22, val: 'HIGH', label: 'Bật Đèn Vàng GPIO 22' },
      { type: 'delay_ms', val: '{{rate}}', label: 'Chờ {{rate}} ms' }
    ],
    codeCpp: `const int PIN_RED = 21;
const int PIN_YELLOW = 22;

void setup() {
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_YELLOW, OUTPUT);
}

void loop() {
  digitalWrite(PIN_RED, HIGH);
  digitalWrite(PIN_YELLOW, LOW);
  delay({{rate}});
  digitalWrite(PIN_RED, LOW);
  digitalWrite(PIN_YELLOW, HIGH);
  delay({{rate}});
}`,
    codePy: `from machine import Pin
import time

red = Pin(21, Pin.OUT)
yellow = Pin(22, Pin.OUT)

while True:
    red.value(1)
    yellow.value(0)
    time.sleep_ms({{rate}})
    red.value(0)
    yellow.value(1)
    time.sleep_ms({{rate}})
`,
    schematic: {
      diagram: 'ESP32 GPIO 21 -> 220Ω -> Anode LED Đỏ -> Cathode -> GND; GPIO 22 -> 220Ω -> Anode LED Vàng -> Cathode -> GND',
      rails: ['GPIO 21', 'GPIO 22', 'GND']
    },
    parts: [
      { id: 'led1', name: 'LED Đỏ (Red LED)', pin: 'GPIO 21', rating: 'Vf = 2.0V, If <= 20mA' },
      { id: 'led2', name: 'LED Vàng (Yellow LED)', pin: 'GPIO 22', rating: 'Vf = 2.1V, If <= 20mA' },
      { id: 'res1', name: 'Điện trở 220Ω', pin: 'Series', rating: '0.25W Carbon Film' }
    ],
    quiz: [
      {
        q: 'Nếu nối trực tiếp chân GPIO 3.3V vào LED mà không dùng điện trở hạn dòng, điều gì xảy ra?',
        options: ['LED sáng dịu hơn', 'Dòng điện vọt quá 40mA và LED bị cháy hỏng (COMPONENT_BURNED)', 'Không có gì xảy ra', 'ESP32 tự ngắt sạc pin'],
        answer: 1,
        explain: 'Theo định luật Ohm, khi không có điện trở R, dòng điện I vượt quá giới hạn 40mA làm hỏng linh kiện!'
      },
      {
        q: 'Lệnh digitalWrite(21, HIGH) sẽ xuất điện áp bao nhiêu ra chân số 21?',
        options: ['0V', '1.5V', '3.3V', '5.0V'],
        answer: 2,
        explain: 'Mức HIGH trên ESP32 tương đương với điện áp nguồn IO là 3.3V.'
      },
      {
        q: 'Khi giảm chu kỳ delay từ 1000ms xuống 100ms, đèn LED sẽ chớp như thế nào?',
        options: ['Chậm hơn 10 lần', 'Nhanh hơn gấp 10 lần', 'Ngừng chớp', 'Đổi sang màu tím'],
        answer: 1,
        explain: 'Thời gian chờ giữa các lần bật/tắt càng ngắn thì tần số chớp nháy càng nhanh.'
      }
    ]
  },
  {
    id: 'button',
    number: 3,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Chuông báo tủ lạnh (Fridge Guard)',
      en: 'Fridge Door Guard'
    },
    desc: {
      vi: 'Cảm biến góc mở cửa tủ lạnh: Nếu cửa mở quá 12° lâu hơn thời gian gia hạn, còi 2400Hz sẽ reo báo động!',
      en: 'Fridge door open angle detector: If door stays open > 12° longer than grace period, a 2400Hz buzzer sounds!'
    },
    hardware: {
      vi: 'Cảm biến công tắc từ hoặc góc nghiêng (GPIO 4), Còi chíp Buzzer (GPIO 15), Đèn LED cảnh báo (GPIO 2)',
      en: 'Magnetic reed switch (GPIO 4), Buzzer (GPIO 15), Warning LED (GPIO 2)'
    },
    pedagogy: {
      vi: 'Lập trình điều kiện If/Else, đếm thời gian trôi qua không khóa millis() và bảo vệ năng lượng.',
      en: 'Implement conditional If/Else logic, non-blocking millis() timing, and energy conservation.'
    },
    defaultParams: { openAngle: 0, graceTimeMs: 3000 },
    simConfig: { type: 'fridge-guard', angleThreshold: 12, alarmFreq: 2400 },
    storyCards: [
      {
        icon: '🧊',
        titleVi: 'Đừng Quên Đóng Cửa Tủ Lạnh!',
        titleEn: 'Close The Fridge!',
        textVi: 'Kéo mở cửa tủ lạnh. Nếu quên đóng quá 3 giây, chú cánh cụt ESP32 sẽ hú còi nhắc nhở!',
        textEn: 'Drag the fridge door open. If open > 3s, the ESP32 penguin sounds the alarm!'
      }
    ],
    blocks: [
      { type: 'if_then_else', label: 'Nếu cửa mở > 12 độ và quá thời gian gia hạn' },
      { type: 'digital_write', pin: 15, val: 'HIGH', label: 'Bật còi báo động 2400Hz' },
      { type: 'digital_write', pin: 2, val: 'HIGH', label: 'Nhấp nháy LED cảnh báo' }
    ],
    codeCpp: `const int PIN_SENSOR = 4;
const int PIN_BUZZER = 15;
const int PIN_LED = 2;
unsigned long openStartTime = 0;
const unsigned long GRACE_PERIOD = {{graceTimeMs}};

void setup() {
  pinMode(PIN_SENSOR, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  bool doorOpen = (digitalRead(PIN_SENSOR) == HIGH);
  if (doorOpen) {
    if (openStartTime == 0) openStartTime = millis();
    if (millis() - openStartTime > GRACE_PERIOD) {
      digitalWrite(PIN_BUZZER, HIGH);
      digitalWrite(PIN_LED, HIGH);
    }
  } else {
    openStartTime = 0;
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_LED, LOW);
  }
  delay(50);
}`,
    codePy: `from machine import Pin
import time

sensor = Pin(4, Pin.IN, Pin.PULL_UP)
buzzer = Pin(15, Pin.OUT)
led = Pin(2, Pin.OUT)
open_start = 0

while True:
    if sensor.value() == 1:
        if open_start == 0:
            open_start = time.ticks_ms()
        if time.ticks_diff(time.ticks_ms(), open_start) > {{graceTimeMs}}:
            buzzer.value(1)
            led.value(1)
    else:
        open_start = 0
        buzzer.value(0)
        led.value(0)
    time.sleep_ms(50)
`,
    schematic: {
      diagram: 'Công tắc từ chân GPIO 4 (Kéo nội INPUT_PULLUP) -> GND; Buzzer GPIO 15 -> GND; LED Onboard GPIO 2',
      rails: ['GPIO 4', 'GPIO 15', 'GPIO 2', 'GND']
    },
    parts: [
      { id: 'sensor-reed', name: 'Công tắc từ / Góc nghiêng', pin: 'GPIO 4', rating: 'Input Pull-up' },
      { id: 'buzzer-alarm', name: 'Còi chíp chủ động 2400Hz', pin: 'GPIO 15', rating: '5V/3.3V Tolerant' }
    ],
    quiz: [
      {
        q: 'Góc mở cửa bao nhiêu thì bắt đầu kích hoạt bộ đếm thời gian tủ lạnh?',
        options: ['Chỉ khi mở đúng 90 độ', 'Lớn hơn 12 độ', 'Nhỏ hơn 5 độ', 'Khi cửa đóng hoàn toàn'],
        answer: 1,
        explain: 'Theo đặc tả, khi góc mở theta > 12 độ thì bộ đếm bắt đầu tính thời gian vi phạm.'
      },
      {
        q: 'Chế độ INPUT_PULLUP giúp gì cho chân vi điều khiển?',
        options: ['Tăng điện áp lên 12V', 'Bật điện trở kéo nội lên 3.3V giúp chân không bị trôi nổi', 'Làm còi kêu to hơn', 'Làm mát chip'],
        answer: 1,
        explain: 'Điện trở kéo nội giữ chân ở mức HIGH ổn định khi công tắc chưa đóng vào GND.'
      },
      {
        q: 'Khi đóng cửa tủ lạnh lại (góc < 12 độ), hệ thống phản ứng thế nào?',
        options: ['Tiếp tục kêu mãi', 'Xóa bộ đếm thời gian và tắt còi ngay lập tức', 'Tắt toàn bộ nguồn ESP32', 'Khởi động lại chip'],
        answer: 1,
        explain: 'Hệ thống reset openStartTime = 0 và tắt còi cũng như đèn báo.'
      }
    ]
  },
  {
    id: 'wifi',
    number: 4,
    ageBands: ['band-c'],
    title: {
      vi: 'Máy chủ Web Wi-Fi & Bật/Tắt Đèn (/toggle)',
      en: 'Wi-Fi Web Server & /toggle Control'
    },
    desc: {
      vi: 'Khởi tạo máy chủ HTTP Web Server trên ESP32, truy cập từ trình duyệt điện thoại để điều khiển chân GPIO 2.',
      en: 'Create an HTTP Web Server on ESP32, access from virtual phone browser to toggle GPIO 2 LED.'
    },
    hardware: {
      vi: 'ESP32 Wi-Fi Station/SoftAP, Đèn LED tích hợp chân GPIO 2',
      en: 'ESP32 Wi-Fi Station/SoftAP, Onboard Blue LED on GPIO 2'
    },
    pedagogy: {
      vi: 'Nắm vững kiến trúc mạng IoT, địa chỉ IP tĩnh 192.168.1.42, giao thức HTTP GET và mã phản hồi 200 OK.',
      en: 'Master IoT architecture, virtual static IP 192.168.1.42, HTTP GET requests, and 200 OK responses.'
    },
    defaultParams: { ip: '192.168.1.42', ledState: false },
    simConfig: { type: 'wifi-webserver', virtualIp: '192.168.1.42' },
    storyCards: [
      {
        icon: '🌐',
        titleVi: 'Nhà Thông Minh IoT',
        titleEn: 'IoT Smart Home',
        textVi: 'ESP32 phát mạng Wi-Fi và có địa chỉ IP riêng. Điện thoại mở web là bật đèn từ xa!',
        textEn: 'ESP32 serves a web page. Open the virtual phone browser and toggle the light!'
      }
    ],
    blocks: [
      { type: 'wifi_connect', ssid: 'ESP32-SmartHome', label: 'Kết nối mạng Wi-Fi' },
      { type: 'http_server_on', path: '/toggle', label: 'Khi có yêu cầu GET /toggle' },
      { type: 'digital_write_toggle', pin: 2, label: 'Đảo trạng thái LED GPIO 2' }
    ],
    codeCpp: `#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);
bool ledState = false;

void handleToggle() {
  ledState = !ledState;
  digitalWrite(2, ledState ? HIGH : LOW);
  server.send(200, "application/json", String("{\"led\":") + (ledState ? "true" : "false") + "}");
}

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  WiFi.softAP("ESP32-SmartLamp");
  server.on("/toggle", handleToggle);
  server.begin();
  Serial.println("Web server started at 192.168.1.42");
}

void loop() {
  server.handleClient();
}`,
    codePy: `import socket
from machine import Pin

led = Pin(2, Pin.OUT)
led.value(0)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('192.168.1.42', 80))
s.listen(5)
print("Listening on http://192.168.1.42/")
`,
    schematic: {
      diagram: 'Khối Radio Wi-Fi 2.4GHz ESP32 <-> Bộ điều khiển GPIO 2 -> LED Xanh Dương Onboard',
      rails: ['Wi-Fi 802.11b/g/n', 'GPIO 2', '3.3V']
    },
    parts: [
      { id: 'wifi-radio', name: 'Wi-Fi 802.11 b/g/n Baseband', pin: 'Internal', rating: 'TX Power +20dBm' },
      { id: 'blue-led', name: 'Onboard Indicator LED', pin: 'GPIO 2', rating: 'Built-in 1k series resistor' }
    ],
    quiz: [
      {
        q: 'Khi gửi yêu cầu GET /toggle tới máy chủ ESP32, mã HTTP nào biểu thị thành công?',
        options: ['404 Not Found', '200 OK', '500 Internal Error', '301 Redirect'],
        answer: 1,
        explain: 'HTTP 200 OK là mã chuẩn thông báo yêu cầu đã được máy chủ tiếp nhận và thực thi hoàn tất.'
      },
      {
        q: 'Khi Wi-Fi trên ESP32 hoạt động, kênh ADC nào sau đây bị khóa không sử dụng được?',
        options: ['ADC1', 'ADC2', 'Cả ADC1 và ADC2', 'Không kênh nào bị khóa'],
        answer: 1,
        explain: 'Theo RULE-002, kênh ADC2 dùng chung mạch phần cứng RF với Wi-Fi nên bị khóa khi bật Wi-Fi.'
      },
      {
        q: 'Chân LED tích hợp sẵn trên đại đa số bo mạch ESP32 DevKit nằm ở GPIO nào?',
        options: ['GPIO 2', 'GPIO 34', 'GPIO 25', 'GPIO 12'],
        answer: 0,
        explain: 'GPIO 2 được nối sẵn với đèn LED màu xanh lam trên bo mạch ESP32 DevKit V1.'
      }
    ]
  },
  {
    id: 'sound',
    number: 5,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Còi hú xe cứu hỏa (Siren Sound)',
      en: 'Fire Truck Siren Sound'
    },
    desc: {
      vi: 'Tạo hiệu ứng âm thanh còi hú cứu hỏa bằng cách quét tần số sóng âm từ 400Hz đến 1200Hz qua điều chế PWM.',
      en: 'Generate fire truck siren audio by sweeping frequency from 400Hz to 1200Hz via PWM tone.'
    },
    hardware: {
      vi: 'Còi chíp thụ động (Passive Buzzer) nối chân GPIO 25 hoặc 18, điện trở 100Ω',
      en: 'Passive buzzer on GPIO 25 or 18, 100Ω resistor'
    },
    pedagogy: {
      vi: 'Khái niệm tần số âm thanh (Hertz), dao động sóng vuông và hàm quét toán học hình sin.',
      en: 'Understand sound frequency (Hz), square wave vibration, and sinusoidal frequency sweeps.'
    },
    defaultParams: { sweepSpeedMs: 800, minFreq: 400, maxFreq: 1200 },
    simConfig: { type: 'siren', minFreq: 400, maxFreq: 1200 },
    storyCards: [
      {
        icon: '🚒',
        titleVi: 'Xe Cứu Hỏa Mau Tới!',
        titleEn: 'Fire Truck Siren',
        textVi: 'Còi hú bổng rồi trầm từ 400Hz lên 1200Hz giúp mọi người biết đường nhường lối!',
        textEn: 'Siren sweeps from 400Hz to 1200Hz warning traffic to yield the way!'
      }
    ],
    blocks: [
      { type: 'tone_sweep', from: 400, to: 1200, label: 'Quét tần số còi từ 400Hz đến 1200Hz' }
    ],
    codeCpp: `const int BUZZER_PIN = 25;

void setup() {
  ledcAttach(BUZZER_PIN, 1000, 8); // 8-bit resolution
}

void loop() {
  for (int f = 400; f <= 1200; f += 20) {
    ledcWriteTone(BUZZER_PIN, f);
    delay(10);
  }
  for (int f = 1200; f >= 400; f -= 20) {
    ledcWriteTone(BUZZER_PIN, f);
    delay(10);
  }
}`,
    codePy: `from machine import Pin, PWM
import time

buzzer = PWM(Pin(25))

while True:
    for f in range(400, 1201, 20):
        buzzer.freq(f)
        buzzer.duty(512)
        time.sleep_ms(10)
    for f in range(1200, 399, -20):
        buzzer.freq(f)
        buzzer.duty(512)
        time.sleep_ms(10)
`,
    schematic: {
      diagram: 'ESP32 GPIO 25 -> 100Ω -> Chân dương Còi thụ động -> Chân âm -> GND',
      rails: ['GPIO 25', 'GND']
    },
    parts: [
      { id: 'piezo-buzzer', name: 'Passive Piezo Buzzer', pin: 'GPIO 25', rating: 'Freq range 20Hz - 20kHz' }
    ],
    quiz: [
      {
        q: 'Tần số âm thanh càng cao (ví dụ 1200Hz so với 400Hz) thì tai người nghe thế nào?',
        options: ['Âm thanh trầm hơn', 'Âm thanh bổng (chói) hơn', 'Không nghe thấy gì', 'Âm thanh phát chậm hơn'],
        answer: 1,
        explain: 'Tần số cao dao động nhanh hơn tạo ra âm sắc bổng cao; tần số thấp tạo ra âm trầm.'
      },
      {
        q: 'Khác biệt chính giữa Còi chủ động (Active) và Còi thụ động (Passive) là gì?',
        options: ['Còi chủ động to hơn', 'Còi thụ động cần cấp xung dao động PWM mới phát ra nốt nhạc', 'Còi chủ động chạy pin mặt trời', 'Không có điểm khác'],
        answer: 1,
        explain: 'Còi thụ động không có mạch dao động trong, cho phép lập trình thay đổi tần số tạo giai điệu.'
      },
      {
        q: 'Đơn vị đo tần số dao động âm thanh là gì?',
        options: ['Volt (V)', 'Ampere (A)', 'Hertz (Hz)', 'Ohm (Ω)'],
        answer: 2,
        explain: 'Hertz (Hz) là số lần dao động hoàn chỉnh trong một giây.'
      }
    ]
  },
  {
    id: 'piano',
    number: 6,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Đàn Piano Phím Chạm Cảm Ứng (Touch Piano)',
      en: 'Mini Touch Capacitive Piano'
    },
    desc: {
      vi: 'Mô phỏng 8 lá đồng cảm ứng điện dung tương ứng 8 nốt nhạc C4 đến C5, độ trễ phản hồi dưới 20ms.',
      en: '8 capacitive copper touch pads mapping to musical notes C4 to C5 with < 20ms audio latency.'
    },
    hardware: {
      vi: '8 phím đồng cảm ứng chạm (GPIO 4, 0, 2, 15, 13, 12, 14, 27), Loa / Còi thụ động',
      en: '8 copper touch pads (GPIO 4, 0, 2, 15, 13, 12, 14, 27), Speaker/Buzzer'
    },
    pedagogy: {
      vi: 'Tìm hiểu về cảm ứng điện dung cơ thể người, ngưỡng TouchVal và nốt nhạc chuẩn âm thanh quốc tế.',
      en: 'Explore human capacitive touch, TouchVal threshold drop, and standard musical frequencies.'
    },
    defaultParams: { threshold: 40, activeNote: null },
    simConfig: {
      type: 'touch-piano',
      notes: [
        { note: 'C4', freq: 261.63, pin: 4 },
        { note: 'D4', freq: 293.66, pin: 0 },
        { note: 'E4', freq: 329.63, pin: 2 },
        { note: 'F4', freq: 349.23, pin: 15 },
        { note: 'G4', freq: 392.00, pin: 13 },
        { note: 'A4', freq: 440.00, pin: 12 },
        { note: 'B4', freq: 493.88, pin: 14 },
        { note: 'C5', freq: 523.25, pin: 27 }
      ]
    },
    storyCards: [
      {
        icon: '🎹',
        titleVi: 'Phím Đàn Ma Thuật',
        titleEn: 'Magic Touch Piano',
        textVi: 'Chạm ngón tay vào miếng đồng là tiếng nhạc du dương cất lên ngay tức thì!',
        textEn: 'Tap your finger on the copper pad and musical notes chime instantly!'
      }
    ],
    blocks: [
      { type: 'on_touch_pin', pin: 4, note: 'C4 (261.63Hz)', label: 'Khi chạm phím Đô C4' },
      { type: 'play_tone', freq: 261.63, label: 'Phát nốt Đô' }
    ],
    codeCpp: `const int TOUCH_PIN_C4 = 4;
const int SPEAKER_PIN = 25;

void setup() {
  ledcAttach(SPEAKER_PIN, 1000, 8);
}

void loop() {
  int touchVal = touchRead(TOUCH_PIN_C4);
  if (touchVal < 40) { // Chạm ngón tay làm giá trị giảm
    ledcWriteTone(SPEAKER_PIN, 261); // Nốt C4
  } else {
    ledcWriteTone(SPEAKER_PIN, 0);
  }
  delay(10);
}`,
    codePy: `from machine import TouchPad, Pin, PWM
import time

tp = TouchPad(Pin(4))
buzzer = PWM(Pin(25))

while True:
    val = tp.read()
    if val < 400:
        buzzer.freq(262)
        buzzer.duty(512)
    else:
        buzzer.duty(0)
    time.sleep_ms(10)
`,
    schematic: {
      diagram: 'Lá đồng chạm nối trực tiếp GPIO 4; Loa đệm Transistor nối GPIO 25',
      rails: ['Touch GPIO 4', 'GPIO 25 PWM', 'GND']
    },
    parts: [
      { id: 'touch-pads', name: '8 Copper Touch Sensors', pin: 'GPIO 4..27', rating: 'Capacitive charge sense' }
    ],
    quiz: [
      {
        q: 'Khi ngón tay chạm vào phím cảm ứng, giá trị đọc touchRead() thay đổi thế nào?',
        options: ['Tăng lên cực đại', 'Giảm xuống thấp hơn ngưỡng Threshold_idle', 'Không đổi', 'Biến thành số âm'],
        answer: 1,
        explain: 'Điện dung cơ thể hấp thu một phần điện tích khiến giá trị đếm xung cảm ứng giảm xuống.'
      },
      {
        q: 'Nốt La chuẩn (A4) có tần số âm thanh là bao nhiêu Hertz?',
        options: ['261.63 Hz', '329.63 Hz', '440.00 Hz', '523.25 Hz'],
        answer: 2,
        explain: 'Nốt A4 là tần số mẫu tiêu chuẩn quốc tế dùng để lên dây đàn: 440 Hz.'
      },
      {
        q: 'Theo RULE-003, độ trễ âm thanh khi chạm phím đàn phải đảm bảo nhỏ hơn bao nhiêu?',
        options: ['20 ms', '500 ms', '1000 ms', '2000 ms'],
        answer: 0,
        explain: 'Đặc tả yêu cầu độ trễ phản hồi <= 20ms để tạo cảm giác tự nhiên như chơi nhạc cụ thật.'
      }
    ]
  },
  {
    id: 'knob',
    number: 7,
    ageBands: ['band-b', 'band-c'],
    title: {
      vi: 'Vòng 12 Đèn LED Màu Neopixel (WS2812B)',
      en: '12-LED Neopixel Ring & Potentiometer'
    },
    desc: {
      vi: 'Đọc biến trở xoay 12-bit ADC (0..4095) để thắp sáng lần lượt các bóng đèn trên vòng 12 LED Neopixel.',
      en: 'Read 12-bit ADC pot (0..4095) to progressively illuminate a 12-LED Neopixel ring.'
    },
    hardware: {
      vi: 'Vòng 12 LED WS2812B (GPIO 18), Biến trở xoay 10kΩ (GPIO 34), Nguồn 3.3V/5V',
      en: '12-LED WS2812B ring (GPIO 18), 10kΩ Potentiometer (GPIO 34), Power rails'
    },
    pedagogy: {
      vi: 'Công thức tỷ lệ nguyên N_lit = floor((ADC/4095) * 12), giao thức 1 dây Neopixel và chuyển đổi thang đo.',
      en: 'Formula N_lit = floor((ADC/4095) * 12), single-wire WS2812 protocol, and analog scale mapping.'
    },
    defaultParams: { potVal: 2048, mode: 'rainbow' },
    simConfig: { type: 'neopixel-ring', numLeds: 12 },
    storyCards: [
      {
        icon: '🌈',
        titleVi: 'Vòng Tròn Cầu Vồng',
        titleEn: 'Rainbow Wheel',
        textVi: 'Vặn núm xoay: càng vặn thì càng nhiều đèn sáng lên xếp thành vòng tròn tuyệt đẹp!',
        textEn: 'Turn the knob: the further you turn, the more LEDs light up in a circle!'
      }
    ],
    blocks: [
      { type: 'analog_read', pin: 34, label: 'Đọc biến trở chân 34 (0..4095)' },
      { type: 'map_range', fromMin: 0, fromMax: 4095, toMin: 0, toMax: 12, label: 'Quy đổi sang 0..12 đèn' },
      { type: 'neopixel_show', label: 'Cập nhật dải đèn Neopixel' }
    ],
    codeCpp: `#include <Adafruit_NeoPixel.h>
#define PIN_LED 18
#define NUM_LEDS 12

Adafruit_NeoPixel ring(NUM_LEDS, PIN_LED, NEO_GRB + NEO_KHZ800);

void setup() {
  ring.begin();
  ring.setBrightness(50);
}

void loop() {
  int adcVal = analogRead(34); // 0..4095
  int numLit = (adcVal * 12) / 4095;
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i < numLit) {
      ring.setPixelColor(i, ring.Color(0, 150, 255));
    } else {
      ring.setPixelColor(i, ring.Color(0, 0, 0));
    }
  }
  ring.show();
  delay(30);
}`,
    codePy: `import machine, neopixel, time

np = neopixel.NeoPixel(machine.Pin(18), 12)
adc = machine.ADC(machine.Pin(34))
adc.atten(machine.ADC.ATTN_11DB)

while True:
    val = adc.read() # 0..4095
    num_lit = int((val / 4095) * 12)
    for i in range(12):
        if i < num_lit:
            np[i] = (0, 150, 255)
        else:
            np[i] = (0, 0, 0)
    np.write()
    time.sleep_ms(30)
`,
    schematic: {
      diagram: 'Biến trở 10k: Chân 1 -> 3.3V, Chân giữa -> GPIO 34, Chân 3 -> GND; Neopixel DIN -> GPIO 18, VDD -> 3.3V, GND',
      rails: ['3V3', 'GPIO 34 (ADC1)', 'GPIO 18', 'GND']
    },
    parts: [
      { id: 'neopixel-12', name: '12-LED WS2812B Ring', pin: 'GPIO 18', rating: '800kHz single wire' },
      { id: 'potentiometer', name: '10k Rotary Potentiometer', pin: 'GPIO 34', rating: 'Linear taper' }
    ],
    quiz: [
      {
        q: 'Nếu biến trở xoay cho giá trị ADC = 2047, theo công thức N_lit = floor((ADC/4095)*12) sẽ có bao nhiêu đèn sáng?',
        options: ['12 đèn', '6 đèn', '5 đèn', '0 đèn'],
        answer: 2,
        explain: '2047 / 4095 * 12 = 5.998. Lấy phần nguyên floor() kết quả là 5 đèn.'
      },
      {
        q: 'Chân GPIO 34 của ESP32 có đặc điểm phần cứng quan trọng nào?',
        options: ['Chỉ làm đầu vào (Input Only), thuộc kênh ADC1', 'Có thể xuất mức HIGH 5V', 'Tích hợp sẵn còi chip', 'Là chân phát Wi-Fi'],
        answer: 0,
        explain: 'GPIO 34 là chân Input Only (không thể làm OUTPUT) và nằm trên ADC1 hoạt động được khi bật Wi-Fi.'
      },
      {
        q: 'Độ phân giải của bộ chuyển đổi ADC trên ESP32 là bao nhiêu bit?',
        options: ['8-bit (0..255)', '10-bit (0..1023)', '12-bit (0..4095)', '16-bit (0..65535)'],
        answer: 2,
        explain: 'ESP32 sở hữu bộ ADC 12-bit mang lại 4096 mức giá trị từ 0 đến 4095.'
      }
    ]
  },
  {
    id: 'rgb',
    number: 8,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Đèn Ngủ Đổi Màu Ma Thuật (Mood Lamp)',
      en: 'Mood Lamp (RGB Color Wheel)'
    },
    desc: {
      vi: 'Pha trộn 3 màu ánh sáng cơ bản Đỏ (Red), Lục (Green), Lam (Blue) với giá trị 0..255 để tạo ra hàng triệu màu sắc ấm cúng.',
      en: 'Mix Red, Green, and Blue primary colors (0..255) to create millions of cozy ambient colors.'
    },
    hardware: {
      vi: 'LED RGB 4 chân (Cathode chung: GND; Anode: GPIO 25, 26, 27 qua điện trở 220Ω), Quả cầu khuếch tán',
      en: 'Common-cathode RGB LED (GND; GPIO 25, 26, 27 via 220Ω), Diffuser sphere'
    },
    pedagogy: {
      vi: 'Tìm hiểu về tổng hợp màu cộng (Additive color model), điều khiển độ sáng tương đối bằng PWM 8-bit.',
      en: 'Understand additive RGB color model and 8-bit PWM brightness control.'
    },
    defaultParams: { r: 255, g: 120, b: 50 },
    simConfig: { type: 'rgb-lamp' },
    storyCards: [
      {
        icon: '💡',
        titleVi: 'Đèn Ngủ Cầu Vồng',
        titleEn: 'Cozy Mood Light',
        textVi: 'Pha màu đỏ với vàng để thành màu cam hoàng hôn ấm áp giúp bé ngủ ngon!',
        textEn: 'Blend red with yellow to create a warm sunset orange light!'
      }
    ],
    blocks: [
      { type: 'rgb_set_color', r: '{{r}}', g: '{{g}}', b: '{{b}}', label: 'Đặt màu RGB ({{r}}, {{g}}, {{b}})' }
    ],
    codeCpp: `const int PIN_R = 25;
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
  delay(50);
}`,
    codePy: `from machine import Pin, PWM
import time

r = PWM(Pin(25), freq=5000)
g = PWM(Pin(26), freq=5000)
b = PWM(Pin(27), freq=5000)

while True:
    r.duty(int(({{r}} / 255) * 1023))
    g.duty(int(({{g}} / 255) * 1023))
    b.duty(int(({{b}} / 255) * 1023))
    time.sleep_ms(50)
`,
    schematic: {
      diagram: 'Chân dài nhất (Cathode) -> GND; 3 chân R, G, B nối tiếp qua 3 điện trở 220Ω -> GPIO 25, 26, 27',
      rails: ['GPIO 25 (R)', 'GPIO 26 (G)', 'GPIO 27 (B)', 'GND']
    },
    parts: [
      { id: 'rgb-diffused', name: 'RGB Diffused 5mm LED', pin: 'GPIO 25, 26, 27', rating: 'Common Cathode' }
    ],
    quiz: [
      {
        q: 'Khi bật đồng thời cả 3 màu Đỏ (255), Lục (255) và Lam (255), ánh sáng tổng hợp sẽ có màu gì?',
        options: ['Màu đen', 'Màu trắng', 'Màu vàng', 'Màu tím'],
        answer: 1,
        explain: 'Trong hệ màu cộng (Additive RGB), kết hợp cực đại cả 3 màu cơ bản sẽ tạo ra ánh sáng trắng.'
      },
      {
        q: 'Nếu chỉ bật Đỏ (255) và Lục (255) còn Lam tắt (0), mắt ta sẽ nhìn thấy màu gì?',
        options: ['Màu Vàng (Yellow)', 'Màu Xanh lơ (Cyan)', 'Màu Hồng cánh sen (Magenta)', 'Màu Nâu'],
        answer: 0,
        explain: 'Đỏ kết hợp với Lục theo mô hình ánh sáng RGB tạo ra màu Vàng rực rỡ.'
      },
      {
        q: 'Độ phân giải 8-bit của tín hiệu PWM cho phép điều chỉnh bao nhiêu mức độ sáng cho mỗi kênh màu?',
        options: ['10 mức', '100 mức', '256 mức (từ 0 đến 255)', '4096 mức'],
        answer: 2,
        explain: '2^8 = 256 mức giá trị nguyên từ 0 (tối hoàn toàn) đến 255 (sáng tối đa).'
      }
    ]
  },
  {
    id: 'light',
    number: 9,
    ageBands: ['band-a', 'band-b'],
    title: {
      vi: 'Bật Đèn Khi Trời Tối (Night Light)',
      en: 'Automatic Night Light (LDR Sensor)'
    },
    desc: {
      vi: 'Cảm biến quang trở LDR đo cường độ ánh sáng: khi phòng tối (LDR < 50%), đèn LED tự động bật sáng lung linh.',
      en: 'Photoresistor (LDR) detects ambient light: when dark (LDR < 50%), LED automatically illuminates.'
    },
    hardware: {
      vi: 'Quang trở LDR, Điện trở kéo 10kΩ chia áp (GPIO 32), Đèn LED vàng 5mm (GPIO 21)',
      en: 'LDR photoresistor, 10kΩ voltage divider (GPIO 32), Yellow LED (GPIO 21)'
    },
    pedagogy: {
      vi: 'Nguyên lý mạch phân áp (Voltage divider), chuyển đổi quang năng thành điện năng và ngưỡng tự động hóa.',
      en: 'Voltage divider principle, photo-conductive properties, and threshold automation.'
    },
    defaultParams: { ldrPercent: 80, threshold: 50 },
    simConfig: { type: 'night-light', threshold: 50 },
    storyCards: [
      {
        icon: '🌙',
        titleVi: 'Đèn Ngủ Tự Động',
        titleEn: 'Smart Night Light',
        textVi: 'Kéo thanh trượt che tối mặt trời: phòng tối dần thì bóng đèn tự thắp sáng giúp bé không sợ bóng đêm!',
        textEn: 'Drag the slider to hide the sun: as darkness falls, the lamp turns on automatically!'
      }
    ],
    blocks: [
      { type: 'if_then_else', label: 'Nếu ánh sáng < 50%' },
      { type: 'digital_write', pin: 21, val: 'HIGH', label: 'Bật Đèn LED GPIO 21' },
      { type: 'digital_write', pin: 21, val: 'LOW', label: 'Tắt Đèn LED GPIO 21' }
    ],
    codeCpp: `const int LDR_PIN = 32;
const int LED_PIN = 21;
const int THRESHOLD = 2048; // ~50%

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int lightVal = analogRead(LDR_PIN);
  if (lightVal < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH); // Trời tối -> Bật đèn
  } else {
    digitalWrite(LED_PIN, LOW);  // Trời sáng -> Tắt đèn
  }
  delay(100);
}`,
    codePy: `from machine import Pin, ADC
import time

ldr = ADC(Pin(32))
led = Pin(21, Pin.OUT)

while True:
    if ldr.read() < 2048:
        led.value(1)
    else:
        led.value(0)
    time.sleep_ms(100)
`,
    schematic: {
      diagram: '3.3V -> LDR -> Điểm giữa (GPIO 32) -> Điện trở 10kΩ -> GND; GPIO 21 -> 220Ω -> LED -> GND',
      rails: ['3V3', 'GPIO 32 (ADC1)', 'GPIO 21', 'GND']
    },
    parts: [
      { id: 'ldr-sensor', name: 'GL5528 Photoresistor', pin: 'GPIO 32', rating: 'Dark resistance ~1MΩ, Light ~10kΩ' }
    ],
    quiz: [
      {
        q: 'Khi có ánh sáng mạnh chiếu vào quang trở LDR, điện trở của nó thay đổi thế nào?',
        options: ['Tăng lên hàng Mega-Ohm', 'Giảm xuống mạnh (dẫn điện tốt hơn)', 'Không đổi', 'Làm đứt cầu chì'],
        answer: 1,
        explain: 'Chất bán dẫn quang dẫn trong LDR giải phóng thêm electron khi nhận photon ánh sáng, làm điện trở giảm mạnh.'
      },
      {
        q: 'Chân GPIO 32 thuộc khối ADC nào của ESP32?',
        options: ['ADC1 (dùng tốt cùng Wi-Fi)', 'ADC2 (bị khóa khi bật Wi-Fi)', 'Không có ADC', 'DAC'],
        answer: 0,
        explain: 'GPIO 32 thuộc ADC1_CH4, do đó đọc tín hiệu analog an toàn ngay cả khi bật Wi-Fi.'
      },
      {
        q: 'Theo RULE-003, khi giá trị ánh sáng môi trường LDR >= 50% thì đèn LED ở trạng thái nào?',
        options: ['Bật sáng rực rỡ', 'Tắt hoàn toàn (OFF)', 'Nhấp nháy liên tục', 'Đổi sang màu đỏ'],
        answer: 1,
        explain: 'Khi trời đủ sáng (>= 50%), quy tắc đặc tả quy định đèn tự động tắt để tiết kiệm điện.'
      }
    ]
  },
  {
    id: 'sensor',
    number: 10,
    ageBands: ['band-b', 'band-c'],
    title: {
      vi: 'Thước Đo Khoảng Cách Siêu Âm (HC-SR04P & OLED)',
      en: 'Ultrasonic Ruler (HC-SR04P & OLED)'
    },
    desc: {
      vi: 'Phát xung siêu âm 40kHz đo thời gian dội về delta_t = (2*d)/0.0343 để tính khoảng cách và hiển thị lên màn hình OLED.',
      en: 'Emit 40kHz ultrasound, measure roundtrip echo delta_t = (2*d)/0.0343, and render on OLED display.'
    },
    hardware: {
      vi: 'Cảm biến siêu âm HC-SR04P 3.3V (Trig GPIO 5, Echo GPIO 18), Màn hình OLED SSD1306 I2C (SDA GPIO 21, SCL GPIO 22)',
      en: 'HC-SR04P 3.3V sensor (Trig GPIO 5, Echo GPIO 18), SSD1306 I2C OLED (SDA 21, SCL 22)'
    },
    pedagogy: {
      vi: 'Vận tốc âm thanh trong không khí 343 m/s, giao thức màn hình I2C và định lý xung hồi tiếp.',
      en: 'Speed of sound 343 m/s, roundtrip distance calculation, and I2C OLED rendering.'
    },
    defaultParams: { distanceCm: 25 },
    simConfig: { type: 'ultrasonic-ruler', minDist: 2, maxDist: 400 },
    storyCards: [
      {
        icon: '🦇',
        titleVi: 'Đôi Tai Của Loài Dơi',
        titleEn: 'Bat Echolocation',
        textVi: 'ESP32 phát ra tiếng siêu âm tai người không nghe thấy, rồi đếm thời gian sóng dội lại để đo khoảng cách!',
        textEn: 'ESP32 fires ultrasonic chirps and measures echo time to gauge distance like a bat!'
      }
    ],
    blocks: [
      { type: 'ultrasonic_read', trig: 5, echo: 18, label: 'Đọc khoảng cách cảm biến siêu âm (cm)' },
      { type: 'oled_print', text: 'Khoảng cách: {d} cm', label: 'Vẽ lên màn hình OLED' }
    ],
    codeCpp: `#include <Wire.h>
#include <Adafruit_SSD1306.h>

#define TRIG_PIN 5
#define ECHO_PIN 18
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = (duration * 0.0343) / 2.0;
  
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.print(distance, 1);
  display.print(" cm");
  display.display();
  delay(100);
}`,
    codePy: `from machine import Pin, time_pulse_us
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
    time.sleep_ms(100)
`,
    schematic: {
      diagram: 'HC-SR04P VCC -> 3.3V, Trig -> GPIO 5, Echo -> GPIO 18, GND; OLED VCC -> 3.3V, SDA -> GPIO 21, SCL -> GPIO 22, GND',
      rails: ['3V3', 'GPIO 5', 'GPIO 18', 'GPIO 21 (SDA)', 'GPIO 22 (SCL)', 'GND']
    },
    parts: [
      { id: 'hcsr04p', name: 'HC-SR04P 3.3V Sensor', pin: 'Trig 5, Echo 18', rating: '2cm to 400cm range' },
      { id: 'oled-screen', name: '0.96 OLED SSD1306', pin: 'I2C (21, 22)', rating: '128x64 Monochrome' }
    ],
    quiz: [
      {
        q: 'Vận tốc lan truyền của sóng âm trong không khí xấp xỉ là bao nhiêu?',
        options: ['343 m/s (0.0343 cm/µs)', '300,000 km/s', '10 m/s', '1500 m/s'],
        answer: 0,
        explain: 'Sóng âm di chuyển trong không khí ở nhiệt độ phòng với vận tốc xấp xỉ 343 mét/giây.'
      },
      {
        q: 'Tại sao trong công thức tính khoảng cách phải chia cho 2: d = (t * 0.0343) / 2?',
        options: ['Vì có 2 cảm biến', 'Vì sóng âm phải đi 2 chiều: từ loa phát tới vật cản rồi dội ngược về đầu thu', 'Để đổi đơn vị sang cm', 'Do ESP32 có 2 lõi'],
        answer: 1,
        explain: 'Thời gian đo được là hành trình cả đi lẫn về (khứ hồi), nên khoảng cách một chiều bằng một nửa.'
      },
      {
        q: 'Khoảng cách đo khả dụng của cảm biến HC-SR04 theo chuẩn là dải nào?',
        options: ['Từ 2 cm đến 400 cm', 'Từ 0 đến 10 mét', 'Từ 1 mm đến 10 mm', 'Từ 50 cm đến 100 mét'],
        answer: 0,
        explain: 'Cảm biến hoạt động tin cậy trong phạm vi từ 2cm đến 400cm (4 mét).'
      }
    ]
  },
  {
    id: 'motor',
    number: 11,
    ageBands: ['band-b', 'band-c'],
    title: {
      vi: 'Điều Tốc Động Cơ DC Qua Mạch Cầu H (PWM Speed)',
      en: 'DC Motor Speed Control (H-Bridge PWM)'
    },
    desc: {
      vi: 'Điều chế độ rộng xung PWM (0..100% duty cycle) điều khiển tốc độ quay bánh xe tỷ lệ tuyến tính.',
      en: 'Modulate PWM duty cycle (0..100%) to control motor rotation speed linearly.'
    },
    hardware: {
      vi: 'Động cơ DC mini, Mạch công suất Transistor / Cầu H L298N/L9110S (GPIO 19, 23), Nguồn pin ngoài',
      en: 'Mini DC Motor, Transistor/H-Bridge driver (GPIO 19, 23), External battery'
    },
    pedagogy: {
      vi: 'Tải cảm ứng, diode dập xung ngược (Flyback Diode), chu kỳ nhiệm vụ Duty Cycle và điều khiển mô-men.',
      en: 'Inductive load, flyback diode protection, duty cycle percentage, and torque.'
    },
    defaultParams: { speedPercent: 60, direction: 'forward' },
    simConfig: { type: 'dc-motor' },
    storyCards: [
      {
        icon: '🏎️',
        titleVi: 'Xe Đua Thần Tốc',
        titleEn: 'Racing Car Motor',
        textVi: 'Tăng xung PWM từ 0% lên 100%: bánh xe quay tít mù đưa xe lao nhanh về đích!',
        textEn: 'Boost PWM duty from 0% to 100%: wheels spin fast propelling the car!'
      }
    ],
    blocks: [
      { type: 'pwm_write_duty', pin: 19, duty: '{{speedPercent}}', label: 'Xuất xung PWM {{speedPercent}}%' }
    ],
    codeCpp: `const int MOTOR_PWM_PIN = 19;
const int MOTOR_DIR_PIN = 23;

void setup() {
  pinMode(MOTOR_DIR_PIN, OUTPUT);
  digitalWrite(MOTOR_DIR_PIN, LOW); // Quay thuận
  ledcAttach(MOTOR_PWM_PIN, 20000, 8); // 20kHz không rít tai
}

void loop() {
  int duty = map({{speedPercent}}, 0, 100, 0, 255);
  ledcWrite(MOTOR_PWM_PIN, duty);
  delay(100);
}`,
    codePy: `from machine import Pin, PWM
import time

motor = PWM(Pin(19), freq=20000)

while True:
    duty_u16 = int(({{speedPercent}} / 100) * 65535)
    motor.duty_u16(duty_u16)
    time.sleep_ms(100)
`,
    schematic: {
      diagram: 'ESP32 GPIO 19 PWM -> Cực B Transistor (hoặc INA Cầu H); Cực C -> Động cơ có Diode 1N4007 song song ngược -> Nguồn ngoài',
      rails: ['GPIO 19', 'GPIO 23', 'VIN/VCC', 'GND']
    },
    parts: [
      { id: 'dc-motor', name: 'Mini 3V-6V DC Gear Motor', pin: 'GPIO 19 PWM', rating: 'Max 250mA loaded' }
    ],
    quiz: [
      {
        q: 'Tại sao không được nối trực tiếp mô-tơ DC vào chân GPIO của vi điều khiển ESP32?',
        options: ['Vì mô-tơ quay làm văng chip', 'Vì mô-tơ tiêu thụ dòng điện lớn (>100mA) và có xung ngược làm cháy chân GPIO', 'Vì ESP32 chỉ chạy pin nút', 'Không cần lý do'],
        answer: 1,
        explain: 'Chân GPIO ESP32 chỉ cấp tối đa 40mA. Động cơ tiêu thụ dòng lớn cần mạch đệm công suất trung gian.'
      },
      {
        q: 'Chu kỳ nhiệm vụ (Duty Cycle) của tín hiệu PWM thể hiện điều gì?',
        options: ['Tần số quét màn hình', 'Tỷ lệ phần trăm thời gian tín hiệu ở mức HIGH trong một chu kỳ', 'Điện trở của dây dẫn', 'Độ ẩm không khí'],
        answer: 1,
        explain: 'Duty Cycle biểu thị tỷ lệ thời gian bật HIGH so với tổng chu kỳ, quyết định công suất trung bình cấp cho tải.'
      },
      {
        q: 'Diode dập xung ngược (Flyback Diode) mắc song song với động cơ có tác dụng gì?',
        options: ['Làm động cơ quay ngược', 'Triệt tiêu điện áp cảm ứng ngược sinh ra khi ngắt dòng cuộn dây, bảo vệ transistor', 'Tăng tốc độ gấp đôi', 'Phát sáng'],
        answer: 1,
        explain: 'Cuộn dây sinh ra suất điện động ngược rất lớn khi ngắt điện. Diode dập xung bảo vệ linh kiện bán dẫn.'
      }
    ]
  },
  {
    id: 'servo',
    number: 12,
    ageBands: ['band-b', 'band-c'],
    title: {
      vi: 'Cổng Rào Chắn Laser Tự Động (Laser Barrier)',
      en: 'Laser Barrier Gate & Servo'
    },
    desc: {
      vi: 'Tia laser chiếu vào quang thu. Khi xe chắn ngang tia laser, Servo quay 0° -> 90° mở cổng trong 3000ms rồi tự đóng.',
      en: 'Laser shines on detector. When blocked, Servo opens 0° -> 90° at 180°/s, holds 3000ms, then closes.'
    },
    hardware: {
      vi: 'Mô-đun Laser Đỏ 650nm, Quang trở / Quang transistor thu (GPIO 35), Động cơ Servo SG90 (GPIO 13)',
      en: 'Red Laser 650nm, Phototransistor (GPIO 35), SG90 Micro Servo (GPIO 13)'
    },
    pedagogy: {
      vi: 'Tín hiệu điều khiển Servo bằng xung 50Hz (độ rộng 1ms - 2ms), trạng thái cổng rào chắn và an toàn giao thông.',
      en: '50Hz Servo PWM timing (1ms - 2ms pulse width), finite state machine, and transport safety.'
    },
    defaultParams: { isBlocked: false, holdTimeMs: 3000 },
    simConfig: { type: 'laser-servo-gate', openAngle: 90, holdMs: 3000 },
    storyCards: [
      {
        icon: '🚧',
        titleVi: 'Cổng Thu Phí Tự Động',
        titleEn: 'Toll Barrier Gate',
        textVi: 'Chiếc xe đồ chơi đi qua cắt đứt tia laser vô hình, cần chắn bật mở 90 độ cho xe qua!',
        textEn: 'Toy car cuts the laser beam, barrier opens 90 degrees to let it pass!'
      }
    ],
    blocks: [
      { type: 'if_laser_cut', pin: 35, label: 'Khi tia Laser bị xe che chắn' },
      { type: 'servo_write_angle', pin: 13, angle: 90, label: 'Quay Servo mở cổng 90 độ' },
      { type: 'delay_ms', val: 3000, label: 'Chờ 3000 mili-giây' },
      { type: 'servo_write_angle', pin: 13, angle: 0, label: 'Đóng cần chắn về 0 độ' }
    ],
    codeCpp: `#include <ESP32Servo.h>

Servo gateServo;
const int LASER_DETECTOR = 35; // Input only
const int SERVO_PIN = 13;

void setup() {
  gateServo.attach(SERVO_PIN);
  gateServo.write(0); // Đóng rào chắn
  pinMode(LASER_DETECTOR, INPUT);
}

void loop() {
  int beam = digitalRead(LASER_DETECTOR);
  if (beam == LOW) { // Tia laser bị chắn
    gateServo.write(90); // Mở cổng
    delay(3000);        // Giữ mở 3 giây
    gateServo.write(0);  // Tự động đóng rào
  }
  delay(50);
}`,
    codePy: `from machine import Pin, PWM
import time

servo = PWM(Pin(13), freq=50)
laser_sensor = Pin(35, Pin.IN)

def set_angle(deg):
    duty = int(40 + (deg / 180) * 80) # 0.5ms - 2.5ms approx
    servo.duty(duty)

set_angle(0)
while True:
    if laser_sensor.value() == 0:
        set_angle(90)
        time.sleep(3)
        set_angle(0)
    time.sleep_ms(50)
`,
    schematic: {
      diagram: 'Laser 5V -> Quang transistor (GPIO 35 Input-Only); Servo SG90 Tín hiệu -> GPIO 13, Nguồn 5V/3.3V, GND',
      rails: ['3V3/5V', 'GPIO 35', 'GPIO 13', 'GND']
    },
    parts: [
      { id: 'servo-sg90', name: 'SG90 9g Micro Servo', pin: 'GPIO 13', rating: '0 to 180 deg, 50Hz PWM' },
      { id: 'laser-mod', name: 'Laser Diode 650nm Red', pin: '5V rail', rating: '< 5mW Class IIIA' }
    ],
    quiz: [
      {
        q: 'Tần số xung điều khiển chuẩn cho động cơ Servo RC thông thường là bao nhiêu?',
        options: ['50 Hz (chu kỳ 20ms)', '10,000 Hz', '1 Hz', '1 MHz'],
        answer: 0,
        explain: 'Động cơ RC Servo tiêu chuẩn sử dụng chu kỳ 20ms tương ứng tần số 50Hz.'
      },
      {
        q: 'Theo RULE-004, tốc độ góc quay của cần chắn Servo là bao nhiêu?',
        options: ['180 độ / giây', '10 độ / phút', '3600 vòng / phút', 'Tức thời 0 giây'],
        answer: 0,
        explain: 'Đặc tả RULE-004 quy định tốc độ góc đạt 180 độ/giây (quay 90 độ mất 500ms).'
      },
      {
        q: 'Thời gian cần chắn giữ ở góc mở 90 độ trước khi tự quay về 0 độ là bao lâu?',
        options: ['500 ms', '1000 ms', '3000 ms', '10000 ms'],
        answer: 2,
        explain: 'Theo đặc tả, rào chắn duy trì trạng thái mở trong 3000ms (3 giây).'
      }
    ]
  },
  {
    id: 'bluetooth',
    number: 13,
    ageBands: ['band-c'],
    title: {
      vi: 'Đàm Thoại Bluetooth & Điều Khiển Không Dây (BLE/SPP)',
      en: 'Bluetooth Serial & Wireless Control'
    },
    desc: {
      vi: 'Ghép đôi điện thoại ảo qua Bluetooth Serial với tên nhận diện ESP32-Lamp, gửi lệnh ON/OFF/DIM điều khiển tải.',
      en: 'Pair virtual phone via Bluetooth Serial (ESP32-Lamp), sending ON/OFF/DIM commands.'
    },
    hardware: {
      vi: 'Mô-đun Bluetooth tích hợp ESP32, Đèn LED báo hiệu trạng thái kết nối',
      en: 'Built-in Bluetooth dual-mode radio, Status indicator LED'
    },
    pedagogy: {
      vi: 'Giao thức Bluetooth Classic SPP và BLE, kiến trúc phân tích chuỗi ký tự (String parsing) nhận lệnh nối tiếp.',
      en: 'Bluetooth SPP/BLE stack, serial command parsing, and connection lifecycle.'
    },
    defaultParams: { btConnected: false, lastCommand: 'NONE', lampState: false },
    simConfig: { type: 'bluetooth-serial', deviceName: 'ESP32-Lamp' },
    storyCards: [
      {
        icon: '📱',
        titleVi: 'Sóng Không Dây Bluetooth',
        titleEn: 'Bluetooth Pairing',
        textVi: 'Không cần bộ định tuyến Wi-Fi, điện thoại kết nối trực tiếp với ESP32 như tai nghe không dây!',
        textEn: 'No Wi-Fi router needed, phone pairs directly with ESP32 like wireless earphones!'
      }
    ],
    blocks: [
      { type: 'bt_serial_begin', name: 'ESP32-Lamp', label: 'Bật Bluetooth tên ESP32-Lamp' },
      { type: 'bt_on_receive', cmd: 'ON', label: 'Khi nhận lệnh "ON"' },
      { type: 'digital_write', pin: 2, val: 'HIGH', label: 'Bật Đèn' }
    ],
    codeCpp: `#include "BluetoothSerial.h"

BluetoothSerial SerialBT;
const int LAMP_PIN = 2;

void setup() {
  Serial.begin(115200);
  pinMode(LAMP_PIN, OUTPUT);
  SerialBT.begin("ESP32-Lamp"); // Tên thiết bị Bluetooth
  Serial.println("Bluetooth device ready to pair!");
}

void loop() {
  if (SerialBT.available()) {
    String cmd = SerialBT.readStringUntil('\\n');
    cmd.trim();
    if (cmd == "ON") {
      digitalWrite(LAMP_PIN, HIGH);
      SerialBT.println("OK: LAMP IS ON");
    } else if (cmd == "OFF") {
      digitalWrite(LAMP_PIN, LOW);
      SerialBT.println("OK: LAMP IS OFF");
    }
  }
  delay(20);
}`,
    codePy: `import bluetooth
# ESP32 MicroPython BLE UART
print("BLE Peripheral active as ESP32-Lamp")
`,
    schematic: {
      diagram: 'Khối Radio Bluetooth 2.4GHz ESP32 <-> Bộ nhớ kênh UART <-> GPIO 2',
      rails: ['Bluetooth 4.2 BR/EDR + BLE', 'GPIO 2', 'GND']
    },
    parts: [
      { id: 'bt-radio', name: 'ESP32 Bluetooth Baseband', pin: 'Internal Antenna', rating: 'Class 1, 2, 3 power' }
    ],
    quiz: [
      {
        q: 'Ưu điểm nổi bật của kết nối Bluetooth so với Wi-Fi trong các dự án nhỏ là gì?',
        options: ['Tầm xa hàng nghìn cây số', 'Không cần bộ phát Wi-Fi (Router), kết nối trực tiếp thiết bị với thiết bị', 'Cần nhiều ăng-ten cồng kềnh', 'Tốn rất nhiều điện năng'],
        answer: 1,
        explain: 'Bluetooth cho phép kết nối ngang hàng (Peer-to-Peer) độc lập không phụ thuộc vào hạ tầng mạng router.'
      },
      {
        q: 'Tên nhận diện thiết bị Bluetooth của bài học này theo đặc tả là gì?',
        options: ['My-Phone-123', 'ESP32-Lamp', 'Router-Home', 'Arduino-Uno'],
        answer: 1,
        explain: 'Theo RULE-007, tên thiết bị Bluetooth được đặt là ESP32-Lamp (hoặc Night-Light).'
      },
      {
        q: 'Chuỗi lệnh nào được gửi qua cổng Bluetooth Serial để bật đèn?',
        options: ['"START_ENGINE"', '"ON"', '"HELLO"', '"1234"'],
        answer: 1,
        explain: 'Chương trình kiểm tra lệnh text "ON" để kích hoạt chân đèn lên mức HIGH.'
      }
    ]
  },
  {
    id: 'espnow',
    number: 14,
    ageBands: ['band-c'],
    title: {
      vi: 'Giao Thức Lưới Không Dây ESP-NOW Tốc Độ Cao',
      en: 'High-Speed ESP-NOW Mesh Protocol'
    },
    desc: {
      vi: 'Mô phỏng 2 bo mạch ESP32 gửi nhận gói tin MAC broadcast không cần router với độ trễ < 5ms và kiểm tra suy hao khoảng cách.',
      en: 'Simulate 2 ESP32 boards transmitting peer-to-peer MAC packets (<5ms latency) without router.'
    },
    hardware: {
      vi: '2 Bo mạch ESP32 độc lập (Board A - Phát, Board B - Thu), Nút nhấn phát sóng, Còi báo nhận tin',
      en: '2 ESP32 boards (Board A Sender, Board B Receiver), Trigger button, Buzzer'
    },
    pedagogy: {
      vi: 'Giao thức ESP-NOW không kết nối (Connectionless), hàm ngắt OnDataRecv, tải trọng tối đa 250 bytes và mô hình suy hao sóng.',
      en: 'ESP-NOW connectionless protocol, OnDataRecv callback, 250 byte max payload, and distance packet loss.'
    },
    defaultParams: { distanceMeters: 25, packetsSent: 0, packetsReceived: 0 },
    simConfig: { type: 'esp-now', maxDistance: 150, thresholdLossDistance: 100 },
    storyCards: [
      {
        icon: '🛰️',
        titleVi: 'Bộ Đàm Siêu Tốc ESP-NOW',
        titleEn: 'ESP-NOW Walkie Talkie',
        textVi: 'Bấm nút ở bo mạch A, bo mạch B kêu bíp chỉ trong 3 mili-giây, nhanh hơn chớp mắt!',
        textEn: 'Press button on Board A, Board B beeps in just 3ms, faster than an eye blink!'
      }
    ],
    blocks: [
      { type: 'espnow_init', label: 'Khởi động giao thức ESP-NOW' },
      { type: 'espnow_send_peer', mac: 'FF:FF:FF:FF:FF:FF', data: 'BEEP', label: 'Phát gói tin broadcast' },
      { type: 'espnow_on_recv', label: 'Khi nhận được gói tin từ bạn bè' }
    ],
    codeCpp: `#include <esp_now.h>
#include <WiFi.h>

// Bo mạch phát: Gửi lệnh khi nhấn nút
void setup() {
  WiFi.mode(WIFI_STA);
  esp_now_init();
}

void sendPacket() {
  uint8_t broadcastMac[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, broadcastMac, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
  esp_now_add_peer(&peerInfo);
  
  uint8_t data[] = "CLICK";
  esp_now_send(broadcastMac, data, sizeof(data));
}`,
    codePy: `import network, espnow

sta = network.WLAN(network.STA_IF)
sta.active(True)
e = espnow.ESPNow()
e.active(True)
peer = b'\\xff\\xff\\xff\\xff\\xff\\xff'
e.add_peer(peer)
e.send(peer, "CLICK")
`,
    schematic: {
      diagram: 'Bo mạch A (TX) [GPIO 4 Button] <--- Không Gian 2.4GHz RF ---> Bo mạch B (RX) [GPIO 15 Buzzer]',
      rails: ['Wi-Fi STA Mode', 'Action frame MAC layer', '3.3V']
    },
    parts: [
      { id: 'esp32-node-a', name: 'Board A (Transmitter)', pin: 'GPIO 4 Button', rating: 'ESP-NOW master' },
      { id: 'esp32-node-b', name: 'Board B (Receiver)', pin: 'GPIO 15 Buzzer', rating: 'OnDataRecv callback' }
    ],
    quiz: [
      {
        q: 'Độ trễ truyền nhận gói tin qua ESP-NOW so với mạng Wi-Fi thông thường như thế nào?',
        options: ['Rất chậm, mất cả phút', 'Cực kỳ nhanh (dưới 5ms) vì không qua khâu bắt tay router', 'Bằng nhau', 'Chỉ dùng được ban đêm'],
        answer: 1,
        explain: 'ESP-NOW truyền thẳng gói tin thô ở lớp MAC nên độ trễ dưới 5ms, so với Wi-Fi từ 50-200ms.'
      },
      {
        q: 'Kích thước dữ liệu (Payload) tối đa trong một gói tin ESP-NOW đơn là bao nhiêu?',
        options: ['10 bytes', '250 bytes', '1 Megabyte', '100 Kilobytes'],
        answer: 1,
        explain: 'Theo đặc tả chuẩn của Espressif, một gói tin ESP-NOW mang tối đa 250 byte dữ liệu.'
      },
      {
        q: 'Theo RULE-007, khi khoảng cách truyền sóng vượt quá 100m, điều gì sẽ xảy ra?',
        options: ['Tỷ lệ mất gói tin (Packet Loss) bắt đầu tăng dần lên 100%', 'Bo mạch tự phát nổ', 'Tốc độ tăng gấp 3', 'Tự động gọi điện thoại'],
        answer: 0,
        explain: 'Đặc tả RULE-007 quy định suy hao tín hiệu bắt đầu xuất hiện khi d > 100m theo hàm sigmoid.'
      }
    ]
  },
  {
    id: 'project',
    number: 15,
    ageBands: ['band-c'],
    title: {
      vi: 'Bãi Đỗ Xe Thông Minh Tích Hợp (Smart Parking Lot)',
      en: 'Smart Parking Lot (Integrated IoT)'
    },
    desc: {
      vi: 'Hệ thống tích hợp IoT hoàn chỉnh: Cảm biến siêu âm đếm chỗ trống, đèn giao thông Xanh/Đỏ và Web Server báo slot.',
      en: 'Integrated IoT system: Ultrasonic detects vacant parking slot, traffic LEDs, and live web counter.'
    },
    hardware: {
      vi: 'ESP32, Cảm biến siêu âm (GPIO 5, 18), Đèn LED Xanh/Đỏ (GPIO 21, 22), Màn hình OLED SSD1306',
      en: 'ESP32, Ultrasonic (GPIO 5, 18), Green/Red LEDs (GPIO 21, 22), SSD1306 OLED'
    },
    pedagogy: {
      vi: 'Tích hợp đa cảm biến, máy trạng thái chuyển động xe và truyền thông trực quan thời gian thực.',
      en: 'Multi-sensor fusion, parking state transitions, and real-time dashboard telemetry.'
    },
    defaultParams: { totalSlots: 5, occupiedSlots: 3 },
    simConfig: { type: 'smart-parking', totalSlots: 5 },
    storyCards: [
      {
        icon: '🅿️',
        titleVi: 'Bãi Xe Tự Động Hóa',
        titleEn: 'Smart Parking Hub',
        textVi: 'Xe vào bãi đỗ: cảm biến phát hiện ngay, đèn chuyển đỏ và số chỗ trống trên web giảm đi 1!',
        textEn: 'Car enters: sensor detects immediately, light turns red, and web vacancy count drops by 1!'
      }
    ],
    blocks: [
      { type: 'project_parking_check', label: 'Kiểm tra chỗ trống bãi đỗ xe' }
    ],
    codeCpp: `// Dự án tổng hợp Bãi xe thông minh
int totalSlots = 5;
int occupiedSlots = {{occupiedSlots}};

void setup() {
  Serial.begin(115200);
}

void loop() {
  int vacant = totalSlots - occupiedSlots;
  Serial.print("Vacant slots: ");
  Serial.println(vacant);
  delay(1000);
}`,
    codePy: `total_slots = 5
occupied = {{occupiedSlots}}
print("Vacant slots:", total_slots - occupied)
`,
    schematic: {
      diagram: 'Mạch tích hợp tổng hợp: Siêu âm HC-SR04 + Đèn LED giao thông + Wi-Fi Web Monitor',
      rails: ['3V3', '5V', 'GND']
    },
    parts: [
      { id: 'parking-controller', name: 'Master Parking Hub', pin: 'Multi-pin', rating: 'System-on-Chip' }
    ],
    quiz: [
      {
        q: 'Trong hệ thống bãi đỗ xe thông minh, cảm biến siêu âm được gắn trên nóc vị trí đỗ nhằm mục đích gì?',
        options: ['Làm mát xe', 'Phát hiện có xe đang đỗ hay vị trí đang trống', 'Đo tốc độ xe chạy trên cao tốc', 'Sạc điện cho xe'],
        answer: 1,
        explain: 'Cảm biến siêu âm đo khoảng cách tới trần xe; nếu khoảng cách ngắn hơn ngưỡng có nghĩa là vị trí đã có xe chiếm chỗ.'
      },
      {
        q: 'Khi bãi đỗ xe đã hết chỗ (vacant = 0), đèn tín hiệu ở cổng nên chuyển sang màu gì?',
        options: ['Màu Xanh lá', 'Màu Đỏ báo bãi đầy (FULL)', 'Màu Tím', 'Tắt đèn'],
        answer: 1,
        explain: 'Đèn đỏ hiển thị thông báo bãi đã kín chỗ để các phương tiện không tiếp tục đi vào.'
      },
      {
        q: 'Giao thức truyền thông nào thích hợp nhất để truyền trạng thái bãi xe lên ứng dụng điện thoại người dùng?',
        options: ['HTTP Web Server / MQTT', 'Cáp âm thanh 3.5mm', 'Sóng AM radio', 'Mã Morse'],
        answer: 0,
        explain: 'HTTP API hoặc MQTT là các giao thức chuẩn của IoT dùng để cập nhật dữ liệu lên Web và App di động.'
      }
    ]
  },
  {
    id: 'pump',
    number: 16,
    ageBands: ['band-b', 'band-c'],
    title: {
      vi: 'Máy Bơm Nước Tự Động Hồi Tiếp Rơ-le (Smart Pump)',
      en: 'Automatic Water Pump (Relay Hysteresis)'
    },
    desc: {
      vi: 'Điều khiển máy bơm nước qua Rơ-le với logic trễ (Hysteresis): Mức nước <= 20% bật bơm, >= 90% ngắt bơm chống tràn.',
      en: 'Relay pump control with hysteresis: Water level <= 20% activates pump, >= 90% cuts off to prevent overflow.'
    },
    hardware: {
      vi: 'Đầu dò mực nước / Độ ẩm đất (GPIO 34 ADC), Mô-đun Rơ-le cơ 5V/3.3V cách ly quang (GPIO 26), Máy bơm mini 5V',
      en: 'Water level/Moisture probe (GPIO 34), Optoisolated Relay module (GPIO 26), 5V Mini Submersible Pump'
    },
    pedagogy: {
      vi: 'Khái niệm điều khiển hồi tiếp trễ (Hysteresis) chống rung giật rơ-le (chattering) và cách ly điện quang.',
      en: 'Hysteresis control loop preventing relay chattering, optoisolation, and fluid dynamics.'
    },
    defaultParams: { waterLevel: 15, pumpActive: false },
    simConfig: { type: 'smart-pump', lowThreshold: 20, highThreshold: 90, pumpSpeedPerSec: 5 },
    storyCards: [
      {
        icon: '🚰',
        titleVi: 'Máy Bơm Chống Hạn Chống Tràn',
        titleEn: 'Smart Water Pump',
        textVi: 'Nước cạn dưới 20% là máy bơm tự động hút nước! Khi nước đầy 90% thì tự ngắt chống tràn!',
        textEn: 'When water drops <= 20%, pump starts filling! When full >= 90%, it stops to avoid overflow!'
      }
    ],
    blocks: [
      { type: 'pump_hysteresis_control', low: 20, high: 90, label: 'Điều khiển trễ: Bật <= 20%, Tắt >= 90%' }
    ],
    codeCpp: `const int SENSOR_PIN = 34; // Input Only
const int RELAY_PIN = 26;
bool pumpState = false;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  float waterPercent = (raw / 4095.0) * 100.0;
  
  if (waterPercent <= 20.0) {
    pumpState = true;  // Nước cạn -> Bật bơm
  } else if (waterPercent >= 90.0) {
    pumpState = false; // Đầy bình -> Tắt bơm
  }
  // Nếu ở khoảng 20% < H < 90%: Giữ nguyên trạng thái trước
  
  digitalWrite(RELAY_PIN, pumpState ? HIGH : LOW);
  delay(200);
}`,
    codePy: `from machine import Pin, ADC
import time

sensor = ADC(Pin(34))
relay = Pin(26, Pin.OUT)
pump_state = False

while True:
    h = (sensor.read() / 4095) * 100
    if h <= 20:
        pump_state = True
    elif h >= 90:
        pump_state = False
    relay.value(1 if pump_state else 0)
    time.sleep_ms(200)
`,
    schematic: {
      diagram: 'Cảm biến mức nước -> GPIO 34 (ADC1); GPIO 26 -> Optocoupler -> Cuộn hút Rơ-le 5V; Tiếp điểm NO -> Bơm 12V/5V',
      rails: ['3V3', 'GPIO 34', 'GPIO 26', 'Relay COM/NO', 'GND']
    },
    parts: [
      { id: 'relay-5v', name: 'Optocoupler Relay Module', pin: 'GPIO 26', rating: '250VAC 10A / 30VDC 10A' },
      { id: 'water-sensor', name: 'Analog Water Depth Probe', pin: 'GPIO 34', rating: '0 - 40mm immersion' }
    ],
    quiz: [
      {
        q: 'Tại sao cần áp dụng logic trễ (Hysteresis) thay vì bật tắt tại một ngưỡng duy nhất (ví dụ 50%)?',
        options: ['Để tiết kiệm dây điện', 'Tránh hiện tượng rơ-le đóng ngắt liên tục (chattering) khi mặt nước dập dềnh', 'Làm nước chảy ngược', 'Tăng áp lực ống nước'],
        answer: 1,
        explain: 'Nếu dùng 1 ngưỡng duy nhất, dao động gợn sóng quanh ngưỡng sẽ khiến rơ-le đóng ngắt liên tục gây cháy tiếp điểm.'
      },
      {
        q: 'Theo RULE-008, khi mức nước H nằm trong khoảng từ 20% đến 90%, rơ-le hoạt động ra sao?',
        options: ['Luôn luôn tắt', 'Luôn luôn bật', 'Giữ nguyên trạng thái hoạt động trước đó', 'Chuyển sang chế độ nhấp nháy'],
        answer: 2,
        explain: 'Khoảng giữa 20% và 90% là vùng trễ (Deadband), hệ thống bảo toàn trạng thái trước đó.'
      },
      {
        q: 'Tiếp điểm Thường Mở (NO - Normally Open) của rơ-le có nghĩa là gì?',
        options: ['Bình thường khi chưa cấp điện cuộn hút thì mạch bị ngắt', 'Bình thường mạch luôn thông', 'Tiếp điểm bằng nhựa', 'Không thể kết nối'],
        answer: 0,
        explain: 'Normally Open (NO) nghĩa là khi rơ-le chưa kích hoạt thì mạch ngắt mở, chỉ đóng khi được cấp lệnh.'
      }
    ]
  },
  {
    id: 'keypad',
    number: 17,
    ageBands: ['band-c'],
    title: {
      vi: 'Khóa Cửa Mã Số An Toàn Bàn Phím 4x3 (Matrix Keypad Lock)',
      en: 'Matrix Keypad Door Lock (Security System)'
    },
    desc: {
      vi: 'Quét bàn phím ma trận 4x3, nhập mã PIN 4 chữ số, bấm # để mở khóa chốt Servo, khóa 10s nếu nhập sai 3 lần liên tiếp.',
      en: 'Scan 4x3 matrix keypad, enter 4-digit PIN, # validates, locks out for 10s after 3 consecutive wrong attempts.'
    },
    hardware: {
      vi: 'Bàn phím ma trận 4x3 (Hàng: GPIO 12, 14, 27, 26; Cột: GPIO 25, 33, 32), Động cơ chốt khóa Servo (GPIO 13), Còi chip',
      en: '4x3 Matrix Keypad (Rows: 12, 14, 27, 26; Cols: 25, 33, 32), Lock Servo (GPIO 13), Buzzer'
    },
    pedagogy: {
      vi: 'Thuật toán quét ma trận hàng/cột, đệm chuỗi ký tự, cơ chế chống tấn công dò mã (Brute-force lockout).',
      en: 'Matrix scanning multiplexing, string buffer management, and brute-force lockout defense.'
    },
    defaultParams: { secretPin: '1234', inputBuffer: '', failedAttempts: 0, isLockedOut: false },
    simConfig: { type: 'keypad-lock', correctPin: '1234', maxAttempts: 3, lockoutMs: 10000 },
    storyCards: [
      {
        icon: '🔐',
        titleVi: 'Két Sắt Bí Mật',
        titleEn: 'Secret Keypad Safe',
        textVi: 'Bấm mật khẩu 1-2-3-4 rồi nhấn phím # để mở khóa chốt két sắt thần kỳ!',
        textEn: 'Press 1-2-3-4 then # to unlock the secret high-security vault!'
      }
    ],
    blocks: [
      { type: 'keypad_scan', label: 'Quét phím ma trận 4x3' },
      { type: 'keypad_on_key', key: '#', label: 'Khi bấm phím xác nhận #' }
    ],
    codeCpp: `const String SECRET_PIN = "1234";
String inputBuffer = "";
int failedCount = 0;
unsigned long lockoutUntil = 0;

void onKeyPressed(char key) {
  if (millis() < lockoutUntil) return; // Đang bị khóa
  
  if (key == '*') {
    inputBuffer = ""; // Xóa bộ nhớ đệm
  } else if (key == '#') {
    if (inputBuffer == SECRET_PIN) {
      unlockServo();
      failedCount = 0;
    } else {
      failedCount++;
      if (failedCount >= 3) lockoutUntil = millis() + 10000; // Khóa 10s
    }
    inputBuffer = "";
  } else {
    if (inputBuffer.length() < 4) inputBuffer += key;
  }
}`,
    codePy: `secret_pin = "1234"
buffer = ""
failed = 0

def press(key):
    global buffer, failed
    if key == '*':
        buffer = ""
    elif key == '#':
        if buffer == secret_pin:
            print("UNLOCKED!")
            failed = 0
        else:
            failed += 1
            print("WRONG PIN! Failed count:", failed)
        buffer = ""
    else:
        if len(buffer) < 4:
            buffer += str(key)
`,
    schematic: {
      diagram: '4 Hàng (R1..R4) nối GPIO 12, 14, 27, 26; 3 Cột (C1..C3) nối GPIO 25, 33, 32; Servo chốt nối GPIO 13',
      rails: ['Rows: Pull-up', 'Cols: Open drain scan', 'GND']
    },
    parts: [
      { id: 'matrix-keypad', name: '4x3 Membrane Keypad', pin: '7 GPIOs', rating: 'Multiplexed matrix' }
    ],
    quiz: [
      {
        q: 'Bàn phím ma trận 4 hàng 3 cột (tổng cộng 12 phím) chỉ cần bao nhiêu chân GPIO để điều khiển?',
        options: ['12 chân', '7 chân (4 hàng + 3 cột)', '2 chân', '24 chân'],
        answer: 1,
        explain: 'Bằng kỹ thuật quét ma trận, số chân tiết kiệm được là: 4 + 3 = 7 chân GPIO.'
      },
      {
        q: 'Theo RULE-008, khi người dùng bấm phím dấu sao (*), hệ thống thực hiện thao tác gì?',
        options: ['Mở cửa ngay lập tức', 'Xóa toàn bộ chuỗi số đã nhập trong bộ đệm và phát tiếng bíp 2000Hz', 'Khóa bàn phím vĩnh viễn', 'Tắt nguồn ESP32'],
        answer: 1,
        explain: 'Phím * đóng vai trò phím Clear để người dùng nhập lại từ đầu nếu lỡ bấm nhầm.'
      },
      {
        q: 'Nếu nhập sai mã PIN liên tiếp 3 lần, hệ thống sẽ bảo vệ như thế nào?',
        options: ['Khóa nhập trong 10 đến 30 giây để chống tấn công dò mã (Brute-force)', 'Hỏng luôn mạch', 'Tự động gửi email', 'Đổi mật mã thành 0000'],
        answer: 0,
        explain: 'Khóa tạm thời chống việc kẻ gian sử dụng phần mềm hoặc bấm thử liên tục để dò mã số.'
      }
    ]
  },
  {
    id: 'solar',
    number: 18,
    ageBands: ['band-c'],
    title: {
      vi: 'Pin Năng Lượng Mặt Trời Hướng Nắng Kép (Solar Tracker)',
      en: 'Dual-Axis Solar Tracker (Dual LDR)'
    },
    desc: {
      vi: 'Sử dụng 2 cảm biến quang trở so lệch và động cơ Servo để tự động xoay tấm pin hướng thẳng về vị trí mặt trời sáng nhất.',
      en: 'Dual differential LDRs and Servo to track the sun azimuth for maximum solar efficiency.'
    },
    hardware: {
      vi: '2 Cảm biến LDR (Trái GPIO 32, Phải GPIO 33), Động cơ Servo xoay trục (GPIO 18), Tấm pin quang điện mô hình',
      en: '2 LDRs (Left 32, Right 33), Pan Servo (GPIO 18), Solar panel model'
    },
    pedagogy: {
      vi: 'Điều khiển vi sai (Differential Control), vùng chết (Deadband) chống dao động tiêu hao cơ khí và tối ưu năng lượng xanh.',
      en: 'Differential error delta = LDR_left - LDR_right, deadband hysteresis, and green energy optimization.'
    },
    defaultParams: { sunAngle: 90, panelAngle: 45, deadband: 15 },
    simConfig: { type: 'solar-tracker', minAngle: 10, maxAngle: 170, deadband: 15 },
    storyCards: [
      {
        icon: '🌻',
        titleVi: 'Hoa Hướng Dương Điện Tử',
        titleEn: 'Electronic Sunflower',
        textVi: 'Kéo ông mặt trời sang trái hay sang phải: tấm pin sẽ tự ngoái đầu hướng về phía có nhiều nắng nhất!',
        textEn: 'Drag the sun left or right: the solar panel rotates toward the brightest spot!'
      }
    ],
    blocks: [
      { type: 'solar_track_step', label: 'So sánh 2 cảm biến LDR và xoay Servo bám nắng' }
    ],
    codeCpp: `const int PIN_LDR_LEFT = 32;
const int PIN_LDR_RIGHT = 33;
const int SERVO_PIN = 18;
int currentAngle = 90;
const int DEADBAND = 15;

void stepTracking() {
  int leftVal = analogRead(PIN_LDR_LEFT);
  int rightVal = analogRead(PIN_LDR_RIGHT);
  int diff = leftVal - rightVal;
  
  if (abs(diff) > DEADBAND) {
    if (diff > 0 && currentAngle < 170) currentAngle += 1;
    else if (diff < 0 && currentAngle > 10) currentAngle -= 1;
    // Ghi góc mới vào Servo
  }
}`,
    codePy: `deadband = 15
angle = 90

def track(left_val, right_val):
    global angle
    diff = left_val - right_val
    if abs(diff) > deadband:
        if diff > 0 and angle < 170:
            angle += 1
        elif diff < 0 and angle > 10:
            angle -= 1
    return angle
`,
    schematic: {
      diagram: '2 LDR phân áp ngăn cách bởi vách thẳng đứng -> GPIO 32, 33; Servo xoay giá đỡ -> GPIO 18',
      rails: ['3V3', 'GPIO 32 (ADC1)', 'GPIO 33 (ADC1)', 'GPIO 18', 'GND']
    },
    parts: [
      { id: 'dual-ldr', name: 'Dual LDR Sensor Rig', pin: 'GPIO 32, 33', rating: 'Matched pair' }
    ],
    quiz: [
      {
        q: 'Tại sao cần có vách ngăn màu đen ở giữa hai cảm biến quang trở của hệ thống bám mặt trời?',
        options: ['Để làm đẹp', 'Để tạo bóng râm so lệch rõ rệt khi mặt trời lệch góc', 'Để làm nóng tấm pin', 'Để đo nhiệt độ'],
        answer: 1,
        explain: 'Vách ngăn tạo vùng bóng râm đổ lên cảm biến bên khuất, giúp tăng độ chênh lệch delta L rõ rệt.'
      },
      {
        q: 'Vùng chết (Deadband) trong thuật toán bám mặt trời có ý nghĩa gì?',
        options: ['Khi chênh lệch nhỏ hơn ngưỡng, động cơ dừng yên không rung lắc liên tục', 'Vùng pin bị hỏng', 'Thời gian ban đêm', 'Khi đứt dây điện'],
        answer: 0,
        explain: 'Deadband tránh việc động cơ cứ quay lắc lư qua lại 1 độ liên tục, giúp bảo vệ nhông bánh răng và tiết kiệm pin.'
      },
      {
        q: 'Góc quay của động cơ Servo trong hệ thống bám mặt trời được khống chế trong giới hạn an toàn nào?',
        options: ['Từ 10 độ đến 170 độ', 'Từ 0 đến 3600 độ', 'Không giới hạn', 'Chỉ quay 45 độ'],
        answer: 0,
        explain: 'Theo đặc tả RULE-008, góc quay được kẹp trong dải an toàn [10°, 170°] để dây dẫn không bị xoắn đứt.'
      }
    ]
  },
  {
    id: 'radar',
    number: 19,
    ageBands: ['band-c'],
    title: {
      vi: 'Radar Siêu Âm Quét Góc Tọa Độ Cực (Ultrasonic Radar)',
      en: '180° Ultrasonic Radar (Polar Sweep)'
    },
    desc: {
      vi: 'Servo quay cảm biến siêu âm quét từ 0° sang 180° vẽ bản đồ tọa độ cực (Polar Plot) với hiệu ứng phốt-pho phát hiện vật cản.',
      en: 'Servo sweeps ultrasonic sensor 0° to 180°, rendering green phosphor polar map and target blips.'
    },
    hardware: {
      vi: 'Động cơ Servo xoay quét (GPIO 14), Cảm biến siêu âm HC-SR04P (Trig GPIO 12, Echo GPIO 13), Màn hình hiển thị radar',
      en: 'Sweep Servo (GPIO 14), HC-SR04P (Trig 12, Echo 13), Radar polar display'
    },
    pedagogy: {
      vi: 'Hệ tọa độ cực (r, theta) đổi sang tọa độ Descartes (x = r*cos, y = r*sin), quét liên tục và thị giác máy.',
      en: 'Polar coordinates (r, theta) to Cartesian conversion (x=r*cos, y=r*sin) and spatial sensing.'
    },
    defaultParams: { sweepAngle: 90, sweepDir: 1, targetDist: 45 },
    simConfig: { type: 'ultrasonic-radar', maxRangeCm: 100, sweepStep: 2 },
    storyCards: [
      {
        icon: '📡',
        titleVi: 'Màn Hình Radar Quân Sự',
        titleEn: 'Naval Radar Sweep',
        textVi: 'Cần radar quét qua quét lại 180 độ, vật cản phát hiện được sẽ lóe lên đốm sáng xanh lục kỳ bí!',
        textEn: 'Radar sweeps 180 degrees back and forth, blipping detected targets on green phosphor screen!'
      }
    ],
    blocks: [
      { type: 'radar_sweep_step', step: 2, label: 'Quét góc Servo 2 độ và đo khoảng cách' }
    ],
    codeCpp: `#include <ESP32Servo.h>

Servo radarServo;
const int TRIG_PIN = 12;
const int ECHO_PIN = 13;
int angle = 0;
int dir = 1;

void setup() {
  Serial.begin(115200);
  radarServo.attach(14);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  radarServo.write(angle);
  delay(30);
  
  // Đo khoảng cách
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long dist = pulseIn(ECHO_PIN, HIGH) * 0.0343 / 2;
  
  Serial.printf("%d,%ld.\\n", angle, dist);
  
  angle += dir * 2;
  if (angle >= 180 || angle <= 0) dir = -dir;
}`,
    codePy: `angle = 0
direction = 1

def next_sweep():
    global angle, direction
    angle += direction * 2
    if angle >= 180:
        angle = 180
        direction = -1
    elif angle <= 0:
        angle = 0
        direction = 1
    return angle
`,
    schematic: {
      diagram: 'ESP32 GPIO 14 -> Servo PWM; HC-SR04P Trig -> GPIO 12, Echo -> GPIO 13, Nguồn 5V/3.3V, GND',
      rails: ['3V3', '5V', 'GPIO 14', 'GPIO 12', 'GPIO 13', 'GND']
    },
    parts: [
      { id: 'radar-head', name: 'Rotating HC-SR04 Mount', pin: 'GPIO 12, 13, 14', rating: '180 deg sweep capability' }
    ],
    quiz: [
      {
        q: 'Để đổi từ tọa độ cực (r, góc θ) sang tọa độ Descartes (x, y) trên màn hình radar, ta dùng công thức toán học nào?',
        options: ['x = r * cos(θ), y = r * sin(θ)', 'x = r + θ, y = r - θ', 'x = r * r, y = θ * θ', 'x = r / θ, y = θ / r'],
        answer: 0,
        explain: 'Theo hình học lượng giác: tọa độ hoành độ x = r*cos(theta), tung độ y = r*sin(theta).'
      },
      {
        q: 'Màu sắc truyền thống của màn hình quét radar quân sự cổ điển là màu gì?',
        options: ['Màu vàng', 'Màu xanh lục phát quang (Green Phosphor)', 'Màu hồng', 'Màu nâu'],
        answer: 1,
        explain: 'Ống tia âm cực CRT radar cổ điển dùng chất lân quang P7 màu xanh lục có thời gian lưu ảnh lâu.'
      },
      {
        q: 'Tầm quét phát hiện vật thể khả dụng của radar trong bài học mô phỏng theo RULE-008 là bao nhiêu?',
        options: ['Tối đa 100 cm (1 mét)', '1000 km', '10 mm', '2000 mét'],
        answer: 0,
        explain: 'Theo RULE-008, khoảng cách phát hiện hiển thị trên radar quét là d <= 100 cm.'
      }
    ]
  },
  {
    id: 'stepper',
    number: 20,
    ageBands: ['band-c'],
    title: {
      vi: 'Cánh Tay Gắp Phôi Động Cơ Bước (Pick & Place Stepper)',
      en: 'Pick & Place Stepper (Precision Axis)'
    },
    desc: {
      vi: 'Động cơ bước vít me 200 bước/vòng (pitch 8mm) điều khiển định vị tọa độ chính xác cao và nam châm điện gắp phôi cơ khí.',
      en: '200 steps/rev leadscrew stepper (8mm pitch) for precision positioning and electromagnet gripper.'
    },
    hardware: {
      vi: 'Động cơ bước NEMA17, Mạch điều khiển A4988 / DRV8825 (STEP GPIO 19, DIR GPIO 21), Nam châm điện 5V (GPIO 22)',
      en: 'NEMA17 Stepper, A4988 driver (STEP 19, DIR 21), Electromagnet tool (GPIO 22)'
    },
    pedagogy: {
      vi: 'Điều khiển vị trí vi bước (Microstepping), công thức dịch chuyển tuyến tính x = (steps/200)*8mm và thư viện AccelStepper.',
      en: 'Lead screw kinematics x = (steps/200)*8mm, acceleration profiles, and industrial automation.'
    },
    defaultParams: { targetPosMm: 80, currentSteps: 2000, magnetOn: false },
    simConfig: { type: 'stepper-pick-place', stepsPerRev: 200, pitchMm: 8, maxLinearMm: 200 },
    storyCards: [
      {
        icon: '🤖',
        titleVi: 'Robot Nhà Máy Tương Lai',
        titleEn: 'Industrial Pick & Place',
        textVi: 'Cánh tay trượt tịnh tiến chính xác từng li, bật nam châm hút viên bi rồi đưa vào khay chuẩn xác!',
        textEn: 'Precision axis moves millimeter by millimeter, magnets pick steel ball and drop into tray!'
      }
    ],
    blocks: [
      { type: 'stepper_move_to_mm', pos: 100, label: 'Di chuyển trục tới vị trí 100mm' },
      { type: 'magnet_toggle', state: 'ON', label: 'Bật nam châm điện gắp phôi' }
    ],
    codeCpp: `#include <AccelStepper.h>

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
  // Đi tới vị trí gắp 100mm = (100 / 8) * 200 = 2500 bước
  stepper.moveTo(2500);
  stepper.runToPosition();
  
  digitalWrite(MAGNET_PIN, HIGH); // Hút phôi
  delay(1000);
  
  // Về vị trí thả 0mm
  stepper.moveTo(0);
  stepper.runToPosition();
  
  digitalWrite(MAGNET_PIN, LOW); // Thả phôi
  delay(2000);
}`,
    codePy: `steps_per_rev = 200
pitch_mm = 8.0

def mm_to_steps(mm):
    return int((mm / pitch_mm) * steps_per_rev)

def steps_to_mm(steps):
    return (steps / steps_per_rev) * pitch_mm
`,
    schematic: {
      diagram: 'ESP32 STEP GPIO 19, DIR GPIO 21 -> Driver A4988 -> NEMA17; GPIO 22 -> MOSFET -> Nam châm điện 5V/12V',
      rails: ['3V3 Logic', '12V Motor Power', '5V Magnet', 'GND']
    },
    parts: [
      { id: 'stepper-nema17', name: 'NEMA 17 Bipolar Stepper', pin: 'A4988 STEP/DIR', rating: '200 steps/rev, 1.8 deg' },
      { id: 'electromagnet', name: '5V Holding Electromagnet', pin: 'GPIO 22 via MOSFET', rating: 'Holding force 2.5kg' }
    ],
    quiz: [
      {
        q: 'Với động cơ bước 200 bước/vòng gắn trên trục vít me bước ren 8mm/vòng, 1 bước động cơ tương đương dịch chuyển bao nhiêu mm?',
        options: ['0.04 mm', '8 mm', '1 mm', '0.4 mm'],
        answer: 0,
        explain: '8 mm / 200 bước = 0.04 mm cho mỗi bước nguyên (độ chính xác định vị rất cao).'
      },
      {
        q: 'Để di chuyển trục tuyến tính một đoạn đường x = 80mm, động cơ bước cần quay tổng cộng bao nhiêu bước?',
        options: ['2000 bước (10 vòng)', '200 bước', '80 bước', '10000 bước'],
        answer: 0,
        explain: 'x = (steps / 200) * 8 => steps = (80 / 8) * 200 = 2000 bước (tương đương 10 vòng quay).'
      },
      {
        q: 'Ưu điểm chính của động cơ bước so với động cơ DC thông thường trong các cánh tay robot là gì?',
        options: ['Khả năng điều khiển vị trí góc và số bước chính xác mà không cần cảm biến góc (Open-loop control)', 'Chạy nhanh hơn tên lửa', 'Không cần nguồn điện', 'Giá rẻ hơn pin'],
        answer: 0,
        explain: 'Động cơ bước quay từng bước góc xác định (1.8°), cho phép định vị tọa độ chính xác tuyệt đối theo số xung cấp vào.'
      }
    ]
  }
];

export default LESSONS;
