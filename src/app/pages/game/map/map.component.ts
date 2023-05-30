import { GameStartService } from './../../../game-start.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from 'src/app/core/Game';
import { GameMessage, InputMessage } from '../model';
import { Random } from 'src/app/core/Random';

@Component({
   selector: 'app-map',
   templateUrl: './map.component.html',
   styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
   game?: Game;
   @Output() gameEmitter = new EventEmitter<GameMessage>();
   @Input() inputEmitter = new EventEmitter<InputMessage>();

   constructor(private gameStartService: GameStartService) { }

   ngOnInit() {
      document.addEventListener("contextmenu", e => {
         e.preventDefault();
      }, false);
      const parameters = this.gameStartService.getStartingParams();
      const seed = !parameters.seed ? Math.random().toString() : parameters.seed;
      this.game = new Game(
         0.4, [0.6, 0.7], 
         document.getElementById("gameCanvas") as HTMLCanvasElement, 
         {rows: 15, cols: 30},
         this.gameEmitter,
         new Random(seed)
      );
      console.log(`Game seed: "${seed}"`)
      this.inputEmitter.subscribe(message => this.getInputMessage(message));
      this.startGame();
   }

   getInputMessage(message: any) {
      message = message as InputMessage;
      switch(message.type) {
         case "selectTool":
            this.game?.selectTool(message.data);
            break;
         case "pause":
            this.game && (this.game.paused = message.data);
            break;
      }
   }

   startGame() {
      this.gameEmitter.emit({ type: "isGameGoing", data: true });
      this.game?.startGame();
   }
}
