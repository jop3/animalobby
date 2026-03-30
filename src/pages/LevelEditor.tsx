import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { EntityList } from '../components/editor/EntityList';
import { PropertyPanel } from '../components/editor/PropertyPanel';
import { LevelSettings } from '../components/editor/LevelSettings';
import { EntityType, LevelDefinition } from '../types/level.types';

// Tab button component
function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-700 text-white border-b-2 border-blue-500'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

// File operations bar
function FileOperationsBar({ onTestPlay }: { onTestPlay: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJSON = useEditorStore(state => state.exportJSON);
  const importJSON = useEditorStore(state => state.importJSON);
  const newLevel = useEditorStore(state => state.newLevel);
  const levelData = useEditorStore(state => state.levelData);
  const isTestPlaying = useEditorStore(state => state.isTestPlaying);

  const handleExport = useCallback(() => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelData.id || 'level'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportJSON, levelData.id]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importJSON(content);
      if (!success) {
        alert('Failed to import level. Please check the JSON format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [importJSON]);

  const handleNew = useCallback(() => {
    if (confirm('Create a new level? Unsaved changes will be lost.')) {
      newLevel();
    }
  }, [newLevel]);

  const handleSaveToLocalStorage = useCallback(() => {
    const json = exportJSON();
    localStorage.setItem('animal-obby-editor-draft', json);
    alert('Level saved to browser storage!');
  }, [exportJSON]);

  const handleLoadFromLocalStorage = useCallback(() => {
    const json = localStorage.getItem('animal-obby-editor-draft');
    if (json) {
      const success = importJSON(json);
      if (!success) {
        alert('Failed to load saved draft.');
      }
    } else {
      alert('No saved draft found.');
    }
  }, [importJSON]);

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center gap-2">
      <button
        onClick={handleNew}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        title="New Level"
      >
        New
      </button>

      <div className="h-6 w-px bg-gray-700" />

      <button
        onClick={handleSaveToLocalStorage}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        title="Save to Browser (Ctrl+S)"
      >
        Save Draft
      </button>
      <button
        onClick={handleLoadFromLocalStorage}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        title="Load from Browser"
      >
        Load Draft
      </button>

      <div className="h-6 w-px bg-gray-700" />

      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        title="Import JSON"
      >
        Import
      </button>
      <button
        onClick={handleExport}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm"
        title="Export JSON (Download)"
      >
        Export JSON
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex-1" />

      <button
        onClick={onTestPlay}
        className={`px-4 py-1.5 rounded text-sm font-medium ${
          isTestPlaying
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        {isTestPlaying ? 'Stop Test' : 'Test Play'}
      </button>

      <div className="h-6 w-px bg-gray-700" />

      <a
        href="/"
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
      >
        Back to Game
      </a>
    </div>
  );
}

// Help modal
function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-400 mb-2">Selection</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 pr-4 text-gray-400">Click</td><td>Select entity</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Shift+Click</td><td>Add to selection</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Ctrl+A</td><td>Select all</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Escape</td><td>Clear selection</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-400 mb-2">Transform</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 pr-4 text-gray-400">W</td><td>Translate mode</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">E</td><td>Rotate mode</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">R</td><td>Scale mode</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-400 mb-2">Edit</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 pr-4 text-gray-400">Delete</td><td>Delete selected</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Ctrl+D</td><td>Duplicate selected</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Ctrl+Z</td><td>Undo</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Ctrl+Y</td><td>Redo</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">Ctrl+S</td><td>Save draft</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-400 mb-2">View</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 pr-4 text-gray-400">G</td><td>Toggle grid</td></tr>
                <tr><td className="py-1 pr-4 text-gray-400">F</td><td>Focus on selected</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function LevelEditor() {
  const [pendingEntityType, setPendingEntityType] = useState<EntityType | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const activePanel = useEditorStore(state => state.activePanel);
  const setActivePanel = useEditorStore(state => state.setActivePanel);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const deleteSelectedEntities = useEditorStore(state => state.deleteSelectedEntities);
  const duplicateSelectedEntities = useEditorStore(state => state.duplicateSelectedEntities);
  const selectAll = useEditorStore(state => state.selectAll);
  const clearSelection = useEditorStore(state => state.clearSelection);
  const setShowGrid = useEditorStore(state => state.setShowGrid);
  const showGrid = useEditorStore(state => state.showGrid);
  const exportJSON = useEditorStore(state => state.exportJSON);
  const isTestPlaying = useEditorStore(state => state.isTestPlaying);
  const setTestPlaying = useEditorStore(state => state.setTestPlaying);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA' ||
          (e.target as HTMLElement).tagName === 'SELECT') {
        return;
      }

      // Transform modes
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setTransformMode('translate');
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setTransformMode('rotate');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setTransformMode('scale');
      }

      // Grid toggle
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid(!showGrid);
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedEntities();
      }

      // Escape - clear selection or cancel pending entity
      if (e.key === 'Escape') {
        e.preventDefault();
        if (pendingEntityType) {
          setPendingEntityType(null);
        } else if (isTestPlaying) {
          setTestPlaying(false);
        } else {
          clearSelection();
        }
      }

      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          duplicateSelectedEntities();
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          selectAll();
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          const json = exportJSON();
          localStorage.setItem('animal-obby-editor-draft', json);
          // Show a brief notification
          const notification = document.createElement('div');
          notification.textContent = 'Draft saved!';
          notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        }
      }

      // Help
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setTransformMode, undo, redo, deleteSelectedEntities, duplicateSelectedEntities,
    selectAll, clearSelection, setShowGrid, showGrid, exportJSON, pendingEntityType,
    isTestPlaying, setTestPlaying
  ]);

  const handleAddEntity = useCallback((type: EntityType) => {
    setPendingEntityType(type);
  }, []);

  const handleEntityPlaced = useCallback(() => {
    setPendingEntityType(null);
  }, []);

  const handleCancelAddEntity = useCallback(() => {
    setPendingEntityType(null);
  }, []);

  const handleTestPlay = useCallback(() => {
    setTestPlaying(!isTestPlaying);
  }, [isTestPlaying, setTestPlaying]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <EditorToolbar
        onAddEntity={handleAddEntity}
        pendingEntityType={pendingEntityType}
        onCancelAddEntity={handleCancelAddEntity}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-80 flex flex-col border-r border-gray-700 bg-gray-900">
          {/* Tab bar */}
          <div className="flex border-b border-gray-700">
            <TabButton
              active={activePanel === 'entities'}
              onClick={() => setActivePanel('entities')}
            >
              Entities
            </TabButton>
            <TabButton
              active={activePanel === 'properties'}
              onClick={() => setActivePanel('properties')}
            >
              Properties
            </TabButton>
            <TabButton
              active={activePanel === 'settings'}
              onClick={() => setActivePanel('settings')}
            >
              Settings
            </TabButton>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'entities' && <EntityList />}
            {activePanel === 'properties' && <PropertyPanel />}
            {activePanel === 'settings' && <LevelSettings />}
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {isTestPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <p className="text-xl mb-4">Test Play Mode</p>
                <p className="text-gray-400 mb-4">Press ESC or click "Stop Test" to return to editor</p>
                <p className="text-sm text-gray-500">(Full test play integration coming soon)</p>
              </div>
            </div>
          ) : (
            <EditorCanvas
              pendingEntityType={pendingEntityType}
              onEntityPlaced={handleEntityPlaced}
            />
          )}

          {/* Pending entity indicator */}
          {pendingEntityType && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 px-4 py-2 rounded shadow-lg">
              Click in the viewport to place entity
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <FileOperationsBar onTestPlay={handleTestPlay} />

      {/* Help modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Help hint */}
      <div className="absolute bottom-14 right-4 text-xs text-gray-500">
        Press ? for keyboard shortcuts
      </div>
    </div>
  );
}

export default LevelEditor;
