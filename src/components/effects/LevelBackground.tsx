import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { IceCrystals } from './ParticleSystem';

interface LevelBackgroundProps {
  levelId: string;
  skyColor: string;
}

export function LevelBackground({ levelId, skyColor }: LevelBackgroundProps) {
  const backgroundGroupRef = useRef<THREE.Group>(null);
  const quality = useGameStore((state) => state.quality);

  // Particle count multipliers based on quality
  const particleMultiplier = quality === 'low' ? 0.2 : quality === 'medium' ? 0.5 : 1.0;

  // Generate background based on level theme
  const backgroundElements = useMemo(() => {
    switch (levelId) {
      case 'space_station':
        return <SpaceBackground particleMultiplier={particleMultiplier} />;
      case 'lava_volcano':
        return <VolcanoBackground particleMultiplier={particleMultiplier} />;
      case 'ice_cavern':
        return <IceCavernBackground particleMultiplier={particleMultiplier} />;
      case 'desert_ruins':
        return <DesertBackground />;
      case 'neon_city':
        return <NeonCityBackground />;
      case 'mushroom_forest':
        return <MushroomForestBackground particleMultiplier={particleMultiplier} />;
      case 'underwater_temple':
        return <UnderwaterBackground particleMultiplier={particleMultiplier} />;
      case 'green_fields':
        return <GreenFieldsBackground />;
      case 'parkour_challenge':
        return <TrainingFacilityBackground />;
      case 'unicorn_castle':
        return <UnicornCastleBackground particleMultiplier={particleMultiplier} />;
      case 'sky_islands':
        return <SkyIslandsBackground />;
      case 'jungle_challenge':
        return <JungleChallengeBackground particleMultiplier={particleMultiplier} />;
      default:
        return null;
    }
  }, [levelId, particleMultiplier]);

  return (
    <>
      {/* Base sky color */}
      <color attach="background" args={[skyColor]} />

      {/* Themed background elements */}
      <group ref={backgroundGroupRef} position={[0, 0, -80]}>
        {backgroundElements}
      </group>
    </>
  );
}

