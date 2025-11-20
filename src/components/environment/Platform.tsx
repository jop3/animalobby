import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { textureGenerator } from '../../utils/textureGenerator';

interface PlatformProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

export function Platform({
  position,
  size = [4, 0.5, 4],
  color = '#7FBF7F',
}: PlatformProps) {
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

  // Determine material properties based on color
  const materialProps = useMemo(() => {
    const colorLower = color.toLowerCase();

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
  }, [color]);

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          map={texture}
          color={color}
          {...materialProps}
          flatShading
        />
      </mesh>
    </RigidBody>
  );
}
