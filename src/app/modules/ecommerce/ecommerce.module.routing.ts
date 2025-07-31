import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { EcommerceHomeComponent } from './pages/ecommerce-home/ecommerce-home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ServiceListComponent } from './pages/service-list/service-list.component';
import { ServiceDetailComponent } from './pages/service-detail/service-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: EcommerceHomeComponent,
    data: {
      title: 'AngieBraids - Productos y Servicios de Belleza',
      description: 'Descubre nuestra colección de productos y servicios para el cuidado del cabello'
    }
  },
  {
    path: 'products',
    component: ProductListComponent,
    data: {
      title: 'Productos - AngieBraids',
      description: 'Explora nuestra amplia gama de productos para el cuidado del cabello'
    }
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    data: {
      title: 'Detalle del Producto - AngieBraids',
      description: 'Conoce más sobre nuestros productos de alta calidad'
    }
  },
  {
    path: 'services',
    component: ServiceListComponent,
    data: {
      title: 'Servicios - AngieBraids',
      description: 'Servicios profesionales de peluquería y cuidado del cabello'
    }
  },
  {
    path: 'services/:id',
    component: ServiceDetailComponent,
    data: {
      title: 'Detalle del Servicio - AngieBraids',
      description: 'Información detallada sobre nuestros servicios profesionales'
    }
  },
  {
    path: 'hairstyles',
    component: ProductListComponent, // Reuse product list for hairstyles
    data: {
      title: 'Peinados - AngieBraids',
      description: 'Descubre nuestros estilos y peinados únicos',
      type: 'hairstyles'
    }
  },
  {
    path: 'hairstyles/:category',
    component: ProductListComponent,
    data: {
      title: 'Peinados por Categoría - AngieBraids',
      description: 'Explora peinados por categoría específica',
      type: 'hairstyles'
    }
  },
  {
    path: 'cart',
    component: CartComponent,
    data: {
      title: 'Carrito de Compras - AngieBraids',
      description: 'Revisa y administra tu carrito de compras'
    }
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    data: {
      title: 'Finalizar Compra - AngieBraids',
      description: 'Completa tu compra de forma segura'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
