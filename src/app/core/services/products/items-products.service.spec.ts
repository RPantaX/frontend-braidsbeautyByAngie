import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemProductService } from './items-products.service';
import {
  ItemProductResponse,
  ItemProductSave,
  ResponseCategoryy,
  PromotionDTO,
  Variation,
  RequestVariation
} from '../../../shared/models/products/item-product.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { environment } from '../../../../environments/environments.prod';

describe('ItemProductService', () => {
  let service: ItemProductService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl + '/product-service';

  // Mock data
  const mockPromotionDTO: PromotionDTO = {
    promotionId: 1,
    promotionName: 'Test Promotion',
    promotionDescription: 'Test Description',
    promotionDiscountRate: 10,
    promotionStartDate: new Date('2024-01-01'),
    promotionEndDate: new Date('2024-12-31')
  };

  const mockResponseCategory: ResponseCategoryy = {
    productCategoryId: 1,
    productCategoryName: 'Electronics',
    promotionDTOList: [mockPromotionDTO]
  };

  const mockVariation: Variation = {
    variationName: 'Color',
    options: 'Red'
  };

  const mockItemProductResponse: ItemProductResponse = {
    productItemId: 1,
    productItemSKU: 'TEST-SKU-001',
    productItemQuantityInStock: 100,
    productItemImage: 'test-image.jpg',
    productItemPrice: 299.99,
    responseCategoryy: mockResponseCategory,
    variations: [mockVariation]
  };

  const mockApiResponse: ApiResponse<ItemProductResponse> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Item product retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockItemProductResponse
  };

  const mockRequestVariation: RequestVariation = {
    variationName: 'Color',
    variationOptionValue: 'Blue'
  };

  const mockItemProductSave: ItemProductSave = {
    productId: 1,
    productItemSKU: 'NEW-SKU-001',
    productItemQuantityInStock: 50,
    productItemImage: 'new-image.jpg',
    productItemPrice: 199.99,
    requestVariations: [mockRequestVariation]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemProductService]
    });

    service = TestBed.inject(ItemProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getListItemProductById', () => {
    it('should retrieve item product by id with correct URL and method', () => {
      const productId = 1;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.getListItemProductById(productId).subscribe(response => {
        expect(response).toEqual(mockItemProductResponse);
        expect(response.productItemId).toBe(1);
        expect(response.productItemSKU).toBe('TEST-SKU-001');
        expect(response.productItemPrice).toBe(299.99);
        expect(response.responseCategoryy).toEqual(mockResponseCategory);
        expect(response.variations).toEqual([mockVariation]);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockApiResponse);
    });

    it('should handle different product ids correctly', () => {
      const productId = 999;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.getListItemProductById(productId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      req.flush(mockApiResponse);
    });

    it('should map the response data correctly', () => {
      const productId = 1;

      service.getListItemProductById(productId).subscribe(response => {
        expect(response).toEqual(mockApiResponse.data);
      });

      const req = httpMock.expectOne(`${baseUrl}/itemProduct/${productId}`);
      req.flush(mockApiResponse);
    });
  });

  describe('saveItemProduct', () => {
    it('should save item product with correct URL, method and body', () => {
      const expectedUrl = `${baseUrl}/itemProduct`;

      service.saveItemProduct(mockItemProductSave).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockItemProductSave);
      expect(req.request.body.productId).toBe(1);
      expect(req.request.body.productItemSKU).toBe('NEW-SKU-001');
      expect(req.request.body.productItemPrice).toBe(199.99);
      expect(req.request.body.requestVariations).toEqual([mockRequestVariation]);

      req.flush(mockApiResponse);
    });

    it('should handle item product without image', () => {
      const itemProductWithoutImage: ItemProductSave = {
        ...mockItemProductSave,
        productItemImage: undefined
      };

      service.saveItemProduct(itemProductWithoutImage).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/itemProduct`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.productItemImage).toBeUndefined();

      req.flush(mockApiResponse);
    });
  });

  describe('updateItemProduct', () => {
    it('should update item product with correct URL, method and body', () => {
      const productId = 1;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.updateItemProduct(productId, mockItemProductSave).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockItemProductSave);
      expect(req.request.body.productId).toBe(1);
      expect(req.request.body.productItemSKU).toBe('NEW-SKU-001');

      req.flush(mockApiResponse);
    });

    it('should handle different product ids for update', () => {
      const productId = 456;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.updateItemProduct(productId, mockItemProductSave).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.url).toBe(expectedUrl);

      req.flush(mockApiResponse);
    });
  });

  describe('deleteItemproduct', () => {
    it('should delete item product with correct URL and method', () => {
      const productId = 1;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.deleteItemproduct(productId).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();

      req.flush(mockApiResponse);
    });

    it('should handle different product ids for deletion', () => {
      const productId = 789;
      const expectedUrl = `${baseUrl}/itemProduct/${productId}`;

      service.deleteItemproduct(productId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(expectedUrl);

      req.flush(mockApiResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP error for getListItemProductById', () => {
      const productId = 1;
      const errorMessage = 'Product not found';

      service.getListItemProductById(productId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/itemProduct/${productId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP error for saveItemProduct', () => {
      const errorMessage = 'Validation error';

      service.saveItemProduct(mockItemProductSave).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/itemProduct`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });
});
