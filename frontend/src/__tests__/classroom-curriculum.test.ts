import { describe, it, expect } from 'vitest';
import {
  CLASS_CURRICULUM,
  ALL_CLASS_LEVELS,
  getClassCurriculum,
  getClassProgress,
} from '../data/classCurriculum';
import { exampleProjects } from '../data/examples';

describe('Chương Trình 5 Cấp Lớp Học (Classroom Curriculum Verification)', () => {
  it('định nghĩa chính xác 5 cấp lớp (Lớp 1 đến Lớp 5)', () => {
    expect(ALL_CLASS_LEVELS).toEqual([1, 2, 3, 4, 5]);
    expect(Object.keys(CLASS_CURRICULUM).length).toBe(5);
  });

  it('mỗi cấp lớp có tên, huy hiệu, độ tuổi, màu sắc, điểm thưởng XP và danh sách bài học đầy đủ', () => {
    for (const level of ALL_CLASS_LEVELS) {
      const curriculum = getClassCurriculum(level);
      expect(curriculum.level).toBe(level);
      expect(curriculum.name.length).toBeGreaterThan(0);
      expect(curriculum.shortName).toBe(`Lớp ${level}`);
      expect(curriculum.badgeIcon.length).toBeGreaterThan(0);
      expect(curriculum.badgeTitle.length).toBeGreaterThan(0);
      expect(curriculum.ageRange.length).toBeGreaterThan(0);
      expect(curriculum.color.length).toBeGreaterThan(0);
      expect(curriculum.graduationXpBonus).toBeGreaterThanOrEqual(300);
      expect(curriculum.lessonIds.length).toBe(5);
    }
  });

  it('toàn bộ 25 bài học trong 5 cấp lớp đều tồn tại thực tế trong exampleProjects', () => {
    const validExampleIds = new Set(exampleProjects.map((ex) => ex.id));
    for (const level of ALL_CLASS_LEVELS) {
      const curriculum = getClassCurriculum(level);
      for (const lessonId of curriculum.lessonIds) {
        expect(validExampleIds.has(lessonId)).toBe(true);
      }
    }
  });

  it('hàm getClassProgress tính toán chính xác phần trăm tiến độ và điều kiện tốt nghiệp', () => {
    const level1 = getClassCurriculum(1);
    const id1 = level1.lessonIds[0];
    const id2 = level1.lessonIds[1];
    const id3 = level1.lessonIds[2];
    const id4 = level1.lessonIds[3];
    const id5 = level1.lessonIds[4];

    // Chưa học bài nào
    const p0 = getClassProgress(1, []);
    expect(p0.completedCount).toBe(0);
    expect(p0.totalCount).toBe(5);
    expect(p0.percent).toBe(0);
    expect(p0.isReadyToGraduate).toBe(false);
    expect(p0.nextLessonId).toBe(id1);

    // Học 1 bài
    const p1 = getClassProgress(1, [id1]);
    expect(p1.completedCount).toBe(1);
    expect(p1.percent).toBe(20);
    expect(p1.isReadyToGraduate).toBe(false);
    expect(p1.nextLessonId).toBe(id2);

    // Học 4 bài
    const p4 = getClassProgress(1, [id1, id2, id3, id4]);
    expect(p4.completedCount).toBe(4);
    expect(p4.percent).toBe(80);
    expect(p4.isReadyToGraduate).toBe(false);
    expect(p4.nextLessonId).toBe(id5);

    // Học đủ 5 bài -> Tốt nghiệp
    const p5 = getClassProgress(1, [id1, id2, id3, id4, id5]);
    expect(p5.completedCount).toBe(5);
    expect(p5.percent).toBe(100);
    expect(p5.isReadyToGraduate).toBe(true);
    expect(p5.nextLessonId).toBeNull();
  });
});
