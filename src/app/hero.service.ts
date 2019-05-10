import { Injectable } from '@angular/core';
import { of, Subject, merge, ReplaySubject, noop, throwError, timer, iif, BehaviorSubject } from 'rxjs';

// import { cache } from './cache-operator';
import { cache } from './cache-operator2';
import { tap, switchMap, delay, take, switchMapTo, shareReplay } from 'rxjs/operators';

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

  hero = { name: 'James', age: 23 };
  private readonly heroDBSuccess$ = of(noop()).pipe(tap(() => console.log('from db')), switchMap(() => of(this.hero)));
  private readonly heroDBError$ = of(noop()).pipe(tap(() => console.log('error from db')), switchMap(() => throwError('nope')));

  private readonly errorSuccess$ = new BehaviorSubject(false);
  private readonly switchErrorSuccess$ = timer(5000).subscribe(() => {
    console.log('switching to success');
    this.errorSuccess$.next(true);
  });

  private readonly heroDB$ = of(noop()).pipe(
    switchMapTo(iif(() => this.errorSuccess$.value, this.heroDBSuccess$, this.heroDBError$)),
    delay(500)
  );

  // private readonly heroDB$ = this.heroDBSuccess$.pipe(delay(500));
  // private readonly heroDB$ = this.heroDBError$;

  readonly hero$ = merge(
    this.heroDB$,
    this.updateHero$/*.pipe(tap(() => console.log('from update')))*/,
  ).pipe(
    // cache({ expiration: 1000 })
    // cache({ clear$: this.clearHeroCache$ })
    // shareReplay()
    cache({ expiration: 1000, clear$: this.clearHeroCache$ })
  );

  // test = this.updateHero$.subscribe(
  //   v => console.log('updateHero$ next', v),
  //   err => console.log('updateHero$ error', err),
  //   () => console.log('updateHero$ complete')
  // );

  // merge = this.hero$.subscribe(
  //   v => console.log('merge next', v),
  //   err => console.log('merge error', err),
  //   () => console.log('merge complete')
  // );

  // merge2 = timer(1100).pipe(switchMapTo(this.hero$)).subscribe(
  //   v => console.log('merge2 next', v),
  //   err => console.log('merge2 error', err),
  //   () => console.log('merge2 complete')
  // );

  updateHero(hero: Hero) {
    this.hero = hero;
    this.updateHero$.next(hero);
  }
}
