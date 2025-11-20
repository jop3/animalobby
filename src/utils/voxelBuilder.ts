import * as THREE from 'three';

export interface VoxelBox {
  position: [number, number, number];
  size?: [number, number, number];
  color: string;
}

export interface VoxelModel {
  boxes: VoxelBox[];
  pivot?: [number, number, number];
}

/**
 * Creates a voxel-style geometry group from an array of box definitions
 * Each box is a cube with rounded edges and enhanced materials
 */
export const createVoxelGroup = (model: VoxelModel): THREE.Group => {
  const group = new THREE.Group();

  model.boxes.forEach((voxel) => {
    const size = voxel.size || [0.5, 0.5, 0.5];

    // Create rounded box geometry for smoother look
    const geometry = new THREE.BoxGeometry(...size);
    const edgesGeometry = new THREE.EdgesGeometry(geometry, 15); // 15 degree threshold for edges

    // Main mesh with enhanced material
    const color = new THREE.Color(voxel.color);
    const material = new THREE.MeshStandardMaterial({
      color: voxel.color,
      roughness: 0.6,
      metalness: 0.2,
      flatShading: false, // Smooth shading for better look
      emissive: color,
      emissiveIntensity: 0.1, // Subtle glow
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...voxel.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add subtle edge highlight for definition
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(voxel.color).multiplyScalar(1.3), // Slightly brighter
      linewidth: 1,
      transparent: true,
      opacity: 0.3,
    });
    const edgeLines = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    mesh.add(edgeLines);

    group.add(mesh);
  });

  // Set pivot point if specified
  if (model.pivot) {
    group.position.set(...model.pivot);
  }

  return group;
};

/**
 * Helper function to create a simple colored box
 */
export const createVoxelBox = (
  position: [number, number, number],
  size: [number, number, number],
  color: string
): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(...size);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

/**
 * Pre-defined voxel models for animal parts and character bases
 */
