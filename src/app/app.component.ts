import { Component, inject } from '@angular/core';
import { TranslationService } from '../@core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'braidsbeautyByAngieManagementApp';
  _translateService = inject(TranslationService);
  constructor() {
    this._translateService.changeLang('en');
  }
}
