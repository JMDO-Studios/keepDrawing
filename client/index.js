import imageGameLogic from './sockets/imageGame';
import waitingRoomLogic from './sockets/waitingRoom';

if (window.location.pathname === '/waitingroom') {
  waitingRoomLogic();
}

if (window.location.pathname === '/imagegame') {
  imageGameLogic();
}
