import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, Observable } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import { OrderService } from '../../../../core/services/orders/order.service';
import { Cart, CartItem } from '../../../../shared/models/ecommerce/ecommerce.interface';
import { RequestShopOrder, ProductRequest, RequestAddress } from '../../../../shared/models/orders/order.interface';
import { User } from '../../../../shared/models/auth/auth.interface';
import { Store } from '@ngrx/store';
import { SecurityState } from '../../../../../@security/interfaces/SecurityState';

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
  shoppingMethodId: number; // Added for API integration
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Injected services using new Angular patterns
  private fb = inject(FormBuilder);
  private ecommerceService = inject(EcommerceService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private store: Store<SecurityState> = inject(Store);
  // User data
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;
  // Signals for reactive state management
  cart = signal<Cart>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  });

  currentStep = signal(0);
  loading = signal(false);
  processingPayment = signal(false);
  orderCompleted = signal(false);
  selectedPaymentMethod = signal<PaymentMethod | null>(null);
  selectedShippingMethod = signal<ShippingMethod | null>(null);
  orderId = signal('');
  orderTotal = signal(0);

  // Computed values
  canProceed = computed(() => this.validateCurrentStep());
  isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  hasProducts = computed(() => this.cart().items.some(item => item.type === 'product'));
  hasServices = computed(() => this.cart().items.some(item => item.type === 'service'));

  // Forms
  customerForm!: FormGroup;
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;

  // Static data
  steps: CheckoutStep[] = [
    { id: 0, label: 'Información', icon: 'pi pi-user', completed: false },
    { id: 1, label: 'Envío', icon: 'pi pi-truck', completed: false },
    { id: 2, label: 'Pago', icon: 'pi pi-credit-card', completed: false },
    { id: 3, label: 'Confirmación', icon: 'pi pi-check', completed: false }
  ];

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
      estimatedDays: '3-5 días',
      shoppingMethodId: 1
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: 'Entrega rápida',
      price: 25.00,
      estimatedDays: '1-2 días',
      shoppingMethodId: 2
    },
    {
      id: 'pickup',
      name: 'Recojo en Tienda',
      description: 'Retira en nuestro local',
      price: 0.00,
      estimatedDays: 'Mismo día',
      shoppingMethodId: 4
    }
  ];
  constructor() {
    this.currentUser$ = this.store.select(state => state.userState.user);
  }
  ngOnInit(): void {

    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
    this.initializeForms();
    this.loadCart();
    this.setDefaultSelections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  private loadCart(): void {
    this.ecommerceService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart.set(cart);
        if (cart.items.length === 0) {
          this.router.navigate(['/ecommerce/cart']);
        }
      });
  }

  private setDefaultSelections(): void {
    this.selectedPaymentMethod.set(this.paymentMethods[0]);
    this.selectedShippingMethod.set(this.shippingMethods[0]);
    this.updateShippingCost();
  }

  private updateShippingCost(): void {
    const shippingMethod = this.selectedShippingMethod();
    if (shippingMethod) {
      const currentCart = this.cart();
      const updatedCart = {
        ...currentCart,
        shipping: shippingMethod.price,
        total: currentCart.subtotal + shippingMethod.price + currentCart.tax - currentCart.discount
      };
      this.cart.set(updatedCart);
    }
  }

  nextStep(): void {
    console.log("validateCurrentStep: ",this.validateCurrentStep());
    if (this.validateCurrentStep()) {
      const currentStepIndex = this.currentStep();
      this.steps[currentStepIndex].completed = true;

      if (currentStepIndex === 3) {
        console.log("Processing order...");
        this.processOrder();
      } else if (currentStepIndex < this.steps.length - 1) {
        this.currentStep.set(currentStepIndex + 1);
      }
    }
  }

  previousStep(): void {
    const currentStepIndex = this.currentStep();
    if (currentStepIndex > 0) {
      this.currentStep.set(currentStepIndex - 1);
    }
  }

  goToStep(stepIndex: number): void {
    const currentStepIndex = this.currentStep();
    if (stepIndex <= currentStepIndex || this.steps[stepIndex - 1]?.completed) {
      this.currentStep.set(stepIndex);
    }
  }

  validateCurrentStep(): boolean {
    const step = this.currentStep();
    switch (step) {
      case 0:
        return this.customerForm.valid;
      case 1:
        return this.shippingForm.valid && this.selectedShippingMethod() !== null;
      case 2:
        return this.selectedPaymentMethod() !== null && this.validatePaymentForm();
      case 3:
        return true;
      default:
        return false;
    }
  }

  private validatePaymentForm(): boolean {
    const paymentMethod = this.selectedPaymentMethod();
    if (!paymentMethod) return false;

    if (paymentMethod.id === 'visa') {
      return !!(
        this.paymentForm.get('cardNumber')?.valid &&
        this.paymentForm.get('cardName')?.valid &&
        this.paymentForm.get('expiryDate')?.valid &&
        this.paymentForm.get('cvv')?.valid
      );
    }
    return true;
  }

  onPaymentMethodSelect(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);

    if (method.id === 'visa') {
      this.paymentForm.get('cardNumber')?.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{16}$/)
      ]);
      this.paymentForm.get('cardName')?.setValidators([Validators.required]);
      this.paymentForm.get('expiryDate')?.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]);
      this.paymentForm.get('cvv')?.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{3,4}$/)
      ]);
    } else {
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('cardName')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
    }
    this.paymentForm.updateValueAndValidity();
  }

  onShippingMethodSelect(method: ShippingMethod): void {
    this.selectedShippingMethod.set(method);
    this.updateShippingCost();
  }

  processOrder(): void {
    console.log("validateCurrentStep: ", this.validateCurrentStep());
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
      message: `¿Estás seguro de procesar el pedido por S/${this.cart().total.toFixed(2)}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, procesar',
      rejectLabel: 'Cancelar',
      accept: () => {
        console.log('Order confirmed, submitting...');
        this.submitOrder();
      }
    });
  }

  private submitOrder(): void {
    this.processingPayment.set(true);
    this.loading.set(true);

    const orderRequest = this.buildOrderRequest();

    this.orderService.createOrder(orderRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.processingPayment.set(false);
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.orderId.set(response.shopOrderId.toString());
          this.orderTotal.set(this.cart().total);

          // Clear cart
          this.ecommerceService.clearCart();

          this.orderCompleted.set(true);
          this.currentStep.set(3);
          this.steps[3].completed = true;

          this.messageService.add({
            severity: 'success',
            summary: 'Pedido Confirmado',
            detail: `Tu pedido #${this.orderId()} ha sido procesado exitosamente`,
            life: 8000
          });
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al procesar pedido',
            detail: 'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.',
            life: 8000
          });
        }
      });
  }

  private buildOrderRequest(): RequestShopOrder {
    const cart = this.cart();
    const shippingMethod = this.selectedShippingMethod();
    console.log("Selected Shipping Method: ", shippingMethod);
    console.log("Cart Items: ", cart.items);
    // Build product list from cart
    const productList: ProductRequest[] = cart.items
      .filter(item => item.type === 'product')
      .map(item => ({
        productId: item.id,
        productQuantity: item.quantity
      }));

    // Build address from shipping form
    const address: RequestAddress = {
      adressStreet: this.shippingForm.get('address')?.value || '',
      adressCity: this.shippingForm.get('city')?.value || '',
      adressState: this.shippingForm.get('district')?.value || '',
      adressCountry: 'Perú',
      adressPostalCode: this.shippingForm.get('postalCode')?.value || ''
    };

    return {
      productRequestList: productList,
      reservationId: this.getReservationId(), // Get from cart if exists
      userId: this.getCurrentUserId(), // Get from auth service
      requestAdress: address,
      shoppingMethodId: shippingMethod?.shoppingMethodId || 1
    };
  }

  private getReservationId(): number {
    // Extract reservation ID from cart if it contains services
    const serviceItem = this.cart().items.find(item => item.type === 'service');
    return serviceItem ? serviceItem.id : 0;
  }

  private getCurrentUserId(): number {
    return Number(this.currentUser?.idUser) || 0;
  }

  continueShopping(): void {
    this.router.navigate(['/ecommerce/products']);
  }

  viewOrderDetails(): void {
    this.router.navigate(['/orders', this.orderId()]);
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item);
    } else {
      this.ecommerceService.updateCartItemQuantity(item.id, quantity);
    }
  }

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

  applyCoupon(couponCode: string): void {
    if (!couponCode.trim()) return;

    const validCoupons = ['WELCOME10', 'SAVE20', 'FIRST15'];
    if (validCoupons.includes(couponCode.toUpperCase())) {
      const discountPercent = parseInt(couponCode.slice(-2));
      const currentCart = this.cart();
      const discount = currentCart.subtotal * (discountPercent / 100);

      const updatedCart = {
        ...currentCart,
        discount: discount,
        total: currentCart.subtotal + currentCart.shipping + currentCart.tax - discount
      };

      this.cart.set(updatedCart);

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

  hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getEstimatedDeliveryDate(): string {
    const shippingMethod = this.selectedShippingMethod();
    if (!shippingMethod) return '';

    const today = new Date();
    const days = shippingMethod.id === 'express' ? 2 :
                 shippingMethod.id === 'pickup' ? 0 : 5;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + days);

    return deliveryDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
