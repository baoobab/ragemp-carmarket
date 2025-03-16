# RAGEMP Car Market

## Commands (on in-game chat)
- /spawncar [carName] - Spawns a vehicle by model name.

- /spawnowncar [carName] - Spawns a personal vehicle by model name (adds it to your personal vehicle list).

- /owncars - Shows the list of your personal vehicles.

- /sellcar [price] - Sells the current vehicle at the car market for the specified price.

- /buycar - Buys a vehicle that is currently on a sell point at the car market.

- /addcolshape [width height depth] - Creates a new cuboid collision shape with the specified dimensions.

- /addcarmarket [width height depth] - Creates a new car market with a collision shape of the specified dimensions.

- /rmcarmarket [id] - Removes a car market by its ID.

- /rmcolshape [id] - Removes a collision shape by its ID.

- /pos - Shows the player's current position.

- /money - Shows the player's current amount of money.

- /setmoney [amount] - Sets the player's amount of money.

## Quick User Guide: Car Market
Creating a Car Market<br>
Use the command /addcarmarket [width height depth] while standing at the desired location for the car market. 
Specify the dimensions of the area the car market should occupy.<br>
Example: /addcarmarket 20 20 10.

Once created, the car market will be available for interaction.

## Interacting with the Car Market
### Selling a Vehicle
Spawn and enter your vehicle (a personal vehicle created using /spawnowncar).

Park at a Sell Point within the car market area. Sell Points are usually marked.

Use the command /sellcar [price] specifying the desired selling price for the vehicle. Example: /sellcar 15000.

If the sell point is free, your vehicle will be put up for sale at the specified price.

### Buying a Vehicle
Walk to a Sell Point with a vehicle on it.

Make sure you have enough money to buy the vehicle.

Use the command /buycar.

If you have enough money and the vehicle is available, you will complete the purchase.

## How to run

### Clone the repo
```sh
git clone https://github.com/baoobab/ragemp-carmarket.git
```

### Install dependencies (npm or any other package manager)
```sh
npm install
```

### Setup `.env` file using `.env.example`

### Build the server
```sh
npm run build
```

### Get Server Files
Grab the server files from `RAGEMP/server-files` and drop them in the `dist` folder.

### Start the Server

```sh
cd ./dist
./ragemp-server.exe
```

> Project structure and configs from Community Example, lot thanks to: [leonardssh](https://github.com/leonardssh/ragemp-typescript)
