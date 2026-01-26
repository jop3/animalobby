import { Howl } from 'howler';

/**
 * AudioManager - Manages game sound effects using Howler.js
 *
 * Sound effects are generated using Web Audio API oscillators for simple,
 * lightweight audio without requiring external audio files.
 */

// Generate a simple beep sound as a data URL using Web Audio
function generateToneDataUrl(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  fadeOut: boolean = true
): string {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;

  // Create buffer for WAV file
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
  view.setUint16(32, numChannels * bitsPerSample / 8, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample: number;

    // Generate waveform based on type
    const phase = 2 * Math.PI * frequency * t;
    switch (type) {
      case 'square':
        sample = Math.sin(phase) > 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample = 2 * ((frequency * t) % 1) - 1;
        break;
      case 'triangle':
        sample = 2 * Math.abs(2 * ((frequency * t) % 1) - 1) - 1;
        break;
      default: // sine
        sample = Math.sin(phase);
    }

    // Apply envelope (fade out)
    if (fadeOut) {
      const envelope = 1 - (i / numSamples);
      sample *= envelope;
    }

    // Convert to 16-bit PCM
    const pcmValue = Math.max(-1, Math.min(1, sample * 0.5)) * 32767;
    view.setInt16(44 + i * 2, pcmValue, true);
  }

  // Convert to base64 data URL
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

// Pre-generate sound effects
const SOUNDS = {
  // Jump: Quick ascending tone
  jump: generateToneDataUrl(400, 0.1, 'square', true),

  // Land: Short thud
  land: generateToneDataUrl(150, 0.08, 'sine', true),

  // Coin: Pleasant ding (two tones)
  coin: generateToneDataUrl(800, 0.15, 'sine', true),

  // Checkpoint: Ascending chime
  checkpoint: generateToneDataUrl(600, 0.3, 'sine', true),

  // Death: Descending tone
  death: generateToneDataUrl(200, 0.4, 'sawtooth', true),

  // Equip: Click sound
  equip: generateToneDataUrl(500, 0.05, 'square', true),

  // Power-up: Rising tone
  powerup: generateToneDataUrl(700, 0.25, 'triangle', true),
};

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initSounds();
  }

  private initSounds() {
    // Create Howl instances for each sound
    Object.entries(SOUNDS).forEach(([name, src]) => {
      const sound = new Howl({
        src: [src],
        volume: 0.5,
        preload: true,
      });
      this.sounds.set(name, sound);
    });
  }

  play(soundName: string, volume: number = 1) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume(volume * 0.5);
      sound.play();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Specific sound methods
  playJump() {
    this.play('jump', 0.6);
  }

  playLand() {
    this.play('land', 0.4);
  }

  playCoin() {
    this.play('coin', 0.7);
  }

  playCheckpoint() {
    this.play('checkpoint', 0.8);
  }

  playDeath() {
    this.play('death', 1);
  }

  playEquip() {
    this.play('equip', 0.5);
  }

  playPowerUp() {
    this.play('powerup', 0.7);
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Hook for React components
export function useAudio() {
  return audioManager;
}
