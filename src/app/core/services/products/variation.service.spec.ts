import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VariationService } from './variation.service';
import {
  Variation,
  VariationOptionEntity
} from '../../../shared/models/vatiations/variation.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { environment } from '../../../../environments/environments.prod';

describe('VariationService', () => {
  let service: VariationService;
  let httpMock: HttpTestingController;
  let baseUrl: string;

  // Mock data
  const mockVariationOptionEntity1: VariationOptionEntity = {
    variationOptionId: 1,
    variationOptionValue: 'Red'
  };

  const mockVariationOptionEntity2: VariationOptionEntity = {
    variationOptionId: 2,
    variationOptionValue: 'Blue'
  };

  const mockVariationOptionEntity3: VariationOptionEntity = {
    variationOptionId: 3,
    variationOptionValue: 'S'
  };

  const mockVariationOptionEntity4: VariationOptionEntity = {
    variationOptionId: 4,
    variationOptionValue: 'M'
  };

  const mockVariation1: Variation = {
    variationId: 1,
    variationName: 'Color',
    variationOptionEntities: [mockVariationOptionEntity1, mockVariationOptionEntity2]
  };

  const mockVariation2: Variation = {
    variationId: 2,
    variationName: 'Size',
    variationOptionEntities: [mockVariationOptionEntity3, mockVariationOptionEntity4]
  };

  const mockVariationList: Variation[] = [mockVariation1, mockVariation2];

  const mockApiResponse: ApiResponse<Variation[]> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Variations retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockVariationList
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VariationService]
    });

    service = TestBed.inject(VariationService);
    httpMock = TestBed.inject(HttpTestingController);
    baseUrl = environment.baseUrl + '/product-service/variation';
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVariationList', () => {
    it('should retrieve all variations with their options', () => {
      service.getVariationList().subscribe((response) => {
        expect(response).toEqual(mockVariationList);
        expect(response).toHaveSize(2);

        // Validate first variation
        expect(response[0].variationId).toBe(1);
        expect(response[0].variationName).toBe('Color');
        expect(response[0].variationOptionEntities).toHaveSize(2);
        expect(response[0].variationOptionEntities[0].variationOptionValue).toBe('Red');
        expect(response[0].variationOptionEntities[1].variationOptionValue).toBe('Blue');

        // Validate second variation
        expect(response[1].variationId).toBe(2);
        expect(response[1].variationName).toBe('Size');
        expect(response[1].variationOptionEntities).toHaveSize(2);
        expect(response[1].variationOptionEntities[0].variationOptionValue).toBe('S');
        expect(response[1].variationOptionEntities[1].variationOptionValue).toBe('M');
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`${baseUrl}/list`);
      expect(req.request.headers.has('Content-Type')).toBeFalsy(); // GET requests don't have content-type by default

      req.flush(mockApiResponse);
    });

    it('should handle empty variation list', () => {
      const emptyApiResponse: ApiResponse<Variation[]> = {
        error: false,
        code: '200',
        title: 'Success',
        mensaje: 'No variations found',
        type: 'I',
        date: new Date(),
        data: []
      };

      service.getVariationList().subscribe((response) => {
        expect(response).toEqual([]);
        expect(response).toHaveSize(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`${baseUrl}/list`);

      req.flush(emptyApiResponse);
    });

    it('should handle single variation with multiple options', () => {
      const singleVariationWithOptions: Variation = {
        variationId: 10,
        variationName: 'Material',
        variationOptionEntities: [
          { variationOptionId: 101, variationOptionValue: 'Cotton' },
          { variationOptionId: 102, variationOptionValue: 'Polyester' },
          { variationOptionId: 103, variationOptionValue: 'Silk' }
        ]
      };

      const singleVariationApiResponse: ApiResponse<Variation[]> = {
        error: false,
        code: '200',
        title: 'Success',
        mensaje: 'Single variation retrieved successfully',
        type: 'I',
        date: new Date(),
        data: [singleVariationWithOptions]
      };

      service.getVariationList().subscribe((response) => {
        expect(response).toHaveSize(1);
        expect(response[0].variationName).toBe('Material');
        expect(response[0].variationOptionEntities).toHaveSize(3);
        expect(response[0].variationOptionEntities[0].variationOptionValue).toBe('Cotton');
        expect(response[0].variationOptionEntities[1].variationOptionValue).toBe('Polyester');
        expect(response[0].variationOptionEntities[2].variationOptionValue).toBe('Silk');
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.flush(singleVariationApiResponse);
    });

    it('should handle variation with no options', () => {
      const variationWithoutOptions: Variation = {
        variationId: 20,
        variationName: 'Brand',
        variationOptionEntities: []
      };

      const noOptionsApiResponse: ApiResponse<Variation[]> = {
        error: false,
        code: '200',
        title: 'Success',
        mensaje: 'Variation without options retrieved',
        type: 'I',
        date: new Date(),
        data: [variationWithoutOptions]
      };

      service.getVariationList().subscribe((response) => {
        expect(response).toHaveSize(1);
        expect(response[0].variationName).toBe('Brand');
        expect(response[0].variationOptionEntities).toHaveSize(0);
        expect(response[0].variationOptionEntities).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.flush(noOptionsApiResponse);
    });

    it('should validate API response structure mapping', () => {
      service.getVariationList().subscribe((response) => {
        // Verify that the response is the data property from ApiResponse, not the full ApiResponse
        expect((response as any).error).toBeUndefined();
        expect((response as any).code).toBeUndefined();
        expect((response as any).title).toBeUndefined();
        expect((response as any).mensaje).toBeUndefined();
        expect((response as any).type).toBeUndefined();
        expect((response as any).date).toBeUndefined();
        expect((response as any).data).toBeUndefined();

        // Verify it's an array of Variation objects
        expect(Array.isArray(response)).toBeTruthy();
        if (response.length > 0) {
          expect(response[0].variationId).toBeDefined();
          expect(response[0].variationName).toBeDefined();
          expect(response[0].variationOptionEntities).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush(mockApiResponse);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle 404 error when variations not found', () => {
      service.getVariationList().subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.flush('Variations not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 internal server error', () => {
      service.getVariationList().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.flush('Internal server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      service.getVariationList().subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.error).toEqual(jasmine.any(ProgressEvent));
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.error(new ProgressEvent('Network error'));
    });

    it('should handle malformed API response', () => {
      const malformedResponse = {
        // Missing required ApiResponse properties
        data: mockVariationList
      };

      service.getVariationList().subscribe((response) => {
        expect(response).toEqual(mockVariationList);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush(malformedResponse);
    });
  });

  describe('Service Configuration', () => {
    it('should have correct base URL configuration', () => {
      expect(baseUrl).toBe(environment.baseUrl + '/product-service/variation');
      expect(baseUrl).toContain('/product-service/variation');
    });

    it('should be provided in root', () => {
      // This test verifies the service is properly configured as a singleton
      const anotherServiceInstance = TestBed.inject(VariationService);
      expect(service).toBe(anotherServiceInstance);
    });
  });

  describe('Observable Behavior', () => {
    it('should return Observable that completes after emitting data', () => {
      let completed = false;

      service.getVariationList().subscribe({
        next: (response) => {
          expect(response).toEqual(mockVariationList);
        },
        complete: () => {
          completed = true;
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush(mockApiResponse);

      expect(completed).toBeTruthy();
    });

    it('should allow multiple subscriptions', () => {
      let firstSubscriptionData: Variation[] = [];
      let secondSubscriptionData: Variation[] = [];

      const observable = service.getVariationList();

      observable.subscribe((data) => {
        firstSubscriptionData = data;
      });

      observable.subscribe((data) => {
        secondSubscriptionData = data;
      });

      // Should expect two identical requests since observables are cold
      const requests = httpMock.match(`${baseUrl}/list`);
      expect(requests.length).toBe(2);

      // Verify both requests are GET requests
      requests.forEach(req => {
        expect(req.request.method).toBe('GET');
      });

      // Flush both requests with the same response
      requests[0].flush(mockApiResponse);
      requests[1].flush(mockApiResponse);

      expect(firstSubscriptionData).toEqual(mockVariationList);
      expect(secondSubscriptionData).toEqual(mockVariationList);
    });
  });
});
