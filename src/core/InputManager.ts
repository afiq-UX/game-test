import * as THREE from 'three';
import { TouchControls } from '../ui/TouchControls';

export class InputManager {
  private keys = new Set<string>();
  private _interactPressed = false;
  private touchControls: TouchControls;

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

  constructor() {
    this.touchControls = new TouchControls();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.touchControls.dispose();
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

  isInteractPressed(): boolean {
    const kbPressed = this._interactPressed;
    this._interactPressed = false;
    const touchPressed = this.touchControls.isInteractPressed();
    return kbPressed || touchPressed;
  }
}
