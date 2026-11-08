import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { isEvening } from '../lib/time'
import { useGameStore } from '../store/gameStore'
import { DogMesh } from './DogMesh'
import {
  BatheTubProp,
  DogBedProp,
  DogHouseProp,
  FoodBowlProp,
  TennisBallProp,
  WaterBowlProp,
  YardFence,
  YardGround,
} from './props/YardProps'

export function YardScene() {
  const gameMinute = useGameStore((s) => s.gameMinute)
  const startAction = useGameStore((s) => s.startAction)
  const evening = isEvening(gameMinute)

  const sky = evening ? '#312e81' : '#7dd3fc'
  const light = evening ? 0.5 : 1.15

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      camera={{ position: [8.5, 6.5, 8.5], fov: 42 }}
      shadows
      gl={{ antialias: true }}
    >
      <color attach="background" args={[sky]} />
      <hemisphereLight args={['#fef9c3', '#365314', evening ? 0.35 : 0.55]} />
      <ambientLight intensity={light * 0.35} />
      <directionalLight
        position={[7, 11, 5]}
        intensity={light}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <OrbitControls
        target={[0, 0.45, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={5}
        maxDistance={17}
      />

      <YardGround evening={evening} />
      <YardFence />
      <FoodBowlProp />
      <WaterBowlProp />
      <DogBedProp />
      <TennisBallProp />
      <DogHouseProp />
      <BatheTubProp onBathe={() => startAction('bathe')} />
      <DogMesh />
    </Canvas>
  )
}
