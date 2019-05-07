import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { retryWhen, retry } from 'rxjs/operators';

import { HeroService, Hero } from '../hero.service';

@Component({
  selector: 'app-hero',
  template: `
    <!--{{ heroService.hero$ | async | json }}-->
    <ng-container *ngIf="hero">{{ hero | json }}</ng-container>
    <ng-container *ngIf="error">error</ng-container>
    <button (click)="retry$.next()">retry</button>
  `,
  styles: []
})
export class HeroComponent {
  hero: Hero;
  error = false;
  retry$ = new Subject<void>();

  constructor(public heroService: HeroService) {
    heroService.hero$.pipe(
      // retryWhen(() => this.retry$)
      // retry(3)
    ).subscribe(
      hero => { this.error = false; this.hero = hero; },
      err => { this.error = true; console.log(err); },
      () => console.log('complete')
    );
  }
}
