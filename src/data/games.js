import {messageType} from '../messages/constants.js';
import {users} from './users.js';

export const games = new Map();

export const addShipsToUserInGame = (gameId, playerId, ships) => {
 const usersInGame =  games.get(gameId);
 
 const currentUser = usersInGame.find(user => user.idPlayer === playerId);
 const shipsWithHP = ships.map(ship => {
   return {...ship, hp: ship.length};
 });
 currentUser.ships = shipsWithHP;
};

export const makeStartGameResponseJson = (gameId, playerId) => {
  const usersInGame =  games.get(gameId);
  const currentUser = usersInGame.find(user => user.idPlayer === playerId);
  const ships = currentUser.ships;
  
  const dataJson = JSON.stringify({
            ships,
            currentPlayerIndex: playerId
        });
  
  const responseStartGameJson = JSON.stringify(
    {
      type: messageType.START_GAME,
      data: dataJson,
      id: 0,
    });
    
  return responseStartGameJson;
};

export const sendCreateGameResponse = (idGame) => {
  const usersInGame =  games.get(idGame);
  
  usersInGame.forEach(user => {
    const userWithSocket = users.find(u => u.index === user.idPlayer);
    
    const roomDataJson = JSON.stringify({
            idGame,  
            idPlayer: user.idPlayer 
          });
          
    const responseCreateGame = JSON.stringify({
          type: "create_game", 
          data: roomDataJson,
          id: 0,
        });
        
    userWithSocket.websocket.send(responseCreateGame);  
  });  
};

export const sendMessageToRoomByGameId = (gameId, message) => {
  const usersInGame = games.get(gameId);
  usersInGame.forEach(user => {
    const userWithSocket = users.find(u => u.index === user.idPlayer);
    userWithSocket.websocket.send(message);  
  });
};

export const attack = ({gameId, indexPlayer, x, y} ) => {
  const usersInGame = games.get(gameId);
  let status = 'miss';
  
  const enemy = usersInGame.find(user => user.idPlayer !== indexPlayer);
  const enemyShips = enemy.ships;
  
  enemyShips.forEach(ship => {
   
    
    if(ship.direction){
      // vertical
      if(x === ship.position.x && y >= ship.position.y && y < ship.position.y + ship.length){
        ship.hp--;
        status = ship.hp === 0 ? 'killed' : 'shot';
      } 
    } else {
      // horizontal
       if(y === ship.position.y && x >= ship.position.x && x < ship.position.x + ship.length){
        ship.hp--;
        status = ship.hp === 0 ? 'killed' : 'shot';
      } 
    }
  });
  
  const responseObject = {
    status,
    currentPlayer: indexPlayer,
    x,
    y
  };
  
  return () => {
    attackFeedback(responseObject);
  };
};


export const attackFeedback = ({status, currentPlayer, x, y}) => {
  const dataJson = JSON.stringify({
    position: {x, y},
    currentPlayer,
    status
  });
  
  const responseAttackJson = JSON.stringify({
     type: messageType.ATTACK,
     data: dataJson,
    id: 0,
  });
  const userWithWebsocket = users.find(user => user.index === currentPlayer);
  userWithWebsocket.websocket.send(responseAttackJson);
  
};




