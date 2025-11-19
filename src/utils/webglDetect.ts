/**
 * Detects if WebGL is available in the current browser
 */
export function detectWebGL(): { available: boolean; error?: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        available: false,
        error: 'WebGL is not supported in this browser. Please try a modern browser like Chrome, Firefox, or Edge.',
      };
    }

    return { available: true };
  } catch (e) {
    return {
      available: false,
      error: 'Error initializing WebGL. Your browser may not support it.',
    };
  }
}
