export interface ResponsePageableProducts {
  responseProductList: ResponseProduct[];
  pageNumber:          number;
  pageSize:            number;
  totalPages:          number;
  totalElements:       number;
  end:                 boolean;
}

export interface ResponseProduct {
  productId:                  number;
  productName:                string;
  productDescription:         string;
  productImage?:               string;
  responseCategory:           ResponseCategory;
  responseProductItemDetails: ResponseProductItemDetail[];
}

export interface ResponseCategory {
  productCategoryId:   number;
  productCategoryName: string;
  promotionDTOList:    PromotionDTO[];
}

export interface PromotionDTO {
  promotionId:           number;
  promotionName:         string;
  promotionDescription:  string;
  promotionDiscountRate: number;
  promotionStartDate:    string;
  promotionEndDate:      string;
}

export interface ResponseProductItemDetail {
  productItemId:              number;
  productItemSKU:             string;
  productItemQuantityInStock: number;
  productItemImage:           string;
  productItemPrice:           number;
  variations:                 Variation[];
}

export interface Variation {
  variationName: string;
  options:       string;
}

export interface SaveProduct {
  productName:        string;
  productDescription?: string;
  productImage?:       string;
  productCategoryId:  number;
}
