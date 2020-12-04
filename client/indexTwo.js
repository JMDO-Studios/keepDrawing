import waitingRoomLogic from './sockets/waitingRoom';
import Game from './babylon/game';

if (window.location.pathname === '/waitingroom') {
  waitingRoomLogic();
}

if (window.location.pathname === '/imagegame') {
  const game = new Game();
}
