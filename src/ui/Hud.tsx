import { useEffect, useState } from 'react'
import { ACTION_CONFIG, COAT_SWATCHES, MOOD_ASKING } from '../config/simulation'
import { useActionTimer, useSimulation } from '../hooks/useSimulation'
import { getMood, lowestNeed } from '../lib/mood'
import { formatGameClock } from '../lib/time'
import { MAX_QUEUED, useGameStore, type QueuedAction } from '../store/gameStore'
import type { ActionType, NeedKey } from '../types'
import { ACTION_META } from './actionMeta'
import { holdInteraction, hideInteractionSoon } from '../scene/PropClickable'

const NEED_LABELS: Record<NeedKey, string> = {
  hunger: 'Hunger',
  thirst: 'Thirst',
  energy: 'Energy',
  fun: 'Fun',
  cleanliness: 'Clean',
  affection: 'Love',
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
  const actionQueue = useGameStore((s) => s.actionQueue)
  const actionEndsAt = useGameStore((s) => s.actionEndsAt)
  const cancelCurrent = useGameStore((s) => s.cancelCurrent)
  const cancelQueued = useGameStore((s) => s.cancelQueued)
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
  const queueFull = !!currentAction && actionQueue.length >= MAX_QUEUED
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
      <InteractionMenu />
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

      <div className="bottom-dock">
      {(currentAction || actionQueue.length > 0) && (
        <TaskQueue
          currentAction={currentAction}
          actionEndsAt={actionEndsAt}
          queue={actionQueue}
          onCancelCurrent={cancelCurrent}
          onCancelQueued={cancelQueued}
        />
      )}

      <div className="action-row">
        {(Object.keys(ACTION_META) as ActionType[]).map((action) => (
          <button
            key={action}
            type="button"
            className="action-btn"
            disabled={queueFull}
            onClick={() => onAction(action)}
          >
            <span className="icon">{ACTION_META[action].icon}</span>
            {action === 'sleep' && isSleeping ? 'Wake' : ACTION_META[action].label}
          </button>
        ))}
      </div>
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

function TaskQueue({
  currentAction,
  actionEndsAt,
  queue,
  onCancelCurrent,
  onCancelQueued,
}: {
  currentAction: ActionType | null
  actionEndsAt: number | null
  queue: QueuedAction[]
  onCancelCurrent: () => void
  onCancelQueued: (id: string) => void
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!currentAction || actionEndsAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [currentAction, actionEndsAt])

  return (
    <ol className="task-queue" aria-label="Assigned tasks">
      {currentAction && (
        <li className="task-row active">
          <span className="task-icon">{ACTION_META[currentAction].icon}</span>
          <span className="task-copy">
            <span className="task-label">{ACTION_META[currentAction].label}</span>
            <span className="task-progress">
              <span
                style={{
                  width: `${actionProgress(currentAction, actionEndsAt, now)}%`,
                }}
              />
            </span>
          </span>
          <button type="button" className="task-cancel" onClick={onCancelCurrent} aria-label="Cancel current task">
            ✕
          </button>
        </li>
      )}
      {queue.map((item) => (
        <li key={item.id} className="task-row">
          <span className="task-icon">{ACTION_META[item.action].icon}</span>
          <span className="task-label">{ACTION_META[item.action].label}</span>
          <button
            type="button"
            className="task-cancel"
            onClick={() => onCancelQueued(item.id)}
            aria-label={`Cancel ${ACTION_META[item.action].label}`}
          >
            ✕
          </button>
        </li>
      ))}
    </ol>
  )
}

function actionProgress(action: ActionType, endsAt: number | null, now: number): number {
  if (endsAt == null) return 0
  const duration = ACTION_CONFIG[action].durationMs
  const remaining = Math.max(0, endsAt - now)
  return Math.min(100, Math.max(0, ((duration - remaining) / duration) * 100))
}

function InteractionMenu() {
  const target = useGameStore((s) => s.hoverTarget)
  const pinned = useGameStore((s) => s.menuPinned)
  const isSleeping = useGameStore((s) => s.isSleeping)
  const queueFull = useGameStore((s) => !!s.currentAction && s.actionQueue.length >= MAX_QUEUED)
  const startAction = useGameStore((s) => s.startAction)
  const wakeDog = useGameStore((s) => s.wakeDog)
  const closeInteraction = useGameStore((s) => s.closeInteraction)

  if (!target) return null

  const left = Math.min(target.x + 14, window.innerWidth - 200)
  const top = Math.min(target.y + 14, window.innerHeight - 220)

  return (
    <div
      className={`sims-menu ${pinned ? 'pinned' : ''}`}
      style={{ left, top }}
      onPointerEnter={holdInteraction}
      onPointerLeave={hideInteractionSoon}
    >
      <div className="sims-menu-title">
        <span className="sims-diamond" aria-hidden />
        {target.title}
      </div>
      <ul>
        {target.actions.map((action) => {
          const meta = ACTION_META[action]
          const wake = action === 'sleep' && isSleeping
          return (
            <li key={action}>
              <button
                type="button"
                disabled={queueFull}
                onClick={() => {
                  if (wake) wakeDog()
                  else startAction(action)
                  closeInteraction()
                }}
              >
                <span>{wake ? '☀️' : meta.icon}</span>
                {wake ? 'Wake' : meta.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
