# RainyDays

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.5.

## About

Rainy Days is a real-time strategy game greatly inspired by Mini Motorways. The goal is to build a sustainable transportational system in a randomly generated square-tiled map, where some tiles have rainclouds above them. Those clouds rain colored water which colors different objects below them, mostly cars. Because your task is to deliver the cars from the spawners to the destinations in the desired colors, while you have some control over their movement and behavior.

### Buildable objects

#### Roads

Roads are the most basic transportation method in the game. Cars travel on them with basic speed, and turn in a random direction at a crossroad. They are also exposed to the rain. Roads only automatically connect with other roads.

#### Tunnels

Tunnels are similar to roads, but they give protection to the cars, preventing them to be colored by the rain. Cars travel on them with basic speed, and turn in a random direction at a crossroad. Tunnels only automatically connect with other tunnels.

#### Colored gates

Colored gates are buildings placeable on roads or tunnels. They prevent every car of the same color from going through it. The player gets two colored gates of random colors at the start of each game.

#### Timed gates

Timed gates are special kind of gates which have two states: open and closed. Open allows every car through, and closed prevent every as well. By default, timed gates change state every two seconds.

### Generated objects

#### Spawners

They spawn cars of the given color every few seconds. They continously spawn throughout the game, but later they might get upgraded to spawn cars more frequently.

#### Destinations

Destinations are the buildings where cars have to be transported with the given color. Destinations have a timer which decreases with each second, which you can increase back with each car delivered of the correct color. Cars of other colors are ignored by the destination. Destinations spawn continously throughout the game.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Run as PWA

Run `npm run server` to build the project and open it with a http-server. Navigate to `http://localhost:8080/`. You can now install the application and use it in offline mode.