// Space Station Background - Starfield with nebula
function SpaceBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const starsRef = useRef<THREE.Points>(null);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const starSizesRef = useRef<Float32Array | null>(null);

  // Create starfield - reduced for performance
  const stars = useMemo(() => {
    const baseCount = 500; // Reduced from 2000
    const count = Math.floor(baseCount * particleMultiplier);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const color = new THREE.Color();
      const rand = Math.random();
      if (rand < 0.7) color.setHex(0xFFFFFF);
      else if (rand < 0.85) color.setHex(0x00D9FF);
      else color.setHex(0x4A00E0);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    starSizesRef.current = sizes;
    return { positions, colors, sizes };
  }, [particleMultiplier]);

  // Animate stars with twinkling
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;

      // Twinkling effect
      const geometry = starsRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < sizes.length; i++) {
        const twinkle = Math.sin(state.clock.elapsedTime * 3 + i) * 0.5 + 0.5;
        sizes[i] = (starSizesRef.current![i] || 1) * (0.5 + twinkle * 0.5);
      }
      geometry.attributes.size.needsUpdate = true;
    }

    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }

    // Slowly rotating planet
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Nebula shader
  const nebulaShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Create nebula clouds
        float n = sin(uv.x * 3.0 + time * 0.1) * sin(uv.y * 2.0 + time * 0.15);
        n = smoothstep(0.3, 0.7, n);

        vec3 color1 = vec3(0.29, 0.0, 0.88); // Purple
        vec3 color2 = vec3(0.0, 0.85, 1.0); // Cyan
        vec3 nebula = mix(color1, color2, n);

        float alpha = n * 0.3;
        gl_FragColor = vec4(nebula, alpha);
      }
    `,
  }), []);

  return (
    <>
      {/* Stars with twinkling */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stars.positions.length / 3}
            array={stars.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={stars.colors.length / 3}
            array={stars.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={stars.sizes.length}
            array={stars.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial size={2} vertexColors sizeAttenuation transparent />
      </points>

      {/* Animated nebula backdrop */}
      <mesh position={[0, 0, -50]}>
        <planeGeometry args={[200, 150]} />
        <shaderMaterial ref={nebulaMaterialRef} {...nebulaShader} transparent />
      </mesh>

      {/* Rotating distant planet */}
      <mesh ref={planetRef} position={[60, 30, -40]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>

      {/* Shooting stars */}
      <ShootingStars />
    </>
  );
}

// Shooting stars effect for space
function ShootingStars() {
  const starRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    starRefs.current.forEach((star, i) => {
      if (!star) return;

      const starTime = (time * 0.5 + i * 3) % 6;

      if (starTime < 1) {
        // Shooting star is visible
        const progress = starTime;
        star.position.x = -100 + progress * 200;
        star.position.y = 50 - progress * 100;
        star.scale.x = 10 + progress * 20;
        (star.material as any).opacity = (1 - progress) * 0.8;
      } else {
        // Hidden
        (star.material as any).opacity = 0;
      }
    });
  });

  return (
    <group>
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (starRefs.current[i] = el)}
          position={[-100, 50, -30]}
        >
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#FFFFFF" transparent />
        </mesh>
      ))}
    </group>
  );
}

// Volcano Background - Fiery sky with mountain silhouettes
function VolcanoBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const smokeRef = useRef<THREE.Points>(null);
  const lavaGlowRef = useRef<THREE.Mesh>(null);
  const emberRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      // Animate smoke rising
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.1; // Rise
        if (positions[i + 1] > 40) {
          positions[i + 1] = -20 + Math.random() * 20; // Reset
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Pulsing lava glow
    if (lavaGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.4;
      (lavaGlowRef.current.material as any).opacity = pulse;
    }

    // Animate floating embers
    emberRefs.current.forEach((ember, i) => {
      if (!ember) return;
      const time = state.clock.elapsedTime + i;
      ember.position.y = -30 + ((time * 2) % 60);
      ember.position.x = Math.sin(time) * 20;
      ember.position.z = Math.cos(time) * 10;

      const opacity = 1 - ((time * 2) % 60) / 60;
      (ember.material as any).opacity = opacity * 0.8;
    });
  });

  return (
    <>
      {/* Volcanic mountain silhouettes */}
      <mesh position={[-40, -30, 0]}>
        <coneGeometry args={[30, 60, 4]} />
        <meshBasicMaterial color="#1a0a00" />
      </mesh>

      <mesh position={[30, -25, -10]}>
        <coneGeometry args={[25, 50, 4]} />
        <meshBasicMaterial color="#0d0500" />
      </mesh>

      <mesh position={[-10, -28, -5]}>
        <coneGeometry args={[35, 55, 4]} />
        <meshBasicMaterial color="#160800" />
      </mesh>

      {/* Pulsing lava glow from below */}
      <mesh ref={lavaGlowRef} position={[0, -50, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 100]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.4} />
      </mesh>

      {/* Rising volcanic smoke */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={new Float32Array(
              Array.from({ length: 600 }, (_, i) => {
                const idx = Math.floor(i / 3);
                if (i % 3 === 0) return (Math.random() - 0.5) * 80;
                if (i % 3 === 1) return -20 + Math.random() * 40;
                return (Math.random() - 0.5) * 60;
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={8} color="#3a1a0a" transparent opacity={0.4} />
      </points>

      {/* Floating embers */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (emberRefs.current[i] = el)}
          position={[0, -30, 0]}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#FF6600" transparent />
        </mesh>
      ))}
    </>
  );
}

// Ice Cavern Background - Cave ceiling with aurora
function IceCavernBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const auroraMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (auroraMaterialRef.current) {
      auroraMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const auroraShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Aurora effect
        float wave1 = sin(uv.x * 5.0 + time * 0.5) * 0.5 + 0.5;
        float wave2 = sin(uv.x * 3.0 - time * 0.3 + uv.y * 2.0) * 0.5 + 0.5;

        vec3 color1 = vec3(0.0, 1.0, 0.8); // Cyan
        vec3 color2 = vec3(0.5, 0.0, 1.0); // Purple
        vec3 aurora = mix(color1, color2, wave1) * wave2;

        float alpha = wave2 * 0.4;
        gl_FragColor = vec4(aurora, alpha);
      }
    `,
  }), []);

  return (
    <>
      {/* Aurora borealis effect */}
      <mesh position={[0, 40, -20]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[200, 80]} />
        <shaderMaterial ref={auroraMaterialRef} {...auroraShader} transparent />
      </mesh>

      {/* Ice stalactites */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 150,
            30 + Math.random() * 20,
            (Math.random() - 0.5) * 40,
          ]}
        >
          <coneGeometry args={[1 + Math.random() * 2, 5 + Math.random() * 10, 6]} />
          <meshBasicMaterial color="#a5d8ff" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Cave ceiling */}
      <mesh position={[0, 50, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[300, 200]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Floating ice crystals */}
      {particleMultiplier > 0.3 && (
        <>
          <IceCrystals position={[-40, 10, -20]} count={8} />
          <IceCrystals position={[40, 15, -25]} count={8} />
          <IceCrystals position={[0, 5, -15]} count={10} />
        </>
      )}
    </>
  );
}

