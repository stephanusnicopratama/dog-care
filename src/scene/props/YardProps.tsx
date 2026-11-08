import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { PALETTE } from '../materials'
import { PROP_POSITIONS } from '../yardLayout'
import { PropClickable } from '../PropClickable'

export function YardGround({ evening }: { evening: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color={evening ? PALETTE.grassEvening : PALETTE.grass} roughness={0.95} />
    </mesh>
  )
}

export function YardFence() {
  const posts = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = -6; i <= 6; i += 2) {
      pts.push([i, 0, -6], [i, 0, 6], [-6, 0, i], [6, 0, i])
    }
    return pts
  }, [])

  const rails: { from: [number, number, number]; to: [number, number, number]; y: number }[] = useMemo(
    () => [
      { from: [-6, 0, -6], to: [6, 0, -6], y: 0.45 },
      { from: [-6, 0, -6], to: [6, 0, -6], y: 0.85 },
      { from: [-6, 0, 6], to: [6, 0, 6], y: 0.45 },
      { from: [-6, 0, 6], to: [6, 0, 6], y: 0.85 },
      { from: [-6, 0, -6], to: [-6, 0, 6], y: 0.45 },
      { from: [-6, 0, -6], to: [-6, 0, 6], y: 0.85 },
      { from: [6, 0, -6], to: [6, 0, 6], y: 0.45 },
      { from: [6, 0, -6], to: [6, 0, 6], y: 0.85 },
    ],
    [],
  )

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={`post-${i}`} position={[p[0], 0.55, p[2]]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
        </mesh>
      ))}
      {rails.map((r, i) => {
        const dx = r.to[0] - r.from[0]
        const dz = r.to[2] - r.from[2]
        const len = Math.hypot(dx, dz)
        const mid: [number, number, number] = [(r.from[0] + r.to[0]) / 2, r.y, (r.from[2] + r.to[2]) / 2]
        const rotY = Math.atan2(dx, dz)
        return (
          <mesh key={`rail-${i}`} position={mid} rotation={[0, rotY, 0]} castShadow>
            <boxGeometry args={[0.08, 0.08, len]} />
            <meshStandardMaterial color={PALETTE.woodDark} roughness={0.92} />
          </mesh>
        )
      })}
    </group>
  )
}

export function FoodBowlProp() {
  const [x, , z] = PROP_POSITIONS.foodBowl
  return (
    <PropClickable position={[x, 0, z]} action="feed">
      <group position={[0, 0.12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.32, 0.14, 20]} />
          <meshStandardMaterial color={PALETTE.metal} metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.32, 0.3, 0.06, 20]} />
          <meshStandardMaterial color={PALETTE.kibble} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={PALETTE.kibble} />
        </mesh>
      </group>
    </PropClickable>
  )
}

export function WaterBowlProp() {
  const [x, , z] = PROP_POSITIONS.waterBowl
  return (
    <PropClickable position={[x, 0, z]} action="water">
      <group position={[0, 0.12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.32, 0.14, 20]} />
          <meshStandardMaterial color={PALETTE.metalShine} metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.3, 0.28, 0.05, 20]} />
          <meshStandardMaterial
            color={PALETTE.water}
            transparent
            opacity={0.88}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      </group>
    </PropClickable>
  )
}

export function DogBedProp() {
  const [x, , z] = PROP_POSITIONS.bed
  return (
    <PropClickable position={[x, 0, z]} action="sleep">
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[1.55, 0.16, 1.15]} />
        <meshStandardMaterial color={PALETTE.woodDark} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0.05]} castShadow>
        <boxGeometry args={[1.35, 0.22, 0.95]} />
        <meshStandardMaterial color={PALETTE.cushion} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.32, -0.38]} castShadow>
        <boxGeometry args={[1.1, 0.18, 0.22]} />
        <meshStandardMaterial color={PALETTE.cushionDark} roughness={0.92} />
      </mesh>
    </PropClickable>
  )
}

export function TennisBallProp() {
  const [x, , z] = PROP_POSITIONS.ball
  return (
    <PropClickable position={[x, 0, z]} action="play">
      <mesh position={[0, 0.14, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color={PALETTE.ball} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.14, 0.155]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.155, 0.012, 8, 24, Math.PI]} />
        <meshStandardMaterial color={PALETTE.ballStripe} />
      </mesh>
    </PropClickable>
  )
}

export function DogHouseProp() {
  const [x, , z] = PROP_POSITIONS.dogHouse
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.35, 0.9, 1.25]} />
        <meshStandardMaterial color={PALETTE.house} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[1.05, 0.55, 4]} />
        <meshStandardMaterial color={PALETTE.houseRoof} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, 0.64]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.42, 0.52, 0.06]} />
        <meshStandardMaterial color={PALETTE.houseDoor} />
      </mesh>
    </group>
  )
}

export function BatheTubProp({ onBathe }: { onBathe: () => void }) {
  const [x, , z] = PROP_POSITIONS.bathe
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation()
        onBathe()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
    >
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[1.35, 0.44, 0.95]} />
        <meshStandardMaterial color={PALETTE.tub} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.15, 0.12, 0.75]} />
        <meshStandardMaterial
          color={PALETTE.tubWater}
          transparent
          opacity={0.75}
          roughness={0.05}
          metalness={0.15}
        />
      </mesh>
      <Text position={[0, 0.75, 0]} fontSize={0.2} color="#0369a1" anchorX="center">
        Bathe
      </Text>
    </group>
  )
}
