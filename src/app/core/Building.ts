import { Car } from "./Car";
import { Colors, Tile } from "./Tile";

export abstract class Building {
   color: string;
   readonly destructible: boolean;

   constructor(color: string, destructible = true) {
      this.color = color;
      this.destructible = destructible;
   }

   static getAvailableLocations(map: Tile[][], clearRange: number): Tile[] {
      const availableLocations: Tile[] = [];
      for (let x = 0; x < map.length; x++) {
         for (let y = 0; y < map[x].length; y++) {
            if (map[x][y].building == null) {
               let clear = true;
               for (let i = -clearRange; i <= clearRange; i++) {
                  for (let j = -clearRange; j <= clearRange; j++) {
                     if (x + i < 0 || x + i >= map.length || y + j < 0 || y + j >= map[x].length) {
                        continue;
                     }
                     if (map[x + i][y + j].building != null) {
                        clear = false;
                        break;
                     }
                  }
                  if (!clear) {
                     break;
                  }
               }
               if (clear) {
                  availableLocations.push(map[x][y]);
               }
            }
         }
      }
      return availableLocations;
   }
}

export interface BuildingWithTick {
   tick(deltaTime: number, tile: Tile): void;
}

export class Spawner extends Building implements BuildingWithTick {
   static readonly SPAWN_TIMER = 45;
   static readonly GENERAL_CAR_SPAWN_TIMER = 4;

   timer = 0;

   constructor(color: string) {
      super(color, false);
   }

   static spawnRandom(map: Tile[][]) {
      const possibleLocations = Building.getAvailableLocations(map, 3);
      if (possibleLocations.length == 0) {
         return false;
      }
      const location = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
      location.build(new Spawner(Colors.randomColor()));
      return true;
   }

   tick(deltaTime: number, tile: Tile): void {
      if(!tile.road) {
         return;
      }
      this.timer -= deltaTime;
      if(this.timer < 0) {
         this.timer = Spawner.GENERAL_CAR_SPAWN_TIMER;
         new Car(tile, this.color);
      }
   }
}

export class Destination extends Building implements BuildingWithTick {
   private static list: Destination[] = [];

   static readonly SPAWN_TIMER = 45;
   static readonly STARTING_HEALTH = 125;
   static readonly HEALTH_INCREASE = 5;
   static readonly HEALING_PER_CAR = 5;

   private static CURRENT_HEALTH = Destination.STARTING_HEALTH;
   health: number;

   constructor(color: string) {
      super(color, false);
      this.health = Destination.CURRENT_HEALTH;
      Destination.CURRENT_HEALTH += Destination.HEALTH_INCREASE;
      Destination.list.push(this);
   }
   static spawnRandom(map: Tile[][]): boolean {
      const possibleLocations = Building.getAvailableLocations(map, 3);
      if (possibleLocations.length == 0) {
         return false;
      }
      const location = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
      location.build(new Destination(Colors.randomColor()));
      return true;
   }
   tick(deltaTime: number, _: Tile): void {
      this.health -= deltaTime;
   }
   static anyWithZeroHealth(): boolean {
      return Destination.list.some(destination => destination.health <= 0);
   }
}

export abstract class Gate extends Building {
   constructor(color: string) {
      super(color);
   }

   abstract doesLetPass(car: Car): boolean;
}

export class ColoredGate extends Gate {
   constructor(color: string) {
      super(color);
   }

   doesLetPass(car: Car): boolean {
      return car.color != this.color;
   }
}

export class TimedGate extends Gate implements BuildingWithTick {
   static readonly BARRIER_TIMER = 2;
   static readonly COLOR = "dimgrey";

   timer = 0;
   closed = false;

   constructor() {
      super(TimedGate.COLOR);
   }

   switch(): void {
      this.closed = !this.closed;
   }

   doesLetPass(car: Car): boolean {
      return !this.closed;
   }

   tick(deltaTime: number, _: Tile): void {
      this.timer -= deltaTime;
      if (this.timer < 0) {
         this.timer = TimedGate.BARRIER_TIMER;
         this.switch();
      }
   }
}
