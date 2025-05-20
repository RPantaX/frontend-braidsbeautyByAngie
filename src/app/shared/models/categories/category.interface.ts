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
  promotionDTOList:        PromotionDTO[];
}

export interface PromotionDTO {
  promotionId:           number;
  promotionName:         string;
  promotionDescription:  string;
  promotionDiscountRate: number;
  promotionStartDate:    Date;
  promotionEndDate:      Date;
}


export interface CategoryResponsePageable {
  responseCategoryList: ResponseCategory[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

export interface CategoryRegister {
  categoryName: string;
  promotionListId:     number[];
}
