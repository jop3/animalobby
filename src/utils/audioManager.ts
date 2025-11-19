import { Howl } from 'howler';

// Audio Manager for game sounds
class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initSounds();
  }

  private initSounds() {
    // Placeholder sound definitions
    // In production, replace these URLs with actual audio files

    // For now, we'll create silent placeholders
    // You can replace these with actual audio files later

    const soundDefinitions = {
      jump: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
      land: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
      coin: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
      checkpoint: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
      death: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
      equip: { src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] },
    };

    // Create Howl instances
    Object.entries(soundDefinitions).forEach(([name, config]) => {
      const sound = new Howl({
        ...config,
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
      sound.volume(volume * 0.5); // Global volume multiplier
      sound.play();
    } else {
      console.warn(`Sound not found: ${soundName}`);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Specific sound methods for easy access
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
}

// Singleton instance
export const audioManager = new AudioManager();

// Hook for React components
export function useAudio() {
  return audioManager;
}
