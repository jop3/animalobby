import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { BossProjectile } from './BossProjectile';

interface BossEncounterProps {
  id: string;
  position: [number, number, number];
  bossType: 'dragon' | 'golem' | 'wizard' | 'kraken';
  arenaSize?: [number, number, number];
  onDefeat?: () => void;
}

interface Projectile {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  type: 'fireball' | 'rock' | 'magic_missile' | 'tentacle';
}

const BOSS_CONFIGS = {
  dragon: {
    name: 'Fire Drake',
    emoji: '🐉',
    color: '#FF4500',
    maxHealth: 100,
    size: [3, 3, 5] as [number, number, number],
    attackInterval: 2,
    projectileType: 'fireball' as const,
  },
  golem: {
    name: 'Stone Golem',
    emoji: '🗿',
    color: '#808080',
    maxHealth: 150,
    size: [4, 5, 4] as [number, number, number],
    attackInterval: 3,
    projectileType: 'rock' as const,
  },
  wizard: {
    name: 'Dark Wizard',
    emoji: '🧙',
    color: '#800080',
    maxHealth: 80,
    size: [2, 3, 2] as [number, number, number],
    attackInterval: 1.5,
    projectileType: 'magic_missile' as const,
  },
  kraken: {
    name: 'The Kraken',
    emoji: '🐙',
    color: '#006994',
    maxHealth: 120,
    size: [5, 3, 5] as [number, number, number],
    attackInterval: 2.5,
    projectileType: 'tentacle' as const,
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
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [weakSpots, setWeakSpots] = useState<Vector3[]>([]);
  const [damageZones, setDamageZones] = useState<Array<{ position: Vector3; radius: number; duration: number }>>([]);
  const lastAttackTime = useRef(0);
  const projectileCounter = useRef(0);
  const deathsDuringFight = useRef(0);
  const fightStarted = useRef(false);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);
  const isInvincible = useGameStore((state) => state.isInvincible);
  const isDead = useGameStore((state) => state.isDead);
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const defeatBoss = useGameStore((state) => state.defeatBoss);
  const defeatedBosses = useGameStore((state) => state.defeatedBosses);

  const config = BOSS_CONFIGS[bossType];
  const healthPercent = (health / config.maxHealth) * 100;

  // Track deaths during boss fight
  useEffect(() => {
    if (isDead && fightStarted.current && !defeated) {
      deathsDuringFight.current += 1;
    }
  }, [isDead, defeated]);

  // Check if boss was already defeated in a previous session
  useEffect(() => {
    if (defeatedBosses[bossType]) {
      setDefeated(true);
    }
  }, [bossType, defeatedBosses]);

  // Determine phase based on health
  useEffect(() => {
    if (healthPercent > 66) setPhase(1);
    else if (healthPercent > 33) setPhase(2);
    else setPhase(3);

    if (health <= 0 && !defeated) {
      setDefeated(true);
      // Record boss defeat in achievement system
      defeatBoss(bossType, currentLevelId || 'unknown', deathsDuringFight.current);
      onDefeat?.();
    }
  }, [health, healthPercent, defeated, onDefeat, defeatBoss, bossType, currentLevelId]);

  // Initialize weak spots
  useEffect(() => {
    const spots: Vector3[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      spots.push(
        new Vector3(
          Math.cos(angle) * 1.5,
          1 + Math.random(),
          Math.sin(angle) * 1.5
        )
      );
    }
    setWeakSpots(spots);
  }, []);

  useFrame((state, delta) => {
    if (!bossRef.current || !playerPosition || defeated) return;

    const time = state.clock.elapsedTime;
    const bossPos = bossRef.current.translation();

    // Calculate direction to player
    const toPlayer = new Vector3(
      playerPosition[0] - bossPos.x,
      0,
      playerPosition[2] - bossPos.z
    );
    const distanceToPlayer = toPlayer.length();
    toPlayer.normalize();

    // Mark fight as started when player enters arena
    if (!fightStarted.current && distanceToPlayer < arenaSize[0] / 2) {
      fightStarted.current = true;
    }

    // Rotate boss to face player
    if (meshRef.current && distanceToPlayer > 0.1) {
      meshRef.current.lookAt(playerPosition[0], bossPos.y, playerPosition[2]);
    }

    // Movement (more aggressive in later phases)
    if (phase >= 2 && distanceToPlayer > 5) {
      const moveSpeed = 2 * phase;
      bossRef.current.setLinvel(
        {
          x: toPlayer.x * moveSpeed,
          y: 0,
          z: toPlayer.z * moveSpeed,
        },
        true
      );
    } else {
      bossRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Attack pattern based on phase and time
    const attackInterval = config.attackInterval / phase;
    if (time - lastAttackTime.current > attackInterval) {
      performAttack(bossPos, toPlayer);
      lastAttackTime.current = time;
    }

    // Update damage zones
    setDamageZones((zones) =>
      zones
        .map((zone) => ({ ...zone, duration: zone.duration - delta }))
        .filter((zone) => zone.duration > 0)
    );

    // Check if player is in damage zone
    if (!isInvincible) {
      damageZones.forEach((zone) => {
        const distToZone = Math.sqrt(
          Math.pow(playerPosition[0] - zone.position.x, 2) +
          Math.pow(playerPosition[2] - zone.position.z, 2)
        );
        if (distToZone < zone.radius && Math.abs(playerPosition[1] - zone.position.y) < 2) {
          die();
        }
      });
    }
  });

  const performAttack = (bossPos: any, direction: Vector3) => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 500);

    const attackChoice = Math.random();
    const spawnHeight = bossPos.y + config.size[1] / 2;

    if (attackChoice < 0.5 || phase === 1) {
      // Projectile attack - more projectiles in later phases
      const projectileCount = phase;
      const spreadAngle = phase > 1 ? Math.PI / 6 : 0;

      for (let i = 0; i < projectileCount; i++) {
        const angle = spreadAngle * ((i - (projectileCount - 1) / 2) / Math.max(1, projectileCount - 1));
        const rotatedDir = new Vector3(
          direction.x * Math.cos(angle) - direction.z * Math.sin(angle),
          0,
          direction.x * Math.sin(angle) + direction.z * Math.cos(angle)
        ).normalize();

        const newProjectile: Projectile = {
          id: `${id}_projectile_${projectileCounter.current++}`,
          position: [bossPos.x + rotatedDir.x * 2, spawnHeight, bossPos.z + rotatedDir.z * 2],
          direction: [rotatedDir.x, 0, rotatedDir.z],
          type: config.projectileType,
        };

        setProjectiles((prev) => [...prev, newProjectile]);
      }
    } else if (attackChoice < 0.8) {
      // Ground slam / Area attack
      const slamPosition = new Vector3(
        bossPos.x + direction.x * 3,
        bossPos.y,
        bossPos.z + direction.z * 3
      );

      setDamageZones((prev) => [
        ...prev,
        {
          position: slamPosition,
          radius: 4 * phase,
          duration: 1.5,
        },
      ]);
    } else {
      // Circular projectile barrage (phase 3 only)
      if (phase >= 3) {
        const projectileCount = 8;
        for (let i = 0; i < projectileCount; i++) {
          const angle = (i / projectileCount) * Math.PI * 2;
          const dir = new Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

          const newProjectile: Projectile = {
            id: `${id}_projectile_${projectileCounter.current++}`,
            position: [bossPos.x + dir.x * 2, spawnHeight, bossPos.z + dir.z * 2],
            direction: [dir.x, 0, dir.z],
            type: config.projectileType,
          };

          setProjectiles((prev) => [...prev, newProjectile]);
        }
      }
    }
  };

  const takeDamage = (amount: number) => {
    if (!defeated) {
      setHealth((prev) => Math.max(0, prev - amount));
    }
  };

  const removeProjectile = (projectileId: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
  };

  if (defeated) {
    return (
      <group position={position}>
        {/* Victory effect */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[3, 16, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
        <pointLight color="#FFD700" intensity={10} distance={15} />
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Arena boundary */}
      <mesh position={[0, arenaSize[1] / 2, 0]} receiveShadow>
        <boxGeometry args={[arenaSize[0], 0.5, arenaSize[2]]} />
        <meshStandardMaterial
          color="#2F4F2F"
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
          <CuboidCollider args={(wall[3] as number[]).map((v) => v / 2) as [number, number, number]} />
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
            position={[spot.x, spot.y, spot.z]}
            onClick={() => takeDamage(15)}
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

      {/* Damage zones visualization */}
      {damageZones.map((zone, i) => (
        <mesh
          key={i}
          position={[zone.position.x, zone.position.y + 0.1, zone.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[zone.radius * 0.8, zone.radius, 32]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.5}
            transparent
            opacity={zone.duration / 1.5}
          />
        </mesh>
      ))}

      {/* Projectiles */}
      {projectiles.map((projectile) => (
        <BossProjectile
          key={projectile.id}
          id={projectile.id}
          position={projectile.position}
          direction={projectile.direction}
          type={projectile.type}
          speed={15 + phase * 2}
          onHit={() => removeProjectile(projectile.id)}
          onExpire={() => removeProjectile(projectile.id)}
        />
      ))}

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
