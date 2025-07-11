import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ItemProductFormData, ItemProductResponse, ItemProductSave } from '../../../shared/models/products/item-product.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class ItemProductService {
  private baseUrl: string = environment.baseUrl + '/product-service';
  constructor(private httpClient: HttpClient) { }

  getListItemProductById(id: Number) : Observable<ItemProductResponse> {
    return this.httpClient.get<ApiResponse<ItemProductResponse>>(`${this.baseUrl}/itemProduct/${id}`).pipe(
          map(response => response.data)
        );
  }
  saveItemProduct(itemProductData: ItemProductFormData): Observable<any> {
    const formData = this.buildFormDataForModelAttribute(itemProductData);
    return this.httpClient.post(`${this.baseUrl}/itemProduct`, formData);
  }
  updateItemProduct(id: number, itemProductData: ItemProductFormData): Observable<any> {
    const formData = this.buildFormDataForModelAttribute(itemProductData);
    return this.httpClient.put(`${this.baseUrl}/itemProduct/${id}`, formData);
  }
  deleteItemproduct(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/itemProduct/${id}`);
  }
    private buildFormDataForModelAttribute(itemProductData: ItemProductFormData): FormData {
    const formData = new FormData();

    // ✅ Campos básicos - nombres deben coincidir exactamente con RequestItemProduct
    formData.append('productId', itemProductData.productId.toString());
    formData.append('productItemSKU', itemProductData.productItemSKU);
    formData.append('productItemQuantityInStock', itemProductData.productItemQuantityInStock.toString());
    formData.append('productItemPrice', itemProductData.productItemPrice.toString());
    // ✅ Para @ModelAttribute, las variaciones deben enviarse como campos individuales
    // Formato: requestVariations[0].variationName, requestVariations[0].variationOptionValue, etc.
    if (itemProductData.requestVariations && itemProductData.requestVariations.length > 0) {
      itemProductData.requestVariations.forEach((variation, index) => {
        formData.append(`requestVariations[${index}].variationName`, variation.variationName);
        formData.append(`requestVariations[${index}].variationOptionValue`, variation.variationOptionValue);
      });
    }

    // ✅ Adjuntar imagen si existe
    if (itemProductData.imagen && itemProductData.imagen instanceof File) {
      formData.append('imagen', itemProductData.imagen);
    }

    // ✅ Adjuntar flag de eliminación de archivo
    if (itemProductData.deleteFile === true) {
      formData.append('deleteFile', 'true');
    } else {
      formData.append('deleteFile', 'false');
    }

    return formData;
  }
}
