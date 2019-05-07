import { Component } from '@angular/core';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero',
  template: `
    {{ heroService.hero$ | async | json }}
  `,
  styles: []
})
export class HeroComponent {
  constructor(public heroService: HeroService) {
    // heroService.hero$.subscribe(
    //   v => console.log(v),
    //   err => console.log(err),
    //   () => console.log('complete')
    // )
  }
}
