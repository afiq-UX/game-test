import { Game } from './Game';

const game = new Game();
game.init();

window.addEventListener('beforeunload', () => {
  game.dispose();
});
