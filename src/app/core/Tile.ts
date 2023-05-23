import { Building, Gate } from "./Building";
import { Car } from "./Car";
import { Game } from "./Game";
import { Road, Tunnel } from "./Road";

export abstract class Colors {
   static readonly BASE_COLOR = "white";
   static readonly SPREAD_COLORS = ["dodgerblue", "gold", "firebrick", "greenyellow", "chocolate"];

   static randomColor(): string {
      return Colors.SPREAD_COLORS[Math.floor(Math.random() * Colors.SPREAD_COLORS.length)];
   }
}

export class Tile {
   static readonly SIZE = 50;

   color = Colors.BASE_COLOR;
   road: Road | null = null;
   building: Building | null = null;
   x;
   y;

   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }

   build(object: Building | Road) {
      if(!this.building && object instanceof Building) {
         this.building = object;
      } else if(!this.road && object instanceof Road) {
         this.road = object;
      }
   }

   spread(color: string, game: Game) {
      if (this.color == color) {
         return;
      }
      if (this.color == Colors.BASE_COLOR) {
         game.spreads++;
      }
      this.color = color;
      for (let i = 0; i < 4; i++) {
         if (Math.random() < game.spreadChance && game.spreads < game.area.rows * game.area.cols * game.spreadRatio[1]) {
            let x = this.x + [1, 0, -1, 0][i];
            let y = this.y + [0, 1, 0, -1][i];
            if (x < 0 || x >= game.area.cols || y < 0 || y >= game.area.rows) {
               continue;
            }
            game.map[x][y].spread(color, game);
         }
      }
   }

   tileAction(car: Car): void {
      if(!(this.road instanceof Tunnel) && this.color != Colors.BASE_COLOR) {
         car.color = this.color;
      }
   }

   isUnlocked(car: Car): boolean {
      if(!this.road) {
         return false;
      }
      if (this.building == null) {
         return true;
      }
      if (this.building instanceof Gate) {
         return this.building.doesLetPass(car);
      }
      return true;
   }

   getNeighboringRoads(map: Tile[][]): boolean[] {
      const neighboringRoads = [false, false, false, false];
      for (let i = 0; i < 4; i++) {
         const x = this.x + [1, 0, -1, 0][i];
         const y = this.y + [0, 1, 0, -1][i];
         if (x < 0 || x >= map.length || y < 0 || y >= map[0].length) {
            continue;
         }
         if (map[x][y].road) {
            neighboringRoads[i] = true;
         }
      }
      return neighboringRoads;
   }
}
