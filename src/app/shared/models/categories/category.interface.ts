import { PromotionDTO } from "../promotions/promotion.interface";

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
