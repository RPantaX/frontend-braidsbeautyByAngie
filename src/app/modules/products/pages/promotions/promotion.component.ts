// promotion.component.ts - Main Component (Enhanced)
import { Component, inject, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PromotionService } from '../../../../core/services/products/promotion.service';
import { PromotionDTO, PromotionWithCategories } from '../../../../shared/models/promotions/promotion.interface';

@Component({
  selector: 'app-promotion-page',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.css']
})
export class PromotionComponent implements OnInit {
  promotions: PromotionWithCategories[] = [];
  promotionDialog: boolean = false;
  deleteDialog: boolean = false;
  selectedPromotion: PromotionDTO | null = null;
  isLoading: boolean = false;

  private promotionService = inject(PromotionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor() {}

  ngOnInit(): void {
    // Initial operations if needed
  }

  /**
   * Opens dialog for creating a new promotion
   */
  openNewPromotionDialog(): void {
    this.selectedPromotion = null;
    this.promotionDialog = true;
  }

  /**
   * Opens dialog for editing an existing promotion
   * @param promotion The promotion to edit
   */
  openEditPromotionDialog(promotion: PromotionDTO): void {
    this.selectedPromotion = { ...promotion };
    this.promotionDialog = true;
  }

  /**
   * Closes the promotion dialog
   */
  hidePromotionDialog(): void {
    this.promotionDialog = false;
    this.selectedPromotion = null;
  }

  /**
   * Handles the delete promotion action
   * @param promotion The promotion to delete
   */
  confirmDeletePromotion(promotion: PromotionDTO): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar la promoción "${promotion.promotionName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePromotion(promotion.promotionId),
      reject: () => this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Operación cancelada'
      })
    });
  }

  /**
   * Deletes a promotion
   * @param promotionId The ID of the promotion to delete
   */
  private deletePromotion(promotionId: number): void {
    this.isLoading = true;
    this.promotionService.deletePromotion(promotionId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Promoción eliminada correctamente'
        });
        this.refreshPromotions();
      },
      error: (error) => {
        console.error('Error deleting promotion:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al eliminar la promoción'
        });
      },
      complete: () => this.isLoading = false
    });
  }

  /**
   * Refreshes the promotions list
   */
  refreshPromotions(): void {
    this.promotionService.refreshPromotions();
  }
}
