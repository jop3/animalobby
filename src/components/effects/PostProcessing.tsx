import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';

export function PostProcessing() {
  const quality = useGameStore((state) => state.quality);

  // Disable post-processing on low quality
  if (quality === 'low') return null;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.9} // Only very bright objects glow
        luminanceSmoothing={0.9}
        intensity={quality === 'high' ? 1.5 : 1}
        mipmapBlur={quality === 'high'}
      />
    </EffectComposer>
  );
}
