import { useCallback, useMemo } from 'react';
import { useEditorStore, ENTITY_LABELS, ENTITY_ICONS } from '../../store/useEditorStore';
import { LevelEntity, EntityType } from '../../types/level.types';

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

interface InputProps {
  label: string;
  tooltip?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 0.1, tooltip }: InputProps & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24 shrink-0" title={tooltip}>{label}</label>
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

function Vector3Input({ label, value, onChange, tooltip }: InputProps & {
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
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

function ColorInput({ label, value, onChange, tooltip }: InputProps & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24 shrink-0" title={tooltip}>{label}</label>
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

function TextInput({ label, value, onChange, placeholder, tooltip }: InputProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24 shrink-0" title={tooltip}>{label}</label>
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

function CheckboxInput({ label, value, onChange, tooltip }: InputProps & {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" title={tooltip}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-gray-700 border-gray-600"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function SelectInput<T extends string>({ label, value, onChange, options, tooltip }: InputProps & {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24 shrink-0" title={tooltip}>{label}</label>
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

// ============================================================================
// ENTITY-SPECIFIC PROPERTY EDITORS
// ============================================================================

interface EntityPropsEditorProps {
  entity: LevelEntity;
  onUpdate: (updates: Partial<LevelEntity>) => void;
}

// Platform properties
function PlatformProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'platform') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color}
        onChange={(color) => onUpdate({ color })}
      />
      <SelectInput
        label="Shape"
        value={entity.shape || 'box'}
        onChange={(shape) => onUpdate({ shape })}
        options={[
          { value: 'box', label: 'Box' },
          { value: 'cylinder', label: 'Cylinder' },
          { value: 'sphere', label: 'Sphere' },
        ]}
      />
      <CheckboxInput
        label="Bouncy"
        value={entity.bouncy || false}
        onChange={(bouncy) => onUpdate({ bouncy })}
      />

      {/* Disappearing settings */}
      <div className="border-t border-gray-700 pt-2 mt-2">
        <CheckboxInput
          label="Disappearing"
          value={!!entity.disappearing}
          onChange={(enabled) => {
            if (enabled) {
              onUpdate({ disappearing: { interval: 4, visibleTime: 3 } });
            } else {
              onUpdate({ disappearing: undefined });
            }
          }}
        />
        {entity.disappearing && (
          <div className="ml-6 mt-2 space-y-2">
            <NumberInput
              label="Interval"
              value={entity.disappearing.interval}
              onChange={(interval) => onUpdate({ disappearing: { ...entity.disappearing!, interval } })}
              min={0.5}
              tooltip="Total cycle time in seconds"
            />
            <NumberInput
              label="Visible Time"
              value={entity.disappearing.visibleTime}
              onChange={(visibleTime) => onUpdate({ disappearing: { ...entity.disappearing!, visibleTime } })}
              min={0.1}
              tooltip="How long the platform is visible"
            />
          </div>
        )}
      </div>

      {/* Moving settings */}
      <div className="border-t border-gray-700 pt-2 mt-2">
        <CheckboxInput
          label="Moving"
          value={!!entity.moving}
          onChange={(enabled) => {
            if (enabled) {
              onUpdate({ moving: { pattern: 'linear', speed: 1, range: [2, 0, 0] } });
            } else {
              onUpdate({ moving: undefined });
            }
          }}
        />
        {entity.moving && (
          <div className="ml-6 mt-2 space-y-2">
            <SelectInput
              label="Pattern"
              value={entity.moving.pattern}
              onChange={(pattern) => onUpdate({ moving: { ...entity.moving!, pattern } })}
              options={[
                { value: 'linear', label: 'Linear' },
                { value: 'circular', label: 'Circular' },
                { value: 'pendulum', label: 'Pendulum' },
              ]}
            />
            <NumberInput
              label="Speed"
              value={entity.moving.speed}
              onChange={(speed) => onUpdate({ moving: { ...entity.moving!, speed } })}
              min={0.1}
            />
            <Vector3Input
              label="Range"
              value={entity.moving.range}
              onChange={(range) => onUpdate({ moving: { ...entity.moving!, range } })}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Coin properties
function CoinProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'coin') return null;

  return (
    <SelectInput
      label="Coin Type"
      value={entity.coinType}
      onChange={(coinType) => onUpdate({ coinType })}
      options={[
        { value: 'speed', label: 'Speed (Gold)' },
        { value: 'gravity', label: 'Gravity (Silver)' },
      ]}
    />
  );
}

// Checkpoint properties
function CheckpointProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'checkpoint') return null;

  return (
    <TextInput
      label="Checkpoint ID"
      value={entity.id}
      onChange={(id) => onUpdate({ id })}
      placeholder="checkpoint_1"
    />
  );
}

// Spike properties
function SpikeProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'spike') return null;

  return (
    <NumberInput
      label="Size"
      value={entity.size || 1}
      onChange={(size) => onUpdate({ size })}
      min={0.1}
      max={5}
    />
  );
}

// Lava properties
function LavaProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'lava') return null;

  return (
    <Vector3Input
      label="Size"
      value={entity.size || [4, 0.3, 4]}
      onChange={(size) => onUpdate({ size })}
    />
  );
}

