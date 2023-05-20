import { Building, ColoredGate, TimedGate } from "./Building";
import { BasicRoad, Road, Tunnel } from "./Road";
import { Colors, Tile } from "./Tile";

export enum Selection {
   road, tunnel, gate1, gate2, timedGate
}

export class Controller {
   selectedTile?: Tile;
   leftMouseDown: boolean = false;
   rightMouseDown: boolean = false;
   selected: Selection = Selection.road;
   deleteType: Selection | null = null;

   readonly gate1Color: string;
   readonly gate2Color: string;
   constructor() {
      this.gate1Color = Colors.randomColor();
      do {
         this.gate2Color = Colors.randomColor();
      } while (this.gate1Color == this.gate2Color);
   }

   leftMouseAction(): void {
      const building = this.getBuildingFromSelection();
      if(building !== undefined && this.selectedTile !== undefined) {
         this.selectedTile.build(building);
      } else {
         console.error("Invalid selection");
      }
   }

   rightMouseAction(tile: Tile): void { //TODO: deletion fix
      if(!this.deleteType) {
         if(tile.building && tile.building.destructible) {
            this.deleteType = this.getSelectionTypeFromBuilding(tile.building) ?? null;
         } else if(tile.road) {
            this.deleteType = this.getSelectionTypeFromBuilding(tile.road) ?? null;
         }
      }
      if(tile.building && this.deleteType === this.getSelectionTypeFromBuilding(tile.building)) {
         tile.building = undefined;
      } else if(tile.road && this.deleteType === this.getSelectionTypeFromBuilding(tile.road)) {
         tile.road = null;
      }
   }

   private getBuildingFromSelection(): Building | Road | undefined {
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
