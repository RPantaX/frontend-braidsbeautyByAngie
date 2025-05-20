export interface CategoryOption {
  serviceCategoryId:   number;
  serviceCategoryName: string;
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
  serviceCategoryId:       number;
  serviceCategoryName:     string;
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
  productCategoryName: string;
  promotionListId:     number[];
}
