import * as THREE from 'three';
import { ROOMS } from '../world/RoomDefinitions';

export interface ApplianceDef {
  name: string;
  room: string;
  /** Room-local position (offset by the room's position at build time). */
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  glowColor: number;
  puzzleType: 'press' | 'flipSwitch' | 'holdButton' | 'findPlug';
  /** Room-local wall switch beside the door (y ≈ 1.15 m). */
  switchPosition?: [number, number, number];
  /** Wall the switch is mounted on; plate faces into the room. */
  switchFacing?: 'north' | 'south' | 'east' | 'west';
}

export interface Appliance {
  def: ApplianceDef;
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  isOn: boolean;
  interactPosition: THREE.Vector3;
  switchPad?: THREE.Group;
  switchToggleMat?: THREE.MeshStandardMaterial;
}

export const APPLIANCE_DEFS: ApplianceDef[] = [
  // Living Room
  { name: 'TV', room: 'Living Room', position: [0, 0.9, -2], size: [1.2, 0.7, 0.1], color: 0x1a1a1a, glowColor: 0x4488ff, puzzleType: 'press' },
  { name: 'Standing Fan', room: 'Living Room', position: [2.2, 0.6, 1.5], size: [0.3, 1.2, 0.3], color: 0xdddddd, glowColor: 0x88ff88, puzzleType: 'press' },
  { name: 'Table Lamp', room: 'Living Room', position: [-2.5, 1.2, 1.5], size: [0.25, 0.4, 0.25], color: 0xffcc66, glowColor: 0xffcc66, puzzleType: 'press' },
  {
    name: 'Ceiling Light',
    room: 'Living Room',
    position: [0, 2.5, 0],
    size: [0.4, 0.15, 0.4],
    color: 0xffffee,
    glowColor: 0xffffaa,
    puzzleType: 'press',
    switchPosition: [-1.15, 1.15, -2.42],
    switchFacing: 'south',
  },
  { name: 'Radio', room: 'Living Room', position: [0.38, 0.56, 0.12], size: [0.22, 0.12, 0.14], color: 0x664422, glowColor: 0xff8844, puzzleType: 'flipSwitch' },

  // Kitchen
  { name: 'Rice Cooker', room: 'Kitchen', position: [1.5, 0.95, -1.5], size: [0.35, 0.3, 0.35], color: 0xeeeeee, glowColor: 0xff4444, puzzleType: 'press' },
  { name: 'Electric Kettle', room: 'Kitchen', position: [-1.5, 0.95, -1.5], size: [0.2, 0.3, 0.2], color: 0xcccccc, glowColor: 0x44aaff, puzzleType: 'press' },
  {
    name: 'Ceiling Light',
    room: 'Kitchen',
    position: [0, 2.5, 0],
    size: [0.4, 0.15, 0.4],
    color: 0xffffee,
    glowColor: 0xffffaa,
    puzzleType: 'press',
    switchPosition: [-1.1, 1.15, 1.92],
    switchFacing: 'north',
  },
  { name: 'Blender', room: 'Kitchen', position: [-2.5, 0.95, -1.5], size: [0.2, 0.35, 0.2], color: 0x222222, glowColor: 0x88ff44, puzzleType: 'holdButton' },
  { name: 'Microwave', room: 'Kitchen', position: [2.5, 1.2, -1.0], size: [0.5, 0.3, 0.35], color: 0x333333, glowColor: 0x44ff88, puzzleType: 'press' },

  // Bedroom 1
  { name: 'Bedside Lamp', room: 'Bedroom 1', position: [-0.8, 0.65, 1.8], size: [0.2, 0.35, 0.2], color: 0xffdd88, glowColor: 0xffdd88, puzzleType: 'press' },
  {
    name: 'Ceiling Light',
    room: 'Bedroom 1',
    position: [0, 2.5, 0],
    size: [0.4, 0.15, 0.4],
    color: 0xffffee,
    glowColor: 0xffffaa,
    puzzleType: 'press',
    switchPosition: [-1.92, 1.15, 0.5],
    switchFacing: 'west',
  },
  { name: 'Air Conditioner', room: 'Bedroom 1', position: [0, 2.2, 2], size: [0.8, 0.25, 0.2], color: 0xeeeeee, glowColor: 0x66ccff, puzzleType: 'findPlug' },
  { name: 'Phone Charger', room: 'Bedroom 1', position: [-0.8, 0.35, 1.2], size: [0.1, 0.05, 0.15], color: 0x111111, glowColor: 0x44ff44, puzzleType: 'press' },

  // Bedroom 2
  { name: 'Desk Lamp', room: 'Bedroom 2', position: [1, 0.85, -1.5], size: [0.2, 0.35, 0.2], color: 0x4488cc, glowColor: 0x88bbff, puzzleType: 'press' },
  { name: 'Computer', room: 'Bedroom 2', position: [0.5, 0.7, -1.5], size: [0.35, 0.3, 0.25], color: 0x222222, glowColor: 0x44aaff, puzzleType: 'holdButton' },
  { name: 'Night Light', room: 'Bedroom 2', position: [-1.2, 0.5, 1], size: [0.1, 0.15, 0.1], color: 0xffaa44, glowColor: 0xffaa44, puzzleType: 'press' },
  {
    name: 'Ceiling Fan',
    room: 'Bedroom 2',
    position: [0, 2.5, 0],
    size: [0.8, 0.1, 0.8],
    color: 0xcccccc,
    glowColor: 0xaaaaff,
    puzzleType: 'flipSwitch',
    switchPosition: [1.92, 1.15, 0.5],
    switchFacing: 'east',
  },

  // Bathroom
  { name: 'Water Heater', room: 'Bathroom', position: [0.5, 2.0, -1.5], size: [0.4, 0.5, 0.3], color: 0xeeeeee, glowColor: 0xff6644, puzzleType: 'findPlug' },
  {
    name: 'Bathroom Light',
    room: 'Bathroom',
    position: [0, 2.5, 0],
    size: [0.3, 0.1, 0.3],
    color: 0xffffee,
    glowColor: 0xffffaa,
    puzzleType: 'press',
    switchPosition: [1.42, 1.15, 0.45],
    switchFacing: 'east',
  },

  // Veranda
  {
    name: 'Porch Light',
    room: 'Veranda',
    position: [0, 2.5, 0],
    size: [0.2, 0.2, 0.2],
    color: 0xffeeaa,
    glowColor: 0xffeeaa,
    puzzleType: 'press',
    switchPosition: [-1.92, 1.15, 0.45],
    switchFacing: 'west',
  },

  // Car Porch
  {
    name: 'Outdoor Light',
    room: 'Car Porch',
    position: [0, 2.5, 0],
    size: [0.25, 0.25, 0.25],
    color: 0xffeecc,
    glowColor: 0xffeecc,
    puzzleType: 'press',
    switchPosition: [0.55, 1.15, 1.42],
    switchFacing: 'north',
  },
];

