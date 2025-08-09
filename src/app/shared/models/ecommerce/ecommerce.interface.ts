// ============================================================================
// INTERFACES PARA E-COMMERCE - PRODUCTOS
// ============================================================================

export interface EcommerceProduct {
  productId: number;
  productName: string;
  productDescription: string;
  productImage?: string;
  responseCategory: ProductCategory;
  responseProductItemDetails: ProductItemDetail[];
  // Campos adicionales para e-commerce
  featured?: boolean;
  newProduct?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductCategory {
  productCategoryId: number;
  productCategoryName: string;
  promotionDTOList: Promotion[];
}

export interface ProductItemDetail {
  productItemId: number;
  productItemSKU: string;
  productItemQuantityInStock: number;
  productItemImage?: string;
  productItemPrice: number;
  variations: ProductVariation[];
  // Campos adicionales
  salePrice?: number;
  discount?: number;
}

export interface ProductVariation {
  variationName: string;
  options: string;
}

export interface Promotion {
  promotionId: number;
  promotionName: string;
  promotionDescription: string;
  promotionDiscountRate: number;
  promotionStartDate: string;
  promotionEndDate: string;
}

// ============================================================================
// INTERFACES PARA E-COMMERCE - SERVICIOS
// ============================================================================

export interface EcommerceInterfaceService {
  serviceDTO: ServiceDetail;
  responseCategoryWIthoutServices: ServiceCategory;
  // Campos adicionales para e-commerce
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  availableSlots?: number;
}

export interface ServiceDetail {
  serviceId: number;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number;
  serviceImage?: string;
  durationTimeAprox: string; // LocalTime as string
  // Campos adicionales
  salePrice?: number;
  discount?: number;
}

export interface ServiceCategory {
  serviceCategoryDTO: {
    categoryId: number;
    categoryName: string;
  };
  responseSubCategoryList: SubCategory[];
  promotionDTOList: Promotion[];
}

export interface SubCategory {
  serviceCategoryDTO: {
    categoryId: number;
    categoryName: string;
  };
}

// ============================================================================
// INTERFACES PARA FILTROS DE E-COMMERCE
// ============================================================================

export interface EcommerceProductFilter {
  searchTerm?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasPromotion?: boolean;
  featured?: boolean;
  newProducts?: boolean;
  variations?: FilterVariation[];
  sortBy?: SortByType;
  sortDirection?: SortDirectionType;
  pageNumber?: number;
  pageSize?: number;
}

export interface EcommerceServiceFilter {
  searchTerm?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  hasPromotion?: boolean;
  featured?: boolean;
  isAvailable?: boolean;
  sortBy?: 'name' | 'price' | 'duration' | 'rating';
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export interface FilterVariation {
  variationName: string;
  selectedOptions: string[];
}

// ============================================================================
// INTERFACES PARA CARRITO DE COMPRAS
// ============================================================================

export interface CartItem {
  id: number; // Unique identifier for cart item
  type: 'product' | 'service' ;
  productId?: number;
  serviceId?: number;
  productItemId?: number; // For specific product variant
  name: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity?: number;
  selectedVariations?: SelectedVariation[];
  // Para servicios
  appointmentDateTime?: Date;
  employeeId?: number;
  employeeName?: string;
  duration?: string;
}

export interface SelectedVariation {
  variationName: string;
  selectedOption: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

// ============================================================================
// INTERFACES PARA RESPUESTAS PAGINADAS
// ============================================================================

export interface EcommerceProductResponse {
  responseProductList: EcommerceProduct[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

export interface EcommerceServiceResponse {
  responseServiceList: EcommerceInterfaceService[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

// ============================================================================
// INTERFACES PARA OPCIONES DE FILTRADO
// ============================================================================

export interface ProductFilterOptions {
  categories: CategoryOption[];
  priceRange: PriceRange;
  variations: VariationOption[];
  brands?: string[];
}

export interface ServiceFilterOptions {
  categories: CategoryOption[];
  priceRange: PriceRange;
  durationRange: DurationRange;
  employees?: EmployeeOption[];
}

export interface CategoryOption {
  id: number;
  name: string;
  productCount?: number;
  serviceCount?: number;
  parentId?: number;
  selected?: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface DurationRange {
  minMinutes: number;
  maxMinutes: number;
}

export interface VariationOption {
  name: string;
  options: string[];
}

export interface EmployeeOption {
  id: number;
  name: string;
  specialty?: string;
  yearsExperience? : number;
  rating?: number;
  selected?: boolean;
}

// ============================================================================
// INTERFACES PARA DETALLES DE PRODUCTO/SERVICIO
// ============================================================================

export interface ProductDetail extends EcommerceProduct {
  relatedProducts?: EcommerceProduct[];
  reviews?: Review[];
  averageRating?: number;
  specifications?: ProductSpecification[];
}

export interface ServiceDetail extends EcommerceInterfaceService {
  relatedServices?: EcommerceInterfaceService[];
  reviews?: Review[];
  averageRating?: number;
  availableEmployees?: EmployeeOption[];
  availableTimeSlots?: TimeSlot[];
}

export interface Review {
  id: number;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  verified?: boolean;
  helpfulCount?: number;
  images?: string[]; // URLs of review images
  storeResponse?: {
    message: string;
    date : Date;
  };
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  employeeId: number;
  employeeName: string;
  scheduleId: number;
}

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum SortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING_ASC = 'rating_asc',
  RATING_DESC = 'rating_desc',
  NEWEST = 'newest',
  FEATURED = 'featured'
}

export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT = SortOption.NAME_ASC;
export type SortByType = 'name' | 'price' | 'rating' | 'newest';
export type SortDirectionType = 'asc' | 'desc';
export type SortByServiceType = 'name' | 'price' | 'rating' | 'duration';
