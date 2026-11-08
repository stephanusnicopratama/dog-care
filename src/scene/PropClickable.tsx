import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useGameStore, type InteractionTarget } from '../store/gameStore'
import type { ActionType } from '../types'

let hideTimer = 0

function pointFromEvent(e: ThreeEvent<PointerEvent | MouseEvent>): { x: number; y: number } {
  const native = e.nativeEvent
  return { x: native.clientX, y: native.clientY }
}

export function showInteraction(target: InteractionTarget) {
  window.clearTimeout(hideTimer)
  useGameStore.getState().setHoverTarget(target)
}

export function hideInteractionSoon() {
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    const state = useGameStore.getState()
    if (!state.menuPinned) state.setHoverTarget(null)
  }, 280)
}

export function holdInteraction() {
  window.clearTimeout(hideTimer)
}

export function PropClickable({
  id,
  title,
  actions,
  children,
  position,
}: {
  id: string
  title: string
  actions: ActionType[]
  position: [number, number, number]
  children: ReactNode
}) {
  const hoverId = useGameStore((s) => s.hoverTarget?.id)
  const highlighted = hoverId === id

  const payload = (e: ThreeEvent<PointerEvent | MouseEvent>): InteractionTarget => {
    const { x, y } = pointFromEvent(e)
    return { id, title, actions, x, y }
  }

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        showInteraction(payload(e))
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
        hideInteractionSoon()
      }}
      onClick={(e) => {
        e.stopPropagation()
        showInteraction(payload(e))
        useGameStore.getState().pinMenu(true)
      }}
    >
      {highlighted && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.55, 0.68, 28]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      )}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 1.1, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {children}
    </group>
  )
}
