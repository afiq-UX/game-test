import { ROOMS } from '../world/RoomDefinitions';
import type * as THREE from 'three';

export class HUD {
  private container: HTMLDivElement;
  private counterEl: HTMLDivElement;
  private timerEl: HTMLDivElement;
  private roomLabel: HTMLDivElement;

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

  show() {
    this.container.style.display = 'flex';
    this.roomLabel.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
    this.roomLabel.style.display = 'none';
  }
}
