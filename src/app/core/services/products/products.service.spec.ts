import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';
import {
  ResponsePageableProducts,
  ResponseProduct,
  ResponseCategory,
  ResponseProductItemDetail,
  PromotionDTO,
  Variation
} from '../../../shared/models/products/product.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { environment } from '../../../../environments/environments.prod';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl + '/product-service/product';

  // Mock data
  const mockPromotionDTO: PromotionDTO = {
    promotionId: 1,
    promotionName: 'Test Promotion',
    promotionDescription: 'Test promotion description',
    promotionDiscountRate: 10,
    promotionStartDate: '2024-01-01',
    promotionEndDate: '2024-12-31'
  };

  const mockResponseCategory: ResponseCategory = {
    productCategoryId: 1,
    productCategoryName: 'Electronics',
    promotionDTOList: [mockPromotionDTO]
  };

  const mockVariation: Variation = {
    variationName: 'Color',
    options: 'Red'
  };

  const mockResponseProductItemDetail: ResponseProductItemDetail = {
    productItemId: 1,
    productItemSKU: 'SKU-001',
    productItemQuantityInStock: 10,
    productItemImage: 'item-image.jpg',
    productItemPrice: 99.99,
    variations: [mockVariation]
  };

  const mockResponseProduct: ResponseProduct = {
    productId: 1,
    productName: 'Test Product',
    productDescription: 'Test product description',
    productImage: 'test-image.jpg',
    responseCategory: mockResponseCategory,
    responseProductItemDetails: [mockResponseProductItemDetail]
  };

  const mockResponsePageableProducts: ResponsePageableProducts = {
    responseProductList: [mockResponseProduct],
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 1,
    end: true
  };

  const mockApiResponsePageable: ApiResponse<ResponsePageableProducts> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Products retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockResponsePageableProducts
  };

  const mockApiResponseProduct: ApiResponse<ResponseProduct> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Product retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockResponseProduct
  };

  const mockApiResponseProductList: ApiResponse<any[]> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Products list retrieved successfully',
    type: 'I',
    date: new Date(),
    data: [mockResponseProduct]
  };

  const mockCreateProductPayload = {
    productName: 'New Product',
    productDescription: 'New product description',
    productCategoryId: 1
  };

  const mockUpdateProductPayload = {
    productName: 'Updated Product',
    productDescription: 'Updated product description'
  };

  const mockApiResponseCreate: ApiResponse<any> = {
    error: false,
    code: '201',
    title: 'Created',
    mensaje: 'Product created successfully',
    type: 'I',
    date: new Date(),
    data: { ...mockCreateProductPayload, productId: 2 }
  };

  const mockApiResponseUpdate: ApiResponse<any> = {
    error: false,
    code: '200',
    title: 'Updated',
    mensaje: 'Product updated successfully',
    type: 'I',
    date: new Date(),
    data: { ...mockUpdateProductPayload, productId: 1 }
  };

  const mockApiResponseDelete: ApiResponse<any> = {
    error: false,
    code: '200',
    title: 'Deleted',
    mensaje: 'Product deleted successfully',
    type: 'I',
    date: new Date(),
    data: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPageableProducts', () => {
    it('should retrieve pageable products successfully', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;

      // Act
      service.getPageableProducts().subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockResponsePageableProducts);
          //expect(response.responseProductList).toHaveLength(2);
          expect(response.responseProductList[0]).toEqual(mockResponseProduct);
          expect(response.pageNumber).toBe(0);
          expect(response.totalElements).toBe(1);
          expect(response.end).toBe(true);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponsePageable);
    });

    it('should handle error when retrieving pageable products', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;
      const errorMessage = 'Server error';

      // Act
      service.getPageableProducts().subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProductById', () => {
    it('should retrieve product by id successfully', () => {
      // Arrange
      const productId = 1;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.getProductById(productId).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockResponseProduct);
          expect(response.productId).toBe(1);
          expect(response.productName).toBe('Test Product');
          expect(response.responseCategory).toEqual(mockResponseCategory);
          //expect(response.responseProductItemDetails).toHaveLenght(1);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseProduct);
    });

    it('should handle error when product is not found', () => {
      // Arrange
      const productId = 999;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.getProductById(productId).subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getProducts', () => {
    it('should retrieve products list successfully', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;

      // Act
      service.getProducts().subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual([mockResponseProduct]);
          //expect(response).toBeLessThan(2);
          expect(response[0].productId).toBe(1);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseProductList);
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', () => {
      // Arrange
      const expectedUrl = baseUrl;

      // Act
      service.createProduct(mockCreateProductPayload).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockApiResponseCreate);
          expect(response.data.productName).toBe('New Product');
          expect(response.data.productId).toBe(2);
          expect(response.code).toBe('201');
          expect(response.mensaje).toBe('Product created successfully');
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(expectedUrl);
      expect(req.request.body).toEqual(mockCreateProductPayload);

      // Simulate server response
      req.flush(mockApiResponseCreate);
    });

    it('should handle validation error when creating product', () => {
      // Arrange
      const expectedUrl = baseUrl;
      const invalidPayload = { productName: '' }; // Invalid payload

      // Act
      service.createProduct(invalidPayload).subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(invalidPayload);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', () => {
      // Arrange
      const productId = 1;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.updateProduct(productId, mockUpdateProductPayload).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockApiResponseUpdate);
          expect(response.data.productName).toBe('Updated Product');
          expect(response.data.productId).toBe(1);
          expect(response.code).toBe('200');
          expect(response.mensaje).toBe('Product updated successfully');
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.url).toBe(expectedUrl);
      expect(req.request.body).toEqual(mockUpdateProductPayload);

      // Simulate server response
      req.flush(mockApiResponseUpdate);
    });

    it('should handle error when updating non-existent product', () => {
      // Arrange
      const productId = 999;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.updateProduct(productId, mockUpdateProductPayload).subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateProductPayload);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', () => {
      // Arrange
      const productId = 1;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.deleteProduct(productId).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockApiResponseDelete);
          expect(response.code).toBe('200');
          expect(response.mensaje).toBe('Product deleted successfully');
          expect(response.data).toBeNull();
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseDelete);
    });

    it('should handle error when deleting non-existent product', () => {
      // Arrange
      const productId = 999;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.deleteProduct(productId).subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle forbidden error when deleting product', () => {
      // Arrange
      const productId = 1;
      const expectedUrl = `${baseUrl}/${productId}`;

      // Act
      service.deleteProduct(productId).subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: (error) => {
          // Assert - Verify error handling
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
        }
      });

      // Assert - Verify HTTP request and simulate error
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush('Access denied', { status: 403, statusText: 'Forbidden' });
    });
  });
});
