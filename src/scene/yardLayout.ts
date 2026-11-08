import type { ActionType } from '../types'

export const YARD_TARGETS: Partial<Record<ActionType, [number, number, number]>> = {
  feed: [-2.4, 0, 2.0],
  water: [-2.4, 0, 0.6],
  play: [1.4, 0, 2.2],
  bathe: [-3.6, 0, -2.2],
  sleep: [2.6, 0, -1.6],
  pet: [0, 0, 0],
}

export const PROP_POSITIONS = {
  foodBowl: [-2.4, 0, 2.0] as const,
  waterBowl: [-2.4, 0, 0.6] as const,
  bed: [2.6, 0, -1.6] as const,
  ball: [1.4, 0, 2.2] as const,
  dogHouse: [3.8, 0, -3.4] as const,
  bathe: [-3.6, 0, -2.2] as const,
}
