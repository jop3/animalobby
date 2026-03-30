import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface BouncePadProps {
  position: [number, number, number];
  launchDirection?: [number, number, number];
  launchPower?: number;
  size?: [number, number, number];
  color?: string;
  cooldown?: number;
}

export function BouncePad({
  position,
  launchDirection = [0, 1, 0],
  launchPower = 15,
  size = [2, 0.3, 2],
  color = '#FFD700',
  cooldown = 0.3,
}: BouncePadProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [compressionScale, setCompressionScale] = useState(1);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const cooldownRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);

  // Normalize launch direction
  const normalizedDir = (() => {
    const len = Math.sqrt(
      launchDirection[0] ** 2 +
      launchDirection[1] ** 2 +
      launchDirection[2] ** 2
    );
    return len > 0
      ? [
          launchDirection[0] / len,
          launchDirection[1] / len,
          launchDirection[2] / len,
        ]
      : [0, 1, 0];
  })();

  // Calculate arrow rotation to point in launch direction
  const arrowRotation = (() => {
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3(...normalizedDir);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  })();

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Handle cooldown
    if (cooldownRef.current > 0) {
      cooldownRef.current -= delta;
    }

    // Animate compression/bounce back
    if (isActivated) {
      setCompressionScale((prev) => {
        const target = 0.3;
        const newScale = THREE.MathUtils.lerp(prev, target, delta * 20);
        if (Math.abs(newScale - target) < 0.05) {
          setIsActivated(false);
        }
        return newScale;
      });
    } else {
      setCompressionScale((prev) => {
        const target = 1;
        return THREE.MathUtils.lerp(prev, target, delta * 10);
      });
    }

    // Pulsing glow effect
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(timeRef.current * 4) * 0.1;
    }
  });

  const handleCollision = () => {
    if (cooldownRef.current <= 0) {
      setIsActivated(true);
      cooldownRef.current = cooldown;
      // The actual launch impulse would be applied via the RigidBody's restitution
      // or through a custom collision handler in the player component
    }
  };

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders="cuboid"
      restitution={2.0 + launchPower * 0.1}
      friction={0.1}
      onCollisionEnter={handleCollision}
      userData={{
        bouncePad: true,
        launchDirection: normalizedDir,
        launchPower,
      }}
    >
      {/* Base pad */}
      <mesh
        ref={meshRef}
        scale={[1, compressionScale, 1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Direction indicator arrow */}
      <group
        position={[
          normalizedDir[0] * 0.5,
          size[1] / 2 + 0.3 + normalizedDir[1] * 0.3,
          normalizedDir[2] * 0.5,
        ]}
        rotation={arrowRotation}
      >
        <mesh>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Arrow shaft */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* Chevron patterns on pad surface */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            0,
            size[1] / 2 + 0.01,
            (i - 1) * size[2] * 0.25,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[size[0] * 0.6, 0.15]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.5 + i * 0.15}
          />
        </mesh>
      ))}

      {/* Glow ring around pad */}
      <mesh
        position={[0, size[1] / 2 + 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[Math.max(size[0], size[2]) * 0.5, Math.max(size[0], size[2]) * 0.55, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 + Math.sin(timeRef.current * 4) * 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for ambient glow */}
      <pointLight
        position={[0, size[1] + 0.5, 0]}
        color={color}
        intensity={isActivated ? 3 : 1}
        distance={5}
      />

      {/* Activation burst particles */}
      {isActivated && (
        <group position={[0, size[1] / 2, 0]}>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.5,
                  0.5,
                  Math.sin(angle) * 0.5,
                ]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </RigidBody>
  );
}
