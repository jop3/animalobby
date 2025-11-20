import { CanvasTexture, RepeatWrapping } from 'three';

export class ProceduralTextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private permutation: number[];

  constructor(size = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d')!;

    // Initialize Perlin noise permutation table
    this.permutation = this.generatePermutation();
  }

  // Generate permutation table for Perlin noise
  private generatePermutation(): number[] {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    // Duplicate for overflow
    return [...p, ...p];
  }

  // Perlin noise implementation
  private perlin(x: number, y: number): number {
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    const grad = (hash: number, x: number, y: number) => {
      const h = hash & 3;
      const u = h < 2 ? x : y;
      const v = h < 2 ? y : x;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = fade(x);
    const v = fade(y);

    const p = this.permutation;
    const a = p[X] + Y;
    const b = p[X + 1] + Y;

    return lerp(v,
      lerp(u, grad(p[a], x, y), grad(p[b], x - 1, y)),
      lerp(u, grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1))
    );
  }

  // Multi-octave Perlin noise
  private noise(x: number, y: number, octaves = 4): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.perlin(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }

  // Stone/rock texture with Perlin noise
  createStoneTexture(baseColor: string, detailColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const baseRGB = this.hexToRgb(baseColor);
    const detailRGB = this.hexToRgb(detailColor);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Multi-octave Perlin noise for realistic stone
        const noise1 = this.noise(x * 0.02, y * 0.02, 4);
        const noise2 = this.noise(x * 0.05, y * 0.05, 3);
        const noise3 = this.noise(x * 0.1, y * 0.1, 2);

        // Combine noise layers
        const combined = (noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1 + 1) / 2;

        // Mix colors based on noise
        data[idx] = baseRGB.r + (detailRGB.r - baseRGB.r) * combined;
        data[idx + 1] = baseRGB.g + (detailRGB.g - baseRGB.g) * combined;
        data[idx + 2] = baseRGB.b + (detailRGB.b - baseRGB.b) * combined;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add cracks and details
    this.ctx.strokeStyle = this.darkenColor(baseColor, 40);
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;

    for (let i = 0; i < 30; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);

      let x = startX, y = startY;
      for (let j = 0; j < 20; j++) {
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Neon grid texture for cyber city with circuit patterns
  createNeonGridTexture(gridColor: string, glowColor: string): CanvasTexture {
    const { width, height } = this.canvas;

    // Dark metallic background with noise
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const noise = this.noise(x * 0.1, y * 0.1, 2) * 20;

        data[idx] = 10 + noise;
        data[idx + 1] = 10 + noise;
        data[idx + 2] = 15 + noise;
        data[idx + 3] = 255;
      }
    }
    this.ctx.putImageData(imageData, 0, 0);

    const gridSize = 32;

    // Draw main grid with glow
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = gridColor;
    this.ctx.shadowBlur = 5;

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

    this.ctx.shadowBlur = 0;

    // Add circuit-like patterns
    this.ctx.strokeStyle = glowColor;
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const startX = Math.floor(Math.random() * (width / gridSize)) * gridSize;
      const startY = Math.floor(Math.random() * (height / gridSize)) * gridSize;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);

      let x = startX, y = startY;
      for (let j = 0; j < 5; j++) {
        const dir = Math.floor(Math.random() * 4);
        if (dir === 0) x += gridSize;
        else if (dir === 1) x -= gridSize;
        else if (dir === 2) y += gridSize;
        else y -= gridSize;

        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Add glowing node at end
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x - 8, y - 8, 16, 16);
    }

    // Add bright intersection points
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        if (Math.random() > 0.7) {
          const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 6);
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, 'transparent');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(x - 6, y - 6, 12, 12);
        }
      }
    }

    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }

  // Wood grain texture with realistic rings
  createWoodTexture(darkColor: string, lightColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const darkRGB = this.hexToRgb(darkColor);
    const lightRGB = this.hexToRgb(lightColor);

    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Create wood rings based on distance from center
        const dx = (x - centerX) / width;
        const dy = (y - centerY) / height;
        const dist = Math.sqrt(dx * dx + dy * dy * 4); // Elongate for wood grain

        // Add Perlin noise for organic variation
        const noise1 = this.noise(x * 0.03, y * 0.03, 3);
        const noise2 = this.noise(x * 0.1, y * 0.1, 2);

        // Create ring pattern
        const ringPattern = Math.sin((dist + noise1 * 0.3) * 30) * 0.5 + 0.5;
        const grainPattern = noise2 * 0.2;

        const t = ringPattern + grainPattern;

        // Mix colors
        data[idx] = lightRGB.r + (darkRGB.r - lightRGB.r) * t;
        data[idx + 1] = lightRGB.g + (darkRGB.g - lightRGB.g) * t;
        data[idx + 2] = lightRGB.b + (darkRGB.b - lightRGB.b) * t;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add knots and imperfections
    this.ctx.fillStyle = darkColor;
    this.ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      const knotX = Math.random() * width;
      const knotY = Math.random() * height;
      const knotSize = Math.random() * 20 + 10;

      const gradient = this.ctx.createRadialGradient(knotX, knotY, 0, knotX, knotY, knotSize);
      gradient.addColorStop(0, darkColor);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(knotX - knotSize, knotY - knotSize, knotSize * 2, knotSize * 2);
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  // Ice/crystal texture with realistic frozen surface
  createIceTexture(baseColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const baseRGB = this.hexToRgb(baseColor);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Create ice crystal patterns with Perlin noise
        const noise1 = this.noise(x * 0.02, y * 0.02, 4);
        const noise2 = this.noise(x * 0.08, y * 0.08, 3);

        // Ice has bright frozen patterns
        const icePattern = (noise1 + 1) / 2;
        const crystalDetail = (noise2 + 1) / 2;

        const brightness = icePattern * 0.7 + crystalDetail * 0.3;

        // Mix with white for icy look
        data[idx] = baseRGB.r + (255 - baseRGB.r) * brightness;
        data[idx + 1] = baseRGB.g + (255 - baseRGB.g) * brightness;
        data[idx + 2] = baseRGB.b + (255 - baseRGB.b) * brightness;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add crystalline facets
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 15;
      const angle = Math.random() * Math.PI * 2;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);

      // Draw hexagonal crystal
      this.ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI * 2) / 6;
        const px = Math.cos(a) * size;
        const py = Math.sin(a) * size;
        if (j === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();

      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fill();

      this.ctx.restore();
    }

    // Add frost cracks
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.4;

    for (let i = 0; i < 20; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);

      let x = startX, y = startY;
      for (let j = 0; j < 8; j++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 30 + 10;
        x += Math.cos(angle) * dist;
        y += Math.sin(angle) * dist;
        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Metal panel texture for space station with brushed metal
  createMetalPanelTexture(panelColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const baseRGB = this.hexToRgb(panelColor);

    // Create brushed metal background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Horizontal brushed metal pattern
        const brush = this.noise(x * 0.5, y * 0.05, 2);
        const variation = (brush + 1) / 2;

        data[idx] = baseRGB.r + (variation - 0.5) * 30;
        data[idx + 1] = baseRGB.g + (variation - 0.5) * 30;
        data[idx + 2] = baseRGB.b + (variation - 0.5) * 30;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    const panelSize = 64;

    // Draw panel borders with gradient for depth
    for (let x = 0; x < width; x += panelSize) {
      for (let y = 0; y < height; y += panelSize) {
        // Top and left highlight
        this.ctx.strokeStyle = this.lightenColor(panelColor, 40);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + panelSize);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + panelSize, y);
        this.ctx.stroke();

        // Bottom and right shadow
        this.ctx.strokeStyle = this.darkenColor(panelColor, 40);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + panelSize);
        this.ctx.lineTo(x + panelSize, y + panelSize);
        this.ctx.lineTo(x + panelSize, y);
        this.ctx.stroke();

        // Add rivets with metallic look
        const rivetPositions = [
          [x + 8, y + 8],
          [x + panelSize - 8, y + 8],
          [x + 8, y + panelSize - 8],
          [x + panelSize - 8, y + panelSize - 8]
        ];

        rivetPositions.forEach(([rx, ry]) => {
          // Rivet shadow
          const gradient = this.ctx.createRadialGradient(rx, ry, 0, rx, ry, 5);
          gradient.addColorStop(0, '#888888');
          gradient.addColorStop(0.5, '#444444');
          gradient.addColorStop(1, 'transparent');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          this.ctx.fill();

          // Rivet highlight
          this.ctx.fillStyle = '#AAAAAA';
          this.ctx.beginPath();
          this.ctx.arc(rx - 1, ry - 1, 2, 0, Math.PI * 2);
          this.ctx.fill();
        });

        // Add scratches and wear
        if (Math.random() > 0.7) {
          this.ctx.strokeStyle = this.darkenColor(panelColor, 20);
          this.ctx.lineWidth = 1;
          this.ctx.globalAlpha = 0.3;

          const scratchCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < scratchCount; i++) {
            const sx = x + Math.random() * panelSize;
            const sy = y + Math.random() * panelSize;
            const slen = Math.random() * 30 + 10;

            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + slen, sy + (Math.random() - 0.5) * 5);
            this.ctx.stroke();
          }
          this.ctx.globalAlpha = 1;
        }
      }
    }

    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Mushroom cap spotted texture with organic patterns
  createMushroomTexture(capColor: string, spotColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const capRGB = this.hexToRgb(capColor);

    // Create organic mushroom cap texture
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Organic noise for cap texture
        const noise1 = this.noise(x * 0.03, y * 0.03, 3);
        const variation = (noise1 + 1) / 2;

        data[idx] = capRGB.r + (variation - 0.5) * 40;
        data[idx + 1] = capRGB.g + (variation - 0.5) * 40;
        data[idx + 2] = capRGB.b + (variation - 0.5) * 40;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add organic spots with varied sizes
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 20 + 5;

      // Spots with soft edges
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, spotColor);
      gradient.addColorStop(0.7, spotColor);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = 0.6 + Math.random() * 0.2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Add subtle gills/radial lines from center
    this.ctx.strokeStyle = this.darkenColor(capColor, 30);
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.1;

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const endX = centerX + Math.cos(angle) * width;
      const endY = centerY + Math.sin(angle) * height;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Sandstone texture with realistic sediment layers
  createSandstoneTexture(baseColor: string): CanvasTexture {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    const baseRGB = this.hexToRgb(baseColor);

    // Create sandy texture with Perlin noise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Multiple octaves for sand grain detail
        const noise1 = this.noise(x * 0.02, y * 0.02, 4);
        const noise2 = this.noise(x * 0.1, y * 0.1, 3);
        const noise3 = this.noise(x * 0.5, y * 0.5, 1);

        // Combine for sandy appearance
        const sandPattern = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2 + 1) / 2;

        data[idx] = baseRGB.r + (sandPattern - 0.5) * 50;
        data[idx + 1] = baseRGB.g + (sandPattern - 0.5) * 50;
        data[idx + 2] = baseRGB.b + (sandPattern - 0.5) * 50;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add sediment layers
    this.ctx.globalAlpha = 0.15;
    let yPos = 0;
    while (yPos < height) {
      const layerHeight = Math.random() * 50 + 20;
      const layerColor = Math.random() > 0.5 ?
        this.lightenColor(baseColor, 15) :
        this.darkenColor(baseColor, 15);

      this.ctx.fillStyle = layerColor;
      this.ctx.fillRect(0, yPos, width, layerHeight);

      // Draw layer boundary
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeStyle = this.darkenColor(baseColor, 30);
      this.ctx.lineWidth = 1 + Math.random() * 2;

      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);

      // Wavy layer line
      for (let x = 0; x < width; x += 5) {
        const wavyY = yPos + Math.sin(x * 0.05) * 3;
        this.ctx.lineTo(x, wavyY);
      }
      this.ctx.stroke();

      this.ctx.globalAlpha = 0.15;
      yPos += layerHeight;
    }

    // Add erosion cracks
    this.ctx.strokeStyle = this.darkenColor(baseColor, 40);
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.25;

    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);

      let x = startX, y = startY;
      const crackLength = Math.floor(Math.random() * 10) + 5;

      for (let j = 0; j < crackLength; j++) {
        // Cracks tend to go downward
        x += (Math.random() - 0.5) * 15;
        y += Math.random() * 8 + 2;

        this.ctx.lineTo(x, y);

        if (y > height) break;
      }
      this.ctx.stroke();
    }

    // Add small pebbles embedded in sand
    this.ctx.globalAlpha = 0.3;
    for (let i = 0; i < 30; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const psize = Math.random() * 3 + 1;

      this.ctx.fillStyle = this.darkenColor(baseColor, 30);
      this.ctx.beginPath();
      this.ctx.arc(px, py, psize, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    const texture = new CanvasTexture(this.canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Helper color functions
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff,
    };
  }

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
