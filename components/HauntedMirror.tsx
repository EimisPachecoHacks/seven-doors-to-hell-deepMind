
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, GameMode, GhostState, Spirit, Bat, Particle, DetectionResult, Keypoint, Tomato, Rat, Skull } from '../types';
import { detectFeatures } from '../services/visionService';

interface HauntedMirrorProps {
  gameState: GameState;
  gameMode: GameMode;
  ghostImage: string | null;
  screamAudio: string | null;
  possessionAssets?: {
      face: string | null;
      eye: string | null;
      dagger: string | null;
  };
  mosquitoAssets?: {
      mosquito: string | null;
      racket: string | null;
  };
  clownAssets?: {
      clown: string | null;
      tomato: string | null;
  };
  snakeAssets?: {
      head: string | null;
      rat: string | null;
      skull?: string | null;
  };
}

// Helper to decode base64
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const CornerAccent: React.FC<{ mode: GameMode, position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ mode, position }) => {
    const isTop = position.startsWith('t');
    const isLeft = position.endsWith('l');

    // Image 1: Mirror (Red Spider with radiating fan lines)
    const renderMirrorAccent = () => {
        let baseRotation = 0;
        if (position === 'tl') baseRotation = 0;
        if (position === 'tr') baseRotation = 90;
        if (position === 'br') baseRotation = 180;
        if (position === 'bl') baseRotation = 270;

        return (
            <div className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-48 h-48 pointer-events-none z-30 overflow-hidden`}>
                <div className="relative w-full h-full">
                    {/* The vertex anchor point - exactly at the screen corner */}
                    <div className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-1 h-1`}>
                        {[...Array(12)].map((_, i) => (
                            <div 
                                key={i} 
                                className="absolute w-80 h-[1.5px] bg-white/40 origin-left shadow-[0_0_2px_rgba(255,255,255,0.2)]"
                                style={{ 
                                    transform: `rotate(${baseRotation + (i * 8.18)}deg)` 
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Red Spider - offset from vertex along the 45-degree diagonal into the screen */}
                    <div 
                        className="absolute w-6 h-7 bg-red-600 rounded-full shadow-[0_0_15px_red] border border-red-400 z-10"
                        style={{
                            top: isTop ? '35px' : 'auto',
                            bottom: isTop ? 'auto' : '35px',
                            left: isLeft ? '35px' : 'auto',
                            right: isLeft ? 'auto' : '35px',
                            transform: `translate(-50%, -50%) rotate(${baseRotation + 45}deg)`
                        }}
                    >
                        {/* 8 Spider Legs */}
                        {[...Array(4)].map((_, i) => (
                            <React.Fragment key={i}>
                                {/* Left side legs */}
                                <div className="absolute w-4 h-[2px] bg-red-600 shadow-[0_0_5px_red]" 
                                     style={{ 
                                         left: '-8px', 
                                         top: `${2 + i * 6}px`, 
                                         transformOrigin: 'right', 
                                         transform: `rotate(${-(i-1.5) * 45}deg)` 
                                     }}></div>
                                {/* Right side legs */}
                                <div className="absolute w-4 h-[2px] bg-red-600 shadow-[0_0_5px_red]" 
                                     style={{ 
                                         right: '-8px', 
                                         top: `${2 + i * 6}px`, 
                                         transformOrigin: 'left', 
                                         transform: `rotate(${(i-1.5) * 45}deg)` 
                                     }}></div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Image 2: Spirits (Purple Starburst with blue ring)
    const renderSpiritsAccent = () => (
        <div className={`absolute ${isTop ? 'top-6' : 'bottom-6'} ${isLeft ? 'left-6' : 'right-6'} w-16 h-16 flex items-center justify-center pointer-events-none z-30`}>
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute w-12 h-12 border-2 border-blue-500/40 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <div className="absolute w-14 h-[2px] bg-purple-500/80 shadow-[0_0_8px_purple]"></div>
                <div className="absolute h-14 w-[2px] bg-purple-500/80 shadow-[0_0_8px_purple]"></div>
                <div className="absolute w-10 h-[1px] bg-purple-400/60 rotate-45"></div>
                <div className="absolute w-10 h-[1px] bg-purple-400/60 -rotate-45"></div>
                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] border border-purple-200"></div>
            </div>
        </div>
    );

    // Image 3: Bat Catcher (Orange target reticle)
    const renderBatAccent = () => (
        <div className={`absolute ${isTop ? 'top-6' : 'bottom-6'} ${isLeft ? 'left-6' : 'right-6'} w-16 h-16 flex items-center justify-center pointer-events-none z-30`}>
             <div className="relative w-14 h-14 flex items-center justify-center">
                <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} w-24 h-[2px] bg-orange-500/80`}></div>
                <div className={`absolute ${isTop ? 'top-0' : 'bottom-0'} h-24 w-[2px] bg-orange-500/80`}></div>
                <div className="absolute w-14 h-14 border-4 border-orange-700 rounded-full shadow-[0_0_25px_orange] opacity-80"></div>
                <div className="absolute w-8 h-8 border-2 border-orange-500 rounded-full"></div>
                <div className="absolute w-4 h-4 border border-orange-300 rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
             </div>
        </div>
    );

    // Image 4: Possession (Purple concentric circles and vertical/horizontal line of dots)
    const renderPossessionAccent = () => (
        <div className={`absolute ${isTop ? 'top-6' : 'bottom-6'} ${isLeft ? 'left-6' : 'right-6'} w-16 h-16 flex items-center justify-center pointer-events-none z-30`}>
            <div className="relative flex items-center justify-center">
                <div className={`absolute ${isTop ? 'top-12' : 'bottom-12'} flex flex-col gap-2`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-purple-600 rounded-full shadow-[0_0_8px_purple] animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                    ))}
                </div>
                <div className={`absolute ${isLeft ? 'left-12' : 'right-12'} flex gap-2`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-purple-600 rounded-full shadow-[0_0_8px_purple] animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                    ))}
                </div>
                <div className="relative w-12 h-12 border-[3px] border-purple-800 rounded-full flex items-center justify-center bg-purple-900/20">
                    <div className="w-8 h-8 border-[2px] border-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_15px_white]"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMosquitoAccent = () => (
        <div className={`absolute ${isTop ? 'top-4' : 'bottom-4'} ${isLeft ? 'left-4' : 'right-4'} w-12 h-12 flex items-center justify-center pointer-events-none z-30`}>
            <div className="relative w-10 h-10 border-2 border-yellow-500 rotate-45 flex items-center justify-center shadow-[0_0_10px_yellow] bg-yellow-950/20">
                <div className="text-yellow-400 font-bold text-xl animate-pulse -rotate-45">⚡</div>
            </div>
        </div>
    );

    const renderClownAccent = () => (
        <div className={`absolute ${isTop ? 'top-4' : 'bottom-4'} ${isLeft ? 'left-4' : 'right-4'} w-12 h-12 flex items-center justify-center`}>
            <div className="w-8 h-8 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-bounce"></div>
        </div>
    );

    const renderSnakeAccent = () => (
        <div className={`absolute ${isTop ? 'top-4' : 'bottom-4'} ${isLeft ? 'left-4' : 'right-4'} w-12 h-12 flex items-center justify-center`}>
            <div className="w-10 h-6 bg-emerald-700/50 border border-emerald-400 rounded-full flex items-center justify-around shadow-[0_0_10px_emerald]">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
            </div>
        </div>
    );

    switch (mode) {
        case GameMode.MIRROR: return renderMirrorAccent();
        case GameMode.SWARM: return renderSpiritsAccent();
        case GameMode.POSSESSION: return renderPossessionAccent();
        case GameMode.BAT_CATCHER: return renderBatAccent();
        case GameMode.MOSQUITO: return renderMosquitoAccent();
        case GameMode.CLOWN: return renderClownAccent();
        case GameMode.SNAKE: return renderSnakeAccent();
        default: return null;
    }
};

const StatBox: React.FC<{ label: string, value: string | number, colorClass: string, position: 'left' | 'right' }> = ({ label, value, colorClass, position }) => (
    <div className={`absolute top-6 ${position === 'left' ? 'left-6' : 'right-6'} z-40`}>
        <div className={`bg-black/80 border-2 ${colorClass.replace('text', 'border')} p-1 rounded-md shadow-2xl min-w-[100px]`}>
            <div className={`text-[10px] font-bold ${colorClass} uppercase tracking-tighter text-center bg-black py-0.5 mb-1 rounded`}>
                {label}
            </div>
            <div className="text-4xl font-black text-white text-center px-4 py-1 leading-none">
                {value}
            </div>
        </div>
    </div>
);

export const HauntedMirror: React.FC<HauntedMirrorProps> = ({ gameState, gameMode, ghostImage, screamAudio, possessionAssets, mosquitoAssets, clownAssets, snakeAssets }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reverbBufferRef = useRef<AudioBuffer | null>(null);
  
  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const showDebugRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Asset Refs for Canvas Rendering
  const possessionFaceImgRef = useRef<HTMLImageElement | null>(null);
  const possessionEyeImgRef = useRef<HTMLImageElement | null>(null);
  const possessionDaggerImgRef = useRef<HTMLImageElement | null>(null);
  const mosquitoImgRef = useRef<HTMLImageElement | null>(null);
  const racketImgRef = useRef<HTMLImageElement | null>(null);
  const clownImgRef = useRef<HTMLImageElement | null>(null);
  const tomatoImgRef = useRef<HTMLImageElement | null>(null);
  const snakeHeadImgRef = useRef<HTMLImageElement | null>(null);
  const ratImgRef = useRef<HTMLImageElement | null>(null);
  const skullImgRef = useRef<HTMLImageElement | null>(null);

  // Visual Feedback for Hits
  const [hitFlash, setHitFlash] = useState(0);

  // Mode Specific State
  const [mosquitoWeapon, setMosquitoWeapon] = useState<'RACKET' | 'HANDS'>('RACKET');
  const mosquitoWeaponRef = useRef<'RACKET' | 'HANDS'>('RACKET');

  // Helper to remove white background via Chroma Key (or Black for snake/ghosts)
  const removeBackground = (img: HTMLImageElement, color: 'WHITE' | 'BLACK'): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
              resolve(img);
              return;
          }
          
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              if (color === 'WHITE') {
                  if (r > 220 && g > 220 && b > 220) data[i + 3] = 0;
              } else {
                  if (r < 40 && g < 40 && b < 40) data[i + 3] = 0;
              }
          }
          
          ctx.putImageData(imageData, 0, 0);
          const processedImg = new Image();
          processedImg.onload = () => resolve(processedImg);
          processedImg.src = canvas.toDataURL();
      });
  };

  const processImageTransparency = (src: string, color: 'WHITE' | 'BLACK' = 'WHITE'): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
              removeBackground(img, color).then(resolve);
          };
          img.onerror = reject;
          img.src = src;
      });
  };

  // Preload and Process Images
  useEffect(() => {
      const loadAssets = async () => {
        if (possessionAssets?.face) {
            try {
                const img = await processImageTransparency(possessionAssets.face);
                possessionFaceImgRef.current = img;
            } catch(e) { console.error("Failed to process face", e); }
        }
        if (possessionAssets?.eye) {
            try {
                const img = await processImageTransparency(possessionAssets.eye);
                possessionEyeImgRef.current = img;
            } catch(e) { console.error("Failed to process eye", e); }
        }
        if (possessionAssets?.dagger) {
            try {
                const img = await processImageTransparency(possessionAssets.dagger);
                possessionDaggerImgRef.current = img;
            } catch(e) { console.error("Failed to process dagger", e); }
        }
        if (mosquitoAssets?.mosquito) {
            try {
                const img = await processImageTransparency(mosquitoAssets.mosquito);
                mosquitoImgRef.current = img;
            } catch(e) { console.error("Failed to process mosquito", e); }
        }
        if (mosquitoAssets?.racket) {
            try {
                const img = await processImageTransparency(mosquitoAssets.racket);
                racketImgRef.current = img;
            } catch(e) { console.error("Failed to process racket", e); }
        }
        if (clownAssets?.clown) {
            try {
                const img = await processImageTransparency(clownAssets.clown);
                clownImgRef.current = img;
            } catch(e) { console.error("Failed to process clown", e); }
        }
        if (clownAssets?.tomato) {
            try {
                const img = await processImageTransparency(clownAssets.tomato);
                tomatoImgRef.current = img;
            } catch(e) { console.error("Failed to process tomato", e); }
        }
        if (snakeAssets?.head) {
            try {
                const img = await processImageTransparency(snakeAssets.head, 'BLACK');
                snakeHeadImgRef.current = img;
            } catch(e) { console.error("Failed to process snake head", e); }
        }
        if (snakeAssets?.rat) {
            try {
                const img = await processImageTransparency(snakeAssets.rat, 'BLACK');
                ratImgRef.current = img;
            } catch(e) { console.error("Failed to process rat", e); }
        }
        if (snakeAssets?.skull) {
            try {
                const img = await processImageTransparency(snakeAssets.skull, 'BLACK');
                skullImgRef.current = img;
            } catch(e) { console.error("Failed to process skull", e); }
        }
      };
      loadAssets();
  }, [possessionAssets, mosquitoAssets, clownAssets, snakeAssets]);

  // Sync refs
  useEffect(() => {
    showDebugRef.current = showDebug;
  }, [showDebug]);

  useEffect(() => {
    mosquitoWeaponRef.current = mosquitoWeapon;
  }, [mosquitoWeapon]);
  
  // --- STATE: Mirror Mode ---
  const [ghostState, setGhostState] = useState<GhostState>({
    isVisible: false,
    position: { x: 0.7, y: 0.3 }, 
    opacity: 0,
    scale: 1,
    isFleeing: false,
    imageUrl: ghostImage
  });

  // --- STATE: Swarm Mode ---
  const [spirits, setSpirits] = useState<Spirit[]>([
    { id: 1, angle: 0, radius: 0.2, speed: 0.05, scale: 0.5, opacity: 0, x: 0.5, y: 0.5 },
    { id: 2, angle: 2, radius: 0.25, speed: 0.03, scale: 0.4, opacity: 0, x: 0.5, y: 0.5 },
    { id: 3, angle: 4, radius: 0.15, speed: 0.07, scale: 0.3, opacity: 0, x: 0.5, y: 0.5 },
  ]);
  const handHistoryRef = useRef<{x: number, y: number}[]>([]);
  const isSwirlingRef = useRef(false);
  const lastFlyingSoundRef = useRef(0);

  // --- STATE: Bat Catcher Mode ---
  const batsRef = useRef<Bat[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextBatIdRef = useRef(0);
  const nextParticleIdRef = useRef(0);
  const scoreRef = useRef(0); 
  const [score, setScore] = useState(0); 
  
  const batGameStateRef = useRef({
      level: 1,
      levelKills: 0,
      timeLeft: 60,
      lastTick: 0,
      status: 'PLAYING' as 'PLAYING' | 'LEVEL_TRANSITION' | 'WON' | 'GAME_OVER'
  });
  const [batUI, setBatUI] = useState({ level: 1, levelKills: 0, timeLeft: 60, status: 'PLAYING' });

  // --- STATE: Clown Mode ---
  const clownRef = useRef({
      position: { x: 0.5, y: 1.0 }, 
      targetPosition: { x: 0.5, y: 1.0 },
      state: 'HIDDEN' as 'HIDDEN' | 'PEEKING_IN' | 'VISIBLE' | 'PEEKING_OUT',
      corner: 'BOTTOM_RIGHT' as 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT',
      timer: 0,
      opacity: 0
  });
  const clownGameStateRef = useRef({
      timeLeft: 60,
      lastTick: 0,
      status: 'PLAYING' as 'PLAYING' | 'WON' | 'GAME_OVER'
  });
  const [clownUI, setClownUI] = useState({ timeLeft: 60, status: 'PLAYING' });
  const tomatoesRef = useRef<Tomato[]>([]);
  const lastThrowTimeRef = useRef(0);
  
  // --- STATE: Possession Mode ---
  const possessionRef = useRef({
      headBangs: 0,
      eyeStabs: 0,
      isHeadDown: false,
      lastHitTime: 0,
      lastStabTime: 0,
      ritualComplete: false
  });
  const [possessionState, setPossessionState] = useState({ hits: 0, stabs: 0, ritualComplete: false });

  // --- STATE: Snake Eater Mode ---
  const ratsRef = useRef<Rat[]>([]);
  const skullsRef = useRef<Skull[]>([]); 
  const snakePathRef = useRef<{x: number, y: number}[]>([]);
  const snakeGameStateRef = useRef({
      eaten: 0,
      timeLeft: 60,
      lastTick: 0,
      status: 'PLAYING' as 'PLAYING' | 'WON' | 'EXPLODED',
      explosionTime: 0
  });
  const [snakeUI, setSnakeUI] = useState({ eaten: 0, timeLeft: 60, status: 'PLAYING' });

  // Reset game state on mode change
  useEffect(() => {
    if (gameMode === GameMode.BAT_CATCHER || gameMode === GameMode.MOSQUITO || gameMode === GameMode.CLOWN || gameMode === GameMode.SNAKE) {
      batsRef.current = [];
      particlesRef.current = [];
      tomatoesRef.current = [];
      scoreRef.current = 0;
      setScore(0);
      setMosquitoWeapon('RACKET'); 
      
      if (gameMode === GameMode.CLOWN) {
          clownRef.current = {
              position: { x: 0.5, y: 1.2 }, 
              targetPosition: { x: 0.5, y: 1.2 },
              state: 'HIDDEN',
              corner: 'BOTTOM_RIGHT',
              timer: 0,
              opacity: 0
          };
          clownGameStateRef.current = { timeLeft: 60, lastTick: Date.now(), status: 'PLAYING' };
          setClownUI({ timeLeft: 60, status: 'PLAYING' });
      }
      
      if (gameMode === GameMode.SNAKE) {
          ratsRef.current = [];
          skullsRef.current = [];
          snakePathRef.current = [];
          snakeGameStateRef.current = { eaten: 0, timeLeft: 60, lastTick: Date.now(), status: 'PLAYING', explosionTime: 0 };
          setSnakeUI({ eaten: 0, timeLeft: 60, status: 'PLAYING' });
      }

      if (gameMode === GameMode.BAT_CATCHER) {
          batGameStateRef.current = {
              level: 1,
              levelKills: 0,
              timeLeft: 60,
              lastTick: Date.now(),
              status: 'PLAYING'
          };
          setBatUI({ level: 1, levelKills: 0, timeLeft: 60, status: 'PLAYING' });
      }
    }
    if (gameMode === GameMode.POSSESSION) {
        possessionRef.current = { headBangs: 0, eyeStabs: 0, isHeadDown: false, lastHitTime: 0, lastStabTime: 0, ritualComplete: false };
        setPossessionState({ hits: 0, stabs: 0, ritualComplete: false });
    }
  }, [gameMode]);

  useEffect(() => {
      if (hitFlash > 0) {
          const timer = setTimeout(() => setHitFlash(0), 100);
          return () => clearTimeout(timer);
      }
  }, [hitFlash]);

  const triggerHitFlash = (intensity: number = 0.5) => {
      setHitFlash(intensity);
  };

  // --- AUDIO ENGINE ---

  const createReverbImpulse = (ctx: AudioContext) => {
      const duration = 2.5;
      const decay = 2.0;
      const rate = ctx.sampleRate;
      const length = rate * duration;
      const impulse = ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
          const n = i / length;
          left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
          right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      }
      return impulse;
  };

  const createPinkNoise = (ctx: AudioContext) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
      }
      return buffer;
  };

  useEffect(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      reverbBufferRef.current = createReverbImpulse(ctx);
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playScreamSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const duration = 2.0;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(0.7, t + 0.1); 
    masterGain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    const convolver = ctx.createConvolver();
    if (reverbBufferRef.current) convolver.buffer = reverbBufferRef.current;
    const reverbMix = ctx.createGain();
    reverbMix.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    masterGain.connect(convolver);
    convolver.connect(reverbMix);
    reverbMix.connect(ctx.destination);
    const voiceOsc = ctx.createOscillator();
    voiceOsc.type = 'sawtooth'; 
    voiceOsc.frequency.setValueAtTime(400, t); 
    voiceOsc.frequency.linearRampToValueAtTime(1200, t + 0.4); 
    voiceOsc.frequency.exponentialRampToValueAtTime(200, t + duration); 
    const noiseBuffer = createPinkNoise(ctx);
    const modNoise = ctx.createBufferSource();
    modNoise.buffer = noiseBuffer;
    modNoise.loop = true;
    const modFilter = ctx.createBiquadFilter();
    modFilter.type = 'lowpass';
    modFilter.frequency.value = 50; 
    const modGain = ctx.createGain();
    modGain.gain.value = 300; 
    modNoise.connect(modFilter);
    modFilter.connect(modGain);
    modGain.connect(voiceOsc.frequency); 
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.setValueAtTime(800, t); 
    formant1.Q.value = 4;
    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.setValueAtTime(2500, t); 
    formant2.Q.value = 4;
    voiceOsc.connect(formant1);
    voiceOsc.connect(formant2);
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(44100);
    const deg = Math.PI / 180;
    for (let i = 0; i < 44100; i++) {
        const x = i * 2 / 44100 - 1;
        curve[i] = (3 + 20) * x * 20 * deg / (Math.PI + 20 * Math.abs(x));
    }
    shaper.curve = curve;
    formant1.connect(shaper);
    formant2.connect(shaper);
    shaper.connect(masterGain);
    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = noiseBuffer;
    breathSrc.loop = true;
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'highpass';
    breathFilter.frequency.value = 3000;
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0, t);
    breathGain.gain.linearRampToValueAtTime(0.2, t + 0.5); 
    breathGain.gain.linearRampToValueAtTime(0, t + duration);
    breathSrc.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(masterGain);
    voiceOsc.start(t);
    modNoise.start(t);
    breathSrc.start(t);
    voiceOsc.stop(t + duration);
    modNoise.stop(t + duration);
    breathSrc.stop(t + duration);
  };

  const playSinisterLaugh = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    
    // Deeper, creepier laugh
    const playHa = (startTime: number, freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + dur);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.6, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + dur);
    };

    const basePitch = 120 + Math.random() * 30;
    for(let i = 0; i < 7; i++) {
        // Vary timing for a rhythmic "Ha ha ha..."
        playHa(t + i * 0.22, basePitch - i * 8, 0.4);
    }
  };

  const playClownLaugh = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const playHa = (startTime: number, freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + dur);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 1.5;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur);
    };
    const basePitch = 500 + Math.random() * 200;
    playHa(t + 0.0, basePitch, 0.15);
    playHa(t + 0.18, basePitch * 1.2, 0.15);
    playHa(t + 0.36, basePitch * 1.1, 0.15);
    playHa(t + 0.54, basePitch * 0.9, 0.4);
  };

  const playFlyingSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.0; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.5;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.4); 
    filter.frequency.linearRampToValueAtTime(100, t + 0.9);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  };

  const playExplosionSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(oscGain).connect(ctx.destination);
    noise.start();
    osc.start();
  };

  const playZapSound = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(50, t + 0.15);
      const mod = ctx.createOscillator();
      mod.type = 'square';
      mod.frequency.value = 1000; 
      const modGain = ctx.createGain();
      modGain.gain.value = 800;
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      mod.start(t);
      osc.stop(t + 0.2);
      mod.stop(t + 0.2);
  };

  const playHitSound = () => {
     const ctx = audioContextRef.current;
     if (!ctx) return;
     if (ctx.state === 'suspended') ctx.resume();
     const t = ctx.currentTime;
     const osc = ctx.createOscillator();
     osc.type = 'square';
     osc.frequency.setValueAtTime(80, t);
     osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);
     const gain = ctx.createGain();
     gain.gain.setValueAtTime(0.5, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
     osc.connect(gain).connect(ctx.destination);
     osc.start();
  };

  const playBatSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(6000, t);
    osc.frequency.exponentialRampToValueAtTime(3000, t + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  const playSplatSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t);
  };
  
  const playCrunchSound = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      const createBurst = (time: number) => {
          const bufferSize = ctx.sampleRate * 0.1;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 1000;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.5, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
          noise.connect(filter).connect(gain).connect(ctx.destination);
          noise.start(time);
      }
      createBurst(t);
      createBurst(t + 0.05);
      createBurst(t + 0.12);
  };

  const getDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const createExplosion = (x: number, y: number, colorOverride?: string) => {
      const newParticles: Particle[] = [];
      const particleCount = 30;
      const colors = colorOverride ? [colorOverride, '#FFFFFF'] : ['#FF4500', '#FFA500', '#FFFF00', '#FFFFFF', '#FF0000'];
      for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.005 + Math.random() * 0.02;
          newParticles.push({
              id: nextParticleIdRef.current++,
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              size: 5 + Math.random() * 8, 
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }
      return newParticles;
  };

  const drawCanvas = (detection: DetectionResult, currentParticles: Particle[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    currentParticles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
    let racketHeadCenter = { x: 0, y: 0 };
    let hasDynamicRacket = false;
    if (gameMode === GameMode.MOSQUITO) {
        if (mosquitoWeaponRef.current === 'RACKET') {
            if (detection.handKeypoints && detection.handKeypoints.length > 0) {
                const wrist = detection.handKeypoints.find(k => k.name === 'wrist');
                const indexMCP = detection.handKeypoints.find(k => k.name === 'index_finger_mcp');
                if (wrist && indexMCP && racketImgRef.current) {
                    if (wrist.x > 0 && wrist.x < 1 && wrist.y > 0 && wrist.y < 1) {
                        hasDynamicRacket = true;
                        const wx = wrist.x * w;
                        const wy = wrist.y * h;
                        const ix = indexMCP.x * w;
                        const iy = indexMCP.y * h;
                        const dx = ix - wx;
                        const dy = iy - wy;
                        const angle = Math.atan2(dy, dx);
                        const rotation = angle + (90 * Math.PI / 180);
                        const size = Math.min(w, h) * 0.55; 
                        ctx.save();
                        ctx.translate(ix, iy);
                        ctx.rotate(rotation);
                        ctx.drawImage(racketImgRef.current, -size/2, -size * 0.85, size, size);
                        ctx.restore();
                        const reachPx = size * 0.35;
                        const reachX = Math.cos(angle) * reachPx;
                        const reachY = Math.sin(angle) * reachPx;
                        racketHeadCenter = { x: ix + reachX, y: iy + reachY };
                    }
                }
            } else if (detection.handPosition) {
                const x = detection.handPosition.x * w;
                const y = detection.handPosition.y * h;
                if (x > 0 && x < w && y > 0 && y < h) {
                    ctx.beginPath();
                    ctx.arc(x, y, 40, 0, Math.PI * 2);
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = '#FFFF00'; 
                    ctx.stroke();
                }
            }
        } else {
             if (detection.hands && detection.hands.length > 0) {
                 detection.hands.forEach(hand => {
                     const wrist = hand.keypoints.find(k => k.name === 'wrist');
                     const middle = hand.keypoints.find(k => k.name === 'middle_finger_mcp');
                     if (wrist && middle) {
                         const cx = (wrist.x + middle.x) / 2 * w;
                         const cy = (wrist.y + middle.y) / 2 * h;
                         ctx.beginPath();
                         ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                         ctx.strokeStyle = '#00FF00';
                         ctx.lineWidth = 3;
                         ctx.stroke();
                         ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                         ctx.fill();
                     }
                 });
             }
        }
    }
    if (gameMode === GameMode.BAT_CATCHER && detection.handPosition) {
         const x = detection.handPosition.x * w;
         const y = detection.handPosition.y * h;
         ctx.beginPath();
         ctx.arc(x, y, 20, 0, Math.PI * 2);
         ctx.lineWidth = 3;
         ctx.strokeStyle = '#00FFFF'; 
         ctx.stroke();
         ctx.beginPath();
         ctx.moveTo(x - 25, y); ctx.lineTo(x + 25, y);
         ctx.moveTo(x, y - 25); ctx.lineTo(x, y + 25);
         ctx.lineWidth = 1;
         ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
         ctx.stroke();
         ctx.beginPath();
         ctx.arc(x, y, 4, 0, Math.PI * 2); 
         ctx.fillStyle = '#FFFFFF';
         ctx.fill();
    }
    if (gameMode === GameMode.CLOWN) {
        const clown = clownRef.current;
        if (clownImgRef.current && clown.state !== 'HIDDEN' && clownGameStateRef.current.status === 'PLAYING') {
            const cx = clown.position.x * w;
            const cy = clown.position.y * h;
            const cWidth = w * 0.45;
            const cHeight = cWidth;
            ctx.save();
            ctx.globalAlpha = clown.opacity;
            let rotation = 0;
            if (clown.corner === 'TOP_LEFT') rotation = 135 * Math.PI / 180;
            if (clown.corner === 'TOP_RIGHT') rotation = -135 * Math.PI / 180;
            if (clown.corner === 'BOTTOM_LEFT') rotation = 45 * Math.PI / 180;
            if (clown.corner === 'BOTTOM_RIGHT') rotation = -45 * Math.PI / 180;
            ctx.translate(cx, cy);
            ctx.rotate(rotation);
            ctx.drawImage(clownImgRef.current, -cWidth/2, -cHeight/2, cWidth, cHeight);
            ctx.restore();
        }
        tomatoesRef.current.forEach(t => {
            if (tomatoImgRef.current) {
                const tx = t.x * w;
                const ty = t.y * h;
                const size = 120; 
                ctx.save();
                ctx.translate(tx, ty);
                ctx.rotate(t.rotation);
                ctx.drawImage(tomatoImgRef.current, -size/2, -size/2, size, size);
                ctx.restore();
            }
        });
        const indexTip = detection.handKeypoints?.find(k => k.name === 'index_finger_tip');
        if (indexTip) {
            const hx = indexTip.x * w;
            const hy = indexTip.y * h;
            ctx.save();
            ctx.shadowBlur = 5; ctx.shadowColor = 'black';
            ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.translate(hx, hy); ctx.rotate(-20 * Math.PI / 180); 
            ctx.fillText('🖐️', 0, 0); ctx.restore();
        }
    }
    if (gameMode === GameMode.SNAKE) {
        skullsRef.current.forEach(skull => {
            if (skullImgRef.current) {
                const sx = skull.x * w; const sy = skull.y * h; const size = 80;
                ctx.save(); ctx.translate(sx, sy); ctx.rotate(skull.rotation);
                ctx.drawImage(skullImgRef.current, -size/2, -size/2, size, size); ctx.restore();
            }
        });
        ratsRef.current.forEach(rat => {
            if (!rat.isEaten && ratImgRef.current) {
                const rx = rat.x * w; const ry = rat.y * h; const size = 100;
                ctx.save(); ctx.translate(rx, ry); ctx.rotate(rat.rotation);
                ctx.drawImage(ratImgRef.current, -size/2, -size/2, size, size); ctx.restore();
            }
        });
        if (snakePathRef.current.length > 1 && snakeGameStateRef.current.status !== 'EXPLODED') {
            for (let i = 0; i < snakePathRef.current.length; i++) {
                const p = snakePathRef.current[i];
                const px = p.x * w; const py = p.y * h;
                const radius = 20 * (1 - i / (snakePathRef.current.length + 10));
                ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(50, 200, 50, ${0.8 - (i * 0.02)})`; ctx.fill();
            }
        }
        const indexTip = detection.handKeypoints?.find(k => k.name === 'index_finger_tip');
        if (indexTip && snakeHeadImgRef.current && snakeGameStateRef.current.status !== 'EXPLODED') {
            const hx = indexTip.x * w; const hy = indexTip.y * h; const size = 140;
            let rotation = 0;
            if (snakePathRef.current.length > 0) {
                const prev = snakePathRef.current[0]; const dx = indexTip.x - prev.x; const dy = indexTip.y - prev.y;
                if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) rotation = Math.atan2(dy, dx) + (90 * Math.PI / 180);
            }
            ctx.save(); ctx.translate(hx, hy); ctx.rotate(rotation);
            ctx.drawImage(snakeHeadImgRef.current, -size/2, -size/2, size, size); ctx.restore();
        }
    }
    if (gameMode === GameMode.POSSESSION && detection.handPosition) {
        if (possessionDaggerImgRef.current) {
            const x = detection.handPosition.x * w; const y = detection.handPosition.y * h; const size = 150;
            ctx.save(); ctx.translate(x, y); ctx.rotate(-45 * Math.PI / 180); 
            ctx.drawImage(possessionDaggerImgRef.current, -size/2, -size, size, size*2);
            ctx.restore();
        }
    }
    if (gameMode === GameMode.POSSESSION && detection.faceKeypoints) {
        const leftEye = detection.faceKeypoints.find(k => k.name === 'leftEye');
        const rightEye = detection.faceKeypoints.find(k => k.name === 'rightEye');
        if (leftEye && rightEye) {
             const lx = leftEye.x * w; const ly = leftEye.y * h; const rx = rightEye.x * w; const ry = rightEye.y * h;
             const eyeDist = Math.hypot(rx - lx, ry - ly);
             if (possessionRef.current.headBangs >= 3 && possessionFaceImgRef.current) {
                 const faceWidth = eyeDist * 3.5; const faceHeight = faceWidth * 1.3;
                 const cx = (lx + rx) / 2; const cy = (ly + ry) / 2;
                 ctx.save(); ctx.globalAlpha = 0.8;
                 ctx.drawImage(possessionFaceImgRef.current, cx - faceWidth/2, cy - (faceHeight * 0.35), faceWidth, faceHeight);
                 ctx.restore();
             }
             if (possessionRef.current.eyeStabs >= 3 && possessionEyeImgRef.current) {
                 const radius = (eyeDist * 0.4) / 2; const size = radius * 2;
                 const drawEye = (x: number, y: number, flip: boolean) => {
                     ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
                     ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
                     ctx.drawImage(possessionEyeImgRef.current!, -radius, -radius, size, size);
                     ctx.restore();
                 };
                 drawEye(lx, ly, false); drawEye(rx, ry, true);
             }
        }
    }
    if (showDebugRef.current) {
        const drawPoint = (k: Keypoint, color: string) => {
            ctx.beginPath(); ctx.arc(k.x * w, k.y * h, 4, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
        };
        const drawLine = (k1: Keypoint, k2: Keypoint, color: string) => {
            ctx.beginPath(); ctx.moveTo(k1.x * w, k1.y * h); ctx.lineTo(k2.x * w, k2.y * h); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        };
        if (detection.faceKeypoints) {
            detection.faceKeypoints.forEach(k => drawPoint(k, '#00ff00')); 
            if (gameMode === GameMode.POSSESSION) {
                const leftEye = detection.faceKeypoints.find(k => k.name === 'leftEye');
                const rightEye = detection.faceKeypoints.find(k => k.name === 'rightEye');
                const HIT_THRESHOLD = 0.55;
                if (leftEye && rightEye) {
                    const threshY = HIT_THRESHOLD * h;
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; ctx.beginPath(); ctx.moveTo(0, threshY); ctx.lineTo(w, threshY); ctx.lineWidth = 2; ctx.stroke();
                }
            }
        }
        if (gameMode === GameMode.MOSQUITO) {
            if (mosquitoWeaponRef.current === 'RACKET' && hasDynamicRacket) {
                 ctx.beginPath(); ctx.arc(racketHeadCenter.x, racketHeadCenter.y, 0.15 * w, 0, Math.PI * 2); 
                 ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
            }
        }
        if (detection.handKeypoints && detection.handKeypoints.length >= 21) {
            const kp = detection.handKeypoints;
            const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17]];
            let handColor = 'rgba(255, 0, 0, 0.8)';
            if (detection.handPose === 'pointing') handColor = 'rgba(255, 255, 0, 0.8)';
            if (detection.handPose === 'open') handColor = 'rgba(0, 255, 255, 0.8)';
            connections.forEach(([i, j]) => drawLine(kp[i], kp[j], handColor));
            kp.forEach(k => drawPoint(k, '#ff0000'));
        }
    }
  };

  const gameLoop = useCallback(async () => {
    if (gameState !== GameState.ACTIVE || !videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState === 4) {
      const detection: DetectionResult = await detectFeatures(video);
      if (gameMode === GameMode.MIRROR) {
          setGhostState(prev => {
            let newState = { ...prev };
            const TARGET_OPACITY = 1.0; const FADE_IN_SPEED = 0.08; const FADE_OUT_SPEED = 0.2; const RETREAT_SPEED = 0.04; 
            if (detection.isLookingAtCamera && !prev.isFleeing) {
              if (prev.opacity <= 0.05) {
                 const currentX = prev.position.x; const targetBaseX = currentX > 0.5 ? 0.25 : 0.75;
                 newState.position = { x: targetBaseX + (Math.random() * 0.1 - 0.05), y: 0.25 + (Math.random() * 0.1) };
                 newState.scale = 1; 
              }
              newState.isVisible = true; newState.opacity = Math.min(prev.opacity + FADE_IN_SPEED, TARGET_OPACITY);
            } else {
              newState.isVisible = prev.opacity > 0; newState.opacity = Math.max(prev.opacity - FADE_OUT_SPEED, 0);
            }
            if (detection.handPosition && prev.opacity > 0.3) {
              const ghostCenter = { x: prev.position.x, y: prev.position.y + 0.1 }; 
              const dist = getDistance(detection.handPosition, ghostCenter);
              if (dist < 0.15 && !prev.isFleeing) { newState.isFleeing = true; playScreamSound(); }
            }
            if (newState.isFleeing) {
                const vanishingPoint = { x: 0.5, y: 0.4 };
                const deltaX = vanishingPoint.x - prev.position.x; const deltaY = vanishingPoint.y - prev.position.y;
                newState.position = { x: prev.position.x + (deltaX * RETREAT_SPEED), y: prev.position.y + (deltaY * RETREAT_SPEED) };
                newState.scale = Math.max(prev.scale * 0.9, 0.1); newState.opacity = Math.max(prev.opacity - (FADE_OUT_SPEED * 0.5), 0);
                if (newState.opacity <= 0) newState.isFleeing = false;
            }
            return newState;
          });
          drawCanvas(detection, []);
      }
      else if (gameMode === GameMode.SWARM) {
          const isHandDetected = !!detection.handPosition;
          if (detection.handPosition) {
             handHistoryRef.current.push(detection.handPosition);
             if (handHistoryRef.current.length > 10) handHistoryRef.current.shift();
             let totalMovement = 0;
             for (let i = 1; i < handHistoryRef.current.length; i++) totalMovement += getDistance(handHistoryRef.current[i-1], handHistoryRef.current[i]);
             const isMovingFast = totalMovement > 0.20;
             isSwirlingRef.current = isMovingFast;
             if (isMovingFast && (Date.now() - lastFlyingSoundRef.current > 800)) { playFlyingSound(); lastFlyingSoundRef.current = Date.now(); }
          } else {
             handHistoryRef.current = []; isSwirlingRef.current = false;
          }
          let targetX = 0.5; let targetY = 0.5; const nose = detection.faceKeypoints?.find(k => k.name === 'noseTip');
          if (detection.handPosition) {
              if (isSwirlingRef.current && nose) { targetX = nose.x; targetY = nose.y - 0.3; }
              else { targetX = detection.handPosition.x; targetY = detection.handPosition.y; }
          } else if (nose) { targetX = nose.x; targetY = nose.y - 0.3; }
          setSpirits(prevSpirits => {
              return prevSpirits.map(spirit => {
                  let s = { ...spirit }; const FADE_SPEED = 0.1;
                  s.opacity = isHandDetected ? Math.min(s.opacity + FADE_SPEED, 0.9) : Math.max(s.opacity - FADE_SPEED, 0);
                  const rotationSpeed = isSwirlingRef.current ? s.speed * 3 : s.speed;
                  s.angle += rotationSpeed; const targetRadius = isSwirlingRef.current ? 0.15 : 0.25;
                  s.radius = s.radius + (targetRadius - s.radius) * 0.1;
                  const orbitX = targetX + Math.cos(s.angle) * s.radius; const orbitY = targetY + Math.sin(s.angle) * s.radius;
                  const lerp = 0.1; s.x = s.x + (orbitX - s.x) * lerp; s.y = s.y + (orbitY - s.y) * lerp;
                  s.scale = spirit.scale + Math.sin(s.angle * 2) * 0.01;
                  return s;
              });
          });
          drawCanvas(detection, []);
      }
      else if (gameMode === GameMode.BAT_CATCHER) {
         const now = Date.now(); const batState = batGameStateRef.current;
         if (batState.status === 'PLAYING') {
             if (now - batState.lastTick >= 1000) {
                 batState.timeLeft -= 1; batState.lastTick = now;
                 if (batState.timeLeft <= 0) {
                     if (batState.levelKills >= 20) {
                         if (batState.level === 1) { batState.level = 2; batState.timeLeft = 60; batState.levelKills = 0; }
                         else batState.status = 'WON';
                     } else {
                         batState.status = 'GAME_OVER';
                         playSinisterLaugh();
                     }
                 }
                 setBatUI({ ...batState });
             }
         }
         let activeParticles = particlesRef.current.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.0005, life: p.life - 0.03 })).filter(p => p.life > 0);
         let activeBats = [...batsRef.current];
         const levelMultiplier = batState.level === 1 ? 1 : 1.5; const difficultyMultiplier = 1 + (scoreRef.current * 0.05);
         const spawnRate = 0.02 * difficultyMultiplier * (batState.level === 2 ? 1.2 : 1); const baseSpeed = 0.005 * difficultyMultiplier * levelMultiplier;
         if (batState.status === 'PLAYING' && Math.random() < spawnRate) {
             const spawnLeft = Math.random() > 0.5;
             activeBats.push({ id: nextBatIdRef.current++, x: spawnLeft ? -0.1 : 1.1, y: 0.1 + Math.random() * 0.6, direction: spawnLeft ? 1 : -1, speed: baseSpeed + Math.random() * 0.01, scale: 0.5 + Math.random() * 0.3, isExploding: false, explosionFrame: 0 });
             playBatSound();
         }
         activeBats = activeBats.map(bat => {
             const nextX = bat.x + (bat.direction * bat.speed); const bobY = Math.sin(Date.now() / 200 + bat.id) * 0.005;
             let hit = false;
             if (batState.status === 'PLAYING' && detection.handPosition) {
                 const dist = getDistance(detection.handPosition, { x: bat.x, y: bat.y });
                 if (dist < 0.05) hit = true;
             }
             if (hit) {
                 playExplosionSound(); scoreRef.current += 1; batState.levelKills += 1; setBatUI({ ...batState });
                 activeParticles = [...activeParticles, ...createExplosion(bat.x, bat.y)];
                 return { ...bat, isExploding: true };
             }
             return { ...bat, x: nextX, y: bat.y + bobY };
         }).filter(bat => !bat.isExploding && bat.x >= -0.2 && bat.x <= 1.2);
         batsRef.current = activeBats; particlesRef.current = activeParticles;
         if (scoreRef.current !== score) setScore(scoreRef.current);
         drawCanvas(detection, activeParticles); setBatsRender(batsRef.current);
      }
      else if (gameMode === GameMode.MOSQUITO) {
          let activeParticles = particlesRef.current.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.0005, life: p.life - 0.05 })).filter(p => p.life > 0);
         let activeMosquitos = [...batsRef.current];
         const difficultyMultiplier = 1 + (scoreRef.current * 0.08); const spawnRate = 0.008 * difficultyMultiplier; const baseSpeed = 0.008 * difficultyMultiplier;
         if (Math.random() < spawnRate) {
             const spawnLeft = Math.random() > 0.5;
             activeMosquitos.push({ id: nextBatIdRef.current++, x: spawnLeft ? -0.1 : 1.1, y: 0.1 + Math.random() * 0.7, direction: spawnLeft ? 1 : -1, speed: baseSpeed + Math.random() * 0.02, scale: 0.8 + Math.random() * 0.4, isExploding: false, explosionFrame: 0 });
         }
         activeMosquitos = activeMosquitos.map(mosquito => {
             const time = Date.now(); if (Math.random() < 0.02) mosquito.direction *= -1;
             const noiseY = (Math.sin(time * 0.01 + mosquito.id) + Math.sin(time * 0.03 + mosquito.id * 2)) * 0.005;
             const nextX = mosquito.x + (mosquito.direction * mosquito.speed); const nextY = mosquito.y + noiseY;
             let hit = false;
             if (mosquitoWeaponRef.current === 'RACKET') {
                 let racketCenter = { x: 0, y: 0 }; let hasRacket = false;
                 if (detection.handKeypoints && detection.handKeypoints.length > 0) {
                     const wrist = detection.handKeypoints.find(k => k.name === 'wrist'); const indexMCP = detection.handKeypoints.find(k => k.name === 'index_finger_mcp');
                     if (wrist && indexMCP && racketImgRef.current && wrist.x > 0 && wrist.x < 1 && wrist.y > 0 && wrist.y < 1) {
                        hasRacket = true; const dx = indexMCP.x - wrist.x; const dy = indexMCP.y - wrist.y; const mag = Math.sqrt(dx*dx + dy*dy);
                        if (mag > 0.001) racketCenter = { x: indexMCP.x + (dx / mag) * 0.20, y: indexMCP.y + (dy / mag) * 0.20 };
                        else racketCenter = { x: indexMCP.x, y: indexMCP.y };
                     }
                 } else if (detection.handPosition && detection.handPosition.x > 0 && detection.handPosition.x < 1) { hasRacket = true; racketCenter = detection.handPosition; }
                 if (hasRacket && getDistance(racketCenter, { x: mosquito.x, y: mosquito.y }) < 0.15) hit = true;
             } else {
                 if (detection.hands && detection.hands.length === 2) {
                     const hand1 = detection.hands[0].keypoints.find(k => k.name === 'middle_finger_mcp'); const hand2 = detection.hands[1].keypoints.find(k => k.name === 'middle_finger_mcp');
                     if (hand1 && hand2 && getDistance(hand1, hand2) < 0.15) {
                         if (getDistance({ x: (hand1.x + hand2.x) / 2, y: (hand1.y + hand2.y) / 2 }, { x: mosquito.x, y: mosquito.y }) < 0.15) hit = true;
                     }
                 }
             }
             if (hit) {
                 if (mosquitoWeaponRef.current === 'RACKET') playZapSound(); else playSplatSound();
                 scoreRef.current += 1; const color = mosquitoWeaponRef.current === 'RACKET' ? '#00FFFF' : '#AA0000';
                 activeParticles = [...activeParticles, ...createExplosion(mosquito.x, mosquito.y, color)];
                 return { ...mosquito, isExploding: true };
             }
             return { ...mosquito, x: nextX, y: nextY };
         }).filter(mosquito => !mosquito.isExploding && mosquito.x >= -0.2 && mosquito.x <= 1.2);
         batsRef.current = activeMosquitos; particlesRef.current = activeParticles;
         if (scoreRef.current !== score) setScore(scoreRef.current);
         drawCanvas(detection, activeParticles); setBatsRender(batsRef.current);
      }
      else if (gameMode === GameMode.CLOWN) {
         const now = Date.now();
         const state = clownGameStateRef.current;
         let activeParticles = particlesRef.current.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.0005, life: p.life - 0.02 })).filter(p => p.life > 0);
         
         if (state.status === 'PLAYING') {
             if (now - state.lastTick >= 1000) {
                 state.timeLeft -= 1;
                 state.lastTick = now;
                 if (state.timeLeft <= 0) {
                     if (scoreRef.current >= 100) state.status = 'WON';
                     else { state.status = 'GAME_OVER'; playSinisterLaugh(); }
                 }
                 setClownUI({ ...state });
             }

             const clown = clownRef.current;
             if (clown.state === 'HIDDEN') {
                 if (now > clown.timer) {
                     const r = Math.random();
                     if (r < 0.25) { clown.corner = 'TOP_LEFT'; clown.position = { x: -0.2, y: -0.2 }; clown.targetPosition = { x: 0.15, y: 0.15 }; }
                     else if (r < 0.5) { clown.corner = 'TOP_RIGHT'; clown.position = { x: 1.2, y: -0.2 }; clown.targetPosition = { x: 0.85, y: 0.15 }; }
                     else if (r < 0.75) { clown.corner = 'BOTTOM_LEFT'; clown.position = { x: -0.2, y: 1.2 }; clown.targetPosition = { x: 0.15, y: 0.85 }; }
                     else { clown.corner = 'BOTTOM_RIGHT'; clown.position = { x: 1.2, y: 1.2 }; clown.targetPosition = { x: 0.85, y: 0.85 }; }
                     clown.state = 'PEEKING_IN'; clown.opacity = 0; clown.timer = now + 4000; playClownLaugh();
                 }
             } else if (clown.state === 'PEEKING_IN') {
                 const speed = 0.05; clown.position.x += (clown.targetPosition.x - clown.position.x) * speed; clown.position.y += (clown.targetPosition.y - clown.position.y) * speed; clown.opacity = Math.min(clown.opacity + 0.05, 1);
                 if (getDistance(clown.position, clown.targetPosition) < 0.01) clown.state = 'VISIBLE';
             } else if (clown.state === 'VISIBLE') { if (now > clown.timer) clown.state = 'PEEKING_OUT'; }
             else if (clown.state === 'PEEKING_OUT') {
                 let targetX = -0.3, targetY = -0.3; if (clown.corner === 'TOP_RIGHT') { targetX = 1.3; targetY = -0.3; } if (clown.corner === 'BOTTOM_LEFT') { targetX = -0.3; targetY = 1.3; } if (clown.corner === 'BOTTOM_RIGHT') { targetX = 1.3; targetY = 1.3; }
                 const speed = 0.05; clown.position.x += (targetX - clown.position.x) * speed; clown.position.y += (targetY - clown.position.y) * speed; clown.opacity = Math.max(clown.opacity - 0.05, 0);
                 if (clown.opacity <= 0.05) { clown.state = 'HIDDEN'; clown.timer = now + 1000 + Math.random() * 2500; }
             }

             const indexTip = detection.handKeypoints?.find(k => k.name === 'index_finger_tip');
             if (indexTip) {
                 handHistoryRef.current.push(indexTip); if (handHistoryRef.current.length > 5) handHistoryRef.current.shift();
                 if (handHistoryRef.current.length >= 2) {
                     const p1 = handHistoryRef.current[0]; const p2 = handHistoryRef.current[handHistoryRef.current.length - 1];
                     const dx = p2.x - p1.x; const dy = p2.y - p1.y; const speed = Math.sqrt(dx*dx + dy*dy);
                     if (speed > 0.10 && (now - lastThrowTimeRef.current > 400)) {
                         tomatoesRef.current.push({ id: nextBatIdRef.current++, x: indexTip.x, y: indexTip.y, vx: (dx / speed) * 0.05, vy: (dy / speed) * 0.05, rotation: Math.random() * Math.PI, isSplat: false });
                         lastThrowTimeRef.current = now; playBatSound();
                     }
                 }
             } else handHistoryRef.current = [];

             tomatoesRef.current = tomatoesRef.current.map(t => {
                 t.x += t.vx; t.y += t.vy; t.rotation += 0.25; let splat = false;
                 if ((clown.state === 'VISIBLE' || clown.state === 'PEEKING_IN') && getDistance({x: t.x, y: t.y}, clown.position) < 0.15) {
                         splat = true; playSplatSound(); scoreRef.current += 10; clown.state = 'PEEKING_OUT'; clown.timer = now;
                         activeParticles = [...activeParticles, ...createExplosion(t.x, t.y, '#880000')];
                         if (scoreRef.current >= 100) { state.status = 'WON'; setClownUI({ ...state }); }
                 }
                 if (splat || t.x < 0 || t.x > 1 || t.y < 0 || t.y > 1) return { ...t, isSplat: true };
                 return t;
             }).filter(t => !t.isSplat);
         }

         particlesRef.current = activeParticles;
         if (scoreRef.current !== score) setScore(scoreRef.current);
         drawCanvas(detection, activeParticles);
      }
      else if (gameMode === GameMode.SNAKE) {
          const now = Date.now(); const state = snakeGameStateRef.current;
          let activeParticles = particlesRef.current.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.0005, life: p.life - 0.02 })).filter(p => p.life > 0);
         const triggerSnakeDeath = () => {
             state.status = 'EXPLODED'; state.explosionTime = now; playExplosionSound(); triggerHitFlash(1.0);
             if (snakePathRef.current.length > 0) {
                 const head = snakePathRef.current[0];
                 activeParticles = [...activeParticles, ...createExplosion(head.x, head.y, '#00FF00'), ...createExplosion(head.x, head.y, '#880000'), ...createExplosion(head.x, head.y, '#FFFF00')];
             }
         };
         if (state.status === 'PLAYING') {
             if (now - state.lastTick >= 1000) {
                 state.timeLeft -= 1; state.lastTick = now; if (state.timeLeft <= 0 && state.eaten < 10) triggerSnakeDeath();
                 setSnakeUI({ eaten: state.eaten, timeLeft: state.timeLeft, status: state.status });
             }
         }
         if (state.status === 'PLAYING') {
             const indexTip = detection.handKeypoints?.find(k => k.name === 'index_finger_tip');
             if (indexTip) {
                 snakePathRef.current.unshift({ x: indexTip.x, y: indexTip.y });
                 const MAX_LENGTH = 15 + (state.eaten * 5); 
                 if (snakePathRef.current.length > MAX_LENGTH) snakePathRef.current.pop();
             }
         }
         if (state.status === 'PLAYING') {
             if (Math.random() < 0.005) {
                 const side = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
                 skullsRef.current.push({ id: nextBatIdRef.current++, x: side === 'LEFT' ? -0.1 : 1.1, y: 0.1 + Math.random() * 0.8, vx: (side === 'LEFT' ? 1 : -1) * (0.005 + Math.random() * 0.005), vy: (Math.random() - 0.5) * 0.002, rotation: 0 });
             }
             skullsRef.current = skullsRef.current.map(s => {
                 s.x += s.vx; s.y += s.vy; s.rotation += 0.05;
                 const head = snakePathRef.current[0];
                 if (head && getDistance(head, s) < 0.08) {
                         state.timeLeft = Math.max(0, state.timeLeft - 10); triggerHitFlash(0.3); playHitSound(); return null;
                 }
                 return s;
             }).filter(s => s !== null && s.x > -0.2 && s.x < 1.2) as Skull[];
         }
         if (state.status === 'PLAYING') {
             const activeRats = ratsRef.current.filter(r => !r.isEaten);
             if (activeRats.length < 3 && state.eaten < 10 && Math.random() < 0.05) {
                ratsRef.current.push({ id: nextBatIdRef.current++, x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8, scale: 1, isEaten: false, rotation: Math.random() * Math.PI * 2 });
             }
             const head = snakePathRef.current[0];
             ratsRef.current = ratsRef.current.map(rat => {
                 if (rat.isEaten) return rat;
                 if (head) {
                     const dist = getDistance(head, rat);
                     if (dist < 0.25) { 
                         const dx = rat.x - head.x; const dy = rat.y - head.y; const mag = Math.sqrt(dx*dx + dy*dy);
                         if (mag > 0) { rat.x += (dx/mag) * 0.015; rat.y += (dy/mag) * 0.015; rat.rotation = Math.atan2(dy, dx) + (90 * Math.PI / 180); }
                     }
                     if (rat.x < 0.05) rat.x = 0.05; if (rat.x > 0.95) rat.x = 0.95; if (rat.y < 0.05) rat.y = 0.05; if (rat.y > 0.95) rat.y = 0.95;
                     if (dist < 0.06) {
                         rat.isEaten = true; state.eaten += 1; playCrunchSound();
                         activeParticles = [...activeParticles, ...createExplosion(rat.x, rat.y, '#AA0000')];
                         if (state.eaten >= 10) state.status = 'WON';
                         setSnakeUI({ eaten: state.eaten, timeLeft: state.timeLeft, status: state.status });
                     }
                 }
                 return rat;
             }).filter(r => !r.isEaten);
         }
         particlesRef.current = activeParticles; drawCanvas(detection, activeParticles);
      }
      else if (gameMode === GameMode.POSSESSION) {
          const leftEye = detection.faceKeypoints?.find(k => k.name === 'leftEye');
          const rightEye = detection.faceKeypoints?.find(k => k.name === 'rightEye');
          if (leftEye && rightEye) {
              const HIT_THRESHOLD = 0.55; const now = Date.now();
              const isEyesDown = leftEye.y > HIT_THRESHOLD && rightEye.y > HIT_THRESHOLD;
              if (!possessionRef.current.isHeadDown && isEyesDown && (now - possessionRef.current.lastHitTime > 500)) {
                  possessionRef.current.isHeadDown = true; possessionRef.current.headBangs += 1; possessionRef.current.lastHitTime = now; playHitSound(); triggerHitFlash();
              } else if (possessionRef.current.isHeadDown && !isEyesDown) possessionRef.current.isHeadDown = false;
          }
          if (detection.handPosition && detection.faceKeypoints) {
             const leftEye = detection.faceKeypoints.find(k => k.name === 'leftEye'); const rightEye = detection.faceKeypoints.find(k => k.name === 'rightEye'); const now = Date.now();
             if (now - possessionRef.current.lastStabTime > 1000) {
                 const checkStab = (eye: Keypoint) => {
                     if (getDistance(detection.handPosition!, eye) < 0.08) { possessionRef.current.eyeStabs += 1; possessionRef.current.lastStabTime = now; playHitSound(); triggerHitFlash(); }
                 };
                 if (leftEye) checkStab(leftEye); if (rightEye) checkStab(rightEye);
             }
          }

          // Ritual End condition
          if (possessionRef.current.headBangs >= 3 && possessionRef.current.eyeStabs >= 3 && !possessionRef.current.ritualComplete) {
              possessionRef.current.ritualComplete = true;
              playSinisterLaugh();
          }

          if (possessionRef.current.headBangs !== possessionState.hits || possessionRef.current.eyeStabs !== possessionState.stabs || possessionRef.current.ritualComplete !== possessionState.ritualComplete) {
              setPossessionState({ hits: possessionRef.current.headBangs, stabs: possessionRef.current.eyeStabs, ritualComplete: possessionRef.current.ritualComplete });
          }
          drawCanvas(detection, []);
      }
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameMode, score, possessionState, batUI, snakeUI, clownUI]);

  const [batsRender, setBatsRender] = useState<Bat[]>([]);

  useEffect(() => {
    if (gameState === GameState.ACTIVE) {
      const startCamera = async () => {
        setCameraError(null);
        try {
          let stream;
          try {
             stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } });
          } catch (e) { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); requestRef.current = requestAnimationFrame(gameLoop); };
          }
        } catch (err: any) { setCameraError("Camera permission denied. Please allow camera access."); }
      };
      startCamera();
    } else {
        if (videoRef.current && videoRef.current.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, gameMode, gameLoop]);

  const getFrameStyle = () => {
      if (gameMode === GameMode.SNAKE) {
          // Snake Scaly Frame Pattern
          return {
              borderImage: 'repeating-conic-gradient(#1a3311 0% 25%, #2a4d1a 25% 50%) 30',
              borderStyle: 'solid',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)'
          };
      }
      return {};
  };

  const getFrameColor = () => {
      switch(gameMode) {
          case GameMode.MIRROR: return 'border-red-600 shadow-[0_0_20px_red]';
          case GameMode.SWARM: return 'border-blue-500 shadow-[0_0_20px_blue]';
          case GameMode.BAT_CATCHER: return 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]';
          case GameMode.POSSESSION: return 'border-purple-600 shadow-[0_0_20px_purple]';
          case GameMode.MOSQUITO: return 'border-yellow-500 shadow-[0_0_20px_yellow]';
          case GameMode.CLOWN: return 'border-red-900 shadow-[0_0_20px_red]';
          case GameMode.SNAKE: return 'border-emerald-500'; 
          default: return 'border-neutral-800';
      }
  };

  return (
    <div 
        className={`relative w-full max-w-7xl mx-auto aspect-video bg-black rounded-sm overflow-hidden border-[12px] transition-all duration-500 ${getFrameColor()}`}
        style={getFrameStyle()}
    >
      
      {/* Dynamic Text Labels for Each Mode */}
      {gameMode === GameMode.MIRROR && (
          <>
              <div className="absolute top-6 left-12 z-40 text-red-600 font-horror text-2xl animate-pulse">DON'T BLINK</div>
              <div className="absolute top-6 right-12 z-40 text-red-600 font-horror text-2xl animate-pulse text-right">THEY SEE YOU</div>
              <div className="absolute bottom-6 left-12 z-40 text-red-600 font-horror text-2xl animate-pulse">NO ESCAPE</div>
              <div className="absolute bottom-6 right-12 z-40 text-red-600 font-horror text-2xl animate-pulse text-right">LOOK BEHIND YOU</div>
          </>
      )}
      {gameMode === GameMode.SWARM && (
          <>
              <div className="absolute top-6 left-12 z-40 text-blue-400 font-horror text-2xl animate-pulse">SPIRITS AWAKEN</div>
              <div className="absolute top-6 right-12 z-40 text-purple-400 font-horror text-2xl animate-pulse text-right">THEY FOLLOW</div>
              <div className="absolute bottom-6 left-0 right-0 z-40 text-blue-400 font-horror text-2xl animate-pulse text-center">🌀 SWIRL TO SUMMON 🌀</div>
          </>
      )}
      {gameMode === GameMode.BAT_CATCHER && (
          <>
              <div className="absolute top-6 left-0 right-0 z-40 text-orange-500 font-horror text-2xl text-center">CATCH THEM ALL</div>
              <div className="absolute bottom-6 left-0 right-0 z-40 text-orange-500 font-horror text-xl text-center">🤘 USE YOUR FINGER 🤘</div>
          </>
      )}
      {gameMode === GameMode.POSSESSION && (
          <>
              <div className="absolute top-6 left-12 z-40 text-purple-400 font-horror text-2xl">SURRENDER</div>
              <div className="absolute top-6 right-12 z-40 text-purple-400 font-horror text-2xl text-right">SUBMIT</div>
              <div className="absolute bottom-6 left-0 right-0 z-40 text-purple-400 font-horror text-xl text-center">🔪 THE RITUAL BEGINS 🔪</div>
          </>
      )}
      {gameMode === GameMode.CLOWN && (
          <>
              <div className="absolute top-1/4 left-12 z-40 text-red-500 font-horror text-4xl animate-bounce">YOU WILL FLOAT TOO</div>
              <div className="absolute bottom-1/4 right-12 z-40 text-red-500 font-horror text-4xl animate-bounce text-right">HERE EVERYONE FLOATS</div>
          </>
      )}

      {/* Stats/HUD Boxes */}
      {gameMode === GameMode.BAT_CATCHER && (
          <>
              <StatBox label="SCORE" value={score} colorClass="text-red-600" position="left" />
              <StatBox label="LEVEL 2" value={`${batUI.timeLeft}s`} colorClass="text-purple-600" position="right" />
          </>
      )}
      {gameMode === GameMode.POSSESSION && (
          <>
              <StatBox label="FACE HITS" value={`${possessionState.hits}/3`} colorClass="text-red-600" position="left" />
              <StatBox label="EYE STABS" value={`${possessionState.stabs}/3`} colorClass="text-red-600" position="right" />
          </>
      )}
      {gameMode === GameMode.MOSQUITO && (
          <>
              <StatBox label="KILLS" value={score} colorClass="text-yellow-500" position="left" />
              <div className="absolute top-6 right-6 z-40 flex flex-col gap-2">
                  <button onClick={() => setMosquitoWeapon('RACKET')} className={`px-4 py-2 rounded border-2 font-black ${mosquitoWeapon === 'RACKET' ? 'bg-yellow-500 text-black border-white' : 'bg-black text-yellow-500 border-yellow-500'}`}>RACKET</button>
                  <button onClick={() => setMosquitoWeapon('HANDS')} className={`px-4 py-2 rounded border-2 font-black ${mosquitoWeapon === 'HANDS' ? 'bg-red-600 text-white border-white' : 'bg-black text-red-600 border-red-600'}`}>CLAP</button>
              </div>
          </>
      )}
      {gameMode === GameMode.SNAKE && (
          <>
              <StatBox label="RATS" value={`${snakeUI.eaten}/10`} colorClass="text-emerald-500" position="left" />
              <StatBox label="VITALITY" value={`${snakeUI.timeLeft}s`} colorClass="text-emerald-500" position="right" />
          </>
      )}
      {gameMode === GameMode.CLOWN && (
          <>
              <StatBox label="SCORE" value={score} colorClass="text-red-600" position="left" />
              <StatBox label="TIME" value={`${clownUI.timeLeft}s`} colorClass="text-red-600" position="right" />
          </>
      )}

      {/* Corner Accents */}
      <CornerAccent mode={gameMode} position="tl" />
      <CornerAccent mode={gameMode} position="tr" />
      <CornerAccent mode={gameMode} position="bl" />
      <CornerAccent mode={gameMode} position="br" />

      {/* Hit Flash */}
      <div className="absolute inset-0 bg-red-600 z-50 pointer-events-none transition-opacity duration-100 ease-out" style={{ opacity: hitFlash }}></div>

      <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${(gameMode === GameMode.CLOWN || gameMode === GameMode.SNAKE) ? 'opacity-0' : 'opacity-100'}`} playsInline muted />
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <button onClick={() => setShowDebug(prev => !prev)} className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-black/60 hover:bg-black/90 text-green-400 border border-green-900 px-2 py-0.5 text-[8px] font-mono rounded cursor-pointer transition-colors backdrop-blur-sm">
        {showDebug ? '[HIDE DEBUG]' : '[SHOW DEBUG]'}
      </button>

      {/* WIN/LOSS SCREENS */}
      {gameMode === GameMode.BAT_CATCHER && batUI.status === 'GAME_OVER' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-center p-8 backdrop-blur-sm overflow-hidden">
              <h1 className="text-7xl md:text-9xl text-red-700 font-horror mb-2 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] scale-110 uppercase">Game Over</h1>
              
              <div className="mb-4 flex flex-col items-center">
                  <h2 className="text-xl md:text-3xl text-yellow-500 font-bold uppercase tracking-[0.2em] mb-1">Final Score</h2>
                  <div className="text-8xl md:text-[140px] font-black text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{score}</div>
              </div>

              <div className="mb-8">
                  <div className="inline-block bg-neutral-900 px-6 py-2 rounded-full border border-neutral-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <p className="text-lg md:text-xl text-neutral-300">
                        You survived <span className="text-red-500 font-bold">{60 - batUI.timeLeft}</span> seconds of bat chaos!
                    </p>
                  </div>
              </div>

              {/* The Improved Creepy Circular Face - Matched to Image Reference */}
              <div className="relative w-56 h-56 md:w-64 md:h-64 mb-10">
                  {/* Outer atmospheric red glow */}
                  <div className="absolute inset-[-15px] bg-red-900/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                  
                  {/* The circular face container */}
                  <div className="absolute inset-0 bg-neutral-950 rounded-full border-[6px] border-red-700 shadow-[0_0_40px_rgba(185,28,28,0.6)] flex flex-col items-center justify-center overflow-hidden z-10">
                      
                      {/* Eyes with intense angry brow masks */}
                      <div className="flex gap-10 md:gap-14 mt-6">
                          {/* Left Eye */}
                          <div className="w-16 h-12 md:w-18 md:h-14 bg-white rounded-full relative overflow-hidden flex items-center justify-center border-2 border-neutral-400">
                              <div className="w-5 h-5 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse"></div>
                              {/* Brow Mask for angry look */}
                              <div className="absolute top-[-12px] left-[-5px] w-[110%] h-[100%] bg-neutral-950 -rotate-[22deg] origin-bottom-right"></div>
                          </div>
                          
                          {/* Right Eye */}
                          <div className="w-16 h-12 md:w-18 md:h-14 bg-white rounded-full relative overflow-hidden flex items-center justify-center border-2 border-neutral-400">
                              <div className="w-5 h-5 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse"></div>
                              {/* Brow Mask for angry look */}
                              <div className="absolute top-[-12px] right-[-5px] w-[110%] h-[100%] bg-neutral-950 rotate-[22deg] origin-bottom-left"></div>
                          </div>
                      </div>
                      
                      {/* Wide mouth with square white teeth */}
                      <div className="mt-10 flex flex-col items-center w-full">
                          {/* Mouth Line */}
                          <div className="w-[75%] h-[2px] bg-red-600/40 blur-[0.5px]"></div>
                          
                          {/* Blocky white teeth */}
                          <div className="flex gap-1.5 mt-0.5">
                              {[...Array(7)].map((_, i) => (
                                  <div key={i} className="w-4 h-7 md:w-5 md:h-8 bg-neutral-100 border-x border-b border-neutral-400 rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.4)]"></div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <h3 className="text-4xl md:text-7xl text-red-600 font-horror animate-pulse mt-2 tracking-[0.15em] drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]">
                  HA HA HA HA HA!
              </h3>
          </div>
      )}
      {gameMode === GameMode.SNAKE && snakeUI.status === 'EXPLODED' && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"><h1 className="text-8xl text-red-600 font-horror animate-bounce">YOU EXPLODED</h1></div>}
      {gameMode === GameMode.CLOWN && clownUI.status === 'GAME_OVER' && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"><h1 className="text-8xl text-red-600 font-horror animate-bounce">YOU DIED</h1></div>}
      {gameMode === GameMode.CLOWN && clownUI.status === 'WON' && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"><h1 className="text-8xl text-red-600 font-horror animate-pulse">CLOWN BANISHED</h1></div>}
      
      {/* Possession Ritual Complete screen */}
      {gameMode === GameMode.POSSESSION && possessionState.ritualComplete && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <h1 className="text-[120px] text-red-600 font-horror tracking-widest drop-shadow-[0_0_30px_red] animate-pulse leading-none">POSSESSED</h1>
              <p className="text-2xl text-yellow-500 font-bold uppercase tracking-[0.3em] mt-4 opacity-80">The entity has taken control...</p>
          </div>
      )}

      <div className="scanlines pointer-events-none"></div>
      <div className="vignette pointer-events-none"></div>

      {/* GHOST / SPRITE RENDERING */}
      {gameMode === GameMode.MIRROR && ghostImage && (
        <div className="absolute pointer-events-none transition-opacity duration-100"
            style={{
                left: `${ghostState.position.x * 100}%`, top: `${ghostState.position.y * 100}%`,
                width: '65%', opacity: ghostState.opacity,
                transform: `translate(-50%, -50%) scale(${ghostState.scale})`,
                mixBlendMode: 'screen', filter: 'sepia(0.2) contrast(1.4) brightness(1.3)'
            }}>
            <img src={ghostImage} alt="Ghost" className="w-full h-full animate-pulse" />
        </div>
      )}

      {gameMode === GameMode.SWARM && ghostImage && spirits.map(spirit => (
         <div key={spirit.id} className="absolute pointer-events-none transition-opacity duration-300"
            style={{
                left: `${spirit.x * 100}%`, top: `${spirit.y * 100}%`,
                width: '40%', opacity: spirit.opacity,
                transform: `translate(-50%, -50%) scale(${spirit.scale})`,
                mixBlendMode: 'screen', filter: 'brightness(1.5)'
            }}>
             <img src={ghostImage} alt="Spirit" className="w-full h-full" />
         </div>
      ))}

      {(gameMode === GameMode.BAT_CATCHER || gameMode === GameMode.MOSQUITO) && batsRender.map(bat => (
             <div key={bat.id} className="absolute pointer-events-none"
                style={{
                    left: `${bat.x * 100}%`, top: `${bat.y * 100}%`,
                    width: '15%', transform: `translate(-50%, -50%) scale(${bat.scale}) scaleX(${bat.direction})`,
                    mixBlendMode: 'multiply', filter: 'drop-shadow(0 0 4px white)' 
                }}>
                 <img src={gameMode === GameMode.MOSQUITO && mosquitoImgRef.current ? mosquitoImgRef.current.src : ghostImage!} alt="Target" className="w-full h-full" />
             </div>
      ))}
    </div>
  );
};
