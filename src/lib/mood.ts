import { MOOD_ASKING, MOOD_COMFORT, NEED_KEYS } from '../config/simulation'
import type { Mood, Needs, NeedKey } from '../types'

export function getMood(needs: Needs): Mood {
  const values = NEED_KEYS.map((k) => needs[k])
  if (values.some((v) => v < MOOD_ASKING)) return 'asking'
  if (values.some((v) => v < MOOD_COMFORT)) return 'needy'
  return 'comfortable'
}

export function lowestNeed(needs: Needs): NeedKey {
  let key: NeedKey = 'hunger'
  let min = needs.hunger
  for (const k of NEED_KEYS) {
    if (needs[k] < min) {
      min = needs[k]
      key = k
    }
  }
  return key
}

export function allNeedsComfortable(needs: Needs): boolean {
  return NEED_KEYS.every((k) => needs[k] >= MOOD_COMFORT)
}
