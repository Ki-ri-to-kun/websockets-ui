import {WebSocketServer} from 'ws';
import {v4 as uuid} from 'uuid';

import { httpServer } from './src/http_server/index.js';
import {users} from './src/data/users.js';
import {messageType} from './src/messages/constants.js';


const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({noServer: true});

wsServer.on('connection', (ws) => {
  ws.on('message', message => {
    const messageText = message.toString();
    const messageObj = JSON.parse(messageText);
    
    // checking message type
    switch(messageObj.type){
      case messageType.REG:
        const data = {
                name: 'username',
                index: '00001',
                error: false,
                errorText: ''
        };
        
        const dataJson = JSON.stringify(data);
        
         const response =  {
          type: 'reg',
          data: dataJson,
          id: 0
        };
        
        ws.send(JSON.stringify(response));
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
