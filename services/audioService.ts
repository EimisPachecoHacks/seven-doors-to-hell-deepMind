class AudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy init via user interaction
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createPinkNoise();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createPinkNoise() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
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
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
  }

  public triggerScream() {
    if (!this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    
    // Vocal Fry Source (Sawtooth modulated by noise)
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3); // Pitch bend up

    // Noise Modulator (Roughness)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 100;
    noise.connect(noiseGain);
    noiseGain.connect(osc.frequency);

    // Formant Filters (Throat simulation)
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 700;
    f1.Q.value = 1;

    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.value = 1200;
    f2.Q.value = 1;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(1, t);
    masterGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

    osc.connect(f1);
    osc.connect(f2);
    f1.connect(masterGain);
    f2.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 1.5);
    noise.stop(t + 1.5);
  }

  public triggerExplosion() {
    if (!this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;

    // Burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 1);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    // Sub-bass impact
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.8);
    
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    noise.connect(noiseFilter).connect(noiseGain).connect(this.ctx.destination);
    subOsc.connect(subGain).connect(this.ctx.destination);

    noise.start(t);
    subOsc.start(t);
    noise.stop(t + 1.2);
    subOsc.stop(t + 1.0);
  }

  public triggerWhoosh() {
    if (!this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.2);
    filter.frequency.linearRampToValueAtTime(100, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);

    noise.connect(filter).connect(gain).connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.6);
  }
}

export const audioService = new AudioEngine();
