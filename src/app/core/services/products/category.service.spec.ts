import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import {
  CategoryOption,
  CategoryRegister,
  CategoryResponsePageable,
  ResponseCategory
} from '../../../shared/models/categories/category.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { environment } from '../../../../environments/environments.prod';
import { PromotionDTO } from '../../../shared/models/promotions/promotion.interface';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl + '/product-service/category';

  // Mock data
  const mockPromotionDTO: PromotionDTO = {
    promotionId: 1,
    promotionName: 'Test Promotion',
    promotionDescription: 'Test promotion description',
    promotionDiscountRate: 15,
    promotionStartDate: '2024-01-01',
    promotionEndDate: '2024-12-31'
  };

  const mockCategoryOption: CategoryOption = {
    productCategoryId: 1,
    productCategoryName: 'Electronics'
  };

  const mockResponseCategory: ResponseCategory = {
    productCategoryId: 1,
    productCategoryName: 'Electronics',
    promotionDTOList: [mockPromotionDTO]
  };

  const mockCategoryResponsePageable: CategoryResponsePageable = {
    responseCategoryList: [mockResponseCategory],
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 1,
    end: true
  };

  const mockCategoryRegister: CategoryRegister = {
    categoryName: 'New Category',
    promotionListId: [1, 2]
  };

  const mockApiResponseCategoryList: ApiResponse<CategoryOption[]> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Categories retrieved successfully',
    type: 'I',
    date: new Date(),
    data: [mockCategoryOption]
  };

  const mockApiResponsePageable: ApiResponse<CategoryResponsePageable> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Pageable categories retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockCategoryResponsePageable
  };

  const mockApiResponseCategory: ApiResponse<ResponseCategory> = {
    error: false,
    code: '200',
    title: 'Success',
    mensaje: 'Category retrieved successfully',
    type: 'I',
    date: new Date(),
    data: mockResponseCategory
  };

  const mockApiResponseCategoryRegister: ApiResponse<CategoryRegister> = {
    error: false,
    code: '201',
    title: 'Created',
    mensaje: 'Category created successfully',
    type: 'I',
    date: new Date(),
    data: { ...mockCategoryRegister }
  };

  const mockApiResponseUpdate: ApiResponse<ResponseCategory> = {
    error: false,
    code: '200',
    title: 'Updated',
    mensaje: 'Category updated successfully',
    type: 'I',
    date: new Date(),
    data: { ...mockResponseCategory, productCategoryName: 'Updated Category' }
  };

  const mockApiResponseDelete: ApiResponse<ResponseCategory> = {
    error: false,
    code: '200',
    title: 'Deleted',
    mensaje: 'Category deleted successfully',
    type: 'I',
    date: new Date(),
    data: mockResponseCategory
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refresh functionality', () => {
    it('should have refresh$ observable', () => {
      expect(service.refresh$).toBeDefined();
    });

    it('should emit when refreshCategories is called', (done) => {
      // Arrange & Act
      service.refresh$.subscribe(() => {
        // Assert
        expect(true).toBe(true); // Verify that the observable emitted
        done();
      });

      // Act
      service.refreshCategories();
    });

    it('should emit multiple times when refreshCategories is called multiple times', () => {
      // Arrange
      let emissionCount = 0;

      // Act
      service.refresh$.subscribe(() => {
        emissionCount++;
      });

      service.refreshCategories();
      service.refreshCategories();
      service.refreshCategories();

      // Assert
      expect(emissionCount).toBe(3);
    });
  });

  describe('findAllCategories', () => {
    it('should retrieve all categories successfully', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;

      // Act
      service.findAllCategories().subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual([mockCategoryOption]);
          expect(response.length).toBe(1);
          expect(response[0].productCategoryId).toBe(1);
          expect(response[0].productCategoryName).toBe('Electronics');
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseCategoryList);
    });

    it('should handle empty categories list', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;
      const emptyApiResponse: ApiResponse<CategoryOption[]> = {
        ...mockApiResponseCategoryList,
        data: []
      };

      // Act
      service.findAllCategories().subscribe({
        next: (response) => {
          // Assert - Verify empty response
          expect(response).toEqual([]);
          expect(response.length).toBe(0);
        }
      });

      // Assert - Verify HTTP request and simulate empty response
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(emptyApiResponse);
    });

    it('should handle null data in response', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;
      const nullDataResponse: ApiResponse<CategoryOption[]> = {
        ...mockApiResponseCategoryList,
        data: null as any
      };

      // Act
      service.findAllCategories().subscribe({
        next: (response) => {
          // Assert - Verify fallback to empty array
          expect(response).toEqual([]);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      req.flush(nullDataResponse);
    });

    it('should handle server error', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list`;

      // Act
      service.findAllCategories().subscribe({
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
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getPageableCategories', () => {
    it('should retrieve pageable categories with default parameters', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list/pageable?pageNo=0&pageSize=10&sortBy=&sortDir=asc`;

      // Act
      service.getPageableCategories().subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockCategoryResponsePageable);
          expect(response.responseCategoryList.length).toBe(1);
          expect(response.pageNumber).toBe(0);
          expect(response.pageSize).toBe(10);
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

    it('should retrieve pageable categories with custom parameters', () => {
      // Arrange
      const pageNo = 1;
      const pageSize = 20;
      const sortBy = 'productCategoryName';
      const sortDir = 'desc';
      const expectedUrl = `${baseUrl}/list/pageable?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;

      // Act
      service.getPageableCategories(pageNo, pageSize, sortBy, sortDir).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockCategoryResponsePageable);
        }
      });

      // Assert - Verify HTTP request with custom parameters
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponsePageable);
    });

    it('should handle empty pageable response', () => {
      // Arrange
      const expectedUrl = `${baseUrl}/list/pageable?pageNo=0&pageSize=10&sortBy=&sortDir=asc`;
      const emptyPageableResponse: CategoryResponsePageable = {
        responseCategoryList: [],
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0,
        end: true
      };
      const emptyApiResponse: ApiResponse<CategoryResponsePageable> = {
        ...mockApiResponsePageable,
        data: emptyPageableResponse
      };

      // Act
      service.getPageableCategories().subscribe({
        next: (response) => {
          // Assert - Verify empty pageable response
          expect(response.responseCategoryList.length).toBe(0);
          expect(response.totalElements).toBe(0);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      req.flush(emptyApiResponse);
    });
  });

  describe('getCategoryById', () => {
    it('should retrieve category by id successfully', () => {
      // Arrange
      const categoryId = 1;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.getCategoryById(categoryId).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockResponseCategory);
          expect(response.productCategoryId).toBe(1);
          expect(response.productCategoryName).toBe('Electronics');
          expect(response.promotionDTOList[0]).toEqual(mockPromotionDTO);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseCategory);
    });

    it('should handle category not found error', () => {
      // Arrange
      const categoryId = 999;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.getCategoryById(categoryId).subscribe({
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
      req.flush('Category not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', () => {
      // Arrange
      const expectedUrl = baseUrl;

      // Act
      service.createCategory(mockCategoryRegister).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockCategoryRegister);
          expect(response.categoryName).toBe('New Category');
          expect(response.promotionListId).toEqual([1, 2]);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(expectedUrl);
      expect(req.request.body).toEqual(mockCategoryRegister);

      // Simulate server response
      req.flush(mockApiResponseCategoryRegister);
    });

    it('should handle validation error when creating category', () => {
      // Arrange
      const expectedUrl = baseUrl;
      const invalidCategory: CategoryRegister = {
        categoryName: '',
        promotionListId: []
      };

      // Act
      service.createCategory(invalidCategory).subscribe({
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
      expect(req.request.body).toEqual(invalidCategory);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', () => {
      // Arrange
      const categoryId = 1;
      const expectedUrl = `${baseUrl}/${categoryId}`;
      const updatePayload: CategoryRegister = {
        categoryName: 'Updated Category',
        promotionListId: [1, 3]
      };

      // Act
      service.updateCategory(categoryId, updatePayload).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response.productCategoryId).toBe(1);
          expect(response.productCategoryName).toBe('Updated Category');
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.url).toBe(expectedUrl);
      expect(req.request.body).toEqual(updatePayload);

      // Simulate server response
      req.flush(mockApiResponseUpdate);
    });

    it('should handle error when updating non-existent category', () => {
      // Arrange
      const categoryId = 999;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.updateCategory(categoryId, mockCategoryRegister).subscribe({
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
      expect(req.request.body).toEqual(mockCategoryRegister);
      req.flush('Category not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', () => {
      // Arrange
      const categoryId = 1;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.deleteCategory(categoryId).subscribe({
        next: (response) => {
          // Assert - Verify response data
          expect(response).toEqual(mockResponseCategory);
          expect(response.productCategoryId).toBe(1);
        }
      });

      // Assert - Verify HTTP request
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(expectedUrl);

      // Simulate server response
      req.flush(mockApiResponseDelete);
    });

    it('should handle error when deleting non-existent category', () => {
      // Arrange
      const categoryId = 999;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.deleteCategory(categoryId).subscribe({
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
      req.flush('Category not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle forbidden error when deleting category', () => {
      // Arrange
      const categoryId = 1;
      const expectedUrl = `${baseUrl}/${categoryId}`;

      // Act
      service.deleteCategory(categoryId).subscribe({
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
