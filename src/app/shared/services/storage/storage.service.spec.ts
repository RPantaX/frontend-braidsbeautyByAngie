import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';
import { StorageService } from './storage';

// Test implementation of abstract StorageService for direct testing
class TestStorageService extends StorageService {
  constructor(api: Storage) {
    super(api);
  }
}

describe('StorageService (Abstract)', () => {
  let service: TestStorageService;
  let mockStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    mockStorage = jasmine.createSpyObj('Storage', [
      'getItem',
      'setItem',
      'removeItem',
      'clear',
      'key'
    ], {
      length: 0
    });

    service = new TestStorageService(mockStorage);
  });

  describe('constructor', () => {
    it('should initialize with provided storage api', () => {
      expect(service['_api']).toBe(mockStorage);
    });
  });

  describe('length getter', () => {
    it('should return storage length', () => {
      Object.defineProperty(mockStorage, 'length', { value: 5, configurable: true });

      expect(service.length).toBe(5);
    });

    it('should return 0 when storage is empty', () => {
      Object.defineProperty(mockStorage, 'length', { value: 0, configurable: true });

      expect(service.length).toBe(0);
    });

    it('should reflect changes in storage length', () => {
      Object.defineProperty(mockStorage, 'length', { value: 3, configurable: true });
      expect(service.length).toBe(3);

      Object.defineProperty(mockStorage, 'length', { value: 7, configurable: true });
      expect(service.length).toBe(7);
    });
  });

  describe('setItem', () => {
    it('should set string value', () => {
      const key = 'testKey';
      const value = 'testValue';

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should set object value', () => {
      const key = 'userObject';
      const value = { id: 1, name: 'John', email: 'john@example.com' };

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should set array value', () => {
      const key = 'arrayData';
      const value = [1, 2, 3, 'test', { nested: true }];

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should set number value', () => {
      const key = 'numberKey';
      const value = 42;

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should set boolean value', () => {
      const key = 'booleanKey';
      const value = true;

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should set null value', () => {
      const key = 'nullKey';
      const value = null;

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should handle undefined value', () => {
      const key = 'undefinedKey';
      const value = undefined;

      service.setItem(key, value);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('getItem - single parameter overload', () => {
    it('should return parsed object when data exists', () => {
      const key = 'testKey';
      const originalData = { id: 1, name: 'Test' };
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem<typeof originalData>(key);

      expect(mockStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(originalData);
    });

    it('should return null when data does not exist', () => {
      const key = 'nonExistentKey';
      mockStorage.getItem.and.returnValue(null);

      const result = service.getItem<string>(key);

      expect(mockStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should return parsed string', () => {
      const key = 'stringKey';
      const originalData = 'test string';
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem<string>(key);

      expect(result).toBe(originalData);
    });

    it('should return parsed number', () => {
      const key = 'numberKey';
      const originalData = 123;
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem<number>(key);

      expect(result).toBe(originalData);
    });

    it('should return parsed boolean', () => {
      const key = 'booleanKey';
      const originalData = false;
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem<boolean>(key);

      expect(result).toBe(originalData);
    });

    it('should return parsed array', () => {
      const key = 'arrayKey';
      const originalData = [1, 2, 3, 'test'];
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem<typeof originalData>(key);

      expect(result).toEqual(originalData);
    });
  });

  describe('getItem - two parameter overload', () => {
    it('should return parsed data when exists', () => {
      const key = 'testKey';
      const originalData = { id: 1 };
      const defaultValue = { id: 0 };
      mockStorage.getItem.and.returnValue(JSON.stringify(originalData));

      const result = service.getItem(key, defaultValue);

      expect(mockStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(originalData);
    });

    it('should return default value when data does not exist', () => {
      const key = 'nonExistentKey';
      const defaultValue = { id: 0, name: 'default' };
      mockStorage.getItem.and.returnValue(null);

      const result = service.getItem(key, defaultValue);

      expect(mockStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value for different types', () => {
      const key = 'testKey';
      mockStorage.getItem.and.returnValue(null);

      // String default
      const stringResult = service.getItem(key, 'default');
      expect(stringResult).toBe('default');

      // Number default
      const numberResult = service.getItem(key, 42);
      expect(numberResult).toBe(42);

      // Boolean default
      const booleanResult = service.getItem(key, true);
      expect(booleanResult).toBe(true);

      // Array default
      const arrayDefault = [1, 2, 3];
      const arrayResult = service.getItem(key, arrayDefault);
      expect(arrayResult).toEqual(arrayDefault);
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', () => {
      const key = 'testKey';

      service.removeItem(key);

      expect(mockStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should handle removal of non-existent key', () => {
      const key = 'nonExistentKey';

      service.removeItem(key);

      expect(mockStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      service.clear();

      expect(mockStorage.clear).toHaveBeenCalled();
    });
  });

  describe('key', () => {
    it('should return key at given index', () => {
      const index = 0;
      const expectedKey = 'testKey';
      mockStorage.key.and.returnValue(expectedKey);

      const result = service.key(index);

      expect(mockStorage.key).toHaveBeenCalledWith(index);
      expect(result).toBe(expectedKey);
    });

    it('should return null for invalid index', () => {
      const index = 999;
      mockStorage.key.and.returnValue(null);

      const result = service.key(index);

      expect(mockStorage.key).toHaveBeenCalledWith(index);
      expect(result).toBeNull();
    });

    it('should handle negative index', () => {
      const index = -1;
      mockStorage.key.and.returnValue(null);

      const result = service.key(index);

      expect(mockStorage.key).toHaveBeenCalledWith(index);
      expect(result).toBeNull();
    });
  });

  describe('JSON parsing edge cases', () => {
    it('should handle malformed JSON gracefully', () => {
      const key = 'malformedKey';
      mockStorage.getItem.and.returnValue('invalid json {');

      expect(() => {
        service.getItem(key);
      }).toThrow();
    });

    it('should handle empty string as stored value', () => {
      const key = 'emptyStringKey';
      mockStorage.getItem.and.returnValue('""');

      const result = service.getItem<string>(key);

      expect(result).toBe('');
    });

    it('should handle null as parsed JSON', () => {
      const key = 'nullKey';
      mockStorage.getItem.and.returnValue('null');

      const result = service.getItem<any>(key);

      expect(result).toBeNull();
    });
  });

  describe('Complex data scenarios', () => {
    it('should handle deeply nested objects', () => {
      const key = 'deepObject';
      const complexData = {
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 30,
              preferences: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        }
      };

      service.setItem(key, complexData);
      mockStorage.getItem.and.returnValue(JSON.stringify(complexData));

      const result = service.getItem<typeof complexData>(key);

      expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(complexData));
      expect(result).toEqual(complexData);
    });

    it('should handle arrays with mixed types', () => {
      const key = 'mixedArray';
      const mixedData = [
        'string',
        123,
        true,
        null,
        { nested: 'object' },
        [1, 2, 3]
      ];

      service.setItem(key, mixedData);
      mockStorage.getItem.and.returnValue(JSON.stringify(mixedData));

      const result = service.getItem<typeof mixedData>(key);

      expect(result).toEqual(mixedData);
    });
  });
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create mock localStorage
    mockLocalStorage = jasmine.createSpyObj('Storage', [
      'getItem',
      'setItem',
      'removeItem',
      'clear',
      'key'
    ], {
      length: 0
    });

    // Mock window.localStorage using spyOnProperty
    spyOnProperty(window, 'localStorage', 'get').and.returnValue(mockLocalStorage);

    TestBed.configureTestingModule({
      providers: [LocalStorageService]
    });

    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extend StorageService', () => {
    expect(service instanceof StorageService).toBeTruthy();
  });

  it('should be provided in root', () => {
    const anotherInstance = TestBed.inject(LocalStorageService);
    expect(service).toBe(anotherInstance);
  });

  it('should use window.localStorage as storage API', () => {
    expect(service['_api']).toBe(mockLocalStorage);
  });

  it('should have all StorageService methods', () => {
    expect(typeof service.setItem).toBe('function');
    expect(typeof service.getItem).toBe('function');
    expect(typeof service.removeItem).toBe('function');
    expect(typeof service.clear).toBe('function');
    expect(typeof service.key).toBe('function');
    expect(typeof service.length).toBe('number');
  });

});

describe('LocalStorageService vs SessionStorageService', () => {
  let localService: LocalStorageService;
  let sessionService: SessionStorageService;
  let mockLocalStorage: jasmine.SpyObj<Storage>;
  let mockSessionStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create mocks
    mockLocalStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem', 'clear', 'key'], { length: 0 });
    mockSessionStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem', 'clear', 'key'], { length: 0 });

    // Mock window properties
    spyOnProperty(window, 'localStorage', 'get').and.returnValue(mockLocalStorage);
    spyOnProperty(window, 'sessionStorage', 'get').and.returnValue(mockSessionStorage);

    TestBed.configureTestingModule({
      providers: [LocalStorageService, SessionStorageService]
    });

    localService = TestBed.inject(LocalStorageService);
    sessionService = TestBed.inject(SessionStorageService);
  });

  it('should use different storage APIs', () => {
    expect(localService['_api']).toBe(mockLocalStorage);
    expect(sessionService['_api']).toBe(mockSessionStorage);
    expect(localService['_api']).not.toBe(sessionService['_api']);
  });

  it('should be different service instances', () => {
    expect(localService).not.toBe(sessionService);
  });

  it('should both extend StorageService', () => {
    expect(localService instanceof StorageService).toBeTruthy();
    expect(sessionService instanceof StorageService).toBeTruthy();
  });
});
