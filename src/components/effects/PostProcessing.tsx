import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useGameStore } from '../../store/useGameStore';

export function PostProcessing() {
  const quality = useGameStore((state) => state.quality);
  const currentLevelId = useGameStore((state) => state.currentLevelId);

  // Disable post-processing on low quality
  if (quality === 'low') return null;

  // Level-specific effects
  const isNeonCity = currentLevelId === 'neon_city';
  const isSpaceStation = currentLevelId === 'space_station';
  const isLavaVolcano = currentLevelId === 'lava_volcano';
  const needsExtraGlow = isNeonCity || isSpaceStation || isLavaVolcano;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={needsExtraGlow ? 0.5 : 0.7}
        luminanceSmoothing={0.8}
        intensity={needsExtraGlow ? (quality === 'high' ? 2.5 : 2) : (quality === 'high' ? 1.8 : 1.2)}
        mipmapBlur={quality === 'high'}
      />

      {/* Chromatic aberration for neon city cyberpunk effect */}
      {isNeonCity && quality === 'high' && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.001, 0.001]}
        />
      )}

      {/* Subtle vignette for all levels */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
