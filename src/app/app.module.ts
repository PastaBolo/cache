import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeroComponent } from './hero/hero.component';
import { AsyncStatesComponent } from './async-states/async-states.component';
import { AsyncStatesPipesComponent } from './async-states-pipes/async-states-pipes.component';
import { LoadingPipe } from './async-states-pipes/loading.pipe';
import { ErrorPipe } from './async-states-pipes/error.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HeroComponent,
    AsyncStatesComponent,
    AsyncStatesPipesComponent,
    LoadingPipe,
    ErrorPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
