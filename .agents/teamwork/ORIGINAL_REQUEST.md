# Original User Request

## 2026-10-28T04:17:00Z

Execute a full-scale multi-agent testing, end-to-end UI/DOM verification, mutation audit, and automated bug remediation campaign for the Age-Tiered (5–20 years old) ESP32 & Embedded Systems Learning WebApp.

Working directory: /Users/apexdev/Desktop/hoc-nhung-cho-be
Integrity mode: development

## Verification Resources
- Approved Black-Box Specification: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/SPEC.approved.md` (`RULE-001` through `RULE-010`)
- Existing Unit & Specification Tests: `/Users/apexdev/Desktop/hoc-nhung-cho-be/tests/spec.test.js`
- 3-Mutant Verification Harness: `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/verify-mutants.mjs` and `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/mutants/`

## Requirements

### R1. Specification & Boundary Test Suite Expansion
Verify and expand automated test coverage across all 10 behavioral rules (`RULE-001` through `RULE-010`) and all 20 hardware lessons defined in `clean-room/SPEC.approved.md`. Ensure strict assertions for every numeric boundary, electrical safety limit (3.3V, 40mA, input-only pins 34, 35, 36, 39), state machine transition, and edge case.

### R2. End-to-End (E2E) DOM & Interactive Simulation Verification
Create and execute automated end-to-end DOM/UI tests verifying user journeys across all 3 cognitive age bands (`band-a` 5–8, `band-b` 9–13, `band-c` 14–20), including age-band switching, lesson selection across all 20 lessons, interactive controls, code execution lifecycle (`idle -> uploading -> running`), Serial Monitor resizing, modal dialogs (Pinout, Quiz, Schematic, Settings), XP/Badge progression, and responsive breakpoint behavior (`W < 1090px` / `H < 800px`).

### R3. Mutation Testing Audit & Automated Bug Remediation
Run and validate the 3-mutant verification harness (`clean-room/verify-mutants.mjs`) against the expanded test suite so that the primary build passes 100% while all broken mutants fail. Automatically fix any bugs, regressions, or edge-case defects discovered in the application code during testing while preserving strict Clean-Room compliance (never reading `clean-room/SPEC.md` or `.forbidden-paths`).

## Acceptance Criteria

### Automated Unit & E2E Test Execution
- [ ] `npm test` executes all unit, specification boundary, and E2E DOM tests and exits with code `0` (`100% PASS`, `0` failures).
- [ ] Every rule (`RULE-001` through `RULE-010`) and all 20 curriculum lessons are programmatically verified with zero uncaught exceptions or DOM errors.

### Mutation Testing & Clean-Room Gate
- [ ] `node clean-room/verify-mutants.mjs` exits with code `0`, confirming the primary implementation passes 100% of tests and all 3 mutants (`mutant-1`, `mutant-2`, `mutant-3`) fail and are killed (`100%` mutation score).
- [ ] A comprehensive test and verification report is updated in `/Users/apexdev/Desktop/hoc-nhung-cho-be/clean-room/TEST_AND_MUTATION_REPORT.md` with reproducible verification commands and exact pass/fail counts.
