import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import { Cart, CartItem } from '../../../../shared/models/ecommerce/ecommerce.interface';

interface CheckoutStep {
  id: number;
  label: string;
  icon: string;
  completed: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Forms
  customerForm!: FormGroup;
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;

  // Data
  cart: Cart = {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  };

  // Checkout process
  currentStep = 0;
  steps: CheckoutStep[] = [
    { id: 0, label: 'Información', icon: 'pi pi-user', completed: false },
    { id: 1, label: 'Envío', icon: 'pi pi-truck', completed: false },
    { id: 2, label: 'Pago', icon: 'pi pi-credit-card', completed: false },
    { id: 3, label: 'Confirmación', icon: 'pi pi-check', completed: false }
  ];

  // Options
  paymentMethods: PaymentMethod[] = [
    {
      id: 'visa',
      name: 'Tarjeta de Crédito/Débito',
      icon: 'pi pi-credit-card',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'yape',
      name: 'Yape',
      icon: 'pi pi-mobile',
      description: 'Pago móvil instantáneo'
    },
    {
      id: 'plin',
      name: 'Plin',
      icon: 'pi pi-mobile',
      description: 'Pago móvil entre bancos'
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      icon: 'pi pi-building',
      description: 'Transferencia directa a cuenta'
    }
  ];

  shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Envío Estándar',
      description: 'Entrega a domicilio',
      price: 15.00,
      estimatedDays: '3-5 días'
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: 'Entrega rápida',
      price: 25.00,
      estimatedDays: '1-2 días'
    },
    {
      id: 'pickup',
      name: 'Recojo en Tienda',
      description: 'Retira en nuestro local',
      price: 0.00,
      estimatedDays: 'Mismo día'
    }
  ];

  // UI State
  loading = false;
  processingPayment = false;
  orderCompleted = false;
  selectedPaymentMethod: PaymentMethod | null = null;
  selectedShippingMethod: ShippingMethod | null = null;

  // Order details
  orderId: string = '';
  orderTotal = 0;

  constructor(
    private fb: FormBuilder,
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCart();
    this.setDefaultSelections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize all forms
   */
  private initializeForms(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      document: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.shippingForm = this.fb.group({
      address: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      district: ['', Validators.required],
      postalCode: ['', Validators.required],
      references: [''],
      sameAsBilling: [true]
    });

    this.paymentForm = this.fb.group({
      cardNumber: [''],
      cardName: [''],
      expiryDate: [''],
      cvv: [''],
      saveCard: [false]
    });
  }

  /**
   * Load cart data
   */
  private loadCart(): void {
    this.ecommerceService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;

        // Check if cart is empty
        if (cart.items.length === 0) {
          this.router.navigate(['/ecommerce/cart']);
        }
      });
  }

  /**
   * Set default selections
   */
  private setDefaultSelections(): void {
    this.selectedPaymentMethod = this.paymentMethods[0];
    this.selectedShippingMethod = this.shippingMethods[0];
    this.updateShippingCost();
  }

  /**
   * Update shipping cost
   */
  private updateShippingCost(): void {
    if (this.selectedShippingMethod) {
      this.cart.shipping = this.selectedShippingMethod.price;
      this.cart.total = this.cart.subtotal + this.cart.shipping + this.cart.tax - this.cart.discount;
    }
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.steps[this.currentStep].completed = true;
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  /**
   * Go to specific step
   */
  goToStep(stepIndex: number): void {
    if (stepIndex <= this.currentStep || this.steps[stepIndex - 1]?.completed) {
      this.currentStep = stepIndex;
    }
  }

  /**
   * Validate current step
   */
  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.customerForm.valid;
      case 1:
        return this.shippingForm.valid && this.selectedShippingMethod !== null;
      case 2:
        return this.selectedPaymentMethod !== null && this.validatePaymentForm();
      default:
        return true;
    }
  }

  /**
   * Validate payment form based on selected method
   */
    private validatePaymentForm(): boolean {
    if (!this.selectedPaymentMethod) return false;

    if (this.selectedPaymentMethod.id === 'visa') {
      return !!(this.paymentForm.get('cardNumber')?.valid &&
               this.paymentForm.get('cardName')?.valid &&
               this.paymentForm.get('expiryDate')?.valid &&
               this.paymentForm.get('cvv')?.valid);
    }

    return true; // Other payment methods don't require card validation
  }

  /**
   * Handle payment method selection
   */
  onPaymentMethodSelect(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;

    // Update form validators based on payment method
    if (method.id === 'visa') {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{16}$/)]);
      this.paymentForm.get('cardName')?.setValidators([Validators.required]);
      this.paymentForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
    } else {
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('cardName')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
    }

    this.paymentForm.updateValueAndValidity();
  }

  /**
   * Handle shipping method selection
   */
  onShippingMethodSelect(method: ShippingMethod): void {
    this.selectedShippingMethod = method;
    this.updateShippingCost();
  }

  /**
   * Process order
   */
  processOrder(): void {
    if (!this.validateCurrentStep()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Información incompleta',
        detail: 'Por favor completa toda la información requerida',
        life: 5000
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar Pedido',
      message: `¿Estás seguro de procesar el pedido por S/${this.cart.total.toFixed(2)}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, procesar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.submitOrder();
      }
    });
  }

  /**
   * Submit order
   */
  private submitOrder(): void {
    this.processingPayment = true;

    // Simulate API call
    setTimeout(() => {
      this.orderId = this.generateOrderId();
      this.orderTotal = this.cart.total;

      // Clear cart
      this.ecommerceService.clearCart();

      this.processingPayment = false;
      this.orderCompleted = true;
      this.currentStep = 3;
      this.steps[3].completed = true;

      this.messageService.add({
        severity: 'success',
        summary: 'Pedido Confirmado',
        detail: `Tu pedido #${this.orderId} ha sido procesado exitosamente`,
        life: 8000
      });
    }, 3000);
  }

  /**
   * Generate order ID
   */
  private generateOrderId(): string {
    return 'ORD-' + Date.now().toString().slice(-8).toUpperCase();
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/ecommerce/products']);
  }

  /**
   * View order details
   */
  viewOrderDetails(): void {
    // Navigate to order details page
    this.router.navigate(['/orders', this.orderId]);
  }

  /**
   * Update item quantity
   */
  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item);
    } else {
      this.ecommerceService.updateCartItemQuantity(item.id, quantity);
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(item: CartItem): void {
    this.confirmationService.confirm({
      header: 'Remover Producto',
      message: `¿Estás seguro de remover "${item.name}" del carrito?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, remover',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ecommerceService.removeFromCart(item.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Producto removido',
          detail: `${item.name} ha sido removido del carrito`,
          life: 3000
        });
      }
    });
  }

  /**
   * Apply coupon code
   */
  applyCoupon(couponCode: string): void {
    if (!couponCode.trim()) return;

    // Simulate coupon validation
    const validCoupons = ['WELCOME10', 'SAVE20', 'FIRST15'];

    if (validCoupons.includes(couponCode.toUpperCase())) {
      const discountPercent = parseInt(couponCode.slice(-2));
      this.cart.discount = this.cart.subtotal * (discountPercent / 100);
      this.cart.total = this.cart.subtotal + this.cart.shipping + this.cart.tax - this.cart.discount;

      this.messageService.add({
        severity: 'success',
        summary: 'Cupón aplicado',
        detail: `Descuento de ${discountPercent}% aplicado`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Cupón inválido',
        detail: 'El código de cupón ingresado no es válido',
        life: 3000
      });
    }
  }

  /**
   * Get form control error message
   */
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Ingresa un email válido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato inválido';
    }
    return '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Get cart item total
   */
  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  /**
   * Check if cart has products (not just services)
   */
  hasProducts(): boolean {
    return this.cart.items.some(item => item.type === 'product');
  }

  /**
   * Check if cart has services
   */
  hasServices(): boolean {
    return this.cart.items.some(item => item.type === 'service');
  }

  /**
   * Get estimated delivery date
   */
  getEstimatedDeliveryDate(): string {
    if (!this.selectedShippingMethod) return '';

    const today = new Date();
    const days = this.selectedShippingMethod.id === 'express' ? 2 :
                 this.selectedShippingMethod.id === 'pickup' ? 0 : 5;

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + days);

    return deliveryDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Track by function for ngFor performance
   */
  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }
}
