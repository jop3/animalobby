import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface CrumblingPlatformProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  crumbleDelay?: number;
  respawnTime?: number;
}

type PlatformState = 'solid' | 'crumbling' | 'fallen' | 'respawning';

interface PlatformPiece {
  id: number;
  offset: [number, number, number];
  size: [number, number, number];
  fallen: boolean;
  fallDelay: number;
  velocity: [number, number, number];
  rotation: [number, number, number];
}

export function CrumblingPlatform({
  position,
  size = [4, 0.5, 4],
  color = '#D2691E',
  crumbleDelay = 0.8,
  respawnTime = 5,
}: CrumblingPlatformProps) {
  const [state, setState] = useState<PlatformState>('solid');
  const [playerOnPlatform, setPlayerOnPlatform] = useState(false);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const timeRef = useRef(0);
  const crumbleTimeRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);

  // Generate platform pieces for crumbling effect
  const pieces = useMemo(() => {
    const pieceList: PlatformPiece[] = [];
    const gridX = 3;
    const gridZ = 3;
    const pieceWidth = size[0] / gridX;
    const pieceDepth = size[2] / gridZ;

    let id = 0;
    for (let x = 0; x < gridX; x++) {
      for (let z = 0; z < gridZ; z++) {
        const offsetX = (x - (gridX - 1) / 2) * pieceWidth;
        const offsetZ = (z - (gridZ - 1) / 2) * pieceDepth;
        const distFromCenter = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);

        pieceList.push({
          id: id++,
          offset: [offsetX, 0, offsetZ],
          size: [pieceWidth * 0.95, size[1], pieceDepth * 0.95],
          fallen: false,
          fallDelay: distFromCenter * 0.1 + Math.random() * 0.2,
          velocity: [
            (Math.random() - 0.5) * 2,
            -5 - Math.random() * 5,
            (Math.random() - 0.5) * 2,
          ],
          rotation: [
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
          ],
        });
      }
    }
    return pieceList;
  }, [size]);

  const [pieceStates, setPieceStates] = useState<
    { y: number; rotX: number; rotY: number; rotZ: number; fallen: boolean }[]
  >(pieces.map(() => ({ y: 0, rotX: 0, rotY: 0, rotZ: 0, fallen: false })));

  useFrame((_, delta) => {
    // Check if player is on platform
    if (playerPosition && state === 'solid') {
      const onPlatform =
        Math.abs(playerPosition[0] - position[0]) < size[0] / 2 + 0.5 &&
        Math.abs(playerPosition[2] - position[2]) < size[2] / 2 + 0.5 &&
        playerPosition[1] > position[1] &&
        playerPosition[1] < position[1] + 2;

      if (onPlatform && !playerOnPlatform) {
        setPlayerOnPlatform(true);
        timeRef.current = 0;
      }
    }

    switch (state) {
      case 'solid':
        if (playerOnPlatform) {
          timeRef.current += delta;
          if (timeRef.current >= crumbleDelay) {
            setState('crumbling');
            crumbleTimeRef.current = 0;
            setPieceStates(pieces.map(() => ({ y: 0, rotX: 0, rotY: 0, rotZ: 0, fallen: false })));
          }
        }
        break;

      case 'crumbling':
        crumbleTimeRef.current += delta;

        // Update each piece
        const newPieceStates = pieceStates.map((ps, i) => {
          const piece = pieces[i];
          if (crumbleTimeRef.current > piece.fallDelay) {
            return {
              y: ps.y + piece.velocity[1] * delta,
              rotX: ps.rotX + piece.rotation[0] * delta * 5,
              rotY: ps.rotY + piece.rotation[1] * delta * 5,
              rotZ: ps.rotZ + piece.rotation[2] * delta * 5,
              fallen: ps.y < -20,
            };
          }
          return ps;
        });

        setPieceStates(newPieceStates);

        // Check if all pieces have fallen
        if (newPieceStates.every((ps) => ps.fallen)) {
          setState('fallen');
          timeRef.current = 0;
        }
        break;

      case 'fallen':
        timeRef.current += delta;
        if (timeRef.current >= respawnTime) {
          setState('respawning');
          timeRef.current = 0;
        }
        break;

      case 'respawning':
        // Quick fade-in
        timeRef.current += delta;
        if (timeRef.current >= 0.5) {
          setState('solid');
          setPlayerOnPlatform(false);
          setPieceStates(pieces.map(() => ({ y: 0, rotX: 0, rotY: 0, rotZ: 0, fallen: false })));
        }
        break;
    }
  });

  // Warning shake when about to crumble
  const shakeOffset = useMemo(() => {
    if (state === 'solid' && playerOnPlatform) {
      const intensity = Math.min(timeRef.current / crumbleDelay, 1);
      return [
        Math.sin(Date.now() * 0.05) * 0.02 * intensity,
        0,
        Math.cos(Date.now() * 0.04) * 0.02 * intensity,
      ] as [number, number, number];
    }
    return [0, 0, 0] as [number, number, number];
  }, [state, playerOnPlatform, crumbleDelay]);

  if (state === 'fallen') {
    return null;
  }

  if (state === 'crumbling') {
    return (
      <group position={position}>
        {pieces.map((piece, i) => {
          const ps = pieceStates[i];
          if (ps.fallen) return null;

          return (
            <mesh
              key={piece.id}
              position={[piece.offset[0], ps.y, piece.offset[2]]}
              rotation={[ps.rotX, ps.rotY, ps.rotZ]}
            >
              <boxGeometry args={piece.size} />
              <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  const opacity = state === 'respawning' ? timeRef.current / 0.5 : 1;

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed"
      position={[
        position[0] + shakeOffset[0],
        position[1] + shakeOffset[1],
        position[2] + shakeOffset[2],
      ]}
      colliders="cuboid"
    >
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={state === 'solid' && playerOnPlatform ? '#FF8C00' : color}
          roughness={0.8}
          metalness={0.1}
          transparent={state === 'respawning'}
          opacity={opacity}
          emissive={state === 'solid' && playerOnPlatform ? '#FF4500' : '#000000'}
          emissiveIntensity={state === 'solid' && playerOnPlatform ? 0.3 : 0}
        />
      </mesh>

      {/* Crack pattern overlay when about to crumble */}
      {state === 'solid' && playerOnPlatform && (
        <mesh position={[0, size[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size[0] * 0.9, size[2] * 0.9]} />
          <meshBasicMaterial
            color="#8B0000"
            transparent
            opacity={Math.min(timeRef.current / crumbleDelay, 1) * 0.4}
          />
        </mesh>
      )}

      {/* Warning glow */}
      {state === 'solid' && playerOnPlatform && (
        <pointLight
          position={[0, size[1], 0]}
          color="#FF4500"
          intensity={Math.min(timeRef.current / crumbleDelay, 1) * 2}
          distance={5}
        />
      )}
    </RigidBody>
  );
}
