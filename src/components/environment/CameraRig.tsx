import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface CameraRigProps {
  target: React.RefObject<any>; // The player's RigidBody
  offset?: Vector3;
  smoothness?: number;
}

export function CameraRig({
  target,
  offset = new Vector3(0, 5, 10),
  smoothness = 0.1,
}: CameraRigProps) {
  const { camera } = useThree();
  const currentOffset = useRef(new Vector3().copy(offset));

  useFrame(() => {
    if (!target.current) return;

    const targetPosition = target.current.translation();

    // Calculate desired camera position
    const desiredPosition = new Vector3(
      targetPosition.x + offset.x,
      targetPosition.y + offset.y,
      targetPosition.z + offset.z
    );

    // Smoothly interpolate camera position
    camera.position.lerp(desiredPosition, smoothness);

    // Look at the player
    const lookAtPosition = new Vector3(
      targetPosition.x,
      targetPosition.y + 1, // Look slightly above the player
      targetPosition.z
    );
    camera.lookAt(lookAtPosition);
  });

  return null;
}
