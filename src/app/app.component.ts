import { Component } from '@angular/core';

import { HeroService } from './hero.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  heroes = [];

  constructor(public heroService: HeroService) {
    // heroService.hero$.subscribe(
    //   v => console.log('component', v),
    //   err => console.log('component', err),
    //   () => console.log('component complete')
    // );
  }
}
