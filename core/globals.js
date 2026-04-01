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
const VIEW_W = 800;
const VIEW_H = 500;
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

// Player
let player = {
  x: 120,
  y: 120,
  r: 14,
  speed: 3,

  w: 18,
  h: 29,
  scale: 3,

  direction: "down",
  moving: false,

  frameIndex: 0,
  frameDelay: 8,
  frameCounter: 0,
  currentAnimName: "down_idle",
};

// Camera
let cam = { x: 0, y: 0 };

// Maze walls
let walls = [];

// Goal zone
let goal = { x: 1450, y: 850, w: 80, h: 80 };

// Enemies
let enemies = [];

// Gas hazards
let gasHazards = [];
const GAS_DAMAGE = 1;
const GAS_BLOCKS_PLAYER = true;

// Health
let health = 3;
let maxHealth = 3;
let damageCooldown = 0;

let health3;
let health2;
let health1;

// Damage tuning
let wallDamage = 1;

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
