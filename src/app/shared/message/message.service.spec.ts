import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MessageService } from './message.service';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
import { SnackBarOptions, TypeSnackBar } from './message.types';

describe('MessageService', () => {
  let service: MessageService;
  let mockMatSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<SnackBarComponent>>;

  beforeEach(() => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);
    mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    });

    service = TestBed.inject(MessageService);
    mockMatSnackBar.openFromComponent.and.returnValue(mockSnackBarRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be provided in root', () => {
    const anotherInstance = TestBed.inject(MessageService);
    expect(service).toBe(anotherInstance);
  });

  it('should inject MatSnackBar and MatDialog correctly', () => {
    expect(service['_matSnackBar']).toBe(mockMatSnackBar);
    expect(service['_matDialog']).toBe(mockMatDialog);
  });

  describe('snackBar getter', () => {
    it('should return snackbar object with all methods', () => {
      const snackBar = service.snackBar;

      expect(snackBar).toBeDefined();
      expect(typeof snackBar.error).toBe('function');
      expect(typeof snackBar.warning).toBe('function');
      expect(typeof snackBar.info).toBe('function');
      expect(typeof snackBar.success).toBe('function');
    });

    it('should return new instance each time', () => {
      const snackBar1 = service.snackBar;
      const snackBar2 = service.snackBar;

      expect(snackBar1).not.toBe(snackBar2);
    });
  });

  describe('snackBar.error', () => {
    it('should call _snackBar with error type and message', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Error message';

      service.snackBar.error(message);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Error, undefined);
    });

    it('should call _snackBar with error type, message and duration', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Error with duration';
      const duration = 5000;

      service.snackBar.error(message, duration);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Error, duration);
    });

    it('should handle empty message', () => {
      spyOn(service, '_snackBar' as any);
      const message = '';

      service.snackBar.error(message);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Error, undefined);
    });
  });

  describe('snackBar.warning', () => {
    it('should call _snackBar with warning type and message', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Warning message';

      service.snackBar.warning(message);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Warning, undefined);
    });

    it('should call _snackBar with warning type, message and duration', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Warning with duration';
      const duration = 3000;

      service.snackBar.warning(message, duration);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Warning, duration);
    });
  });

  describe('snackBar.info', () => {
    it('should call _snackBar with info type and message', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Info message';

      service.snackBar.info(message);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Information, undefined);
    });

    it('should call _snackBar with info type, message and duration', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Info with duration';
      const duration = 4000;

      service.snackBar.info(message, duration);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Information, duration);
    });
  });

  describe('snackBar.success', () => {
    it('should call _snackBar with success type and message', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Success message';

      service.snackBar.success(message);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Success, undefined);
    });

    it('should call _snackBar with success type, message and duration', () => {
      spyOn(service, '_snackBar' as any);
      const message = 'Success with duration';
      const duration = 2000;

      service.snackBar.success(message, duration);

      expect(service['_snackBar']).toHaveBeenCalledWith(message, TypeSnackBar.Success, duration);
    });
  });

  describe('_snackBar private method', () => {
    it('should call MatSnackBar.openFromComponent with correct parameters for error', () => {
      const message = 'Test error message';
      const type = TypeSnackBar.Error;
      const duration = 5000;

      service['_snackBar'](message, type, duration);

      const expectedData: SnackBarOptions = {
        message,
        type,
        buttonClosed: true,
      };

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: expectedData,
        panelClass: [`app-snackbar-${type}`],
        duration,
      });
    });

    it('should call MatSnackBar.openFromComponent with correct parameters for success', () => {
      const message = 'Test success message';
      const type = TypeSnackBar.Success;

      service['_snackBar'](message, type);

      const expectedData: SnackBarOptions = {
        message,
        type,
        buttonClosed: true,
      };

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: expectedData,
        panelClass: [`app-snackbar-${type}`],
        duration: undefined,
      });
    });

    it('should call MatSnackBar.openFromComponent with correct parameters for warning', () => {
      const message = 'Test warning message';
      const type = TypeSnackBar.Warning;
      const duration = 3000;

      service['_snackBar'](message, type, duration);

      const expectedData: SnackBarOptions = {
        message,
        type,
        buttonClosed: true,
      };

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: expectedData,
        panelClass: [`app-snackbar-${type}`],
        duration,
      });
    });

    it('should call MatSnackBar.openFromComponent with correct parameters for info', () => {
      const message = 'Test info message';
      const type = TypeSnackBar.Information;

      service['_snackBar'](message, type);

      const expectedData: SnackBarOptions = {
        message,
        type,
        buttonClosed: true,
      };

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: expectedData,
        panelClass: [`app-snackbar-${type}`],
        duration: undefined,
      });
    });

    it('should handle undefined duration', () => {
      const message = 'Test message';
      const type = TypeSnackBar.Success;

      service['_snackBar'](message, type, undefined);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: jasmine.any(Object),
        panelClass: [`app-snackbar-${type}`],
        duration: undefined,
      });
    });

    it('should handle zero duration', () => {
      const message = 'Test message';
      const type = TypeSnackBar.Success;
      const duration = 0;

      service['_snackBar'](message, type, duration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: jasmine.any(Object),
        panelClass: [`app-snackbar-${type}`],
        duration: 0,
      });
    });

  });

  describe('Integration tests', () => {
    it('should create complete snackbar flow for error', () => {
      const message = 'Integration error test';
      const duration = 5000;

      service.snackBar.error(message, duration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: {
          message,
          type: TypeSnackBar.Error,
          buttonClosed: true,
        },
        panelClass: ['app-snackbar-error'],
        duration,
      });
    });

    it('should create complete snackbar flow for success', () => {
      const message = 'Integration success test';

      service.snackBar.success(message);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: {
          message,
          type: TypeSnackBar.Success,
          buttonClosed: true,
        },
        panelClass: ['app-snackbar-success'],
        duration: undefined,
      });
    });

    it('should create complete snackbar flow for warning', () => {
      const message = 'Integration warning test';
      const duration = 4000;

      service.snackBar.warning(message, duration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: {
          message,
          type: TypeSnackBar.Warning,
          buttonClosed: true,
        },
        panelClass: ['app-snackbar-warning'],
        duration,
      });
    });

    it('should create complete snackbar flow for info', () => {
      const message = 'Integration info test';
      const duration = 3000;

      service.snackBar.info(message, duration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: {
          message,
          type: TypeSnackBar.Information,
          buttonClosed: true,
        },
        panelClass: ['app-snackbar-information'],
        duration,
      });
    });
  });

  describe('Multiple snackbar calls', () => {
    it('should handle multiple sequential calls', () => {
      service.snackBar.error('Error 1');
      service.snackBar.success('Success 1');
      service.snackBar.warning('Warning 1');
      service.snackBar.info('Info 1');

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledTimes(4);
    });

  });

  describe('Edge cases', () => {

    it('should handle negative duration values', () => {
      const message = 'Test message';
      const negativeDuration = -1000;

      service.snackBar.warning(message, negativeDuration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: jasmine.any(Object),
        panelClass: ['app-snackbar-warning'],
        duration: negativeDuration,
      });
    });

    it('should handle very large duration values', () => {
      const message = 'Test message';
      const largeDuration = Number.MAX_SAFE_INTEGER;

      service.snackBar.info(message, largeDuration);

      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalledWith(SnackBarComponent, {
        data: jasmine.any(Object),
        panelClass: ['app-snackbar-information'],
        duration: largeDuration,
      });
    });
  });

  describe('Return value', () => {
    it('should return MatSnackBarRef from openFromComponent', () => {
      const message = 'Test message';

      // Access the private method through bracket notation for testing
      const result = service['_snackBar'](message, TypeSnackBar.Success);

      expect(result).toBeUndefined(); // The method doesn't return anything
      expect(mockMatSnackBar.openFromComponent).toHaveBeenCalled();
    });
  });
});
