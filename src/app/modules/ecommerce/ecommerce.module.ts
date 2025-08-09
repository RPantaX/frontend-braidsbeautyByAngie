import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DataViewModule } from 'primeng/dataview';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { StepsModule } from 'primeng/steps';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// Shared Modules
import { SharedModule } from '../../shared/shared.module';

// Components
import { EcommerceHomeComponent } from './pages/ecommerce-home/ecommerce-home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ServiceListComponent } from './pages/service-list/service-list.component';
import { ServiceDetailComponent } from './pages/service-detail/service-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

// Shared Components
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ServiceFiltersComponent } from './components/service-filters/service-filters.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';
import { ProductImageGalleryComponent } from './components/product-image-gallery/product-image-gallery.component';
import { ServiceBookingComponent } from './components/service-booking/service-booking.component';
import { RelatedProductsComponent } from './components/related-products/related-products.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

// Pipes
import { PricePipe } from '../../shared/pipes/price.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { DiscountPipe } from '../../shared/pipes/discount.pipe';

// Directives
import { LazyLoadDirective } from '../../shared/directives/lazy-load.directive';
import { InViewportDirective } from '../../shared/directives/in-viewport.directive';
import { EcommerceRoutingModule } from './ecommerce.module.routing';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ServiceBookingContainerComponent } from './components/service-booking-container/service-booking-container.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [
    // Pages
    EcommerceHomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    ServiceListComponent,
    ServiceDetailComponent,
    CartComponent,
    CheckoutComponent,

    // Components
    ProductCardComponent,
    ServiceCardComponent,
    ProductFiltersComponent,
    ServiceFiltersComponent,
    CartSummaryComponent,
    ProductImageGalleryComponent,
    ServiceBookingComponent,
    ServiceBookingContainerComponent,
    RelatedProductsComponent,
    ReviewsComponent,
    BreadcrumbComponent,

    // Pipes
    PricePipe,
    DurationPipe,
    DiscountPipe,

    // Directives
    LazyLoadDirective,
    InViewportDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EcommerceRoutingModule,

    // PrimeNG Modules
    ButtonModule,
    CardModule,
    CarouselModule,
    RatingModule,
    TagModule,
    BadgeModule,
    InputTextModule,
    DropdownModule,
    SliderModule,
    CheckboxModule,
    RadioButtonModule,
    DataViewModule,
    PaginatorModule,
    SkeletonModule,
    ToastModule,
    GalleriaModule,
    AccordionModule,
    FieldsetModule,
    InputNumberModule,
    CalendarModule,
    StepsModule,
    DividerModule,
    ProgressBarModule,
    InputGroupModule,
    InputGroupAddonModule,
    BreadcrumbModule,
    TabViewModule,
    AvatarModule,
    DialogModule,
    SelectButtonModule,
    ProgressSpinnerModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    ConfirmationService
    // Services are provided in root, no need to add here
  ]
})
export class EcommerceModule { }
