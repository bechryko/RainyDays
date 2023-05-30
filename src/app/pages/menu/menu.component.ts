import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStartService } from 'src/app/game-start.service';

@Component({
   selector: 'app-menu',
   templateUrl: './menu.component.html',
   styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
   buttonGroup: string = "menu";
   setupGameForm = new FormGroup({
      seed: new FormControl('', [Validators.pattern('^[0-9a-zA-Z]*$')])
   });

   constructor(private router: Router, private gameStartService: GameStartService) { }

   switchButtonGroup(group: string) {
      this.buttonGroup = group;
      this.setupGameForm.reset();
   }
   startQuickGame() {
      this.gameStartService.initStartingParams("");
      this.router.navigateByUrl('/game');
   }
   startCustomGame() {
      this.gameStartService.initStartingParams(this.setupGameForm.value.seed ?? "");
      this.router.navigateByUrl('/game');
   }
}