// Rotating hammer properties
function RotatingHammerProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'rotating_hammer') return null;

  return (
    <>
      <NumberInput
        label="Rotation Speed"
        value={entity.rotationSpeed || 1}
        onChange={(rotationSpeed) => onUpdate({ rotationSpeed })}
        min={0.1}
        max={10}
      />
      <NumberInput
        label="Hammer Length"
        value={entity.hammerLength || 3}
        onChange={(hammerLength) => onUpdate({ hammerLength })}
        min={1}
        max={20}
      />
    </>
  );
}

// Zeus lightning properties
function ZeusLightningProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'zeus_lightning') return null;

  return (
    <>
      <NumberInput
        label="Radius"
        value={entity.radius || 2}
        onChange={(radius) => onUpdate({ radius })}
        min={0.5}
        max={10}
      />
      <NumberInput
        label="Interval"
        value={entity.interval || 5}
        onChange={(interval) => onUpdate({ interval })}
        min={1}
        tooltip="Seconds between strikes"
      />
      <NumberInput
        label="Warning Duration"
        value={entity.warningDuration || 1}
        onChange={(warningDuration) => onUpdate({ warningDuration })}
        min={0.1}
        tooltip="Warning time before strike"
      />
    </>
  );
}

// Vine properties
function VineProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'vine') return null;

  return (
    <>
      <NumberInput
        label="Height"
        value={entity.height || 6}
        onChange={(height) => onUpdate({ height })}
        min={1}
        max={20}
      />
      <NumberInput
        label="Swing Speed"
        value={entity.swingSpeed || 1.2}
        onChange={(swingSpeed) => onUpdate({ swingSpeed })}
        min={0.1}
        max={5}
      />
      <NumberInput
        label="Swing Angle"
        value={entity.swingAngle || 0.8}
        onChange={(swingAngle) => onUpdate({ swingAngle })}
        min={0.1}
        max={1.5}
        step={0.1}
        tooltip="Maximum swing angle in radians"
      />
    </>
  );
}

// Moving platform properties
function MovingPlatformProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'moving_platform') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color}
        onChange={(color) => onUpdate({ color })}
      />
      <SelectInput
        label="Pattern"
        value={entity.pattern}
        onChange={(pattern) => onUpdate({ pattern })}
        options={[
          { value: 'linear', label: 'Linear' },
          { value: 'circular', label: 'Circular' },
        ]}
      />
      <NumberInput
        label="Speed"
        value={entity.speed}
        onChange={(speed) => onUpdate({ speed })}
        min={0.1}
      />
      <Vector3Input
        label="Range"
        value={entity.range}
        onChange={(range) => onUpdate({ range })}
      />
    </>
  );
}

