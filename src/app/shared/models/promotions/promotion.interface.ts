// Interfaz para categoría de producto
export interface ProductCategory {
  categoryId: number;
  categoryName: string;
}

// Interfaz para la promoción
export interface PromotionDTO {
  promotionId: number;
  promotionName: string;
  promotionDescription: string;
  promotionDiscountRate: number;
  promotionStartDate: string | Date;
  promotionEndDate: string | Date;
}

// Interfaz para la promoción con sus categorías
export interface PromotionWithCategories {
  promotionDTO: PromotionDTO;
  categoryDTOList: ProductCategory[];
}

// Interfaz para la respuesta paginada de promociones
export interface PromotionResponsePageable {
  responsePromotionList: PromotionWithCategories[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}
