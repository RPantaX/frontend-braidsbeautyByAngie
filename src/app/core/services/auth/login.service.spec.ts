import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './login.service';
import {
  Login,
  TokenResponse,
  TokenValidationResponse,
  User,
  UserRoles
} from '../../../shared/models/auth/auth.interface';
import { LocalStorageService } from '../../../shared/services/storage/local-storage.service';
import { KeyStorage } from '../../../../@utils/enums/KeyStorage';
import { environment } from '../../../../environments/environments.prod';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocalStorageService: any;
  let baseUrl: string;

  // Mock data
  const mockUserRole: UserRoles = {
    id: 1,
    name: 'ADMIN'
  };

  const mockUser: User = {
    idUser: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    roles: [mockUserRole],
    enabled: true
  };

  const mockLogin: Login = {
    username: 'testuser',
    password: 'password123'
  };

  const mockTokenResponse: TokenResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  };

  const mockTokenValidationResponse: TokenValidationResponse = {
    valid: true,
    username: 'testuser',
    roles: [mockUserRole],
    userId: '123e4567-e89b-12d3-a456-426614174000'
  };

  const mockInvalidTokenValidationResponse: TokenValidationResponse = {
    valid: false,
    username: '',
    roles: [],
    userId: ''
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: LocalStorageService, useValue: localStorageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockLocalStorageService = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
    baseUrl = environment.baseUrl + '/user-service/user';

    // Setup localStorage spy
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should perform login and return token response', () => {
      service.login(mockLogin).subscribe((response) => {
        expect(response).toEqual(mockTokenResponse);
        expect(response.token).toBe(mockTokenResponse.token);
        expect(typeof response.token).toBe('string');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(`${baseUrl}/auth/token`);
      expect(req.request.body).toEqual(mockLogin);

      req.flush(mockTokenResponse);
    });

    it('should handle login with different credentials', () => {
      const differentLogin: Login = {
        username: 'admin',
        password: 'admin123'
      };

      const differentTokenResponse: TokenResponse = {
        token: 'different-jwt-token-here'
      };

      service.login(differentLogin).subscribe((response) => {
        expect(response).toEqual(differentTokenResponse);
        expect(response.token).toBe('different-jwt-token-here');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(differentLogin);

      req.flush(differentTokenResponse);
    });

    it('should handle login failure', () => {
      service.login(mockLogin).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/token`);
      expect(req.request.method).toBe('POST');

      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      service.getUserById(userId).subscribe((response) => {
        expect(response).toEqual(mockUser);
        expect(response.idUser).toBe(userId);
        expect(response.username).toBe('testuser');
        expect(response.email).toBe('test@example.com');
        expect(response.roles).toHaveSize(1);
        expect(response.roles[0].name).toBe('ADMIN');
        expect(response.enabled).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/${userId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`${baseUrl}/${userId}`);

      req.flush(mockUser);
    });

    it('should handle different user IDs', () => {
      const differentUserId = '987fcdeb-51a2-43d7-b123-456789abcdef';
      const differentUser: User = {
        ...mockUser,
        idUser: differentUserId,
        username: 'differentuser',
        email: 'different@example.com'
      };

      service.getUserById(differentUserId).subscribe((response) => {
        expect(response.idUser).toBe(differentUserId);
        expect(response.username).toBe('differentuser');
        expect(response.email).toBe('different@example.com');
      });

      const req = httpMock.expectOne(`${baseUrl}/${differentUserId}`);
      expect(req.request.method).toBe('GET');

      req.flush(differentUser);
    });

    it('should handle user not found error', () => {
      const nonExistentUserId = 'non-existent-id';

      service.getUserById(nonExistentUserId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${nonExistentUserId}`);
      expect(req.request.method).toBe('GET');

      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('setUserInLocalStorage', () => {
    it('should store token and user in localStorage', () => {
      service.setUserInLocalStorage(mockTokenResponse, mockUser);

      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.TOKEN, JSON.stringify(mockTokenResponse));
      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.USER, JSON.stringify(mockUser));
    });

    it('should handle storage of different user data', () => {
      const differentToken: TokenResponse = { token: 'different-token' };
      const differentUser: User = { ...mockUser, username: 'newuser' };

      service.setUserInLocalStorage(differentToken, differentUser);

      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.TOKEN, JSON.stringify(differentToken));
      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.USER, JSON.stringify(differentUser));
    });
  });

  describe('getUserInLocalStorage', () => {
    it('should retrieve user from localStorage', () => {
      mockLocalStorageService.getItem.and.returnValue(mockUser);

      service.getUserInLocalStorage().subscribe((response) => {
        expect(response).toEqual(mockUser);
        expect(response.username).toBe('testuser');
        expect(response.idUser).toBe('123e4567-e89b-12d3-a456-426614174000');
      });

      expect(mockLocalStorageService.getItem).toHaveBeenCalledWith(KeyStorage.USER);
    });

    it('should handle null user from localStorage', () => {
      mockLocalStorageService.getItem.and.returnValue(null);

      service.getUserInLocalStorage().subscribe((response) => {
        expect(response).toBeNull();
      });

      expect(mockLocalStorageService.getItem).toHaveBeenCalledWith(KeyStorage.USER);
    });
  });

  describe('redirectTo', () => {
    it('should navigate to home and return user', () => {
      mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));

      service.redirectTo(mockUser).subscribe((response) => {
        expect(response).toEqual(mockUser);
        expect(response.username).toBe('testuser');
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should handle navigation for different users', () => {
      const differentUser: User = { ...mockUser, username: 'adminuser' };
      mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));

      service.redirectTo(differentUser).subscribe((response) => {
        expect(response).toEqual(differentUser);
        expect(response.username).toBe('adminuser');
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });
  });

  describe('validateToken', () => {
    beforeEach(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(mockTokenResponse));
    });

    it('should validate token successfully and return true', () => {
      service.validateToken().subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const expectedUrl = `${baseUrl}/auth/validate?token=${mockTokenResponse.token}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);
      expect(req.request.urlWithParams).toBe(expectedUrl);

      req.flush(mockTokenValidationResponse);

      expect(localStorage.getItem).toHaveBeenCalledWith(KeyStorage.TOKEN);
    });

    it('should handle invalid token and redirect to auth', () => {
      service.validateToken().subscribe((response) => {
        expect(response).toBeFalsy();
      });

      const expectedUrl = `${baseUrl}/auth/validate?token=${mockTokenResponse.token}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockInvalidTokenValidationResponse);

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
    });

    it('should handle missing token and redirect to auth without HTTP request', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      service.validateToken().subscribe((response) => {
        expect(response).toBeFalsy();
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
      expect(localStorage.getItem).toHaveBeenCalledWith(KeyStorage.TOKEN);
      httpMock.expectNone(`${baseUrl}/auth/validate`);
    });

    it('should handle token validation HTTP error', () => {
      service.validateToken().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const expectedUrl = `${baseUrl}/auth/validate?token=${mockTokenResponse.token}`;
      const req = httpMock.expectOne(expectedUrl);

      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('deleteUserInLocalStorage', () => {
    it('should remove all auth data from localStorage and redirect to auth', () => {
      service.deleteUserInLocalStorage().subscribe((response) => {
        expect(response).toEqual([]);
        expect(Array.isArray(response)).toBeTruthy();
        expect(response).toHaveSize(0);
      });

      expect(mockLocalStorageService.removeItem).toHaveBeenCalledTimes(3);
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.TOKEN);
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.REFRESH_TOKEN);
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.USER);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
    });

    it('should handle logout process correctly', () => {
      let logoutCompleted = false;

      service.deleteUserInLocalStorage().subscribe({
        next: (response) => {
          expect(response).toEqual([]);
          logoutCompleted = true;
        },
        complete: () => {
          expect(logoutCompleted).toBeTruthy();
        }
      });

      expect(mockLocalStorageService.removeItem).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
    });
  });

  describe('Service Configuration', () => {
    it('should have correct base URL configuration', () => {
      expect(baseUrl).toBe(environment.baseUrl + '/user-service/user');
      expect(baseUrl).toContain('/user-service/user');
    });

    it('should be provided in root', () => {
      const anotherServiceInstance = TestBed.inject(AuthService);
      expect(service).toBe(anotherServiceInstance);
    });
  });

  describe('Observable Behavior', () => {
    it('should return observables that complete after emitting data', () => {
      let loginCompleted = false;
      let getUserCompleted = false;

      service.login(mockLogin).subscribe({
        next: (response) => {
          expect(response).toEqual(mockTokenResponse);
        },
        complete: () => {
          loginCompleted = true;
        }
      });

      service.getUserById(mockUser.idUser).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUser);
        },
        complete: () => {
          getUserCompleted = true;
        }
      });

      const loginReq = httpMock.expectOne(`${baseUrl}/auth/token`);
      const getUserReq = httpMock.expectOne(`${baseUrl}/${mockUser.idUser}`);

      loginReq.flush(mockTokenResponse);
      getUserReq.flush(mockUser);

      expect(loginCompleted).toBeTruthy();
      expect(getUserCompleted).toBeTruthy();
    });

    it('should handle multiple simultaneous requests', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const user1 = { ...mockUser, idUser: userId1 };
      const user2 = { ...mockUser, idUser: userId2 };

      service.getUserById(userId1).subscribe((response) => {
        expect(response.idUser).toBe(userId1);
      });

      service.getUserById(userId2).subscribe((response) => {
        expect(response.idUser).toBe(userId2);
      });

      const requests = httpMock.match(req => req.url.includes('/user-service/user/'));
      expect(requests.length).toBe(2);

      const req1 = requests.find(req => req.request.url.includes(userId1));
      const req2 = requests.find(req => req.request.url.includes(userId2));

      req1?.flush(user1);
      req2?.flush(user2);
    });
  });

  describe('Integration Tests', () => {
    it('should perform complete login flow', () => {
      // Step 1: Login
      service.login(mockLogin).subscribe((tokenResponse) => {
        expect(tokenResponse).toEqual(mockTokenResponse);

        // Step 2: Store in localStorage
        service.setUserInLocalStorage(tokenResponse, mockUser);

        // Step 3: Redirect
        service.redirectTo(mockUser).subscribe((user) => {
          expect(user).toEqual(mockUser);
        });
      });

      const loginReq = httpMock.expectOne(`${baseUrl}/auth/token`);
      loginReq.flush(mockTokenResponse);

      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.TOKEN, JSON.stringify(mockTokenResponse));
      expect(localStorage.setItem).toHaveBeenCalledWith(KeyStorage.USER, JSON.stringify(mockUser));
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should perform complete logout flow', () => {
      service.deleteUserInLocalStorage().subscribe((result) => {
        expect(result).toEqual([]);
      });

      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.TOKEN);
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.REFRESH_TOKEN);
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(KeyStorage.USER);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
    });
  });
});
