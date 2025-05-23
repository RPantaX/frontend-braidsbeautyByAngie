import { PromotionDTO } from "../promotions/promotion.interface";

export interface CategoryOption {
  categoryId:   number;
  categoryName: string;
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
