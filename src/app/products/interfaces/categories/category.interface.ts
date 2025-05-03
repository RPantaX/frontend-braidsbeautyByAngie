export interface CategoryOption {
  productCategoryId:   number;
  productCategoryName: string;
}

export interface CategoryResponse {
  responseCategoryList: ResponseCategory[];
  pageNumber:           number;
  pageSize:             number;
  totalPages:           number;
  totalElements:        number;
  end:                  boolean;
}

export interface ResponseCategory {
  productCategoryId:       number;
  productCategoryName:     string;
  responseSubCategoryList: ResponseSubCategory[];
  promotionDTOList:        PromotionDTO[];
  productDTOList:          ProductDTO[];
}

export interface ProductDTO {
  productId:          number;
  productName:        string;
  productDescription: string;
  productImage:       string;
}

export interface PromotionDTO {
  promotionId:           number;
  promotionName:         string;
  promotionDescription:  string;
  promotionDiscountRate: number;
  promotionStartDate:    Date;
  promotionEndDate:      Date;
}

export interface ResponseSubCategory {
  productCategoryId:   number;
  productCategoryName: string;
}
