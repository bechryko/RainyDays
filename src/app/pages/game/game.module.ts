import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { HudComponent } from './hud/hud.component';
import { MapComponent } from './map/map.component';

import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    GameComponent,
    HudComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
  ]
})
export class GameModule { }
