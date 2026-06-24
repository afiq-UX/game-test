import { APPLIANCE_COUNT } from '../gameplay/ApplianceManager';

export class MenuScreens {
  private startScreen: HTMLDivElement;
  private onStart?: () => void;

  constructor() {
    this.startScreen = document.createElement('div');
    this.startScreen.id = 'start-screen';
    this.startScreen.style.cssText = `
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff; font-family: 'Segoe UI', sans-serif;
      z-index: 300;
    `;
    this.startScreen.innerHTML = `
      <h1 style="
        font-size: 3rem; margin-bottom: 0.3rem;
        text-shadow: 0 2px 20px rgba(255,200,100,0.5);
        letter-spacing: 2px;
      ">MELP</h1>
      <p style="
        font-size: 1.2rem; color: #ffd700;
        margin-bottom: 2rem; font-weight: 600;
      ">Turn Off The Lights!</p>
      <div style="
        background: rgba(255,255,255,0.1);
        border-radius: 12px; padding: 20px 28px;
        margin-bottom: 2rem; max-width: 340px;
        text-align: left; line-height: 1.6;
      ">
        <p style="margin: 0 0 8px; font-size: 0.95rem;">
          <strong>Goal:</strong> Turn off all ${APPLIANCE_COUNT} appliances before time runs out!
        </p>
        <p style="margin: 0 0 8px; font-size: 0.95rem;">
          <strong>Move:</strong> WASD / Arrow keys / Joystick
        </p>
        <p style="margin: 0 0 8px; font-size: 0.95rem;">
          <strong>Look:</strong> Mouse (click to capture) / Drag top of screen
        </p>
        <p style="margin: 0; font-size: 0.95rem;">
          <strong>Interact:</strong> E / Space / Tap button
        </p>
      </div>
      <button id="start-btn" style="
        padding: 14px 48px; font-size: 1.2rem;
        background: #ffd700; color: #1a1a2e;
        border: none; border-radius: 10px;
        cursor: pointer; font-weight: 700;
        letter-spacing: 1px;
        transition: transform 0.15s;
      ">START</button>
    `;
    document.body.appendChild(this.startScreen);

    const btn = this.startScreen.querySelector('#start-btn') as HTMLButtonElement;
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    btn.addEventListener('click', () => {
      this.startScreen.style.display = 'none';
      this.onStart?.();
    });
  }

  setOnStart(cb: () => void) {
    this.onStart = cb;
  }
}
