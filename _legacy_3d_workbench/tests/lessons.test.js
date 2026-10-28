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
          /pinMode|attach|ledc|PIN_|analogRead|digitalWrite/i.test(lesson.codeCpp),
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
