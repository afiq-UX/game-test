import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { CollisionSystem } from './CollisionSystem';

// Red Dead Redemption–style over-the-shoulder follow: sits close behind the
// player, tracks their movement tightly, and slowly recenters behind them when
// walking forward without mouse input.
const DISTANCE = 2.35;
const MIN_DISTANCE = 0.35;
const COLLISION_PADDING = 0.25;
const SHOULDER_HEIGHT = 1.35;
const SHOULDER_OFFSET = 0.42; // local right — camera sits over the shoulder
const LOOK_AHEAD = 5.0;
const LOOK_HEIGHT = 1.05;
const DEFAULT_PITCH = 0.12;
const MIN_PITCH = -0.25;
const MAX_PITCH = 0.75;
const YAW_RECENTER_SPEED = 2.8; // align behind the player when moving, no look input

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: PlayerController;
  private collision: CollisionSystem;

  private _yaw = 0;
  private _pitch = DEFAULT_PITCH;
  private pivot = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private offsetDir = new THREE.Vector3();
  private desiredPosition = new THREE.Vector3();

  constructor(
    camera: THREE.PerspectiveCamera,
    player: PlayerController,
    collision: CollisionSystem,
  ) {
    this.camera = camera;
    this.player = player;
    this.collision = collision;
    this.snapCamera();
  }

  /** Horizontal look angle (radians). Movement is mapped relative to this. */
  get yaw(): number {
    return this._yaw;
  }

  update(
    delta: number,
    lookDelta: THREE.Vector2,
    sensitivity: number,
    playerYaw: number,
    isMoving: boolean,
  ) {
    const hadLookInput = lookDelta.lengthSq() > 0.0001;
    this.applyLook(lookDelta.x, lookDelta.y, sensitivity);

    // Drift the camera back behind the character when walking without look input.
    if (isMoving && !hadLookInput) {
      let diff = playerYaw - this._yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this._yaw += diff * Math.min(1, YAW_RECENTER_SPEED * delta);
    }

    this.snapCamera();
  }

  reset() {
    this._yaw = this.player.rotation;
    this._pitch = DEFAULT_PITCH;
    this.snapCamera();
  }

  private applyLook(deltaX: number, deltaY: number, sensitivity: number) {
    this._yaw -= deltaX * sensitivity;
    this._pitch += deltaY * sensitivity;
    if (this._pitch < MIN_PITCH) this._pitch = MIN_PITCH;
    if (this._pitch > MAX_PITCH) this._pitch = MAX_PITCH;
  }

  private snapCamera() {
    const sinY = Math.sin(this._yaw);
    const cosY = Math.cos(this._yaw);
    const cosP = Math.cos(this._pitch);
    const sinP = Math.sin(this._pitch);

    // Shoulder pivot — moves with the player every frame (no positional lag).
    this.pivot.set(
      this.player.position.x - cosY * SHOULDER_OFFSET,
      this.player.position.y + SHOULDER_HEIGHT,
      this.player.position.z + sinY * SHOULDER_OFFSET,
    );

    // Unit vector from pivot out to the camera (behind and above).
    this.offsetDir.set(-cosP * sinY, sinP, -cosP * cosY);

    const castDist = this.collision.cameraCastDistance(this.pivot, this.offsetDir, DISTANCE);
    const allowed = Math.max(MIN_DISTANCE, Math.min(DISTANCE, castDist - COLLISION_PADDING));

    this.desiredPosition.copy(this.pivot).addScaledVector(this.offsetDir, allowed);
    this.camera.position.copy(this.desiredPosition);

    // Aim into the world ahead of the player, not at the back of their head.
    this.lookTarget.set(
      this.pivot.x + sinY * LOOK_AHEAD,
      this.player.position.y + LOOK_HEIGHT,
      this.pivot.z + cosY * LOOK_AHEAD,
    );
    this.camera.lookAt(this.lookTarget);
  }
}