export const VOXEL_MODELS = {
  // ============================================================================
  // CHARACTER BASE TYPES
  // ============================================================================

  // HUMAN - Default character
  human_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#FFD1A3' }, // Head
      { position: [0.25, 0.1, 0.35], size: [0.15, 0.15, 0.1], color: '#000' }, // Right eye
      { position: [-0.25, 0.1, 0.35], size: [0.15, 0.15, 0.1], color: '#000' }, // Left eye
      { position: [0, -0.15, 0.35], size: [0.15, 0.08, 0.08], color: '#FF9980' }, // Nose
    ],
  } as VoxelModel,

  human_body: {
    boxes: [
      { position: [0, 0, 0], size: [1, 1.2, 0.6], color: '#4A90E2' }, // Torso
      { position: [0.55, 0.4, 0], size: [0.3, 1, 0.3], color: '#FFD1A3' }, // Right arm
      { position: [-0.55, 0.4, 0], size: [0.3, 1, 0.3], color: '#FFD1A3' }, // Left arm
    ],
  } as VoxelModel,

  human_legs: {
    boxes: [
      { position: [0.25, 0, 0], size: [0.35, 1, 0.35], color: '#2C3E50' }, // Right leg
      { position: [-0.25, 0, 0], size: [0.35, 1, 0.35], color: '#2C3E50' }, // Left leg
    ],
  } as VoxelModel,

  // ROBOT - Mechanical character
  robot_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.9, 0.9, 0.9], color: '#7F8C8D' }, // Main head
      { position: [0, 0.45, 0], size: [0.95, 0.1, 0.95], color: '#34495E' }, // Top rim
      { position: [0.3, 0.1, 0.46], size: [0.2, 0.2, 0.05], color: '#3498DB' }, // Right eye (glowing)
      { position: [-0.3, 0.1, 0.46], size: [0.2, 0.2, 0.05], color: '#3498DB' }, // Left eye
      { position: [0, -0.2, 0.46], size: [0.5, 0.15, 0.05], color: '#2C3E50' }, // Mouth grille
      { position: [0.4, 0.15, 0.2], size: [0.15, 0.15, 0.15], color: '#E74C3C' }, // Antenna
    ],
  } as VoxelModel,

  robot_body: {
    boxes: [
      { position: [0, 0, 0], size: [1.1, 1.3, 0.7], color: '#95A5A6' }, // Main torso
      { position: [0, 0.3, 0.36], size: [0.6, 0.4, 0.05], color: '#34495E' }, // Chest panel
      { position: [0, 0, 0.36], size: [0.3, 0.2, 0.05], color: '#3498DB' }, // Core light
      { position: [0.6, 0.5, 0], size: [0.35, 0.4, 0.35], color: '#7F8C8D' }, // Right shoulder
      { position: [-0.6, 0.5, 0], size: [0.35, 0.4, 0.35], color: '#7F8C8D' }, // Left shoulder
      { position: [0.6, 0, 0], size: [0.25, 0.9, 0.25], color: '#95A5A6' }, // Right arm
      { position: [-0.6, 0, 0], size: [0.25, 0.9, 0.25], color: '#95A5A6' }, // Left arm
    ],
  } as VoxelModel,

  robot_legs: {
    boxes: [
      { position: [0.28, 0.2, 0], size: [0.4, 0.6, 0.4], color: '#7F8C8D' }, // Right thigh
      { position: [-0.28, 0.2, 0], size: [0.4, 0.6, 0.4], color: '#7F8C8D' }, // Left thigh
      { position: [0.28, -0.35, 0], size: [0.35, 0.5, 0.35], color: '#95A5A6' }, // Right shin
      { position: [-0.28, -0.35, 0], size: [0.35, 0.5, 0.35], color: '#95A5A6' }, // Left shin
      { position: [0.28, -0.65, 0.15], size: [0.4, 0.15, 0.5], color: '#34495E' }, // Right foot
      { position: [-0.28, -0.65, 0.15], size: [0.4, 0.15, 0.5], color: '#34495E' }, // Left foot
    ],
  } as VoxelModel,

  // SLIME - Blob character
  slime_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.9, 0.9, 0.9], color: '#2ECC71' }, // Main blob
      { position: [0, 0.35, 0], size: [0.7, 0.6, 0.7], color: '#27AE60' }, // Top blob
      { position: [0.25, 0.15, 0.4], size: [0.2, 0.25, 0.15], color: '#000' }, // Right eye
      { position: [-0.25, 0.15, 0.4], size: [0.2, 0.25, 0.15], color: '#000' }, // Left eye
      { position: [0.25, 0.25, 0.42], size: [0.1, 0.15, 0.08], color: '#FFF' }, // Right eye shine
      { position: [-0.25, 0.25, 0.42], size: [0.1, 0.15, 0.08], color: '#FFF' }, // Left eye shine
    ],
  } as VoxelModel,

  slime_body: {
    boxes: [
      { position: [0, 0.1, 0], size: [1.1, 1.1, 0.8], color: '#2ECC71' }, // Main body blob
      { position: [0, -0.2, 0], size: [1.3, 0.8, 0.9], color: '#27AE60' }, // Lower blob
      { position: [0.6, 0.2, 0], size: [0.4, 0.8, 0.4], color: '#2ECC71' }, // Right arm blob
      { position: [-0.6, 0.2, 0], size: [0.4, 0.8, 0.4], color: '#2ECC71' }, // Left arm blob
    ],
  } as VoxelModel,

  slime_legs: {
    boxes: [
      { position: [0.3, 0, 0], size: [0.5, 0.9, 0.5], color: '#2ECC71' }, // Right leg blob
      { position: [-0.3, 0, 0], size: [0.5, 0.9, 0.5], color: '#2ECC71' }, // Left leg blob
      { position: [0.3, -0.5, 0.1], size: [0.6, 0.3, 0.6], color: '#27AE60' }, // Right foot blob
      { position: [-0.3, -0.5, 0.1], size: [0.6, 0.3, 0.6], color: '#27AE60' }, // Left foot blob
    ],
  } as VoxelModel,

  // BLOCKY - Minecraft-style character
  blocky_head: {
    boxes: [
      { position: [0, 0, 0], size: [1, 1, 1], color: '#F39C12' }, // Perfect cube head
      { position: [0.35, 0.15, 0.51], size: [0.25, 0.25, 0.05], color: '#000' }, // Right eye
      { position: [-0.35, 0.15, 0.51], size: [0.25, 0.25, 0.05], color: '#000' }, // Left eye
      { position: [0, -0.15, 0.51], size: [0.5, 0.15, 0.05], color: '#D35400' }, // Mouth
    ],
  } as VoxelModel,

  blocky_body: {
    boxes: [
      { position: [0, 0, 0], size: [1.2, 1.4, 0.6], color: '#E67E22' }, // Torso (rectangular)
      { position: [0.75, 0.3, 0], size: [0.3, 1.2, 0.3], color: '#F39C12' }, // Right arm
      { position: [-0.75, 0.3, 0], size: [0.3, 1.2, 0.3], color: '#F39C12' }, // Left arm
    ],
  } as VoxelModel,

  blocky_legs: {
    boxes: [
      { position: [0.3, 0, 0], size: [0.4, 1.1, 0.4], color: '#34495E' }, // Right leg (perfect cube)
      { position: [-0.3, 0, 0], size: [0.4, 1.1, 0.4], color: '#34495E' }, // Left leg
    ],
  } as VoxelModel,

  // SMOOTH - Sleek, streamlined character
  smooth_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.7, 0.85, 0.75], color: '#9B59B6' }, // Main head (oval-ish)
      { position: [0, 0.3, 0], size: [0.6, 0.4, 0.65], color: '#8E44AD' }, // Top curve
      { position: [0.2, 0.1, 0.35], size: [0.18, 0.18, 0.08], color: '#ECF0F1' }, // Right eye (white)
      { position: [-0.2, 0.1, 0.35], size: [0.18, 0.18, 0.08], color: '#ECF0F1' }, // Left eye
      { position: [0.2, 0.1, 0.37], size: [0.08, 0.08, 0.05], color: '#2C3E50' }, // Right pupil
      { position: [-0.2, 0.1, 0.37], size: [0.08, 0.08, 0.05], color: '#2C3E50' }, // Left pupil
    ],
  } as VoxelModel,

  smooth_body: {
    boxes: [
      { position: [0, 0.2, 0], size: [0.9, 0.9, 0.6], color: '#8E44AD' }, // Upper torso
      { position: [0, -0.3, 0], size: [0.85, 0.8, 0.55], color: '#9B59B6' }, // Lower torso
      { position: [0.5, 0.3, 0], size: [0.25, 0.95, 0.25], color: '#9B59B6' }, // Right arm
      { position: [-0.5, 0.3, 0], size: [0.25, 0.95, 0.25], color: '#9B59B6' }, // Left arm
    ],
  } as VoxelModel,

  smooth_legs: {
    boxes: [
      { position: [0.25, 0.15, 0], size: [0.32, 0.85, 0.32], color: '#8E44AD' }, // Right thigh
      { position: [-0.25, 0.15, 0], size: [0.32, 0.85, 0.32], color: '#8E44AD' }, // Left thigh
      { position: [0.25, -0.45, 0], size: [0.28, 0.6, 0.28], color: '#9B59B6' }, // Right calf
      { position: [-0.25, -0.45, 0], size: [0.28, 0.6, 0.28], color: '#9B59B6' }, // Left calf
    ],
  } as VoxelModel,

  // ============================================================================
  // ANIMAL PARTS (work with all character bases)
  // ============================================================================

  // Cheetah legs - elongated and golden
  cheetah_legs: {
    boxes: [
      { position: [0.25, 0.2, 0], size: [0.3, 1.2, 0.3], color: '#F4A300' }, // Right leg
      { position: [-0.25, 0.2, 0], size: [0.3, 1.2, 0.3], color: '#F4A300' }, // Left leg
      // Speed markings
      { position: [0.25, 0.6, 0.2], size: [0.32, 0.15, 0.1], color: '#000' },
      { position: [-0.25, 0.6, 0.2], size: [0.32, 0.15, 0.1], color: '#000' },
    ],
  } as VoxelModel,

  // Frog legs - thick and springy
  frog_legs: {
    boxes: [
      { position: [0.3, 0.1, 0], size: [0.5, 0.8, 0.6], color: '#7FFF00' }, // Right leg (thick)
      { position: [-0.3, 0.1, 0], size: [0.5, 0.8, 0.6], color: '#7FFF00' }, // Left leg (thick)
      // Webbed feet
      { position: [0.4, -0.4, 0.3], size: [0.3, 0.1, 0.5], color: '#6BCC00' },
      { position: [-0.4, -0.4, 0.3], size: [0.3, 0.1, 0.5], color: '#6BCC00' },
    ],
  } as VoxelModel,

  // Turtle shell
  turtle_body: {
    boxes: [
      { position: [0, 0, 0], size: [1.2, 0.8, 1], color: '#2ECC71' }, // Shell base
      { position: [0, 0.3, 0], size: [1, 0.6, 0.8], color: '#27AE60' }, // Shell dome
      // Shell pattern
      { position: [0, 0.35, 0], size: [0.9, 0.55, 0.7], color: '#1E8449' },
    ],
  } as VoxelModel,

  // Eagle head with beak
  eagle_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.7, 0.7, 0.7], color: '#8B4513' }, // Head
      { position: [0.2, 0, 0.5], size: [0.1, 0.1, 0.1], color: '#FFD700' }, // Right eye
      { position: [-0.2, 0, 0.5], size: [0.1, 0.1, 0.1], color: '#FFD700' }, // Left eye
      { position: [0, -0.1, 0.6], size: [0.25, 0.3, 0.4], color: '#FFA500' }, // Beak
    ],
  } as VoxelModel,

  // Simple coin model
  coin_speed: {
    boxes: [
      { position: [0, 0, 0], size: [0.5, 0.5, 0.1], color: '#F1C40F' }, // Main
      { position: [0, 0, 0.05], size: [0.3, 0.3, 0.12], color: '#FFD700' }, // Center
    ],
  } as VoxelModel,

  coin_gravity: {
    boxes: [
      { position: [0, 0, 0], size: [0.5, 0.5, 0.1], color: '#9B59B6' }, // Main
      { position: [0, 0, 0.05], size: [0.3, 0.3, 0.12], color: '#C39BD3' }, // Center
    ],
  } as VoxelModel,

  // Spike hazard
  spike: {
    boxes: [
      { position: [0, 0, 0], size: [0.4, 0.2, 0.4], color: '#FF4444' }, // Base
      { position: [0, 0.3, 0], size: [0.3, 0.4, 0.3], color: '#FF4444' }, // Mid
      { position: [0, 0.6, 0], size: [0.15, 0.3, 0.15], color: '#FF4444' }, // Tip
    ],
  } as VoxelModel,
};
