import { create } from 'zustand'
import {
  ACTION_CONFIG,
  DRAIN_PER_MINUTE,
  MINUTES_PER_DAY,
  NEED_KEYS,
  PLAY_CLEANLINESS_PENALTY,
  SLEEP_ENERGY_RESTORE_PER_MINUTE,
} from '../config/simulation'
import { loadSave, persistSave } from '../lib/persistence'
import type { ActionType, Dog, Needs, SaveData } from '../types'

export interface InteractionTarget {
  id: string
  title: string
  actions: ActionType[]
  x: number
  y: number
}

function clampNeed(n: number): number {
  return Math.max(0, Math.min(100, n))
}

interface GameState {
  dog: Dog
  needs: Needs
  gameMinute: number
  isSleeping: boolean
  happyDays: number
  comfortableMinutesToday: number
  currentAction: ActionType | null
  actionEndsAt: number | null
  simPaused: boolean
  dogPanelOpen: boolean
  hoverTarget: InteractionTarget | null
  menuPinned: boolean

  hydrate: () => void
  save: () => void
  setSimPaused: (paused: boolean) => void
  setDogPanelOpen: (open: boolean) => void
  renameDog: (name: string) => void
  setCoatColor: (color: string) => void
  setDogSize: (size: Dog['size']) => void
  startAction: (action: ActionType) => boolean
  tickMinute: () => void
  finishAction: () => void
  wakeDog: () => void
  setHoverTarget: (target: InteractionTarget | null) => void
  pinMenu: (pinned: boolean) => void
  closeInteraction: () => void
}

function snapshot(state: GameState): SaveData {
  return {
    version: 1,
    dog: state.dog,
    needs: state.needs,
    gameMinute: state.gameMinute,
    isSleeping: state.isSleeping,
    happyDays: state.happyDays,
    comfortableMinutesToday: state.comfortableMinutesToday,
  }
}

function applyDrain(needs: Needs, isSleeping: boolean): Needs {
  const next = { ...needs }
  for (const key of NEED_KEYS) {
    if (isSleeping) {
      if (key === 'energy') {
        next.energy = clampNeed(next.energy + SLEEP_ENERGY_RESTORE_PER_MINUTE)
      } else if (key === 'hunger' || key === 'thirst' || key === 'fun' || key === 'affection') {
        continue
      } else {
        next[key] = clampNeed(next[key] - DRAIN_PER_MINUTE[key])
      }
    } else {
      next[key] = clampNeed(next[key] - DRAIN_PER_MINUTE[key])
    }
  }
  return next
}

export const useGameStore = create<GameState>((set, get) => ({
  ...loadSave(),
  currentAction: null,
  actionEndsAt: null,
  simPaused: false,
  dogPanelOpen: false,
  hoverTarget: null,
  menuPinned: false,

  hydrate: () => set({ ...loadSave(), currentAction: null, actionEndsAt: null }),

  save: () => persistSave(snapshot(get())),

  setSimPaused: (paused) => set({ simPaused: paused }),

  setDogPanelOpen: (open) => set({ dogPanelOpen: open }),

  renameDog: (name) => {
    const trimmed = name.trim().slice(0, 24) || get().dog.name
    set({ dog: { ...get().dog, name: trimmed } })
    get().save()
  },

  setCoatColor: (color) => {
    set({ dog: { ...get().dog, coatColor: color } })
    get().save()
  },

  setDogSize: (size) => {
    set({ dog: { ...get().dog, size } })
    get().save()
  },

  startAction: (action) => {
    const { currentAction } = get()
    if (currentAction) return false

    const config = ACTION_CONFIG[action]
    const endsAt = Date.now() + config.durationMs

    if (action === 'sleep') {
      set({ isSleeping: true, currentAction: action, actionEndsAt: endsAt })
    } else {
      if (get().isSleeping) set({ isSleeping: false })
      set({ currentAction: action, actionEndsAt: endsAt })
    }
    return true
  },

  finishAction: () => {
    const { currentAction, needs, isSleeping } = get()
    if (!currentAction) return

    const config = ACTION_CONFIG[currentAction]
    const nextNeeds = { ...needs }
    for (const [key, amount] of Object.entries(config.recovery)) {
      const k = key as keyof Needs
      nextNeeds[k] = clampNeed(nextNeeds[k] + (amount ?? 0))
    }
    if (currentAction === 'play') {
      nextNeeds.cleanliness = clampNeed(nextNeeds.cleanliness - PLAY_CLEANLINESS_PENALTY)
    }

    let nextSleeping = isSleeping
    if (currentAction === 'sleep') {
      nextSleeping = nextNeeds.energy < 85
    } else if (isSleeping) {
      nextSleeping = false
    }

    set({
      needs: nextNeeds,
      currentAction: null,
      actionEndsAt: null,
      isSleeping: nextSleeping,
    })

    get().save()
  },

  wakeDog: () => {
    if (!get().isSleeping) return
    set({ isSleeping: false, currentAction: null, actionEndsAt: null })
    get().save()
  },

  setHoverTarget: (target) => set({ hoverTarget: target }),

  pinMenu: (pinned) => set({ menuPinned: pinned }),

  closeInteraction: () => set({ hoverTarget: null, menuPinned: false }),

  tickMinute: () => {
    const state = get()
    if (state.simPaused || state.currentAction) return

    const prevDay = Math.floor(state.gameMinute / MINUTES_PER_DAY)
    const needs = applyDrain(state.needs, state.isSleeping)
    const gameMinute = state.gameMinute + 1
    const newDay = Math.floor(gameMinute / MINUTES_PER_DAY)

    let comfortableMinutesToday = state.comfortableMinutesToday
    let happyDays = state.happyDays

    const onNewDay = newDay > prevDay
    if (onNewDay) {
      if (comfortableMinutesToday >= MINUTES_PER_DAY - 1) {
        happyDays += 1
      }
      comfortableMinutesToday = 0
    } else if (NEED_KEYS.every((k) => needs[k] >= 50)) {
      comfortableMinutesToday += 1
    }

    set({
      needs,
      gameMinute,
      comfortableMinutesToday,
      happyDays,
    })

    if (state.isSleeping && needs.energy >= 90) {
      set({ isSleeping: false })
    }
  },
}))
