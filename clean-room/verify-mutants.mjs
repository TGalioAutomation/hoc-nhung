#!/usr/bin/env node

/**
 * clean-room/verify-mutants.mjs
 * Automated Verification Harness for 3-Mutant Protocol
 *
 * Enforces:
 * 1. Primary Build (src/engine.js) MUST PASS 100% (exit 0)
 * 2. Mutant 1 (clean-room/mutants/mutant-1/engine.js) MUST FAIL (exit != 0)
 * 3. Mutant 2 (clean-room/mutants/mutant-2/engine.js) MUST FAIL (exit != 0)
 * 4. Mutant 3 (clean-room/mutants/mutant-3/engine.js) MUST FAIL (exit != 0)
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGETS = [
  {
    id: 'primary',
    name: 'Primary Clean-Room Build',
    enginePath: 'src/engine.js',
    expectedPass: true,
    description: 'Clean-room implementation derived strictly from SPEC.approved.md'
  },
  {
    id: 'mutant-1',
    name: 'Mutant 1 (Boundary / Off-by-One)',
    enginePath: 'clean-room/mutants/mutant-1/engine.js',
    expectedPass: false,
    description: 'Sabotaged Ohm\'s law 40mA limit, omitted pin 39 from input-only, Fridge Guard >=12°'
  },
  {
    id: 'mutant-2',
    name: 'Mutant 2 (Invariant / State-Machine Bypass)',
    enginePath: 'clean-room/mutants/mutant-2/engine.js',
    expectedPass: false,
    description: 'Sabotaged default age band to band-a, Band A code editor leak, FSM upload bypass'
  },
  {
    id: 'mutant-3',
    name: 'Mutant 3 (Hysteresis & Gamification Corrupted)',
    enginePath: 'clean-room/mutants/mutant-3/engine.js',
    expectedPass: false,
    description: 'Sabotaged smart pump hysteresis state retention, progress % and XP calculation'
  }
];

console.log('='.repeat(80));
console.log('  CLEAN-ROOM 3-MUTANT VERIFICATION HARNESS (Flash Tier QA Protocol)');
console.log('='.repeat(80));
console.log(`Root Directory: ${rootDir}\n`);

const results = [];
let overallSuccess = true;

for (const target of TARGETS) {
  console.log(`▶ Executing test suite against [${target.id}]: ${target.name}...`);
  const startTime = Date.now();

  const child = spawnSync('node', ['--test', 'tests/spec.test.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      ENGINE_PATH: target.enginePath
    },
    encoding: 'utf8'
  });

  const durationMs = Date.now() - startTime;
  const exitCode = child.status ?? -1;
  const passed = exitCode === 0;

  // Extract pass / fail counts from node:test output
  const output = child.stdout + child.stderr;
  const passMatch = output.match(/ℹ pass (\d+)/);
  const failMatch = output.match(/ℹ fail (\d+)/);
  const passCount = passMatch ? parseInt(passMatch[1], 10) : (passed ? 37 : 0);
  const failCount = failMatch ? parseInt(failMatch[1], 10) : (passed ? 0 : 1);

  // Verification status
  let verdict = 'UNKNOWN';
  let isKillExpected = !target.expectedPass;

  if (target.expectedPass) {
    if (passed) {
      verdict = 'VERIFIED PASS (100%)';
    } else {
      verdict = 'UNEXPECTED FAILURE (REGRESSION)';
      overallSuccess = false;
    }
  } else {
    if (!passed) {
      verdict = `KILLED (${failCount} assertion failures)`;
    } else {
      verdict = 'SURVIVED MUTANT (TEST DEFECT - STRENGTHEN SUITE)';
      overallSuccess = false;
    }
  }

  results.push({
    ...target,
    exitCode,
    passed,
    passCount,
    failCount,
    durationMs,
    verdict,
    stdout: child.stdout,
    stderr: child.stderr
  });

  console.log(`  Exit Code : ${exitCode}`);
  console.log(`  Passed    : ${passCount} tests`);
  console.log(`  Failed    : ${failCount} tests`);
  console.log(`  Duration  : ${durationMs}ms`);
  console.log(`  Verdict   : ${verdict}\n`);
}

// Summary Table
console.log('='.repeat(80));
console.log('  MUTATION TESTING AUDIT MATRIX');
console.log('='.repeat(80));
console.log(
  'Target'.padEnd(12) +
  ' | ' + 'Status'.padEnd(10) +
  ' | ' + 'Pass'.padStart(5) +
  ' | ' + 'Fail'.padStart(5) +
  ' | ' + 'Exit'.padStart(5) +
  ' | ' + 'Verdict'
);
console.log('-'.repeat(80));

for (const r of results) {
  const statusStr = r.passed ? 'PASS' : 'FAIL';
  console.log(
    r.id.padEnd(12) +
    ' | ' + statusStr.padEnd(10) +
    ' | ' + String(r.passCount).padStart(5) +
    ' | ' + String(r.failCount).padStart(5) +
    ' | ' + String(r.exitCode).padStart(5) +
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
