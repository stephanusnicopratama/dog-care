import { COAT_SWATCHES, DEFAULT_DOG_NAME, INITIAL_NEED, NEED_KEYS } from '../config/simulation'
import type { Needs, SaveData } from '../types'

const STORAGE_KEY = 'dog-care-save-v1'

function defaultNeeds(): Needs {
  const needs = {} as Needs
  for (const k of NEED_KEYS) {
    needs[k] = INITIAL_NEED
  }
  return needs
}

export function createNewSave(): SaveData {
  return {
    version: 1,
    dog: {
      name: DEFAULT_DOG_NAME,
      coatColor: COAT_SWATCHES[0],
      size: 'medium',
    },
    needs: defaultNeeds(),
    gameMinute: 8 * 60,
    isSleeping: false,
    happyDays: 0,
    comfortableMinutesToday: 0,
  }
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createNewSave()
    const parsed = JSON.parse(raw) as SaveData
    if (parsed.version !== 1 || !parsed.dog || !parsed.needs) {
      return createNewSave()
    }
    return parsed
  } catch {
    return createNewSave()
  }
}

export function persistSave(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota or private mode */
  }
}
