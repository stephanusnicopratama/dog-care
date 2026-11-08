import { Vector3 } from 'three'

/** World position of the ball while it is being chased. */
export const playBallPos = new Vector3(1.4, 0.14, 2.2)

export const throwTarget = {
  x: 1.4,
  z: 2.2,
  active: false,
}

export function tossBall(x: number, z: number) {
  throwTarget.x = Math.max(-5.2, Math.min(5.2, x))
  throwTarget.z = Math.max(-5.2, Math.min(5.2, z))
  throwTarget.active = true
}
