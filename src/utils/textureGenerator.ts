import { CanvasTexture, RepeatWrapping } from 'three';

export class ProceduralTextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(size = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Stone/rock texture with noise
  createStoneTexture(baseColor: string, detailColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add noise
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      this.ctx.fillStyle = detailColor;
      this.ctx.globalAlpha = Math.random() * 0.5;
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Neon grid texture for cyber city
  createNeonGridTexture(gridColor: string, glowColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);

    const gridSize = 32;
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 2;

    // Draw grid
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Add glow spots
    this.ctx.fillStyle = glowColor;
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
      const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, gridSize / 2);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
    }

    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }

  // Wood grain texture
  createWoodTexture(darkColor: string, lightColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);

    for (let i = 0; i < 20; i++) {
      const pos = Math.random();
      gradient.addColorStop(pos, Math.random() > 0.5 ? darkColor : lightColor);
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add grain lines
    this.ctx.strokeStyle = darkColor;
    this.ctx.globalAlpha = 0.3;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x + (Math.random() - 0.5) * 20, height);
      this.ctx.lineWidth = Math.random() * 2;
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  // Ice/crystal texture
  createIceTexture(baseColor: string): CanvasTexture {
    const { width, height } = this.canvas;

    // Base layer
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, '#FFFFFF');
    gradient.addColorStop(1, baseColor);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add crystal facets
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 50 + 20;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + size, y + size / 2);
      this.ctx.lineTo(x + size / 2, y + size);
      this.ctx.closePath();

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.globalAlpha = Math.random() * 0.3;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Metal panel texture for space station
  createMetalPanelTexture(panelColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = panelColor;
    this.ctx.fillRect(0, 0, width, height);

    const panelSize = 64;
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;

    // Draw panels
    for (let x = 0; x < width; x += panelSize) {
      for (let y = 0; y < height; y += panelSize) {
        this.ctx.strokeRect(x, y, panelSize, panelSize);

        // Add rivets
        const rivetSize = 4;
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(x + 5, y + 5, rivetSize, rivetSize);
        this.ctx.fillRect(x + panelSize - 10, y + 5, rivetSize, rivetSize);
        this.ctx.fillRect(x + 5, y + panelSize - 10, rivetSize, rivetSize);
        this.ctx.fillRect(x + panelSize - 10, y + panelSize - 10, rivetSize, rivetSize);
      }
    }

    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Mushroom cap spotted texture
  createMushroomTexture(capColor: string, spotColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = capColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add spots
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 15 + 5;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = spotColor;
      this.ctx.globalAlpha = 0.7;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Sandstone texture
  createSandstoneTexture(baseColor: string): CanvasTexture {
    const { width, height } = this.canvas;

    // Base gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, this.lightenColor(baseColor, 20));
    gradient.addColorStop(1, baseColor);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add sandy texture
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.ctx.fillStyle = this.randomizeColor(baseColor, 30);
      this.ctx.globalAlpha = Math.random() * 0.3;
      this.ctx.fillRect(x, y, 1, 1);
    }

    // Add layer lines
    this.ctx.globalAlpha = 0.2;
    this.ctx.strokeStyle = this.darkenColor(baseColor, 20);
    for (let y = 0; y < height; y += Math.random() * 40 + 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.lineWidth = Math.random() * 2;
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Helper color functions
  private lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private darkenColor(color: string, amount: number): string {
    return this.lightenColor(color, -amount);
  }

  private randomizeColor(color: string, variance: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + (Math.random() - 0.5) * variance * 2));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + (Math.random() - 0.5) * variance * 2));
    const b = Math.max(0, Math.min(255, (num & 0xff) + (Math.random() - 0.5) * variance * 2));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}

// Singleton instance
export const textureGenerator = new ProceduralTextureGenerator();
