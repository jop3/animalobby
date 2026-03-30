import { useEditorStore } from '../../store/useEditorStore';

// Input components (reusing similar pattern from PropertyPanel)
function NumberInput({ label, value, onChange, min, max, step = 0.1, tooltip }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-28 shrink-0" title={tooltip}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
      />
    </div>
  );
}

function Vector3Input({ label, value, onChange, tooltip }: {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
  tooltip?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400" title={tooltip}>{label}</label>
      <div className="flex gap-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <div key={axis} className="flex-1">
            <div className="text-[10px] text-gray-500 mb-0.5">{axis}</div>
            <input
              type="number"
              value={value[i]}
              onChange={(e) => {
                const newValue = [...value] as [number, number, number];
                newValue[i] = parseFloat(e.target.value) || 0;
                onChange(newValue);
              }}
              step={0.1}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange, tooltip }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-28 shrink-0" title={tooltip}>{label}</label>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
        />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, tooltip }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-28 shrink-0" title={tooltip}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
      />
    </div>
  );
}

function TextAreaInput({ label, value, onChange, placeholder, rows = 3 }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm resize-none"
      />
    </div>
  );
}

function SelectInput<T extends string | number>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-28 shrink-0">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-2 border-t border-gray-700 first:border-t-0 first:pt-0">
      <h4 className="text-xs font-bold text-gray-400 uppercase">{title}</h4>
    </div>
  );
}

export function LevelSettings() {
  const levelData = useEditorStore(state => state.levelData);
  const updateLevelMetadata = useEditorStore(state => state.updateLevelMetadata);
  const updateLevelTheme = useEditorStore(state => state.updateLevelTheme);
  const updateLevelPhysics = useEditorStore(state => state.updateLevelPhysics);
  const setSpawnPoint = useEditorStore(state => state.setSpawnPoint);

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      {/* Metadata Section */}
      <SectionHeader title="Metadata" />
      <TextInput
        label="Level ID"
        value={levelData.id}
        onChange={(id) => updateLevelMetadata({ id })}
        placeholder="my_level"
        tooltip="Unique identifier (no spaces)"
      />
      <TextInput
        label="Name"
        value={levelData.name}
        onChange={(name) => updateLevelMetadata({ name })}
        placeholder="My Level"
      />
      <TextAreaInput
        label="Description"
        value={levelData.description || ''}
        onChange={(description) => updateLevelMetadata({ description })}
        placeholder="A challenging platforming level..."
      />
      <SelectInput
        label="Difficulty"
        value={levelData.difficulty}
        onChange={(difficulty) => updateLevelMetadata({ difficulty: difficulty as 1 | 2 | 3 | 4 | 5 })}
        options={[
          { value: 1, label: '1 - Very Easy' },
          { value: 2, label: '2 - Easy' },
          { value: 3, label: '3 - Medium' },
          { value: 4, label: '4 - Hard' },
          { value: 5, label: '5 - Very Hard' },
        ]}
      />

      {/* Theme Section */}
      <SectionHeader title="Theme" />
      <ColorInput
        label="Sky Color"
        value={levelData.theme.skyColor}
        onChange={(skyColor) => updateLevelTheme({ skyColor })}
      />
      <ColorInput
        label="Ambient Light"
        value={levelData.theme.ambientColor || '#B3D9FF'}
        onChange={(ambientColor) => updateLevelTheme({ ambientColor })}
      />
      <ColorInput
        label="Fog Color"
        value={levelData.theme.fogColor || '#FFFFFF'}
        onChange={(fogColor) => updateLevelTheme({ fogColor })}
      />
      <NumberInput
        label="Fog Density"
        value={levelData.theme.fogDensity || 0}
        onChange={(fogDensity) => updateLevelTheme({ fogDensity })}
        min={0}
        max={1}
        step={0.01}
        tooltip="0 = no fog, 1 = maximum fog"
      />

      {/* Physics Section */}
      <SectionHeader title="Physics" />
      <NumberInput
        label="Gravity"
        value={levelData.physics?.gravity || -20}
        onChange={(gravity) => updateLevelPhysics({ gravity })}
        min={-50}
        max={50}
        step={1}
        tooltip="Default is -20"
      />
      <Vector3Input
        label="Wind Force"
        value={levelData.physics?.windForce || [0, 0, 0]}
        onChange={(windForce) => updateLevelPhysics({ windForce })}
        tooltip="Global wind direction/strength"
      />
      <NumberInput
        label="Friction"
        value={levelData.physics?.friction || 1}
        onChange={(friction) => updateLevelPhysics({ friction })}
        min={0}
        max={2}
        step={0.1}
        tooltip="Global friction multiplier (default 1)"
      />

      {/* Spawn Point Section */}
      <SectionHeader title="Spawn Point" />
      <Vector3Input
        label="Position"
        value={levelData.spawnPoint}
        onChange={setSpawnPoint}
        tooltip="Where player starts"
      />

      {/* Stats Section */}
      <SectionHeader title="Level Stats" />
      <div className="text-sm text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>Total Entities:</span>
          <span className="text-white">{levelData.entities.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Platforms:</span>
          <span className="text-white">
            {levelData.entities.filter(e => e.type === 'platform' || e.type === 'moving_platform').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Hazards:</span>
          <span className="text-white">
            {levelData.entities.filter(e =>
              ['spike', 'lava', 'rotating_hammer', 'zeus_lightning', 'fire_jet',
               'pendulum_blade', 'laser_beam', 'crushing_piston', 'spinning_blade',
               'moving_wall', 'cannon_turret', 'falling_icicle', 'rising_lava',
               'dart_trap', 'swinging_log', 'laser_grid'].includes(e.type)
            ).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Coins:</span>
          <span className="text-white">
            {levelData.entities.filter(e => e.type === 'coin').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Checkpoints:</span>
          <span className="text-white">
            {levelData.entities.filter(e => e.type === 'checkpoint').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Secrets:</span>
          <span className="text-white">
            {levelData.entities.filter(e => e.type === 'secret_area').length}
          </span>
        </div>
      </div>

      {/* JSON Preview */}
      <SectionHeader title="JSON Preview" />
      <div className="text-xs text-gray-500 mb-2">
        Use Export to download the full level file
      </div>
      <pre className="text-[10px] text-gray-400 bg-gray-800 p-2 rounded overflow-x-auto max-h-40">
        {JSON.stringify({
          id: levelData.id,
          name: levelData.name,
          difficulty: levelData.difficulty,
          theme: levelData.theme,
          physics: levelData.physics,
          spawnPoint: levelData.spawnPoint,
          entities: `[...${levelData.entities.length} entities]`,
        }, null, 2)}
      </pre>
    </div>
  );
}
