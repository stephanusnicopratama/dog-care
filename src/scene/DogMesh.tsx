import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import type { ActionType } from '../types'
import { DogModel } from './dog/DogModel'
import { YARD_TARGETS } from './yardLayout'

const SIZE_SCALE = { small: 0.75, medium: 1, large: 1.25 } as const

function actionPose(action: ActionType | null, sleeping: boolean) {
  if (sleeping) return 'sleep' as const
  if (!action) return 'idle' as const
  if (action === 'feed') return 'eat' as const
  if (action === 'water') return 'drink' as const
  if (action === 'play') return 'play' as const
  if (action === 'pet') return 'happy' as const
  return 'idle' as const
}

export function DogMesh() {
  const group = useRef<Group>(null)
  const dog = useGameStore((s) => s.dog)
  const currentAction = useGameStore((s) => s.currentAction)
  const isSleeping = useGameStore((s) => s.isSleeping)
  const startAction = useGameStore((s) => s.startAction)

  const [wander, setWander] = useState<[number, number, number]>([0, 0, 0])
  const walkPhase = useRef(0)
  const moving = useRef(false)
  const scale = SIZE_SCALE[dog.size]

  useEffect(() => {
    const id = window.setInterval(() => {
      if (currentAction || isSleeping) return
      const x = (Math.random() - 0.5) * 4
      const z = (Math.random() - 0.5) * 4
      setWander([x, 0, z])
    }, 6000)
    return () => window.clearInterval(id)
  }, [currentAction, isSleeping])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    let target: [number, number, number] = wander
    if (isSleeping) {
      target = YARD_TARGETS.sleep ?? [2.6, 0, -1.6]
    } else if (currentAction && YARD_TARGETS[currentAction]) {
      target = YARD_TARGETS[currentAction]!
    }

    const speed = currentAction ? 3.8 : 1.25
    const dx = target[0] - g.position.x
    const dz = target[2] - g.position.z
    const dist = Math.hypot(dx, dz)
    moving.current = dist > 0.08 && !(currentAction === 'pet')

    g.position.x += dx * Math.min(1, delta * speed)
    g.position.z += dz * Math.min(1, delta * speed)

    if (Math.abs(dx) + Math.abs(dz) > 0.05) {
      g.rotation.y = Math.atan2(dx, dz)
    }

    if (moving.current) {
      walkPhase.current += delta * 9
    } else {
      walkPhase.current += delta * 2
    }

    const bob =
      currentAction === 'pet'
        ? Math.sin(state.clock.elapsedTime * 12) * 0.04
        : currentAction === 'play'
          ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.06
          : 0
    g.position.y = bob
  })

  const pose = actionPose(currentAction, isSleeping)

  return (
    <group
      ref={group}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation()
        if (useGameStore.getState().currentAction) return
        startAction('pet')
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <DogModel
        coatColor={dog.coatColor}
        pose={pose}
        walkPhase={walkPhase.current}
        headTilt={currentAction === 'bathe' ? -0.1 : 0}
      />
    </group>
  )
}
