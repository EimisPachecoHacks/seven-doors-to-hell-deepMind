
import React, { useState, useEffect } from 'react';
import { GameState, GameMode } from './types';
import { loadModels } from './services/visionService';
import { 
  generateGhostAsset, 
  generateSpiritAsset, 
  generateBatAsset,
  generateZombieFaceAsset,
  generateDamagedEyeAsset,
  generateDaggerAsset,
  generateMosquitoAsset,
  generateRacketAsset,
  generateClownAsset,
  generateTomatoAsset,
  generateSnakeHeadAsset,
  generateRatAsset,
  generateSkullAsset,
  generateArchitectureDiagram
} from './services/geminiService';
import { HauntedMirror } from './components/HauntedMirror';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.MIRROR);
  const [ghostImage, setGhostImage] = useState<string | null>(null);
  
  // Architecture View State
  const [showArch, setShowArch] = useState(false);
  const [archImage, setArchImage] = useState<string | null>(null);
  const [archLoading, setArchLoading] = useState(false);

  // Possession Assets
  const [possessionFace, setPossessionFace] = useState<string | null>(null);
  const [possessionEye, setPossessionEye] = useState<string | null>(null);
  const [possessionDagger, setPossessionDagger] = useState<string | null>(null);

  // Mosquito Assets
  const [mosquitoImage, setMosquitoImage] = useState<string | null>(null);
  const [racketImage, setRacketImage] = useState<string | null>(null);

  // Clown Assets
  const [clownImage, setClownImage] = useState<string | null>(null);
  const [tomatoImage, setTomatoImage] = useState<string | null>(null);

  // Snake Assets
  const [snakeHeadImage, setSnakeHeadImage] = useState<string | null>(null);
  const [ratImage, setRatImage] = useState<string | null>(null);
  const [skullImage, setSkullImage] = useState<string | null>(null);

  const [screamAudio, setScreamAudio] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleArchitectureClick = async () => {
    try {
      // 1. Mandatory API Key Selection for Pro models
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
      }
      
      setShowArch(true);
      if (archImage) return; // Already loaded

      setArchLoading(true);
      const diagram = await generateArchitectureDiagram();
      setArchImage(diagram);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Failed to generate architecture blueprint. Please ensure you've selected a valid API key with billing enabled.");
    } finally {
      setArchLoading(false);
    }
  };

  // Initializer
  const startGame = async () => {
    try {
      setGameState(GameState.LOADING_MODELS);
      await loadModels();
      
      setGameState(GameState.GENERATING_GHOST);
      
      let imageUrl: string = '';
      let audioData: string | null = null;

      // Conditional loading based on mode
      if (gameMode === GameMode.MIRROR) {
        imageUrl = await generateGhostAsset();
      } else if (gameMode === GameMode.SWARM) {
        imageUrl = await generateSpiritAsset();
      } else if (gameMode === GameMode.BAT_CATCHER) {
        imageUrl = await generateBatAsset();
      } else if (gameMode === GameMode.POSSESSION) {
         const [face, eye, dagger] = await Promise.all([
            generateZombieFaceAsset(),
            generateDamagedEyeAsset(),
            generateDaggerAsset()
         ]);
         setPossessionFace(face);
         setPossessionEye(eye);
         setPossessionDagger(dagger);
         imageUrl = ''; 
      } else if (gameMode === GameMode.MOSQUITO) {
          const [mosquito, racket] = await Promise.all([
              generateMosquitoAsset(),
              generateRacketAsset()
          ]);
          setMosquitoImage(mosquito);
          setRacketImage(racket);
          imageUrl = ''; 
      } else if (gameMode === GameMode.CLOWN) {
          const [clown, tomato] = await Promise.all([
             generateClownAsset(),
             generateTomatoAsset()
          ]);
          setClownImage(clown);
          setTomatoImage(tomato);
          imageUrl = '';
      } else if (gameMode === GameMode.SNAKE) {
          const [snake, rat, skull] = await Promise.all([
              generateSnakeHeadAsset(),
              generateRatAsset(),
              generateSkullAsset()
          ]);
          setSnakeHeadImage(snake);
          setRatImage(rat);
          setSkullImage(skull);
          imageUrl = '';
      }
      
      setGhostImage(imageUrl);
      setScreamAudio(audioData);
      
      setGameState(GameState.ACTIVE);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || String(e));
      setGameState(GameState.ERROR);
    }
  };

  const getModeTitle = () => {
      switch(gameMode) {
          case GameMode.MIRROR: return "Summoning the Entity...";
          case GameMode.SWARM: return "Conjuring Spirits...";
          case GameMode.BAT_CATCHER: return "Releasing Bats...";
          case GameMode.POSSESSION: return "Preparing Ritual...";
          case GameMode.MOSQUITO: return "Powering Electric Racket...";
          case GameMode.CLOWN: return "Summoning the Jester...";
          case GameMode.SNAKE: return "Awakening the Viper...";
          default: return "Loading...";
      }
  };

  const getModeColor = (mode: GameMode) => {
      switch(mode) {
          case GameMode.MIRROR: return 'text-red-500';
          case GameMode.SWARM: return 'text-blue-500';
          case GameMode.BAT_CATCHER: return 'text-orange-500';
          case GameMode.POSSESSION: return 'text-purple-500';
          case GameMode.MOSQUITO: return 'text-yellow-500';
          case GameMode.CLOWN: return 'text-green-500';
          case GameMode.SNAKE: return 'text-emerald-500';
          default: return 'text-white';
      }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-red-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=10')] opacity-10 bg-cover bg-center pointer-events-none"></div>

      <header className="z-10 text-center mb-8">
        <h1 className="font-horror text-6xl md:text-8xl text-red-600 tracking-wider drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
          SEVEN DOORS TO HELL
        </h1>
        <p className="font-sans text-neutral-400 mt-2 text-lg max-w-md mx-auto">
          {gameMode === GameMode.MIRROR 
            ? "Look directly at the mirror to summon it. Look away to banish it."
            : gameMode === GameMode.SWARM
            ? "Move your finger in a circle to cast a spell and control the spirits."
            : gameMode === GameMode.BAT_CATCHER
            ? "Use your hands to swat the bats before they escape!"
            : gameMode === GameMode.MOSQUITO
            ? "Zap the giant mosquitos with your electric racket!"
            : gameMode === GameMode.CLOWN
            ? "Wait for the clown to peek out, then throw tomatoes with your hand!"
            : gameMode === GameMode.SNAKE
            ? "Don't touch the red skulls. Eat rats."
            : "Simulate a possession ritual. Hit the desk and invoke the dagger."}
        </p>
      </header>

      <main className="w-full z-10 flex flex-col items-center">
        {gameState === GameState.IDLE && (
          <div className="bg-neutral-900/80 p-8 rounded-xl border border-neutral-800 backdrop-blur-sm max-w-3xl text-center shadow-2xl w-full">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 justify-center">
                <button
                    onClick={() => setGameMode(GameMode.MIRROR)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.MIRROR 
                        ? 'bg-red-800 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    👻 Mirror
                </button>
                <button
                    onClick={() => setGameMode(GameMode.SWARM)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.SWARM 
                        ? 'bg-blue-900 text-white shadow-[0_0_10px_rgba(30,58,138,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🌀 Spirits
                </button>
                <button
                    onClick={() => setGameMode(GameMode.BAT_CATCHER)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.BAT_CATCHER 
                        ? 'bg-orange-800 text-white shadow-[0_0_10px_rgba(154,52,18,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🦇 Bats
                </button>
                <button
                    onClick={() => setGameMode(GameMode.POSSESSION)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.POSSESSION 
                        ? 'bg-purple-800 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🗡️ Possession
                </button>
                <button
                    onClick={() => setGameMode(GameMode.MOSQUITO)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.MOSQUITO 
                        ? 'bg-yellow-800 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🦟 Mosquito
                </button>
                <button
                    onClick={() => setGameMode(GameMode.CLOWN)}
                    className={`py-3 px-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.CLOWN 
                        ? 'bg-green-800 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🤡 Clown
                </button>
                <button
                    onClick={() => setGameMode(GameMode.SNAKE)}
                    className={`py-3 px-2 col-span-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                        gameMode === GameMode.SNAKE 
                        ? 'bg-emerald-800 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    🐍 Snake Eater
                </button>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className={`flex-1 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 uppercase tracking-widest shadow-lg ${
                  gameMode === GameMode.MIRROR 
                  ? 'bg-red-800 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                  : gameMode === GameMode.SWARM
                  ? 'bg-blue-800 hover:bg-blue-700 shadow-[0_0_20px_rgba(30,58,138,0.3)]'
                  : gameMode === GameMode.BAT_CATCHER
                  ? 'bg-orange-800 hover:bg-orange-700 shadow-[0_0_20px_rgba(154,52,18,0.3)]'
                  : gameMode === GameMode.MOSQUITO
                  ? 'bg-yellow-800 hover:bg-yellow-700 shadow-[0_0_20px_rgba(202,138,4,0.3)]'
                  : gameMode === GameMode.CLOWN
                  ? 'bg-green-800 hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                  : gameMode === GameMode.SNAKE
                  ? 'bg-emerald-800 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-purple-800 hover:bg-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                }`}
              >
                START THE RITUAL
              </button>

              <button 
                onClick={handleArchitectureClick}
                className="bg-neutral-800 hover:bg-neutral-700 text-cyan-400 font-bold py-4 px-6 rounded-full transition-all border border-cyan-900/50 uppercase tracking-widest text-xs"
              >
                👁️ BLUEPRINT
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.LOADING_MODELS && (
          <div className="text-center animate-pulse">
            <h3 className="text-3xl font-horror text-neutral-300">Calibrating Spiritual Sensors...</h3>
            <p className="text-sm text-neutral-500 mt-2">Loading TensorFlow Vision Models</p>
          </div>
        )}

        {gameState === GameState.GENERATING_GHOST && (
          <div className="text-center animate-pulse">
            <h3 className={`text-3xl font-horror ${getModeColor(gameMode)}`}>
                {getModeTitle()}
            </h3>
            <p className="text-sm text-neutral-500 mt-2">Consulting Gemini Nano</p>
          </div>
        )}

        {gameState === GameState.ERROR && (
          <div className="bg-red-950/90 p-6 rounded-lg border border-red-600 text-center max-w-md">
            <h3 className="text-2xl font-bold text-red-200 mb-2">Ritual Failed</h3>
            <p className="text-red-100 mb-4 break-words text-sm font-mono">{errorMsg}</p>
            <button 
              onClick={() => { setGameState(GameState.IDLE); setErrorMsg(''); }}
              className="underline text-white hover:text-red-300"
            >
              Try Again
            </button>
          </div>
        )}

        {gameState === GameState.ACTIVE && (
          <div className="flex flex-col items-center w-full">
            <HauntedMirror 
              gameState={gameState}
              gameMode={gameMode}
              ghostImage={ghostImage} 
              screamAudio={screamAudio}
              possessionAssets={{
                face: possessionFace,
                eye: possessionEye,
                dagger: possessionDagger
              }}
              mosquitoAssets={{
                  mosquito: mosquitoImage,
                  racket: racketImage
              }}
              clownAssets={{
                  clown: clownImage,
                  tomato: tomatoImage
              }}
              snakeAssets={{
                  head: snakeHeadImage,
                  rat: ratImage,
                  skull: skullImage
              }}
            />
            
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="text-neutral-500 text-sm font-mono border border-neutral-800 p-3 rounded bg-black/50">
                <span className={`mr-2 ${getModeColor(gameMode)}`}>●</span> LIVE FEED ACTIVE
                <span className="mx-2">|</span>
                FACE DETECTOR: ONLINE
                <span className="mx-2">|</span>
                HAND TRACKER: ONLINE
              </div>

              <button 
                onClick={() => setGameState(GameState.IDLE)}
                className="text-red-900/60 hover:text-red-500 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 px-6 py-2 rounded transition-all text-xs font-mono uppercase tracking-[0.2em]"
              >
                [ Abort Ritual / Return to Menu ]
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Architecture Blueprint Modal */}
      {showArch && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <div className="relative w-full max-w-5xl aspect-video bg-neutral-900 border-2 border-cyan-900 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                {archLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <h2 className="text-cyan-400 font-mono tracking-widest text-xl animate-pulse">GENERATING TECHNICAL BLUEPRINT...</h2>
                    </div>
                ) : archImage ? (
                    <img src={archImage} className="w-full h-full object-contain" alt="Architecture Diagram" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-500 font-mono">
                    ERROR: UNABLE TO RENDER BLUEPRINT
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4 flex gap-4">
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono underline uppercase tracking-tighter self-center"
                    >
                      Billing Requirements
                    </a>
                    <button 
                        onClick={() => setShowArch(false)}
                        className="bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-700 px-6 py-2 rounded font-mono uppercase text-sm"
                    >
                        Close Blueprint
                    </button>
                </div>
            </div>
        </div>
      )}

      <footer className="absolute bottom-4 text-neutral-600 text-xs z-0 text-center">
        Powered by Gemini 3 Pro, TensorFlow.js & React
      </footer>
    </div>
  );
};

export default App;
