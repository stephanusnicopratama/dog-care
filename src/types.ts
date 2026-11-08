export type NeedKey =
  | 'hunger'
  | 'thirst'
  | 'energy'
  | 'fun'
  | 'cleanliness'
  | 'affection'

export type DogSize = 'small' | 'medium' | 'large'

export type ActionType = 'feed' | 'water' | 'play' | 'pet' | 'bathe' | 'sleep'

export type Mood = 'comfortable' | 'needy' | 'asking'

export type Needs = Record<NeedKey, number>

export interface Dog {
  name: string
  coatColor: string
  size: DogSize
}

export interface SaveData {
  version: 1
  dog: Dog
  needs: Needs
  gameMinute: number
  isSleeping: boolean
  happyDays: number
  /** Minutes in current day where all needs were >= 50 */
  comfortableMinutesToday: number
  joys: number
}
