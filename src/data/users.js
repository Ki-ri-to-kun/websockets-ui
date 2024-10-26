export const users = [
  {name: 'person1', password: '123456', index: 0, wins: 2, websocket: null},
  {name: 'person2', password: '123456', index: 1, wins: 3, websocket: null},
  {name: 'person3', password: '123456', index: 2, wins: 3, websocket: null},
  {name: 'person4', password: '123456', index: 3, wins: 3, websocket: null},
  {name: 'person5', password: '123456', index: 4, wins: 4, websocket: null},
  {name: 'person6', password: '123456', index: 5, wins: 4, websocket: null},
  {name: 'person7', password: '123456', index: 6, wins: 0, websocket: null},
  {name: 'person8', password: '123456', index: 7, wins: 1, websocket: null},
  {name: 'person9', password: '123456', index: 8, wins: 2, websocket: null},
  
];

 export const getSortedWinners = () => {
   users.sort((a, b) => {
     if(a.wins > b.wins) return -1;
     if(a.wins < b.wins) return 1;
     if(a.wins === b.wins) return 0;
   });
   
   return users;
 };