export const APPLIANCE_COUNT = APPLIANCE_DEFS.length;

const roomPositions = new Map(ROOMS.map((r) => [r.name, r.position]));

function worldPosition(
  room: string,
  local: [number, number, number],
): [number, number, number] {
  const roomPos = roomPositions.get(room);
  if (!roomPos) {
    throw new Error(`Unknown room: ${room}`);
  }
  return [local[0] + roomPos[0], local[1], local[2] + roomPos[1]];
}

function buildWallSwitch(
  scene: THREE.Scene,
  wx: number,
  wy: number,
  wz: number,
  facing: 'north' | 'south' | 'east' | 'west',
  glowColor: number,
): { group: THREE.Group; toggleMat: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();
  group.position.set(wx, wy, wz);

  switch (facing) {
    case 'south': group.rotation.y = 0; break;
    case 'north': group.rotation.y = Math.PI; break;
    case 'east': group.rotation.y = -Math.PI / 2; break;
    case 'west': group.rotation.y = Math.PI / 2; break;
  }

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.22, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.85 }),
  );
  plate.castShadow = true;
  group.add(plate);

  const toggleMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    emissive: glowColor,
    emissiveIntensity: 0.55,
  });
  const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.04), toggleMat);
  toggle.position.set(0, 0, 0.032);
  toggle.castShadow = true;
  group.add(toggle);

  scene.add(group);
  return { group, toggleMat };
}

export class ApplianceManager {
  private appliances: Appliance[] = [];
  private onCountChange?: (remaining: number) => void;

  build(scene: THREE.Scene) {
    for (const def of APPLIANCE_DEFS) {
      const [wx, wy, wz] = worldPosition(def.room, def.position);

      const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
      const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.glowColor,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, wy, wz);
      mesh.castShadow = true;
      scene.add(mesh);

      const light = new THREE.PointLight(def.glowColor, 0.8, 3);
      light.position.set(wx, wy + 0.3, wz);
      scene.add(light);

      const interactPosition = new THREE.Vector3();
      let switchPad: THREE.Group | undefined;
      let switchToggleMat: THREE.MeshStandardMaterial | undefined;

      if (def.switchPosition) {
        const [sx, sy, sz] = worldPosition(def.room, def.switchPosition);
        interactPosition.set(sx, sy, sz);
        const facing = def.switchFacing ?? 'south';
        const pad = buildWallSwitch(scene, sx, sy, sz, facing, def.glowColor);
        switchPad = pad.group;
        switchToggleMat = pad.toggleMat;
      } else {
        interactPosition.set(wx, wy, wz);
      }

      this.appliances.push({
        def,
        mesh,
        light,
        isOn: true,
        interactPosition,
        switchPad,
        switchToggleMat,
      });
    }
  }

  setOnCountChange(cb: (remaining: number) => void) {
    this.onCountChange = cb;
  }

  getAppliances(): Appliance[] {
    return this.appliances;
  }

  getActiveAppliances(): Appliance[] {
    return this.appliances.filter(a => a.isOn);
  }

  getRemainingCount(): number {
    return this.appliances.filter(a => a.isOn).length;
  }

  turnOff(appliance: Appliance) {
    if (!appliance.isOn) return;
    appliance.isOn = false;

    const mat = appliance.mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0;
    appliance.light.intensity = 0;

    if (appliance.switchToggleMat) {
      appliance.switchToggleMat.emissiveIntensity = 0;
      appliance.switchToggleMat.color.setHex(0x888888);
    }

    this.onCountChange?.(this.getRemainingCount());
  }

  resetAll() {
    for (const a of this.appliances) {
      a.isOn = true;
      const mat = a.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5;
      a.light.intensity = 0.8;

      if (a.switchToggleMat) {
        a.switchToggleMat.emissiveIntensity = 0.55;
        a.switchToggleMat.color.setHex(0xfafafa);
      }
    }
    this.onCountChange?.(this.getRemainingCount());
  }

  update(time: number) {
    for (const a of this.appliances) {
      if (!a.isOn) continue;
      const mat = a.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
      a.light.intensity = 0.5 + Math.sin(time * 3) * 0.3;

      if (a.switchToggleMat) {
        a.switchToggleMat.emissiveIntensity = 0.35 + Math.sin(time * 3) * 0.25;
      }
    }
  }
}
