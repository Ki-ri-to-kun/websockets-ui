import {messageType} from '../messages/constants.js';
import {users, updateWinners} from './users.js';

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
    gameId,
    status,
    currentPlayer: indexPlayer,
    x,
    y,
    isTurnChange: true
  };
  
  if(status === 'killed'){
   const ship = findShipByCoordinates({gameId, indexPlayer, x, y});
   const cellsAroundKilledShip = calculateCellsAroundKilledShip(ship);
   
   return () => {
      attackFeedback(responseObject);
      cellsAroundKilledShip.forEach(cell => {
      const responseMiss = {
        gameId,
        status: 'miss',
        currentPlayer: indexPlayer,
        x: cell.x,
        y: cell.y,
        isTurnChange: false
      };
     attackFeedback(responseMiss);
   });
   };
  }
  
  return () => {
    attackFeedback(responseObject);
  };
};

export const attackFeedback = ({gameId, status, currentPlayer, x, y, isTurnChange}) => {
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
  
  if(status === 'killed'){
   const gameIsFinished = isGameOver(gameId, currentPlayer);
   if(gameIsFinished){
     userWithWebsocket.wins++;
     const dataJson = JSON.stringify({
        winPlayer: currentPlayer
     });
     
     const responseGameFinished = JSON.stringify({
       type: messageType.FINISH,
       data: dataJson,
       id: 0,
     });
     
     sendMessageToRoomByGameId(gameId, responseGameFinished);
     updateWinners();
   }
  }
  
  if(status !== 'shot' && isTurnChange){
    turn(gameId);
  }
};

 export const turn = (gameId, firstMove = false) => {
   const usersInGame = games.get(gameId);
   if(firstMove){
     // start game
    const playersTurn = usersInGame.find(user => user.hisTurn === true).idPlayer;
     
     const dataJson = JSON.stringify({
       currentPlayer: playersTurn
     });
     const responseTurnJson = JSON.stringify({
       type: messageType.TURN,
       data: dataJson,
       id: 0
     });
    
     sendMessageToRoomByGameId(gameId, responseTurnJson);
   } else {
     usersInGame.forEach(user => user.hisTurn = !user.hisTurn);
     const playersTurn = usersInGame.find(user => user.hisTurn === true).idPlayer;
          
     const dataJson = JSON.stringify({
       currentPlayer: playersTurn
     });
     const responseTurnJson = JSON.stringify({
       type: messageType.TURN,
       data: dataJson,
       id: 0
     });
     
     sendMessageToRoomByGameId(gameId, responseTurnJson);
   }
 };

export const isPlayerTurn = (gameId, idPlayer) => {
  const usersInGame = games.get(gameId);
  return usersInGame.find(user => user.idPlayer === idPlayer).hisTurn;
};

const calculateCellsAroundKilledShip = ({position, direction, length}) => {
  const cellsAroundShip = [];
  if(direction){
    if(position.y - 1 >= 0){
      const beforeStart = {
        x: position.x,
        y: position.y - 1
      };
      cellsAroundShip.push(beforeStart);
    }
    if(position.y + length <= 9){
        const afterEnd = {
        x: position.x,
        y: position.y + length
      };
      cellsAroundShip.push(afterEnd);
    }
    for(let i = position.y; i < position.y + length; i++){
      if(position.x - 1 >= 0){
        cellsAroundShip.push({
          x: position.x - 1,
          y: i
        });
      }
      if(position.x + 1 <= 9){
        cellsAroundShip.push({
          x: position.x + 1,
          y: i
        });
      }
    }
  } else {
    //horizontal
    if(position.x - 1 >= 0){
      const beforeStart = {
        x: position.x - 1,
        y: position.y
      };
      cellsAroundShip.push(beforeStart);
    }
    if(position.x + length <= 9){
        const afterEnd = {
        x: position.x + length,
        y: position.y 
      };
      cellsAroundShip.push(afterEnd);
    }
     for(let i = position.x; i < position.x + length; i++){
      if(position.y - 1 >= 0){
        cellsAroundShip.push({
          x: i,
          y: position.y - 1
        });
      }
      if(position.y + 1 <= 9){
        cellsAroundShip.push({
          x: i,
          y: position.y + 1
        });
      }
    }
  }
  
  return cellsAroundShip;
};

const findShipByCoordinates = ({gameId, indexPlayer, x, y}) => {
  const usersInGame = games.get(gameId);
  const enemy = usersInGame.find(user => user.idPlayer !== indexPlayer);
  const killedShip = enemy.ships.find(ship => {
    if(ship.direction){
      // vertical
      if(x === ship.position.x && y >= ship.position.y && y < ship.position.y + ship.length){
        return ship;
      }
      
    } else {
      // horizontal
      if(y === ship.position.y && x >= ship.position.x && x < ship.position.x + ship.length){
        return ship;
      }
    }
  });
  
  return killedShip;
};

const isGameOver = (gameId, currentPlayer) => {
  const usersInGame = games.get(gameId);
  const enemy = usersInGame.find(user => user.idPlayer !== currentPlayer);
  const liveShipIndex = enemy.ships.findIndex(ship => ship.hp > 0);
  return liveShipIndex === -1 ? true : false;
};