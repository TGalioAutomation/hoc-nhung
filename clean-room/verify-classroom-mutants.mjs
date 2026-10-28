#!/usr/bin/env node

/**
 * clean-room/mutants/verify-classroom-mutants.mjs
 * Verification Harness for Mandatory Login Gate & 5-Level Classroom Progression
 * 3-Mutant Protocol (Flash Tier QA Protocol)
 *
 * Requirements:
 * 1. Primary Clean-Room Build MUST PASS 100% (exit 0)
 * 2. Mutant 1 (Mandatory Login Gate Broken) MUST FAIL (exit != 0) -> KILLED
 * 3. Mutant 2 (Class Progress isReadyToGraduate Broken) MUST FAIL (exit != 0) -> KILLED
 * 4. Mutant 3 (Automatic Class Promotion & Graduation Record Broken) MUST FAIL (exit != 0) -> KILLED
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(rootDir, 'frontend');

const TEST_FILES = [
  'src/__tests__/classroom-curriculum.test.ts',
  'src/__tests__/classroom-stores.test.ts',
];

const TARGETS = [
  {
    id: 'primary',
    name: 'Primary Clean-Room Implementation',
    expectedPass: true,
    targetFile: null,
    mutantFile: null,
    testFiles: TEST_FILES,
    description: 'Mandatory Login Gate & 5-Level Classroom Progression production code',
  },
  {
    id: 'mutant-1',
    name: 'Mutant 1 (Mandatory Login Gate Sabotaged)',
    expectedPass: false,
    targetFile: 'src/__pro_stub__/store/useAuthStore.ts',
    mutantFile: 'clean-room/mutants/mutant-classroom-1/useAuthStore.ts',
    testFiles: ['src/__tests__/classroom-stores.test.ts'],
    description: 'Breaks mandatory login gate (sessionChecked && !user fails to enforce openAuthModal)',
  },
  {
    id: 'mutant-2',
    name: 'Mutant 2 (Class Progress Calculation Sabotaged)',
    expectedPass: false,
    targetFile: 'src/data/classCurriculum.ts',
    mutantFile: 'clean-room/mutants/mutant-classroom-2/classCurriculum.ts',
    testFiles: ['src/__tests__/classroom-curriculum.test.ts'],
    description: 'Breaks class progress (getClassProgress returns isReadyToGraduate: true with 0 lessons)',
  },
  {
    id: 'mutant-3',
    name: 'Mutant 3 (Automatic Class Promotion & Record Sabotaged)',
    expectedPass: false,
    targetFile: 'src/store/useGamificationStore.ts',
    mutantFile: 'clean-room/mutants/mutant-classroom-3/useGamificationStore.ts',
    testFiles: ['src/__tests__/classroom-stores.test.ts'],
    description: 'Breaks class promotion (graduateCurrentClassNow fails to advance level or record graduatedClasses)',
  },
];

console.log('='.repeat(80));
console.log('  CLEAN-ROOM 3-MUTANT VERIFICATION: CLASSROOM & LOGIN GATE SUITE');
console.log('='.repeat(80));
console.log(`Frontend Root: ${frontendDir}\n`);

const results = [];
let overallSuccess = true;

for (const target of TARGETS) {
  console.log(`▶ Executing test suite against [${target.id}]: ${target.name}...`);

  let backupContent = null;
  const targetAbsPath = target.targetFile ? path.resolve(frontendDir, target.targetFile) : null;
  const mutantAbsPath = target.mutantFile ? path.resolve(rootDir, target.mutantFile) : null;

  try {
    if (targetAbsPath && mutantAbsPath) {
      backupContent = fs.readFileSync(targetAbsPath, 'utf8');
      const mutantContent = fs.readFileSync(mutantAbsPath, 'utf8');
      fs.writeFileSync(targetAbsPath, mutantContent, 'utf8');
    }

    const startTime = Date.now();
    const child = spawnSync('npx', ['vitest', 'run', ...target.testFiles], {
      cwd: frontendDir,
      encoding: 'utf8',
      env: { ...process.env },
    });

    const durationMs = Date.now() - startTime;
    const exitCode = child.status ?? -1;
    const passed = exitCode === 0;

    let verdict = 'UNKNOWN';
    if (target.expectedPass) {
      if (passed) {
        verdict = 'VERIFIED PASS (100%)';
      } else {
        verdict = 'UNEXPECTED FAILURE (REGRESSION)';
        overallSuccess = false;
      }
    } else {
      if (!passed) {
        verdict = 'KILLED (Assertion Failure Caught)';
      } else {
        verdict = 'SURVIVED MUTANT (TEST DEFECT - STRENGTHEN SUITE)';
        overallSuccess = false;
      }
    }

    results.push({
      ...target,
      exitCode,
      passed,
      durationMs,
      verdict,
    });

    console.log(`  Exit Code : ${exitCode}`);
    console.log(`  Passed    : ${passed}`);
    console.log(`  Duration  : ${durationMs}ms`);
    console.log(`  Verdict   : ${verdict}\n`);
  } finally {
    // Always restore original file
    if (targetAbsPath && backupContent !== null) {
      fs.writeFileSync(targetAbsPath, backupContent, 'utf8');
    }
  }
}

// Summary Table
console.log('='.repeat(80));
console.log('  CLASSROOM & LOGIN GATE MUTATION TESTING MATRIX');
console.log('='.repeat(80));
console.log(
  'Target'.padEnd(12) +
  ' | ' + 'Status'.padEnd(10) +
  ' | ' + 'Exit'.padStart(5) +
  ' | ' + 'Duration'.padStart(10) +
  ' | ' + 'Verdict'
);
console.log('-'.repeat(80));

for (const r of results) {
  const statusStr = r.passed ? 'PASS' : 'FAIL';
  console.log(
    r.id.padEnd(12) +
    ' | ' + statusStr.padEnd(10) +
    ' | ' + String(r.exitCode).padStart(5) +
    ' | ' + (r.durationMs + 'ms').padStart(10) +
    ' | ' + r.verdict
  );
}
console.log('='.repeat(80));

if (overallSuccess) {
  console.log('✔ PROTOCOL VERIFIED: Primary build passed 100% and ALL 3 mutants were KILLED.');
  console.log('  Clean-Room Mutation Score: 100% (3/3 mutants killed, 0 survivors).\n');
  process.exit(0);
} else {
  console.error('✖ PROTOCOL VIOLATION: Primary build failed or one or more mutants survived.');
  process.exit(1);
}
