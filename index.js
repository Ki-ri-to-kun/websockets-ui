import {WebSocketServer} from 'ws';
import {v4 as uuid} from 'uuid';

import { httpServer } from './src/http_server/index.js';
import {users, getSortedWinners, updateWinners} from './src/data/users.js';
import {rooms, getAvailableRooms, updateAvailableRooms, addUserToRoom,
        getPlayersIndexInRoom} from './src/data/rooms.js';
import {games, addShipsToUserInGame, makeStartGameResponseJson, sendCreateGameResponse,
        sendMessageToRoomByGameId} from './src/data/games.js';
import {messageType} from './src/messages/constants.js';


const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({noServer: true});

wsServer.on('connection', (ws) => {
  ws.on('message', message => {
     const messageText = message.toString();
     const messageObj = JSON.parse(messageText);
     const me = users.find(u => u.websocket === ws);
   
    // checking message type
    switch(messageObj.type){
      case messageType.REG:
       
      const dataObj = JSON.parse(messageObj.data);
       const name = dataObj.name.trim().toLowerCase();
       const password = dataObj.password;
       
       const data = {name, error: false, errorText: ''};
    
       const userInDb = users.find(user => user.name === name);
        if(userInDb){
          if(userInDb.password === password){
            const index = users.findIndex(user => user.name === name);
            data.index = index;
          } else {
            data.error = true;
            data.errorText = "Wrong password!";
            const index = users.findIndex(user => user.name === name);
            data.index = index;
          }
        } else {
          const index = users.length;
          const newUser = {index, name, password, wins: 0, websocket: ws};
          users.push(newUser);
          data.index = index;
        }
      
        const dataJson = JSON.stringify(data);
        
        const response = {
          type: 'reg',
          data: dataJson,
          id: 0
        };
        
        ws.send(JSON.stringify(response));
        
        updateAvailableRooms();
        
        updateWinners();
        
        break;
      case messageType.CREATE_ROOM:
        const roomId = rooms.size + 1;
        rooms.set(roomId, [{name: me.name, index: me.index}]);
        
        updateAvailableRooms();
        break;
      case messageType.ADD_USER_TO_ROOM:
        const roomIndex = JSON.parse(messageObj.data).indexRoom;
      
        addUserToRoom(roomIndex, me);
        updateAvailableRooms();
        
        const idGame = uuid();
        const idPlayer = me.index;
        
        const playersIndex = getPlayersIndexInRoom(roomIndex);
        games.set(idGame, [{idPlayer: playersIndex[0]}, {idPlayer: playersIndex[1]}]);
        
        sendCreateGameResponse(idGame);
        //rooms.delete(roomIndex);
                
      break;
      case messageType.ADD_SHIPS:
      
      const shipsData = JSON.parse(messageObj.data);
      
      const gameId = shipsData.gameId;
      const playerId = shipsData.indexPlayer;
      const ships = shipsData.ships;
      
      addShipsToUserInGame(gameId, playerId, ships);
      
      const res = makeStartGameResponseJson(gameId, playerId);
      sendMessageToRoomByGameId(gameId, res);
      
      break;
      default: 
        console.log('unknown command');
        console.log(messageObj.type);
    }
    
  });
  ws.send(JSON.stringify('websocket connected!'));
});

httpServer.on('upgrade', (req, socket, head) => {

  wsServer.handleUpgrade(req, socket, head, (ws) => {
    wsServer.emit('connection', ws, req);
  });
});
