import { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelEntity, EntityType } from '../../types/level.types';
import { useEditorStore } from '../../store/useEditorStore';

interface EditorEntityProps {
  entity: LevelEntity;
  isSelected: boolean;
  isHovered: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
}

// Get entity size for bounding box
function getEntitySize(entity: LevelEntity): [number, number, number] {
  switch (entity.type) {
    case 'platform':
    case 'moving_platform':
    case 'lava':
    case 'wind_tunnel':
    case 'rising_lava':
    case 'gravity_zone':
    case 'moving_wall':
    case 'door':
    case 'climbable_wall':
    case 'low_obstacle':
    case 'fake_wall':
    case 'crumbling_platform':
      return entity.size || [4, 0.5, 4];
    case 'bounce_pad':
      return entity.size || [2, 0.3, 2];
    case 'pressure_plate':
      return entity.size || [2, 0.2, 2];
    case 'coin':
      return [0.8, 0.8, 0.8];
    case 'checkpoint':
    case 'spawn_portal':
      return [1, 2, 1];
    case 'spike':
      return [entity.size || 1, entity.size || 1, entity.size || 1];
    case 'rotating_hammer':
      return [(entity.hammerLength || 3) * 2, 1, 1];
    case 'zeus_lightning':
      return [(entity.radius || 2) * 2, 4, (entity.radius || 2) * 2];
    case 'vine':
      return [0.5, entity.height || 6, 0.5];
    case 'end_goal':
      return [2, 3, 2];
    case 'fire_jet':
      return [1, entity.height || 4, 1];
    case 'pendulum_blade':
      return [0.5, (entity.length || 4) * 2, 2];
    case 'laser_beam':
      return [entity.length || 10, 0.2, 0.2];
    case 'crushing_piston':
      return [2, entity.height || 5, 2];
    case 'spinning_blade':
      return [(entity.size || 1.5) * 2, 0.5, (entity.size || 1.5) * 2];
    case 'cannon_turret':
      return [1, 1, 2];
    case 'falling_icicle':
      return [0.5, 2, 0.5];
    case 'dart_trap':
      return [0.5, 0.5, 0.5];
    case 'swinging_log':
      return [(entity.logSize || 0.8) * 2, entity.length || 5, (entity.logSize || 0.8) * 2];
    case 'power_up':
      return [1.5, 1.5, 1.5];
    case 'animal_part':
      return [1, 1, 1];
    case 'switch':
      return [0.8, 1, 0.8];
    case 'boss_encounter':
      return entity.arenaSize || [30, 20, 30];
    case 'laser_grid':
      const rows = entity.rows || 3;
      const cols = entity.cols || 3;
      const spacing = entity.spacing || 2;
      return [cols * spacing, 0.2, rows * spacing];
    case 'secret_area':
      return entity.triggerZone?.size || [6, 4, 6];
    default:
      return [1, 1, 1];
  }
}

// Get entity color for preview
function getEntityColor(entity: LevelEntity): string {
  switch (entity.type) {
    case 'platform':
    case 'moving_platform':
    case 'fake_wall':
    case 'climbable_wall':
    case 'low_obstacle':
    case 'door':
    case 'crumbling_platform':
    case 'bounce_pad':
      return entity.color || '#7FBF7F';
    case 'gravity_zone':
      return entity.color || '#8B00FF';
    case 'coin':
      return entity.coinType === 'speed' ? '#FFD700' : '#C0C0C0';
    case 'checkpoint':
    case 'spawn_portal':
      return '#00FF00';
    case 'spike':
      return '#808080';
    case 'lava':
    case 'rising_lava':
      return '#FF4500';
    case 'rotating_hammer':
    case 'swinging_log':
      return '#8B4513';
    case 'zeus_lightning':
      return '#FFFF00';
    case 'vine':
      return '#228B22';
    case 'end_goal':
      return '#FFD700';
    case 'fire_jet':
      return '#FF6600';
    case 'pendulum_blade':
    case 'spinning_blade':
      return '#C0C0C0';
    case 'laser_beam':
      return '#FF0000';
    case 'laser_grid':
      return (entity as any).laserColor || '#FF0000';
    case 'crushing_piston':
      return '#555555';
    case 'moving_wall':
      return '#666666';
    case 'cannon_turret':
      return '#333333';
    case 'falling_icicle':
      return '#ADD8E6';
    case 'wind_tunnel':
      return '#87CEEB';
    case 'dart_trap':
      return '#8B0000';
    case 'power_up':
      return '#FF00FF';
    case 'animal_part':
      return '#FFA500';
    case 'switch':
      return '#00BFFF';
    case 'pressure_plate':
      return '#888888';
    case 'boss_encounter':
      return '#FF0000';
    case 'secret_area':
      return '#9400D3';
    default:
      return '#FFFFFF';
  }
}

