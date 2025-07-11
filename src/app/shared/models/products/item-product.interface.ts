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
  deleteFile?: boolean;
}

export interface RequestVariation {
  variationName:        string;
  variationOptionValue: string;
}

export interface ItemProductFormData {
  productId: number;
  productItemSKU: string;
  productItemQuantityInStock: number;
  productItemPrice: number;
  requestVariations: RequestVariation[];
  imagen?: File; // Archivo de imagen seleccionado
  deleteFile?: boolean; // Para indicar si se debe eliminar la imagen
}
