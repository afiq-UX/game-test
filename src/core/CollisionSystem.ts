import * as THREE from 'three';

const PLAYER_RADIUS = 0.35;
const PLAYER_HEIGHT = 1.6;

export class CollisionSystem {
  private boxes: THREE.Box3[] = [];
  private playerBox = new THREE.Box3();

  setColliders(boxes: THREE.Box3[]) {
    this.boxes = boxes;
  }

  resolveMovement(currentPos: THREE.Vector3, desiredPos: THREE.Vector3): THREE.Vector3 {
    const result = desiredPos.clone();

    // Try full movement first
    this.updatePlayerBox(result);
    if (!this.checkCollision()) {
      return result;
    }

    // Slide along X axis
    result.set(desiredPos.x, currentPos.y, currentPos.z);
    this.updatePlayerBox(result);
    const canMoveX = !this.checkCollision();

    // Slide along Z axis
    result.set(currentPos.x, currentPos.y, desiredPos.z);
    this.updatePlayerBox(result);
    const canMoveZ = !this.checkCollision();

    if (canMoveX && canMoveZ) {
      // Both axes work individually, prefer the one with more movement
      const dx = Math.abs(desiredPos.x - currentPos.x);
      const dz = Math.abs(desiredPos.z - currentPos.z);
      if (dx > dz) {
        result.set(desiredPos.x, currentPos.y, currentPos.z);
      } else {
        result.set(currentPos.x, currentPos.y, desiredPos.z);
      }
    } else if (canMoveX) {
      result.set(desiredPos.x, currentPos.y, currentPos.z);
    } else if (canMoveZ) {
      result.set(currentPos.x, currentPos.y, desiredPos.z);
    } else {
      result.copy(currentPos);
    }

    return result;
  }

  private updatePlayerBox(pos: THREE.Vector3) {
    this.playerBox.min.set(
      pos.x - PLAYER_RADIUS,
      pos.y,
      pos.z - PLAYER_RADIUS
    );
    this.playerBox.max.set(
      pos.x + PLAYER_RADIUS,
      pos.y + PLAYER_HEIGHT,
      pos.z + PLAYER_RADIUS
    );
  }

  private checkCollision(): boolean {
    for (const box of this.boxes) {
      if (this.playerBox.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }
}
