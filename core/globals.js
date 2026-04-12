/************************************************************
 * 0) GLOBALS + GAME STATE
 ************************************************************/
const SCENES = {
  START: "start",
  INSTRUCTIONS: "instructions",
  CUTSCENE: "cutscene",
  GAME: "game",
  END: "end",
};

let scene = SCENES.START;
let previousScene = null;

let damageText = "";
let endMessage = "";
let damageTextTimer = 0;
let endSoundType = "";

let lastMonsterSoundTime = -9999;

// World settings
let VIEW_W;
let VIEW_H;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Levels
let currentLevel = 1;
const TOTAL_LEVELS = 3;

// Sprites
let sprites = {};

// Images
let startBg;
let gameBg;
let pipeImg;
let monsterSheet;
let cutsceneGif;
let doorImg;
let gasGif;
let keySheet;
let burstPipeSheet;
let pipeBurstImg;

const PIPE_BURST_FRAME_W = 8;
const PIPE_BURST_FRAME_H = 21;
const PIPE_BURST_FRAMES = 12;
const PIPE_BURST_FRAME_DELAY = 16;

// Sounds
let sndBackground;
let sndBubbling;
let sndCoin;
let sndDamage;
let sndFallingManhole;
let sndFootsteps;
let sndGameOver;
let sndGutterWater;
let sndIntroduction;
let sndMonsterSound;
let sndStartSound;
let sndSteam;
let sndVictory;
let sndWaterDrip;

// Cutscene settings
let cutsceneDuration = 6200;
let cutsceneStartTime = 0;

// Monster animation settings
const MONSTER_FRAME_W = 29;
const MONSTER_FRAME_H = 29;
const MONSTER_FRAMES = 6;
const MONSTER_SCALE = 2;
let monsterFrameIndex = 0;
let monsterFrameCounter = 0;
let monsterFrameDelay = 10;

// Key animation settings
const KEY_COLS = 4;
const KEY_ROWS = 2;
const KEY_FRAMES = 8;
const KEY_FRAME_DELAY = 8;

// Player
let player = {
  x: 120,
  y: 120,
  r: 14,
  speed: 5,

  w: 18,
  h: 29,
  scale: 3,

  direction: "down",
  moving: false,

  frameIndex: 0,
  frameDelay: 10,
  frameCounter: 0,
  currentAnimName: "down_idle",
};

// Camera
let cam = { x: 0, y: 0 };

// Maze walls
let walls = [];
let wallVents = [];

// Goal zone
let goal = { x: 1450, y: 850, w: 80, h: 80 };

// Enemies
let enemies = [];

// Old gas hazards kept empty / unused now
let gasHazards = [];
const GAS_DAMAGE = 1;
const GAS_BLOCKS_PLAYER = false;

// Wall vent settings
const VENT_DAMAGE = 1;
const VENT_COUNT_BY_LEVEL = {
  1: 3,
  2: 4,
  3: 5,
};

const VENT_NOZZLE_W = 40;
const VENT_NOZZLE_H = 30;
const VENT_THICKNESS = 50;
const VENT_MAX_LENGTH = 150;
const VENT_GROW_SPEED = 10;
const VENT_ACTIVE_MIN = 36;
const VENT_ACTIVE_MAX = 60;
const VENT_INACTIVE_MIN = 80;
const VENT_INACTIVE_MAX = 160;

// Health
let health = 3;
let maxHealth = 3;
let damageCooldown = 0;

let fullHeartImg;
let emptyHeartImg;

// Damage tuning
let wallDamage = 1;

// Timer
let levelStartTime = 0;
let levelEndTime = 0;
let currentTime = 0;
let finalTime = 0;

// High score
let bestTime = null;
if (bestTime === null || finalTime < bestTime) {
  bestTime = finalTime;
}

// Freeze / blur status effect
let freezeEffect = {
  active: false,
  cycleTimer: 0,
  triggerAfter: 60 * 12,
  activeTimer: 0,
  activeDuration: 60 * 3,
  blurAmount: 2,
};

// Per-level settings
const LEVEL_SETTINGS = {
  1: {
    enemyCount: 5,
    gasActiveDuration: 120,
    gasInactiveMin: 140,
    gasInactiveMax: 240,
    gasDamageInterval: 40,
  },
  2: {
    enemyCount: 7,
    gasActiveDuration: 140,
    gasInactiveMin: 80,
    gasInactiveMax: 150,
    gasDamageInterval: 28,
  },
  3: {
    enemyCount: 9,
    gasActiveDuration: 160,
    gasInactiveMin: 45,
    gasInactiveMax: 100,
    gasDamageInterval: 18,
  },
};
