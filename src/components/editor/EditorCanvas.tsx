import { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../../store/useEditorStore';
import { EditorEntity } from './EditorEntity';
import { EntityType } from '../../types/level.types';

// Clickable ground plane for adding entities
function GroundPlane({ onPlaceEntity }: { onPlaceEntity: (position: [number, number, number]) => void }) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Only handle clicks directly on the ground plane
    if (e.object.name !== 'ground-plane') return;
    e.stopPropagation();

    const point = e.point;
    onPlaceEntity([point.x, 0, point.z]);
  };

  return (
    <mesh
      name="ground-plane"
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Transform controls wrapper
function TransformControlsWrapper() {
  const { camera, scene } = useThree();
  const transformRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<any>(null);

  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const transformMode = useEditorStore(state => state.transformMode);
  const snapEnabled = useEditorStore(state => state.snapEnabled);
  const snapSize = useEditorStore(state => state.snapSize);
  const levelData = useEditorStore(state => state.levelData);
  const updateEntity = useEditorStore(state => state.updateEntity);

  const [controlsRef, setControlsRef] = useState<any>(null);

  // Find the selected entity's mesh in the scene
  const selectedEntity = selectedEntityId
    ? levelData.entities.find(e => e.id === selectedEntityId)
    : null;

  // Handle transform changes
  const handleTransformChange = useCallback(() => {
    if (!controlsRef || !selectedEntity) return;

    const object = controlsRef.object;
    if (!object) return;

    const position: [number, number, number] = [
      object.position.x,
      object.position.y,
      object.position.z,
    ];

    // Don't save to history on every frame - that's handled by the store
    updateEntity(selectedEntity.id!, { position });
  }, [controlsRef, selectedEntity, updateEntity]);

  // Disable orbit controls while transforming
  const handleDraggingChanged = useCallback((event: { value: boolean }) => {
    if (orbitRef.current) {
      orbitRef.current.enabled = !event.value;
    }
  }, []);

  return (
    <>
      <OrbitControls
        ref={orbitRef}
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={5}
        maxDistance={100}
      />

      {selectedEntity && (
        <TransformControls
          ref={setControlsRef}
          mode={transformMode}
          translationSnap={snapEnabled ? snapSize : undefined}
          rotationSnap={snapEnabled ? Math.PI / 12 : undefined}
          scaleSnap={snapEnabled ? 0.1 : undefined}
          onObjectChange={handleTransformChange}
          onMouseDown={() => handleDraggingChanged({ value: true })}
          onMouseUp={() => handleDraggingChanged({ value: false })}
        >
          <group position={selectedEntity.position}>
            <mesh visible={false}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
            </mesh>
          </group>
        </TransformControls>
      )}
    </>
  );
}

// Entity renderer
function EntityRenderer() {
  const levelData = useEditorStore(state => state.levelData);
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const selectedEntityIds = useEditorStore(state => state.selectedEntityIds);
  const hoveredEntityId = useEditorStore(state => state.hoveredEntityId);
  const selectEntity = useEditorStore(state => state.selectEntity);
  const setHoveredEntity = useEditorStore(state => state.setHoveredEntity);

  const handleEntityClick = useCallback((entityId: string, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectEntity(entityId, e.shiftKey);
  }, [selectEntity]);

  const handlePointerOver = useCallback((entityId: string, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredEntity(entityId);
  }, [setHoveredEntity]);

  const handlePointerOut = useCallback(() => {
    setHoveredEntity(null);
  }, [setHoveredEntity]);

  return (
    <>
      {levelData.entities.map((entity, index) => (
        <EditorEntity
          key={entity.id || `entity_${index}`}
          entity={entity}
          isSelected={selectedEntityIds.includes(entity.id || '')}
          isHovered={hoveredEntityId === entity.id}
          onClick={(e) => handleEntityClick(entity.id || '', e)}
          onPointerOver={(e) => handlePointerOver(entity.id || '', e)}
          onPointerOut={handlePointerOut}
        />
      ))}
    </>
  );
}

// Spawn point indicator
function SpawnPointIndicator() {
  const spawnPoint = useEditorStore(state => state.levelData.spawnPoint);

  return (
    <group position={spawnPoint}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
      </mesh>
      {/* Label */}
      <sprite position={[0, 2, 0]} scale={[2, 0.5, 1]}>
        <spriteMaterial color="#00FF00" />
      </sprite>
    </group>
  );
}

// Editor Grid
function EditorGrid() {
  const showGrid = useEditorStore(state => state.showGrid);
  const snapSize = useEditorStore(state => state.snapSize);

  if (!showGrid) return null;

  return (
    <Grid
      infiniteGrid
      cellSize={snapSize}
      cellThickness={0.5}
      cellColor="#444444"
      sectionSize={snapSize * 10}
      sectionThickness={1}
      sectionColor="#666666"
      fadeDistance={100}
      fadeStrength={1}
      followCamera={false}
    />
  );
}

// Scene contents
interface EditorSceneProps {
  pendingEntityType: EntityType | null;
  onEntityPlaced: () => void;
}

function EditorScene({ pendingEntityType, onEntityPlaced }: EditorSceneProps) {
  const addEntity = useEditorStore(state => state.addEntity);
  const clearSelection = useEditorStore(state => state.clearSelection);
  const levelData = useEditorStore(state => state.levelData);

  const handlePlaceEntity = useCallback((position: [number, number, number]) => {
    if (pendingEntityType) {
      addEntity(pendingEntityType, position);
      onEntityPlaced();
    } else {
      clearSelection();
    }
  }, [pendingEntityType, addEntity, onEntityPlaced, clearSelection]);

  // Apply theme colors
  const skyColor = levelData.theme.skyColor || '#87CEEB';
  const ambientColor = levelData.theme.ambientColor || '#B3D9FF';

  return (
    <>
      {/* Background color */}
      <color attach="background" args={[skyColor]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} color={ambientColor} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#444444" />

      {/* Grid */}
      <EditorGrid />

      {/* Ground plane for clicks */}
      <GroundPlane onPlaceEntity={handlePlaceEntity} />

      {/* Spawn point */}
      <SpawnPointIndicator />

      {/* Entities */}
      <EntityRenderer />

      {/* Transform controls */}
      <TransformControlsWrapper />

      {/* Gizmo helper */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </>
  );
}

// Main editor canvas component
interface EditorCanvasProps {
  pendingEntityType: EntityType | null;
  onEntityPlaced: () => void;
}

export function EditorCanvas({ pendingEntityType, onEntityPlaced }: EditorCanvasProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <EditorScene
            pendingEntityType={pendingEntityType}
            onEntityPlaced={onEntityPlaced}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
