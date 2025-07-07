import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

// Imports necesarios para las dependencias del componente
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthService } from './core/services/auth/login.service';
import { TranslationService } from '../@core/services/translation.service';
import { of } from 'rxjs';

describe('AppComponent', () => {

  // Mock para AuthService
  const mockAuthService = {
    getUserInLocalStorage: jasmine.createSpy('getUserInLocalStorage').and.returnValue(of(null))
  };

  // Mock para TranslationService
  const mockTranslationService = {
    changeLang: jasmine.createSpy('changeLang')
  };

  // Estado inicial para el store
  const initialState = {
    // Ajusta esto según tu SecurityState interface
    user: null,
    isAuthenticated: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        // Mock del NgRx Store
        provideMockStore({ initialState }),

        // Mock de los servicios
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'braidsbeautyByAngieManagementApp'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('braidsbeautyByAngieManagementApp');
  });

});
