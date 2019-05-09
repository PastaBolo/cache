import { Observable, Observer, Subject, ReplaySubject, MonoTypeOperatorFunction, race, timer, defer, EMPTY } from 'rxjs';
import { switchMap, tap, take, switchMapTo, mergeMapTo, retryWhen, delayWhen, catchError } from 'rxjs/operators';

export interface CacheOperatorConfig {
  expiration?: number;
  clear$?: Observable<any>;
}

class ResettableSubject<T = any> extends Observable<T> implements Observer<T> {
  private resettableSubject$: Subject<T>;
  private resetter$ = new ReplaySubject<void>(1);

  // source comes from Observable class
  // specify that the source is the inner resettableSubject rebuild by the factory after each resetter$ event
  source = this.resetter$.pipe(switchMap(() => this.resettableSubject$));

  constructor(private subjectFactory: () => Subject<T> = () => new ReplaySubject(1)) {
    super();
    this.resetSubject();
  }

  // Observer implementation
  next(value?: T) { this.resettableSubject$.next(value); }
  error(err: any) { this.resettableSubject$.error(err); }
  complete() {
    this.resetter$.complete();
    this.resettableSubject$.complete();
  }

  reset() { this.resetSubject(); }

  private resetSubject() {
    this.resettableSubject$ = this.subjectFactory();
    this.resetter$.next();
  }
}

export const cache = <T>({ expiration, clear$ }: CacheOperatorConfig = {}): MonoTypeOperatorFunction<T> => (source$: Observable<T>) => {
  const cache$ = new ResettableSubject<T>();
  let expiredData = true;
  let fetchingData = false;
  const fetchData$ = new Subject<void>();

  fetchData$.pipe(
    tap(() => fetchingData = true),
    switchMapTo(source$.pipe(catchError(error => {
      fetchingData = false;
      cache$.error(error);
      cache$.reset();
      return EMPTY;
    }))),
    tap(data => {
      cache$.next(data);
      fetchingData = false;
      expiredData = false;
    }),
    switchMapTo(race(...[expiration && timer(expiration), clear$ && clear$.pipe(take(1))].filter(Boolean))),
    tap(() => {
      expiredData = true;
      cache$.reset();
    })
  ).subscribe();

  return defer(() => {
    if (!fetchingData && expiredData) {
      fetchData$.next();
    }
    return cache$;
  });
};
