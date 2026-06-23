import * as THREE from 'three';
import { ROOMS, WALL_HEIGHT, WALL_THICKNESS, type RoomDef, type WallSegment } from './RoomDefinitions';
import { FurnitureFactory } from './FurnitureFactory';

export class HouseBuilder {
  private collisionBoxes: THREE.Box3[] = [];

  build(scene: THREE.Scene): THREE.Box3[] {
    this.collisionBoxes = [];

    for (const room of ROOMS) {
      this.buildFloor(scene, room);
      this.buildWalls(scene, room);
      this.buildFurniture(scene, room);
    }

    // No roof — camera needs to see inside
    this.buildStilts(scene);
    this.buildRoomLights(scene);

    return this.collisionBoxes;
  }

  private buildFloor(scene: THREE.Scene, room: RoomDef) {
    const geo = new THREE.PlaneGeometry(room.size[0], room.size[1]);
    const mat = new THREE.MeshStandardMaterial({
      color: room.floorColor,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(room.position[0], 0.01, room.position[1]);
    floor.receiveShadow = true;
    scene.add(floor);
  }

  private buildWalls(scene: THREE.Scene, room: RoomDef) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.7,
    });

    for (const seg of room.walls) {
      const worldStart = new THREE.Vector2(
        seg.start[0] + room.position[0],
        seg.start[1] + room.position[1]
      );
      const worldEnd = new THREE.Vector2(
        seg.end[0] + room.position[0],
        seg.end[1] + room.position[1]
      );

      const dx = worldEnd.x - worldStart.x;
      const dz = worldEnd.y - worldStart.y;
      const length = Math.sqrt(dx * dx + dz * dz);

      if (length < 0.01) continue;

      const angle = Math.atan2(dx, dz);
      const centerX = (worldStart.x + worldEnd.x) / 2;
      const centerZ = (worldStart.y + worldEnd.y) / 2;

      const geo = new THREE.BoxGeometry(WALL_THICKNESS, WALL_HEIGHT, length);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(centerX, WALL_HEIGHT / 2, centerZ);
      wall.rotation.y = angle;
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);

      // Collision box for this wall
      const halfThick = WALL_THICKNESS / 2 + 0.05;
      const halfLen = length / 2;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      const box = new THREE.Box3();
      // Compute AABB from rotated wall
      const absX = Math.abs(sin * halfThick) + Math.abs(cos * halfLen);
      const absZ = Math.abs(cos * halfThick) + Math.abs(sin * halfLen);
      // For thin walls along axes, we need to handle this differently
      if (Math.abs(dx) < 0.01) {
        // Vertical wall (along Z)
        box.min.set(centerX - halfThick, 0, Math.min(worldStart.y, worldEnd.y));
        box.max.set(centerX + halfThick, WALL_HEIGHT, Math.max(worldStart.y, worldEnd.y));
      } else if (Math.abs(dz) < 0.01) {
        // Horizontal wall (along X)
        box.min.set(Math.min(worldStart.x, worldEnd.x), 0, centerZ - halfThick);
        box.max.set(Math.max(worldStart.x, worldEnd.x), WALL_HEIGHT, centerZ + halfThick);
      } else {
        box.min.set(centerX - absX, 0, centerZ - absZ);
        box.max.set(centerX + absX, WALL_HEIGHT, centerZ + absZ);
      }
      this.collisionBoxes.push(box);
    }
  }

  private buildFurniture(scene: THREE.Scene, room: RoomDef) {
    for (const furn of room.furniture) {
      const mesh = FurnitureFactory.create(furn);
      mesh.position.set(
        furn.position[0] + room.position[0],
        furn.position[1],
        furn.position[2] + room.position[1]
      );
      if (furn.rotation) {
        mesh.rotation.y = furn.rotation;
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Collision box for furniture
      const box = new THREE.Box3().setFromObject(mesh);
      this.collisionBoxes.push(box);
    }
  }

  private buildRoof(scene: THREE.Scene) {
    // Simple flat roof over the main house area
    const roofGeo = new THREE.BoxGeometry(20, 0.15, 16);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, WALL_HEIGHT + 0.07, -3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    scene.add(roof);
  }

  private buildRoomLights(scene: THREE.Scene) {
    for (const room of ROOMS) {
      if (room.name === 'Car Porch') continue;
      const light = new THREE.PointLight(0xffe4c4, 0.6, 8);
      light.position.set(room.position[0], 2.3, room.position[1]);
      scene.add(light);
    }
  }

  private buildStilts(scene: THREE.Scene) {
    // Kampung-style stilts under the house
    const stiltGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
    const stiltMat = new THREE.MeshStandardMaterial({
      color: 0x6b4423,
      roughness: 0.9,
    });

    const positions = [
      [-9, -2.5], [-9, 2.5], [-5, -2.5], [-5, 2.5],
      [-3, -2.5], [-3, 2.5], [0, -2.5], [0, 2.5],
      [3, -2.5], [3, 2.5], [5, -2.5], [5, 2.5],
      [9, -2.5], [9, 2.5],
    ];

    for (const [x, z] of positions) {
      const stilt = new THREE.Mesh(stiltGeo, stiltMat);
      stilt.position.set(x, -0.25, z);
      scene.add(stilt);
    }
  }
}