// End goal properties
function EndGoalProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'end_goal') return null;

  return (
    <SelectInput
      label="Model Type"
      value={entity.modelType || 'trophy'}
      onChange={(modelType) => onUpdate({ modelType })}
      options={[
        { value: 'trophy', label: 'Trophy' },
        { value: 'dog_head', label: 'Dog Head' },
        { value: 'portal', label: 'Portal' },
      ]}
    />
  );
}

// Fire jet properties
function FireJetProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'fire_jet') return null;

  return (
    <>
      <NumberInput
        label="Interval"
        value={entity.interval || 3}
        onChange={(interval) => onUpdate({ interval })}
        min={0.5}
        tooltip="Seconds between bursts"
      />
      <NumberInput
        label="Duration"
        value={entity.duration || 1}
        onChange={(duration) => onUpdate({ duration })}
        min={0.1}
        tooltip="How long fire lasts"
      />
      <NumberInput
        label="Height"
        value={entity.height || 4}
        onChange={(height) => onUpdate({ height })}
        min={1}
        max={20}
      />
      <SelectInput
        label="Direction"
        value={entity.direction || 'up'}
        onChange={(direction) => onUpdate({ direction })}
        options={[
          { value: 'up', label: 'Up' },
          { value: 'down', label: 'Down' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'forward', label: 'Forward' },
          { value: 'back', label: 'Back' },
        ]}
      />
    </>
  );
}

// Pendulum blade properties
function PendulumBladeProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'pendulum_blade') return null;

  return (
    <>
      <NumberInput
        label="Length"
        value={entity.length || 4}
        onChange={(length) => onUpdate({ length })}
        min={1}
        max={20}
        tooltip="Arm length"
      />
      <NumberInput
        label="Speed"
        value={entity.speed || 1}
        onChange={(speed) => onUpdate({ speed })}
        min={0.1}
      />
      <NumberInput
        label="Swing Angle"
        value={entity.swingAngle || Math.PI / 3}
        onChange={(swingAngle) => onUpdate({ swingAngle })}
        min={0.1}
        max={Math.PI}
        step={0.1}
      />
    </>
  );
}

// Laser beam properties
function LaserBeamProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'laser_beam') return null;

  return (
    <>
      <NumberInput
        label="Length"
        value={entity.length || 10}
        onChange={(length) => onUpdate({ length })}
        min={1}
        max={50}
      />
      <SelectInput
        label="Orientation"
        value={entity.orientation || 'horizontal'}
        onChange={(orientation) => onUpdate({ orientation })}
        options={[
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ]}
      />
      <CheckboxInput
        label="Sweeping"
        value={entity.sweeping || false}
        onChange={(sweeping) => onUpdate({ sweeping })}
      />
      {entity.sweeping && (
        <NumberInput
          label="Sweep Speed"
          value={entity.speed || 1}
          onChange={(speed) => onUpdate({ speed })}
          min={0.1}
        />
      )}
    </>
  );
}

// Crushing piston properties
function CrushingPistonProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'crushing_piston') return null;

  return (
    <>
      <NumberInput
        label="Height"
        value={entity.height || 5}
        onChange={(height) => onUpdate({ height })}
        min={1}
        max={20}
        tooltip="Distance piston travels"
      />
      <NumberInput
        label="Interval"
        value={entity.interval || 4}
        onChange={(interval) => onUpdate({ interval })}
        min={0.5}
        tooltip="Seconds between crushes"
      />
      <NumberInput
        label="Crush Duration"
        value={entity.crushDuration || 1.5}
        onChange={(crushDuration) => onUpdate({ crushDuration })}
        min={0.1}
      />
    </>
  );
}

