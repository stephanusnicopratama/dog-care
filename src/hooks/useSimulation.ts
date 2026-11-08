import { useEffect } from 'react'
import { REAL_MS_PER_GAME_MINUTE } from '../config/simulation'
import { useGameStore } from '../store/gameStore'

export function useSimulation() {
  const tickMinute = useGameStore((s) => s.tickMinute)
  const setSimPaused = useGameStore((s) => s.setSimPaused)
  const save = useGameStore((s) => s.save)
  const simPaused = useGameStore((s) => s.simPaused)

  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.visibilityState === 'hidden'
      setSimPaused(hidden)
      if (hidden) save()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [setSimPaused, save])

  useEffect(() => {
    if (simPaused) return
    const id = window.setInterval(() => tickMinute(), REAL_MS_PER_GAME_MINUTE)
    return () => window.clearInterval(id)
  }, [simPaused, tickMinute])

  const ensureWhim = useGameStore((s) => s.ensureWhim)
  useEffect(() => {
    if (simPaused) return
    ensureWhim()
    const id = window.setInterval(() => ensureWhim(), 4000)
    return () => window.clearInterval(id)
  }, [simPaused, ensureWhim])
}

export function useActionTimer() {
  const actionEndsAt = useGameStore((s) => s.actionEndsAt)
  const finishAction = useGameStore((s) => s.finishAction)

  useEffect(() => {
    if (actionEndsAt == null) return
    const remaining = actionEndsAt - Date.now()
    const id = window.setTimeout(() => finishAction(), Math.max(0, remaining))
    return () => window.clearTimeout(id)
  }, [actionEndsAt, finishAction])
}
