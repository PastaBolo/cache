import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeroComponent } from './hero/hero.component';
import { AsyncStatesComponent } from './async-states/async-states.component';

@NgModule({
  declarations: [
    AppComponent,
    HeroComponent,
    AsyncStatesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
