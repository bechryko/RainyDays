import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/core/Game';

@Component({
   selector: 'app-map',
   templateUrl: './map.component.html',
   styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
   game?: Game;

   constructor() { }

   ngOnInit() {
      document.addEventListener("contextmenu", e => {
         e.preventDefault();
      }, false);
      this.game = new Game(
         0.42, [0.6, 0.7], 
         document.getElementById("gameCanvas") as HTMLCanvasElement, 
         {rows: 15, cols: 30}
      );
      this.game.startGame();
   }
}