// Spinning blade properties
function SpinningBladeProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'spinning_blade') return null;

  return (
    <>
      <NumberInput
        label="Size"
        value={entity.size || 1.5}
        onChange={(size) => onUpdate({ size })}
        min={0.5}
        max={10}
        tooltip="Blade radius"
      />
      <NumberInput
        label="Speed"
        value={entity.speed || 2}
        onChange={(speed) => onUpdate({ speed })}
        min={0.1}
      />
      <CheckboxInput
        label="Moving"
        value={!!entity.moving}
        onChange={(enabled) => {
          if (enabled) {
            onUpdate({ moving: { pattern: 'linear', speed: 1, range: [4, 0, 0] } });
          } else {
            onUpdate({ moving: undefined });
          }
        }}
      />
      {entity.moving && (
        <div className="ml-6 mt-2 space-y-2">
          <SelectInput
            label="Pattern"
            value={entity.moving.pattern}
            onChange={(pattern) => onUpdate({ moving: { ...entity.moving!, pattern } })}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'circular', label: 'Circular' },
            ]}
          />
          <NumberInput
            label="Move Speed"
            value={entity.moving.speed}
            onChange={(speed) => onUpdate({ moving: { ...entity.moving!, speed } })}
            min={0.1}
          />
          <Vector3Input
            label="Range"
            value={entity.moving.range}
            onChange={(range) => onUpdate({ moving: { ...entity.moving!, range } })}
          />
        </div>
      )}
    </>
  );
}

// Moving wall properties
function MovingWallProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'moving_wall') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <NumberInput
        label="Speed"
        value={entity.speed}
        onChange={(speed) => onUpdate({ speed })}
        min={0.1}
      />
      <Vector3Input
        label="Range"
        value={entity.range}
        onChange={(range) => onUpdate({ range })}
      />
    </>
  );
}

// Cannon turret properties
function CannonTurretProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'cannon_turret') return null;

  return (
    <>
      <NumberInput
        label="Interval"
        value={entity.interval || 3}
        onChange={(interval) => onUpdate({ interval })}
        min={0.5}
        tooltip="Seconds between shots"
      />
      <NumberInput
        label="Projectile Speed"
        value={entity.projectileSpeed || 10}
        onChange={(projectileSpeed) => onUpdate({ projectileSpeed })}
        min={1}
      />
      <Vector3Input
        label="Direction"
        value={entity.direction || [1, 0, 0]}
        onChange={(direction) => onUpdate({ direction })}
      />
    </>
  );
}

// Falling icicle properties
function FallingIcicleProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'falling_icicle') return null;

  return (
    <>
      <NumberInput
        label="Trigger Radius"
        value={entity.triggerRadius || 3}
        onChange={(triggerRadius) => onUpdate({ triggerRadius })}
        min={0.5}
        tooltip="How close player must be"
      />
      <NumberInput
        label="Fall Speed"
        value={entity.fallSpeed || 8}
        onChange={(fallSpeed) => onUpdate({ fallSpeed })}
        min={1}
      />
      <NumberInput
        label="Respawn Time"
        value={entity.respawnTime || 5}
        onChange={(respawnTime) => onUpdate({ respawnTime })}
        min={1}
        tooltip="Seconds to respawn"
      />
    </>
  );
}

// Wind tunnel properties
function WindTunnelProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'wind_tunnel') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <Vector3Input
        label="Force"
        value={entity.force}
        onChange={(force) => onUpdate({ force })}
      />
    </>
  );
}

// Rising lava properties
function RisingLavaProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'rising_lava') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <NumberInput
        label="Rise Height"
        value={entity.riseHeight || 5}
        onChange={(riseHeight) => onUpdate({ riseHeight })}
        min={1}
      />
      <NumberInput
        label="Interval"
        value={entity.interval || 8}
        onChange={(interval) => onUpdate({ interval })}
        min={1}
        tooltip="Cycle time in seconds"
      />
      <NumberInput
        label="Rise Duration"
        value={entity.riseDuration || 3}
        onChange={(riseDuration) => onUpdate({ riseDuration })}
        min={0.5}
        tooltip="How long rise takes"
      />
    </>
  );
}

