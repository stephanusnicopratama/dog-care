import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useGameStore } from '../store/gameStore'
import type { ActionType } from '../types'

export function PropClickable({
  children,
  position,
  action,
}: {
  position: [number, number, number]
  action: ActionType
  children: ReactNode
}) {
  const startAction = useGameStore((s) => s.startAction)
  const currentAction = useGameStore((s) => s.currentAction)

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (currentAction) return
    startAction(action)
  }

  return (
    <group position={position} onClick={onClick} onPointerOver={() => (document.body.style.cursor = 'pointer')}>
      {children}
    </group>
  )
}
