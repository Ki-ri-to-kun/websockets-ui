import {users} from './users.js';


export const rooms = new Map([
[1, [{name: 'person1', index: 0}, {name: 'person2', index: 1}]],
[2, [{name: 'person3', index: 2}, {name: 'person4', index: 3}]],
[3, [{name: 'person5', index: 4}]],
[4, [{name: 'person6', index: 5}]],
[5, [{name: 'person7', index: 6}, {name: 'person8', index: 7}]],
[6, [{name: 'person9', index: 8}]]

]);

export const getAvailableRooms = () => {
  const availableRooms = [];
  
  for(const [roomId, usersInRoom] of rooms.entries()){

     if(usersInRoom.length === 1){
     const newRoom = {
       roomId,
       roomUsers: usersInRoom
     };
     availableRooms.push(newRoom);
    }
    
  };

  return availableRooms;
};


export const updateAvailableRooms = () => {
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
};


export const addUserToRoom = (roomId, user) => {
  const oldUser = rooms.get(roomId);
  const newUsers = [...oldUser, {name: user.name, index: user.index}];
  rooms.set(roomId, newUsers);
  
};

export const sendCreateGameMessageToRoom = (roomId, idGame) => {
  const usersInRoom = rooms.get(roomId);
 // console.log('users in room ', usersInRoom);
  usersInRoom.forEach(user => {
    const userWithSocket = users.find(u => u.index === user.index);
    
    
    
     const roomDataJson = JSON.stringify({
            idGame,  
            idPlayer: user.index  
          });
        const responseCreateGame = {
          type: "create_game", 
          data: roomDataJson,
          id: 0,
        };
    userWithSocket.websocket.send(JSON.stringify(responseCreateGame));
    
  });
};

export const getPlayersIndexInRoom = (roomId) => {
  return rooms.get(roomId).map(user => user.index);
};

