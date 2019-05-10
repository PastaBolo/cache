import { Observable, Subject, ReplaySubject, defer, race, timer, MonoTypeOperatorFunction, Observer, Subscription } from 'rxjs';
import { take, switchMapTo, tap, switchMap } from 'rxjs/operators';

export interface CacheOperatorConfig {
  expiration?: number;
  clear$?: Observable<any>;
}

export class ResettableSubject<T = any> extends Observable<T> implements Observer<T> {
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
  error(err: any) {
    this.resettableSubject$.error(err);
  }
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
  const startClear$ = new Subject<void>();
  let expired = true;
  let fetching = false;
  let hasError = false;
  let subscription: Subscription;

  startClear$.pipe(
    tap(() => expired = false),
    switchMapTo(
      race(...[expiration && timer(expiration), clear$ && clear$.pipe(take(1))].filter(Boolean))
    )
  ).subscribe(
    () => { expired = true; }
  );

  return defer(() => {
    if (!fetching && expired || hasError) {
      if (subscription) { subscription.unsubscribe(); }
      cache$.reset();
      fetching = true;
      hasError = false;

      subscription = source$.subscribe({
        next(value) {
          fetching = false;
          startClear$.next();
          cache$.next(value);
        },
        error(err) {
          fetching = false;
          hasError = true;
          cache$.error(err);
        },
        complete() { cache$.complete(); }
      });
    }

    return cache$;
  });
};
