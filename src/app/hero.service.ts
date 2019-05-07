import { Injectable } from '@angular/core'
import { of, Subject, merge, ReplaySubject, noop } from 'rxjs'

import { cache } from './cache-operator'
import { tap, switchMap, delay } from 'rxjs/operators';

export interface Hero {
  name: string
  age: number
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  readonly clearHeroCache$ = new Subject<void>()
  readonly updateHero$ = new Subject<Hero>()

  hero = { name: 'James', age: 23 }
  private heroDB = of(noop()).pipe(switchMap(() => of(this.hero)))

  readonly hero$ = merge(
    this.heroDB.pipe(tap(() => console.log('from db')), delay(1500)),
    this.updateHero$.pipe(tap(() => console.log('from update')))
  ).pipe(
    cache({ expiration: 1000, clear$: this.clearHeroCache$ })
  )

  updateHero(hero: Hero) {
    setTimeout(() => {
      this.hero = hero
      this.updateHero$.next(hero)
    }, 0)
  }
}
