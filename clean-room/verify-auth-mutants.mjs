#!/usr/bin/env node

/**
 * clean-room/verify-auth-mutants.mjs
 * Verification Harness for Account Management & Universal Pro Unlock
 * 3-Mutant Protocol (Flash Tier QA Protocol)
 *
 * Requirements:
 * 1. Primary Clean-Room Build MUST PASS 100% (exit 0)
 * 2. Mutant 1 (isPro Invariant Broken) MUST FAIL (exit != 0)
 * 3. Mutant 2 (Board Gate Block Inverted) MUST FAIL (exit != 0)
 * 4. Mutant 3 (MicroSD & Flash Gates Blocked) MUST FAIL (exit != 0)
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(rootDir, 'frontend');

const TARGETS = [
  {
    id: 'primary',
    name: 'Primary Clean-Room Implementation',
    expectedPass: true,
    targetFile: null,
    mutantFile: null,
    description: '100% Universal Pro Unlock & Auth Store production implementation',
  },
  {
    id: 'mutant-1',
    name: 'Mutant 1 (isPro Invariant Sabotaged)',
    expectedPass: false,
    targetFile: 'src/__pro_stub__/store/useAuthStore.ts',
    mutantFile: 'clean-room/mutants/mutant-auth-1/useAuthStore.ts',
    description: 'Inverts is_pro to false, defaults guest state to Free/Locked',
  },
  {
    id: 'mutant-2',
    name: 'Mutant 2 (Pro Board Gate Sabotaged)',
    expectedPass: false,
    targetFile: 'src/lib/proUnlockInit.ts',
    mutantFile: 'clean-room/mutants/mutant-auth-2/proUnlockInit.ts',
    description: 'Sabotages boardGateVerdict to block STM32 and Raspberry Pi runs',
  },
  {
    id: 'mutant-3',
    name: 'Mutant 3 (MicroSD & Flash Gates Sabotaged)',
    expectedPass: false,
    targetFile: 'src/lib/proUnlockInit.ts',
    mutantFile: 'clean-room/mutants/mutant-auth-3/proUnlockInit.ts',
    description: 'Inverts sdCardUploadAllowed and hardwareFlashAllowed to false',
  },
];

console.log('='.repeat(80));
console.log('  CLEAN-ROOM 3-MUTANT VERIFICATION: ACCOUNT & PRO UNLOCK SUITE');
console.log('='.repeat(80));
console.log(`Working Directory: ${frontendDir}\n`);

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
    const child = spawnSync('npx', ['vitest', 'run', 'src/__tests__/pro-auth-unlock.test.ts'], {
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
    // Restore original file
    if (targetAbsPath && backupContent !== null) {
      fs.writeFileSync(targetAbsPath, backupContent, 'utf8');
    }
  }
}

// Summary Table
console.log('='.repeat(80));
console.log('  ACCOUNT & PRO UNLOCK MUTATION TESTING MATRIX');
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
