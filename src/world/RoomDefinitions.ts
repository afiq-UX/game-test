export interface WallSegment {
  start: [number, number];
  end: [number, number];
}

export interface FurnitureDef {
  type: string;
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  rotation?: number;
}

export interface RoomDef {
  name: string;
  position: [number, number];
  size: [number, number];
  floorColor: number;
  walls: WallSegment[];
  furniture: FurnitureDef[];
}

const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.15;
const DOOR_WIDTH = 1.0;

export { WALL_HEIGHT, WALL_THICKNESS, DOOR_WIDTH };

// House layout: ~20m x 12m single floor
// Origin is at center of the house
//
//  +-----+----------+--------+
//  | BR2  | LIVING   | BR1    |
//  | 4x4  | 6x5      | 4x4   |
//  +------+----+-----+--------+
//  |BATH  | KITCHEN  | VERANDA |
//  | 2x3  |  6x4     |  3x4   |
//  +------+----------+---------+
//         CAR PORCH (outdoor, south side)

export const ROOMS: RoomDef[] = [
  // Living Room - center of house
  {
    name: 'Living Room',
    position: [0, 0],
    size: [6, 5],
    floorColor: 0xd4a574, // warm wood
    walls: [
      // North wall (full)
      { start: [-3, 2.5], end: [3, 2.5] },
      // South wall with door to kitchen
      { start: [-3, -2.5], end: [-1, -2.5] },
      { start: [0, -2.5], end: [3, -2.5] },
      // West wall with door to bedroom 2
      { start: [-3, 2.5], end: [-3, 1] },
      { start: [-3, 0], end: [-3, -2.5] },
      // East wall with door to bedroom 1
      { start: [3, 2.5], end: [3, 1] },
      { start: [3, 0], end: [3, -2.5] },
    ],
    furniture: [
      { type: 'sofa', position: [0, 0.4, 1.5], size: [2.5, 0.8, 0.9], color: 0x8B4513 },
      { type: 'coffee-table', position: [0, 0.25, 0], size: [1.2, 0.5, 0.6], color: 0x654321 },
      { type: 'tv-cabinet', position: [0, 0.4, -2], size: [1.8, 0.8, 0.4], color: 0x5c3a1e },
      { type: 'shelf', position: [-2.5, 0.8, 0], size: [0.4, 1.6, 1.2], color: 0x8B6914 },
    ],
  },

  // Kitchen - south of living room
  {
    name: 'Kitchen',
    position: [0, -6.5],
    size: [6, 4],
    floorColor: 0xc8b8a0, // lighter tile
    walls: [
      // North wall shared with living room (already defined)
      // South wall with door to car porch
      { start: [-3, -2], end: [-0.5, -2] },
      { start: [0.5, -2], end: [3, -2] },
      // West wall with door to bathroom
      { start: [-3, 2], end: [-3, 0.5] },
      { start: [-3, -0.5], end: [-3, -2] },
      // East wall with opening to veranda
      { start: [3, 2], end: [3, 0.5] },
      { start: [3, -0.5], end: [3, -2] },
    ],
    furniture: [
      { type: 'kitchen-counter', position: [-2, 0.45, -1.5], size: [1.5, 0.9, 0.6], color: 0xa0a0a0 },
      { type: 'kitchen-counter', position: [0, 0.45, -1.5], size: [1.5, 0.9, 0.6], color: 0xa0a0a0 },
      { type: 'dining-table', position: [0, 0.4, 0.5], size: [1.6, 0.8, 1.0], color: 0x8B6914 },
      { type: 'stool', position: [-0.6, 0.25, 1.2], size: [0.35, 0.5, 0.35], color: 0x654321 },
      { type: 'stool', position: [0.6, 0.25, 1.2], size: [0.35, 0.5, 0.35], color: 0x654321 },
      { type: 'fridge', position: [2.5, 0.85, -1.5], size: [0.7, 1.7, 0.65], color: 0xe8e8e8 },
    ],
  },

  // Bedroom 1 (Master) - east of living room
  {
    name: 'Bedroom 1',
    position: [7, 0],
    size: [4, 5],
    floorColor: 0xc9a96e, // warm wood
    walls: [
      // North wall
      { start: [-2, 2.5], end: [2, 2.5] },
      // South wall
      { start: [-2, -2.5], end: [2, -2.5] },
      // West wall with door to living room
      { start: [-2, 2.5], end: [-2, 1] },
      { start: [-2, 0], end: [-2, -2.5] },
      // East wall (exterior)
      { start: [2, 2.5], end: [2, -2.5] },
    ],
    furniture: [
      { type: 'bed', position: [0.5, 0.3, 0.5], size: [1.8, 0.6, 2.2], color: 0xeeddcc },
      { type: 'wardrobe', position: [-1.5, 1.0, 1.5], size: [0.6, 2.0, 1.2], color: 0x7a5c3a },
      { type: 'bedside-table', position: [-0.8, 0.3, 1.8], size: [0.5, 0.6, 0.4], color: 0x8B6914 },
    ],
  },

  // Bedroom 2 (Kid's room) - west of living room
  {
    name: 'Bedroom 2',
    position: [-7, 0],
    size: [4, 5],
    floorColor: 0xbfa76a,
    walls: [
      // North wall
      { start: [-2, 2.5], end: [2, 2.5] },
      // South wall with door to bathroom
      { start: [-2, -2.5], end: [0, -2.5] },
      { start: [1, -2.5], end: [2, -2.5] },
      // East wall shared with living room
      // West wall (exterior)
      { start: [-2, 2.5], end: [-2, -2.5] },
    ],
    furniture: [
      { type: 'bed-single', position: [-0.8, 0.25, 1], size: [1.0, 0.5, 2.0], color: 0x87CEEB },
      { type: 'desk', position: [1, 0.4, -1.5], size: [1.2, 0.8, 0.6], color: 0x8B6914 },
      { type: 'chair', position: [1, 0.25, -0.7], size: [0.4, 0.5, 0.4], color: 0x654321 },
      { type: 'toy-box', position: [-1.5, 0.2, -1.5], size: [0.6, 0.4, 0.6], color: 0xff6b6b },
    ],
  },

  // Bathroom - southwest, between bedroom 2 and kitchen
  {
    name: 'Bathroom',
    position: [-5.5, -6.5],
    size: [3, 4],
    floorColor: 0xb0c4de, // cool tile
    walls: [
      // North wall shared with bedroom 2
      { start: [-1.5, 2], end: [1.5, 2] },
      // South wall
      { start: [-1.5, -2], end: [1.5, -2] },
      // West wall (exterior)
      { start: [-1.5, 2], end: [-1.5, -2] },
      // East wall with door to kitchen
      { start: [1.5, 2], end: [1.5, 0.5] },
      { start: [1.5, -0.5], end: [1.5, -2] },
    ],
    furniture: [
      { type: 'toilet', position: [-0.7, 0.25, -1.2], size: [0.45, 0.5, 0.55], color: 0xf0f0f0 },
      { type: 'sink', position: [0.5, 0.45, -1.5], size: [0.5, 0.9, 0.4], color: 0xf0f0f0, rotation: 0 },
      { type: 'shower-area', position: [0, 0.02, 1], size: [1.5, 0.04, 1.5], color: 0x7aa5b8 },
    ],
  },

  // Veranda - east of kitchen, front porch area
  {
    name: 'Veranda',
    position: [7, -6.5],
    size: [4, 4],
    floorColor: 0xb8956a, // aged wood
    walls: [
      // North wall shared with bedroom 1
      { start: [-2, 2], end: [2, 2] },
      // Railing south (partial walls, low)
      { start: [-2, -2], end: [2, -2] },
      // Railing east
      { start: [2, 2], end: [2, -2] },
      // West wall with door to kitchen
      { start: [-2, 2], end: [-2, 0.5] },
      { start: [-2, -0.5], end: [-2, -2] },
    ],
    furniture: [
      { type: 'rattan-chair', position: [0, 0.25, 0], size: [0.6, 0.5, 0.6], color: 0xc4a35a },
      { type: 'small-table', position: [0.8, 0.2, 0], size: [0.5, 0.4, 0.5], color: 0x8B6914 },
    ],
  },

  // Car Porch - south of kitchen, outdoor
  {
    name: 'Car Porch',
    position: [0, -11],
    size: [8, 3],
    floorColor: 0x999999, // concrete
    walls: [
      // North wall with doorway to kitchen (gap x -0.5..0.5)
      { start: [-4, 1.5], end: [-0.5, 1.5] },
      { start: [0.5, 1.5], end: [4, 1.5] },
      // West pillar
      { start: [-4, 1.5], end: [-3.8, 1.5] },
      // East pillar
      { start: [3.8, 1.5], end: [4, 1.5] },
    ],
    furniture: [],
  },
];

// Player spawn position (in living room)
// Open floor in the living room between the coffee table (z 0.3) and the
// tv-cabinet (z -1.8) — clear of all furniture colliders so the player
// doesn't spawn embedded in a collider (which blocks all movement).
export const PLAYER_SPAWN: [number, number, number] = [0, 0, -1];