// Dart trap properties
function DartTrapProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'dart_trap') return null;

  return (
    <>
      <NumberInput
        label="Interval"
        value={entity.interval || 2}
        onChange={(interval) => onUpdate({ interval })}
        min={0.5}
        tooltip="Seconds between shots"
      />
      <Vector3Input
        label="Direction"
        value={entity.direction || [1, 0, 0]}
        onChange={(direction) => onUpdate({ direction })}
      />
      <NumberInput
        label="Dart Speed"
        value={entity.dartSpeed || 15}
        onChange={(dartSpeed) => onUpdate({ dartSpeed })}
        min={1}
      />
    </>
  );
}

// Swinging log properties
function SwingingLogProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'swinging_log') return null;

  return (
    <>
      <NumberInput
        label="Length"
        value={entity.length || 5}
        onChange={(length) => onUpdate({ length })}
        min={1}
        tooltip="Chain length"
      />
      <NumberInput
        label="Speed"
        value={entity.speed || 1.2}
        onChange={(speed) => onUpdate({ speed })}
        min={0.1}
      />
      <NumberInput
        label="Swing Angle"
        value={entity.swingAngle || Math.PI / 2}
        onChange={(swingAngle) => onUpdate({ swingAngle })}
        min={0.1}
        max={Math.PI}
        step={0.1}
      />
      <NumberInput
        label="Log Size"
        value={entity.logSize || 0.8}
        onChange={(logSize) => onUpdate({ logSize })}
        min={0.2}
        max={3}
        tooltip="Log radius"
      />
    </>
  );
}

// Power-up properties
function PowerUpProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'power_up') return null;

  return (
    <>
      <SelectInput
        label="Type"
        value={entity.powerUpType}
        onChange={(powerUpType) => onUpdate({ powerUpType })}
        options={[
          { value: 'speed_boost', label: 'Speed Boost' },
          { value: 'shield', label: 'Shield' },
          { value: 'double_jump', label: 'Double Jump' },
          { value: 'invincibility', label: 'Invincibility' },
          { value: 'magnet', label: 'Magnet' },
        ]}
      />
      <NumberInput
        label="Duration"
        value={entity.duration || 10}
        onChange={(duration) => onUpdate({ duration })}
        min={1}
        tooltip="Duration in seconds"
      />
    </>
  );
}

// Animal part properties
function AnimalPartProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'animal_part') return null;

  return (
    <TextInput
      label="Part ID"
      value={entity.partId}
      onChange={(partId) => onUpdate({ partId })}
      placeholder="bunny_legs"
      tooltip="ID from animalParts.ts"
    />
  );
}

// Switch properties
function SwitchProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'switch') return null;

  return (
    <>
      <TextInput
        label="Target ID"
        value={entity.targetId}
        onChange={(targetId) => onUpdate({ targetId })}
        placeholder="door_1"
        tooltip="ID of door/platform to control"
      />
      <SelectInput
        label="Type"
        value={entity.switchType || 'button'}
        onChange={(switchType) => onUpdate({ switchType })}
        options={[
          { value: 'button', label: 'Button' },
          { value: 'lever', label: 'Lever' },
          { value: 'timed', label: 'Timed' },
        ]}
      />
      {entity.switchType === 'timed' && (
        <NumberInput
          label="Duration"
          value={entity.duration || 5}
          onChange={(duration) => onUpdate({ duration })}
          min={1}
          tooltip="Duration in seconds"
        />
      )}
    </>
  );
}

// Door properties
function DoorProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'door') return null;

  return (
    <>
      <TextInput
        label="ID"
        value={entity.id}
        onChange={(id) => onUpdate({ id })}
        placeholder="door_1"
        tooltip="Required for switch targeting"
      />
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color || '#8B4513'}
        onChange={(color) => onUpdate({ color })}
      />
      <CheckboxInput
        label="Starts Open"
        value={entity.startsOpen || false}
        onChange={(startsOpen) => onUpdate({ startsOpen })}
      />
    </>
  );
}

