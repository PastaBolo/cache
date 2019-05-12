import { Component } from '@angular/core';
import { BehaviorSubject, ReplaySubject, EMPTY, NEVER, merge, of, noop, Observable } from 'rxjs';
import { HeroService } from '../hero.service';
import { switchMap, tap, catchError } from 'rxjs/operators';

export const asyncStatesWithReloader = <T>(stream$: Observable<T>, reloader$: Observable<any>) => {
  const loading$ = new BehaviorSubject(false)
  const error$ = new BehaviorSubject(false)

  const data$ = reloader$.pipe(
    tap(() => {
      loading$.next(true)
      error$.next(false)
    }),
    switchMap(() => merge(
      of(noop()),
      stream$.pipe(
        tap(() => loading$.next(false)),
        catchError(() => {
          loading$.next(false)
          error$.next(true)
          return EMPTY
        })
      )
    ))
  )

  return { data$, loading$, error$ }
}

@Component({
  selector: 'app-reload',
  template: `
    <button (click)="heroService.clearHeroCache$.next(); reloader$.next(true)">Refresh cache</button>
    <button (click)="reloader$.next(true)">Reload</button>
    <div *ngIf="hero.data$ | async as hero">{{ hero | json }}</div>
    <div *ngIf="hero.loading$ | async">Loading...</div>
    <div *ngIf="hero.error$ | async">Error !</div>
  `,
  styles: []
})
export class ReloadComponent {
  reloader$ = new BehaviorSubject<void>(null)
  hero = asyncStatesWithReloader(this.heroService.hero$, this.reloader$)

  constructor(public heroService: HeroService) { }
}
