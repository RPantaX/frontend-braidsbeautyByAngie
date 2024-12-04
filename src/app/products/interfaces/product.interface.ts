export interface ResponsePageableProducts {
  responseProductList: ResponseProductList[];
  pageNumber:          number;
  pageSize:            number;
  totalPages:          number;
  totalElements:       number;
  end:                 boolean;
}

export interface ResponseProductList {
  productId:                  number;
  productName:                string;
  productDescription:         string;
  productImage:               string;
  responseCategory:           ResponseCategory;
  responseProductItemDetails: ResponseProductItemDetail[];
}

export interface ResponseCategory {
  productCategoryId:   number;
  productCategoryName: string;
  promotionDTOList:    PromotionDTOList[];
}

export interface PromotionDTOList {
  promotionId:           number;
  promotionName:         string;
  promotionDescription:  string;
  promotionDiscountRate: number;
  promotionStartDate:    Date;
  promotionEndDate:      Date;
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
