import { Component, EventEmitter } from '@angular/core';
import { GameMessage, GameStatus, InputMessage } from './model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEncapsulation } from '@angular/core';

@Component({
   selector: 'app-game',
   templateUrl: './game.component.html',
   styleUrls: ['./game.component.scss']
})
export class GameComponent {
   gameStatus: GameStatus = {
      isGameGoing: false,
      isPaused: false,
      selected: 0,
      score: 0
   };
   inputEmitter = new EventEmitter<InputMessage>();

   constructor(private snackbar: MatSnackBar) { }

   getGameMessage(message: any) {
      message = message as GameMessage;
      switch (message.type) {
         case "isGameGoing":
            this.gameStatus.isGameGoing = message.data;
            break;
         case "isPaused":
            this.gameStatus.isPaused = message.data;
            break;
         case "selected":
            this.gameStatus.selected = message.data;
            break;
         case "score":
            this.gameStatus.score = message.data;
            break;
         case "spawnerTimer":
            this.snackbarMessage(`New spawner spawns in ${message.data} seconds`, 'Understood');
            break;
         case "destnationTimer":
            this.snackbarMessage(`New destination spawns in ${message.data} seconds`, 'Understood');
            break;
         case "destinationHealth":
            this.snackbarMessage(`One of your destinations has ${message.data} health!`, "I'll fix it!");
            //this.pauseGame();
            break;
      }
   }

   getInputMessage(message: any) {
      message = message as InputMessage;
      this.inputEmitter.emit(message);
   }

   snackbarMessage(message: string, action: string) {
      this.snackbar.open(message, action, { duration: 3000 });
   }

   pauseGame() {
      this.inputEmitter.emit({ type: "pause", data: true });
      this.gameStatus.isPaused = true;
   }
}
