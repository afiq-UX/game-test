import * as THREE from 'three';
import nipplejs from 'nipplejs';

type JoystickManager = ReturnType<typeof nipplejs.create>;

// Scales raw touch-drag pixels so look speed roughly matches mouse-look.
const LOOK_TOUCH_SCALE = 1.4;

export class TouchControls {
  private joystickVector = new THREE.Vector2();
  private lookDelta = new THREE.Vector2();
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

    // Look zone (top half — "above the player") — drag to orbit the camera. Kept
    // to the top so it never overlaps the bottom-left joystick or bottom-right
    // action button. Created before the action button so the button stays on top.
    const lookZone = document.createElement('div');
    lookZone.id = 'look-zone';
    lookZone.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 50%;
      pointer-events: auto;
      touch-action: none;
    `;
    this.container.appendChild(lookZone);

    let lookId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    lookZone.addEventListener('touchstart', (e) => {
      if (lookId !== null) return;
      const t = e.changedTouches[0];
      lookId = t.identifier;
      lastX = t.clientX;
      lastY = t.clientY;
    });
    lookZone.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === lookId) {
          this.lookDelta.x += (t.clientX - lastX) * LOOK_TOUCH_SCALE;
          this.lookDelta.y += (t.clientY - lastY) * LOOK_TOUCH_SCALE;
          lastX = t.clientX;
          lastY = t.clientY;
          e.preventDefault();
        }
      }
    }, { passive: false });
    const endLook = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === lookId) lookId = null;
      }
    };
    lookZone.addEventListener('touchend', endLook);
    lookZone.addEventListener('touchcancel', endLook);

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

  /** Accumulated drag-look movement (pixels) since the last call; resets to zero. */
  consumeLookDelta(): THREE.Vector2 {
    const out = this.lookDelta.clone();
    this.lookDelta.set(0, 0);
    return out;
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
