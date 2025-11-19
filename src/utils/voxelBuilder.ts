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
 * Each box is a cube with flat shading for that classic voxel look
 */
export const createVoxelGroup = (model: VoxelModel): THREE.Group => {
  const group = new THREE.Group();

  model.boxes.forEach((voxel) => {
    const size = voxel.size || [0.5, 0.5, 0.5];
    const geometry = new THREE.BoxGeometry(...size);
    const material = new THREE.MeshStandardMaterial({
      color: voxel.color,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true, // This gives the voxel look!
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...voxel.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

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
 * Pre-defined voxel models for animal parts
 */
export const VOXEL_MODELS = {
  // Default human parts
  human_head: {
    boxes: [
      { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#FFD1A3' }, // Head
      { position: [0.25, 0.1, 0.35], size: [0.15, 0.15, 0.1], color: '#000' }, // Right eye
      { position: [-0.25, 0.1, 0.35], size: [0.15, 0.15, 0.1], color: '#000' }, // Left eye
    ],
  } as VoxelModel,

  human_body: {
    boxes: [
      { position: [0, 0, 0], size: [1, 1.2, 0.6], color: '#4A90E2' }, // Torso
    ],
  } as VoxelModel,

  human_legs: {
    boxes: [
      { position: [0.25, 0, 0], size: [0.35, 1, 0.35], color: '#2C3E50' }, // Right leg
      { position: [-0.25, 0, 0], size: [0.35, 1, 0.35], color: '#2C3E50' }, // Left leg
    ],
  } as VoxelModel,

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
