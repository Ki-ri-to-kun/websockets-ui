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
};