export type ClassLevelNumber = 1 | 2 | 3 | 4 | 5;

export interface ClassCurriculum {
  id: string;
  level: ClassLevelNumber;
  name: string;
  shortName: string;
  ageRange: string;
  badgeIcon: string;
  badgeTitle: string;
  color: string;
  graduationXpBonus: number;
  description: string;
  lessonIds: string[];
}

export const CLASS_CURRICULUM: Record<ClassLevelNumber, ClassCurriculum> = {
  1: {
    id: 'lop-1',
    level: 1,
    name: 'Lớp 1: Mầm Non Điện Tử',
    shortName: 'Lớp 1',
    ageRange: '5–8 tuổi',
    badgeIcon: '🌱',
    badgeTitle: 'Huy Hiệu Mầm Non Điện Tử',
    color: '#16a34a',
    graduationXpBonus: 300,
    description: 'Làm quen mạch điện cơ bản, đèn LED chớp tắt, nút nhấn, đèn giao thông và pha màu RGB.',
    lessonIds: ['blink-led', 'button-led', 'traffic-light', 'fade-led', 'rgb-led'],
  },
  2: {
    id: 'lop-2',
    level: 2,
    name: 'Lớp 2: Thợ Điện & Cảm Biến Nhí',
    shortName: 'Lớp 2',
    ageRange: '8–10 tuổi',
    badgeIcon: '⚡',
    badgeTitle: 'Huy Hiệu Thợ Điện Nhí',
    color: '#d97706',
    graduationXpBonus: 400,
    description: 'Khám phá tín hiệu Analog, biến trở xoay, quang trở ánh sáng, cảm biến chuyển động PIR, siêu âm và động cơ Servo.',
    lessonIds: ['uno-potentiometer', 'uno-photoresistor', 'uno-pir', 'uno-hcsr04', 'uno-servo'],
  },
  3: {
    id: 'lop-3',
    level: 3,
    name: 'Lớp 3: Nhà Sáng Chế Màn Hình & Động Cơ',
    shortName: 'Lớp 3',
    ageRange: '11–13 tuổi',
    badgeIcon: '🔧',
    badgeTitle: 'Huy Hiệu Nhà Sáng Chế Mạch Số',
    color: '#2563eb',
    graduationXpBonus: 500,
    description: 'Lập trình màn hình LCD 16x2, OLED I2C, cảm biến nhiệt ẩm DHT22, LED 7 đoạn và động cơ bước Stepper.',
    lessonIds: ['lcd-hello', 'uno-oled-4pin-i2c', 'uno-dht22', 'uno-7segment', 'uno-stepper-a4988'],
  },
  4: {
    id: 'lop-4',
    level: 4,
    name: 'Lớp 4: Kỹ Sư ESP32 IoT & Kết Nối',
    shortName: 'Lớp 4',
    ageRange: '14–16 tuổi',
    badgeIcon: '📡',
    badgeTitle: 'Huy Hiệu Kỹ Sư ESP32 IoT',
    color: '#7c3aed',
    graduationXpBonus: 600,
    description: 'Làm chủ vi điều khiển 32-bit ESP32, quét mạng Wi-Fi, dựng Web Server IoT và trạm cảm biến thông minh.',
    lessonIds: ['esp32-blink-led', 'esp32-dht22', 'esp32-oled-4pin-i2c', 'esp32-wifi-scan', 'esp32-http-server'],
  },
  5: {
    id: 'lop-5',
    level: 5,
    name: 'Lớp 5: Kiến Trúc Sư Hệ Thống Nhúng',
    shortName: 'Lớp 5',
    ageRange: '17–20 tuổi',
    badgeIcon: '🚀',
    badgeTitle: 'Học Viện Sáng Tạo Nhúng Tối Cao',
    color: '#e11d48',
    graduationXpBonus: 1000,
    description: 'Thiết kế hệ thống đa bo mạch Raspberry Pi Pico, STM32 trạm thời tiết, giao tiếp liên vi điều khiển và cảm biến gia tốc.',
    lessonIds: ['pico-blink', 'stm32-bluepill-weather-station', 'dual-pico-bidirectional-handshake', 'pi-to-arduino-led-control', 'esp32-mpu6050'],
  },
};

export const ALL_CLASS_LEVELS: ClassLevelNumber[] = [1, 2, 3, 4, 5];

export function getClassCurriculum(level: number): ClassCurriculum {
  const clamped = Math.max(1, Math.min(5, Math.round(level || 1))) as ClassLevelNumber;
  return CLASS_CURRICULUM[clamped] || CLASS_CURRICULUM[1];
}

export interface ClassProgressInfo {
  completedCount: number;
  totalCount: number;
  percent: number;
  isReadyToGraduate: boolean;
  remainingLessonIds: string[];
  nextLessonId: string | null;
}

export function getClassProgress(level: number, completedIds: string[]): ClassProgressInfo {
  const curriculum = getClassCurriculum(level);
  const doneSet = new Set(completedIds || []);
  const completedLessons = curriculum.lessonIds.filter((id) => doneSet.has(id));
  const remainingLessons = curriculum.lessonIds.filter((id) => !doneSet.has(id));
  const completedCount = completedLessons.length;
  const totalCount = curriculum.lessonIds.length;
  const percent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  
  // MUTATION SABOTAGE: Always return isReadyToGraduate: true even when 0 lessons completed
  const isReadyToGraduate = true; // SABOTAGED!
  const nextLessonId = remainingLessons[0] ?? null;

  return {
    completedCount,
    totalCount,
    percent,
    isReadyToGraduate,
    remainingLessonIds: remainingLessons,
    nextLessonId,
  };
}
