import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ItemProductService } from '../../../../../../core/services/products/items-products.service';
import { ItemProductList } from '../item-product-list';
import { ResponseProductItemDetail, Variation } from '../../../../../../shared/models/products/product.interface';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PipesModule } from '../../../../../../shared/pipes/pipes.module';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'item-product-list-page',
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.css',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    RippleModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    CommonModule,
    FileUploadModule,
    DropdownModule,
    TagModule,
    RadioButtonModule,
    RatingModule,
    FormsModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    PipesModule,
    RouterModule
  ],
  providers: [MessageService, ConfirmationService],
})
export class ListItemProductPageComponent extends ItemProductList implements OnInit {
  @ViewChild('dt') dt!: Table;

  cols!: Column[];
  exportColumns!: ExportColumn[];
  selectedProducts!: ResponseProductItemDetail[] | null;

  confirmationService = inject(ConfirmationService);
  itemProductService = inject(ItemProductService);
  messageService = inject(MessageService);
  _changeDetectorRef = inject(ChangeDetectorRef);
  router = inject(Router);

  constructor(
  ) {
    super();
  }

  ngOnInit() {
    this.cols = [
      { field: 'productItemImage', header: 'Imagen' },
      { field: 'productItemSKU', header: 'SKU', customExportHeader: 'Product SKU' },
      { field: 'productItemQuantityInStock', header: 'Stock' },
      { field: 'productItemPrice', header: 'Precio' },
      { field: 'variations', header: 'Variaciones' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onEditItemProduct(item: ResponseProductItemDetail): void {
    this.router.navigate(['edit', item.productItemId]);
  }

  onDeleteItemProduct(item: ResponseProductItemDetail): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar el item con el SKU: "${item.productItemSKU}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.itemProductService.deleteItemproduct(item.productItemId).subscribe(
          () => {
            this.items = this.items.filter(i => i.productItemId !== item.productItemId);
            this._changeDetectorRef.detectChanges();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Entidad eliminada correctamente.',
              life: 3000
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrió un error al eliminar la entidad.',
              life: 3000
            });
          }
        );
      },
    });
  }

  openNew() {
    this.router.navigate(['new']);
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar los productos seleccionados?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedProducts && this.selectedProducts.length > 0) {
          // Crear array de IDs a eliminar
          const idsToDelete = this.selectedProducts.map(product => product.productItemId);

          // Contador para seguir el progreso
          let successCount = 0;
          let errorCount = 0;

          // Procesar cada eliminación
          this.selectedProducts.forEach(product => {
            this.itemProductService.deleteItemproduct(product.productItemId).subscribe(
              () => {
                successCount++;
                // Remover el producto de la lista local
                this.items = this.items.filter(item => item.productItemId !== product.productItemId);

                // Cuando todas las operaciones terminan
                if (successCount + errorCount === this.selectedProducts!.length) {
                  this._changeDetectorRef.detectChanges();
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${successCount} productos eliminados correctamente.`,
                    life: 3000
                  });

                  // Reset productos seleccionados
                  this.selectedProducts = null;
                }
              },
              (error) => {
                errorCount++;
                console.error('Error al eliminar producto:', product.productItemId, error);

                // Cuando todas las operaciones terminan
                if (successCount + errorCount === this.selectedProducts!.length) {
                  this._changeDetectorRef.detectChanges();
                  if (errorCount > 0) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: `${errorCount} productos no pudieron ser eliminados.`,
                      life: 3000
                    });
                  }
                }
              }
            );
          });
        }
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  getStockSeverity(stock: number): 'success' | 'info' | 'warning' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warning';
    return 'danger';
  }

  getStockLabel(stock: number): string {
    if (stock > 10) return 'EN STOCK';
    if (stock > 0) return 'BAJO STOCK';
    return 'SIN STOCK';
  }

  formatVariations(variations: Variation[]): string {
    return variations.map(v => `${v.variationName}: ${v.options}`).join(', ');
  }
}
