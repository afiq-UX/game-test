import { ROOMS } from '../world/RoomDefinitions';
import type * as THREE from 'three';
import type { Appliance } from '../gameplay/ApplianceManager';

// World bounds for the minimap (derived from room extents)
const MAP_WORLD_MIN_X = -9;
const MAP_WORLD_MAX_X = 9;
const MAP_WORLD_MIN_Z = -13;
const MAP_WORLD_MAX_Z = 3;
const MAP_SIZE = 180; // canvas pixels

export class HUD {
  private container: HTMLDivElement;
  private counterEl: HTMLDivElement;
  private timerEl: HTMLDivElement;
  private roomLabel: HTMLDivElement;
  private mapCanvas: HTMLCanvasElement;
  private mapCtx: CanvasRenderingContext2D;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 24px;
      pointer-events: none;
      z-index: 50;
      font-family: 'Segoe UI', sans-serif;
    `;

    this.counterEl = document.createElement('div');
    this.counterEl.style.cssText = `
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
    `;

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 1.3rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    `;

    this.container.appendChild(this.counterEl);
    this.container.appendChild(this.timerEl);
    document.body.appendChild(this.container);

    // Room label (bottom center)
    this.roomLabel = document.createElement('div');
    this.roomLabel.id = 'room-label';
    this.roomLabel.style.cssText = `
      position: fixed;
      bottom: 8%; left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: #ffd700;
      padding: 6px 16px;
      border-radius: 8px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      pointer-events: none;
      z-index: 50;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(this.roomLabel);

    // Minimap canvas (bottom-right corner)
    this.mapCanvas = document.createElement('canvas');
    this.mapCanvas.width = MAP_SIZE;
    this.mapCanvas.height = MAP_SIZE;
    this.mapCanvas.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: ${MAP_SIZE}px;
      height: ${MAP_SIZE}px;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 8px;
      background: rgba(0,0,0,0.7);
      pointer-events: none;
      z-index: 50;
      display: block;
    `;
    document.body.appendChild(this.mapCanvas);
    this.mapCtx = this.mapCanvas.getContext('2d')!;

    this.updateCounter(20);
    this.updateTimer(300);
  }

  updateCounter(remaining: number) {
    const turned = 20 - remaining;
    this.counterEl.textContent = `Appliances: ${turned}/20`;
  }

  updateTimer(secondsLeft: number) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = Math.floor(secondsLeft % 60);
    this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (secondsLeft < 30) {
      this.timerEl.style.color = '#ff4444';
    } else if (secondsLeft < 60) {
      this.timerEl.style.color = '#ffaa44';
    } else {
      this.timerEl.style.color = '#fff';
    }
  }

  updateRoomLabel(playerPos: THREE.Vector3) {
    let currentRoom = 'Outside';
    for (const room of ROOMS) {
      const halfW = room.size[0] / 2 + 0.5;
      const halfH = room.size[1] / 2 + 0.5;
      if (
        playerPos.x >= room.position[0] - halfW &&
        playerPos.x <= room.position[0] + halfW &&
        playerPos.z >= room.position[1] - halfH &&
        playerPos.z <= room.position[1] + halfH
      ) {
        currentRoom = room.name;
        break;
      }
    }
    this.roomLabel.textContent = currentRoom;
  }

  updateMap(playerPos: THREE.Vector3, appliances: Appliance[]) {
    const ctx = this.mapCtx;
    const S = MAP_SIZE;
    ctx.clearRect(0, 0, S, S);

    const toX = (wx: number) => ((wx - MAP_WORLD_MIN_X) / (MAP_WORLD_MAX_X - MAP_WORLD_MIN_X)) * S;
    const toY = (wz: number) => ((wz - MAP_WORLD_MIN_Z) / (MAP_WORLD_MAX_Z - MAP_WORLD_MIN_Z)) * S;

    // Draw rooms
    for (const room of ROOMS) {
      const rx = toX(room.position[0] - room.size[0] / 2);
      const ry = toY(room.position[1] - room.size[1] / 2);
      const rw = (room.size[0] / (MAP_WORLD_MAX_X - MAP_WORLD_MIN_X)) * S;
      const rh = (room.size[1] / (MAP_WORLD_MAX_Z - MAP_WORLD_MIN_Z)) * S;
      ctx.fillStyle = 'rgba(180,150,100,0.25)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rw, rh);

      // Room name
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, rx + rw / 2, ry + rh / 2 + 3);
    }

    // Draw appliances
    for (const appliance of appliances) {
      const ax = toX(appliance.def.position[0]);
      const ay = toY(appliance.def.position[2]);
      if (appliance.isOn) {
        const hex = appliance.def.glowColor;
        const r = (hex >> 16) & 0xff;
        const g = (hex >> 8) & 0xff;
        const b = hex & 0xff;
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
      } else {
        ctx.fillStyle = 'rgba(80,80,80,0.7)';
      }
      ctx.beginPath();
      ctx.arc(ax, ay, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw player (arrow pointing in movement direction — using a simple triangle)
    const px = toX(playerPos.x);
    const py = toY(playerPos.z);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  show() {
    this.container.style.display = 'flex';
    this.roomLabel.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
    this.roomLabel.style.display = 'none';
  }
}