// Simple preview mesh for each entity type
function EntityPreviewMesh({ entity }: { entity: LevelEntity }) {
  const size = getEntitySize(entity);
  const color = getEntityColor(entity);
  const showWireframe = useEditorStore(state => state.showWireframe);

  const geometry = useMemo(() => {
    switch (entity.type) {
      case 'coin':
      case 'animal_part':
      case 'power_up':
        return <sphereGeometry args={[size[0] / 2, 16, 16]} />;
      case 'spike':
        return <coneGeometry args={[size[0] / 2, size[1], 8]} />;
      case 'checkpoint':
      case 'spawn_portal':
      case 'end_goal':
        return <cylinderGeometry args={[size[0] / 2, size[0] / 2, size[1], 16]} />;
      case 'vine':
        return <cylinderGeometry args={[0.1, 0.1, size[1], 8]} />;
      case 'rotating_hammer':
      case 'pendulum_blade':
      case 'swinging_log':
        return <capsuleGeometry args={[0.3, size[1], 8, 16]} />;
      case 'spinning_blade':
        return <cylinderGeometry args={[size[0] / 2, size[0] / 2, 0.1, 16]} />;
      case 'switch':
        return <cylinderGeometry args={[size[0] / 2, size[0] / 2, size[1], 8]} />;
      default:
        return <boxGeometry args={size} />;
    }
  }, [entity.type, size]);

  return (
    <mesh>
      {geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.85}
        wireframe={showWireframe}
      />
    </mesh>
  );
}

// Selection outline
function SelectionOutline({ size, isSelected, isHovered }: {
  size: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (!isSelected && !isHovered) return null;

  const outlineColor = isSelected ? '#00AAFF' : '#FFAA00';
  const scale = 1.05;

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <boxGeometry args={size} />
      <meshBasicMaterial
        color={outlineColor}
        transparent
        opacity={0.3}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Bounding box wireframe
function BoundingBox({ size, isSelected }: { size: [number, number, number]; isSelected: boolean }) {
  const showBounds = useEditorStore(state => state.showBounds);

  if (!showBounds && !isSelected) return null;

  return (
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
      <lineBasicMaterial color={isSelected ? '#00AAFF' : '#666666'} />
    </lineSegments>
  );
}

export function EditorEntity({
  entity,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: EditorEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const size = getEntitySize(entity);

  // Offset to account for geometry centering
  const yOffset = useMemo(() => {
    switch (entity.type) {
      case 'spike':
      case 'checkpoint':
      case 'spawn_portal':
      case 'end_goal':
      case 'vine':
        return size[1] / 2;
      default:
        return 0;
    }
  }, [entity.type, size]);

  return (
    <group
      ref={groupRef}
      position={[entity.position[0], entity.position[1] + yOffset, entity.position[2]]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <EntityPreviewMesh entity={entity} />
      <SelectionOutline size={size} isSelected={isSelected} isHovered={isHovered} />
      <BoundingBox size={size} isSelected={isSelected} />
    </group>
  );
}

// Entity type selector component for adding entities
export function EntityTypeIcon({ type }: { type: EntityType }) {
  const size: [number, number, number] = [1, 1, 1];
  const color = getEntityColor({ type, position: [0, 0, 0] } as LevelEntity);

  return (
    <mesh>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
