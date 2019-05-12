import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mapTo, catchError, startWith } from 'rxjs/operators';

@Pipe({
  name: 'loading'
})
export class LoadingPipe implements PipeTransform {
  transform<T>(stream$: Observable<T>): Observable<boolean> {
    return stream$.pipe(
      mapTo(false),
      catchError(() => of(false)),
      startWith(true)
    )
  }
}