// Pressure plate properties
function PressurePlateProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'pressure_plate') return null;

  return (
    <>
      <TextInput
        label="Target ID"
        value={entity.targetId}
        onChange={(targetId) => onUpdate({ targetId })}
        placeholder="door_1"
      />
      <Vector3Input
        label="Size"
        value={entity.size || [2, 0.2, 2]}
        onChange={(size) => onUpdate({ size })}
      />
      <CheckboxInput
        label="Requires Weight"
        value={entity.requiresWeight || false}
        onChange={(requiresWeight) => onUpdate({ requiresWeight })}
        tooltip="Stay pressed only while player is on it"
      />
    </>
  );
}

// Climbable wall properties
function ClimbableWallProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'climbable_wall') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color || '#654321'}
        onChange={(color) => onUpdate({ color })}
      />
      <NumberInput
        label="Climb Speed"
        value={entity.climbSpeed || 5}
        onChange={(climbSpeed) => onUpdate({ climbSpeed })}
        min={1}
      />
    </>
  );
}

// Low obstacle properties
function LowObstacleProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'low_obstacle') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color || '#DC143C'}
        onChange={(color) => onUpdate({ color })}
      />
    </>
  );
}

// Boss encounter properties
function BossEncounterProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'boss_encounter') return null;

  return (
    <>
      <TextInput
        label="ID"
        value={entity.id}
        onChange={(id) => onUpdate({ id })}
        placeholder="boss_1"
      />
      <SelectInput
        label="Boss Type"
        value={entity.bossType}
        onChange={(bossType) => onUpdate({ bossType })}
        options={[
          { value: 'dragon', label: 'Dragon' },
          { value: 'golem', label: 'Golem' },
          { value: 'wizard', label: 'Wizard' },
          { value: 'kraken', label: 'Kraken' },
        ]}
      />
      <Vector3Input
        label="Arena Size"
        value={entity.arenaSize || [30, 20, 30]}
        onChange={(arenaSize) => onUpdate({ arenaSize })}
      />
    </>
  );
}

// Laser grid properties
function LaserGridProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'laser_grid') return null;

  return (
    <>
      <NumberInput
        label="Rows"
        value={entity.rows || 3}
        onChange={(rows) => onUpdate({ rows })}
        min={1}
        max={10}
        step={1}
      />
      <NumberInput
        label="Columns"
        value={entity.cols || 3}
        onChange={(cols) => onUpdate({ cols })}
        min={1}
        max={10}
        step={1}
      />
      <NumberInput
        label="Spacing"
        value={entity.spacing || 2}
        onChange={(spacing) => onUpdate({ spacing })}
        min={0.5}
      />
      <NumberInput
        label="Beat Duration"
        value={entity.beatDuration || 1}
        onChange={(beatDuration) => onUpdate({ beatDuration })}
        min={0.1}
        tooltip="Seconds per beat"
      />
      <ColorInput
        label="Laser Color"
        value={entity.laserColor || '#FF0000'}
        onChange={(laserColor) => onUpdate({ laserColor })}
      />
      <SelectInput
        label="Orientation"
        value={entity.orientation || 'horizontal'}
        onChange={(orientation) => onUpdate({ orientation })}
        options={[
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ]}
      />
    </>
  );
}

// Crumbling platform properties
function CrumblingPlatformProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'crumbling_platform') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size || [4, 0.5, 4]}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color || '#A0522D'}
        onChange={(color) => onUpdate({ color })}
      />
      <NumberInput
        label="Crumble Delay"
        value={entity.crumbleDelay || 0.8}
        onChange={(crumbleDelay) => onUpdate({ crumbleDelay })}
        min={0.1}
        tooltip="Seconds before crumbling"
      />
      <NumberInput
        label="Respawn Time"
        value={entity.respawnTime || 5}
        onChange={(respawnTime) => onUpdate({ respawnTime })}
        min={1}
        tooltip="Seconds to respawn"
      />
    </>
  );
}

