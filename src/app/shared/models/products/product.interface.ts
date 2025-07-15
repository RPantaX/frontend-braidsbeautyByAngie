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
  productImage?:               string | null;
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
  productName: string;
  productDescription?: string;
  imagen?: string; // URL de la imagen existente (para mostrar en modo edición)
  productCategoryId: number;
  deleteFile?: boolean; // Para indicar si se debe eliminar la imagen
  categoryId?: number; // Para compatibilidad con el formulario
  categoryName?: string; // Para mostrar el nombre de la categoría
}

export interface ProductFormData {
  productName: string;
  productDescription?: string;
  productCategoryId: number;
  imagen?: File; // Archivo de imagen seleccionado
  deleteFile?: boolean; // Para indicar si se debe eliminar la imagen
}
