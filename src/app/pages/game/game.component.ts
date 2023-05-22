import { Component, EventEmitter } from '@angular/core';
import { GameMessage, GameStatus, InputMessage } from './model';

@Component({
   selector: 'app-game',
   templateUrl: './game.component.html',
   styleUrls: ['./game.component.scss']
})
export class GameComponent {
   gameStatus: GameStatus = {
      isGameGoing: false,
      isPaused: false,
      selected: 0
   };
   inputEmitter = new EventEmitter<InputMessage>();

   getGameMessage(message: any) {
      message = message as GameMessage;
      if(message.type === 'selected') {
         this.gameStatus.selected = message.data;
      } else if(message.type === 'isGameGoing') {
         this.gameStatus.isGameGoing = message.data;
      } else if(message.type === 'isPaused') {
         this.gameStatus.isPaused = message.data;
      }
   }

   getInputMessage(message: any) {
      message = message as InputMessage;
      this.inputEmitter.emit(message);
   }
}
