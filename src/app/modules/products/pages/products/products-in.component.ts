import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ProductsService } from '../../../../core/services/products/products.service';
import { ResponsePageableProducts, ResponseProduct } from '../../../../shared/models/products/product.interface';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-products-in-page',
  templateUrl: './products-in.component.html',
  styleUrls: ['./products-in.component.scss']
})
export class ProductInComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  // Signals
  public products = signal<ResponsePageableProducts | null>(null);
  public productList = computed(() => this.products()?.responseProductList ?? []);
  public isLoading = signal<boolean>(true);
  public layout = signal<'list' | 'grid'>('grid');
  public layoutOptions = [
    { label: 'Lista', value: 'list', icon: 'pi pi-bars' },
    { label: 'Cuadrícula', value: 'grid', icon: 'pi pi-th-large' }
  ];
  public productDialog = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    this.loadPageableProducts();
  }

  loadPageableProducts(): void {
    this.isLoading.set(true);
    this.productsService.getPageableProducts()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(apiResponse => {
        this.products.set(apiResponse);
      });
  }

  getInventoryStatus(product: ResponseProduct): { status: string; severity: 'success' | 'warning' | 'danger' } {
    if (product?.responseProductItemDetails && product.responseProductItemDetails.length > 0) {
      const totalStock = product.responseProductItemDetails.reduce((acc, item) => acc + item.productItemQuantityInStock, 0);
      if (totalStock > 10) return { status: 'EN STOCK', severity: 'success' };
      if (totalStock > 0) return { status: 'STOCK BAJO', severity: 'warning' };
    }
    return { status: 'SIN STOCK', severity: 'danger' };
  }

  openNew(): void { this.productDialog.set(true); }
  hideDialog(refresh: boolean = false): void {
    this.productDialog.set(false);
    if (refresh) {
      this.loadPageableProducts();
    }
  }
}
