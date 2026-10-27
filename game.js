(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // build/phaser-shim.js
  var phaser_shim_default = window.Phaser;

  // systems/GameStateManager.js
  var GameStateManager = class {
    constructor() {
      this._state = "menu";
      this._listeners = {};
      this._ready = {
        phaser: false,
        // Phaser booted, WebGL warm
        fonts: false,
        // Google Fonts loaded
        scene: false
        // GameScene fully created
      };
      this._playRequested = false;
    }
    get state() {
      return this._state;
    }
    /** Register a callback for an event. */
    on(event, fn) {
      var _a, _b;
      ((_b = (_a = this._listeners)[event]) != null ? _b : _a[event] = []).push(fn);
      return this;
    }
    /** Remove a callback. */
    off(event, fn) {
      const list = this._listeners[event];
      if (list) {
        this._listeners[event] = list.filter((f) => f !== fn);
      }
      return this;
    }
    _emit(event, data) {
      var _a;
      for (const fn of (_a = this._listeners[event]) != null ? _a : []) {
        fn(data);
      }
    }
    /** Mark a subsystem as ready. */
    setReady(key) {
      if (key in this._ready) {
        this._ready[key] = true;
        this._emit("ready", { key, all: this.isAllReady, progress: this.progress });
        this._tryFinish();
      }
    }
    isReady(key) {
      var _a;
      return (_a = this._ready[key]) != null ? _a : false;
    }
    get isAllReady() {
      return Object.values(this._ready).every(Boolean);
    }
    /** 0–1 progress based on how many flags are set. */
    get progress() {
      const keys = Object.keys(this._ready);
      const done = keys.filter((k) => this._ready[k]).length;
      return done / keys.length;
    }
    /** Called when the user taps Play. */
    requestPlay() {
      if (this._playRequested) return;
      this._playRequested = true;
      this._setState("loading");
      this._emit("launchGame");
      this._tryFinish();
    }
    /** Transition to 'playing' once everything is loaded and play was requested. */
    _tryFinish() {
      if (this._playRequested && this.isAllReady && this._state !== "playing") {
        this._setState("playing");
      }
    }
    _setState(next) {
      if (next === this._state) return;
      const prev = this._state;
      this._state = next;
      this._emit("statechange", { from: prev, to: next });
    }
  };
  var gameState = new GameStateManager();

  // systems/platform.js
  var _platformCached = null;
  function getPlatform() {
    if (_platformCached) return _platformCached;
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    if (hasFinePointer && !hasCoarsePointer) {
      _platformCached = "pc";
    } else if (!hasTouchScreen && !isSmallScreen) {
      _platformCached = "pc";
    } else {
      _platformCached = "mobile";
    }
    return _platformCached;
  }
  function isPC() {
    return getPlatform() === "pc";
  }

  // config.js
  var showTuningPanel = (() => {
    try {
      return new URLSearchParams(window.location.search).has("tune");
    } catch {
      return false;
    }
  })();
  var uiFontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, "Segoe UI", Roboto, sans-serif';
  var mobileDifficultyPresets = {
    easy: {
      aiPredictionRate: 1.9,
      aiXMarginScale: 0.34,
      aiTracking: 0.62,
      aiSpeed: 0.58,
      aiTrackingLerpScale: 0.24,
      aiWobbleX1: 0.075,
      aiWobbleX2: 0.055
    },
    normal: {
      aiPredictionRate: 2.1,
      aiXMarginScale: 0.36,
      aiTracking: 0.68,
      aiSpeed: 0.63,
      aiTrackingLerpScale: 0.26,
      aiWobbleX1: 0.068,
      aiWobbleX2: 0.048
    },
    hard: {
      aiPredictionRate: 2.6,
      aiXMarginScale: 0.42,
      aiTracking: 0.84,
      aiSpeed: 0.77,
      aiTrackingLerpScale: 0.32,
      aiWobbleX1: 0.055,
      aiWobbleX2: 0.035
    }
  };
  var pcDifficultyPresets = {
    easy: {
      aiPredictionRate: 2.3,
      aiXMarginScale: 0.38,
      aiTracking: 0.74,
      aiSpeed: 0.68,
      aiTrackingLerpScale: 0.28,
      aiWobbleX1: 0.06,
      aiWobbleX2: 0.042
    },
    normal: {
      aiPredictionRate: 2.6,
      aiXMarginScale: 0.42,
      aiTracking: 0.82,
      aiSpeed: 0.76,
      aiTrackingLerpScale: 0.32,
      aiWobbleX1: 0.048,
      aiWobbleX2: 0.032
    },
    hard: {
      aiPredictionRate: 3.2,
      aiXMarginScale: 0.48,
      aiTracking: 0.96,
      aiSpeed: 0.9,
      aiTrackingLerpScale: 0.38,
      aiWobbleX1: 0.035,
      aiWobbleX2: 0.02
    }
  };
  function getPresetsForPlatform() {
    return isPC() ? pcDifficultyPresets : mobileDifficultyPresets;
  }
  var difficultyPresets = getPresetsForPlatform();
  var difficultyOptions = [
    { key: "easy", label: "Easy", color: "#57d17a" },
    { key: "normal", label: "Normal", color: "#ffd86b" },
    { key: "hard", label: "Hard", color: "#ff6b6b" }
  ];
  var currentDifficulty = "normal";
  function getCurrentDifficulty() {
    return currentDifficulty;
  }
  var _startPreset = getPresetsForPlatform().normal;
  var tuning = {
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
    aiWobbleFreq1: 3,
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
    launchZSpeed: 360
  };
  function applyDifficultyPreset(name = "normal") {
    const presets = getPresetsForPlatform();
    const nextDifficulty = presets[name] ? name : "normal";
    Object.assign(tuning, presets[nextDifficulty]);
    currentDifficulty = nextDifficulty;
    return currentDifficulty;
  }
  var tuneSchema = [
    {
      title: "AI Core",
      fields: [
        { key: "aiTracking", label: "tracking", min: 0.2, max: 1.25, step: 0.01 },
        { key: "aiSpeed", label: "speed", min: 0.2, max: 1.4, step: 0.01 },
        { key: "aiReturnBoost", label: "return boost", min: 0, max: 1.2, step: 0.01 }
      ]
    },
    {
      title: "AI Reaction",
      fields: [
        { key: "aiReactionBase", label: "react delay", min: 0.02, max: 0.5, step: 0.01 },
        { key: "aiReactionRandom", label: "react random", min: 0, max: 0.5, step: 0.01 },
        { key: "aiLungeDuration", label: "lunge time", min: 0.05, max: 0.4, step: 0.01 },
        { key: "aiRecoverBase", label: "recover time", min: 0.02, max: 0.4, step: 0.01 },
        { key: "aiPredictionRate", label: "predict rate", min: 0.5, max: 5, step: 0.1 }
      ]
    },
    {
      title: "AI Precision",
      fields: [
        { key: "aiWobbleX1", label: "wobble 1", min: 0, max: 0.2, step: 5e-3 },
        { key: "aiWobbleX2", label: "wobble 2", min: 0, max: 0.15, step: 5e-3 },
        { key: "aiTrackingLerpScale", label: "track lerp", min: 0.1, max: 0.5, step: 0.01 },
        { key: "aiLungeLerpFast", label: "lunge fast", min: 0.15, max: 0.6, step: 0.01 },
        { key: "aiLungeLerpSlow", label: "lunge slow", min: 0.05, max: 0.3, step: 0.01 }
      ]
    },
    {
      title: "Ball",
      fields: [
        { key: "baseBallSpeed", label: "base speed", min: 150, max: 800, step: 5 },
        { key: "ballMaxSpeed", label: "max speed", min: 600, max: 2400, step: 10 },
        { key: "rallyAcceleration", label: "rally accel", min: 1, max: 30, step: 0.5 }
      ]
    },
    {
      title: "Arc",
      fields: [
        { key: "gravity", label: "gravity", min: 600, max: 3600, step: 10 },
        { key: "tableBounce", label: "table bounce", min: 0.2, max: 0.85, step: 0.01 },
        { key: "minBounceZSpeed", label: "min bounce", min: 40, max: 300, step: 5 },
        { key: "launchZSpeed", label: "launch height", min: 200, max: 1200, step: 10 }
      ]
    },
    {
      title: "Feel",
      fields: [
        { key: "paddleInfluence", label: "swipe force", min: 0.1, max: 1.4, step: 0.01 },
        { key: "angleInfluence", label: "angle curve", min: 0.1, max: 1.3, step: 0.01 },
        { key: "outResetDelay", label: "respawn delay", min: 0.1, max: 1.2, step: 0.01 }
      ]
    }
  ];
  var colors = {
    bgTop: 723726,
    bgBottom: 723726,
    table: 1867605,
    tableAlt: 1601609,
    tableBorder: 2763313,
    outline: 723726,
    line: 16777215,
    player: 16739170,
    playerDark: 14239294,
    playerHandle: 15029324,
    ai: 5622015,
    aiDark: 2789324,
    aiHandle: 4172006,
    shadow: 0,
    ball: 16777215,
    ballCore: 16777215
  };
  var GAME_BOUNDS = {
    tableWidth: 0.74,
    tableHeight: 0.62,
    centerX: 0.5,
    centerY: 0.44,
    paddleMargin: 0.09,
    safeTop: 0.05,
    safeBottom: 0.05
  };

  // scenes/BootScene.js
  var BootScene = class extends phaser_shim_default.Scene {
    constructor() {
      super("boot");
    }
    create() {
      this._warmUpWebGL();
      gameState.setReady("phaser");
      const launch = () => {
        gameState.off("launchGame", launch);
        this.scene.start("game");
      };
      if (gameState.state === "loading" || gameState.state === "playing") {
        this.scene.start("game");
      } else {
        gameState.on("launchGame", launch);
      }
    }
    /**
     * Draw every primitive type used by GameScene off-screen (fully
     * transparent) to force WebGL shader compilation up front.
     */
    _warmUpWebGL() {
      const objects = [];
      const g = this.add.graphics();
      g.fillStyle(0, 0);
      g.fillRect(-100, -100, 10, 10);
      g.fillRoundedRect(-100, -100, 10, 10, 3);
      g.lineStyle(4, 0, 0);
      g.strokeRoundedRect(-100, -100, 10, 10, 3);
      g.lineBetween(-100, -100, -90, -90);
      g.beginPath();
      g.moveTo(-100, -100);
      g.lineTo(-90, -90);
      g.strokePath();
      objects.push(g);
      const circle = this.add.circle(-100, -100, 20, 16777215, 0);
      circle.setStrokeStyle(4, 0, 0);
      objects.push(circle);
      const ellipse = this.add.ellipse(-100, -100, 30, 16, 0, 0);
      objects.push(ellipse);
      const rect = this.add.rectangle(-100, -100, 14, 40, 0, 0);
      rect.setStrokeStyle(4, 0, 0);
      objects.push(rect);
      const container = this.add.container(-100, -100, [
        this.add.circle(0, 0, 10, 16777215, 0),
        this.add.rectangle(0, 20, 8, 20, 0, 0)
      ]);
      objects.push(container);
      const text = this.add.text(-100, -100, "0", {
        fontFamily: uiFontFamily,
        fontSize: "14px",
        color: "#ffffff"
      }).setAlpha(0);
      objects.push(text);
      this.game.renderer.preRender();
      objects.forEach((obj) => obj.destroy());
    }
  };

  // utils.js
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function dtLerp(factor, dt) {
    return 1 - Math.pow(1 - factor, dt * 60);
  }
  function getLayout(scale) {
    const { width, height } = scale;
    const isMobile2 = width < 600;
    const tableWidthRatio = isMobile2 ? 0.58 : GAME_BOUNDS.tableWidth;
    const tableHeightRatio = isMobile2 ? 0.56 : GAME_BOUNDS.tableHeight;
    const tableHeight = height * tableHeightRatio;
    const tableWidth = Math.min(width * tableWidthRatio, tableHeight * 0.72);
    const x = width * GAME_BOUNDS.centerX;
    const y = height * GAME_BOUNDS.centerY;
    const left = x - tableWidth / 2;
    const right = x + tableWidth / 2;
    const top = y - tableHeight / 2;
    const bottom = y + tableHeight / 2;
    const minDimension = Math.min(tableWidth, tableHeight);
    const paddleMarginPx = height * GAME_BOUNDS.paddleMargin;
    const mobileScale = isMobile2 ? 1.08 : 1;
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
      aiBallSpawnY: y - tableHeight * 0.28
    };
  }
  function pointInsideTable(layout, x, y, radius = 0) {
    return x >= layout.left + radius && x <= layout.right - radius && y >= layout.top + radius && y <= layout.bottom - radius;
  }

  // systems/InputSystem.js
  var InputSystem = class {
    constructor(scene, tableBoundsProvider) {
      this.scene = scene;
      this.getTableBounds = tableBoundsProvider;
      this.activePointerId = null;
      this.dragPosition = null;
      this.dragVelocity = new phaser_shim_default.Math.Vector2();
      this.lastSample = null;
      scene.input.on("pointerdown", this.onPointerDown, this);
      scene.input.on("pointermove", this.onPointerMove, this);
      scene.input.on("pointerup", this.onPointerUp, this);
      scene.input.on("pointerupoutside", this.onPointerUp, this);
    }
    isInPlayerZone(pointer, bounds) {
      const minY = bounds.playerZoneTop - bounds.paddleRadius;
      return pointer.y >= minY;
    }
    startDrag(pointer, bounds) {
      this.activePointerId = pointer.id;
      this.dragPosition = new phaser_shim_default.Math.Vector2(
        pointer.x,
        clamp(pointer.y, bounds.playerZoneTop, bounds.playerZoneBottom)
      );
      this.dragVelocity.set(0, 0);
      this.lastSample = { x: pointer.x, y: pointer.y, time: performance.now() };
    }
    onPointerDown(pointer) {
      if (this.activePointerId !== null) {
        return;
      }
      const bounds = this.getTableBounds();
      if (!bounds || !this.isInPlayerZone(pointer, bounds)) {
        return;
      }
      this.startDrag(pointer, bounds);
    }
    onPointerMove(pointer) {
      const bounds = this.getTableBounds();
      if (!bounds) {
        return;
      }
      if (this.activePointerId === null && pointer.isDown && this.isInPlayerZone(pointer, bounds)) {
        this.startDrag(pointer, bounds);
      }
      if (pointer.id !== this.activePointerId || !this.lastSample) {
        return;
      }
      const now = performance.now();
      const dt = Math.max((now - this.lastSample.time) / 1e3, 1e-3);
      const rawVx = (pointer.x - this.lastSample.x) / dt;
      const rawVy = (pointer.y - this.lastSample.y) / dt;
      const smoothFactor = 1 - Math.pow(1 - 0.35, dt * 60);
      this.dragVelocity.x = phaser_shim_default.Math.Linear(this.dragVelocity.x, rawVx, smoothFactor);
      this.dragVelocity.y = phaser_shim_default.Math.Linear(this.dragVelocity.y, rawVy, smoothFactor);
      this.dragPosition.set(
        pointer.x,
        clamp(pointer.y, bounds.playerZoneTop, bounds.playerZoneBottom)
      );
      this.lastSample = { x: pointer.x, y: pointer.y, time: now };
    }
    onPointerUp(pointer) {
      if (pointer.id !== this.activePointerId) {
        return;
      }
      this.activePointerId = null;
      this.dragPosition = null;
      this.dragVelocity.scale(0.55);
      this.lastSample = null;
    }
    /** Forget any drag in progress (used when the game resumes from pause). */
    reset() {
      this.activePointerId = null;
      this.dragPosition = null;
      this.dragVelocity.set(0, 0);
      this.lastSample = null;
    }
    getPlayerTarget(defaultPosition) {
      var _a;
      return {
        isDragging: this.activePointerId !== null && !!this.dragPosition,
        position: (_a = this.dragPosition) != null ? _a : defaultPosition,
        velocity: this.dragVelocity
      };
    }
  };

  // entities/Paddle.js
  var Paddle = class {
    constructor(scene, color, darkColor, handleColor, isPlayer = true) {
      this.scene = scene;
      this.isPlayer = isPlayer;
      this._outline = darkColor;
      this.root = scene.add.container(0, 0);
      this.shadow = scene.add.container(0, 8);
      this.root.setDepth(5);
      this.shadow.setDepth(4);
      const handleDir = isPlayer ? 1 : -1;
      this._handleDir = handleDir;
      this._moveLerp = 0.36;
      this.bodyShadow = scene.add.circle(0, 0, 40, 0, 0.2);
      this.handleShadow = scene.add.rectangle(0, handleDir * 50, 16, 44, 0, 0.2);
      this.shadow.add([this.handleShadow, this.bodyShadow]);
      const hColor = handleColor || darkColor;
      this.handle = scene.add.rectangle(0, handleDir * 48, 16, 44, hColor, 1);
      this.handle.setStrokeStyle(4, darkColor, 1);
      this.body = scene.add.circle(0, 0, 42, color, 1);
      this.body.setStrokeStyle(6, darkColor, 1);
      this.highlight = scene.add.ellipse(-6, -8, 28, 18, 16777215, 0.15);
      this.root.add([this.handle, this.body, this.highlight]);
      this.position = new phaser_shim_default.Math.Vector2();
      this.previousPosition = new phaser_shim_default.Math.Vector2();
      this.velocity = new phaser_shim_default.Math.Vector2();
      this.target = new phaser_shim_default.Math.Vector2();
      this.radius = 42;
    }
    setSize(radius, handleLength) {
      this.radius = radius;
      const borderW = Math.max(5, radius * 0.13);
      const handleDir = this._handleDir;
      this.body.setRadius(radius);
      this.body.setStrokeStyle(borderW, this._outline, 1);
      this.highlight.setSize(radius * 0.55, radius * 0.36);
      this.highlight.setPosition(-radius * 0.16, -radius * 0.2);
      const handleW = Math.max(12, radius * 0.36);
      const handleH = handleLength;
      this.handle.setSize(handleW, handleH);
      this.handle.setPosition(0, handleDir * (radius + handleH * 0.36));
      this.handle.setStrokeStyle(Math.max(3, radius * 0.09), this._outline, 1);
      this.handleShadow.setSize(handleW, handleH);
      this.handleShadow.setPosition(0, handleDir * (radius + handleH * 0.36));
      this.bodyShadow.setRadius(radius * 0.95);
    }
    setPosition(x, y) {
      this.position.set(x, y);
      this.previousPosition.set(x, y);
      this.target.set(x, y);
      this.syncVisuals();
    }
    /**
     * Get the vertical zone bounds (zoneTop/zoneBottom) for this paddle from the
     * shared layout. Player and AI live in different vertical halves and the
     * paddle knows which one it owns based on `isPlayer`.
     */
    getZone(layout) {
      if (this.isPlayer) {
        return {
          zoneTop: layout.playerZoneTop,
          zoneBottom: layout.playerZoneBottom,
          homeX: layout.x,
          homeY: layout.playerHomeY
        };
      }
      return {
        zoneTop: layout.aiZoneTop,
        zoneBottom: layout.aiZoneBottom,
        homeX: layout.x,
        homeY: layout.aiHomeY
      };
    }
    /** Move the paddle to its home (serve-ready) position for the given layout. */
    placeAtHome(layout) {
      const { homeX, homeY } = this.getZone(layout);
      this.setPosition(homeX, homeY);
    }
    /**
     * Re-clamp the paddle inside the current layout's zone after a resize.
     * Player keeps its current X (full horizontal freedom); AI clamps X to the
     * table edges so it doesn't get stranded off-screen after a window resize.
     */
    reclampToLayout(layout) {
      const { zoneTop, zoneBottom } = this.getZone(layout);
      let x;
      if (this.isPlayer) {
        x = this.position.x;
      } else {
        x = clamp(this.position.x, layout.left + this.radius, layout.right - this.radius);
      }
      const y = this.isPlayer ? clamp(this.position.y, zoneTop, zoneBottom - this.radius) : clamp(this.position.y, zoneTop + this.radius, zoneBottom);
      this.setPosition(x, y);
    }
    setTarget(x, y) {
      this.target.set(x, y);
    }
    /** Override the smoothing factor for the next update (frame-rate-independent). */
    setMoveLerp(factor) {
      this._moveLerp = factor;
    }
    update(dt, layout) {
      this.previousPosition.copy(this.position);
      const lerpFactor = dtLerp(this._moveLerp, dt);
      const { zoneTop, zoneBottom } = this.getZone(layout);
      let clampedX;
      if (this.isPlayer) {
        clampedX = this.target.x;
      } else {
        const aiMargin = (layout.right - layout.left) * 0.35;
        clampedX = clamp(
          this.target.x,
          layout.left - aiMargin + this.radius,
          layout.right + aiMargin - this.radius
        );
      }
      const clampedY = this.isPlayer ? clamp(this.target.y, zoneTop, zoneBottom - this.radius) : clamp(this.target.y, zoneTop + this.radius, zoneBottom);
      this.position.x = phaser_shim_default.Math.Linear(this.position.x, clampedX, lerpFactor);
      this.position.y = phaser_shim_default.Math.Linear(this.position.y, clampedY, lerpFactor);
      this.velocity.set(
        (this.position.x - this.previousPosition.x) / Math.max(dt, 1e-3),
        (this.position.y - this.previousPosition.y) / Math.max(dt, 1e-3)
      );
      this.syncVisuals();
    }
    syncVisuals() {
      this.root.setPosition(this.position.x, this.position.y);
      this.shadow.setPosition(this.position.x + 5, this.position.y + 7);
      const tilt = phaser_shim_default.Math.Clamp(this.velocity.x / 2200, -0.14, 0.14);
      this.root.setRotation(tilt);
      this.shadow.setRotation(tilt * 0.5);
      const speed = this.velocity.length();
      const squash = phaser_shim_default.Math.Clamp(speed / 3e3, 0, 0.05);
      this.root.setScale(1 + squash, 1 - squash * 0.4);
    }
  };

  // systems/PlayerPaddleController.js
  var PlayerPaddleController = class {
    constructor(inputSystem) {
      this.inputSystem = inputSystem;
      this._fallback = new phaser_shim_default.Math.Vector2();
    }
    update(paddle, layout) {
      const { homeX, homeY } = paddle.getZone(layout);
      const fallback = this._fallback.set(homeX, homeY);
      const input = this.inputSystem.getPlayerTarget(fallback);
      const target = input.position;
      paddle.setTarget(target.x, target.y);
    }
  };

  // systems/AIPaddleController.js
  var AIPaddleController = class {
    constructor(tuning2) {
      /** Internal time counter (accumulated from dt) */
      __publicField(this, "_time", 0);
      this.tuning = tuning2;
      this.idleX = 0;
      this.resetTargetX = 0;
      this.state = "ready";
      this.lungeTimer = 0;
      this.recoverTimer = 0;
      this.reactionDelay = 0;
      this.reactionTimer = 0;
      this.lastBallDir = 0;
      this.hasSwung = false;
      this.predictionBlend = 0;
      this._wasLive = false;
      this._serveState = "idle";
      this._serveDelay = 0;
      this._serveTimer = 0;
      this._serveAngle = 0;
      this.isResetting = false;
    }
    reset(layout) {
      this.idleX = layout.x;
      this.resetTargetX = layout.x;
      this.state = "ready";
      this.lungeTimer = 0;
      this.recoverTimer = 0;
      this.reactionDelay = 0;
      this.reactionTimer = 0;
      this.lastBallDir = 0;
      this.hasSwung = false;
      this.predictionBlend = 0;
      this._wasLive = false;
      this._serveState = "idle";
      this._serveDelay = 0;
      this._serveTimer = 0;
      this._serveAngle = 0;
      this.isResetting = false;
    }
    /**
     * Predict where the ball will be at Y = interceptY along its current trajectory.
     * Returns the predicted X position using basic linear motion.
     */
    _predictBallX(ball, interceptY) {
      if (Math.abs(ball.velocity.y) < 10) {
        return ball.position.x;
      }
      const timeToIntercept = (interceptY - ball.position.y) / ball.velocity.y;
      if (timeToIntercept < 0) return ball.position.x;
      return ball.position.x + ball.velocity.x * timeToIntercept;
    }
    update(paddle, ball, layout, dt) {
      this._time += dt;
      const t = this.tuning;
      if (ball.waitingForServe && ball.serveSide === -1) {
        this.isResetting = false;
        this._handleAIServe(paddle, ball, layout, dt);
        this._applyMoveLerp(paddle);
        return;
      }
      if (this._serveState !== "idle") {
        this._serveState = "idle";
        this._serveTimer = 0;
      }
      const tableTop = layout.top;
      const readyY = layout.aiHomeY;
      const strikeZoneDepth = layout.tableHeight * t.aiStrikeZoneDepth;
      const strikeLineY = tableTop + strikeZoneDepth;
      const ballMovingToAI = ball.velocity.y < -20;
      if (ballMovingToAI && this.lastBallDir >= 0) {
        this.reactionDelay = t.aiReactionBase + Math.random() * t.aiReactionRandom * (1.1 - t.aiSpeed);
        this.reactionTimer = 0;
        this.hasSwung = false;
        this.predictionBlend = 0;
      }
      this.lastBallDir = ball.velocity.y;
      if (this.reactionTimer < this.reactionDelay) {
        this.reactionTimer += dt;
      }
      const hasReacted = this.reactionTimer >= this.reactionDelay;
      if (this.state === "recovering") {
        this.recoverTimer -= dt;
        if (this.recoverTimer <= 0) {
          this.state = "ready";
        }
      }
      if (this.state === "ready" && ball.isLive && hasReacted && !this.hasSwung) {
        const ballNearEdge = ball.position.y < strikeLineY && ballMovingToAI;
        if (ballNearEdge) {
          this.state = "lunging";
          this.lungeTimer = t.aiLungeDuration + Math.random() * t.aiLungeRandom;
        }
      }
      if (this.state === "lunging") {
        this.lungeTimer -= dt;
        if (this.lungeTimer <= 0) {
          this.state = "recovering";
          this.recoverTimer = t.aiRecoverBase + Math.random() * t.aiRecoverRandom;
          this.hasSwung = true;
        }
      }
      const xMargin = layout.tableWidth * t.aiXMarginScale;
      const tracking = t.aiTracking;
      const wobbleScale = 1.1 - t.aiSpeed;
      const imprecision = (Math.sin(this._time * t.aiWobbleFreq1) * t.aiWobbleX1 + Math.cos(this._time * t.aiWobbleFreq2) * t.aiWobbleX2) * layout.tableWidth * wobbleScale;
      if (this._wasLive && !ball.isLive) {
        const jitter = (Math.random() - 0.5) * layout.tableWidth * 0.24;
        this.resetTargetX = clamp(
          layout.x + jitter,
          layout.left + paddle.radius,
          layout.right - paddle.radius
        );
        this.state = "ready";
        this.hasSwung = false;
        this.predictionBlend = 0;
      }
      this._wasLive = ball.isLive;
      const ballInActivePlay = ball.isLive && !ball.waitingForServe;
      const isIdleOrWaiting = !ballInActivePlay;
      const resetLerpX = 0.72;
      const resetLerpY = 0.36;
      this.isResetting = isIdleOrWaiting;
      let desiredX;
      if (hasReacted && ballInActivePlay && ballMovingToAI) {
        this.predictionBlend = Math.min(this.predictionBlend + dt * t.aiPredictionRate, 1);
        const predictedX = this._predictBallX(ball, readyY);
        const blendedX = lerp(ball.position.x, predictedX, this.predictionBlend);
        desiredX = blendedX + imprecision;
      } else {
        const idleLerpX = isIdleOrWaiting ? resetLerpX : t.aiIdleLerp;
        desiredX = lerp(paddle.position.x, this.resetTargetX, dtLerp(idleLerpX, dt));
      }
      desiredX = clamp(desiredX, layout.left - xMargin + paddle.radius, layout.right + xMargin - paddle.radius);
      const baseLerp = hasReacted && ballInActivePlay ? tracking * t.aiTrackingLerpScale : isIdleOrWaiting ? resetLerpX : t.aiIdleLerp;
      const targetX = lerp(paddle.position.x, desiredX, dtLerp(baseLerp, dt));
      let targetY;
      switch (this.state) {
        case "lunging": {
          const maxLungeY = tableTop + strikeZoneDepth * t.aiMaxLungeDepthScale;
          const lungeTargetY = clamp(
            ball.position.y + paddle.radius * 0.3,
            layout.aiZoneTop + paddle.radius,
            maxLungeY
          );
          const distToBall = Math.abs(paddle.position.y - ball.position.y);
          const approachRadius = paddle.radius * t.aiApproachRadiusScale;
          const closeness = 1 - clamp(distToBall / approachRadius, 0, 1);
          const lungeLerp = lerp(t.aiLungeLerpFast, t.aiLungeLerpSlow, closeness * closeness);
          targetY = lerp(paddle.position.y, lungeTargetY, dtLerp(lungeLerp, dt));
          break;
        }
        case "recovering": {
          targetY = lerp(paddle.position.y, readyY, dtLerp(t.aiRecoverLerp, dt));
          break;
        }
        default: {
          const readyLerp = isIdleOrWaiting ? resetLerpY : t.aiReadyLerp;
          targetY = lerp(paddle.position.y, readyY, dtLerp(readyLerp, dt));
          break;
        }
      }
      targetY = clamp(targetY, layout.aiZoneTop + paddle.radius, layout.aiZoneBottom);
      paddle.setTarget(targetX, targetY);
      this._applyMoveLerp(paddle);
    }
    /**
     * Push the per-frame movement smoothing factor to the paddle.
     *
     * During between-point resets we boost the lerp so the paddle snaps back
     * to home in ~1s without being dampened by the normal gameplay smoothing.
     * During active play the lerp scales with the configured AI speed.
     */
    _applyMoveLerp(paddle) {
      const t = this.tuning;
      const moveLerp = this.isResetting ? 0.55 : phaser_shim_default.Math.Clamp(0.06 + t.aiSpeed * 0.14, 0.08, 0.24);
      paddle.setMoveLerp(moveLerp);
    }
    /**
     * AI serve behavior — human-like with varied approach angles:
     *  1. Brief pause (like a player getting ready)
     *  2. Pick one of 3 serve angles: straight, from left, or from right
     *  3. Move to an offset approach position, then lunge through the ball
     *
     * The angle variety means the AI imparts different lateral paddle velocity
     * on each serve, producing naturally different serve directions.
     *
     * The actual "hit" happens through paddle-ball collision in BallPhysics —
     * we just need to move the paddle into the ball from the chosen angle.
     */
    _handleAIServe(paddle, ball, layout, dt) {
      const t = this.tuning;
      const readyY = layout.aiHomeY;
      if (this._serveState === "idle") {
        this._serveState = "approaching";
        this._serveDelay = 0.3 + Math.random() * 0.35;
        this._serveTimer = 0;
        const angleChoice = Math.floor(Math.random() * 3);
        const offsetMagnitude = layout.tableWidth * 0.28;
        if (angleChoice === 0) {
          this._serveAngle = 0;
        } else if (angleChoice === 1) {
          this._serveAngle = -offsetMagnitude;
        } else {
          this._serveAngle = offsetMagnitude;
        }
      }
      this._serveTimer += dt;
      const approachLerpX = 0.18;
      const strikeLerpX = 0.5;
      const strikeLerpY = 0.4;
      if (this._serveTimer < this._serveDelay) {
        const approachX = ball.position.x + this._serveAngle;
        const driftX = lerp(paddle.position.x, approachX, dtLerp(approachLerpX, dt));
        const driftY = lerp(paddle.position.y, readyY, dtLerp(t.aiReadyLerp * 1.5, dt));
        paddle.setTarget(
          clamp(driftX, layout.left + paddle.radius, layout.right - paddle.radius),
          clamp(driftY, layout.aiZoneTop + paddle.radius, layout.aiZoneBottom)
        );
        return;
      }
      const targetX = lerp(paddle.position.x, ball.position.x, dtLerp(strikeLerpX, dt));
      const targetY = lerp(paddle.position.y, ball.position.y + paddle.radius * 0.3, dtLerp(strikeLerpY, dt));
      paddle.setTarget(
        clamp(targetX, layout.left + paddle.radius, layout.right - paddle.radius),
        clamp(targetY, layout.aiZoneTop + paddle.radius, layout.aiZoneBottom)
      );
    }
  };

  // sounds/soundsConfig.js
  var soundsConfig = {
    paddleHit: {
      label: "Paddle Hit",
      description: "Satisfying woody thwack \u2014 rubber on wood paddle feel",
      build(ctx, masterGain) {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 8;
        compressor.ratio.value = 6;
        compressor.attack.value = 1e-3;
        compressor.release.value = 0.06;
        compressor.connect(masterGain);
        return {
          play(options = {}) {
            var _a;
            const intensity = (_a = options.intensity) != null ? _a : 0.8;
            const now = ctx.currentTime;
            const bodyOsc = ctx.createOscillator();
            bodyOsc.type = "triangle";
            bodyOsc.frequency.setValueAtTime(220 + intensity * 40, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
            const bodyGain = ctx.createGain();
            bodyGain.gain.setValueAtTime(0.6 * intensity, now);
            bodyGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.12);
            bodyOsc.connect(bodyGain);
            bodyGain.connect(compressor);
            bodyOsc.start(now);
            bodyOsc.stop(now + 0.13);
            const knockOsc = ctx.createOscillator();
            knockOsc.type = "sine";
            const knockPitch = 340 + intensity * 80 + (Math.random() - 0.5) * 30;
            knockOsc.frequency.setValueAtTime(knockPitch, now);
            knockOsc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
            const knockGain = ctx.createGain();
            knockGain.gain.setValueAtTime(0.35 * intensity, now);
            knockGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.09);
            knockOsc.connect(knockGain);
            knockGain.connect(compressor);
            knockOsc.start(now);
            knockOsc.stop(now + 0.1);
            const bufferSize = ctx.sampleRate * 0.05;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "lowpass";
            noiseFilter.frequency.setValueAtTime(1800 + intensity * 600, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 0.04);
            noiseFilter.Q.value = 1;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.45 * intensity, now);
            noiseGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.045);
            noiseSrc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(compressor);
            noiseSrc.start(now);
            noiseSrc.stop(now + 0.05);
          },
          dispose() {
            compressor.disconnect();
          }
        };
      }
    },
    tableBounce: {
      label: "Table Bounce",
      description: "Soft, muted tap \u2014 ball hitting the table surface",
      build(ctx, masterGain) {
        return {
          play(options = {}) {
            var _a;
            const intensity = (_a = options.intensity) != null ? _a : 0.5;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(180 + intensity * 60, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12 * intensity, now);
            gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.06);
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 800;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.07);
          },
          dispose() {
          }
        };
      }
    },
    score: {
      label: "Score",
      description: "Quick cheerful two-tone chime when a point is scored",
      build(ctx, masterGain) {
        return {
          play() {
            const now = ctx.currentTime;
            const notes = [523.25, 783.99];
            const spacing = 0.09;
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.value = freq;
              const gain = ctx.createGain();
              const t = now + i * spacing;
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.25, t + 8e-3);
              gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.18);
              osc.connect(gain);
              gain.connect(masterGain);
              osc.start(t);
              osc.stop(t + 0.2);
            });
          },
          dispose() {
          }
        };
      }
    },
    scoreLost: {
      label: "Score Lost",
      description: "Deflating descending tone when the enemy scores",
      build(ctx, masterGain) {
        return {
          play() {
            const now = ctx.currentTime;
            const notes = [440, 311.13];
            const spacing = 0.1;
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.value = freq;
              const gain = ctx.createGain();
              const t = now + i * spacing;
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.2, t + 8e-3);
              gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.22);
              osc.connect(gain);
              gain.connect(masterGain);
              osc.start(t);
              osc.stop(t + 0.24);
            });
          },
          dispose() {
          }
        };
      }
    },
    countdownTick: {
      label: "Countdown Tick",
      description: "Short, clean metronome-like tick for 3-2-1",
      build(ctx, masterGain) {
        return {
          play() {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = 880;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.1);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.11);
          },
          dispose() {
          }
        };
      }
    },
    countdownGo: {
      label: "Countdown Go",
      description: "Bright ascending sweep for GO!",
      build(ctx, masterGain) {
        return {
          play() {
            const now = ctx.currentTime;
            const notes = [1046.5, 1318.5];
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.value = freq;
              const gain = ctx.createGain();
              const t = now + i * 0.06;
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.28, t + 5e-3);
              gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.15);
              osc.connect(gain);
              gain.connect(masterGain);
              osc.start(t);
              osc.stop(t + 0.16);
            });
          },
          dispose() {
          }
        };
      }
    },
    groundBounce: {
      label: "Ground Bounce",
      description: "Heavy, deep thud \u2014 ball hitting the floor after falling off the table",
      build(ctx, masterGain) {
        return {
          play(options = {}) {
            const now = ctx.currentTime;
            const subOsc = ctx.createOscillator();
            subOsc.type = "triangle";
            subOsc.frequency.setValueAtTime(90, now);
            subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.5, now);
            subGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.22);
            subOsc.connect(subGain);
            subGain.connect(masterGain);
            subOsc.start(now);
            subOsc.stop(now + 0.24);
            const bodyOsc = ctx.createOscillator();
            bodyOsc.type = "sine";
            bodyOsc.frequency.setValueAtTime(160, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
            const bodyGain = ctx.createGain();
            bodyGain.gain.setValueAtTime(0.35, now);
            bodyGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.14);
            bodyOsc.connect(bodyGain);
            bodyGain.connect(masterGain);
            bodyOsc.start(now);
            bodyOsc.stop(now + 0.16);
            const bufferSize = Math.floor(ctx.sampleRate * 0.06);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "lowpass";
            noiseFilter.frequency.setValueAtTime(600, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 0.05);
            noiseFilter.Q.value = 0.7;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.06);
            noiseSrc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(masterGain);
            noiseSrc.start(now);
            noiseSrc.stop(now + 0.07);
          },
          dispose() {
          }
        };
      }
    },
    buttonClick: {
      label: "Button Click",
      description: "Snappy UI click for menu interactions",
      build(ctx, masterGain) {
        return {
          play() {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.3, now);
            oscGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.06);
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.07);
            const bufLen = ctx.sampleRate * 0.015;
            const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const nSrc = ctx.createBufferSource();
            nSrc.buffer = buf;
            const nFilter = ctx.createBiquadFilter();
            nFilter.type = "highpass";
            nFilter.frequency.value = 2e3;
            const nGain = ctx.createGain();
            nGain.gain.setValueAtTime(0.15, now);
            nGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.02);
            nSrc.connect(nFilter);
            nFilter.connect(nGain);
            nGain.connect(masterGain);
            nSrc.start(now);
            nSrc.stop(now + 0.02);
          },
          dispose() {
          }
        };
      }
    }
  };

  // sounds/SoundManager.js
  var SoundManager = class {
    constructor() {
      this._ready = false;
      this._ctx = null;
      this._sounds = {};
      this._muted = false;
      this._masterGain = null;
    }
    /**
     * Ensure the audio context is running and all sounds are built.
     * Safe to call multiple times — only initialises once.
     * Must be triggered from a user gesture (click / tap / key).
     */
    init() {
      if (this._ready) return;
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._masterGain = this._ctx.createGain();
        this._masterGain.connect(this._ctx.destination);
        this._buildSounds();
        this._ready = true;
        console.log("[SoundManager] AudioContext started, sounds built.");
      } catch (err) {
        console.warn("[SoundManager] Failed to start audio:", err);
      }
    }
    /** Build every sound defined in soundsConfig */
    _buildSounds() {
      for (const [name, config2] of Object.entries(soundsConfig)) {
        try {
          this._sounds[name] = config2.build(this._ctx, this._masterGain);
        } catch (err) {
          console.warn(`[SoundManager] Failed to build sound "${name}":`, err);
        }
      }
    }
    /**
     * Play a named sound with zero scheduling delay.
     * @param {string} name — key from soundsConfig (e.g. 'paddleHit')
     * @param {object} options — passed through to the sound's play() method
     */
    play(name, options) {
      if (!this._ready || this._muted) return;
      if (this._ctx.state === "suspended") {
        this._ctx.resume();
      }
      const sound = this._sounds[name];
      if (!sound) {
        console.warn(`[SoundManager] Unknown sound: "${name}"`);
        return;
      }
      try {
        sound.play(options);
      } catch (err) {
        console.warn(`[SoundManager] Playback error for "${name}":`, err);
      }
    }
    /** Mute / unmute all sounds */
    get muted() {
      return this._muted;
    }
    set muted(value) {
      this._muted = !!value;
      if (this._masterGain) {
        this._masterGain.gain.value = this._muted ? 0 : 1;
      }
    }
    /** Toggle mute state. Returns new muted value. */
    toggleMute() {
      this.muted = !this._muted;
      return this._muted;
    }
    /** Clean up */
    dispose() {
      for (const sound of Object.values(this._sounds)) {
        if (sound.dispose) sound.dispose();
      }
      this._sounds = {};
      if (this._ctx) {
        this._ctx.close();
        this._ctx = null;
      }
      this._ready = false;
    }
  };
  var soundManager = new SoundManager();

  // systems/BallPhysics.js
  var BallPhysics = class {
    constructor(scene, tuning2, onOut) {
      this.scene = scene;
      this.tuning = tuning2;
      this.onOut = onOut;
      this.groundPos = new phaser_shim_default.Math.Vector2();
      this.velocity = new phaser_shim_default.Math.Vector2();
      this.z = 0;
      this.zVelocity = 0;
      this.rallyCount = 0;
      this.isLive = false;
      this.justBounced = false;
      this.waitingForServe = false;
      this.serveSide = 0;
      this.lastHitBy = null;
      this.lastBounceSide = null;
      this.lastBounceHitBy = null;
      this.bounceCountSinceHit = 0;
      this.position = new phaser_shim_default.Math.Vector2();
      this.visualScale = 1;
      this.collisionRadius = 10;
      this.shadow = scene.add.ellipse(0, 0, 36, 20, 0, 0.22).setDepth(6);
      this.outer = scene.add.circle(0, 0, 18, 16777215, 1).setDepth(7);
      this.outer.setStrokeStyle(4, colors.outline, 1);
      this.inner = scene.add.circle(0, 0, 5, 16777215, 1).setDepth(8);
      this.bounceRing = scene.add.circle(0, 0, 20, 16777215, 0).setDepth(6.5);
      this.bounceRing.setStrokeStyle(3, 16777215, 0);
      this.bounceRingLife = 0;
      this.offTableFallScale = 1;
      this.groundBouncePlayed = false;
      this.paddleHitCooldown = { player: 0, ai: 0 };
    }
    resize(radius) {
      this.baseRadius = radius;
      this.radius = radius;
      this.outer.setRadius(radius);
      this.inner.setRadius(radius * 0.3);
      this.outer.setStrokeStyle(Math.max(3, radius * 0.2), colors.outline, 1);
      this.shadow.setSize(radius * 2, radius * 1.1);
    }
    /**
     * Compute visual parameters from current z using ABSOLUTE height.
     *
     * The reference height is the theoretical peak of a full-strength launch arc.
     * z is mapped linearly against that — small bounces produce small visuals,
     * big arcs produce big visuals. No per-arc normalization, so the scale
     * transitions are smooth and predictable.
     *
     * Returns { zFraction, visualScale, zOffset }
     */
    _computeZVisuals() {
      const refHeight = this.tuning.launchZSpeed * this.tuning.launchZSpeed / (2 * this.tuning.gravity);
      if (this.z >= 0) {
        const zFraction = clamp(this.z / Math.max(refHeight, 1), 0, 1);
        const visualScale = 1 + zFraction * 1;
        const zOffset = zFraction * this.baseRadius * 4;
        return { zFraction, visualScale, zOffset };
      } else {
        const floorZ = -100;
        const fallDepth = clamp(this.z / floorZ, 0, 1);
        const visualScale = 1 - fallDepth * 0.7;
        const zOffset = -fallDepth * this.baseRadius * 3;
        return { zFraction: 0, visualScale, zOffset };
      }
    }
    respawn(layout, direction = 1) {
      this.rallyCount = 0;
      this.isLive = true;
      this.justBounced = false;
      this.lastHitBy = null;
      this.lastBounceSide = null;
      this.lastBounceHitBy = null;
      this.bounceCountSinceHit = 0;
      this.waitingForServe = false;
      this.offTableFallScale = 1;
      this.groundBouncePlayed = false;
      this.paddleHitCooldown.player = 0;
      this.paddleHitCooldown.ai = 0;
      if (direction === 1) {
        this.groundPos.set(layout.playerBallSpawnX, layout.playerBallSpawnY);
      } else {
        this.groundPos.set(layout.aiBallSpawnX, layout.aiBallSpawnY);
      }
      const launchAngle = phaser_shim_default.Math.FloatBetween(-0.22, 0.22);
      const speed = this.tuning.baseBallSpeed;
      this.velocity.set(
        Math.sin(launchAngle) * speed,
        -Math.cos(launchAngle) * speed * direction
      );
      this.z = 1;
      this.zVelocity = this.tuning.launchZSpeed * 0.6;
      this._updatePositionFromGround();
      this.syncVisuals();
    }
    /**
     * Place the ball on the table for a serve — stationary, resting on the surface.
     * The ball stays still until a paddle makes contact with it.
     * @param {object} layout - current layout
     * @param {number} direction - 1 = player side, -1 = AI side
     */
    placeForServe(layout, direction = 1) {
      this.rallyCount = 0;
      this.isLive = true;
      this.waitingForServe = true;
      this.serveSide = direction;
      this.justBounced = false;
      this.lastHitBy = null;
      this.lastBounceSide = null;
      this.lastBounceHitBy = null;
      this.bounceCountSinceHit = 0;
      this.offTableFallScale = 1;
      this.groundBouncePlayed = false;
      this.paddleHitCooldown.player = 0;
      this.paddleHitCooldown.ai = 0;
      if (direction === 1) {
        this.groundPos.set(layout.playerBallSpawnX, layout.playerBallSpawnY);
      } else {
        this.groundPos.set(layout.aiBallSpawnX, layout.aiBallSpawnY);
      }
      this.velocity.set(0, 0);
      this.z = 0;
      this.zVelocity = 0;
      this._updatePositionFromGround();
      this.syncVisuals();
      this.outer.setVisible(true);
      this.inner.setVisible(true);
      this.shadow.setVisible(true);
    }
    /** Update the authoritative `position` (visual/collision pos) from groundPos + z */
    _updatePositionFromGround() {
      const { zOffset, visualScale } = this._computeZVisuals();
      this.position.set(this.groundPos.x, this.groundPos.y - zOffset);
      this.visualScale = visualScale;
      this.collisionRadius = this.baseRadius * visualScale;
    }
    update(dt, layout, paddles) {
      if (!this.isLive) {
        return;
      }
      if (this.paddleHitCooldown.player > 0) {
        this.paddleHitCooldown.player = Math.max(0, this.paddleHitCooldown.player - dt);
      }
      if (this.paddleHitCooldown.ai > 0) {
        this.paddleHitCooldown.ai = Math.max(0, this.paddleHitCooldown.ai - dt);
      }
      if (this.waitingForServe) {
        this._updatePositionFromGround();
        this.handlePaddleCollision(paddles.player, 1, layout);
        this.handlePaddleCollision(paddles.ai, -1, layout);
        this.syncVisuals();
        return;
      }
      this.zVelocity -= this.tuning.gravity * dt;
      this.z += this.zVelocity * dt;
      this.justBounced = false;
      const maxZ = 35;
      if (this.z > maxZ) {
        this.z = maxZ;
        this.zVelocity = Math.min(this.zVelocity, 0);
      }
      const overTableForBounce = pointInsideTable(layout, this.groundPos.x, this.groundPos.y);
      if (this.z <= 0) {
        if (overTableForBounce) {
          this.z = 0;
          if (this.zVelocity < -8) {
            this.zVelocity = Math.max(
              Math.abs(this.zVelocity) * this.tuning.tableBounce,
              this.tuning.minBounceZSpeed
            );
            this.justBounced = true;
            this.lastBounceSide = this.groundPos.y < layout.y ? "top" : "bottom";
            this.lastBounceHitBy = this.lastHitBy;
            this.bounceCountSinceHit += 1;
            this.spawnBounceRing();
            const bounceIntensity = Math.min(Math.abs(this.zVelocity) / this.tuning.launchZSpeed, 1);
            soundManager.play("tableBounce", { intensity: 0.3 + bounceIntensity * 0.7 });
          } else {
            this.zVelocity = 0;
          }
        } else {
          const floorZ = -100;
          if (this.z <= floorZ) {
            this.z = floorZ;
            this.zVelocity = 0;
          }
        }
      }
      this.groundPos.x += this.velocity.x * dt;
      this.groundPos.y += this.velocity.y * dt;
      this._updatePositionFromGround();
      this.handlePaddleCollision(paddles.player, 1, layout);
      this.handlePaddleCollision(paddles.ai, -1, layout);
      const margin = this.baseRadius * 2 + 10;
      const outLeft = this.position.x < -margin;
      const outRight = this.position.x > layout.width + margin;
      const outTop = this.position.y < -margin;
      const outBottom = this.position.y > layout.height + margin;
      if (outTop || outBottom || outLeft || outRight) {
        this.isLive = false;
        let side;
        if (outTop) {
          side = "top";
        } else if (outBottom) {
          side = "bottom";
        } else {
          side = this.groundPos.y < layout.y ? "top" : "bottom";
        }
        this.onOut(side, this.lastHitBy, this.lastBounceSide, this.lastBounceHitBy, this.bounceCountSinceHit);
      }
      const overTable = pointInsideTable(layout, this.groundPos.x, this.groundPos.y);
      if (!overTable && this.z < 0) {
        const floorZ = -100;
        const fallDepth = clamp(this.z / floorZ, 0, 1);
        this.offTableFallScale = 1 - fallDepth * 0.7;
        if (fallDepth > 0.85 && !this.groundBouncePlayed) {
          this.groundBouncePlayed = true;
          soundManager.play("groundBounce");
        }
      } else {
        this.offTableFallScale = 1;
      }
      if (this.bounceRingLife > 0) {
        this.bounceRingLife -= dt * 3.5;
        const t = clamp(this.bounceRingLife, 0, 1);
        const ringScale = 1 + (1 - t) * 1.4;
        this.bounceRing.setScale(ringScale);
        this.bounceRing.setStrokeStyle(Math.max(1, 3 * t), 16777215, t * 0.45);
      }
      this.syncVisuals();
    }
    handlePaddleCollision(paddle, directionSign, layout) {
      const paddleKey = directionSign === 1 ? "player" : "ai";
      if (this.paddleHitCooldown[paddleKey] > 0) {
        return;
      }
      const effectiveRadius = this.baseRadius * (1 + (this.visualScale - 1) * 0.5);
      const dx = this.position.x - paddle.position.x;
      const dy = this.position.y - paddle.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = effectiveRadius + paddle.radius * 0.93;
      if (distance > minDistance || distance === 0) {
        return;
      }
      const normal = new phaser_shim_default.Math.Vector2(dx / distance, dy / distance);
      const approaching = this.velocity.dot(normal);
      if (approaching >= 0 && !this.waitingForServe) {
        return;
      }
      const rawTangent = clamp(
        (this.position.x - paddle.position.x) / paddle.radius,
        -1,
        1
      );
      const tangentOffset = Math.sign(rawTangent) * Math.pow(Math.abs(rawTangent), 0.55);
      const influenceX = tangentOffset * this.tuning.angleInfluence * 420;
      const isAI = directionSign === -1;
      const velDampen = isAI ? this.tuning.aiVelDampen : 1;
      const onPC = isPC();
      const maxSwipeVel = onPC ? 1700 : 650;
      const rawSwipeX = paddle.velocity.x * this.tuning.paddleInfluence * velDampen;
      const rawSwipeY = paddle.velocity.y * this.tuning.paddleInfluence * 0.5 * velDampen;
      const swipeX = clamp(rawSwipeX, -maxSwipeVel, maxSwipeVel);
      const swipeY = clamp(rawSwipeY, -maxSwipeVel * 0.5, maxSwipeVel * 0.5);
      const outgoingY = directionSign === 1 ? -1 : 1;
      const sepX = paddle.position.x + normal.x * (minDistance + 1.5);
      const sepY = paddle.position.y + normal.y * (minDistance + 1.5);
      const { zOffset } = this._computeZVisuals();
      this.groundPos.x = sepX;
      this.groundPos.y = sepY + zOffset;
      this.position.set(sepX, sepY);
      const playerSwipeMulX = onPC && !isAI ? 0.28 : 0.1;
      const playerSwipeMulY = onPC && !isAI ? 0.2 : 0.07;
      const swipeContribution = Math.abs(swipeX) * playerSwipeMulX + Math.abs(swipeY) * playerSwipeMulY;
      const rallyRamp = Math.min(this.rallyCount * this.tuning.rallyAcceleration, 180);
      const targetSpeed = Math.min(
        this.tuning.baseBallSpeed + rallyRamp + swipeContribution,
        this.tuning.ballMaxSpeed
      );
      const launchVector = new phaser_shim_default.Math.Vector2(
        this.velocity.x * 0.12 + influenceX + swipeX,
        outgoingY * targetSpeed + swipeY
      );
      if (directionSign === -1) {
        launchVector.x += paddle.velocity.x * this.tuning.aiReturnBoost * velDampen;
      }
      let finalSpeed = targetSpeed;
      this.velocity.copy(
        launchVector.normalize().scale(finalSpeed)
      );
      const minForwardSpeed = this.tuning.baseBallSpeed * 0.55;
      const currentForwardSpeed = Math.abs(this.velocity.y);
      if (currentForwardSpeed < minForwardSpeed) {
        const boost = minForwardSpeed / Math.max(currentForwardSpeed, 1);
        this.velocity.scale(boost);
      }
      if (Math.sign(this.velocity.y) !== outgoingY) {
        this.velocity.y = outgoingY * Math.abs(this.velocity.y);
      }
      if (isAI) {
        this._applyAISoftLock(layout);
      } else {
        this._applyPlayerSoftLock(layout);
      }
      const effectiveVel = paddle.velocity.length() * (isAI ? velDampen : 1);
      const swipeStrength = clamp(effectiveVel / 1200, 0.5, 1.2);
      const minArcStrength = 0.7;
      const effectiveStrength = Math.max(swipeStrength, minArcStrength);
      this.zVelocity = this.tuning.launchZSpeed * effectiveStrength;
      this.z = Math.max(this.z, 0.5);
      this.lastHitBy = directionSign === 1 ? "player" : "ai";
      this.lastBounceSide = null;
      this.lastBounceHitBy = null;
      this.bounceCountSinceHit = 0;
      if (this.waitingForServe) {
        this.waitingForServe = false;
      }
      this.rallyCount += 1;
      this.paddleHitCooldown[paddleKey] = 0.15;
      const hitIntensity = clamp(finalSpeed / this.tuning.ballMaxSpeed, 0.4, 1);
      soundManager.play("paddleHit", { intensity: hitIntensity });
    }
    /**
     * After the AI hits the ball, nudge the velocity so the ball's
     * ground-projected landing X falls within the table.
     *
     * We estimate the time for the ball to travel from its current
     * ground Y to the opponent's half of the table (the target Y where
     * the ball should bounce). Using that time we figure out where the
     * ball would land horizontally. If it would miss the table, we
     * clamp velocity.x so it lands just inside the table edge, with a
     * small inward margin for aesthetics.
     *
     * This preserves the AI's natural angle variation while preventing
     * wild out-of-bounds shots that gift free points to the player.
     */
    _applyAISoftLock(layout) {
      const vy = Math.abs(this.velocity.y);
      if (vy < 10) return;
      const targetY = layout.y + layout.tableHeight * 0.25;
      const distY = Math.abs(targetY - this.groundPos.y);
      const travelTime = distY / vy;
      const projectedX = this.groundPos.x + this.velocity.x * travelTime;
      const margin = layout.tableWidth * this.tuning.aiSoftLockMargin;
      const minX = layout.left + margin;
      const maxX = layout.right - margin;
      if (projectedX >= minX && projectedX <= maxX) {
        return;
      }
      const clampedX = clamp(projectedX, minX, maxX);
      const newVx = (clampedX - this.groundPos.x) / travelTime;
      const speed = this.velocity.length();
      this.velocity.x = newVx;
      this.velocity.normalize().scale(speed);
      if (this.velocity.y < 0) {
        this.velocity.y = Math.abs(this.velocity.y);
      }
    }
    /**
     * Tight soft-lock for player shots.
     *
     * Ensures the ball almost always lands on the opponent's half of the
     * table. The player can still aim for edges and corners — the lock
     * only activates when the projected landing would miss — and it
     * smoothly steers the trajectory back to the nearest table edge
     * rather than snapping. This makes the assist invisible: the player
     * feels skillful, not corrected.
     *
     * Uses a small inward margin so edge-clipping shots land cleanly
     * inside the line, similar to the AI lock but slightly more generous
     * so wide cross-court angles still feel rewarding.
     */
    _applyPlayerSoftLock(layout) {
      const vy = Math.abs(this.velocity.y);
      if (vy < 10) return;
      const targetY = layout.y - layout.tableHeight * 0.25;
      const distY = Math.abs(targetY - this.groundPos.y);
      const travelTime = distY / vy;
      const projectedX = this.groundPos.x + this.velocity.x * travelTime;
      const edgeMarginScale = isPC() ? 0.04 : 0.015;
      const edgeMargin = layout.tableWidth * edgeMarginScale;
      const minX = layout.left - edgeMargin;
      const maxX = layout.right + edgeMargin;
      if (projectedX >= minX && projectedX <= maxX) {
        return;
      }
      const clampedX = clamp(projectedX, minX, maxX);
      const newVx = (clampedX - this.groundPos.x) / travelTime;
      const speed = this.velocity.length();
      this.velocity.x = newVx;
      this.velocity.normalize().scale(speed);
      if (this.velocity.y > 0) {
        this.velocity.y = -Math.abs(this.velocity.y);
      }
    }
    spawnBounceRing() {
      this.bounceRingLife = 1;
      this.bounceRing.setPosition(this.groundPos.x, this.groundPos.y);
      this.bounceRing.setScale(1);
    }
    syncVisuals() {
      const { zFraction, visualScale, zOffset } = this._computeZVisuals();
      const finalScale = visualScale;
      this.outer.setPosition(this.position.x, this.position.y);
      this.outer.setScale(finalScale);
      this.inner.setPosition(this.position.x, this.position.y);
      this.inner.setScale(finalScale);
      const belowTable = this.z < 0;
      const fallFade = belowTable ? clamp(1 + this.z / 30, 0, 1) : 1;
      const shadowScale = (1 - zFraction * 0.4) * fallFade;
      const shadowAlpha = (0.25 - zFraction * 0.18) * fallFade;
      this.shadow.setPosition(this.groundPos.x, this.groundPos.y);
      this.shadow.setScale(shadowScale);
      this.shadow.setAlpha(Math.max(0.02, shadowAlpha));
      if (this.justBounced) {
        this.outer.setScale(finalScale * 1.15, finalScale * 0.8);
        this.inner.setScale(finalScale * 1.15, finalScale * 0.8);
      }
      this.radius = this.baseRadius;
      this.visualScale = visualScale;
      this.collisionRadius = this.baseRadius * (1 + (visualScale - 1) * 0.5);
    }
  };

  // systems/GameManager.js
  var GameManager = class {
    constructor(scene, ball, tuning2, getLayout2) {
      this.scene = scene;
      this.ball = ball;
      this.tuning = tuning2;
      this.getLayout = getLayout2;
      this.respawnTimer = null;
      this.lastOut = "bottom";
      this.serveSide = 1;
    }
    handleBallOut(side, lastHitBy, lastBounceSide, lastBounceHitBy, bounceCountSinceHit) {
      this.lastOut = side;
      let scorer;
      if (lastHitBy) {
        const opponentSide = lastHitBy === "player" ? "top" : "bottom";
        const validBounce = lastBounceSide === opponentSide && lastBounceHitBy === lastHitBy && bounceCountSinceHit >= 1;
        if (!validBounce) {
          scorer = lastHitBy === "player" ? "ai" : "player";
        } else {
          scorer = lastHitBy;
        }
      } else {
        scorer = side === "top" ? "player" : "ai";
      }
      this.serveSide = scorer === "player" ? 1 : -1;
      if (this.scene.addScore) {
        this.scene.addScore(side, lastHitBy, lastBounceSide, lastBounceHitBy, bounceCountSinceHit);
      }
      if (this.scene.gameOver) return;
      if (this.respawnTimer) {
        this.respawnTimer.remove(false);
      }
      this.respawnTimer = this.scene.time.delayedCall(this.tuning.outResetDelay * 1e3, () => {
        this.ball.placeForServe(this.getLayout(), this.serveSide);
      });
    }
    /**
     * Initial reset — start of game or restart.
     * First serve always goes to the player.
     */
    reset() {
      this.serveSide = 1;
      this.ball.placeForServe(this.getLayout(), this.serveSide);
    }
  };

  // systems/BallTrail.js
  var BallTrail = class {
    constructor(scene, maxPoints = 64) {
      this.scene = scene;
      this.graphics = scene.add.graphics().setDepth(5.5);
      this.maxPoints = maxPoints;
      this.history = [];
      this.trailColor = 16777215;
      this.trailColorDark = 13421772;
      this.baseAlpha = 0.7;
      this.maxWidth = 2;
      this.minWidth = 0.3;
      this.speedThreshold = 8;
    }
    reset() {
      this.history.length = 0;
      this.graphics.clear();
    }
    update(ball, layout) {
      this.graphics.clear();
      if (!ball.isLive || ball.waitingForServe) {
        this.history.length = 0;
        return;
      }
      const bx = ball.position.x;
      const by = ball.position.y;
      const speed = ball.velocity.length();
      this.history.unshift({ x: bx, y: by });
      if (this.history.length > this.maxPoints) {
        this.history.length = this.maxPoints;
      }
      if (this.history.length < 2 || speed < this.speedThreshold) {
        return;
      }
      const r = layout.ballRadius;
      const fallScale = ball.offTableFallScale !== void 0 ? ball.offTableFallScale : 1;
      const speedFraction = clamp((speed - this.speedThreshold) / 250, 0, 1);
      const usablePoints = Math.max(2, Math.ceil(this.history.length * Math.max(speedFraction, 0.5)));
      const count = Math.min(usablePoints, this.history.length);
      for (let i = 0; i < count - 1; i++) {
        const t = i / (count - 1);
        const p0 = this.history[i];
        const p1 = this.history[i + 1];
        const width = r * phaser_shim_default.Math.Linear(this.maxWidth, this.minWidth, t) * fallScale;
        const alphaT = 1 - t;
        const alpha = this.baseAlpha * alphaT * (0.4 + 0.6 * alphaT) * fallScale;
        if (alpha < 0.01 || width < 0.2) continue;
        this.graphics.lineStyle(width + 1.5 * fallScale, this.trailColorDark, alpha * 0.2);
        this.graphics.beginPath();
        this.graphics.moveTo(p0.x, p0.y);
        this.graphics.lineTo(p1.x, p1.y);
        this.graphics.strokePath();
        this.graphics.lineStyle(width, this.trailColor, alpha);
        this.graphics.beginPath();
        this.graphics.moveTo(p0.x, p0.y);
        this.graphics.lineTo(p1.x, p1.y);
        this.graphics.strokePath();
      }
    }
    destroy() {
      if (this.graphics) {
        this.graphics.destroy();
        this.graphics = null;
      }
      this.history.length = 0;
    }
  };

  // ui/settings.js
  var KEY = "samix.pocketpong.v1";
  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }
  function save(patch) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...load(), ...patch }));
    } catch {
    }
  }
  function getSavedDifficulty() {
    return load().difficulty || null;
  }
  function saveDifficulty(key) {
    save({ difficulty: key });
  }
  function getRecord() {
    const r = load().record || {};
    return { wins: Number(r.wins) || 0, losses: Number(r.losses) || 0 };
  }
  function recordResult(playerWon) {
    const r = getRecord();
    if (playerWon) r.wins += 1;
    else r.losses += 1;
    save({ record: r });
  }
  var ICON_ON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  function initSettings() {
    soundManager.muted = !!load().muted;
    const toggles = [...document.querySelectorAll("[data-sound-toggle]")];
    const render = () => {
      const muted = soundManager.muted;
      toggles.forEach((el) => {
        const label = muted ? "Sound off" : "Sound on";
        el.setAttribute("aria-pressed", muted ? "true" : "false");
        if (el.classList.contains("icon-toggle")) {
          el.innerHTML = muted ? ICON_OFF : ICON_ON;
          el.setAttribute("aria-label", label);
        } else {
          el.textContent = label;
        }
      });
    };
    toggles.forEach((el) => {
      el.addEventListener("click", () => {
        soundManager.init();
        soundManager.muted = !soundManager.muted;
        save({ muted: soundManager.muted });
        render();
        if (!soundManager.muted) soundManager.play("buttonClick");
      });
    });
    render();
    const recordEl = document.getElementById("record");
    if (recordEl) {
      const { wins, losses } = getRecord();
      if (wins + losses > 0) {
        recordEl.textContent = `Record  ${wins} W \xB7 ${losses} L`;
        recordEl.hidden = false;
      }
    }
  }

  // scenes/GameScene.js
  var GameScene = class extends phaser_shim_default.Scene {
    constructor() {
      super("game");
      this.playerScore = 0;
      this.aiScore = 0;
      this.gameOver = false;
    }
    create() {
      this.cameras.main.setBackgroundColor(colors.bgTop);
      this._countdownActive = true;
      this._countdownElapsed = 0;
      this._countdownStep = -1;
      this._countdownDuration = 3.6;
      this.layout = getLayout(this.scale);
      this.inputSystem = new InputSystem(this, () => this.layout);
      this.playerController = new PlayerPaddleController(this.inputSystem);
      this.aiController = new AIPaddleController(tuning);
      this.buildBackground();
      this.buildTable();
      this.buildScoreUI();
      this.buildCountdownUI();
      this.playerPaddle = new Paddle(this, colors.player, colors.playerDark, colors.playerHandle, true);
      this.aiPaddle = new Paddle(this, colors.ai, colors.aiDark, colors.aiHandle, false);
      this.ball = new BallPhysics(this, tuning, (side, lastHitBy, lastBounceSide, lastBounceHitBy, bounceCountSinceHit) => this.gameManager.handleBallOut(side, lastHitBy, lastBounceSide, lastBounceHitBy, bounceCountSinceHit));
      this.gameManager = new GameManager(this, this.ball, tuning, () => this.layout);
      this.ballTrail = new BallTrail(this);
      this.applyLayout();
      this.ball.outer.setVisible(false);
      this.ball.inner.setVisible(false);
      this.ball.shadow.setVisible(false);
      this.ball.isLive = false;
      this.scale.on("resize", this.handleResize, this);
      this.events.on("resume", () => this.inputSystem.reset());
      gameState.setReady("scene");
    }
    buildBackground() {
      this.bg = this.add.graphics().setDepth(-20);
    }
    buildTable() {
      this.tableShadow = this.add.graphics().setDepth(-8);
      this.tableBase = this.add.graphics().setDepth(-7);
      this.tableLines = this.add.graphics().setDepth(-6);
    }
    buildScoreUI() {
      this.scoreCircle = this.add.graphics().setDepth(25);
      this.aiLabel = this.add.text(0, 0, "AI", {
        fontFamily: uiFontFamily,
        fontStyle: "600",
        fontSize: "10px",
        color: "#64d2ff",
        align: "center"
      }).setDepth(26).setOrigin(0.5, 0.5).setAlpha(0.7);
      this.aiScoreText = this.add.text(0, 0, "0", {
        fontFamily: uiFontFamily,
        fontStyle: "700",
        fontSize: "14px",
        color: "#64d2ff",
        align: "center"
      }).setDepth(26).setOrigin(0.5, 0.5);
      this.scoreDivider = this.add.graphics().setDepth(26);
      this.playerScoreText = this.add.text(0, 0, "0", {
        fontFamily: uiFontFamily,
        fontStyle: "700",
        fontSize: "14px",
        color: "#ff8a82",
        align: "center"
      }).setDepth(26).setOrigin(0.5, 0.5);
      this.playerLabel = this.add.text(0, 0, "YOU", {
        fontFamily: uiFontFamily,
        fontStyle: "600",
        fontSize: "10px",
        color: "#ff8a82",
        align: "center"
      }).setDepth(26).setOrigin(0.5, 0.5).setAlpha(0.7);
    }
    buildCountdownUI() {
      this._cdOverlayEl = document.getElementById("countdown-overlay");
      this._cdNumberEl = document.getElementById("countdown-number");
      this._cdSubEl = document.getElementById("countdown-sub");
      this._cdBadgeEl = document.getElementById("countdown-badge");
      if (this._cdOverlayEl) {
        this._cdOverlayEl.classList.remove("hidden", "fade-out");
        this._cdNumberEl.textContent = "";
        this._cdNumberEl.className = "countdown-number";
        this._cdSubEl.className = "countdown-sub";
        this._cdBadgeEl.className = "countdown-badge";
      }
    }
    applyLayout() {
      this.layout = getLayout(this.scale);
      const { layout } = this;
      this.drawBackground(layout);
      this.drawTable(layout);
      this.positionHud(layout);
      this.playerPaddle.setSize(layout.paddleRadius, layout.handleLength);
      this.aiPaddle.setSize(layout.paddleRadius, layout.handleLength);
      this.ball.resize(layout.ballRadius);
      if (!this.playerPaddle.position.lengthSq()) {
        this.playerPaddle.placeAtHome(layout);
      } else {
        this.playerPaddle.reclampToLayout(layout);
      }
      if (!this.aiPaddle.position.lengthSq()) {
        this.aiPaddle.placeAtHome(layout);
      } else {
        this.aiPaddle.reclampToLayout(layout);
      }
      this.aiController.reset(layout);
      this.ball.resize(layout.ballRadius);
      if (this.ball.isLive) {
        this.ball.syncVisuals();
      }
    }
    drawBackground(layout) {
      this.bg.clear();
      this.bg.fillStyle(colors.bgTop, 1);
      this.bg.fillRect(0, 0, layout.width, layout.height);
    }
    drawTable(layout) {
      const borderWidth = Math.max(8, layout.minDimension * 0.032);
      const x = layout.left;
      const y = layout.top;
      const w = layout.tableWidth;
      const h = layout.tableHeight;
      const corner = 3;
      this.tableShadow.clear();
      this.tableShadow.fillStyle(0, 0.1);
      this.tableShadow.fillRoundedRect(x + 5, y + 7, w, h, corner);
      this.tableBase.clear();
      this.tableBase.fillStyle(colors.table, 1);
      this.tableBase.fillRoundedRect(x, y, w, h, corner);
      this.tableBase.lineStyle(borderWidth, colors.tableBorder, 1);
      this.tableBase.strokeRoundedRect(x, y, w, h, corner);
      const lineW = Math.max(3, layout.minDimension * 0.014);
      const halfBorder = borderWidth * 0.5;
      this.tableLines.clear();
      this.tableLines.lineStyle(lineW, 16777215, 1);
      this.tableLines.lineBetween(x + halfBorder, layout.y, x + w - halfBorder, layout.y);
      this.tableLines.lineBetween(layout.x, y + halfBorder, layout.x, y + h - halfBorder);
    }
    positionHud(layout) {
      const spaceLeft = layout.left;
      const isMobile2 = layout.width < 600 || spaceLeft < 50;
      const scoreFontSize = isMobile2 ? Math.max(24, layout.minDimension * 0.13) : Math.max(22, layout.minDimension * 0.11);
      const labelFontSize = isMobile2 ? Math.max(11, scoreFontSize * 0.4) : Math.max(11, scoreFontSize * 0.46);
      const panelW = isMobile2 ? Math.max(54, scoreFontSize * 2.4) : Math.max(54, scoreFontSize * 2.8);
      const panelH = isMobile2 ? Math.max(120, scoreFontSize * 5.5) : Math.max(110, scoreFontSize * 6.2);
      const panelR = Math.min(panelW * 0.32, 14);
      const panelX = isMobile2 ? Math.max(4, spaceLeft * 0.5) - panelW * 0.5 + panelW * 0.5 : spaceLeft * 0.5;
      const panelY = layout.y;
      this.scoreCircle.clear();
      this.scoreCircle.fillStyle(1842208, 0.88);
      this.scoreCircle.fillRoundedRect(
        panelX - panelW / 2,
        panelY - panelH / 2,
        panelW,
        panelH,
        panelR
      );
      this.scoreCircle.lineStyle(1.5, 16777215, 0.1);
      this.scoreCircle.strokeRoundedRect(
        panelX - panelW / 2,
        panelY - panelH / 2,
        panelW,
        panelH,
        panelR
      );
      const verticalSpread = panelH * 0.38;
      this.aiLabel.setPosition(panelX, panelY - verticalSpread - labelFontSize * 0.6);
      this.aiLabel.setFontSize(labelFontSize);
      this.aiScoreText.setPosition(panelX, panelY - verticalSpread * 0.5);
      this.aiScoreText.setFontSize(scoreFontSize);
      const dividerW = panelW * 0.5;
      this.scoreDivider.clear();
      this.scoreDivider.lineStyle(1.5, 16777215, 0.3);
      this.scoreDivider.lineBetween(
        panelX - dividerW / 2,
        panelY,
        panelX + dividerW / 2,
        panelY
      );
      this.playerScoreText.setPosition(panelX, panelY + verticalSpread * 0.5);
      this.playerScoreText.setFontSize(scoreFontSize);
      this.playerLabel.setPosition(panelX, panelY + verticalSpread + labelFontSize * 0.6);
      this.playerLabel.setFontSize(labelFontSize);
    }
    handleResize() {
      this.applyLayout();
    }
    update(_time, delta) {
      const rawDt = delta / 1e3;
      if (this._countdownActive) {
        this._updateCountdown(rawDt);
        return;
      }
      if (this.gameOver) return;
      const dt = Math.min(rawDt, 0.033);
      const { layout } = this;
      this.playerController.update(this.playerPaddle, layout);
      this.aiController.update(this.aiPaddle, this.ball, layout, dt);
      this.playerPaddle.update(dt, layout);
      this.aiPaddle.update(dt, layout);
      this.ball.update(dt, layout, {
        player: this.playerPaddle,
        ai: this.aiPaddle
      });
      this.ballTrail.update(this.ball, this.layout);
      this.updateHud();
    }
    // ─── Countdown logic (HTML overlay) ──────────────────────────────
    _updateCountdown(rawDt) {
      const dt = Math.min(rawDt, 0.1);
      this._countdownElapsed += dt;
      const stepDuration = this._countdownDuration / 4;
      const currentStep = Math.floor(this._countdownElapsed / stepDuration);
      const stepProgress = this._countdownElapsed % stepDuration / stepDuration;
      if (currentStep !== this._countdownStep) {
        this._countdownStep = currentStep;
        const labels = ["3", "2", "1", "GO!"];
        const label = labels[Math.min(currentStep, 3)];
        if (this._cdNumberEl) {
          this._cdNumberEl.className = "countdown-number";
          this._cdNumberEl.textContent = label;
          if (currentStep === 3) {
            this._cdNumberEl.classList.add("go");
          }
          void this._cdNumberEl.offsetWidth;
          this._cdNumberEl.classList.add("pop");
        }
        if (currentStep === 0) {
          if (this._cdBadgeEl) this._cdBadgeEl.classList.add("visible");
          if (this._cdSubEl) this._cdSubEl.classList.add("visible");
        }
        if (currentStep === 1 && this._cdSubEl) {
          this._cdSubEl.classList.remove("visible");
        }
        if (currentStep <= 2) {
          soundManager.play("countdownTick");
        } else if (currentStep === 3) {
          soundManager.play("countdownGo");
        }
      }
      if (currentStep <= 3 && stepProgress > 0.65 && this._cdNumberEl) {
        if (!this._cdNumberEl.classList.contains("shrink")) {
          this._cdNumberEl.classList.remove("pop");
          void this._cdNumberEl.offsetWidth;
          this._cdNumberEl.classList.add("shrink");
        }
      }
      if (this._countdownElapsed >= this._countdownDuration) {
        this._countdownActive = false;
        if (this._cdOverlayEl) {
          this._cdOverlayEl.classList.add("fade-out");
          const overlayRef = this._cdOverlayEl;
          setTimeout(() => {
            overlayRef.classList.add("hidden");
            overlayRef.classList.remove("fade-out");
          }, 400);
        }
        this._cdOverlayEl = null;
        this._cdNumberEl = null;
        this._cdSubEl = null;
        this._cdBadgeEl = null;
        this.gameManager.reset();
      }
    }
    updateHud() {
      this.aiScoreText.setText(`${this.aiScore}`);
      this.playerScoreText.setText(`${this.playerScore}`);
    }
    addScore(side, lastHitBy, lastBounceSide, lastBounceHitBy, bounceCountSinceHit) {
      let scorer;
      if (lastHitBy) {
        const opponentSide = lastHitBy === "player" ? "top" : "bottom";
        const validBounce = lastBounceSide === opponentSide && lastBounceHitBy === lastHitBy && bounceCountSinceHit >= 1;
        if (!validBounce) {
          scorer = lastHitBy === "player" ? "ai" : "player";
        } else {
          scorer = lastHitBy;
        }
      } else {
        scorer = side === "top" ? "player" : "ai";
      }
      if (scorer === "player") {
        this.playerScore += 1;
        soundManager.play("score");
      } else {
        this.aiScore += 1;
        soundManager.play("scoreLost");
      }
      const winScore = tuning.winScore || 7;
      if (this.playerScore >= winScore || this.aiScore >= winScore) {
        this.triggerGameOver(this.playerScore >= winScore ? "player" : "ai");
      }
    }
    triggerGameOver(winner) {
      this.gameOver = true;
      if (this.gameManager.respawnTimer) {
        this.gameManager.respawnTimer.remove(false);
        this.gameManager.respawnTimer = null;
      }
      this.ball.isLive = false;
      this.ball.outer.setVisible(false);
      this.ball.inner.setVisible(false);
      this.ball.shadow.setVisible(false);
      this.ballTrail.reset();
      this.updateHud();
      this.game.events.emit("samix-gameover");
      const overlay = document.getElementById("game-over-overlay");
      const titleEl = document.getElementById("game-over-title");
      const scoreEl = document.getElementById("game-over-score");
      const eyebrowEl = document.getElementById("game-over-eyebrow");
      const btn = document.getElementById("play-again-btn");
      if (!overlay) return;
      const playerWon = winner === "player";
      recordResult(playerWon);
      if (eyebrowEl) eyebrowEl.textContent = playerWon ? "Victory" : "Match over";
      titleEl.textContent = playerWon ? "You Win" : "You Lose";
      titleEl.className = "game-over-title " + (playerWon ? "win" : "lose");
      scoreEl.innerHTML = "";
      const youEl = document.createElement("span");
      youEl.className = "score-you";
      youEl.textContent = String(this.playerScore);
      const sepEl = document.createElement("span");
      sepEl.className = "score-sep";
      sepEl.textContent = ":";
      const aiEl = document.createElement("span");
      aiEl.className = "score-ai";
      aiEl.textContent = String(this.aiScore);
      scoreEl.append(youEl, sepEl, aiEl);
      overlay.classList.remove("hidden");
      void overlay.offsetWidth;
      overlay.classList.add("visible");
      const handlePlayAgain = () => {
        btn.removeEventListener("click", handlePlayAgain);
        menuBtn.removeEventListener("click", handleMainMenu);
        soundManager.play("buttonClick");
        this.restartGame();
      };
      btn.addEventListener("click", handlePlayAgain);
      const menuBtn = document.getElementById("main-menu-btn");
      const handleMainMenu = () => {
        menuBtn.removeEventListener("click", handleMainMenu);
        btn.removeEventListener("click", handlePlayAgain);
        soundManager.play("buttonClick");
        window.location.reload();
      };
      if (menuBtn) menuBtn.addEventListener("click", handleMainMenu);
    }
    restartGame() {
      const overlay = document.getElementById("game-over-overlay");
      if (overlay) {
        overlay.classList.remove("visible");
        setTimeout(() => {
          overlay.classList.add("hidden");
        }, 500);
      }
      this.game.events.emit("samix-restart");
      this.playerScore = 0;
      this.aiScore = 0;
      this.gameOver = false;
      this.updateHud();
      this.ballTrail.reset();
      this.playerPaddle.placeAtHome(this.layout);
      this.aiPaddle.placeAtHome(this.layout);
      this.aiController.reset(this.layout);
      if (this.gameManager.respawnTimer) {
        this.gameManager.respawnTimer.remove(false);
        this.gameManager.respawnTimer = null;
      }
      if (!this._countdownActive) {
        this.gameManager.reset();
      }
    }
  };

  // ui/TuningPanel.js
  function createTuningPanel(tuning2) {
    const root = document.getElementById("panel-root");
    if (!root) {
      return;
    }
    root.innerHTML = "";
    tuneSchema.forEach((group) => {
      const section = document.createElement("section");
      section.className = "tuning-group";
      const heading = document.createElement("h3");
      heading.className = "tuning-title";
      heading.textContent = group.title;
      section.appendChild(heading);
      group.fields.forEach((field) => {
        const row = document.createElement("label");
        row.className = "tuning-row";
        const label = document.createElement("div");
        label.className = "tuning-label";
        const name = document.createElement("span");
        name.textContent = field.label;
        const value = document.createElement("span");
        value.textContent = formatValue(tuning2[field.key], field.step);
        label.append(name, value);
        const input = document.createElement("input");
        input.type = "range";
        input.min = String(field.min);
        input.max = String(field.max);
        input.step = String(field.step);
        input.value = String(tuning2[field.key]);
        input.addEventListener("input", () => {
          const nextValue = Number(input.value);
          tuning2[field.key] = nextValue;
          value.textContent = formatValue(nextValue, field.step);
        });
        row.append(label, input);
        section.appendChild(row);
      });
      root.appendChild(section);
    });
  }
  function formatValue(value, step) {
    return step >= 1 ? String(Math.round(value)) : value.toFixed(step < 0.1 ? 2 : 1);
  }

  // ui/startScreen.js
  var DIFFICULTY_HINTS = {
    easy: "Relaxed rallies \u2014 ideal for warming up.",
    normal: "A balanced opponent \u2014 a fair fight.",
    hard: "Fast and precise \u2014 for experts."
  };
  var FONT_TIMEOUT_MS = 2500;
  async function preloadFonts() {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS))
        ]);
      }
    } catch {
    }
    gameState.setReady("fonts");
  }
  function watchBootReady() {
    let signalled = false;
    const check = () => {
      if (signalled || !gameState.isReady("phaser") || !gameState.isReady("fonts")) return;
      signalled = true;
      if (window.SAMIX && typeof window.SAMIX.ready === "function") {
        window.SAMIX.ready();
      } else {
        document.body.classList.add("app-ready");
      }
    };
    gameState.on("ready", check);
    check();
  }
  function setButtonLoading(btn, loading, text = "Loading\u2026") {
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = text;
      btn.classList.add("loading");
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalText || "Start Match";
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  }
  function dismissStartScreen() {
    const screen = document.getElementById("start-screen");
    if (!screen || screen.classList.contains("hidden")) return;
    screen.classList.add("hidden");
    screen.addEventListener("transitionend", () => screen.remove(), { once: true });
    setTimeout(() => {
      if (screen.parentNode) screen.remove();
    }, 600);
  }
  function getDifficultyIndex(key) {
    const index = difficultyOptions.findIndex((option) => option.key === key);
    return index >= 0 ? index : 1;
  }
  function renderDifficultySegments(container, onSelect) {
    container.innerHTML = "";
    container.style.setProperty("--seg-count", String(difficultyOptions.length));
    const thumb = document.createElement("span");
    thumb.className = "segmented-thumb";
    thumb.setAttribute("aria-hidden", "true");
    container.appendChild(thumb);
    difficultyOptions.forEach((option, index) => {
      const segment = document.createElement("button");
      segment.type = "button";
      segment.className = "difficulty-step";
      segment.dataset.index = String(index);
      segment.setAttribute("role", "radio");
      segment.textContent = option.label;
      segment.addEventListener("click", () => onSelect(index, true));
      container.appendChild(segment);
    });
  }
  function initStartScreen() {
    preloadFonts();
    watchBootReady();
    const playBtn = document.getElementById("start-btn");
    const startMenuPanel = document.getElementById("start-menu-panel");
    const difficultyPanel = document.getElementById("difficulty-panel");
    const segmented = document.getElementById("difficulty-slider-labels");
    const hint = document.getElementById("difficulty-hint");
    const backBtn = document.getElementById("difficulty-back-btn");
    const confirmBtn = document.getElementById("difficulty-confirm-btn");
    if (!playBtn || !startMenuPanel || !difficultyPanel || !segmented || !confirmBtn) {
      return;
    }
    let selectedIndex = getDifficultyIndex(getSavedDifficulty() || getCurrentDifficulty());
    const applySelection = (index, focus = false) => {
      selectedIndex = Math.max(0, Math.min(index, difficultyOptions.length - 1));
      const option = difficultyOptions[selectedIndex];
      saveDifficulty(option.key);
      segmented.style.setProperty("--seg-index", String(selectedIndex));
      difficultyPanel.style.setProperty("--difficulty-color", option.color);
      if (hint) hint.textContent = DIFFICULTY_HINTS[option.key] || "";
      segmented.querySelectorAll(".difficulty-step").forEach((step, stepIndex) => {
        const active = stepIndex === selectedIndex;
        step.classList.toggle("active", active);
        step.setAttribute("aria-checked", active ? "true" : "false");
        step.tabIndex = active ? 0 : -1;
        if (active && focus) step.focus({ preventScroll: true });
      });
    };
    renderDifficultySegments(segmented, (index, fromUser) => {
      if (fromUser) soundManager.init();
      applySelection(index);
    });
    applySelection(selectedIndex);
    segmented.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        applySelection(selectedIndex + 1, true);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        applySelection(selectedIndex - 1, true);
      }
    });
    gameState.on("statechange", ({ to }) => {
      if (to === "playing") {
        dismissStartScreen();
      }
    });
    playBtn.addEventListener("click", () => {
      soundManager.init();
      soundManager.play("buttonClick");
      startMenuPanel.classList.add("hidden");
      difficultyPanel.classList.remove("hidden");
    });
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        soundManager.init();
        soundManager.play("buttonClick");
        difficultyPanel.classList.add("hidden");
        startMenuPanel.classList.remove("hidden");
      });
    }
    confirmBtn.addEventListener("click", () => {
      soundManager.init();
      soundManager.play("buttonClick");
      applyDifficultyPreset(difficultyOptions[selectedIndex].key);
      setButtonLoading(confirmBtn, true);
      gameState.requestPlay();
      if (gameState.state === "playing") {
        setButtonLoading(confirmBtn, false);
      }
    });
  }

  // ui/pauseMenu.js
  var SCENE_KEY = "game";
  function initPauseMenu(game2) {
    const pauseBtn = document.getElementById("pause-btn");
    const overlay = document.getElementById("pause-overlay");
    const scoreEl = document.getElementById("pause-score");
    const resumeBtn = document.getElementById("resume-btn");
    const restartBtn = document.getElementById("restart-btn");
    const menuBtn = document.getElementById("pause-menu-btn");
    if (!pauseBtn || !overlay || !resumeBtn || !restartBtn || !menuBtn) return;
    let paused = false;
    let hideTimer = null;
    const getScene = () => game2.scene.getScene(SCENE_KEY);
    function setPauseButtonVisible(visible) {
      pauseBtn.classList.toggle("visible", visible);
      pauseBtn.tabIndex = visible ? 0 : -1;
    }
    function renderScore(scene) {
      var _a, _b;
      if (!scoreEl) return;
      scoreEl.innerHTML = "";
      const parts = [
        ["score-you", String((_a = scene.playerScore) != null ? _a : 0)],
        ["score-sep", ":"],
        ["score-ai", String((_b = scene.aiScore) != null ? _b : 0)]
      ];
      for (const [cls, text] of parts) {
        const span = document.createElement("span");
        span.className = cls;
        span.textContent = text;
        scoreEl.appendChild(span);
      }
    }
    function openPause() {
      if (paused || gameState.state !== "playing") return;
      const scene = getScene();
      if (!scene || scene.gameOver || !scene.sys.isActive()) return;
      paused = true;
      game2.scene.pause(SCENE_KEY);
      renderScore(scene);
      setPauseButtonVisible(false);
      clearTimeout(hideTimer);
      overlay.classList.remove("hidden");
      void overlay.offsetWidth;
      overlay.classList.add("visible");
      resumeBtn.focus({ preventScroll: true });
    }
    function hideOverlay() {
      overlay.classList.remove("visible");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!paused) overlay.classList.add("hidden");
      }, 450);
    }
    function resume() {
      if (!paused) return;
      paused = false;
      hideOverlay();
      game2.scene.resume(SCENE_KEY);
      setPauseButtonVisible(true);
      pauseBtn.blur();
    }
    function restart() {
      if (!paused) return;
      const scene = getScene();
      paused = false;
      hideOverlay();
      game2.scene.resume(SCENE_KEY);
      if (scene && typeof scene.restartGame === "function") scene.restartGame();
      setPauseButtonVisible(true);
    }
    pauseBtn.addEventListener("click", () => {
      soundManager.play("buttonClick");
      openPause();
    });
    resumeBtn.addEventListener("click", () => {
      soundManager.play("buttonClick");
      resume();
    });
    restartBtn.addEventListener("click", () => {
      soundManager.play("buttonClick");
      restart();
    });
    menuBtn.addEventListener("click", () => {
      soundManager.play("buttonClick");
      window.location.reload();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" && event.key !== "p" && event.key !== "P") return;
      if (paused) resume();
      else openPause();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) openPause();
    });
    gameState.on("statechange", ({ to }) => {
      if (to === "playing") setPauseButtonVisible(true);
    });
    game2.events.on("samix-gameover", () => setPauseButtonVisible(false));
    game2.events.on("samix-restart", () => {
      if (!paused && gameState.state === "playing") setPauseButtonVisible(true);
    });
  }

  // main.js
  initStartScreen();
  initSettings();
  if (showTuningPanel) {
    createTuningPanel(tuning);
    const panel = document.getElementById("tuning-panel");
    if (panel) panel.style.display = "";
  }
  var config = {
    type: phaser_shim_default.AUTO,
    parent: "game-container",
    backgroundColor: "#0b0b0e",
    scene: [BootScene, GameScene],
    scale: {
      mode: phaser_shim_default.Scale.RESIZE,
      autoCenter: phaser_shim_default.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%"
    },
    render: {
      powerPreference: "high-performance",
      antialias: true,
      pixelArt: false,
      roundPixels: false
    }
  };
  var game = new phaser_shim_default.Game(config);
  window.samixGame = game;
  initPauseMenu(game);
})();
