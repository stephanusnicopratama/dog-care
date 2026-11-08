import { MINUTES_PER_DAY } from '../config/simulation'

export function formatGameClock(gameMinute: number): string {
  const dayMinute = ((gameMinute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const h = Math.floor(dayMinute / 60)
  const m = dayMinute % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

export function isEvening(gameMinute: number): boolean {
  const dayMinute = ((gameMinute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  return dayMinute >= 18 * 60
}
