import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponsePageableProducts, ResponseProduct, SaveProduct } from '../../../shared/models/products/product.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class ProductsService {

  private baseUrl: string = environment.baseUrl + '/product-service/product';

  constructor(private http: HttpClient) { }

  getPageableProducts():Observable<ResponsePageableProducts>{
      return this.http.get<ApiResponse<ResponsePageableProducts> >(`${this.baseUrl}/list`).pipe(
      map(response => response.data) );
  }

  getProductById(id: Number): Observable<ResponseProduct >{
    return this.http.get<ApiResponse<ResponseProduct> >(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data) );
  }
  getProducts(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/list`).pipe(
      map(response => response.data) );
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, formData);
  }

  updateProduct(productId: number, formData: FormData): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${productId}`, formData);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${productId}`);
  }

    /**
   * Construye FormData para envío multipart
   */

  // MANTENER todos los demás métodos existentes como:
  // getProductById, listProducts, deleteProduct, etc.
  // Solo AGREGAR los métodos de arriba

  /**
   * Método de compatibilidad para código existente que use SaveProduct
   * @deprecated Use createProduct or updateProduct instead
   */
  /*
  saveProduct(productData: SaveProduct): Observable<any> {
    const createData: CreateProduct = {
      productName: productData.productName,
      productDescription: productData.productDescription,
      productCategoryId: productData.productCategoryId
    };
    return this.createProduct(createData);
  }*/
}
