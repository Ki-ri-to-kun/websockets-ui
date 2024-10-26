import {WebSocketServer} from 'ws';

import { httpServer } from './src/http_server/index.js';
import {users, getSortedWinners} from './src/data/users.js';
import {rooms, getAvailableRooms} from './src/data/rooms.js';
import {messageType} from './src/messages/constants.js';


const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({noServer: true});

wsServer.on('connection', (ws) => {
  ws.on('message', message => {
    const messageText = message.toString();
    const messageObj = JSON.parse(messageText);
    const dataObj = JSON.parse(messageObj.data);

   
    // checking message type
    switch(messageObj.type){
      case messageType.REG:
      
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
          const index = users.findIndex(user => user.name === name);
          data.index = index;
          const newUser = {index, name, password, wins: 0, websocket: ws};
          users.push(newUser);
          
        }
      
        const dataJson = JSON.stringify(data);
        
        const response = {
          type: 'reg',
          data: dataJson,
          id: 0
        };
        
        ws.send(JSON.stringify(response));
        
        // update room 
        const roomsData = getAvailableRooms(); 
        const roomsDataJson = JSON.stringify(roomsData);
        
        const roomsListResponse = {
          type: "update_room",
          data: roomsDataJson,
          id: 0,
        };

        
         users.forEach(user => {
          if(user.websocket) user.websocket.send(JSON.stringify(roomsListResponse));
        });
        
        // update winners
        const winnersArray = getSortedWinners().map(user => {
          return {name: user.name, wins: user.wins};
        });
        const winnersArrayJson = JSON.stringify(winnersArray);
        
        const responseWinners = {
          type: "update_winners",
          data: winnersArrayJson,
          id: 0,
        };
        users.forEach(user => {
          if(user.websocket) user.websocket.send(JSON.stringify(responseWinners));
        });
        
        
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
