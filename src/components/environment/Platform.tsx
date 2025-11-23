import { useMemo, useRef, useState } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { textureGenerator } from '../../utils/textureGenerator';
import * as THREE from 'three';

interface PlatformProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  shape?: 'box' | 'cylinder' | 'sphere';
  bouncy?: boolean;
  disappearing?: {
    interval: number;
    visibleTime: number;
  };
  moving?: {
    pattern: 'linear' | 'circular' | 'pendulum';
    speed: number;
    range: [number, number, number];
  };
}

export function Platform({
  position,
  size = [4, 0.5, 4],
  color = '#7FBF7F',
  shape = 'box',
  bouncy = false,
  disappearing,
  moving,
}: PlatformProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = useState(true);
  const timeRef = useRef(0);

  // Generate texture based on color hue
  const texture = useMemo(() => {
    const colorLower = color.toLowerCase();

    // Neon/cyber colors (purple, pink, cyan)
    if (colorLower.includes('#8b00ff') || colorLower.includes('#ff006e') || colorLower.includes('#00d9ff')) {
      return textureGenerator.createNeonGridTexture(color, '#FFFFFF');
    }

    // Ice/blue colors
    if (colorLower.includes('a5d8ff') || colorLower.includes('74c0fc') || colorLower.includes('4dabf7')) {
      return textureGenerator.createIceTexture(color);
    }

    // Desert/tan colors
    if (colorLower.includes('d2691e') || colorLower.includes('cd853f') || colorLower.includes('deb887')) {
      return textureGenerator.createSandstoneTexture(color);
    }

    // Volcanic/dark colors
    if (colorLower.includes('1a0a00') || colorLower.includes('3d1f00') || colorLower.includes('5c2e00') || colorLower.includes('2f1b0c') || colorLower.includes('8b4513')) {
      return textureGenerator.createStoneTexture(color, '#000000');
    }

    // Mushroom/purple colors
    if (colorLower.includes('a855f7') || colorLower.includes('c084fc')) {
      return textureGenerator.createMushroomTexture(color, '#FFFFFF');
    }

    // Space/metal colors (gray)
    if (colorLower.includes('2d3748') || colorLower.includes('4a5568') || colorLower.includes('718096')) {
      return textureGenerator.createMetalPanelTexture(color);
    }

    // Underwater/ocean colors
    if (colorLower.includes('1e5a7a') || colorLower.includes('2a7ea4')) {
      return textureGenerator.createStoneTexture(color, '#3AA8CC');
    }

    // Default: stone texture
    return textureGenerator.createStoneTexture(color, '#FFFFFF');
  }, [color]);

  // Determine material properties based on color and properties
  const materialProps = useMemo(() => {
    const colorLower = color.toLowerCase();

    // Bouncy platforms - bright and shiny
    if (bouncy) {
      return {
        roughness: 0.1,
        metalness: 0.5,
        emissive: '#FFFF00',
        emissiveIntensity: 0.2,
      };
    }

    // Neon materials - emissive
    if (colorLower.includes('#8b00ff') || colorLower.includes('#ff006e') || colorLower.includes('#00d9ff')) {
      return {
        roughness: 0.3,
        metalness: 0.7,
        emissive: color,
        emissiveIntensity: 0.3,
      };
    }

    // Ice materials - shiny
    if (colorLower.includes('a5d8ff') || colorLower.includes('74c0fc') || colorLower.includes('4dabf7')) {
      return {
        roughness: 0.2,
        metalness: 0.4,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.05,
      };
    }

    // Metal materials
    if (colorLower.includes('2d3748') || colorLower.includes('4a5568') || colorLower.includes('718096')) {
      return {
        roughness: 0.4,
        metalness: 0.8,
        emissive: '#000000',
        emissiveIntensity: 0,
      };
    }

    // Default matte
    return {
      roughness: 0.8,
      metalness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0,
    };
  }, [color, bouncy]);

  // Animation frame for moving and disappearing platforms
  useFrame((_, delta) => {
    timeRef.current += delta;

    // Handle disappearing platforms
    if (disappearing) {
      const cycleTime = timeRef.current % disappearing.interval;
      const shouldBeVisible = cycleTime < disappearing.visibleTime;

      if (shouldBeVisible !== isVisible) {
        setIsVisible(shouldBeVisible);
      }

      // Fade effect
      if (meshRef.current) {
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        if (shouldBeVisible) {
          const fadeIn = Math.min(cycleTime / 0.5, 1);
          material.opacity = fadeIn;
        } else {
          const timeInvisible = cycleTime - disappearing.visibleTime;
          const fadeOut = Math.max(1 - timeInvisible / 0.5, 0);
          material.opacity = fadeOut;
        }
      }
    }

    // Handle moving platforms
    if (moving && rigidBodyRef.current) {
      const basePos = position;

      if (moving.pattern === 'linear') {
        // Linear back and forth movement
        const offset = Math.sin(timeRef.current * moving.speed) * 0.5;
        const newPos = [
          basePos[0] + moving.range[0] * offset,
          basePos[1] + moving.range[1] * offset,
          basePos[2] + moving.range[2] * offset,
        ] as [number, number, number];
        // Use setNextKinematicTranslation instead of setTranslation
        // This properly imparts velocity to objects standing on the platform
        rigidBodyRef.current.setNextKinematicTranslation(
          { x: newPos[0], y: newPos[1], z: newPos[2] }
        );
      } else if (moving.pattern === 'circular') {
        // Circular movement
        const angle = timeRef.current * moving.speed;
        const newPos = [
          basePos[0] + Math.cos(angle) * moving.range[0],
          basePos[1] + moving.range[1] * Math.sin(timeRef.current * moving.speed * 0.5),
          basePos[2] + Math.sin(angle) * moving.range[2],
        ] as [number, number, number];
        // Use setNextKinematicTranslation for proper velocity transfer
        rigidBodyRef.current.setNextKinematicTranslation(
          { x: newPos[0], y: newPos[1], z: newPos[2] }
        );
      } else if (moving.pattern === 'pendulum') {
        // Pendulum swing
        const swing = Math.sin(timeRef.current * moving.speed);
        const newPos = [
          basePos[0] + moving.range[0] * swing,
          basePos[1],
          basePos[2] + moving.range[2] * swing,
        ] as [number, number, number];
        // Use setNextKinematicTranslation for proper velocity transfer
        rigidBodyRef.current.setNextKinematicTranslation(
          { x: newPos[0], y: newPos[1], z: newPos[2] }
        );
      }
    }
  });

  // Render geometry based on shape
  const renderGeometry = () => {
    switch (shape) {
      case 'cylinder':
        return <cylinderGeometry args={[size[0], size[0], size[1], 32]} />;
      case 'sphere':
        return <sphereGeometry args={[size[0], 32, 32]} />;
      case 'box':
      default:
        return <boxGeometry args={size} />;
    }
  };

  // Determine collider based on shape
  const getColliderType = () => {
    switch (shape) {
      case 'cylinder':
        return 'hull' as const;
      case 'sphere':
        return 'ball' as const;
      case 'box':
      default:
        return 'cuboid' as const;
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      type={moving ? 'kinematicPosition' : 'fixed'}
      position={position}
      colliders={getColliderType()}
      restitution={bouncy ? 1.5 : 0.1}
      friction={bouncy ? 0.1 : 1}
    >
      <mesh
        ref={meshRef}
        receiveShadow
        castShadow
        visible={!disappearing || isVisible}
      >
        {renderGeometry()}
        <meshStandardMaterial
          map={texture}
          color={color}
          {...materialProps}
          flatShading
          transparent={!!disappearing}
          opacity={1}
        />
      </mesh>

      {/* Visual indicator for bouncy platforms */}
      {bouncy && (
        <mesh position={[0, size[1] / 2 + 0.1, 0]}>
          <cylinderGeometry args={[size[0] * 0.8, size[0] * 0.8, 0.1, 16]} />
          <meshStandardMaterial
            color="#FFFF00"
            emissive="#FFFF00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Visual indicator for disappearing platforms */}
      {disappearing && isVisible && (
        <mesh position={[0, size[1] / 2 + 0.05, 0]}>
          <boxGeometry args={[size[0] * 0.95, 0.05, size[2] * 0.95]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </RigidBody>
  );
}
