/**
 * tests/stage3d.test.js
 * Verification Test Suite for Visual & 3D WebGL Workbench Simulation Engine
 * Strictly adhering to clean-room/VISUAL_3D_SPEC.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  Stage3D,
  LESSON_VIEWPORTS,
  WIRE_COLORS_3D,
  DEFAULT_CAMERA
} from '../src/stage3d.js';

describe('Stage3D Engine Suite: Headless Defense, Orthographic Camera & Projection', () => {
  it('handles headless Node.js environment gracefully without throwing', () => {
    const stage = new Stage3D(null);
    assert.equal(stage.isSupported, false, 'Should flag unsupported when canvas is null');
    assert.ok(stage.scene instanceof THREE.Scene, 'Should initialize pure Three.js Scene');
    assert.ok(stage.camera instanceof THREE.OrthographicCamera, 'Should initialize OrthographicCamera');
    stage.destroy();
  });

  it('enforces exact axonometric camera angles and initial parameters', () => {
    const stage = new Stage3D(null);
    assert.equal(stage.azimuth, 36 * (Math.PI / 180), 'Azimuth theta should be 36 degrees');
    assert.equal(stage.elevation, 43 * (Math.PI / 180), 'Elevation phi should be 43 degrees');
    assert.equal(stage.radius, 500, 'Orbit radius R should be 500');
    assert.equal(stage.camera.near, 1, 'Near clipping plane should be 1');
    assert.equal(stage.camera.far, 900, 'Far clipping plane should be 900');

    // Verify camera position matches 3D trigonometry formula:
    // X = target.x + R * cos(phi) * sin(theta)
    // Y = target.y + R * sin(phi)
    // Z = target.z + R * cos(phi) * cos(theta)
    const expectedX = stage.target.x + 500 * Math.cos(stage.elevation) * Math.sin(stage.azimuth);
    const expectedY = stage.target.y + 500 * Math.sin(stage.elevation);
    const expectedZ = stage.target.z + 500 * Math.cos(stage.elevation) * Math.cos(stage.azimuth);

    assert.ok(Math.abs(stage.camera.position.x - expectedX) < 1e-4);
    assert.ok(Math.abs(stage.camera.position.y - expectedY) < 1e-4);
    assert.ok(Math.abs(stage.camera.position.z - expectedZ) < 1e-4);
    stage.destroy();
  });

  it('projects 3D world coordinates to 2D screen coordinates accurately', () => {
    const stage = new Stage3D(null);
    stage.updateCameraProjection(1672, 941);

    // Target point [0, 0, 3.6] should project close to center of stage viewport
    const ptCenter = stage.projectToScreen(new THREE.Vector3(0, 0, 3.6), 1672, 941);
    assert.equal(typeof ptCenter.x, 'number');
    assert.equal(typeof ptCenter.y, 'number');
    assert.ok(Math.abs(ptCenter.x - 1672 / 2) < 5.0, 'Target should project near screen center X');
    assert.ok(Math.abs(ptCenter.y - 941 / 2) < 5.0, 'Target should project near screen center Y');
    assert.equal(ptCenter.visible, true);
    stage.destroy();
  });
});

describe('Stage3D Engine Suite: 20-Lesson Viewport Matrix & Procedural Models', () => {
  it('defines valid targets and positive zoom levels for all 20 lessons', () => {
    for (let i = 1; i <= 20; i++) {
      const vp = LESSON_VIEWPORTS[i];
      assert.ok(vp, `Lesson ${i} must have viewport specification`);
      assert.equal(Array.isArray(vp.target), true);
      assert.equal(vp.target.length, 3);
      assert.ok(typeof vp.zoom === 'number' && vp.zoom > 0, `Lesson ${i} zoom must be positive`);
    }
  });

  it('switches between all 20 lessons and configures dynamic 3D actors', () => {
    const stage = new Stage3D(null);

    // Lesson 1: Meet ESP32 DevKit
    stage.setLesson(1);
    assert.equal(stage.targetZoom, 10.6);
    assert.ok(stage.inspectionAnchors.length >= 2, 'Lesson 1 should have inspection anchors');

    // Lesson 2: Dual LED Blink
    stage.setLesson(2);
    assert.equal(stage.targetZoom, 7.0);
    assert.ok(stage.activeActors.ledRed);
    assert.ok(stage.activeActors.ledGreen);

    // Lesson 3: Fridge Door Sensor
    stage.setLesson(3);
    assert.equal(stage.targetZoom, 5.0);
    assert.ok(stage.activeActors.fridgeDoor);

    // Lesson 6: Touch Piano
    stage.setLesson(6);
    assert.equal(stage.activeActors.pianoKeys.length, 8, 'Lesson 6 should instantiate 8 piano keys');

    // Lesson 7: Neopixel Ring & Potentiometer
    stage.setLesson(7);
    assert.ok(stage.activeActors.potKnob);
    assert.equal(stage.activeActors.neopixels.length, 12, 'Lesson 7 should instantiate 12 Neopixels');

    // Lesson 11: DC Motor
    stage.setLesson(11);
    assert.ok(stage.activeActors.dcWheel);

    // Lesson 12: Servo Gate
    stage.setLesson(12);
    assert.ok(stage.activeActors.servoGate);

    // Lesson 16: Water Pump
    stage.setLesson(16);
    assert.ok(stage.activeActors.waterLevel);

    // Lesson 18: Solar Tracker
    stage.setLesson(18);
    assert.ok(stage.activeActors.solarPivot);

    // Lesson 20: Stepper Lead Screw
    stage.setLesson(20);
    assert.ok(stage.activeActors.stepperCarriage);

    stage.destroy();
  });

  it('modulates dynamic actor states deterministically', () => {
    const stage = new Stage3D(null);

    // Test Fridge Door rotation
    stage.setLesson(3);
    stage.updateActorState('fridgeDoor', 45);
    assert.ok(Math.abs(stage.activeActors.fridgeDoor.rotation.y - (45 * Math.PI) / 180) < 1e-4);

    // Test Servo Gate rotation
    stage.setLesson(12);
    stage.updateActorState('servoGate', 90);
    assert.ok(Math.abs(stage.activeActors.servoGate.rotation.z - (90 * Math.PI) / 180) < 1e-4);

    // Test Stepper carriage position
    stage.setLesson(20);
    stage.updateActorState('stepperPosition', 100);
    assert.equal(stage.activeActors.stepperCarriage.position.x, 0);

    stage.updateActorState('stepperPosition', 200);
    assert.equal(stage.activeActors.stepperCarriage.position.x, 30);

    stage.destroy();
  });
});

describe('Stage3D Engine Suite: Camera Orbit Navigation Controls', () => {
  it('supports rotating azimuth, zooming within clamp bounds, and resetting view', () => {
    const stage = new Stage3D(null);
    stage.setLesson(1);

    const initAzimuth = stage.azimuth;
    stage.rotateAzimuth(Math.PI / 4);
    assert.ok(Math.abs(stage.azimuth - (initAzimuth + Math.PI / 4)) < 1e-4);

    // Test Zoom clamping
    stage.zoomBy(100.0);
    assert.equal(stage.currentZoom, 15.0, 'Zoom should be clamped at 15.0 maximum');

    stage.zoomBy(0.001);
    assert.equal(stage.currentZoom, 0.4, 'Zoom should be clamped at 0.4 minimum');

    // Test Reset View
    stage.resetView();
    assert.equal(stage.azimuth, DEFAULT_CAMERA.azimuth);
    assert.equal(stage.elevation, DEFAULT_CAMERA.elevation);
    assert.equal(stage.currentZoom, 10.6);

    // Test Grid visibility toggle
    stage.setGridVisible(false);
    assert.equal(stage.gridHelper.visible, false);
    stage.setGridVisible(true);
    assert.equal(stage.gridHelper.visible, true);

    stage.destroy();
  });
});
