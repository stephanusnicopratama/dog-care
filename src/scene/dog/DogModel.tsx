import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'
import type { ActionType } from '../../types'

export type DogPose = 'idle' | 'sleep' | 'eat' | 'drink' | 'play' | 'happy'

const FUR = { roughness: 0.72, metalness: 0 }

function Fur({
  color,
  position,
  scale,
  args = [1, 24, 18],
}: {
  color: string
  position: [number, number, number]
  scale: [number, number, number]
  args?: [number, number, number]
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={args} />
      <meshStandardMaterial color={color} {...FUR} />
    </mesh>
  )
}

export function DogModel({
  coatColor,
  pose,
  movingRef,
}: {
  coatColor: string
  pose: DogPose
  movingRef: MutableRefObject<boolean>
}) {
  const root = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group>(null)
  const legs = [
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
    useRef<Group>(null),
  ]
  const eyeL = useRef<Mesh>(null)
  const eyeR = useRef<Mesh>(null)

  const belly = useMemo(() => {
    const c = new THREE.Color(coatColor)
    return `#${c.lerp(new THREE.Color('#fff7ed'), 0.55).getHexString()}`
  }, [coatColor])

  const ear = useMemo(() => {
    const c = new THREE.Color(coatColor)
    return `#${c.lerp(new THREE.Color('#1c1917'), 0.35).getHexString()}`
  }, [coatColor])

  useFrame((state, delta) => {
    const moving = movingRef.current && pose !== 'sleep'
    const t = state.clock.elapsedTime
    const phase = moving ? t * 8 : t * 1.6

    const swing = moving ? 0.45 : 0.04
    legs[0].current?.rotation.set(Math.sin(phase) * swing, 0, 0)
    legs[3].current?.rotation.set(Math.sin(phase) * swing, 0, 0)
    legs[1].current?.rotation.set(Math.sin(phase + Math.PI) * swing, 0, 0)
    legs[2].current?.rotation.set(Math.sin(phase + Math.PI) * swing, 0, 0)

    if (tail.current) {
      const wag = pose === 'play' || pose === 'happy' ? 0.7 : 0.18
      tail.current.rotation.y = Math.sin(t * (pose === 'play' ? 14 : 3)) * wag
      tail.current.rotation.x = 0.7
    }

    if (head.current) {
      const eat = pose === 'eat' || pose === 'drink' ? 0.55 : 0
      const look = pose === 'idle' ? Math.sin(t * 0.7) * 0.08 : 0
      head.current.rotation.x = eat
      head.current.rotation.y = look
    }

    if (root.current && pose !== 'sleep') {
      root.current.position.y = Math.sin(t * 2) * 0.015
    }

    const blink = Math.sin(t * 0.35) > 0.97 || pose === 'sleep' ? 0.15 : 1
    if (eyeL.current) eyeL.current.scale.y = blink
    if (eyeR.current) eyeR.current.scale.y = blink

    void delta
  })

  const sleeping = pose === 'sleep'

  return (
    <group
      ref={root}
      position={[0, sleeping ? 0.22 : 0, 0]}
      rotation={[0, 0, sleeping ? 1.15 : 0]}
    >
      <Fur color={coatColor} position={[0, 0.46, -0.02]} scale={[0.34, 0.28, 0.48]} />
      <Fur color={belly} position={[0, 0.4, 0.12]} scale={[0.26, 0.2, 0.28]} />
      <Fur color={coatColor} position={[0, 0.5, 0.28]} scale={[0.2, 0.18, 0.16]} />

      <group ref={head} position={[0, 0.72, 0.42]}>
        <Fur color={coatColor} position={[0, 0, 0]} scale={[0.28, 0.26, 0.26]} />
        <Fur color={belly} position={[0, -0.04, 0.16]} scale={[0.14, 0.1, 0.14]} />
        <mesh position={[0, -0.02, 0.28]} castShadow>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.4} />
        </mesh>
        <mesh ref={eyeL} position={[-0.1, 0.06, 0.2]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh ref={eyeR} position={[0.1, 0.06, 0.2]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.1, 0.06, 0.24]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.1, 0.06, 0.24]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.2, 0.02, -0.02]} rotation={[0.2, 0, 0.9]} castShadow>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color={ear} {...FUR} />
        </mesh>
        <mesh position={[0.2, 0.02, -0.02]} rotation={[0.2, 0, -0.9]} castShadow>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color={ear} {...FUR} />
        </mesh>
      </group>

      <group ref={tail} position={[0, 0.58, -0.42]}>
        <mesh position={[0, 0.08, -0.08]} castShadow>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={coatColor} {...FUR} />
        </mesh>
        <mesh position={[0, 0.16, -0.16]} castShadow>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={coatColor} {...FUR} />
        </mesh>
      </group>

      {(
        [
          [-0.16, 0.22],
          [0.16, 0.22],
          [-0.16, -0.22],
          [0.16, -0.22],
        ] as const
      ).map(([x, z], i) => (
        <group key={i} ref={legs[i]} position={[x, 0.28, z]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
            <meshStandardMaterial color={coatColor} {...FUR} />
          </mesh>
          <mesh position={[0, -0.24, 0.02]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#44403c" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function poseFromAction(action: ActionType | null, sleeping: boolean): DogPose {
  if (sleeping) return 'sleep'
  if (action === 'feed') return 'eat'
  if (action === 'water') return 'drink'
  if (action === 'play') return 'play'
  if (action === 'pet') return 'happy'
  return 'idle'
}
