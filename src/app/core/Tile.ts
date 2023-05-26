import { Building, Gate } from "./Building";
import { Car } from "./Car";
import { Game } from "./Game";
import { Road, Tunnel } from "./Road";

export abstract class Colors {
   static readonly BASE_COLOR = "white";
   static readonly SPREAD_COLORS = ["dodgerblue", "gold", "firebrick", "greenyellow", "chocolate"];

   static getColorObject() {
      const colors: any = [];
      for(let i = 0; i < Colors.SPREAD_COLORS.length; i++) {
         colors[Colors.SPREAD_COLORS[i]] = 0;
      }
      colors.getSum = function() {
         let sum = 0;
         for(const c in this) {
            if(typeof this[c] == "number") {
               sum += this[c];
            }
         }
         return sum;
      }
      return colors;
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
      if(this.color == color) {
         return;
      }
      if(this.color == Colors.BASE_COLOR) {
         game.spreads++;
      } else {
         game.tileColors[this.color]--;
      }
      this.color = color;
      game.tileColors[color]++;
      for(let i = 0; i < 4; i++) {
         if(game.random.nextChance(game.rainCloudSizeDeviation) && game.spreads < game.area.rows * game.area.cols * game.rainCloudSize[1]) {
            const x = this.x + [1, 0, -1, 0][i];
            const y = this.y + [0, 1, 0, -1][i];
            if(x < 0 || x >= game.area.cols || y < 0 || y >= game.area.rows) {
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
   isUnlocked(car: Car, map: Tile[][]): boolean {
      if(!this.road) {
         return false;
      }
      const carTile = car.getTile(map);
      const connectedRoads = carTile.getConnectedRoads(map);
      let isConnected = false;
      for(let i = 0; i < 4; i++) {
         if(connectedRoads[i] && carTile.x + [1, 0, -1, 0][i] == this.x && carTile.y + [0, 1, 0, -1][i] == this.y) {
            isConnected = true;
            break;
         }
      }
      if(!isConnected) {
         return false;
      }
      if(this.building == null) {
         return true;
      }
      if(this.building instanceof Gate) {
         return this.building.doesLetPass(car);
      }
      return true;
   }
   connectRoad(tile: Tile) {
      if(!this.road || !tile.road) {
         return;
      }
      for(let i = 0; i < 4; i++) {
         if(tile.x + [1, 0, -1, 0][i] == this.x && tile.y + [0, 1, 0, -1][i] == this.y) {
            tile.road.connections[i] = true;
            this.road.connections[(i + 2) % 4] = true;
            break;
         }
      }
   }
   getConnectedRoads(map: Tile[][]): boolean[] {
      const connectedRoads = [false, false, false, false];
      for(let i = 0; i < 4; i++) {
         const x = this.x + [1, 0, -1, 0][i];
         const y = this.y + [0, 1, 0, -1][i];
         if(x < 0 || x >= map.length || y < 0 || y >= map[0].length) {
            continue;
         }
         if(map[x][y].road?.type == this.road?.type || this.road?.connections[i]) {
            connectedRoads[i] = true;
         }
      }
      return connectedRoads;
   }
}
