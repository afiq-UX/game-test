import * as THREE from 'three';
import { ROOMS, WALL_HEIGHT, WALL_THICKNESS, type RoomDef, type WallSegment } from './RoomDefinitions';
import { FurnitureFactory } from './FurnitureFactory';

export class HouseBuilder {
  private collisionBoxes: THREE.Box3[] = [];
  private wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.7 });

  build(scene: THREE.Scene): THREE.Box3[] {
    this.collisionBoxes = [];

    // Base floor first so the per-room floors render on top of it.
    this.buildBaseFloor(scene);

    for (const room of ROOMS) {
      this.buildFloor(scene, room);
      this.buildWalls(scene, room);
      this.buildFurniture(scene, room);
    }

    // Close the house: seal the outer perimeter and put a roof over everything.
    this.buildExteriorWalls(scene);
    this.buildRoof(scene);
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
    for (const seg of room.walls) {
      const worldStart = new THREE.Vector2(
        seg.start[0] + room.position[0],
        seg.start[1] + room.position[1]
      );
      const worldEnd = new THREE.Vector2(
        seg.end[0] + room.position[0],
        seg.end[1] + room.position[1]
      );
      this.buildWallSegment(scene, worldStart, worldEnd);
    }
  }

  // Builds a single wall mesh + AABB collider between two world-space points.
  private buildWallSegment(scene: THREE.Scene, worldStart: THREE.Vector2, worldEnd: THREE.Vector2) {
    const dx = worldEnd.x - worldStart.x;
    const dz = worldEnd.y - worldStart.y;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length < 0.01) return;

    const angle = Math.atan2(dx, dz);
    const centerX = (worldStart.x + worldEnd.x) / 2;
    const centerZ = (worldStart.y + worldEnd.y) / 2;

    const geo = new THREE.BoxGeometry(WALL_THICKNESS, WALL_HEIGHT, length);
    const wall = new THREE.Mesh(geo, this.wallMat);
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
    if (Math.abs(dx) < 0.01) {
      // Vertical wall (along Z)
      box.min.set(centerX - halfThick, 0, Math.min(worldStart.y, worldEnd.y));
      box.max.set(centerX + halfThick, WALL_HEIGHT, Math.max(worldStart.y, worldEnd.y));
    } else if (Math.abs(dz) < 0.01) {
      // Horizontal wall (along X)
      box.min.set(Math.min(worldStart.x, worldEnd.x), 0, centerZ - halfThick);
      box.max.set(Math.max(worldStart.x, worldEnd.x), WALL_HEIGHT, centerZ + halfThick);
    } else {
      const absX = Math.abs(sin * halfThick) + Math.abs(cos * halfLen);
      const absZ = Math.abs(cos * halfThick) + Math.abs(sin * halfLen);
      box.min.set(centerX - absX, 0, centerZ - absZ);
      box.max.set(centerX + absX, WALL_HEIGHT, centerZ + absZ);
    }
    this.collisionBoxes.push(box);
  }

  // Perimeter walls (world coords) that seal the gaps so the house is enclosed.
  // The entrance stays open on the south kitchen wall (x -0.5..0.5).
  private buildExteriorWalls(scene: THREE.Scene) {
    const segments: Array<[number, number, number, number]> = [
      // North side gaps (between Bedroom 2 / Living / Bedroom 1)
      [-5, 2.5, -3, 2.5],
      [3, 2.5, 5, 2.5],
      // South side gaps (kitchen entrance door at x -0.5..0.5 left open)
      [-9, -8.5, -7, -8.5],
      [-4, -8.5, -3, -8.5],
      [3, -8.5, 5, -8.5],
      // East side (middle band beside Bedroom 1 / Veranda)
      [9, -4.5, 9, -2.5],
      // West side (south of Bedroom 2 down to the south edge)
      [-9, -8.5, -9, -2.5],
    ];
    for (const [x1, z1, x2, z2] of segments) {
      this.buildWallSegment(scene, new THREE.Vector2(x1, z1), new THREE.Vector2(x2, z2));
    }
  }

  // Solid base floor under the whole footprint so no grass shows through the
  // gaps between rooms once the house is enclosed.
  private buildBaseFloor(scene: THREE.Scene) {
    const geo = new THREE.BoxGeometry(18, 0.1, 11);
    const mat = new THREE.MeshStandardMaterial({ color: 0x9c7a4d, roughness: 0.9 });
    const slab = new THREE.Mesh(geo, mat);
    slab.position.set(0, -0.05, -3); // top at y=0; room floors (y=0.01) sit just above
    slab.receiveShadow = true;
    scene.add(slab);
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
    const minX = -9, maxX = 9, minZ = -8.5, maxZ = 2.5;
    const width = maxX - minX;     // 18
    const depth = maxZ - minZ;     // 11
    const cx = (minX + maxX) / 2;  // 0
    const cz = (minZ + maxZ) / 2;  // -3
    const overhang = 0.6;
    const eaveY = WALL_HEIGHT;     // 2.8
    const ridgeY = eaveY + 1.6;    // peak height

    // Flat ceiling that seals the top AND caps the camera. Adding it as a
    // collider lets the camera spring-arm pull in under the roof when you look
    // down, instead of clipping up through it.
    const ceilThick = 0.15;
    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(width, ceilThick, depth),
      new THREE.MeshStandardMaterial({ color: 0xece4d8, roughness: 0.95 }),
    );
    ceil.position.set(cx, eaveY + ceilThick / 2, cz);
    ceil.receiveShadow = true;
    scene.add(ceil);
    this.collisionBoxes.push(new THREE.Box3(
      new THREE.Vector3(minX, eaveY, minZ),
      new THREE.Vector3(maxX, eaveY + ceilThick, maxZ),
    ));

    // Pitched gable roof on top (decorative — the ceiling already seals it).
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x7a3b2e, roughness: 0.85 });
    const roofW = width + overhang * 2;
    const run = depth / 2 + overhang;            // horizontal run of each slope
    const rise = ridgeY - eaveY;
    const slopeLen = Math.sqrt(run * run + rise * rise);
    const angle = Math.atan2(rise, run);
    const midY = (eaveY + ridgeY) / 2;

    const northSlope = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.12, slopeLen), roofMat);
    northSlope.position.set(cx, midY, (cz + (maxZ + overhang)) / 2);
    northSlope.rotation.x = angle;
    northSlope.castShadow = true;
    scene.add(northSlope);

    const southSlope = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.12, slopeLen), roofMat);
    southSlope.position.set(cx, midY, (cz + (minZ - overhang)) / 2);
    southSlope.rotation.x = -angle;
    southSlope.castShadow = true;
    scene.add(southSlope);

    // Triangular gable ends (east & west) to close off the roof.
    const gableMat = new THREE.MeshStandardMaterial({
      color: 0xb08968, roughness: 0.85, side: THREE.DoubleSide,
    });
    for (const x of [minX, maxX]) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        x, eaveY, minZ,
        x, eaveY, maxZ,
        x, ridgeY, cz,
      ]), 3));
      geo.setIndex([0, 1, 2]);
      geo.computeVertexNormals();
      const gable = new THREE.Mesh(geo, gableMat);
      gable.castShadow = true;
      gable.receiveShadow = true;
      scene.add(gable);
    }
  }

  private buildRoomLights(scene: THREE.Scene) {
    for (const room of ROOMS) {
      if (room.name === 'Car Porch') continue;
      // Brighter / longer range now the roof blocks the sun from the interior.
      const light = new THREE.PointLight(0xffe4c4, 0.95, 11);
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
