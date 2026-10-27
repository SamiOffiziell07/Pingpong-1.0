import { isPC } from './systems/platform.js';

export const debug = false;

// The tuning panel is a developer tool. It is hidden for players and can be
// opened by adding ?tune to the URL (e.g. index.html?tune).
export const showTuningPanel = (() => {
  try {
    return new URLSearchParams(window.location.search).has('tune');
  } catch {
    return false;
  }
})();

// ─── SAMIX UI typography ─────────────────────────────────────────────
// SF Pro on Apple devices, the system UI font elsewhere (no web fonts → fully offline).
export const uiFontFamily =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, "Segoe UI", Roboto, sans-serif';

// ─── Mobile presets (original values — tuned for touch) ─────────────
export const mobileDifficultyPresets = {
  easy: {
    aiPredictionRate: 1.9,
    aiXMarginScale: 0.34,
    aiTracking: 0.62,
    aiSpeed: 0.58,
    aiTrackingLerpScale: 0.24,
    aiWobbleX1: 0.075,
    aiWobbleX2: 0.055,
  },
  normal: {
    aiPredictionRate: 2.1,
    aiXMarginScale: 0.36,
    aiTracking: 0.68,
    aiSpeed: 0.63,
    aiTrackingLerpScale: 0.26,
    aiWobbleX1: 0.068,
    aiWobbleX2: 0.048,
  },
  hard: {
    aiPredictionRate: 2.6,
    aiXMarginScale: 0.42,
    aiTracking: 0.84,
    aiSpeed: 0.77,
    aiTrackingLerpScale: 0.32,
    aiWobbleX1: 0.055,
    aiWobbleX2: 0.035,
  },
};

// ─── PC presets (faster, more aggressive — mouse precision makes it too easy) ─
export const pcDifficultyPresets = {
  easy: {
    aiPredictionRate: 2.3,
    aiXMarginScale: 0.38,
    aiTracking: 0.74,
    aiSpeed: 0.68,
    aiTrackingLerpScale: 0.28,
    aiWobbleX1: 0.060,
    aiWobbleX2: 0.042,
  },
  normal: {
    aiPredictionRate: 2.6,
    aiXMarginScale: 0.42,
    aiTracking: 0.82,
    aiSpeed: 0.76,
    aiTrackingLerpScale: 0.32,
    aiWobbleX1: 0.048,
    aiWobbleX2: 0.032,
  },
  hard: {
    aiPredictionRate: 3.2,
    aiXMarginScale: 0.48,
    aiTracking: 0.96,
    aiSpeed: 0.90,
    aiTrackingLerpScale: 0.38,
    aiWobbleX1: 0.035,
    aiWobbleX2: 0.020,
  },
};

/**
 * Returns the correct preset bank for the current platform.
 * PC players get a harder AI because mouse precision gives a huge advantage.
 */
export function getPresetsForPlatform() {
  return isPC() ? pcDifficultyPresets : mobileDifficultyPresets;
}

// Keep a unified alias for any code that still references `difficultyPresets`
export const difficultyPresets = getPresetsForPlatform();

export const difficultyOptions = [
  { key: 'easy', label: 'Easy', color: '#57d17a' },
  { key: 'normal', label: 'Normal', color: '#ffd86b' },
  { key: 'hard', label: 'Hard', color: '#ff6b6b' },
];

let currentDifficulty = 'normal';

export function getCurrentDifficulty() {
  return currentDifficulty;
}

// Resolve the starting preset from the detected platform
const _startPreset = getPresetsForPlatform().normal;

export const tuning = {
  winScore: 7,

  // --- AI difficulty knobs (all in one place) ---
  aiTracking: _startPreset.aiTracking,
  aiSpeed: _startPreset.aiSpeed,
  aiReturnBoost: 0.38,

  // Reaction & timing
  aiReactionBase: 0.12,
  aiReactionRandom: 0.18,
  aiLungeDuration: 0.18,
  aiLungeRandom: 0.08,
  aiRecoverBase: 0.12,
  aiRecoverRandom: 0.08,

  // Prediction & precision
  aiPredictionRate: _startPreset.aiPredictionRate,
  aiWobbleX1: _startPreset.aiWobbleX1,
  aiWobbleX2: _startPreset.aiWobbleX2,
  aiWobbleFreq1: 3.0,
  aiWobbleFreq2: 1.7,

  // Movement lerps
  aiTrackingLerpScale: _startPreset.aiTrackingLerpScale,
  aiIdleLerp: 0.24,
  aiLungeLerpFast: 0.45,
  aiLungeLerpSlow: 0.14,
  aiRecoverLerp: 0.16,
  aiReadyLerp: 0.12,

  // Spatial zones
  aiStrikeZoneDepth: 0.25,
  aiMaxLungeDepthScale: 0.85,
  aiXMarginScale: _startPreset.aiXMarginScale,
  aiApproachRadiusScale: 3.5,

  // Return shot behavior (in BallPhysics)
  aiVelDampen: 0.35,
  aiSoftLockMargin: 0.07,

  // --- Ball tuning ---
  baseBallSpeed: 400,
  ballMaxSpeed: 1800,
  rallyAcceleration: 12,
  paddleInfluence: 0.55,
  angleInfluence: 0.88,
  outResetDelay: 0.42,
  gravity: 680,
  tableBounce: 0.3,
  minBounceZSpeed: 120,
  launchZSpeed: 360,
};

