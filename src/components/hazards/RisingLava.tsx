import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import { Mesh, ShaderMaterial } from 'three';
import { FireEmbers } from '../effects/ParticleSystem';

interface RisingLavaProps {
  position: [number, number, number];
  size: [number, number, number];
  startY: number;
  endY: number;
  riseSpeed?: number;
  resetAtCheckpoint?: boolean;
  warningDistance?: number;
}

// Lava shader (simplified version)
const lavaVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    vUv = uv;
    float wave1 = sin(position.x * 2.0 + uTime * 2.0) * 0.1;
    float wave2 = sin(position.z * 3.0 + uTime * 1.5) * 0.08;
    vElevation = wave1 + wave2;

    vec3 pos = position;
    pos.y += vElevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const lavaFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec2 flowUv = vUv;
    flowUv.x += uTime * 0.15;
    flowUv.y += sin(uTime * 0.5) * 0.05;

    float pattern1 = sin(flowUv.x * 8.0 + uTime) * 0.5 + 0.5;
    float pattern2 = sin(flowUv.y * 6.0 - uTime * 0.8) * 0.5 + 0.5;
    float pattern = (pattern1 + pattern2) * 0.5;

    float hotSpot = smoothstep(0.0, 0.15, vElevation + 0.08);

    vec3 darkLava = vec3(0.6, 0.1, 0.0);
    vec3 mediumLava = vec3(1.0, 0.3, 0.0);
    vec3 brightLava = vec3(1.0, 0.8, 0.2);

    vec3 color = mix(darkLava, mediumLava, pattern);
    color = mix(color, brightLava, hotSpot * pattern);
    color *= (0.8 + uIntensity * 0.4);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function RisingLava({
  position,
  size,
  startY,
  endY,
  riseSpeed = 2,
  resetAtCheckpoint = true,
  warningDistance = 5,
}: RisingLavaProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const shaderRef = useRef<ShaderMaterial>(null);
  const currentY = useRef(startY);
  const lastCheckpointId = useRef<string | null>(null);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const checkpointId = useGameStore((state) => state.lastCheckpointId);
  const die = useGameStore((state) => state.die);
  const quality = useGameStore((state) => state.quality);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
      },
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader,
    };
  }, []);

  // Check if player crossed checkpoint to reset lava
  useFrame((state, delta) => {
    // Reset on checkpoint change
    if (resetAtCheckpoint && checkpointId !== lastCheckpointId.current) {
      lastCheckpointId.current = checkpointId;
      currentY.current = startY;
    }

    // Reset on player death
    if (isDead) {
      currentY.current = startY;
      return;
    }

    // Rise lava
    if (currentY.current < endY) {
      currentY.current += riseSpeed * delta;
      currentY.current = Math.min(currentY.current, endY);
    }

    // Update rigid body position
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setNextKinematicTranslation({
        x: position[0],
        y: position[1] + currentY.current,
        z: position[2],
      });
    }

    // Update shader
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Increase intensity when close to player
      if (playerPosition) {
        const distanceToPlayer = playerPosition[1] - (position[1] + currentY.current + size[1] / 2);
        const intensity = distanceToPlayer < warningDistance
          ? 1 + (1 - distanceToPlayer / warningDistance) * 0.5
          : 1;
        shaderRef.current.uniforms.uIntensity.value = intensity;
      }
    }

    // Collision check
    if (playerPosition) {
      const lavaTopY = position[1] + currentY.current + size[1] / 2;
      const playerInXZ =
        Math.abs(playerPosition[0] - position[0]) < size[0] / 2 + 0.5 &&
        Math.abs(playerPosition[2] - position[2]) < size[2] / 2 + 0.5;

      if (playerInXZ && playerPosition[1] < lavaTopY + 0.5) {
        die();
      }
    }
  });

  const useFancyShader = quality !== 'low';

  // Calculate warning level based on distance to player
  const warningLevel = useMemo(() => {
    if (!playerPosition) return 0;
    const distanceToPlayer = playerPosition[1] - (position[1] + currentY.current + size[1] / 2);
    if (distanceToPlayer < warningDistance) {
      return 1 - distanceToPlayer / warningDistance;
    }
    return 0;
  }, [playerPosition, position, currentY.current, size, warningDistance]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={[position[0], position[1] + startY, position[2]]}
      sensor
      userData={{ hazard: 'rising_lava' }}
    >
      {/* Main lava surface */}
      <mesh
        ref={meshRef}
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
            emissiveIntensity={0.8 + warningLevel * 0.4}
          />
        )}
      </mesh>

      {/* Lava depth/sides visual */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial
          color="#8B0000"
          roughness={0.6}
          metalness={0.2}
          emissive="#FF4500"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Bubbling effect */}
      <LavaBubbles size={size} />

      {/* Warning glow that intensifies as lava rises */}
      <pointLight
        position={[0, size[1] + 1, 0]}
        color="#FF4500"
        intensity={3 + warningLevel * 5}
        distance={15 + warningLevel * 10}
      />

      {/* Rising heat distortion indicator */}
      {warningLevel > 0.3 && (
        <mesh position={[0, size[1] + 2, 0]}>
          <sphereGeometry args={[warningLevel * 3, 16, 16]} />
          <meshBasicMaterial
            color="#FF6600"
            transparent
            opacity={warningLevel * 0.2}
          />
        </mesh>
      )}

      {/* Fire embers */}
      {quality !== 'low' && (
        <FireEmbers position={[0, size[1], 0]} count={20} />
      )}
    </RigidBody>
  );
}

function LavaBubbles({ size }: { size: [number, number, number] }) {
  const bubblesRef = useRef<Array<{
    x: number;
    z: number;
    phase: number;
    speed: number;
    scale: number;
  }>>([]);

  // Initialize bubbles
  useMemo(() => {
    bubblesRef.current = Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * size[0] * 0.8,
      z: (Math.random() - 0.5) * size[2] * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 2,
      scale: 0.15 + Math.random() * 0.15,
    }));
  }, [size]);

  return (
    <group position={[0, size[1] / 2 + 0.1, 0]}>
      {bubblesRef.current.map((bubble, i) => (
        <BubbleAnimation key={i} bubble={bubble} />
      ))}
    </group>
  );
}

function BubbleAnimation({ bubble }: {
  bubble: { x: number; z: number; phase: number; speed: number; scale: number }
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * bubble.speed + bubble.phase;
      const yOffset = Math.abs(Math.sin(time)) * 0.3;
      const scale = bubble.scale * (0.8 + Math.sin(time * 2) * 0.3);

      meshRef.current.position.y = yOffset;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[bubble.x, 0, bubble.z]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FF8C00"
        emissiveIntensity={1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
