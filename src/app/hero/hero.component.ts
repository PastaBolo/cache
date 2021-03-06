import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { retryWhen, retry, tap } from 'rxjs/operators';

import { HeroService, Hero } from '../hero.service';

@Component({
  selector: 'app-hero',
  template: `
    {{ hero$ | async | json }}
    <!--<ng-container *ngIf="hero">{{ hero | json }}</ng-container>
    <ng-container *ngIf="error">error</ng-container>-->
    <!--<button (click)="retry$.next()">retry</button>-->
  `,
  styles: []
})
export class HeroComponent {
  hero: Hero;
  error = false;
  // retry$ = new Subject<void>();
  hero$ = this.heroService.hero$.pipe(tap(() => console.log('hero component')));

  constructor(public heroService: HeroService) {
    // heroService.hero$.pipe(
    //   // retryWhen(() => this.retry$)
    //   // retry(3)
    // ).subscribe(
    //   hero => { this.error = false; this.hero = hero; console.log('component', hero); },
    //   err => { this.error = true; console.log('component', err); },
    //   () => console.log('component complete')
    // );
  }
}
