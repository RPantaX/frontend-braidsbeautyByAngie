import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService, Locale } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  // Mock data
  const mockEnglishLocale: Locale = {
    lang: 'en',
    data: {
      'HELLO': 'Hello',
      'GOODBYE': 'Goodbye',
      'WELCOME': 'Welcome'
    }
  };

  const mockSpanishLocale: Locale = {
    lang: 'es',
    data: {
      'HELLO': 'Hola',
      'GOODBYE': 'Adiós',
      'WELCOME': 'Bienvenido'
    }
  };

  const mockFrenchLocale: Locale = {
    lang: 'fr',
    data: {
      'HELLO': 'Bonjour',
      'GOODBYE': 'Au revoir',
      'WELCOME': 'Bienvenue'
    }
  };

  beforeEach(() => {
    const translateSpy = jasmine.createSpyObj('TranslateService', [
      'addLangs',
      'setDefaultLang',
      'setTranslation',
      'use',
      'getDefaultLang'
    ]);

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: translateSpy }
      ]
    });

    service = TestBed.inject(TranslationService);
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup localStorage spy
    spyOn(localStorage, 'setItem').and.stub();
    spyOn(localStorage, 'getItem').and.stub();
    spyOn(console, 'log').and.stub();

    // Configure default return values
    mockTranslateService.getDefaultLang.and.returnValue('en');
  });

  afterEach(() => {
    // Clear localStorage spy calls between tests
    (localStorage.setItem as jasmine.Spy).calls.reset();
    (localStorage.getItem as jasmine.Spy).calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with default language configuration', () => {
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en']);
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    });

    it('should initialize currentLang signal with "en"', () => {
      expect(service.currentLang()).toBe('en');
    });

    it('should initialize empty langIds array', () => {
      // Access private property for testing
      expect((service as any).langIds).toEqual([]);
    });
  });

  describe('loadTranslations', () => {
    it('should load single translation locale', () => {
      service.loadTranslations(mockEnglishLocale);

      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith(
        mockEnglishLocale.lang,
        mockEnglishLocale.data,
        true
      );
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en']);
    });

    it('should load multiple translation locales', () => {
      service.loadTranslations(mockEnglishLocale, mockSpanishLocale, mockFrenchLocale);

      expect(mockTranslateService.setTranslation).toHaveBeenCalledTimes(3);
      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('en', mockEnglishLocale.data, true);
      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('es', mockSpanishLocale.data, true);
      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('fr', mockFrenchLocale.data, true);

      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en', 'es', 'fr']);
    });

    it('should handle empty translations array', () => {
      service.loadTranslations();

      expect(mockTranslateService.setTranslation).not.toHaveBeenCalled();
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith([]);
    });

    it('should accumulate langIds across multiple calls', () => {
      // First call
      service.loadTranslations(mockEnglishLocale);
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en']);

      // Second call
      service.loadTranslations(mockSpanishLocale);
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en', 'es']);

      // Third call
      service.loadTranslations(mockFrenchLocale);
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en', 'es', 'fr']);
    });

    it('should handle locale with complex nested data', () => {
      const complexLocale: Locale = {
        lang: 'en',
        data: {
          'NESTED': {
            'DEEP': {
              'VALUE': 'Deep nested value'
            }
          },
          'ARRAY': ['item1', 'item2', 'item3'],
          'SIMPLE': 'Simple value'
        }
      };

      service.loadTranslations(complexLocale);

      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith(
        'en',
        complexLocale.data,
        true
      );
    });
  });

  describe('setLanguage', () => {
    it('should set language when valid language is provided', () => {
      const newLang = 'es';

      service.setLanguage(newLang);

      expect(mockTranslateService.use).toHaveBeenCalledTimes(2);
      expect(mockTranslateService.use).toHaveBeenCalledWith('en'); // default lang first
      expect(mockTranslateService.use).toHaveBeenCalledWith(newLang);
      expect(localStorage.setItem).toHaveBeenCalledWith('language', newLang);
    });

    it('should handle different language codes', () => {
      const languages = ['fr', 'de', 'it', 'pt'];

      languages.forEach(lang => {
        service.setLanguage(lang);
        expect(mockTranslateService.use).toHaveBeenCalledWith(lang);
        expect(localStorage.setItem).toHaveBeenCalledWith('language', lang);
      });
    });

    it('should not set language when null is provided', () => {
      service.setLanguage(null);

      expect(mockTranslateService.use).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not set language when undefined is provided', () => {
      service.setLanguage(undefined);

      expect(mockTranslateService.use).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not set language when empty string is provided', () => {
      service.setLanguage('');

      expect(mockTranslateService.use).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle falsy values correctly', () => {
      const falsyValues = [false, 0, '', null, undefined, NaN];

      falsyValues.forEach(value => {
        service.setLanguage(value);
        expect(mockTranslateService.use).not.toHaveBeenCalled();
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('getSelectedLanguage', () => {
    it('should return language from localStorage when available', () => {
      const storedLang = 'es';
      (localStorage.getItem as jasmine.Spy).and.returnValue(storedLang);

      const result = service.getSelectedLanguage();

      expect(localStorage.getItem).toHaveBeenCalledWith('language');
      expect(result).toBe(storedLang);
    });

    it('should return default language when localStorage is empty', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      mockTranslateService.getDefaultLang.and.returnValue('en');

      const result = service.getSelectedLanguage();

      expect(localStorage.getItem).toHaveBeenCalledWith('language');
      expect(mockTranslateService.getDefaultLang).toHaveBeenCalled();
      expect(result).toBe('en');
    });

    it('should return default language when localStorage returns empty string', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('');
      mockTranslateService.getDefaultLang.and.returnValue('en');

      const result = service.getSelectedLanguage();

      expect(result).toBe('en');
    });

    it('should handle different stored language values', () => {
      const languages = ['fr', 'de', 'it', 'pt', 'zh'];

      languages.forEach(lang => {
        (localStorage.getItem as jasmine.Spy).and.returnValue(lang);
        const result = service.getSelectedLanguage();
        expect(result).toBe(lang);
      });
    });
  });

  describe('changeLang', () => {
    it('should change language and update all services', () => {
      const newLang = 'es';

      service.changeLang(newLang);

      expect(localStorage.setItem).toHaveBeenCalledWith('lang', newLang);
      expect(console.log).toHaveBeenCalledWith({ lang: newLang });
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith(newLang);
      expect(mockTranslateService.use).toHaveBeenCalledWith(newLang);
      expect(service.currentLang()).toBe(newLang);
    });

    it('should handle multiple language changes', () => {
      const languages = ['es', 'fr', 'de'];

      languages.forEach(lang => {
        service.changeLang(lang);

        expect(localStorage.setItem).toHaveBeenCalledWith('lang', lang);
        expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith(lang);
        expect(mockTranslateService.use).toHaveBeenCalledWith(lang);
        expect(service.currentLang()).toBe(lang);
      });
    });

    it('should handle empty string language', () => {
      const emptyLang = '';

      service.changeLang(emptyLang);

      expect(localStorage.setItem).toHaveBeenCalledWith('lang', emptyLang);
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith(emptyLang);
      expect(mockTranslateService.use).toHaveBeenCalledWith(emptyLang);
      expect(service.currentLang()).toBe(emptyLang);
    });

    it('should update signal correctly', () => {
      const initialLang = service.currentLang();
      expect(initialLang).toBe('en');

      service.changeLang('fr');
      expect(service.currentLang()).toBe('fr');

      service.changeLang('de');
      expect(service.currentLang()).toBe('de');
    });

    it('should log the language change', () => {
      const testLang = 'it';

      service.changeLang(testLang);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith({ lang: testLang });
    });
  });

  describe('Service Integration', () => {
    it('should work with TranslateService properly', () => {
      // Test the full flow: load translations, set language, get language
      service.loadTranslations(mockEnglishLocale, mockSpanishLocale);
      service.setLanguage('es');

      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('en', mockEnglishLocale.data, true);
      expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('es', mockSpanishLocale.data, true);
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en', 'es']);
      expect(mockTranslateService.use).toHaveBeenCalledWith('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'es');
    });

    it('should handle complex workflow with changeLang', () => {
      // Load translations
      service.loadTranslations(mockEnglishLocale, mockSpanishLocale, mockFrenchLocale);

      // Change language using changeLang method
      service.changeLang('fr');

      // Verify all interactions
      expect(mockTranslateService.setTranslation).toHaveBeenCalledTimes(3);
      expect(mockTranslateService.addLangs).toHaveBeenCalledWith(['en', 'es', 'fr']);
      expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('fr');
      expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
      expect(service.currentLang()).toBe('fr');
    });
  });

  describe('Signal Behavior', () => {
    it('should have reactive currentLang signal', () => {
      expect(service.currentLang()).toBe('en');

      service.changeLang('es');
      expect(service.currentLang()).toBe('es');

      service.changeLang('fr');
      expect(service.currentLang()).toBe('fr');
    });

    it('should signal be readable', () => {
      const signalValue = service.currentLang();
      expect(typeof signalValue).toBe('string');
      expect(signalValue).toBe('en');
    });
  });

  describe('Private Properties', () => {
    it('should maintain langIds array correctly', () => {
      const langIds = (service as any).langIds;
      expect(Array.isArray(langIds)).toBeTruthy();
      expect(langIds.length).toBe(0);

      service.loadTranslations(mockEnglishLocale);
      expect(langIds).toContain('en');

      service.loadTranslations(mockSpanishLocale);
      expect(langIds).toContain('es');
      expect(langIds.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle TranslateService method failures gracefully', () => {
      mockTranslateService.setTranslation.and.throwError('Translation error');

      expect(() => {
        service.loadTranslations(mockEnglishLocale);
      }).toThrowError('Translation error');
    });

    it('should handle localStorage failures gracefully', () => {
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');

      expect(() => {
        service.setLanguage('es');
      }).toThrowError('Storage error');
    });
  });

  describe('Service Configuration', () => {
    it('should be provided in root', () => {
      const anotherServiceInstance = TestBed.inject(TranslationService);
      expect(service).toBe(anotherServiceInstance);
    });

    it('should inject TranslateService correctly', () => {
      expect(service.translate).toBe(mockTranslateService);
    });
  });
});
