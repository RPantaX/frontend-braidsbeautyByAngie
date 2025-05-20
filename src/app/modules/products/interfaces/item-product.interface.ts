export interface ItemProductResponse {
  productItemId:              number;
  productItemSKU:             string;
  productItemQuantityInStock: number;
  productItemImage:           string;
  productItemPrice:           number;
  responseCategoryy:          ResponseCategoryy;
  variations:                 Variation[];
}

export interface ResponseCategoryy {
  productCategoryId:   number;
  productCategoryName: string;
  promotionDTOList:    PromotionDTO[];
}

export interface PromotionDTO {
  promotionId:           number;
  promotionName:         string;
  promotionDescription:  string;
  promotionDiscountRate: number;
  promotionStartDate:    Date;
  promotionEndDate:      Date;
}

export interface Variation {
  variationName: string;
  options:       string;
}

export interface ItemProductSave {
  productId:                  number;
  productItemSKU:             string;
  productItemQuantityInStock: number;
  productItemImage?:           string;
  productItemPrice:           number;
  requestVariations:          RequestVariation[];
}

export interface RequestVariation {
  variationName:        string;
  variationOptionValue: string;
}
