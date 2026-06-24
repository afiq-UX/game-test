import * as THREE from 'three';
import { InputManager } from './core/InputManager';
import { PlayerController } from './core/PlayerController';
import { CameraController } from './core/CameraController';
import { CollisionSystem } from './core/CollisionSystem';
import { HouseBuilder } from './world/HouseBuilder';
import { ApplianceManager } from './gameplay/ApplianceManager';
import { InteractionSystem } from './gameplay/InteractionSystem';
import { PuzzleManager } from './gameplay/PuzzleManager';
import { HUD } from './ui/HUD';
import { MenuScreens } from './ui/MenuScreens';
import { PLAYER_SPAWN } from './world/RoomDefinitions';

export class Game {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private elapsedTime = 0;

  private inputManager!: InputManager;
  private playerController!: PlayerController;
  private cameraController!: CameraController;
  private collisionSystem!: CollisionSystem;
  private applianceManager!: ApplianceManager;
  private interactionSystem!: InteractionSystem;
  private puzzleManager!: PuzzleManager;
  private hud!: HUD;

  private gameTime = 300; // 5 minutes
  private isPlaying = false;
  private hasStarted = false;
  private hasEnded = false;
  private animationFrameId = 0;

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupLighting();
    this.buildHouse();

    this.inputManager = new InputManager(this.renderer.domElement);
    this.playerController = new PlayerController(this.scene, this.collisionSystem);
    this.playerController.position.set(PLAYER_SPAWN[0], PLAYER_SPAWN[1], PLAYER_SPAWN[2]);
    this.cameraController = new CameraController(this.camera, this.playerController, this.collisionSystem);

    this.applianceManager = new ApplianceManager();
    this.applianceManager.build(this.scene);

    this.interactionSystem = new InteractionSystem(this.applianceManager);
    this.puzzleManager = new PuzzleManager();

    this.hud = new HUD();
    this.hud.hide();

    const menu = new MenuScreens();
    menu.setOnStart(() => {
      this.hasStarted = true;
      this.isPlaying = true;
      this.hud.show();
      this.clock.getDelta(); // reset delta so first frame isn't huge
      // Capture the mouse for GTA-style look (click again to re-capture if released).
      this.inputManager.setPointerLockEnabled(true);
      this.renderer.domElement.requestPointerLock?.();
    });

    this.applianceManager.setOnCountChange((remaining) => {
      this.hud.updateCounter(remaining);
      if (remaining === 0 && !this.hasEnded) {
        this.onWin();
      }
    });

    this.hideLoading();
    this.animate();
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 30, 60);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4a8c3f,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.7);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 15, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x4a8c3f, 0.45);
    this.scene.add(hemi);
  }

  private buildHouse() {
    const builder = new HouseBuilder();
    const collisionBoxes = builder.build(this.scene);
    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.setColliders(collisionBoxes);
  }

  private hideLoading() {
    const el = document.getElementById('loading');
    if (el) el.classList.add('hidden');
  }

  private async openPuzzle(appliance: import('./gameplay/ApplianceManager').Appliance) {
    // Release the mouse so the puzzle overlay's buttons are clickable.
    this.inputManager.setPointerLockEnabled(false);
    const result = await this.puzzleManager.open(appliance);
    if (result === 'solved') {
      this.applianceManager.turnOff(appliance);
    } else if (result === 'skipped') {
      this.applianceManager.turnOff(appliance);
      this.gameTime -= 5;
    }
    // Re-arm capture; the player clicks the canvas to grab the mouse again.
    if (!this.hasEnded) {
      this.inputManager.setPointerLockEnabled(true);
    }
  }

  private onWin() {
    if (this.hasEnded) return;
    this.hasEnded = true;
    this.isPlaying = false;
    this.inputManager.setPointerLockEnabled(false);
    const timeUsed = 300 - this.gameTime;
    let stars = 1;
    if (timeUsed < 120) stars = 3;
    else if (timeUsed < 210) stars = 2;

    const mins = Math.floor(timeUsed / 60);
    const secs = Math.floor(timeUsed % 60);
    this.showEndOverlay(`
      <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">All Lights Off!</h1>
      <p style="font-size: 1.3rem; margin-bottom: 1rem;">Time: ${mins}:${secs.toString().padStart(2, '0')}</p>
      <p style="font-size: 2rem; margin-bottom: 1.5rem;">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
      <button style="
        padding: 12px 32px; font-size: 1.1rem;
        background: #4CAF50; color: #fff; border: none;
        border-radius: 8px; cursor: pointer;
      ">Play Again</button>
    `);
  }

  private onLose() {
    if (this.hasEnded) return;
    this.hasEnded = true;
    this.isPlaying = false;
    this.inputManager.setPointerLockEnabled(false);
    const remaining = this.applianceManager.getActiveAppliances().length;

    this.showEndOverlay(`
      <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Time's Up!</h1>
      <p style="font-size: 1.3rem; margin-bottom: 1.5rem;">${remaining} light${remaining === 1 ? '' : 's'} still on</p>
      <button style="
        padding: 12px 32px; font-size: 1.1rem;
        background: #4CAF50; color: #fff; border: none;
        border-radius: 8px; cursor: pointer;
      ">Play Again</button>
    `);
  }

  private showEndOverlay(innerHTML: string) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: #fff; font-family: 'Segoe UI', sans-serif;
      z-index: 200;
    `;
    overlay.innerHTML = innerHTML;
    document.body.appendChild(overlay);
    overlay.querySelector('button')!.addEventListener('click', () => {
      location.reload();
    });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    this.elapsedTime += delta;

    if (!this.isPlaying) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Timer
    this.gameTime -= delta;
    if (this.gameTime <= 0) {
      this.gameTime = 0;
      this.hud.updateTimer(this.gameTime);
      this.onLose();
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.hud.updateTimer(this.gameTime);

    // Look first so movement maps relative to the freshly-updated camera yaw.
    const lookDelta = this.inputManager.consumeLookDelta();
    this.cameraController.update(delta, lookDelta, this.inputManager.lookSensitivity);

    // Input (freeze movement during puzzles)
    const movement = this.puzzleManager.active
      ? new THREE.Vector2()
      : this.inputManager.getMovementVector();
    this.playerController.update(delta, movement, this.cameraController.yaw);

    // Consume the interact latch every frame so a press made while a
    // puzzle is open can't trigger a stale interaction once it closes.
    const interactPressed = this.inputManager.isInteractPressed();

    // Interaction
    if (!this.puzzleManager.active) {
      this.interactionSystem.update(this.playerController.position);
      if (interactPressed) {
        const appliance = this.interactionSystem.tryInteract();
        if (appliance && appliance.def.puzzleType !== 'press' && appliance.isOn) {
          this.openPuzzle(appliance);
        }
      }
    }

    // Room label
    this.hud.updateRoomLabel(this.playerController.position);

    // Minimap
    this.hud.updateMap(this.playerController.position, this.applianceManager.getAppliances());

    // Appliance glow animation
    this.applianceManager.update(this.elapsedTime);

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.isPlaying = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    // Remove listeners.
    window.removeEventListener('resize', this.onResize);
    this.inputManager?.dispose();

    // Dispose all geometries and materials in the scene.
    if (this.scene) {
      this.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            material.dispose();
          }
        }
      });
      this.scene.clear();
    }

    this.renderer?.dispose();
  }
}