export function applyDifficultyPreset(name = 'normal') {
  const presets = getPresetsForPlatform();
  const nextDifficulty = presets[name] ? name : 'normal';
  Object.assign(tuning, presets[nextDifficulty]);
  currentDifficulty = nextDifficulty;
  return currentDifficulty;
}

export const tuneSchema = [
  {
    title: 'AI Core',
    fields: [
      { key: 'aiTracking', label: 'tracking', min: 0.2, max: 1.25, step: 0.01 },
      { key: 'aiSpeed', label: 'speed', min: 0.2, max: 1.4, step: 0.01 },
      { key: 'aiReturnBoost', label: 'return boost', min: 0, max: 1.2, step: 0.01 },
    ],
  },
  {
    title: 'AI Reaction',
    fields: [
      { key: 'aiReactionBase', label: 'react delay', min: 0.02, max: 0.5, step: 0.01 },
      { key: 'aiReactionRandom', label: 'react random', min: 0, max: 0.5, step: 0.01 },
      { key: 'aiLungeDuration', label: 'lunge time', min: 0.05, max: 0.4, step: 0.01 },
      { key: 'aiRecoverBase', label: 'recover time', min: 0.02, max: 0.4, step: 0.01 },
      { key: 'aiPredictionRate', label: 'predict rate', min: 0.5, max: 5.0, step: 0.1 },
    ],
  },
  {
    title: 'AI Precision',
    fields: [
      { key: 'aiWobbleX1', label: 'wobble 1', min: 0, max: 0.2, step: 0.005 },
      { key: 'aiWobbleX2', label: 'wobble 2', min: 0, max: 0.15, step: 0.005 },
      { key: 'aiTrackingLerpScale', label: 'track lerp', min: 0.1, max: 0.5, step: 0.01 },
      { key: 'aiLungeLerpFast', label: 'lunge fast', min: 0.15, max: 0.6, step: 0.01 },
      { key: 'aiLungeLerpSlow', label: 'lunge slow', min: 0.05, max: 0.3, step: 0.01 },
    ],
  },
  {
    title: 'Ball',
    fields: [
      { key: 'baseBallSpeed', label: 'base speed', min: 150, max: 800, step: 5 },
      { key: 'ballMaxSpeed', label: 'max speed', min: 600, max: 2400, step: 10 },
      { key: 'rallyAcceleration', label: 'rally accel', min: 1, max: 30, step: 0.5 },
    ],
  },
  {
    title: 'Arc',
    fields: [
      { key: 'gravity', label: 'gravity', min: 600, max: 3600, step: 10 },
      { key: 'tableBounce', label: 'table bounce', min: 0.2, max: 0.85, step: 0.01 },
      { key: 'minBounceZSpeed', label: 'min bounce', min: 40, max: 300, step: 5 },
      { key: 'launchZSpeed', label: 'launch height', min: 200, max: 1200, step: 10 },
    ],
  },
  {
    title: 'Feel',
    fields: [
      { key: 'paddleInfluence', label: 'swipe force', min: 0.1, max: 1.4, step: 0.01 },
      { key: 'angleInfluence', label: 'angle curve', min: 0.1, max: 1.3, step: 0.01 },
      { key: 'outResetDelay', label: 'respawn delay', min: 0.1, max: 1.2, step: 0.01 },
    ],
  },
];

// SAMIX palette — graphite black + white (taken from the logo), with the
// iOS system red / cyan reserved for the two players.
export const colors = {
  bgTop: 0x0b0b0e,
  bgBottom: 0x0b0b0e,
  table: 0x1c7f55,
  tableAlt: 0x187049,
  tableBorder: 0x2a2a31,
  outline: 0x0b0b0e,
  line: 0xffffff,
  player: 0xff6b62,
  playerDark: 0xd9463e,
  playerHandle: 0xe5544c,
  ai: 0x55c8ff,
  aiDark: 0x2a8fcc,
  aiHandle: 0x3fa8e6,
  shadow: 0x000000,
  ball: 0xffffff,
  ballCore: 0xffffff,
};

export const GAME_BOUNDS = {
  tableWidth: 0.74,
  tableHeight: 0.62,
  centerX: 0.5,
  centerY: 0.44,
  paddleMargin: 0.09,
  safeTop: 0.05,
  safeBottom: 0.05,
};
