import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE } from '../materials'

type DogPose = 'idle' | 'walk' | 'sleep' | 'eat' | 'drink' | 'play' | 'happy'

function coatMaterials(body: string) {
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: body,
        roughness: 0.82,
        metalness: 0.05,
      }),
    [body],
  )
  const bellyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(body).lerp(new THREE.Color(PALETTE.belly), 0.35),
        roughness: 0.88,
      }),
    [body],
  )
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: PALETTE.paw, roughness: 0.9 }),
    [],
  )
  return { bodyMat, bellyMat, darkMat }
}

function Leg({
  x,
  z,
  phase,
  bodyMat,
  darkMat,
}: {
  x: number
  z: number
  phase: number
  bodyMat: THREE.MeshStandardMaterial
  darkMat: THREE.MeshStandardMaterial
}) {
  const swing = Math.sin(phase) * 0.22
  return (
    <group position={[x, 0.18, z]} rotation={[swing, 0, 0]}>
      <mesh position={[0, 0.14, 0]} castShadow material={bodyMat}>
        <cylinderGeometry args={[0.07, 0.085, 0.28, 8]} />
      </mesh>
      <mesh position={[0, -0.02, 0.02]} castShadow material={darkMat}>
        <sphereGeometry args={[0.09, 10, 10]} />
      </mesh>
    </group>
  )
}

export function DogModel({
  coatColor,
  pose,
  walkPhase,
  headTilt = 0,
}: {
  coatColor: string
  pose: DogPose
  walkPhase: number
  headTilt?: number
}) {
  const { bodyMat, bellyMat, darkMat } = coatMaterials(coatColor)
  const eyeShineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: PALETTE.eyeShine }), [])

  const sleeping = pose === 'sleep'
  const eating = pose === 'eat' || pose === 'drink'
  const playful = pose === 'play' || pose === 'happy'

  const headRotX = sleeping ? -0.15 : eating ? 0.45 + headTilt : headTilt
  const headY = sleeping ? 0.38 : 0.52
  const headZ = sleeping ? 0.15 : 0.42
  const tailWag = playful ? Math.sin(walkPhase * 2.5) * 0.5 : Math.sin(walkPhase * 0.6) * 0.12

  return (
    <group rotation={[sleeping ? -0.55 : 0, 0, 0]} position={[0, sleeping ? 0.12 : 0.32, 0]}>
      {/* torso */}
      <mesh position={[0, 0.28, -0.05]} castShadow material={bodyMat}>
        <capsuleGeometry args={[0.26, 0.62, 6, 12]} />
      </mesh>
      <mesh position={[0, 0.22, 0.08]} castShadow material={bellyMat}>
        <sphereGeometry args={[0.22, 12, 10]} />
      </mesh>

      {/* head */}
      <group position={[0, headY, headZ]} rotation={[headRotX, 0, 0]}>
        <mesh castShadow material={bodyMat}>
          <sphereGeometry args={[0.24, 14, 12]} />
        </mesh>
        <mesh position={[0, -0.02, 0.22]} castShadow material={bodyMat}>
          <boxGeometry args={[0.2, 0.14, 0.22]} />
        </mesh>
        <mesh position={[0, 0.1, 0.36]} material={darkMat}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <mesh position={[-0.09, 0.14, 0.02]} rotation={[0.2, 0.3, -0.4]} castShadow material={bodyMat}>
          <coneGeometry args={[0.09, 0.2, 6]} />
        </mesh>
        <mesh position={[0.09, 0.14, 0.02]} rotation={[0.2, -0.3, 0.4]} castShadow material={bodyMat}>
          <coneGeometry args={[0.09, 0.2, 6]} />
        </mesh>
        <mesh position={[-0.1, 0.06, 0.28]} material={darkMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
        <mesh position={[0.1, 0.06, 0.28]} material={darkMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
        <mesh position={[-0.08, 0.08, 0.31]} material={eyeShineMat}>
          <sphereGeometry args={[0.012, 6, 6]} />
        </mesh>
        <mesh position={[0.08, 0.08, 0.31]} material={eyeShineMat}>
          <sphereGeometry args={[0.012, 6, 6]} />
        </mesh>
      </group>

      {/* tail */}
      <group position={[0, 0.38, -0.42]} rotation={[0.5 + tailWag, 0, 0]}>
        <mesh castShadow material={bodyMat}>
          <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
        </mesh>
      </group>

      <Leg x={-0.2} z={0.2} phase={walkPhase} bodyMat={bodyMat} darkMat={darkMat} />
      <Leg x={0.2} z={0.2} phase={walkPhase + Math.PI} bodyMat={bodyMat} darkMat={darkMat} />
      <Leg x={-0.2} z={-0.22} phase={walkPhase + Math.PI} bodyMat={bodyMat} darkMat={darkMat} />
      <Leg x={0.2} z={-0.22} phase={walkPhase} bodyMat={bodyMat} darkMat={darkMat} />
    </group>
  )
}
