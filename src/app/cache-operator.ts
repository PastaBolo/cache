import { Observable, Observer, Subject, ReplaySubject, MonoTypeOperatorFunction, race, timer, defer } from 'rxjs'
import { switchMap, tap, take } from 'rxjs/operators'

export interface CacheOperatorConfig {
  expiration?: number
  clear$?: Observable<any>
}

class ResettableSubject<T = any> extends Observable<T> implements Observer<T> {

  private resettableSubject: Subject<T>;
  private resetter = new ReplaySubject<void>(1);

  // source comes from Observable class
  source: Observable<T> = this.resetter.pipe(switchMap(() => this.resettableSubject))

  constructor(private subjectFactory: () => Subject<T> = () => new ReplaySubject(1)) {
    super();
    this.resetSubject();
  }

  // Observer implementation
  next(value?: T) { this.resettableSubject.next(value); }
  error(err: any) { this.resettableSubject.error(err); }
  complete() {
    this.resetter.complete();
    this.resettableSubject.complete();
  }

  reset() { this.resetSubject(); }

  private resetSubject() {
    this.resettableSubject = this.subjectFactory();
    this.resetter.next();
  }

  // asObservable() { return this.resetter.pipe(switchMap(() => this.source.asObservable())); }
  // asObservable() { return this.source; }

  // subscribe(
  //   observerOrNext?: PartialObserver<T> | ((value: T) => void),
  //   error?: (error: any) => void,
  //   complete?: () => void
  //   ): Subscription {
  //   return this.source.subscribe(observerOrNext, error, complete);       
  // }

  // toPromise() {
  //   return new Promise<T>((resolve, reject) => {
  //     let valueForResolve: T;
  //     from(this.getValues()).pipe(last()).subscribe(
  //       (value: T) => valueForResolve = value,
  //       (err: any) => reject(err),
  //       () => resolve(valueForResolve)
  //     );
  //   });
  // }


  // private getValues() {
  //   const values: T[] = [];
  //   this.source.subscribe(value => values.push(value)).unsubscribe();
  //   return values;
  // }
}

export const cache = <T>({ expiration, clear$ }: CacheOperatorConfig = {}): MonoTypeOperatorFunction<T> => (source$: Observable<T>) => {
  const cache$ = new ResettableSubject<T>()
  let expiredData = true
  const fetchData$ = new Subject<void>()

  fetchData$.pipe(
    tap(() => expiredData = false),
    switchMap(() => source$)
  ).subscribe(cache$)

  cache$.pipe(
    switchMap(() => race(...[expiration && timer(expiration), clear$ && clear$].filter(Boolean))),
    take(1),
    tap(() => {
      expiredData = true
      cache$.reset()
    })
  ).subscribe(
    () => { console.log('expired next', expiredData) }
  )

  return defer(() => {
    if (expiredData) { fetchData$.next() }
    return cache$;
  })
}
