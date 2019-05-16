import { Observable, Subject, ReplaySubject, MonoTypeOperatorFunction, Subscription, defer, race, timer } from 'rxjs';
import { switchMapTo, switchMap, take, tap, takeWhile } from 'rxjs/operators';

export interface CacheOperatorConfig {
  expiration?: number;
  clear$?: Observable<any>;
}

export const cache = <T>({ expiration, clear$ }: CacheOperatorConfig = {}): MonoTypeOperatorFunction<T> => (source$: Observable<T>) => {
  let cache$: ReplaySubject<T>;
  const startClear$ = new Subject<void>();
  const switcher$ = new ReplaySubject<void>(1);
  let expired = true;
  let fetching = false;
  let hasError = false;
  let subscription: Subscription;

  switcher$.next();

  startClear$.pipe(
    tap(() => expired = false),
    takeWhile(() => !!(expiration || clear$)),
    switchMapTo(
      race(...[expiration && timer(expiration), clear$ && clear$.pipe(take(1))].filter(Boolean))
    )
  ).subscribe(() => expired = true);

  return defer(() => {
    if (!fetching && expired || hasError) {
      if (subscription) { subscription.unsubscribe(); }
      cache$ = new ReplaySubject(1);
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
        complete() {
          switcher$.complete();
          cache$.complete();
        }
      });
    }

    return switcher$.pipe(switchMap(() => cache$));
  });
};
