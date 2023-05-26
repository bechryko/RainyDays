import { Building, ColoredGate, TimedGate } from "./Building";
import { Random } from "./Random";
import { BasicRoad, Road, Tunnel } from "./Road";
import { Colors, Tile } from "./Tile";

export enum Selection {
   editorTool, road, tunnel, gate1, gate2, timedGate,
   roadConnect = -1
}

export class Controller {
   selectedTile?: Tile;
   leftMouseDown: boolean = false;
   rightMouseDown: boolean = false;
   selected: Selection = Selection.editorTool;
   connectRoad?: Tile;

   readonly gate1Color: string;
   readonly gate2Color: string;
   constructor(private random: Random) {
      this.gate1Color = this.random.nextArrayElement(Colors.SPREAD_COLORS);
      do {
         this.gate2Color = this.random.nextArrayElement(Colors.SPREAD_COLORS);
      } while (this.gate1Color == this.gate2Color);
   }

   leftMouseAction(): void {
      if(!this.selectedTile) {
         return;
      }
      const building = this.getBuildingFromSelection();
      if(building) {
         this.selectedTile.build(building);
      } else if(this.selected == Selection.roadConnect && this.selectedTile.road) {
         if(this.connectRoad) {
            this.selectedTile.connectRoad(this.connectRoad);
            this.connectRoad = this.selectedTile;
         }
      }
   }

   rightMouseAction(tile: Tile, map: Tile[][]): void {
      if(tile.building && this.selected == this.getSelectionTypeFromBuilding(tile.building)) {
         tile.building = null;
      } else if(tile.road && this.selected == this.getSelectionTypeFromBuilding(tile.road)) {
         tile.road = null;
         for(let i = 0; i < 4; i++) {
            const x = tile.x + [1, 0, -1, 0][i];
            const y = tile.y + [0, 1, 0, -1][i];
            if(x < 0 || x >= map.length || y < 0 || y >= map[x].length) {
               continue;
            }
            const neighbor = map[x][y];
            if(neighbor.road) {
               neighbor.road.connections[(i + 2) % 4] = false;
            }
         }
      }
   }

   private getBuildingFromSelection(): Building | Road | null {
      switch(this.selected) {
         case Selection.road:
            return new BasicRoad();
         case Selection.tunnel:
            return new Tunnel();
         case Selection.gate1:
            return new ColoredGate(this.gate1Color);
         case Selection.gate2:
            return new ColoredGate(this.gate2Color);
         case Selection.timedGate:
            return new TimedGate();
      }
      return null;
   }

   private getSelectionTypeFromBuilding(building: Building | Road): Selection | undefined {
      if(building instanceof BasicRoad) {
         return Selection.road;
      } else if(building instanceof Tunnel) {
         return Selection.tunnel;
      } else if(building instanceof ColoredGate) {
         if(building.color == this.gate1Color) {
            return Selection.gate1;
         } else if(building.color == this.gate2Color) {
            return Selection.gate2;
         } else {
            return;
         }
      } else if(building instanceof TimedGate) {
         return Selection.timedGate;
      } else {
         return;
      }
   }
}
