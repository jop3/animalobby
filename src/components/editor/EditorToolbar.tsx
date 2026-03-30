import { useState, useRef } from 'react';
import { useEditorStore, ENTITY_CATEGORIES, ENTITY_ICONS, ENTITY_LABELS, TransformMode } from '../../store/useEditorStore';
import { EntityType } from '../../types/level.types';

interface EditorToolbarProps {
  onAddEntity: (type: EntityType) => void;
  pendingEntityType: EntityType | null;
  onCancelAddEntity: () => void;
}

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  environment: 'Environment',
  hazards: 'Hazards',
  collectibles: 'Collectibles',
  progression: 'Progression',
  interactive: 'Interactive',
};

// Entity type dropdown
function AddEntityDropdown({ onSelect, isOpen, onClose }: {
  onSelect: (type: EntityType) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[200px] max-h-[400px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {Object.entries(ENTITY_CATEGORIES).map(([category, types]) => (
        <div key={category} className="border-b border-gray-700 last:border-b-0">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-900">
            {CATEGORY_LABELS[category]}
          </div>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type as EntityType);
                onClose();
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-2 text-sm"
            >
              <span className="w-5 text-center">{ENTITY_ICONS[type as EntityType]}</span>
              <span>{ENTITY_LABELS[type as EntityType]}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// Transform mode button
function TransformModeButton({ mode, currentMode, onClick, label, shortcut }: {
  mode: TransformMode;
  currentMode: TransformMode;
  onClick: () => void;
  label: string;
  shortcut: string;
}) {
  const isActive = mode === currentMode;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      title={`${label} (${shortcut})`}
    >
      {label}
    </button>
  );
}

export function EditorToolbar({ onAddEntity, pendingEntityType, onCancelAddEntity }: EditorToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const transformMode = useEditorStore(state => state.transformMode);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const snapEnabled = useEditorStore(state => state.snapEnabled);
  const setSnapEnabled = useEditorStore(state => state.setSnapEnabled);
  const snapSize = useEditorStore(state => state.snapSize);
  const setSnapSize = useEditorStore(state => state.setSnapSize);
  const showGrid = useEditorStore(state => state.showGrid);
  const setShowGrid = useEditorStore(state => state.setShowGrid);
  const showWireframe = useEditorStore(state => state.showWireframe);
  const setShowWireframe = useEditorStore(state => state.setShowWireframe);
  const showBounds = useEditorStore(state => state.showBounds);
  const setShowBounds = useEditorStore(state => state.setShowBounds);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const undoStack = useEditorStore(state => state.undoStack);
  const redoStack = useEditorStore(state => state.redoStack);
  const deleteSelectedEntities = useEditorStore(state => state.deleteSelectedEntities);
  const duplicateSelectedEntities = useEditorStore(state => state.duplicateSelectedEntities);
  const selectedEntityIds = useEditorStore(state => state.selectedEntityIds);

  const hasSelection = selectedEntityIds.length > 0;

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center gap-4 flex-wrap">
      {/* Add Entity */}
      <div className="relative" ref={dropdownRef}>
        {pendingEntityType ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-400">
              Click to place: {ENTITY_LABELS[pendingEntityType]}
            </span>
            <button
              onClick={onCancelAddEntity}
              className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded font-medium text-sm flex items-center gap-2"
          >
            <span>+ Add Entity</span>
          </button>
        )}
        <AddEntityDropdown
          isOpen={isDropdownOpen && !pendingEntityType}
          onSelect={onAddEntity}
          onClose={() => setIsDropdownOpen(false)}
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Transform Mode */}
      <div className="flex items-center gap-1">
        <TransformModeButton
          mode="translate"
          currentMode={transformMode}
          onClick={() => setTransformMode('translate')}
          label="Move"
          shortcut="W"
        />
        <TransformModeButton
          mode="rotate"
          currentMode={transformMode}
          onClick={() => setTransformMode('rotate')}
          label="Rotate"
          shortcut="E"
        />
        <TransformModeButton
          mode="scale"
          currentMode={transformMode}
          onClick={() => setTransformMode('scale')}
          label="Scale"
          shortcut="R"
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Snapping */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <span>Snap</span>
        </label>
        {snapEnabled && (
          <input
            type="number"
            value={snapSize}
            onChange={(e) => setSnapSize(parseFloat(e.target.value) || 0.5)}
            min={0.1}
            max={10}
            step={0.1}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
            title="Snap size"
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* View Options */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer" title="Toggle grid (G)">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <span>Grid</span>
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showWireframe}
            onChange={(e) => setShowWireframe(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <span>Wireframe</span>
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showBounds}
            onChange={(e) => setShowBounds(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <span>Bounds</span>
        </label>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Edit Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Selection Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={duplicateSelectedEntities}
          disabled={!hasSelection}
          className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          title="Duplicate (Ctrl+D)"
        >
          Duplicate
        </button>
        <button
          onClick={deleteSelectedEntities}
          disabled={!hasSelection}
          className="px-2 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          title="Delete (Delete)"
        >
          Delete
        </button>
      </div>

      {/* Selection info */}
      {hasSelection && (
        <>
          <div className="h-6 w-px bg-gray-700" />
          <span className="text-sm text-gray-400">
            {selectedEntityIds.length} selected
          </span>
        </>
      )}
    </div>
  );
}
