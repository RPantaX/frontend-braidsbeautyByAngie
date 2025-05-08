// category.component.ts - Main Component
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { PromotionService } from '../../services/promotion.service';
import { ResponseCategory, CategoryRegister } from '../../interfaces/categories/category.interface';
import { PromotionDTO } from '../../interfaces/promotions/promotion.interface';

@Component({
  selector: 'app-category-page',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: ResponseCategory[] = [];
  promotions: PromotionDTO[] = [];
  categoryDialog: boolean = false;
  deleteDialog: boolean = false;
  selectedCategory: ResponseCategory | null = null;
  isLoading: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private promotionService: PromotionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Load promotions for the dropdown in the category form
    this.loadPromotions();
  }

  /**
   * Load all promotions for use in category creation/editing
   */
  loadPromotions(): void {
    this.isLoading = true;
    this.promotionService.getAllPromotions().subscribe({
      next: (data) => {
        this.promotions = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las promociones'
        });
        this.isLoading = false;
      }
    });
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
