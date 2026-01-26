import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh, ShaderMaterial } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LavaProps {
  position: [number, number, number];
  size?: [number, number, number];
}

// Custom lava shader for animated flowing effect
const lavaVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    vUv = uv;

    // Create wave displacement
    float wave1 = sin(position.x * 2.0 + uTime * 2.0) * 0.05;
    float wave2 = sin(position.z * 3.0 + uTime * 1.5) * 0.03;
    float wave3 = sin((position.x + position.z) * 1.5 + uTime * 2.5) * 0.04;

    vElevation = wave1 + wave2 + wave3;

    vec3 pos = position;
    pos.y += vElevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const lavaFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Flowing lava pattern
    vec2 flowUv = vUv;
    flowUv.x += uTime * 0.1;
    flowUv.y += sin(uTime * 0.5) * 0.05;

    // Create layered color pattern
    float pattern1 = sin(flowUv.x * 10.0 + uTime) * 0.5 + 0.5;
    float pattern2 = sin(flowUv.y * 8.0 - uTime * 0.8) * 0.5 + 0.5;
    float pattern = (pattern1 + pattern2) * 0.5;

    // Add noise for texture
    float n = noise(flowUv * 5.0 + uTime * 0.3);
    pattern = mix(pattern, n, 0.3);

    // Hot spots based on elevation
    float hotSpot = smoothstep(0.0, 0.1, vElevation + 0.05);

    // Color gradient from dark red to bright yellow
    vec3 darkLava = vec3(0.6, 0.1, 0.0);
    vec3 mediumLava = vec3(1.0, 0.3, 0.0);
    vec3 brightLava = vec3(1.0, 0.8, 0.2);

    vec3 color = mix(darkLava, mediumLava, pattern);
    color = mix(color, brightLava, hotSpot * pattern);

    // Emissive glow
    float glow = pattern * 0.5 + hotSpot * 0.5;
    color += glow * vec3(0.3, 0.1, 0.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Lava({ position, size = [4, 0.2, 4] }: LavaProps) {
  const meshRef = useRef<Mesh>(null);
  const shaderRef = useRef<ShaderMaterial>(null);
  const die = useGameStore((state) => state.die);
  const quality = useGameStore((state) => state.quality);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader,
    };
  }, []);

  // Animated lava surface
  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const handleCollision = () => {
    die();
  };

  // Use simpler material on low quality
  const useFancyShader = quality !== 'low';

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollision}
      userData={{ hazard: 'lava' }}
    >
      {/* Main lava surface - rotated to be horizontal */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, size[1] / 2, 0]}
      >
        <planeGeometry args={[size[0], size[2], 32, 32]} />
        {useFancyShader ? (
          <shaderMaterial
            ref={shaderRef}
            {...shaderMaterial}
            transparent={false}
          />
        ) : (
          <meshStandardMaterial
            color="#FF4500"
            roughness={0.4}
            metalness={0.3}
            emissive="#FF6600"
            emissiveIntensity={0.8}
          />
        )}
      </mesh>

      {/* Glowing bubbles */}
      <LavaBubble offset={[size[0] * 0.2, size[1], size[2] * 0.15]} delay={0} />
      <LavaBubble offset={[-size[0] * 0.2, size[1], -size[2] * 0.2]} delay={1} />
      <LavaBubble offset={[size[0] * 0.1, size[1], -size[2] * 0.15]} delay={2} />
      <LavaBubble offset={[-size[0] * 0.15, size[1], size[2] * 0.25]} delay={1.5} />

      {/* Point light for lava glow */}
      <pointLight
        position={[0, size[1] + 0.5, 0]}
        intensity={3}
        distance={12}
        color="#FF6600"
      />
    </RigidBody>
  );
}

function LavaBubble({ offset, delay }: { offset: [number, number, number]; delay: number }) {
  const bubbleRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (bubbleRef.current) {
      const time = state.clock.elapsedTime + delay;
      const scale = 0.8 + Math.sin(time * 3) * 0.4;
      bubbleRef.current.scale.set(scale, scale, scale);
      bubbleRef.current.position.y = offset[1] + Math.abs(Math.sin(time * 2)) * 0.1;
    }
  });

  return (
    <mesh ref={bubbleRef} position={offset}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FF8C00"
        emissiveIntensity={0.9}
        transparent
        opacity={0.8}
        flatShading
      />
    </mesh>
  );
}
