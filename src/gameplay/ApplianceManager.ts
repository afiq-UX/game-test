import * as THREE from 'three';

export interface ApplianceDef {
  name: string;
  room: string;
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  glowColor: number;
  puzzleType: 'press' | 'flipSwitch' | 'holdButton' | 'findPlug';
}

export interface Appliance {
  def: ApplianceDef;
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  isOn: boolean;
}

const APPLIANCE_DEFS: ApplianceDef[] = [
  // Living Room (room position: [0, 0])
  { name: 'TV', room: 'Living Room', position: [0, 0.9, -2], size: [1.2, 0.7, 0.1], color: 0x1a1a1a, glowColor: 0x4488ff, puzzleType: 'press' },
  { name: 'Standing Fan', room: 'Living Room', position: [2.2, 0.6, 1.5], size: [0.3, 1.2, 0.3], color: 0xdddddd, glowColor: 0x88ff88, puzzleType: 'press' },
  { name: 'Table Lamp', room: 'Living Room', position: [-2.5, 1.2, 1.5], size: [0.25, 0.4, 0.25], color: 0xffcc66, glowColor: 0xffcc66, puzzleType: 'press' },
  { name: 'Radio', room: 'Living Room', position: [-2.5, 1.0, -0.5], size: [0.4, 0.25, 0.2], color: 0x664422, glowColor: 0xff8844, puzzleType: 'flipSwitch' },

  // Kitchen (room position: [0, -6.5])
  { name: 'Rice Cooker', room: 'Kitchen', position: [1.5, 0.95, -8], size: [0.35, 0.3, 0.35], color: 0xeeeeee, glowColor: 0xff4444, puzzleType: 'press' },
  { name: 'Electric Kettle', room: 'Kitchen', position: [-1.5, 0.95, -8], size: [0.2, 0.3, 0.2], color: 0xcccccc, glowColor: 0x44aaff, puzzleType: 'press' },
  { name: 'Ceiling Light', room: 'Kitchen', position: [0, 2.5, -6.5], size: [0.4, 0.15, 0.4], color: 0xffffee, glowColor: 0xffffaa, puzzleType: 'flipSwitch' },
  { name: 'Blender', room: 'Kitchen', position: [-2.5, 0.95, -8], size: [0.2, 0.35, 0.2], color: 0x222222, glowColor: 0x88ff44, puzzleType: 'holdButton' },
  { name: 'Microwave', room: 'Kitchen', position: [2.5, 1.2, -7.5], size: [0.5, 0.3, 0.35], color: 0x333333, glowColor: 0x44ff88, puzzleType: 'press' },

  // Bedroom 1 (room position: [7, 0])
  { name: 'Bedside Lamp', room: 'Bedroom 1', position: [6.2, 0.65, 1.8], size: [0.2, 0.35, 0.2], color: 0xffdd88, glowColor: 0xffdd88, puzzleType: 'press' },
  { name: 'Air Conditioner', room: 'Bedroom 1', position: [7, 2.2, 2], size: [0.8, 0.25, 0.2], color: 0xeeeeee, glowColor: 0x66ccff, puzzleType: 'findPlug' },
  { name: 'Phone Charger', room: 'Bedroom 1', position: [6.2, 0.35, 1.2], size: [0.1, 0.05, 0.15], color: 0x111111, glowColor: 0x44ff44, puzzleType: 'press' },

  // Bedroom 2 (room position: [-7, 0])
  { name: 'Desk Lamp', room: 'Bedroom 2', position: [-6, 0.85, -1.5], size: [0.2, 0.35, 0.2], color: 0x4488cc, glowColor: 0x88bbff, puzzleType: 'press' },
  { name: 'Computer', room: 'Bedroom 2', position: [-6.5, 0.7, -1.5], size: [0.35, 0.3, 0.25], color: 0x222222, glowColor: 0x44aaff, puzzleType: 'holdButton' },
  { name: 'Night Light', room: 'Bedroom 2', position: [-8.2, 0.5, 1], size: [0.1, 0.15, 0.1], color: 0xffaa44, glowColor: 0xffaa44, puzzleType: 'press' },
  { name: 'Ceiling Fan', room: 'Bedroom 2', position: [-7, 2.5, 0], size: [0.8, 0.1, 0.8], color: 0xcccccc, glowColor: 0xaaaaff, puzzleType: 'flipSwitch' },

  // Bathroom (room position: [-5.5, -6.5])
  { name: 'Water Heater', room: 'Bathroom', position: [-5, 2.0, -8], size: [0.4, 0.5, 0.3], color: 0xeeeeee, glowColor: 0xff6644, puzzleType: 'findPlug' },
  { name: 'Bathroom Light', room: 'Bathroom', position: [-5.5, 2.5, -6.5], size: [0.3, 0.1, 0.3], color: 0xffffee, glowColor: 0xffffaa, puzzleType: 'press' },

  // Veranda (room position: [7, -6.5])
  { name: 'Porch Light', room: 'Veranda', position: [7, 2.5, -6.5], size: [0.2, 0.2, 0.2], color: 0xffeeaa, glowColor: 0xffeeaa, puzzleType: 'press' },

  // Car Porch (room position: [0, -11])
  { name: 'Outdoor Light', room: 'Car Porch', position: [0, 2.5, -11], size: [0.25, 0.25, 0.25], color: 0xffeecc, glowColor: 0xffeecc, puzzleType: 'flipSwitch' },
];

export class ApplianceManager {
  private appliances: Appliance[] = [];
  private onCountChange?: (remaining: number) => void;

  build(scene: THREE.Scene) {
    for (const def of APPLIANCE_DEFS) {
      const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
      const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.glowColor,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(def.position[0], def.position[1], def.position[2]);
      mesh.castShadow = true;
      scene.add(mesh);

      const light = new THREE.PointLight(def.glowColor, 0.8, 3);
      light.position.set(def.position[0], def.position[1] + 0.3, def.position[2]);
      scene.add(light);

      this.appliances.push({ def, mesh, light, isOn: true });
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

    this.onCountChange?.(this.getRemainingCount());
  }

  update(time: number) {
    for (const a of this.appliances) {
      if (!a.isOn) continue;
      const mat = a.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
      a.light.intensity = 0.5 + Math.sin(time * 3) * 0.3;
    }
  }
}
