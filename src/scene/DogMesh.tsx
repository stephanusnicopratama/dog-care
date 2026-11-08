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
import { playBallPos, throwTarget } from './playBall'
import { PROP_POSITIONS, YARD_TARGETS } from './yardLayout'

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
  const zoomies = asking && urgent === 'fun'
  const delightUntil = useGameStore((s) => s.delightUntil)
  const fetched = useRef(false)

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

    if ((asking && !zoomies) || currentAction === 'pet') {
      movingRef.current = false
      const dx = state.camera.position.x - g.position.x
      const dz = state.camera.position.z - g.position.z
      if (currentAction === 'pet') {
        const tx = YARD_TARGETS.pet?.[0] ?? 0
        const tz = YARD_TARGETS.pet?.[2] ?? 0
        g.position.x += (tx - g.position.x) * Math.min(1, delta * 2)
        g.position.z += (tz - g.position.z) * Math.min(1, delta * 2)
      }
      g.rotation.y = Math.atan2(dx, dz)
      return
    }

    if (currentAction === 'play') {
      const dx = playBallPos.x - g.position.x
      const dz = playBallPos.z - g.position.z
      const dist = Math.hypot(dx, dz)
      const ballLanded = !throwTarget.active || playBallPos.y < 0.35
      movingRef.current = dist > 0.7
      if (dist > 0.65) {
        g.position.x += dx * Math.min(1, delta * 4.8)
        g.position.z += dz * Math.min(1, delta * 4.8)
      } else if (ballLanded && throwTarget.active && !fetched.current) {
        fetched.current = true
        throwTarget.active = false
        useGameStore.getState().noteFetch()
      }
      if (!throwTarget.active) fetched.current = false
      if (dist > 0.05) g.rotation.y = Math.atan2(dx, dz)
      return
    }

    let target: [number, number, number] = wander
    if (isSleeping) target = YARD_TARGETS.sleep ?? [2.6, 0, -1.6]
    else if (currentAction && YARD_TARGETS[currentAction]) target = YARD_TARGETS[currentAction]!

    const speed = currentAction ? 3.8 : zoomies ? 3.4 : 1.25
    const dx = target[0] - g.position.x
    const dz = target[2] - g.position.z
    const dist = Math.hypot(dx, dz)
    movingRef.current = dist > 0.12 && !isSleeping

    g.position.x += dx * Math.min(1, delta * speed)
    g.position.z += dz * Math.min(1, delta * speed)

    const face =
      currentAction === 'feed'
        ? PROP_POSITIONS.foodBowl
        : currentAction === 'water'
          ? PROP_POSITIONS.waterBowl
          : null
    if (face && dist < 0.35) {
      g.rotation.y = Math.atan2(face[0] - g.position.x, face[2] - g.position.z)
    } else if (Math.abs(dx) + Math.abs(dz) > 0.05) {
      g.rotation.y = Math.atan2(dx, dz)
    }
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
          delightUntil={delightUntil}
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
