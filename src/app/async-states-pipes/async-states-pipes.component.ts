import { Component } from '@angular/core';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-async-states-pipes',
  template: `
    <div *ngIf="heroService.hero$ | async as hero">{{ hero | json }}</div>
    <div *ngIf="heroService.hero$ | loading | async">Loading...</div>
    <div *ngIf="heroService.hero$ | error | async">Error !</div>
    <p>Bad : Make 3 requests...</p>
  `,
  styles: []
})
export class AsyncStatesPipesComponent {

  constructor(public heroService: HeroService) { }


}
