// Enums
export enum ShopOrderStatusEnum {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  QR_CODE = 'QR_CODE'
}

// Request interfaces
export interface ProductRequest {
  productId: number;
  productQuantity: number;
}

export interface RequestAddress {
  adressStreet: string;
  adressCity: string;
  adressState: string;
  adressCountry: string;
  adressPostalCode: string;
}

export interface RequestShopOrder {
  productRequestList: ProductRequest[];
  reservationId: number;
  userId: number;
  requestAdress: RequestAddress;
  shoppingMethodId: number;
}

// Response interfaces
export interface AddressDTO {
  addressId: number;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  addressCountry: string;
}

export interface PaymentDTO {
  paymentId: number;
  paymentProvider: string;
  paymentAccountNumber: string;
  paymentExpirationDate: string;
  paymentIsDefault: boolean;
  paymentTotalPrice: number;
  userId: number;
  paymentType: PaymentType;
  shopOrderId: number;
}

export interface OrderLineDTO {
  orderLineId: number;
  orderLineQuantity: number;
  orderLinePrice: number;
  orderLineState: string;
  orderLineTotal: number;
  productItemId: number;
  reservationId: number;
  guiaRemisionId: number;
}

export interface PromotionDTO {
  promotionId: number;
  promotionName: string;
  promotionDescription: string;
  promotionDiscountRate: number;
  promotionStartDate: string;
  promotionEndDate: string;
}

export interface ResponseCategory {
  productCategoryId: number;
  productCategoryName: string;
  promotionDTOList: PromotionDTO[];
}

export interface ResponseVariation {
  variationName: string;
  options: string;
}

export interface ResponseProductItemDetail {
  productItemId: number;
  productItemSKU: string;
  productItemQuantityInStock: number;
  productItemImage: string;
  productItemPrice: number;
  responseCategory: ResponseCategory;
  variations: ResponseVariation[];
}

export interface ServiceDTO {
  serviceId:          number;
  serviceName:        string;
  serviceDescription: string;
  servicePrice:       number;
  serviceImage:       string;
  durationTimeAprox:  string;
}

export interface ScheduleDTO {
  scheduleId: number;
  scheduleDate: string; // LocalDate se mapea a string en formato ISO (YYYY-MM-DD)
  scheduleHourStart: string; // LocalTime se mapea a string en formato HH:mm:ss
  scheduleHourEnd: string;
  scheduleState: string;
  employeeId: number;
}

export interface ResponseWorkServiceDetail {
  serviceDTO: ServiceDTO;
  scheduleDTO: ScheduleDTO;
}

export interface ResponseReservationDetail {
  reservationId: number;
  reservationState: string;
  reservationTotalPrice: number;
  responseWorkServiceDetails: ResponseWorkServiceDetail[];
}

export interface ResponseShopOrderDetail {
  shopOrderId: number;
  shopOrderStatus: ShopOrderStatusEnum;
  sopOrderDate: string;
  shippingMethod: string;
  addressDTO: AddressDTO;
  paymentDTO: PaymentDTO;
  orderLineDTOList: OrderLineDTO[];
  responseProductItemDetailList: ResponseProductItemDetail[];
  responseReservationDetail: ResponseReservationDetail;
}

export interface ShopOrderDTO {
  shopOrderId: number;
  shopOrderDate: string;
  shopOrderStatus: ShopOrderStatusEnum;
  shopOrderTotal: number;
  userId: number;
}

export interface ShoppingMethodDTO {
  shoppingMethodId: number;
  shoppingMethodName: string;
  shoppingMethodPrice: number;
}

export interface ResponseShopOrder {
  shopOrderDTO: ShopOrderDTO;
  addressDTO: AddressDTO;
  orderLineDTOList: OrderLineDTO[];
  shoppingMethodDTO: ShoppingMethodDTO;
  factureNumber: number;
}

export interface ResponseListPageableShopOrder {
  responseShopOrderList: ResponseShopOrder[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}
