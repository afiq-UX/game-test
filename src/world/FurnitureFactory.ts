import * as THREE from 'three';
import type { FurnitureDef } from './RoomDefinitions';

export class FurnitureFactory {
  static create(def: FurnitureDef): THREE.Mesh {
    const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = def.type;
    return mesh;
  }
}
