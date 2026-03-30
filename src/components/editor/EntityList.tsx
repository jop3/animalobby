import { useState, useMemo } from 'react';
import { useEditorStore, ENTITY_ICONS, ENTITY_LABELS } from '../../store/useEditorStore';
import { EntityType } from '../../types/level.types';

export function EntityList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');

  const levelData = useEditorStore(state => state.levelData);
  const selectedEntityIds = useEditorStore(state => state.selectedEntityIds);
  const selectEntity = useEditorStore(state => state.selectEntity);
  const deleteEntity = useEditorStore(state => state.deleteEntity);
  const setActivePanel = useEditorStore(state => state.setActivePanel);

  // Get unique entity types for filter
  const entityTypes = useMemo(() => {
    const types = new Set(levelData.entities.map(e => e.type));
    return Array.from(types).sort();
  }, [levelData.entities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    return levelData.entities.filter(entity => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const entityId = entity.id?.toLowerCase() || '';
        const entityLabel = ENTITY_LABELS[entity.type].toLowerCase();
        if (!entityId.includes(searchLower) && !entityLabel.includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && entity.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [levelData.entities, searchQuery, filterType]);

  const handleEntityClick = (entityId: string, event: React.MouseEvent) => {
    selectEntity(entityId, event.shiftKey);
  };

  const handleEntityDoubleClick = (entityId: string) => {
    selectEntity(entityId, false);
    setActivePanel('properties');
  };

  const handleDelete = (entityId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteEntity(entityId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <h3 className="font-bold text-sm mb-2">Entities ({levelData.entities.length})</h3>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entities..."
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm mb-2"
        />

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as EntityType | 'all')}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
        >
          <option value="all">All Types</option>
          {entityTypes.map(type => (
            <option key={type} value={type}>
              {ENTITY_ICONS[type]} {ENTITY_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Entity list */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntities.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            {searchQuery || filterType !== 'all'
              ? 'No entities match your filter'
              : 'No entities in level'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredEntities.map((entity, index) => {
              const entityId = entity.id || `entity_${index}`;
              const isSelected = selectedEntityIds.includes(entityId);

              return (
                <li
                  key={entityId}
                  onClick={(e) => handleEntityClick(entityId, e)}
                  onDoubleClick={() => handleEntityDoubleClick(entityId)}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 group transition-colors ${
                    isSelected
                      ? 'bg-blue-600/30 border-l-2 border-blue-500'
                      : 'hover:bg-gray-800 border-l-2 border-transparent'
                  }`}
                >
                  {/* Icon */}
                  <span className="w-5 text-center text-sm opacity-70">
                    {ENTITY_ICONS[entity.type]}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {entity.id || `(unnamed ${entity.type})`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {ENTITY_LABELS[entity.type]} • [{entity.position.map(p => p.toFixed(1)).join(', ')}]
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(entityId, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                    title="Delete entity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer with stats */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-800 text-xs text-gray-500">
        {filteredEntities.length !== levelData.entities.length && (
          <span>Showing {filteredEntities.length} of {levelData.entities.length} • </span>
        )}
        {selectedEntityIds.length > 0 && (
          <span>{selectedEntityIds.length} selected</span>
        )}
      </div>
    </div>
  );
}
