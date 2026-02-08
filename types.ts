
export enum GameState {
  IDLE = 'IDLE',
  LOADING_MODELS = 'LOADING_MODELS',
  GENERATING_GHOST = 'GENERATING_GHOST',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export enum GameMode {
  MIRROR = 'GHOST_IN_THE_MIRROR',
  SWARM = 'FLYING_GHOSTS',
  BAT_CATCHER = 'BAT_CATCHER',
  POSSESSION = 'POSSESSION',
  MOSQUITO = 'MOSQUITO_KILLER',
  CLOWN = 'CREEPY_CLOWN',
  SNAKE = 'SNAKE_EATER'
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  scale: number;
  image?: HTMLImageElement;
  velocity?: Point;
  opacity: number;
  active: boolean;
  retreating?: boolean;
}

export interface GameAssets {
  ghost?: HTMLImageElement;
  bat?: HTMLImageElement;
  mask?: HTMLImageElement;
  dagger?: HTMLImageElement;
  robotEye?: HTMLImageElement;
}

// Vision Types
export interface Keypoint {
  x: number;
  y: number;
  name?: string;
}

export interface DetectedHand {
    keypoints: Keypoint[];
    score: number;
    handedness: 'Left' | 'Right';
}

export interface DetectionResult {
  isLookingAtCamera: boolean;
  handPosition: { x: number; y: number } | null;
  handPose: 'closed' | 'open' | 'pointing';
  faceKeypoints: Keypoint[];
  handKeypoints: Keypoint[]; // Kept for backward compatibility (primary hand)
  hands: DetectedHand[]; // New: Support for multiple hands
}

export interface GhostState {
  isVisible: boolean;
  position: { x: number; y: number };
  opacity: number;
  scale: number;
  isFleeing: boolean;
  imageUrl: string | null;
}

export interface Spirit {
  id: number;
  angle: number;
  radius: number;
  speed: number;
  scale: number;
  opacity: number;
  x: number;
  y: number;
}

export interface Bat {
  id: number;
  x: number;
  y: number;
  direction: number;
  speed: number;
  scale: number;
  isExploding: boolean;
  explosionFrame: number;
}

export interface Tomato {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    isSplat: boolean;
}

export interface Rat {
  id: number;
  x: number;
  y: number;
  scale: number;
  isEaten: boolean;
  rotation: number;
}

export interface Skull {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}
