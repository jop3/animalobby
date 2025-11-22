import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { RapierRigidBody } from '@react-three/rapier';

interface DoorProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  startsOpen?: boolean;
  isOpen?: boolean; // Controlled by switches/pressure plates
}

export function Door({
  id,
  position,
  size,
  color = '#8B4513',
  startsOpen = false,
  isOpen = false,
}: DoorProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [currentlyOpen, setCurrentlyOpen] = useState(startsOpen);
  const targetY = useRef(startsOpen ? position[1] + size[1] : position[1]);

  useEffect(() => {
    setCurrentlyOpen(isOpen);
    targetY.current = isOpen ? position[1] + size[1] : position[1];
  }, [isOpen, position, size]);

  useFrame(() => {
    if (!bodyRef.current) return;

    const currentPos = bodyRef.current.translation();
    const diff = targetY.current - currentPos.y;

    if (Math.abs(diff) > 0.01) {
      bodyRef.current.setTranslation(
        {
          x: currentPos.x,
          y: currentPos.y + diff * 0.1,
          z: currentPos.z,
        },
        true
      );
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      position={[position[0], targetY.current, position[2]]}
      userData={{ isDoor: true, doorId: id }}
    >
      {/* Main door */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Door frame indicators */}
      <mesh position={[-size[0] / 2 - 0.1, 0, 0]}>
        <boxGeometry args={[0.2, size[1], size[2]]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
      <mesh position={[size[0] / 2 + 0.1, 0, 0]}>
        <boxGeometry args={[0.2, size[1], size[2]]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>

      {/* Status light */}
      <mesh position={[0, size[1] / 2 + 0.2, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color={currentlyOpen ? '#00FF00' : '#FF0000'}
          emissive={currentlyOpen ? '#00FF00' : '#FF0000'}
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight
        position={[0, size[1] / 2 + 0.2, 0]}
        color={currentlyOpen ? '#00FF00' : '#FF0000'}
        intensity={1}
        distance={3}
      />

      {/* Hazard stripes */}
      {!currentlyOpen && (
        <>
          {Array.from({ length: Math.floor(size[0] / 0.5) }).map((_, i) => (
            <mesh
              key={i}
              position={[-size[0] / 2 + i * 0.5 + 0.25, 0, size[2] / 2 + 0.01]}
            >
              <boxGeometry args={[0.2, size[1], 0.02]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#FFFF00' : '#000000'}
                roughness={0.5}
              />
            </mesh>
          ))}
        </>
      )}
    </RigidBody>
  );
}
