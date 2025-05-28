import { Component, inject } from '@angular/core';
import { TranslationService } from '../@core/services/translation.service';
import { Store } from '@ngrx/store';
import { SecurityState } from '../@security/interfaces/SecurityState';
import { verifyAuthAction } from '../@security/redux/actions/auth.action';
import { AuthService } from './core/services/auth/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'braidsbeautyByAngieManagementApp';
  _translateService = inject(TranslationService);

  private readonly _store = inject(Store<SecurityState>);
  private readonly _authService = inject(AuthService);
  constructor() {
    this._translateService.changeLang('en');
    this._authService.getUserInLocalStorage().subscribe((user) => {
      if (user) {
        this._store.dispatch(verifyAuthAction({ user: user}));
      }
    });

  }
}
