import { Injectable } from '@angular/core';
import { of, Subject, merge, ReplaySubject, noop, throwError, timer, iif, BehaviorSubject } from 'rxjs';
import { tap, switchMap, delay, take, switchMapTo, shareReplay } from 'rxjs/operators';

import { cache } from './cache-operator';

export interface Hero {
  name: string;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  readonly clearHeroCache$ = new Subject<void>();
  readonly updateHero$ = new Subject<Hero>();

  hero: Hero = { name: 'James', age: 23 };
  private readonly heroDBSuccess$ = of(noop()).pipe(tap(() => console.log('from db')), switchMap(() => of(this.hero)));
  private readonly heroDBError$ = of(noop()).pipe(tap(() => console.log('error from db')), switchMap(() => throwError('nope')));

  // private readonly errorSuccess$ = new BehaviorSubject(false);
  // private readonly switchErrorSuccess$ = timer(5000).subscribe(() => {
  //   console.log('switching to success');
  //   this.errorSuccess$.next(true);
  // });

  // private readonly heroDB$ = of(noop()).pipe(
  //   switchMapTo(iif(() => this.errorSuccess$.value, this.heroDBSuccess$, this.heroDBError$)),
  //   delay(500)
  // );
  // private readonly heroDB$ = this.heroDBSuccess$.pipe(delay(500));
  private readonly heroDB$ = timer(500).pipe(switchMapTo(this.heroDBError$));

  readonly hero$ = merge(
    this.heroDB$,
    this.updateHero$.pipe(tap(() => console.log('from update'))),
  ).pipe(
    cache({ expiration: 1000, clear$: this.clearHeroCache$ })
  );

  updateHero(hero: Hero) {
    this.hero = hero;
    this.updateHero$.next(hero);
  }
}
