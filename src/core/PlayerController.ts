import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';

const MOVE_SPEED = 5;
const ROTATION_SPEED = 10;

export class PlayerController {
  readonly mesh: THREE.Group;
  private collision: CollisionSystem;
  private velocity = new THREE.Vector3();
  private targetRotation = 0;

  constructor(scene: THREE.Scene, collision: CollisionSystem) {
    this.collision = collision;
    this.mesh = this.createPlaceholderCharacter();
    scene.add(this.mesh);
  }

  private createPlaceholderCharacter(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d0a9 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    head.castShadow = true;
    group.add(head);

    const hairGeo = new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.35;
    group.add(hair);

    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.12, 0.25, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.12, 0.25, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    return group;
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  get rotation(): number {
    return this.mesh.rotation.y;
  }

  update(delta: number, movement: THREE.Vector2, cameraYaw: number) {
    if (movement.length() > 0) {
      // Camera-relative movement (GTA-style): W walks where the camera faces.
      // Ground basis from the camera yaw — forward = (sinY, 0, cosY), and
      // right = (-cosY, 0, sinY). D (movement.x) strafes right, W (movement.y)
      // walks forward.
      const sinY = Math.sin(cameraYaw);
      const cosY = Math.cos(cameraYaw);
      const worldMove = new THREE.Vector3(
        sinY * movement.y - cosY * movement.x,
        0,
        cosY * movement.y + sinY * movement.x,
      );
      if (worldMove.lengthSq() > 1) worldMove.normalize();
      this.velocity.copy(worldMove).multiplyScalar(MOVE_SPEED * delta);

      // Rotate the mesh to visually face its travel direction.
      this.targetRotation = Math.atan2(worldMove.x, worldMove.z);
      const currentRot = this.mesh.rotation.y;
      let diff = this.targetRotation - currentRot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.mesh.rotation.y += diff * Math.min(1, ROTATION_SPEED * delta);

      const desiredPos = this.mesh.position.clone().add(this.velocity);
      const resolvedPos = this.collision.resolveMovement(this.mesh.position, desiredPos);
      this.mesh.position.copy(resolvedPos);

      const time = performance.now() * 0.01;
      const leftLeg = this.mesh.children[3];
      const rightLeg = this.mesh.children[4];
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(time) * 0.5;
        rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
      }
    } else {
      const leftLeg = this.mesh.children[3];
      const rightLeg = this.mesh.children[4];
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x *= 0.9;
        rightLeg.rotation.x *= 0.9;
      }
    }
  }
}
