import { COAT_SWATCHES, MOOD_ASKING } from '../config/simulation'
import { useActionTimer, useSimulation } from '../hooks/useSimulation'
import { getMood, lowestNeed } from '../lib/mood'
import { formatGameClock } from '../lib/time'
import { useGameStore } from '../store/gameStore'
import type { ActionType, NeedKey } from '../types'

const NEED_LABELS: Record<NeedKey, string> = {
  hunger: 'Hunger',
  thirst: 'Thirst',
  energy: 'Energy',
  fun: 'Fun',
  cleanliness: 'Clean',
  affection: 'Love',
}

const ACTION_META: Record<ActionType, { label: string; icon: string }> = {
  feed: { label: 'Feed', icon: '🍖' },
  water: { label: 'Water', icon: '💧' },
  play: { label: 'Play', icon: '🎾' },
  pet: { label: 'Pet', icon: '🤚' },
  bathe: { label: 'Bathe', icon: '🛁' },
  sleep: { label: 'Sleep', icon: '😴' },
}

const ASKING_ICONS: Record<NeedKey, string> = {
  hunger: '🍖',
  thirst: '💧',
  energy: '😴',
  fun: '🎾',
  cleanliness: '🛁',
  affection: '🤚',
}

function needBarClass(value: number): string {
  if (value < MOOD_ASKING) return 'critical'
  if (value < 50) return 'low'
  return 'ok'
}

export function Hud() {
  useSimulation()
  useActionTimer()

  const dog = useGameStore((s) => s.dog)
  const needs = useGameStore((s) => s.needs)
  const gameMinute = useGameStore((s) => s.gameMinute)
  const happyDays = useGameStore((s) => s.happyDays)
  const currentAction = useGameStore((s) => s.currentAction)
  const isSleeping = useGameStore((s) => s.isSleeping)
  const dogPanelOpen = useGameStore((s) => s.dogPanelOpen)
  const setDogPanelOpen = useGameStore((s) => s.setDogPanelOpen)
  const startAction = useGameStore((s) => s.startAction)
  const wakeDog = useGameStore((s) => s.wakeDog)
  const renameDog = useGameStore((s) => s.renameDog)
  const setCoatColor = useGameStore((s) => s.setCoatColor)
  const setDogSize = useGameStore((s) => s.setDogSize)

  const mood = getMood(needs)
  const urgent = lowestNeed(needs)
  const showAsking = needs[urgent] < MOOD_ASKING && !currentAction

  const onAction = (action: ActionType) => {
    if (action === 'sleep' && isSleeping) {
      wakeDog()
      return
    }
    startAction(action)
  }

  return (
    <div className="ui-root">
      <header className="top-bar">
        <button type="button" className="dog-name-btn" onClick={() => setDogPanelOpen(true)}>
          {dog.name}
        </button>
        <span className="clock">{formatGameClock(gameMinute)}</span>
        <span className={`mood-chip mood-${mood}`}>{mood}</span>
        {happyDays > 0 && <span className="happy-day">★ Happy days: {happyDays}</span>}
      </header>

      <div className="need-panel">
        {(Object.keys(NEED_LABELS) as NeedKey[]).map((key) => (
          <div key={key} className="need-row">
            <span>{NEED_LABELS[key]}</span>
            <div className="need-bar">
              <div
                className={`need-fill ${needBarClass(needs[key])}`}
                style={{ width: `${needs[key]}%` }}
              />
            </div>
            <span>{Math.round(needs[key])}</span>
          </div>
        ))}
      </div>

      {showAsking && (
        <div className="asking-badge" aria-live="polite">
          Needs {ASKING_ICONS[urgent]} {NEED_LABELS[urgent]}
        </div>
      )}

      <div className="action-row">
        {(Object.keys(ACTION_META) as ActionType[]).map((action) => (
          <button
            key={action}
            type="button"
            className="action-btn"
            disabled={!!currentAction}
            onClick={() => onAction(action)}
          >
            <span className="icon">{ACTION_META[action].icon}</span>
            {action === 'sleep' && isSleeping ? 'Wake' : ACTION_META[action].label}
          </button>
        ))}
      </div>

      {dogPanelOpen && (
        <>
          <button
            type="button"
            className="backdrop"
            aria-label="Close panel"
            onClick={() => setDogPanelOpen(false)}
          />
          <DogPanel
            name={dog.name}
            coatColor={dog.coatColor}
            size={dog.size}
            onClose={() => setDogPanelOpen(false)}
            onRename={renameDog}
            onCoat={setCoatColor}
            onSize={setDogSize}
          />
        </>
      )}
    </div>
  )
}

function DogPanel({
  name,
  coatColor,
  size,
  onClose,
  onRename,
  onCoat,
  onSize,
}: {
  name: string
  coatColor: string
  size: 'small' | 'medium' | 'large'
  onClose: () => void
  onRename: (n: string) => void
  onCoat: (c: string) => void
  onSize: (s: 'small' | 'medium' | 'large') => void
}) {
  return (
    <div className="dog-panel" role="dialog" aria-labelledby="dog-panel-title">
      <h2 id="dog-panel-title">Your dog</h2>
      <label htmlFor="dog-name">Name</label>
      <input
        id="dog-name"
        type="text"
        defaultValue={name}
        onBlur={(e) => onRename(e.target.value)}
      />
      <label>Coat color</label>
      <div className="swatch-row">
        {COAT_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            className={`swatch ${coatColor === color ? 'selected' : ''}`}
            style={{ background: color }}
            aria-label={`Coat ${color}`}
            onClick={() => onCoat(color)}
          />
        ))}
      </div>
      <label>Size</label>
      <div className="size-row">
        {(['small', 'medium', 'large'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={size === s ? 'selected' : ''}
            onClick={() => onSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="panel-actions">
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
