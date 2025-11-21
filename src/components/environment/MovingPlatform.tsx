import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Vector3 } from 'three';

interface MovingPlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  pattern: 'linear' | 'circular' | 'pendulum';
  speed?: number;
  range: [number, number, number];
}

export function MovingPlatform({
  position,
  size,
  color,
  pattern,
  speed = 1,
  range,
}: MovingPlatformProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const timeRef = useRef(0);
  const initialPos = useRef(new Vector3(...position));

  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    timeRef.current += delta * speed;
    const time = timeRef.current;

    let newPosition: Vector3;

    switch (pattern) {
      case 'linear': {
        // Move back and forth along the range vector
        const progress = Math.sin(time) * 0.5 + 0.5; // 0 to 1
        newPosition = new Vector3(
          initialPos.current.x + range[0] * (progress * 2 - 1),
          initialPos.current.y + range[1] * (progress * 2 - 1),
          initialPos.current.z + range[2] * (progress * 2 - 1)
        );
        break;
      }

      case 'circular': {
        // Move in a circle (range = [radius, 0, 0] or adjust for different planes)
        const radius = Math.sqrt(range[0] * range[0] + range[2] * range[2]);
        newPosition = new Vector3(
          initialPos.current.x + Math.cos(time) * radius,
          initialPos.current.y + range[1] * Math.sin(time * 0.5),
          initialPos.current.z + Math.sin(time) * radius
        );
        break;
      }

      case 'pendulum': {
        // Swing like a pendulum (range = max displacement)
        const swing = Math.sin(time);
        newPosition = new Vector3(
          initialPos.current.x + range[0] * swing,
          initialPos.current.y + range[1] * swing,
          initialPos.current.z + range[2] * swing
        );
        break;
      }

      default:
        newPosition = initialPos.current;
    }

    // Set the kinematic position
    bodyRef.current.setNextKinematicTranslation(newPosition);
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      position={position}
      userData={{ platform: true, moving: true }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Platform edges for visual polish */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(size[0], size[1], size[2])]}
        />
        <lineBasicMaterial color="#000000" opacity={0.3} transparent />
      </lineSegments>

      {/* Trail indicator - shows direction of movement */}
      {pattern === 'linear' && (
        <mesh position={[range[0] * 0.5, -size[1] * 0.6, range[2] * 0.5]}>
          <capsuleGeometry args={[0.1, Math.sqrt(range[0] * range[0] + range[2] * range[2]), 8, 16]} />
          <meshBasicMaterial color={color} opacity={0.2} transparent />
        </mesh>
      )}
    </RigidBody>
  );
}
