import { Car } from "./Car";
import { Random } from "./Random";
import { Colors, Tile } from "./Tile";

export abstract class Building {
   static readonly MAIN_SPAWN_TIMER = 45;

   color: string;
   readonly destructible: boolean;

   constructor(color: string, destructible = true) {
      this.color = color;
      this.destructible = destructible;
   }

   static getAvailableLocations(map: Tile[][], clearRange: number, strictMode = false): Tile[] {
      const availableLocations: Tile[] = [];
      for(let x = 0; x < map.length; x++) {
         for(let y = 0; y < map[x].length; y++) {
            if(map[x][y].building == null) {
               let clear = true;
               for(let i = -clearRange; i <= clearRange; i++) {
                  for(let j = -clearRange; j <= clearRange; j++) {
                     if(x + i < 0 || x + i >= map.length || y + j < 0 || y + j >= map[x].length) {
                        continue;
                     }
                     if(!strictMode && map[x + i][y + j].building != null) {
                        clear = false;
                        break;
                     } else if(strictMode && (map[x + i][y + j].building instanceof Spawner || map[x + i][y + j].building instanceof Destination)) {
                        clear = false;
                        break;
                     }
                  }
                  if(!clear) {
                     break;
                  }
               }
               if(clear) {
                  availableLocations.push(map[x][y]);
               }
            }
         }
      }
      if(availableLocations.length < map.length * map[0].length / 8) {
         if(!strictMode) {
            return Building.getAvailableLocations(map, clearRange + 1, true);
         } else if(clearRange > 1) {
            return Building.getAvailableLocations(map, clearRange - 1, strictMode);
         }
      }
      return availableLocations;
   }
}

export interface BuildingWithTick {
   tick(deltaTime: number, tile: Tile): void;
}

export class Spawner extends Building implements BuildingWithTick {
   private static list: Spawner[] = [];

   static readonly GENERAL_CAR_SPAWN_TIMER = 4;
   static readonly NUMBER_TO_START_UPGRADING = 5;
   static readonly MAX_POWER = 3;

   timer = 0;
   power = 1;

   constructor(color: string) {
      super(color, false);
      Spawner.list.push(this);
   }
   static spawnRandom(map: Tile[][], random: Random): boolean {
      const upgradableSpawners = Spawner.list.filter(spawner => spawner.power < Spawner.MAX_POWER);
      if(Spawner.list.length >= Spawner.NUMBER_TO_START_UPGRADING && upgradableSpawners.length && random.nextBoolean()) {
         const spawner = random.nextArrayElement(upgradableSpawners);
         spawner.power++;
         return true;
      } else {
         const possibleLocations = Building.getAvailableLocations(map, 3);
         if (possibleLocations.length == 0) {
            return false;
         }
         const location = random.nextArrayElement(possibleLocations);
         location.build(new Spawner(random.nextArrayElement(Colors.SPREAD_COLORS)));
         return true;
      }
   }
   tick(deltaTime: number, tile: Tile): void {
      if(!tile.road) {
         return;
      }
      this.timer -= deltaTime * this.power;
      if(this.timer < 0) {
         this.timer = Spawner.GENERAL_CAR_SPAWN_TIMER;
         new Car(tile, this.color);
      }
   }
}

export class Destination extends Building implements BuildingWithTick {
   private static list: Destination[] = [];

   static readonly STARTING_HEALTH = 45;
   static readonly HEALTH_INCREASE = 0;
   static readonly HEALING_PER_CAR = 5;

   private static CURRENT_HEALTH = Destination.STARTING_HEALTH;
   health: number;

   constructor(color: string) {
      super(color, false);
      this.health = Destination.CURRENT_HEALTH;
      Destination.CURRENT_HEALTH += Destination.HEALTH_INCREASE;
      Destination.list.push(this);
   }
   static spawnRandom(map: Tile[][], random: Random): boolean {
      const possibleLocations = Building.getAvailableLocations(map, 3);
      if (possibleLocations.length == 0) {
         return false;
      }
      const location = random.nextArrayElement(possibleLocations);
      location.build(new Destination(random.nextArrayElement(Colors.SPREAD_COLORS)));
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
   static readonly BARRIER_TIMER = 4;
   static readonly OPEN_COLOR = "#BBB";
   static readonly CLOSED_COLOR = "#444";
   static readonly DENY_COLOR = "red";

   timer = TimedGate.BARRIER_TIMER;
   closed = false;

   constructor() {
      super(TimedGate.OPEN_COLOR);
   }
   switch(): void {
      this.closed = !this.closed;
      this.color = this.closed ? TimedGate.CLOSED_COLOR : TimedGate.OPEN_COLOR;
   }
   doesLetPass(_: Car): boolean {
      return !this.closed;
   }
   tick(deltaTime: number, _: Tile): void {
      this.timer -= deltaTime;
      if(this.timer < 0) {
         this.timer = TimedGate.BARRIER_TIMER;
         this.switch();
      }
   }
}
