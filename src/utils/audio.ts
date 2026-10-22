/**
 * Audio feedback and Web Speech API synthesis for Bahasa Melayu
 * With Relaxing Nintendo Café BGM, Smooth Audio Ducking on Speech, and Button Click SFX
 */

const NINTENDO_CAFE_BGM_URL =
  '/assets/aistudio/Relaxing_Nintendo_Caf__Music_Vol_2___Studying__Chill__Jazz__Bossa_Nova__1__68c5c980.mp3';

class SoundController {
  private audioCtx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBGMPlaying: boolean = false;
  private isSpeaking: boolean = false;
  private lastClickTimestamp: number = 0;
  private volumeRampTimer: number | null = null;

  // Normal and ducked volumes for Nintendo Cafe BGM
  private readonly NORMAL_BGM_VOLUME = 0.30;
  private readonly DUCKED_BGM_VOLUME = 0.06;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Get or initialize HTMLAudioElement for Nintendo Café BGM
  private getBGMAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(NINTENDO_CAFE_BGM_URL);
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
      this.bgmAudio.volume = this.NORMAL_BGM_VOLUME;
    }
    return this.bgmAudio;
  }

  // Start background music (Relaxing Nintendo Café Music)
  startBGM() {
    if (!this.enabled) return;
    const audio = this.getBGMAudio();
    if (!audio) return;

    this.isBGMPlaying = true;
    audio.volume = this.isSpeaking ? this.DUCKED_BGM_VOLUME : this.NORMAL_BGM_VOLUME;
    audio.play().catch(() => {
      // Browser autoplay policy might await user click/gesture
    });
  }

  // Stop background music
  stopBGM() {
    this.isBGMPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  // Smoothly ramp BGM volume up or down for audio ducking
  private rampBGMVolume(targetVol: number, durationMs = 280) {
    const audio = this.getBGMAudio();
    if (!audio) return;

    if (this.volumeRampTimer !== null) {
      clearInterval(this.volumeRampTimer);
      this.volumeRampTimer = null;
    }

    const startVol = audio.volume;
    const diff = targetVol - startVol;
    const steps = 14;
    const stepDuration = durationMs / steps;
    let stepCount = 0;

    this.volumeRampTimer = window.setInterval(() => {
      stepCount++;
      if (!this.bgmAudio) {
        if (this.volumeRampTimer) clearInterval(this.volumeRampTimer);
        return;
      }
      const progress = stepCount / steps;
      this.bgmAudio.volume = Math.max(0, Math.min(1, startVol + diff * progress));

      if (stepCount >= steps) {
        if (this.volumeRampTimer) clearInterval(this.volumeRampTimer);
        this.volumeRampTimer = null;
        this.bgmAudio.volume = targetVol;
      }
    }, stepDuration);
  }

  // Audio Ducking: Soften background music while voice audio is speaking
  duckBGM() {
    this.isSpeaking = true;
    this.rampBGMVolume(this.DUCKED_BGM_VOLUME, 200);
  }

  // Unduck: Smoothly restore background music volume after voice finishes
  unduckBGM() {
    this.isSpeaking = false;
    if (this.enabled && this.isBGMPlaying) {
      this.rampBGMVolume(this.NORMAL_BGM_VOLUME, 450);
    }
  }

  // Play synthetic tone
  playTone(freq: number, type: OscillatorType, duration: number, delay = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      }, delay);
    } catch {
      // Audio might be blocked until user gesture
    }
  }

  // Happy success sound
  playSuccess() {
    this.playTone(523.25, 'triangle', 0.15, 0);   // C5
    this.playTone(659.25, 'triangle', 0.15, 100); // E5
    this.playTone(783.99, 'triangle', 0.15, 200); // G5
    this.playTone(1046.50, 'sine', 0.35, 300);   // C6
  }

  // Coin collected chime
  playCoin() {
    this.playTone(987.77, 'sine', 0.1, 0);    // B5
    this.playTone(1318.51, 'triangle', 0.25, 80); // E6
  }

  // Try again / error sound (descending resonant quiz buzzer / womp-womp)
  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: First descending "womp" (220Hz -> 170Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(600, now);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(170, now + 0.18);

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2: Second lower descending "womp" (165Hz -> 115Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(500, now + 0.2);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(165, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(115, now + 0.45);

      gain2.gain.setValueAtTime(0.22, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.2);
      osc2.stop(now + 0.45);
    } catch {
      // Audio might be blocked until user gesture
    }
  }

  // Realistic Crowd Applause & cheering hand claps sound effect
  playApplause() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 1.6;

      // 1. Triumphant musical chord flourish
      this.playTone(523.25, 'triangle', 0.25, 0);   // C5
      this.playTone(659.25, 'triangle', 0.3, 100);  // E5
      this.playTone(783.99, 'triangle', 0.35, 200); // G5
      this.playTone(1046.50, 'sine', 0.5, 300);    // C6

      // 2. Realistic white-noise burst hand claps (dense randomized cluster)
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Generate ~35 randomized overlapping clap bursts
      for (let c = 0; c < 35; c++) {
        const clapTime = now + 0.15 + (Math.random() * 1.3);
        const clapSource = ctx.createBufferSource();
        clapSource.buffer = noiseBuffer;

        // Bandpass filter centered around 1100Hz - 1600Hz (acoustics of hands clapping)
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 + Math.random() * 500, clapTime);
        filter.Q.setValueAtTime(2.2, clapTime);

        // Quick exponential clap envelope (0.045s decay)
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, clapTime);
        gain.gain.exponentialRampToValueAtTime(0.22 + Math.random() * 0.12, clapTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.045);

        clapSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        clapSource.start(clapTime);
        clapSource.stop(clapTime + 0.05);
      }
    } catch {
      // Audio might be blocked until user gesture
    }
  }

  // Click / tap bubble sound for every button with debounce protection
  playClick() {
    if (!this.enabled) return;
    const now = Date.now();
    // 50ms debounce to prevent double-sounding if an element has both universal and local trigger
    if (now - this.lastClickTimestamp < 50) return;
    this.lastClickTimestamp = now;

    this.playTone(620, 'sine', 0.08, 0);
  }

  // Jump spring sound for platformer
  playJump() {
    this.playTone(330, 'square', 0.08, 0);
    this.playTone(493.88, 'sine', 0.15, 50);
  }

  // Pacman waka-waka chomp sound
  playChomp() {
    this.playTone(280, 'triangle', 0.05, 0);
    this.playTone(340, 'sine', 0.05, 50);
  }

  // Ghost eaten / power bonus
  playEatGhost() {
    this.playTone(440, 'triangle', 0.1, 0);
    this.playTone(554.37, 'sine', 0.1, 70);
    this.playTone(659.25, 'triangle', 0.15, 140);
    this.playTone(880, 'sine', 0.25, 210);
  }

  // Fanfare for level complete or badge earned
  playFanfare() {
    this.playTone(523.25, 'triangle', 0.2, 0);
    this.playTone(523.25, 'triangle', 0.2, 180);
    this.playTone(523.25, 'triangle', 0.2, 360);
    this.playTone(659.25, 'triangle', 0.4, 540);
    this.playTone(783.99, 'sine', 0.6, 750);
  }

  // Humanize and normalize Malay text for accurate Malaysian Malay Baku pronunciation & natural intonation
  humanizeMalayText(raw: string): string {
    if (!raw) return '';
    let text = raw;

    // Expand educational abbreviations to natural spoken Malay
    text = text.replace(/\bPdP\b/gi, 'Pengajaran dan Pembelajaran');
    text = text.replace(/\bPBS\b/gi, 'Pentaksiran Berasaskan Sekolah');
    text = text.replace(/\bAR\b/g, 'A.R.');
    text = text.replace(/\bBM\b/g, 'Bahasa Melayu');
    text = text.replace(/\bSK\b/g, 'Sekolah Kebangsaan');
    text = text.replace(/\bDSKP\b/gi, 'Dokumen Standard Kurikulum');
    text = text.replace(/\bTP\s*(\d)\b/gi, 'Tahap Penguasaan $1');
    text = text.replace(/\bSP\s*(\d)/gi, 'Standard Pembelajaran $1');

    // Natural pacing pauses for punctuation & questions
    text = text.replace(/Soalan\s*(\d+)[:.]/gi, 'Soalan $1... ');
    text = text.replace(/[“”"']/g, ' '); // remove confusing quote clicks
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  // Active speaking listeners for character animations
  private speechListeners: Set<(isSpeaking: boolean) => void> = new Set();

  onSpeechStateChange(listener: (isSpeaking: boolean) => void) {
    this.speechListeners.add(listener);
    return () => this.speechListeners.delete(listener);
  }

  private notifySpeechState(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speechListeners.forEach((fn) => fn(speaking));
  }

  // Text-to-Speech in Bahasa Melayu Malaysia Baku with humanized intonation & teacher personas
  speakMalay(
    text: string,
    persona: 'syafiqah' | 'aaron' | 'freshcy' | 'neutral' = 'syafiqah'
  ) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const humanized = this.humanizeMalayText(text);
      const utterance = new SpeechSynthesisUtterance(humanized);

      // Personas with distinct, warm Malaysian teacher intonations
      if (persona === 'aaron') {
        utterance.rate = 0.90; // Natural, articulate, authoritative yet friendly
        utterance.pitch = 0.96; // Warm baritone male tone
      } else if (persona === 'freshcy') {
        utterance.rate = 0.92; // Cheerful, energetic, vibrant teacher
        utterance.pitch = 1.14; // Bright, lively intonation
      } else if (persona === 'syafiqah') {
        utterance.rate = 0.88; // Gentle, motherly, nurturing cadence
        utterance.pitch = 1.08; // Warm, sweet feminine intonation
      } else {
        utterance.rate = 0.90;
        utterance.pitch = 1.05;
      }

      // Perlahankan background music semasa audio bercakap supaya suara jelas
      this.duckBGM();
      this.notifySpeechState(true);

      utterance.onend = () => {
        this.unduckBGM();
        this.notifySpeechState(false);
      };

      utterance.onerror = () => {
        this.unduckBGM();
        this.notifySpeechState(false);
      };

      // Find Malaysian Malay voice (Priority 1: exact ms-MY, Priority 2: any ms, Priority 3: id fallback)
      const voices = window.speechSynthesis.getVoices();
      
      let msVoice = voices.find(
        (v) =>
          (v.lang === 'ms-MY' || v.lang === 'ms_MY') &&
          (v.name.toLowerCase().includes('malaysia') ||
            v.name.toLowerCase().includes('melayu') ||
            v.name.toLowerCase().includes('yasmin') ||
            v.name.toLowerCase().includes('fatihah'))
      );

      if (!msVoice) {
        msVoice = voices.find(
          (v) => v.lang.replace('_', '-').toLowerCase().startsWith('ms-my') || v.lang.startsWith('ms')
        );
      }

      if (!msVoice) {
        // Fallback only if no ms voice is installed on client device
        msVoice = voices.find((v) => v.lang.startsWith('id'));
      }

      if (msVoice) {
        utterance.voice = msVoice;
      }
      utterance.lang = 'ms-MY';
      window.speechSynthesis.speak(utterance);
    } catch {
      this.unduckBGM();
      this.notifySpeechState(false);
    }
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.unduckBGM();
    this.notifySpeechState(false);
  }
}

export const sound = new SoundController();
