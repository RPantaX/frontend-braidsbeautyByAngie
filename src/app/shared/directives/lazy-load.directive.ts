import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = 'assets/images/placeholder.jpg';

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    this.createObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }

    // Set placeholder initially
    this.el.nativeElement.src = this.placeholder;
    this.el.nativeElement.classList.add('lazy-loading');
  }

  private loadImage(): void {
    const img = this.el.nativeElement;
    const newImg = new Image();

    newImg.onload = () => {
      img.src = this.appLazyLoad;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
    };

    newImg.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
    };

    newImg.src = this.appLazyLoad;
  }
}
