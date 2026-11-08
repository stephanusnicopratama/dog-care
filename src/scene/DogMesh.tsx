import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'
import type { ActionType } from '../types'

const TARGETS: Partial<Record<ActionType, [number, number, number]>> = {
  feed: [-2.2, 0, 1.8],
  water: [-2.2, 0, 0.8],
  play: [1.2, 0, 2],
  bathe: [-3.5, 0, -2],
  sleep: [2.5, 0, -1.5],
  pet: [0, 0, 0],
}

const SIZE_SCALE = { small: 0.75, medium: 1, large: 1.25 } as const

export function DogMesh() {
  const group = useRef<Group>(null)
  const dog = useGameStore((s) => s.dog)
  const currentAction = useGameStore((s) => s.currentAction)
  const isSleeping = useGameStore((s) => s.isSleeping)
  const startAction = useGameStore((s) => s.startAction)

  const [wander, setWander] = useState<[number, number, number]>([0, 0, 0])
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

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    let target: [number, number, number] = wander
    if (isSleeping) {
      target = TARGETS.sleep ?? [2.5, 0, -1.5]
    } else if (currentAction && TARGETS[currentAction]) {
      target = TARGETS[currentAction]!
    }

    const speed = currentAction ? 3.5 : 1.2
    g.position.x += (target[0] - g.position.x) * Math.min(1, delta * speed)
    g.position.z += (target[2] - g.position.z) * Math.min(1, delta * speed)

    if (currentAction === 'sleep' || isSleeping) {
      g.rotation.x = -0.4
    } else {
      g.rotation.x += (0 - g.rotation.x) * Math.min(1, delta * 4)
      const dx = target[0] - g.position.x
      const dz = target[2] - g.position.z
      if (Math.abs(dx) + Math.abs(dz) > 0.05) {
        g.rotation.y = Math.atan2(dx, dz)
      }
    }

    const bob = currentAction === 'pet' ? Math.sin(Date.now() / 120) * 0.05 : 0
    g.position.y = 0.35 * scale + bob
  })

  const bodyColor = dog.coatColor

  return (
    <group
      ref={group}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation()
        if (useGameStore.getState().currentAction) return
        startAction('pet')
      }}
    >
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 1.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.55, 0.45]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.62, 0.72]}>
        <boxGeometry args={[0.18, 0.12, 0.08]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[-0.55, 0.35, 0.15]}>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.55, 0.35, 0.15]}>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.15, -0.65]}>
        <boxGeometry args={[0.15, 0.12, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  )
}
