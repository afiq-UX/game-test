import * as THREE from 'three';
import type { Appliance, ApplianceManager } from './ApplianceManager';

const INTERACT_DISTANCE = 2.0;

function horizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export class InteractionSystem {
  private applianceManager: ApplianceManager;
  private promptEl: HTMLDivElement;
  private nearestAppliance: Appliance | null = null;

  constructor(applianceManager: ApplianceManager) {
    this.applianceManager = applianceManager;
    this.promptEl = this.createPromptUI();
  }

  private createPromptUI(): HTMLDivElement {
    const el = document.createElement('div');
    el.id = 'interact-prompt';
    el.style.cssText = `
      position: fixed;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 1.1rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 100;
      text-align: center;
    `;
    document.body.appendChild(el);
    return el;
  }

  getNearestAppliance(): Appliance | null {
    return this.nearestAppliance;
  }

  update(playerPos: THREE.Vector3, isTouchDevice: boolean) {
    const active = this.applianceManager.getActiveAppliances();
    let nearest: Appliance | null = null;
    let nearestDist = INTERACT_DISTANCE;

    for (const appliance of active) {
      const dist = horizontalDistance(playerPos, appliance.interactPosition);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = appliance;
      }
    }

    this.nearestAppliance = nearest;

    if (nearest) {
      const action = isTouchDevice ? 'Tap E' : 'Press E';
      const label = nearest.def.switchPosition
        ? `${nearest.def.name} switch`
        : nearest.def.name;
      this.promptEl.textContent = `${action} — ${label}`;
      this.promptEl.style.opacity = '1';
    } else {
      this.promptEl.style.opacity = '0';
    }
  }

  tryInteract(): Appliance | null {
    if (!this.nearestAppliance) return null;
    const appliance = this.nearestAppliance;

    if (appliance.def.puzzleType === 'press') {
      this.applianceManager.turnOff(appliance);
      return appliance;
    }

    // For puzzle types, return the appliance so Game can open the puzzle
    return appliance;
  }
}
