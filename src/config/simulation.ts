import type { ActionType, NeedKey } from '../types'

/** 4 real seconds = 1 in-game minute */
export const REAL_MS_PER_GAME_MINUTE = 4000

export const MINUTES_PER_DAY = 24 * 60
export const EVENING_START_MINUTE = 18 * 60

export const NEED_KEYS: NeedKey[] = [
  'hunger',
  'thirst',
  'energy',
  'fun',
  'cleanliness',
  'affection',
]

export const INITIAL_NEED = 70

export const MOOD_COMFORT = 50
export const MOOD_ASKING = 25

/** Per in-game minute while awake */
export const DRAIN_PER_MINUTE: Record<NeedKey, number> = {
  hunger: 4,
  thirst: 5,
  energy: 3,
  fun: 3,
  cleanliness: 2,
  affection: 2,
}

export const SLEEP_ENERGY_RESTORE_PER_MINUTE = 20

export const PLAY_CLEANLINESS_PENALTY = 15

export const COAT_SWATCHES = [
  '#c4a484',
  '#3d2314',
  '#f5f5f4',
  '#78716c',
  '#d97706',
  '#1c1917',
] as const

export const ACTION_CONFIG: Record<
  ActionType,
  { durationMs: number; recovery: Partial<Record<NeedKey, number>> }
> = {
  feed: { durationMs: 3500, recovery: { hunger: 45 } },
  water: { durationMs: 2500, recovery: { thirst: 50 } },
  play: { durationMs: 5000, recovery: { fun: 55 } },
  pet: { durationMs: 2000, recovery: { affection: 40 } },
  bathe: { durationMs: 4500, recovery: { cleanliness: 60 } },
  sleep: { durationMs: 4000, recovery: { energy: 35 } },
}

export const DEFAULT_DOG_NAME = 'Dog'
