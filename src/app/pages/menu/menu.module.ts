import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu.component';
import { NewsComponent } from './news/news.component';

import { MenuRoutingModule } from './menu-routing.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    MenuComponent,
    NewsComponent,
  ],
  imports: [
    CommonModule,
    MenuRoutingModule,
    MatGridListModule,
    MatTabsModule,
    MatButtonModule,
  ]
})
export class MenuModule { }
