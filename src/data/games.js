import {messageType} from '../messages/constants.js';
import {users} from './users.js';

export const games = new Map();

export const addShipsToUserInGame = (gameId, playerId, ships) => {
 const usersInGame =  games.get(gameId);
 
 const currentUser = usersInGame.find(user => user.idPlayer === playerId);
 currentUser.ships = ships;
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
  const usersInRoom = games.get(gameId);
  usersInRoom.forEach(user => {
    const userWithSocket = users.find(u => u.index === user.idPlayer);
    userWithSocket.websocket.send(message);  
  });
};









