import { Billboard, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { MOOD_ASKING, MOOD_COMFORT } from '../config/simulation'
import { lowestNeed } from '../lib/mood'
import { useGameStore } from '../store/gameStore'
import type { ActionType, NeedKey } from '../types'
import { DogModel, poseFromAction } from './dog/DogModel'
import { PropClickable } from './PropClickable'
import { YARD_TARGETS } from './yardLayout'

const NEED_CUE: Record<NeedKey, string> = {
  hunger: '🍖',
  thirst: '💧',
  energy: '😴',
  fun: '🎾',
  cleanliness: '🛁',
  affection: '🤚',
}

const SIZE_SCALE = { small: 0.75, medium: 1, large: 1.25 } as const

const DOG_ACTIONS: ActionType[] = ['pet', 'feed', 'water', 'play', 'bathe', 'sleep']

export function DogMesh() {
  const group = useRef<Group>(null)
  const movingRef = useRef(false)
  const dog = useGameStore((s) => s.dog)
  const needs = useGameStore((s) => s.needs)
  const currentAction = useGameStore((s) => s.currentAction)
  const isSleeping = useGameStore((s) => s.isSleeping)
  const name = dog.name
  const urgent = lowestNeed(needs)
  const unfulfilled = !currentAction && !isSleeping && needs[urgent] < MOOD_COMFORT
  const asking = unfulfilled && needs[urgent] < MOOD_ASKING

  const [wander, setWander] = useState<[number, number, number]>([0, 0, 0])
  const scale = SIZE_SCALE[dog.size]

  useEffect(() => {
    const id = window.setInterval(() => {
      if (currentAction || isSleeping) return
      setWander([(Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4])
    }, 6000)
    return () => window.clearInterval(id)
  }, [currentAction, isSleeping])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    if (asking) {
      movingRef.current = false
      const dx = state.camera.position.x - g.position.x
      const dz = state.camera.position.z - g.position.z
      g.rotation.y = Math.atan2(dx, dz)
      return
    }

    let target: [number, number, number] = wander
    if (isSleeping) target = YARD_TARGETS.sleep ?? [2.6, 0, -1.6]
    else if (currentAction && YARD_TARGETS[currentAction]) target = YARD_TARGETS[currentAction]!

    const speed = currentAction ? 3.8 : 1.25
    const dx = target[0] - g.position.x
    const dz = target[2] - g.position.z
    movingRef.current = Math.hypot(dx, dz) > 0.12 && currentAction !== 'pet' && !isSleeping

    g.position.x += dx * Math.min(1, delta * speed)
    g.position.z += dz * Math.min(1, delta * speed)
    if (Math.abs(dx) + Math.abs(dz) > 0.05) g.rotation.y = Math.atan2(dx, dz)
  })

  return (
    <group ref={group} scale={[scale, scale, scale]}>
      <PropClickable id="dog" title={name} actions={DOG_ACTIONS} position={[0, 0, 0]}>
        <DogModel
          coatColor={dog.coatColor}
          pose={poseFromAction(currentAction, isSleeping)}
          movingRef={movingRef}
          needCue={unfulfilled ? urgent : null}
          asking={asking}
        />
        {unfulfilled && (
          <Billboard position={[0, 1.45, 0]}>
            <Html center sprite style={{ pointerEvents: 'none' }}>
              <div className={`need-cue${asking ? ' asking' : ''}`} aria-hidden>
                {NEED_CUE[urgent]}
              </div>
            </Html>
          </Billboard>
        )}
      </PropClickable>
    </group>
  )
}