// Bounce pad properties
function BouncePadProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'bounce_pad') return null;

  return (
    <>
      <Vector3Input
        label="Launch Direction"
        value={entity.launchDirection || [0, 1, 0]}
        onChange={(launchDirection) => onUpdate({ launchDirection })}
      />
      <NumberInput
        label="Launch Power"
        value={entity.launchPower || 15}
        onChange={(launchPower) => onUpdate({ launchPower })}
        min={1}
        max={50}
      />
      <Vector3Input
        label="Size"
        value={entity.size || [2, 0.3, 2]}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color || '#FFD700'}
        onChange={(color) => onUpdate({ color })}
      />
    </>
  );
}

// Gravity zone properties
function GravityZoneProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'gravity_zone') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <NumberInput
        label="Gravity Multiplier"
        value={entity.gravityMultiplier || 0.3}
        onChange={(gravityMultiplier) => onUpdate({ gravityMultiplier })}
        min={-2}
        max={2}
        step={0.1}
        tooltip="0.3 = low, -1 = reversed, 0 = zero-g"
      />
      <ColorInput
        label="Color"
        value={entity.color || '#8B00FF'}
        onChange={(color) => onUpdate({ color })}
      />
    </>
  );
}

// Secret area properties
function SecretAreaProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'secret_area') return null;

  return (
    <>
      <TextInput
        label="ID"
        value={entity.id}
        onChange={(id) => onUpdate({ id })}
        placeholder="secret_1"
      />
      <Vector3Input
        label="Trigger Size"
        value={entity.triggerZone?.size || [6, 4, 6]}
        onChange={(size) => onUpdate({ triggerZone: { size } })}
      />
      <TextInput
        label="Message"
        value={entity.secretMessage || ''}
        onChange={(secretMessage) => onUpdate({ secretMessage })}
        placeholder="Secret Found!"
      />
      <div className="text-xs text-gray-500 mt-2">
        Note: Revealed entities must be edited in JSON
      </div>
    </>
  );
}

// Fake wall properties
function FakeWallProps({ entity, onUpdate }: EntityPropsEditorProps) {
  if (entity.type !== 'fake_wall') return null;

  return (
    <>
      <Vector3Input
        label="Size"
        value={entity.size}
        onChange={(size) => onUpdate({ size })}
      />
      <ColorInput
        label="Color"
        value={entity.color}
        onChange={(color) => onUpdate({ color })}
      />
      <NumberInput
        label="Reveal Radius"
        value={entity.revealRadius || 3}
        onChange={(revealRadius) => onUpdate({ revealRadius })}
        min={0.5}
        tooltip="Distance at which wall starts fading"
      />
      <TextInput
        label="Linked Secret ID"
        value={entity.linkedSecretId || ''}
        onChange={(linkedSecretId) => onUpdate({ linkedSecretId })}
        placeholder="secret_1"
      />
    </>
  );
}

// ============================================================================
// MAIN PROPERTY PANEL
// ============================================================================

