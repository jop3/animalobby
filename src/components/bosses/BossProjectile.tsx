import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface BossProjectileProps {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed?: number;
  damage?: number;
  type: 'fireball' | 'rock' | 'magic_missile' | 'tentacle';
  onHit?: () => void;
  onExpire?: () => void;
}

const PROJECTILE_CONFIG = {
  fireball: {
    color: '#FF4500',
    size: 0.6,
    trail: true,
    particles: true,
  },
  rock: {
    color: '#808080',
    size: 0.8,
    trail: false,
    particles: false,
  },
  magic_missile: {
    color: '#800080',
    size: 0.4,
    trail: true,
    particles: true,
  },
  tentacle: {
    color: '#006994',
    size: 1.0,
    trail: false,
    particles: false,
  },
};

export function BossProjectile({
  id,
  position,
  direction,
  speed = 15,
  damage = 10,
  type,
  onHit,
  onExpire,
}: BossProjectileProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const [expired, setExpired] = useState(false);
  const lifetime = useRef(0);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);
  const isInvincible = useGameStore((state) => state.isInvincible);

  const config = PROJECTILE_CONFIG[type];

  useEffect(() => {
    if (bodyRef.current) {
      // Set initial velocity
      bodyRef.current.setLinvel(
        {
          x: direction[0] * speed,
          y: direction[1] * speed,
          z: direction[2] * speed,
        },
        true
      );
    }
  }, [direction, speed]);

  useFrame((state, delta) => {
    if (expired) return;

    lifetime.current += delta;

    // Expire after 5 seconds
    if (lifetime.current > 5) {
      setExpired(true);
      onExpire?.();
      return;
    }

    // Rotate projectile
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 5;
      meshRef.current.rotation.y += delta * 3;
    }

    // Check collision with player
    if (bodyRef.current && playerPosition && !isInvincible) {
      const pos = bodyRef.current.translation();
      const dist = Math.sqrt(
        Math.pow(playerPosition[0] - pos.x, 2) +
        Math.pow(playerPosition[1] - pos.y, 2) +
        Math.pow(playerPosition[2] - pos.z, 2)
      );

      if (dist < 1.5) {
        // Hit player
        die();
        setExpired(true);
        onHit?.();
      }
    }

    // Check if projectile fell off the world
    if (bodyRef.current) {
      const pos = bodyRef.current.translation();
      if (pos.y < -20) {
        setExpired(true);
        onExpire?.();
      }
    }
  });

  if (expired) return null;

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      position={position}
      colliders={false}
      gravityScale={type === 'rock' ? 0.5 : 0}
    >
      <CuboidCollider args={[config.size / 2, config.size / 2, config.size / 2]} sensor />

      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[config.size, 16, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight
        color={config.color}
        intensity={3}
        distance={5}
      />

      {/* Trail particles for certain projectile types */}
      {config.trail && (
        <mesh position={[0, 0, -0.5]}>
          <sphereGeometry args={[config.size * 0.5, 8, 8]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.color}
            emissiveIntensity={1}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </RigidBody>
  );
}
