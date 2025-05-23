// category.component.ts - Main Component
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ResponseCategory } from '../../../../shared/models/categories/category.interface';
import { CategoryService } from '../../../../core/services/reservations/category.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: ResponseCategory[] = [];
  categoryDialog: boolean = false;
  deleteDialog: boolean = false;
  selectedCategory: ResponseCategory | null = null;
  isLoading: boolean = false;

  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  _changeDetectorRef = inject(ChangeDetectorRef);

  constructor(
  ) {}

  ngOnInit(): void {
  }


  /**
   * Opens dialog for creating a new category
   */
  openNewCategoryDialog(): void {
    this.selectedCategory = null;
    this.categoryDialog = true;
  }

  /**
   * Opens dialog for editing an existing category
   * @param category The category to edit
   */
  openEditCategoryDialog(category: ResponseCategory): void {
    this.selectedCategory = { ...category };
    this.categoryDialog = true;
  }

  /**
   * Closes the category dialog
   */
  hideCategoryDialog(): void {
    this.categoryDialog = false;
    this.selectedCategory = null;
  }

  /**
   * Handles the delete category action
   * @param category The category to delete
   */
  confirmDeleteCategory(category: ResponseCategory): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar la categoría "${category.productCategoryName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteCategory(category.productCategoryId),
      reject: () => this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Operación cancelada'
      })
    });
  }

  /**
   * Deletes a category
   * @param categoryId The ID of the category to delete
   */
  private deleteCategory(categoryId: number): void {
    this.isLoading = true;
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Categoría eliminada correctamente'
        });
        this.refreshCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al eliminar la categoría'
        });
      },
      complete: () => this.isLoading = false
    });
  }

  /**
   * Refreshes the categories list
   */
  refreshCategories(): void {
    this.categoryService.refreshCategories();
  }
}
