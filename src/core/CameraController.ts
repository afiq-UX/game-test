import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { CollisionSystem } from './CollisionSystem';

// GTA V-style third-person orbit camera: floats behind/above the player, orbits
// with mouse-look (yaw/pitch), and springs in toward the player when a wall is
// behind the camera so it never clips through the house.
const DISTANCE = 3.6;            // ideal distance from the look target to the camera
const MIN_DISTANCE = 0.3;        // closest the pull-in may go (just behind the head, not
                                 // inside it) — must stay below a hugged-wall clearance
                                 // (~0.4) so a near wall always wins over this floor
const COLLISION_PADDING = 0.25;  // keep the camera this far off a wall surface
const TARGET_HEIGHT = 1.5;       // look at ~head height — the "POV height"
const DEFAULT_PITCH = 0.22;      // gentle downward tilt at rest (radians)
const MIN_PITCH = -0.35;         // a little below horizontal (look up)
const MAX_PITCH = 1.25;          // nearly straight down (look down)
const FOLLOW_SMOOTH = 18;        // camera translation smoothing (near-instant, kills pops)

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: PlayerController;
  private collision: CollisionSystem;

  private _yaw = 0;
  private _pitch = DEFAULT_PITCH;
  private currentPosition = new THREE.Vector3();
  private target = new THREE.Vector3();
  private offsetDir = new THREE.Vector3();

  constructor(
    camera: THREE.PerspectiveCamera,
    player: PlayerController,
    collision: CollisionSystem,
  ) {
    this.camera = camera;
    this.player = player;
    this.collision = collision;

    this.updateTarget();
    this.computeOffsetDir();
    this.currentPosition.copy(this.target).addScaledVector(this.offsetDir, DISTANCE);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  /** Current horizontal look angle (radians). Movement is mapped relative to this. */
  get yaw(): number {
    return this._yaw;
  }

  /** Apply accumulated look delta (in pixels) to the orbit angles. */
  applyLook(deltaX: number, deltaY: number, sensitivity: number) {
    // Mouse right (+x) pans the view right; mouse down (+y) looks down.
    this._yaw -= deltaX * sensitivity;
    this._pitch += deltaY * sensitivity;
    if (this._pitch < MIN_PITCH) this._pitch = MIN_PITCH;
    if (this._pitch > MAX_PITCH) this._pitch = MAX_PITCH;
  }

  update(delta: number, lookDelta: THREE.Vector2, sensitivity: number) {
    this.applyLook(lookDelta.x, lookDelta.y, sensitivity);

    this.updateTarget();
    this.computeOffsetDir();

    // Spring arm: cast from the head toward the ideal camera spot and pull in if a
    // wall is in the way so the camera stays inside the room.
    const castDist = this.collision.cameraCastDistance(this.target, this.offsetDir, DISTANCE);
    const allowed = Math.max(MIN_DISTANCE, Math.min(DISTANCE, castDist - COLLISION_PADDING));

    const desired = this.target.clone().addScaledVector(this.offsetDir, allowed);

    const t = Math.min(1, FOLLOW_SMOOTH * delta);
    this.currentPosition.lerp(desired, t);

    // Smoothing must never leave the camera farther out than the wall allows,
    // otherwise it would clip through during the lerp.
    const offset = this.currentPosition.clone().sub(this.target);
    if (offset.length() > allowed) {
      offset.setLength(allowed);
      this.currentPosition.copy(this.target).add(offset);
    }

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  private updateTarget() {
    this.target.set(
      this.player.position.x,
      this.player.position.y + TARGET_HEIGHT,
      this.player.position.z,
    );
  }

  private computeOffsetDir() {
    const cosP = Math.cos(this._pitch);
    const sinP = Math.sin(this._pitch);
    const sinY = Math.sin(this._yaw);
    const cosY = Math.cos(this._yaw);
    // Unit vector pointing from the look target out to the camera (behind & above).
    // The camera looks back along -offsetDir, so the horizontal forward the player
    // walks toward on W is (sinY, 0, cosY).
    this.offsetDir.set(-cosP * sinY, sinP, -cosP * cosY);
  }
}
