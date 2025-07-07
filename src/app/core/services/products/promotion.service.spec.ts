import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PromotionService } from './promotion.service';
import {
  PromotionDTO,
  PromotionResponsePageable,
  PromotionWithCategories,
  ProductCategory
} from '../../../shared/models/promotions/promotion.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { environment } from '../../../../environments/environments.prod';

describe('PromotionService', () => {
  let service: PromotionService;
  let httpMock: HttpTestingController;
  let baseUrl: string;

  // Mock data
  const mockProductCategory: ProductCategory = {
    categoryId: 1,
    categoryName: 'Electronics'
  };

  const mockPromotionDTO: PromotionDTO = {
    promotionId: 1,
    promotionName: 'Summer Sale',
    promotionDescription: 'Great summer discounts',
    promotionDiscountRate: 0.25,
    promotionStartDate: '2024-06-01',
    promotionEndDate: '2024-08-31'
  };

  const mockPromotionWithCategories: PromotionWithCategories = {
    promotionDTO: mockPromotionDTO,
    categoryDTOList: [mockProductCategory]
  };

  const mockPromotionResponsePageable: PromotionResponsePageable = {
    responsePromotionList: [mockPromotionWithCategories],
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 1,
    end: true
  };

  const mockApiResponse: ApiResponse<PromotionResponsePageable> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Promotions retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockPromotionResponsePageable
  };

  const mockPromotionListApiResponse: ApiResponse<PromotionDTO[]> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'All promotions retrieved successfully',
    type: 'I',
    date: new Date(),
    data: [mockPromotionDTO]
  };

  const mockSinglePromotionApiResponse: ApiResponse<PromotionDTO> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Promotion retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockPromotionDTO
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PromotionService]
    });

    service = TestBed.inject(PromotionService);
    httpMock = TestBed.inject(HttpTestingController);
    baseUrl = environment.baseUrl + '/product-service/promotion';
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refreshPromotions', () => {
    it('should emit refresh event when refreshPromotions is called', () => {
      let refreshCalled = false;

      service.refresh$.subscribe(() => {
        refreshCalled = true;
      });

      service.refreshPromotions();

      expect(refreshCalled).toBeTruthy();
    });
  });

  describe('getPageablePromotions', () => {
    it('should retrieve pageable promotions with default parameters', () => {
      service.getPageablePromotions().subscribe((response) => {
        expect(response).toEqual(mockPromotionResponsePageable);
        expect(response.responsePromotionList).toHaveSize(1);
        expect(response.responsePromotionList[0].promotionDTO.promotionName).toBe('Summer Sale');
      });

      const expectedUrl = `${baseUrl}/list/pageable?pageNo=0&pageSize=10&sortBy=&sortDir=asc`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toBe(expectedUrl);

      req.flush(mockApiResponse);
    });

    it('should retrieve pageable promotions with custom parameters', () => {
      const pageNo = 1;
      const pageSize = 5;
      const sortBy = 'promotionName';
      const sortDir = 'desc';

      service.getPageablePromotions(pageNo, pageSize, sortBy, sortDir).subscribe((response) => {
        expect(response).toEqual(mockPromotionResponsePageable);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/list/pageable?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNo')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('5');
      expect(req.request.params.get('sortBy')).toBe('promotionName');
      expect(req.request.params.get('sortDir')).toBe('desc');

      req.flush(mockApiResponse);
    });
  });

  describe('getPromotionById', () => {
    it('should retrieve a promotion by ID', () => {
      const promotionId = 1;

      service.getPromotionById(promotionId).subscribe((response) => {
        expect(response).toEqual(mockPromotionDTO);
        expect(response.promotionId).toBe(1);
        expect(response.promotionName).toBe('Summer Sale');
        expect(response.promotionDiscountRate).toBe(0.25);
      });

      const req = httpMock.expectOne(`${baseUrl}/${promotionId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`${baseUrl}/${promotionId}`);

      req.flush(mockSinglePromotionApiResponse);
    });

    it('should handle different promotion IDs', () => {
      const promotionId = 999;
      const differentMockPromotion = { ...mockPromotionDTO, promotionId: 999, promotionName: 'Winter Sale' };
      const differentApiResponse = { ...mockSinglePromotionApiResponse, data: differentMockPromotion };

      service.getPromotionById(promotionId).subscribe((response) => {
        expect(response.promotionId).toBe(999);
        expect(response.promotionName).toBe('Winter Sale');
      });

      const req = httpMock.expectOne(`${baseUrl}/${promotionId}`);
      expect(req.request.method).toBe('GET');

      req.flush(differentApiResponse);
    });
  });

  describe('getAllPromotions', () => {
    it('should retrieve all promotions', () => {
      service.getAllPromotions().subscribe((response) => {
        expect(response).toEqual([mockPromotionDTO]);
        expect(response).toHaveSize(1);
        expect(response[0].promotionName).toBe('Summer Sale');
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(`${baseUrl}/list`);

      req.flush(mockPromotionListApiResponse);
    });

    it('should handle empty promotion list', () => {
      const emptyApiResponse = { ...mockPromotionListApiResponse, data: [] };

      service.getAllPromotions().subscribe((response) => {
        expect(response).toEqual([]);
        expect(response).toHaveSize(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');

      req.flush(emptyApiResponse);
    });
  });

  describe('createPromotion', () => {
    it('should create a new promotion', () => {
      const newPromotionData = {
        promotionName: 'Black Friday',
        promotionDescription: 'Huge discounts for Black Friday',
        promotionDiscountRate: 0.50,
        promotionStartDate: '2024-11-29',
        promotionEndDate: '2024-11-30'
      };

      const createdPromotion = { ...mockPromotionDTO, ...newPromotionData, promotionId: 2 };
      const createApiResponse = { ...mockSinglePromotionApiResponse, data: createdPromotion };

      service.createPromotion(newPromotionData).subscribe((response) => {
        expect(response).toEqual(createdPromotion);
        expect(response.promotionName).toBe('Black Friday');
        expect(response.promotionDiscountRate).toBe(0.50);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(baseUrl);
      expect(req.request.body).toEqual(newPromotionData);

      req.flush(createApiResponse);
    });
  });

  describe('updatePromotion', () => {
    it('should update an existing promotion', () => {
      const promotionId = 1;
      const updateData = {
        promotionName: 'Updated Summer Sale',
        promotionDescription: 'Updated description',
        promotionDiscountRate: 0.30
      };

      const updatedPromotion = { ...mockPromotionDTO, ...updateData };
      const updateApiResponse = { ...mockSinglePromotionApiResponse, data: updatedPromotion };

      service.updatePromotion(promotionId, updateData).subscribe((response) => {
        expect(response).toEqual(updatedPromotion);
        expect(response.promotionName).toBe('Updated Summer Sale');
        expect(response.promotionDiscountRate).toBe(0.30);
      });

      const req = httpMock.expectOne(`${baseUrl}/${promotionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.url).toBe(`${baseUrl}/${promotionId}`);
      expect(req.request.body).toEqual(updateData);

      req.flush(updateApiResponse);
    });
  });

  describe('deletePromotion', () => {
    it('should delete a promotion by ID', () => {
      const promotionId = 1;

      service.deletePromotion(promotionId).subscribe((response) => {
        expect(response).toEqual(mockPromotionDTO);
      });

      const req = httpMock.expectOne(`${baseUrl}/${promotionId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(`${baseUrl}/${promotionId}`);

      req.flush(mockSinglePromotionApiResponse);
    });

    it('should handle deletion of different promotion IDs', () => {
      const promotionId = 999;

      service.deletePromotion(promotionId).subscribe((response) => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/${promotionId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(`${baseUrl}/${promotionId}`);

      req.flush(mockSinglePromotionApiResponse);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle HTTP errors for getPageablePromotions', () => {
      service.getPageablePromotions().subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/list/pageable?pageNo=0&pageSize=10&sortBy=&sortDir=asc`);
      req.flush('Promotions not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors for createPromotion', () => {
      const newPromotionData = { promotionName: 'Test Promotion' };

      service.createPromotion(newPromotionData).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Invalid promotion data', { status: 400, statusText: 'Bad Request' });
    });
  });
});
