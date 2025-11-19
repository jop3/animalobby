export function WebGLFallback({ error }: { error: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            WebGL Required
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Animal Obby requires WebGL to render 3D graphics. Please ensure you're using a modern browser with hardware acceleration enabled.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800 font-medium">Recommended Browsers:</p>
            <p className="text-xs text-blue-600 mt-1">Chrome, Firefox, Safari, or Edge (latest versions)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
