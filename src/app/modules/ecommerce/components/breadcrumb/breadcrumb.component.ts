import { Component, Input } from '@angular/core';

interface BreadcrumbItem {
  label: string;
  routerLink?: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <a routerLink="/ecommerce/home" class="breadcrumb-link">
            <i class="pi pi-home"></i>
            <span class="sr-only">Inicio</span>
          </a>
        </li>

        <li
          class="breadcrumb-item"
          *ngFor="let item of items; let isLast = last"
          [class.active]="isLast">

          <span class="breadcrumb-separator">
            <i class="pi pi-chevron-right"></i>
          </span>

          <a
            *ngIf="!isLast && (item.routerLink || item.url)"
            [routerLink]="item.routerLink"
            [href]="item.url"
            class="breadcrumb-link">
            <i *ngIf="item.icon" [class]="item.icon"></i>
            {{ item.label }}
          </a>

          <span *ngIf="isLast || (!item.routerLink && !item.url)" class="breadcrumb-current">
            <i *ngIf="item.icon" [class]="item.icon"></i>
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      margin-bottom: 1rem;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--primary-color);
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--primary-50);
        color: var(--primary-600);
      }
    }

    .breadcrumb-current {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-color);
      font-weight: 500;
      padding: 0.25rem 0.5rem;
    }

    .breadcrumb-separator {
      color: var(--text-color-secondary);
      font-size: 0.8rem;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 768px) {
      .breadcrumb-list {
        gap: 0.25rem;
      }

      .breadcrumb-link,
      .breadcrumb-current {
        padding: 0.125rem 0.25rem;
        font-size: 0.9rem;
      }

      .breadcrumb-separator {
        font-size: 0.7rem;
      }
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
