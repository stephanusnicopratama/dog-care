import { OrbitControls, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { isEvening } from '../lib/time'
import { useGameStore } from '../store/gameStore'
import type { ActionType } from '../types'
import { DogMesh } from './DogMesh'
import { PropClickable } from './PropClickable'

const PROP_ACTIONS: Record<string, ActionType> = {
  food: 'feed',
  water: 'water',
  ball: 'play',
  bed: 'sleep',
}

export function YardScene() {
  const gameMinute = useGameStore((s) => s.gameMinute)
  const evening = isEvening(gameMinute)

  const sky = evening ? '#4c1d95' : '#7dd3fc'
  const ground = evening ? '#365314' : '#84cc16'
  const light = evening ? 0.45 : 1.1

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      camera={{ position: [8, 6, 8], fov: 45 }}
      shadows
    >
      <color attach="background" args={[sky]} />
      <ambientLight intensity={light * 0.5} />
      <directionalLight position={[6, 10, 4]} intensity={light} castShadow />
      <OrbitControls
        target={[0, 0.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={16}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={ground} />
      </mesh>

      <YardFence />

      <PropClickable position={[-2.2, 0.15, 1.8]} action={PROP_ACTIONS.food}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </PropClickable>

      <PropClickable position={[-2.2, 0.15, 0.8]} action={PROP_ACTIONS.water}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.28, 0.3, 0.06, 16]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
      </PropClickable>

      <PropClickable position={[2.5, 0.2, -1.5]} action={PROP_ACTIONS.bed}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.25, 1]} />
          <meshStandardMaterial color="#c4b5fd" />
        </mesh>
      </PropClickable>

      <PropClickable position={[1.2, 0.2, 2]} action={PROP_ACTIONS.ball}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
      </PropClickable>

      <group position={[3, 0, -3]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.4]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        <mesh position={[0, 0.35, 0.85]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.08]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      </group>

      <BatheSpot />

      <DogMesh />
    </Canvas>
  )
}

function YardFence() {
  const posts = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = -6; i <= 6; i += 2) {
      pts.push([i, 0.5, -6], [i, 0.5, 6], [-6, 0.5, i], [6, 0.5, i])
    }
    return pts
  }, [])

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.15, 1, 0.15]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      ))}
    </group>
  )
}

function BatheSpot() {
  const startAction = useGameStore((s) => s.startAction)
  return (
    <group
      position={[-3.5, 0.05, -2]}
      onClick={(e) => {
        e.stopPropagation()
        startAction('bathe')
      }}
    >
      <mesh>
        <boxGeometry args={[1.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#bae6fd" />
      </mesh>
      <Text position={[0, 0.4, 0]} fontSize={0.22} color="#0369a1" anchorX="center">
        Bathe
      </Text>
    </group>
  )
}
