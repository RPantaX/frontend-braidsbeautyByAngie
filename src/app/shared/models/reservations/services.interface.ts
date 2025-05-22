import { PromotionDTO } from "../promotions/promotion.interface";

export interface ResponseServicePageable {
  responseServiceList: ResponseService[];
  pageNumber:          number;
  pageSize:            number;
  totalPages:          number;
  totalElements:       number;
  end:                 boolean;
}

export interface ResponseService {
  serviceDTO:                      ServiceDTO;
  responseCategoryWIthoutServices: ResponseCategory;
}

export interface ResponseCategory {
  serviceCategoryDTO:      ServiceCategoryDTO;
  promotionDTOList:        PromotionDTO[];
}


export interface ServiceCategoryDTO {
  categoryId:   number;
  categoryName: string;
}

export interface ServiceDTO {
  serviceId:          number;
  serviceName:        string;
  serviceDescription: string;
  servicePrice:       number;
  serviceImage:       string;
  durationTimeAprox:  string;
}
export interface RequestService {
  serviceName:        string;
  serviceDescription: string;
  serviceImage:       string;
  durationTimeAprox:  string;
  servicePrice:       number;
  serviceCategoryId:  number;
}
