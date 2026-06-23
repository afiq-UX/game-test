import * as THREE from 'three';
import { TouchControls } from '../ui/TouchControls';

// Radians of camera rotation per pixel of pointer movement.
const LOOK_SENSITIVITY = 0.0022;

export class InputManager {
  private keys = new Set<string>();
  private _interactPressed = false;
  private touchControls: TouchControls;

  private element: HTMLElement;
  private pointerLocked = false;
  private lockEnabled = false;
  private lookDelta = new THREE.Vector2();

  /** Radians of yaw/pitch per pixel — consumed by the camera. */
  readonly lookSensitivity = LOOK_SENSITIVITY;

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    if (e.code === 'KeyE' || e.code === 'Space') {
      this._interactPressed = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onBlur = () => {
    this.keys.clear();
  };

  private onClick = () => {
    // Click anywhere on the canvas to (re)capture the mouse — only while play is
    // active and not on touch devices.
    if (this.lockEnabled && !this.pointerLocked && !this.touchControls.visible) {
      this.element.requestPointerLock();
    }
  };

  private onPointerLockChange = () => {
    this.pointerLocked = document.pointerLockElement === this.element;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.pointerLocked) {
      this.lookDelta.x += e.movementX;
      this.lookDelta.y += e.movementY;
    }
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.touchControls = new TouchControls();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);

    this.element.addEventListener('click', this.onClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);

    this.element.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.pointerLocked) document.exitPointerLock();

    this.touchControls.dispose();
  }

  /**
   * Turn pointer-lock capture on/off. Disabling releases the cursor (used while a
   * puzzle overlay or the win/lose screen is up so their buttons stay clickable).
   */
  setPointerLockEnabled(enabled: boolean) {
    this.lockEnabled = enabled;
    this.lookDelta.set(0, 0);
    if (!enabled && this.pointerLocked) {
      document.exitPointerLock();
    }
  }

  getMovementVector(): THREE.Vector2 {
    // Keyboard input
    const v = new THREE.Vector2();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) v.y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) v.y -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) v.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) v.x += 1;

    // Touch joystick input (combine)
    const touch = this.touchControls.getMovementVector();
    v.add(touch);

    if (v.length() > 1) v.normalize();
    return v;
  }

  /** Accumulated look movement (pixels) since the last call; resets to zero. */
  consumeLookDelta(): THREE.Vector2 {
    const out = this.lookDelta.clone();
    out.add(this.touchControls.consumeLookDelta());
    this.lookDelta.set(0, 0);
    return out;
  }

  isInteractPressed(): boolean {
    const kbPressed = this._interactPressed;
    this._interactPressed = false;
    const touchPressed = this.touchControls.isInteractPressed();
    return kbPressed || touchPressed;
  }
}
