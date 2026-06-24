import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';

const MOVE_SPEED = 5;
const ROTATION_SPEED = 10;

export class PlayerController {
  readonly mesh: THREE.Group;
  private collision: CollisionSystem;
  private velocity = new THREE.Vector3();
  private targetRotation = 0;
  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;

  constructor(scene: THREE.Scene, collision: CollisionSystem) {
    this.collision = collision;
    this.mesh = new THREE.Group();
    this.buildPlaceholderCharacter();
    scene.add(this.mesh);
  }

  private buildPlaceholderCharacter() {
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    this.mesh.add(body);

    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d0a9 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    head.castShadow = true;
    this.mesh.add(head);

    // Face parts are parented to the head so they stay attached as the body turns.
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.08, 0.04, 0.2);
      head.add(eye);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(side * 0.08, 0.04, 0.235);
      head.add(pupil);
    }
    const mouthGeo = new THREE.BoxGeometry(0.1, 0.025, 0.02);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a3b2e });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.08, 0.21);
    head.add(mouth);

    const hairGeo = new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.35;
    this.mesh.add(hair);

    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.12, 0.25, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.12, 0.25, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);
  }

  reset(spawn: [number, number, number]) {
    this.mesh.position.set(spawn[0], spawn[1], spawn[2]);
    this.mesh.rotation.y = 0;
    this.targetRotation = 0;
    this.leftLeg.rotation.x = 0;
    this.rightLeg.rotation.x = 0;
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  get rotation(): number {
    return this.mesh.rotation.y;
  }

  update(delta: number, movement: THREE.Vector2, cameraYaw: number) {
    if (movement.length() > 0) {
      // Camera-relative movement: W walks where the camera faces.
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
      this.leftLeg.rotation.x = Math.sin(time) * 0.5;
      this.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
    } else {
      this.leftLeg.rotation.x *= 0.9;
      this.rightLeg.rotation.x *= 0.9;
    }
  }
}
