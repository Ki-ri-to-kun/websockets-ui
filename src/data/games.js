export const games = new Map();

export const addShipsToUserInGame = (gameId, playerId, ships) => {
 const usersInGame =  games.get(gameId);
 
 const currentUser = usersInGame.find(user => user.idPlayer === playerId);
 currentUser.ships = ships;
};