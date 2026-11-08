import type { ActionType } from '../types'

export const ACTION_META: Record<ActionType, { label: string; icon: string }> = {
  feed: { label: 'Feed', icon: '🍖' },
  water: { label: 'Water', icon: '💧' },
  play: { label: 'Play', icon: '🎾' },
  pet: { label: 'Pet', icon: '🤚' },
  bathe: { label: 'Bathe', icon: '🛁' },
  sleep: { label: 'Sleep', icon: '😴' },
}