// Desert Background - Sandy sky with sun and heat haze
function DesertBackground() {
  const heatHazeMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (heatHazeMaterialRef.current) {
      heatHazeMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const heatHazeShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Heat haze distortion
        float distortion = sin(uv.y * 10.0 + time * 2.0) * 0.02;
        uv.x += distortion;

        // Gradient from tan to orange
        vec3 color = mix(vec3(0.87, 0.72, 0.53), vec3(1.0, 0.65, 0.0), uv.y * 0.3);

        float alpha = 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), []);

  return (
    <>
      {/* Sun */}
      <mesh position={[50, 40, -30]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Sun glow */}
      <mesh position={[50, 40, -30]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.3} />
      </mesh>

      {/* Heat haze */}
      <mesh position={[0, -10, 0]}>
        <planeGeometry args={[300, 100]} />
        <shaderMaterial ref={heatHazeMaterialRef} {...heatHazeShader} transparent />
      </mesh>

      {/* Distant pyramid silhouettes */}
      <mesh position={[-60, -20, -20]}>
        <coneGeometry args={[15, 25, 4]} />
        <meshBasicMaterial color="#8B4513" transparent opacity={0.3} />
      </mesh>

      <mesh position={[40, -18, -25]}>
        <coneGeometry args={[12, 20, 4]} />
        <meshBasicMaterial color="#A0522D" transparent opacity={0.25} />
      </mesh>

      {/* Sand dunes silhouettes */}
      <mesh position={[0, -35, -10]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[50, 50, 20, 32, 1, false, 0, Math.PI]} />
        <meshBasicMaterial color="#DEB887" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// Neon City Background - Cyberpunk cityscape
function NeonCityBackground() {
  const scanlinesMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (scanlinesMaterialRef.current) {
      scanlinesMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const scanlinesShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Scanlines
        float scanline = sin(uv.y * 100.0 + time * 5.0) * 0.5 + 0.5;

        vec3 color = vec3(0.53, 0.0, 1.0) * scanline;

        float alpha = 0.1;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), []);

  return (
    <>
      {/* City buildings */}
      {Array.from({ length: 20 }).map((_, i) => {
        const height = 30 + Math.random() * 40;
        const width = 8 + Math.random() * 8;
        const xPos = (i - 10) * 15;

        return (
          <group key={i} position={[xPos, -30 + height / 2, -20 - Math.random() * 20]}>
            {/* Building */}
            <mesh>
              <boxGeometry args={[width, height, width]} />
              <meshBasicMaterial color={i % 3 === 0 ? '#8B00FF' : i % 3 === 1 ? '#FF006E' : '#00D9FF'} transparent opacity={0.4} />
            </mesh>

            {/* Window lights */}
            {Array.from({ length: 5 }).map((_, j) => (
              <mesh key={j} position={[0, (j - 2) * 8, width / 2 + 0.1]}>
                <planeGeometry args={[width * 0.8, 2]} />
                <meshBasicMaterial color="#FFFF00" />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Scanlines overlay */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[300, 200]} />
        <shaderMaterial ref={scanlinesMaterialRef} {...scanlinesShader} transparent />
      </mesh>
    </>
  );
}

// Mushroom Forest Background - Giant mushroom silhouettes
function MushroomForestBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  return (
    <>
      {/* Giant mushroom silhouettes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const xPos = (Math.random() - 0.5) * 150;
        const scale = 0.5 + Math.random() * 0.8;

        return (
          <group key={i} position={[xPos, -30, -15 - Math.random() * 15]} scale={scale}>
            {/* Stem */}
            <mesh position={[0, 10, 0]}>
              <cylinderGeometry args={[2, 3, 20, 12]} />
              <meshBasicMaterial color="#5a3e2b" transparent opacity={0.6} />
            </mesh>

            {/* Cap */}
            <mesh position={[0, 22, 0]}>
              <sphereGeometry args={[12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#9775fa' : '#ff6b9d'} transparent opacity={0.5} />
            </mesh>

            {/* Glow under cap */}
            <pointLight position={[0, 18, 0]} color={i % 2 === 0 ? '#9775fa' : '#ff6b9d'} intensity={0.5} distance={20} />
          </group>
        );
      })}

      {/* Bioluminescent spores floating */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={new Float32Array(
              Array.from({ length: 900 }, (_, i) => {
                if (i % 3 === 0) return (Math.random() - 0.5) * 150;
                if (i % 3 === 1) return Math.random() * 80 - 20;
                return (Math.random() - 0.5) * 60;
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={1.5} color="#9775fa" transparent opacity={0.6} />
      </points>
    </>
  );
}

// Underwater Background - Ocean gradient with caustics
function UnderwaterBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const causticsMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (causticsMaterialRef.current) {
      causticsMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const causticsShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Caustic light patterns
        float c1 = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time * 0.7);
        float c2 = sin((uv.x + 0.5) * 8.0 - time * 0.8) * sin((uv.y + 0.3) * 8.0 + time);

        float caustics = (c1 + c2) * 0.5 + 0.5;
        caustics = smoothstep(0.4, 0.8, caustics);

        vec3 color = vec3(0.4, 0.7, 1.0) * caustics;

        float alpha = caustics * 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), []);

  return (
    <>
      {/* Caustic light patterns from surface */}
      <mesh position={[0, 30, -10]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[200, 150]} />
        <shaderMaterial ref={causticsMaterialRef} {...causticsShader} transparent />
      </mesh>

      {/* Fish silhouettes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            Math.random() * 60 - 10,
            (Math.random() - 0.5) * 50,
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
        >
          <boxGeometry args={[3, 1, 1]} />
          <meshBasicMaterial color="#1e3a5f" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Underwater ruins/temple columns in distance */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - 3) * 25, -30, -30]}
        >
          <cylinderGeometry args={[3, 3, 40, 8]} />
          <meshBasicMaterial color="#1a4d2e" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Depth gradient overlay */}
      <mesh position={[0, -40, 0]}>
        <planeGeometry args={[300, 100]} />
        <meshBasicMaterial color="#001a33" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

// Green Fields Background - Sky with clouds and sun
function GreenFieldsBackground() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 10;
    }
  });

  return (
    <>
      {/* Sun */}
      <mesh position={[60, 50, -40]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFEB3B" />
      </mesh>

      {/* Sun glow */}
      <mesh position={[60, 50, -40]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>

      {/* Clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={i} position={[(i - 4) * 40, 30 + Math.random() * 20, -30 - Math.random() * 20]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[8, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
            </mesh>
            <mesh position={[6, 0, 0]}>
              <sphereGeometry args={[6, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-6, 0, 0]}>
              <sphereGeometry args={[6, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Distant hills */}
      <mesh position={[0, -25, -20]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[80, 80, 20, 32, 1, false, 0, Math.PI]} />
        <meshBasicMaterial color="#4CAF50" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// Training Facility Background - Grid and geometric shapes
function TrainingFacilityBackground() {
  return (
    <>
      {/* Grid floor extending to horizon */}
      <mesh position={[0, -40, -20]} rotation={[-Math.PI / 3, 0, 0]}>
        <planeGeometry args={[300, 200, 20, 20]} />
        <meshBasicMaterial color="#333333" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Geometric training obstacles in background */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            -20 + Math.random() * 20,
            -30 - Math.random() * 20,
          ]}
        >
          {i % 3 === 0 ? (
            <boxGeometry args={[8, 8, 8]} />
          ) : i % 3 === 1 ? (
            <cylinderGeometry args={[4, 4, 12, 8]} />
          ) : (
            <coneGeometry args={[5, 10, 4]} />
          )}
          <meshBasicMaterial color="#666666" transparent opacity={0.3} wireframe />
        </mesh>
      ))}

      {/* Measurement markers */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-60 + i * 24, -30, -10]}>
          <cylinderGeometry args={[0.5, 0.5, 15, 8]} />
          <meshBasicMaterial color="#FFA500" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// Unicorn Castle Background - Magical pink sky with sparkles and rainbows
function UnicornCastleBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const sparklesRef = useRef<THREE.Points>(null);
  const heartsRef = useRef<(THREE.Mesh | null)[]>([]);
  const castlesRef = useRef<(THREE.Mesh | null)[]>([]);
  const rainbowRef = useRef<THREE.Mesh>(null);
  const sparkleData = useRef<{ sizes: Float32Array; speeds: Float32Array } | null>(null);

  // Create magical sparkles - drastically reduced count for performance
  const sparkles = useMemo(() => {
    const baseCount = 200; // Reduced from 1500!
    const count = Math.floor(baseCount * particleMultiplier);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Rainbow sparkle colors
      const rand = Math.random();
      const color = new THREE.Color();
      if (rand < 0.3) color.setHex(0xFF69B4); // Pink
      else if (rand < 0.5) color.setHex(0xFFD1DC); // Light pink
      else if (rand < 0.7) color.setHex(0xDDA0DD); // Plum
      else if (rand < 0.85) color.setHex(0xFFD700); // Gold
      else color.setHex(0xFFFFFF); // White

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
      speeds[i] = Math.random() * 0.5 + 0.5;
    }

    sparkleData.current = { sizes, speeds };
    return { positions, colors, sizes };
  }, [particleMultiplier]);

  // Animate sparkles with twinkling
  useFrame((state) => {
    if (sparklesRef.current && sparkleData.current) {
      sparklesRef.current.rotation.y = state.clock.elapsedTime * 0.02;

      // Magical twinkling
      const geometry = sparklesRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const originalSizes = sparkleData.current.sizes;
      const speeds = sparkleData.current.speeds;

      for (let i = 0; i < sizes.length; i++) {
        const twinkle = Math.sin(state.clock.elapsedTime * 4 * speeds[i] + i * 0.1) * 0.5 + 0.5;
        sizes[i] = originalSizes[i] * (0.3 + twinkle * 0.7);
      }
      geometry.attributes.size.needsUpdate = true;
    }

    // Animate floating hearts
    heartsRef.current.forEach((heart, i) => {
      if (!heart) return;
      const time = state.clock.elapsedTime;
      const heartTime = time + i * 0.5;

      heart.position.y = 20 + Math.sin(heartTime * 0.8) * 15;
      heart.position.x = Math.sin(heartTime * 0.5 + i) * 30;
      heart.rotation.y = time * 0.5 + i;

      const scale = 0.8 + Math.sin(heartTime * 2) * 0.2;
      heart.scale.setScalar(scale);
    });

    // Animate castles (gentle sway)
    castlesRef.current.forEach((castle, i) => {
      if (!castle) return;
      castle.position.y = Math.sin(state.clock.elapsedTime * 0.3 + i * 2) * 2;
    });

    // Rainbow shimmer
    if (rainbowRef.current) {
      const material = rainbowRef.current.material as THREE.MeshBasicMaterial;
      const shimmer = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.6;
      material.opacity = shimmer;
    }
  });

  return (
    <>
      {/* Magical sparkles */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparkles.positions.length / 3}
            array={sparkles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={sparkles.colors.length / 3}
            array={sparkles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sparkles.sizes.length}
            array={sparkles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Floating hearts */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 60;
        return (
          <mesh
            key={`heart-${i}`}
            ref={(el) => (heartsRef.current[i] = el)}
            position={[Math.cos(angle) * radius, 20, Math.sin(angle) * radius - 20]}
          >
            <sphereGeometry args={[3, 16, 16]} />
            <meshBasicMaterial color="#FF69B4" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Princess castle silhouettes */}
      {[-80, -40, 40, 80].map((x, i) => (
        <mesh
          key={`castle-${i}`}
          ref={(el) => (castlesRef.current[i] = el)}
          position={[x, -25, -50]}
        >
          <boxGeometry args={[15, 40, 10]} />
          <meshBasicMaterial color="#DDA0DD" transparent opacity={0.3} />
          {/* Castle towers */}
          <mesh position={[-6, 22, 0]}>
            <cylinderGeometry args={[2, 2, 8, 8]} />
            <meshBasicMaterial color="#DDA0DD" transparent opacity={0.3} />
            <mesh position={[0, 5, 0]}>
              <coneGeometry args={[3, 6, 8]} />
              <meshBasicMaterial color="#FF69B4" transparent opacity={0.3} />
            </mesh>
          </mesh>
          <mesh position={[6, 22, 0]}>
            <cylinderGeometry args={[2, 2, 8, 8]} />
            <meshBasicMaterial color="#DDA0DD" transparent opacity={0.3} />
            <mesh position={[0, 5, 0]}>
              <coneGeometry args={[3, 6, 8]} />
              <meshBasicMaterial color="#FF69B4" transparent opacity={0.3} />
            </mesh>
          </mesh>
        </mesh>
      ))}

      {/* Rainbow arc */}
      <mesh ref={rainbowRef} position={[0, 40, -60]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[60, 4, 16, 64, Math.PI]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rainbow layers */}
      {[
        { radius: 54, color: '#FF69B4' }, // Pink
        { radius: 58, color: '#DDA0DD' }, // Purple
        { radius: 62, color: '#87CEEB' }, // Blue
        { radius: 66, color: '#98FB98' }, // Green
      ].map((layer, i) => (
        <mesh
          key={`rainbow-${i}`}
          position={[0, 40, -60]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[layer.radius, 2, 16, 64, Math.PI]} />
          <meshBasicMaterial
            color={layer.color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Glowing clouds */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (i - 2.5) * 40;
        return (
          <mesh key={`cloud-${i}`} position={[x, 30 + Math.sin(i) * 10, -40]}>
            <sphereGeometry args={[8, 16, 16]} />
            <meshBasicMaterial color="#FFE6F0" transparent opacity={0.5} />
            <mesh position={[6, 0, 0]}>
              <sphereGeometry args={[6, 16, 16]} />
              <meshBasicMaterial color="#FFE6F0" transparent opacity={0.5} />
            </mesh>
            <mesh position={[-6, 0, 0]}>
              <sphereGeometry args={[6, 16, 16]} />
              <meshBasicMaterial color="#FFE6F0" transparent opacity={0.5} />
            </mesh>
          </mesh>
        );
      })}

      {/* Sparkle bursts */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 70;
        return (
          <mesh
            key={`burst-${i}`}
            position={[
              Math.cos(angle) * radius,
              15 + Math.sin(i * 2) * 10,
              Math.sin(angle) * radius - 30,
            ]}
          >
            <octahedronGeometry args={[2, 0]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#FFD700' : '#FF69B4'}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </>
  );
}

// Sky Islands Background - Fluffy clouds and floating islands
function SkyIslandsBackground() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 20;
    }
  });

  return (
    <>
      {/* Bright sun */}
      <mesh position={[70, 60, -50]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#FFE066" />
      </mesh>
      <mesh position={[70, 60, -50]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#FFD93D" transparent opacity={0.4} />
      </mesh>

      {/* Fluffy clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <group
            key={i}
            position={[
              (i - 6) * 35,
              25 + Math.sin(i * 2) * 15,
              -30 - (i % 3) * 15,
            ]}
          >
            <mesh>
              <sphereGeometry args={[10 + Math.random() * 5, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
            </mesh>
            <mesh position={[8, -2, 0]}>
              <sphereGeometry args={[7, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
            </mesh>
            <mesh position={[-8, -2, 0]}>
              <sphereGeometry args={[7, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, -5, 0]}>
              <sphereGeometry args={[8, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Distant floating islands */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group
          key={`island-${i}`}
          position={[(i - 2) * 50, -10 + Math.sin(i * 3) * 10, -60 - i * 5]}
        >
          {/* Island base */}
          <mesh>
            <coneGeometry args={[15 + Math.random() * 8, 20, 6]} />
            <meshBasicMaterial color="#8B4513" transparent opacity={0.5} />
          </mesh>
          {/* Grass top */}
          <mesh position={[0, 8, 0]}>
            <cylinderGeometry args={[12, 15, 5, 6]} />
            <meshBasicMaterial color="#228B22" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Birds */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`bird-${i}`}
          position={[
            (Math.random() - 0.5) * 120,
            30 + Math.random() * 20,
            -20 - Math.random() * 30,
          ]}
        >
          <planeGeometry args={[3, 1]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// Jungle Challenge Background - Dense foliage and ancient ruins
function JungleChallengeBackground({ particleMultiplier = 1.0 }: { particleMultiplier?: number }) {
  const leafParticlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (leafParticlesRef.current) {
      // Gentle leaf swaying
      leafParticlesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      // Falling leaves effect
      const positions = leafParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05; // Fall
        if (positions[i + 1] < -30) {
          positions[i + 1] = 40 + Math.random() * 20; // Reset to top
        }
      }
      leafParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Dense jungle canopy */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 200;
        const scale = 0.8 + Math.random() * 0.6;
        return (
          <group key={`tree-${i}`} position={[x, -20, -40 - Math.random() * 20]} scale={scale}>
            {/* Tree trunk */}
            <mesh position={[0, 15, 0]}>
              <cylinderGeometry args={[2, 3, 30, 8]} />
              <meshBasicMaterial color="#4a3728" transparent opacity={0.6} />
            </mesh>
            {/* Foliage layers */}
            <mesh position={[0, 35, 0]}>
              <sphereGeometry args={[15, 8, 8]} />
              <meshBasicMaterial color="#1a5c1a" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 42, 0]}>
              <sphereGeometry args={[12, 8, 8]} />
              <meshBasicMaterial color="#228B22" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Ancient temple ruins in background */}
      <group position={[0, -25, -70]}>
        {/* Temple base */}
        <mesh>
          <boxGeometry args={[40, 20, 30]} />
          <meshBasicMaterial color="#8B8878" transparent opacity={0.4} />
        </mesh>
        {/* Temple steps */}
        <mesh position={[0, 12, 18]}>
          <boxGeometry args={[35, 5, 8]} />
          <meshBasicMaterial color="#8B8878" transparent opacity={0.4} />
        </mesh>
        {/* Temple entrance */}
        <mesh position={[0, 5, 16]}>
          <boxGeometry args={[8, 10, 2]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.6} />
        </mesh>
        {/* Temple pillars */}
        {[-12, -6, 6, 12].map((x, i) => (
          <mesh key={`pillar-${i}`} position={[x, 15, 12]}>
            <cylinderGeometry args={[2, 2, 20, 8]} />
            <meshBasicMaterial color="#A09080" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>

      {/* Falling leaves particles */}
      <points ref={leafParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={Math.floor(100 * particleMultiplier)}
            array={new Float32Array(
              Array.from({ length: Math.floor(300 * particleMultiplier) }, (_, i) => {
                if (i % 3 === 0) return (Math.random() - 0.5) * 150;
                if (i % 3 === 1) return Math.random() * 60;
                return (Math.random() - 0.5) * 60;
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={3} color="#228B22" transparent opacity={0.6} />
      </points>

      {/* Vines hanging from top */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`vine-${i}`}
          position={[(Math.random() - 0.5) * 150, 30, -30 - Math.random() * 15]}
        >
          <cylinderGeometry args={[0.3, 0.3, 40 + Math.random() * 20, 4]} />
          <meshBasicMaterial color="#2d5a27" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Mist/fog at bottom */}
      <mesh position={[0, -35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 150]} />
        <meshBasicMaterial color="#a8c090" transparent opacity={0.4} />
      </mesh>
    </>
  );
}