export function PropertyPanel() {
  const selectedEntity = useEditorStore(state => state.getSelectedEntity());
  const selectedEntityIds = useEditorStore(state => state.selectedEntityIds);
  const updateEntity = useEditorStore(state => state.updateEntity);

  const handleUpdate = useCallback((updates: Partial<LevelEntity>) => {
    if (selectedEntity?.id) {
      updateEntity(selectedEntity.id, updates);
    }
  }, [selectedEntity?.id, updateEntity]);

  if (!selectedEntity) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">No entity selected</p>
        <p className="text-xs">Click an entity in the viewport or list to edit its properties</p>
      </div>
    );
  }

  if (selectedEntityIds.length > 1) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">{selectedEntityIds.length} entities selected</p>
        <p className="text-xs">Select a single entity to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      {/* Entity header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
        <span className="text-xl">{ENTITY_ICONS[selectedEntity.type]}</span>
        <div>
          <div className="font-bold text-sm">{ENTITY_LABELS[selectedEntity.type]}</div>
          <div className="text-xs text-gray-500">{selectedEntity.id}</div>
        </div>
      </div>

      {/* Common: ID */}
      <TextInput
        label="ID"
        value={selectedEntity.id || ''}
        onChange={(id) => handleUpdate({ id })}
        placeholder="entity_id"
      />

      {/* Common: Position */}
      <Vector3Input
        label="Position"
        value={selectedEntity.position}
        onChange={(position) => handleUpdate({ position })}
      />

      {/* Entity-specific properties */}
      <div className="border-t border-gray-700 pt-3 space-y-3">
        <PlatformProps entity={selectedEntity} onUpdate={handleUpdate} />
        <CoinProps entity={selectedEntity} onUpdate={handleUpdate} />
        <CheckpointProps entity={selectedEntity} onUpdate={handleUpdate} />
        <SpikeProps entity={selectedEntity} onUpdate={handleUpdate} />
        <LavaProps entity={selectedEntity} onUpdate={handleUpdate} />
        <RotatingHammerProps entity={selectedEntity} onUpdate={handleUpdate} />
        <ZeusLightningProps entity={selectedEntity} onUpdate={handleUpdate} />
        <VineProps entity={selectedEntity} onUpdate={handleUpdate} />
        <MovingPlatformProps entity={selectedEntity} onUpdate={handleUpdate} />
        <EndGoalProps entity={selectedEntity} onUpdate={handleUpdate} />
        <FireJetProps entity={selectedEntity} onUpdate={handleUpdate} />
        <PendulumBladeProps entity={selectedEntity} onUpdate={handleUpdate} />
        <LaserBeamProps entity={selectedEntity} onUpdate={handleUpdate} />
        <CrushingPistonProps entity={selectedEntity} onUpdate={handleUpdate} />
        <SpinningBladeProps entity={selectedEntity} onUpdate={handleUpdate} />
        <MovingWallProps entity={selectedEntity} onUpdate={handleUpdate} />
        <CannonTurretProps entity={selectedEntity} onUpdate={handleUpdate} />
        <FallingIcicleProps entity={selectedEntity} onUpdate={handleUpdate} />
        <WindTunnelProps entity={selectedEntity} onUpdate={handleUpdate} />
        <RisingLavaProps entity={selectedEntity} onUpdate={handleUpdate} />
        <DartTrapProps entity={selectedEntity} onUpdate={handleUpdate} />
        <SwingingLogProps entity={selectedEntity} onUpdate={handleUpdate} />
        <PowerUpProps entity={selectedEntity} onUpdate={handleUpdate} />
        <AnimalPartProps entity={selectedEntity} onUpdate={handleUpdate} />
        <SwitchProps entity={selectedEntity} onUpdate={handleUpdate} />
        <DoorProps entity={selectedEntity} onUpdate={handleUpdate} />
        <PressurePlateProps entity={selectedEntity} onUpdate={handleUpdate} />
        <ClimbableWallProps entity={selectedEntity} onUpdate={handleUpdate} />
        <LowObstacleProps entity={selectedEntity} onUpdate={handleUpdate} />
        <BossEncounterProps entity={selectedEntity} onUpdate={handleUpdate} />
        <LaserGridProps entity={selectedEntity} onUpdate={handleUpdate} />
        <CrumblingPlatformProps entity={selectedEntity} onUpdate={handleUpdate} />
        <BouncePadProps entity={selectedEntity} onUpdate={handleUpdate} />
        <GravityZoneProps entity={selectedEntity} onUpdate={handleUpdate} />
        <SecretAreaProps entity={selectedEntity} onUpdate={handleUpdate} />
        <FakeWallProps entity={selectedEntity} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
