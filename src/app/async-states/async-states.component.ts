import { Component } from '@angular/core';
import { HeroService } from '../hero.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export const asyncStates = <T>(stream$: Observable<T>) => {
  const loading$ = new BehaviorSubject(true)
  const error$ = new BehaviorSubject(false)

  const data$ = stream$.pipe(
    tap(() => {
      loading$.next(false)
      error$.next(false)
    }),
    catchError(error => {
      loading$.next(false)
      error$.next(true)
      return throwError(error)
    })
  )

  return { data$, loading$, error$ }
}

@Component({
  selector: 'app-async-states',
  template: `
    <div *ngIf="hero.data$ | async as hero">{{ hero | json }}</div>
    <div *ngIf="hero.loading$ | async">Loading...</div>
    <div *ngIf="hero.error$ | async">Error !</div>
  `,
  styles: []
})
export class AsyncStatesComponent {
  hero = asyncStates(this.heroService.hero$)

  constructor(private heroService: HeroService) {

  }

}
