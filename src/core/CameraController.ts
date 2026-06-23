import * as THREE from 'three';
import { PlayerController } from './PlayerController';

const OFFSET = new THREE.Vector3(0, 4, -3.5);
const LOOK_OFFSET = new THREE.Vector3(0, 1.0, 0);
const SMOOTH_SPEED = 5;

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: PlayerController;
  private currentPosition = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera, player: PlayerController) {
    this.camera = camera;
    this.player = player;

    const initialPos = this.getDesiredPosition();
    this.camera.position.copy(initialPos);
    this.currentPosition.copy(initialPos);
    this.camera.lookAt(this.player.position.clone().add(LOOK_OFFSET));
  }

  private getDesiredPosition(): THREE.Vector3 {
    const offset = OFFSET.clone();
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation);
    return this.player.position.clone().add(offset);
  }

  update(delta: number) {
    const desired = this.getDesiredPosition();
    const t = Math.min(1, SMOOTH_SPEED * delta);

    this.currentPosition.lerp(desired, t);
    this.camera.position.copy(this.currentPosition);

    const lookTarget = this.player.position.clone().add(LOOK_OFFSET);
    this.camera.lookAt(lookTarget);
  }
}
