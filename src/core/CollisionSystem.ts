import * as THREE from 'three';

const PLAYER_RADIUS = 0.35;
const PLAYER_HEIGHT = 1.6;

export class CollisionSystem {
  private boxes: THREE.Box3[] = [];
  private playerBox = new THREE.Box3();
  private ray = new THREE.Ray();
  private rayHit = new THREE.Vector3();

  setColliders(boxes: THREE.Box3[]) {
    this.boxes = boxes;
  }

  /**
   * Cast a ray from `origin` along the (assumed-normalized) `dir` and return the
   * distance to the nearest collider, capped at `maxDist`. Used by the camera to
   * pull in toward the player when a wall is behind it (GTA-style spring arm).
   */
  cameraCastDistance(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): number {
    this.ray.origin.copy(origin);
    this.ray.direction.copy(dir);

    let nearest = maxDist;
    for (const box of this.boxes) {
      const hit = this.ray.intersectBox(box, this.rayHit);
      if (hit) {
        const d = origin.distanceTo(hit);
        if (d < nearest) nearest = d;
      }
    }
    return nearest;
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
