import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface BossEncounterProps {
  id: string;
  position: [number, number, number];
  bossType: 'dragon' | 'golem' | 'wizard' | 'kraken';
  arenaSize?: [number, number, number];
  onDefeat?: () => void;
}

const BOSS_CONFIGS = {
  dragon: {
    name: 'Fire Drake',
    emoji: '🐉',
    color: '#FF4500',
    maxHealth: 100,
    size: [3, 3, 5],
    attackInterval: 2,
    attackTypes: ['fireball', 'sweep', 'ground_slam'],
  },
  golem: {
    name: 'Stone Golem',
    emoji: '🗿',
    color: '#808080',
    maxHealth: 150,
    size: [4, 5, 4],
    attackInterval: 3,
    attackTypes: ['smash', 'rock_throw', 'charge'],
  },
  wizard: {
    name: 'Dark Wizard',
    emoji: '🧙',
    color: '#800080',
    maxHealth: 80,
    size: [2, 3, 2],
    attackInterval: 1.5,
    attackTypes: ['magic_missile', 'teleport', 'lightning'],
  },
  kraken: {
    name: 'The Kraken',
    emoji: '🐙',
    color: '#006994',
    maxHealth: 120,
    size: [5, 3, 5],
    attackInterval: 2.5,
    attackTypes: ['tentacle_slam', 'ink_spray', 'whirlpool'],
  },
};

export function BossEncounter({
  id,
  position,
  bossType,
  arenaSize = [30, 20, 30],
  onDefeat,
}: BossEncounterProps) {
  const bossRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const [health, setHealth] = useState(BOSS_CONFIGS[bossType].maxHealth);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [isAttacking, setIsAttacking] = useState(false);
  const [defeated, setDefeated] = useState(false);
  const [weakSpots, setWeakSpots] = useState<Vector3[]>([]);
  const lastAttackTime = useRef(0);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const setInvincible = useGameStore((state) => state.setInvincible);

  const config = BOSS_CONFIGS[bossType];
  const healthPercent = (health / config.maxHealth) * 100;

  // Determine phase based on health
  useEffect(() => {
    if (healthPercent > 66) setPhase(1);
    else if (healthPercent > 33) setPhase(2);
    else setPhase(3);

    if (health <= 0 && !defeated) {
      setDefeated(true);
      onDefeat?.();
    }
  }, [health, healthPercent, defeated, onDefeat]);

  // Initialize weak spots
  useEffect(() => {
    const spots: Vector3[] = [];
    for (let i = 0; i < 3; i++) {
      spots.push(
        new Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 + 1,
          Math.random() * 2 - 1
        )
      );
    }
    setWeakSpots(spots);
  }, []);

  useFrame((state, delta) => {
    if (!bossRef.current || !playerPosition || defeated) return;

    const time = state.clock.elapsedTime;

    // Boss AI - Track player
    const bossPos = bossRef.current.translation();
    const playerDir = new Vector3(
      playerPosition[0] - bossPos.x,
      0,
      playerPosition[2] - bossPos.z
    ).normalize();

    // Rotate boss to face player
    if (meshRef.current) {
      meshRef.current.lookAt(playerPosition[0], bossPos.y, playerPosition[2]);
    }

    // Attack pattern based on phase and time
    if (time - lastAttackTime.current > config.attackInterval / phase) {
      performAttack();
      lastAttackTime.current = time;
    }

    // Movement pattern (more aggressive in later phases)
    if (phase >= 2) {
      const speed = 0.5 * phase;
      bossRef.current.setLinvel(
        {
          x: playerDir.x * speed,
          y: bossRef.current.linvel().y,
          z: playerDir.z * speed,
        },
        true
      );
    }
  });

  const performAttack = () => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 500);
    // Attack logic would trigger projectiles or area effects
  };

  const takeDamage = (amount: number) => {
    setHealth((prev) => Math.max(0, prev - amount));
  };

  if (defeated) {
    return (
      <group position={position}>
        {/* Victory effect */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </mesh>
        <pointLight color="#FFD700" intensity={5} distance={10} />
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Arena boundary */}
      <mesh position={[0, arenaSize[1] / 2, 0]} receiveShadow>
        <boxGeometry args={[arenaSize[0], 0.5, arenaSize[2]]} />
        <meshStandardMaterial
          color="#2F4F4F"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Arena walls (invisible barriers) */}
      {[
        [arenaSize[0] / 2, arenaSize[1] / 2, 0, [0.5, arenaSize[1], arenaSize[2]]],
        [-arenaSize[0] / 2, arenaSize[1] / 2, 0, [0.5, arenaSize[1], arenaSize[2]]],
        [0, arenaSize[1] / 2, arenaSize[2] / 2, [arenaSize[0], arenaSize[1], 0.5]],
        [0, arenaSize[1] / 2, -arenaSize[2] / 2, [arenaSize[0], arenaSize[1], 0.5]],
      ].map((wall, i) => (
        <RigidBody
          key={i}
          type="fixed"
          position={[wall[0], wall[1], wall[2]] as [number, number, number]}
        >
          <CuboidCollider args={(wall[3] as [number, number, number]).map(v => v / 2) as [number, number, number]} />
        </RigidBody>
      ))}

      {/* Boss Entity */}
      <RigidBody
        ref={bossRef}
        type="kinematicPosition"
        position={[0, config.size[1] / 2 + 1, 0]}
      >
        <mesh
          ref={meshRef}
          castShadow
          scale={isAttacking ? [1.1, 1.1, 1.1] : [1, 1, 1]}
        >
          <boxGeometry args={[config.size[0], config.size[1], config.size[2]]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.color}
            emissiveIntensity={isAttacking ? 1 : 0.3}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Boss emoji display */}
        <mesh position={[0, config.size[1] / 2 + 1, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Weak spots (glowing orbs) */}
        {weakSpots.map((spot, i) => (
          <mesh
            key={i}
            position={[spot.x * config.size[0] / 2, spot.y, spot.z * config.size[2] / 2]}
            onClick={() => takeDamage(10)}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={2}
            />
          </mesh>
        ))}

        {/* Point light */}
        <pointLight
          color={config.color}
          intensity={3}
          distance={15}
        />
      </RigidBody>

      {/* Health bar UI (floating above boss) */}
      <group position={[0, config.size[1] + 3, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[6, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
        {/* Health fill */}
        <mesh position={[-(6 * (1 - healthPercent / 100)) / 2, 0, 0.01]}>
          <planeGeometry args={[6 * (healthPercent / 100), 0.4]} />
          <meshBasicMaterial
            color={healthPercent > 50 ? '#00FF00' : healthPercent > 25 ? '#FFFF00' : '#FF0000'}
          />
        </mesh>
        {/* Boss name */}
        <mesh position={[0, 0.6, 0]}>
          <planeGeometry args={[6, 0.4]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Phase indicator rings */}
      {phase >= 2 && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8, 9, 32]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      {phase >= 3 && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[10, 11, 32]} />
          <meshStandardMaterial
            color="#FF00FF"
            emissive="#FF00FF"
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}
