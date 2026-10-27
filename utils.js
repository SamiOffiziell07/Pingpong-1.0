import { GAME_BOUNDS } from './config.js';

// Re-export platform utilities for convenience
export { getPlatform, isPC, isMobile } from './systems/platform.js';

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Frame-rate-independent lerp factor.
 * Converts a per-frame lerp factor (tuned at 60fps) into one that
 * produces the same visual result at any frame rate.
 *
 * Usage: instead of  lerp(a, b, 0.3)
 *        use         lerp(a, b, dtLerp(0.3, dt))
 *
 * @param {number} factor - The original per-frame lerp factor (0–1, tuned at 60fps)
 * @param {number} dt     - The actual delta time in seconds
 * @returns {number}       - The corrected lerp factor for this frame
 */
export function dtLerp(factor, dt) {
  // At 60fps one frame = 1/60s ≈ 0.01667s
  // The exponential smoothing formula: 1 - (1 - factor)^(dt / refDt)
  return 1 - Math.pow(1 - factor, dt * 60);
}

export function getLayout(scale) {
  const { width, height } = scale;
  
  // On mobile (narrow screens), enlarge the table slightly so the game
  // feels zoomed in and easier to see / interact with on small screens.
  const isMobile = width < 600;
  const tableWidthRatio = isMobile ? 0.58 : GAME_BOUNDS.tableWidth;
  const tableHeightRatio = isMobile ? 0.56 : GAME_BOUNDS.tableHeight;

  // Table dimensions — match the reference: a tall portrait-style table
  const tableHeight = height * tableHeightRatio;
  const tableWidth = Math.min(width * tableWidthRatio, tableHeight * 0.72);
  const x = width * GAME_BOUNDS.centerX;
  const y = height * GAME_BOUNDS.centerY;
  const left = x - tableWidth / 2;
  const right = x + tableWidth / 2;
  const top = y - tableHeight / 2;
  const bottom = y + tableHeight / 2;
  const minDimension = Math.min(tableWidth, tableHeight);

  // Paddle margin — how far the paddle home position extends beyond table
  const paddleMarginPx = height * GAME_BOUNDS.paddleMargin;

  // Paddle size — tuned proportions (slightly larger on mobile for visibility)
  const mobileScale = isMobile ? 1.08 : 1.0;
  const paddleRadius = minDimension * 0.15 * mobileScale;
  const handleLength = minDimension * 0.12 * mobileScale;
  const ballRadius = minDimension * 0.055 * mobileScale;

  return {
    width,
    height,
    x,
    y,
    left,
    right,
    top,
    bottom,
    tableWidth,
    tableHeight,
    minDimension,
    paddleRadius,
    handleLength,
    ballRadius,
    lineWidth: Math.max(4, minDimension * 0.012),
    halfHeight: tableHeight * 0.22,
    // Player zone: full player half of the screen
    // playerZoneTop has a small guard offset below the net so the player can't gatekeep it
    playerNetGuard: paddleRadius * 1.2,
    playerZoneTop: y + paddleRadius * 1.2,
    playerZoneBottom: height,
    playerHomeY: bottom + paddleRadius * 0.6,
    // AI zone: from above table up to table center
    aiZoneTop: top - paddleMarginPx,
    aiZoneBottom: y,
    aiHomeY: top - paddleRadius * 1.6,
    // Fixed ball spawn positions — over the table, fixed distance from paddle home
    // Player-side spawn: on the player half of the table, close to the bottom
    playerBallSpawnX: x,
    playerBallSpawnY: y + tableHeight * 0.28,
    // AI-side spawn: on the AI half of the table, close to the top
    aiBallSpawnX: x,
    aiBallSpawnY: y - tableHeight * 0.28,
  };
}

export function pointInsideTable(layout, x, y, radius = 0) {
  return x >= layout.left + radius
    && x <= layout.right - radius
    && y >= layout.top + radius
    && y <= layout.bottom - radius;
}
