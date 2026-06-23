import * as THREE from 'three';
import nipplejs from 'nipplejs';

type JoystickManager = ReturnType<typeof nipplejs.create>;

export class TouchControls {
  private joystickVector = new THREE.Vector2();
  private _interactPressed = false;
  private container: HTMLDivElement;
  private actionBtn: HTMLButtonElement;
  private isMobile: boolean;
  private manager?: JoystickManager;

  constructor() {
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.style.cssText = `
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 80;
      display: ${this.isMobile ? 'block' : 'none'};
    `;
    document.body.appendChild(this.container);

    // Joystick zone (bottom-left)
    const joystickZone = document.createElement('div');
    joystickZone.id = 'joystick-zone';
    joystickZone.style.cssText = `
      position: absolute;
      bottom: 0; left: 0;
      width: 50%; height: 40%;
      pointer-events: auto;
    `;
    this.container.appendChild(joystickZone);

    if (this.isMobile) {
      const manager = nipplejs.create({
        zone: joystickZone,
        mode: 'semi',
        catchDistance: 100,
        color: 'rgba(255, 255, 255, 0.5)',
        size: 100,
      });
      this.manager = manager;

      manager.on('move', (evt) => {
        const data = evt.data;
        if (data.vector) {
          this.joystickVector.set(data.vector.x, data.vector.y);
        }
      });

      manager.on('end', () => {
        this.joystickVector.set(0, 0);
      });
    }

    // Action button (bottom-right)
    this.actionBtn = document.createElement('button');
    this.actionBtn.textContent = 'E';
    this.actionBtn.style.cssText = `
      position: absolute;
      bottom: 60px; right: 30px;
      width: 70px; height: 70px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: 3px solid rgba(255, 255, 255, 0.7);
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      pointer-events: auto;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    `;
    this.actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._interactPressed = true;
      this.actionBtn.style.background = 'rgba(255, 255, 255, 0.7)';
    });
    this.actionBtn.addEventListener('touchend', () => {
      this.actionBtn.style.background = 'rgba(255, 255, 255, 0.4)';
    });
    this.container.appendChild(this.actionBtn);
  }

  getMovementVector(): THREE.Vector2 {
    return this.joystickVector.clone();
  }

  isInteractPressed(): boolean {
    const pressed = this._interactPressed;
    this._interactPressed = false;
    return pressed;
  }

  get visible() {
    return this.isMobile;
  }

  dispose() {
    this.manager?.destroy();
    this.manager = undefined;
    this.container.remove();
  }
}
