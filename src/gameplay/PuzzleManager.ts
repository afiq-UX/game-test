import type { Appliance } from './ApplianceManager';
import { SKIP_PENALTY_SECONDS } from '../gameConfig';

export type PuzzleResult = 'solved' | 'skipped' | 'cancelled';

export class PuzzleManager {
  private overlay: HTMLDivElement;
  private isActive = false;
  private resolvePromise?: (result: PuzzleResult) => void;
  private cleanup?: () => void;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'puzzle-overlay';
    this.overlay.style.cssText = `
      position: fixed; inset: 0;
      display: none;
      align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      z-index: 150;
      font-family: 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(this.overlay);
  }

  get active() {
    return this.isActive;
  }

  async open(appliance: Appliance): Promise<PuzzleResult> {
    this.isActive = true;
    this.overlay.style.display = 'flex';
    this.overlay.innerHTML = '';

    return new Promise<PuzzleResult>((resolve) => {
      this.resolvePromise = resolve;

      const container = document.createElement('div');
      container.style.cssText = `
        background: #fff; border-radius: 16px; padding: 32px;
        min-width: 320px; max-width: 90vw; text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      `;

      const title = document.createElement('h2');
      title.textContent = appliance.def.name;
      title.style.cssText = 'margin: 0 0 8px; color: #333; font-size: 1.4rem;';
      container.appendChild(title);

      switch (appliance.def.puzzleType) {
        case 'flipSwitch':
          this.buildFlipSwitch(container);
          break;
        case 'holdButton':
          this.buildHoldButton(container);
          break;
        case 'findPlug':
          this.buildFindPlug(container);
          break;
        default:
          this.finish('solved');
          return;
      }

      const skipBtn = document.createElement('button');
      skipBtn.textContent = `Skip (-${SKIP_PENALTY_SECONDS}s penalty)`;
      skipBtn.style.cssText = `
        margin-top: 16px; padding: 8px 20px;
        background: #e74c3c; color: #fff; border: none;
        border-radius: 6px; cursor: pointer; font-size: 0.9rem;
        font-weight: 700;
      `;
      skipBtn.addEventListener('mouseenter', () => { skipBtn.style.background = '#c0392b'; });
      skipBtn.addEventListener('mouseleave', () => { skipBtn.style.background = '#e74c3c'; });
      skipBtn.addEventListener('click', () => this.finish('skipped'));
      container.appendChild(skipBtn);

      this.overlay.appendChild(container);
    });
  }

  private finish(result: PuzzleResult) {
    this.isActive = false;
    this.cleanup?.();
    this.cleanup = undefined;
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = '';
    this.resolvePromise?.(result);
  }

  private buildFlipSwitch(container: HTMLElement) {
    const desc = document.createElement('p');
    desc.textContent = 'Find the right combination to turn it off!';
    desc.style.cssText = 'color: #666; margin-bottom: 16px;';
    container.appendChild(desc);

    const switchCount = 3 + Math.floor(Math.random() * 2); // 3 or 4
    const correctPattern = Array.from({ length: switchCount }, () => Math.random() > 0.5);
    const currentState = new Array(switchCount).fill(false);

    const switchRow = document.createElement('div');
    switchRow.style.cssText = 'display: flex; gap: 16px; justify-content: center; margin: 20px 0;';

    for (let i = 0; i < switchCount; i++) {
      const switchEl = document.createElement('div');
      switchEl.style.cssText = `
        width: 50px; height: 80px;
        background: #ddd; border-radius: 8px;
        cursor: pointer; position: relative;
        transition: background 0.2s;
        display: flex; align-items: flex-end; justify-content: center;
        padding-bottom: 8px; font-size: 0.7rem; color: #999;
      `;

      const knob = document.createElement('div');
      knob.style.cssText = `
        position: absolute; top: 45px; left: 50%; transform: translateX(-50%);
        width: 30px; height: 30px; background: #888;
        border-radius: 4px; transition: top 0.15s;
      `;
      switchEl.appendChild(knob);

      const updateSwitch = () => {
        if (currentState[i]) {
          knob.style.top = '8px';
          switchEl.style.background = '#a8e6a3';
          knob.style.background = '#4CAF50';
        } else {
          knob.style.top = '45px';
          switchEl.style.background = '#ddd';
          knob.style.background = '#888';
        }
      };

      switchEl.addEventListener('click', () => {
        currentState[i] = !currentState[i];
        updateSwitch();

        const allCorrect = currentState.every((s, idx) => s === correctPattern[idx]);
        if (allCorrect) {
          setTimeout(() => this.finish('solved'), 300);
        }
      });

      switchRow.appendChild(switchEl);
    }

    container.appendChild(switchRow);
  }

  private buildHoldButton(container: HTMLElement) {
    const HOLD_DURATION = 3000;

    const desc = document.createElement('p');
    desc.innerHTML =
      'Hold the <strong>E</strong> key for 3 seconds to turn it off!' +
      '<br><span style="font-size: 0.8rem; color: #999;">On touch, press &amp; hold the button</span>';
    desc.style.cssText = 'color: #666; margin-bottom: 16px; line-height: 1.4;';
    container.appendChild(desc);

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'position: relative; display: inline-block; margin: 20px 0;';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '120');
    svg.style.cssText = 'position: absolute; top: -10px; left: -10px; transform: rotate(-90deg);';

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '60');
    circle.setAttribute('cy', '60');
    circle.setAttribute('r', '54');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#4CAF50');
    circle.setAttribute('stroke-width', '6');
    const circumference = 2 * Math.PI * 54;
    circle.setAttribute('stroke-dasharray', `${circumference}`);
    circle.setAttribute('stroke-dashoffset', `${circumference}`);
    circle.style.transition = 'none';
    svg.appendChild(circle);
    btnWrap.appendChild(svg);

    // Visual hold target. The E key drives it on desktop; press-and-hold the
    // button works for mouse and touch too.
    const btn = document.createElement('button');
    btn.textContent = 'HOLD E';
    btn.style.cssText = `
      width: 100px; height: 100px;
      border-radius: 50%; border: 3px solid #4CAF50;
      background: #e8f5e9; color: #4CAF50;
      font-size: 1rem; font-weight: 700;
      cursor: pointer; user-select: none;
      -webkit-user-select: none;
    `;

    let holdStart = 0;
    let animFrame = 0;
    let holding = false;

    const updateProgress = () => {
      const elapsed = Date.now() - holdStart;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      circle.setAttribute('stroke-dashoffset', `${circumference * (1 - progress)}`);

      if (progress >= 1) {
        this.finish('solved');
        return;
      }
      animFrame = requestAnimationFrame(updateProgress);
    };

    const startHold = () => {
      // Guard against key auto-repeat and post-solve events restarting the timer.
      if (holding || !this.isActive) return;
      holding = true;
      holdStart = Date.now();
      btn.style.background = '#c8e6c9';
      updateProgress();
    };

    const stopHold = () => {
      if (!holding) return;
      holding = false;
      cancelAnimationFrame(animFrame);
      circle.setAttribute('stroke-dashoffset', `${circumference}`);
      btn.style.background = '#e8f5e9';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space') {
        e.preventDefault();
        startHold();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space') {
        e.preventDefault();
        stopHold();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const pressStart = (e: Event) => { e.preventDefault(); startHold(); };
    btn.addEventListener('mousedown', pressStart);
    btn.addEventListener('mouseup', stopHold);
    btn.addEventListener('mouseleave', stopHold);
    btn.addEventListener('touchstart', pressStart, { passive: false });
    btn.addEventListener('touchend', stopHold);

    // Tear down the global key listeners when the puzzle closes (solved/skipped).
    this.cleanup = () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    btnWrap.appendChild(btn);
    container.appendChild(btnWrap);
  }

  private buildFindPlug(container: HTMLElement) {
    const desc = document.createElement('p');
    desc.textContent = 'Tap the correct plug to unplug it!';
    desc.style.cssText = 'color: #666; margin-bottom: 16px;';
    container.appendChild(desc);

    const plugCount = 4;
    const correctPlug = Math.floor(Math.random() * plugCount);
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

    const plugRow = document.createElement('div');
    plugRow.style.cssText = 'display: flex; gap: 12px; justify-content: center; margin: 20px 0; flex-wrap: wrap;';

    for (let i = 0; i < plugCount; i++) {
      const plug = document.createElement('div');
      plug.style.cssText = `
        width: 60px; height: 80px;
        background: ${colors[i]};
        border-radius: 8px 8px 4px 4px;
        cursor: pointer; position: relative;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
      `;

      // Prongs
      const prongs = document.createElement('div');
      prongs.style.cssText = `
        position: absolute; bottom: -12px;
        display: flex; gap: 12px;
      `;
      for (let p = 0; p < 2; p++) {
        const prong = document.createElement('div');
        prong.style.cssText = 'width: 6px; height: 16px; background: #888; border-radius: 0 0 2px 2px;';
        prongs.appendChild(prong);
      }
      plug.appendChild(prongs);

      // Wire line going up (visual hint - correct one is thicker/brighter)
      const wire = document.createElement('div');
      wire.style.cssText = `
        position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
        width: ${i === correctPlug ? 4 : 2}px;
        height: 20px;
        background: ${i === correctPlug ? colors[i] : '#ccc'};
      `;
      plug.appendChild(wire);

      plug.addEventListener('click', () => {
        if (i === correctPlug) {
          plug.style.transform = 'translateY(20px)';
          plug.style.opacity = '0.5';
          setTimeout(() => this.finish('solved'), 400);
        } else {
          plug.style.transform = 'translateX(5px)';
          setTimeout(() => { plug.style.transform = 'translateX(-5px)'; }, 100);
          setTimeout(() => { plug.style.transform = ''; }, 200);
        }
      });

      plugRow.appendChild(plug);
    }

    container.appendChild(plugRow);
  }
}
