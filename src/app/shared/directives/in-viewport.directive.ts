import { Directive, ElementRef, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appInViewport]'
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '0px';
  @Input() triggerOnce: boolean = true;

  @Output() inViewport = new EventEmitter<boolean>();
  @Output() enterViewport = new EventEmitter<void>();
  @Output() exitViewport = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;
  private hasTriggered = false;

  constructor(private el: ElementRef) {}

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
            const isIntersecting = entry.isIntersecting;

            this.inViewport.emit(isIntersecting);

            if (isIntersecting) {
              if (!this.hasTriggered || !this.triggerOnce) {
                this.enterViewport.emit();
                this.hasTriggered = true;
              }
            } else {
              if (!this.triggerOnce) {
                this.exitViewport.emit();
              }
            }

            // If triggerOnce is true and we've triggered, disconnect
            if (this.triggerOnce && this.hasTriggered) {
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: this.rootMargin,
          threshold: this.threshold
        }
      );

      this.observer.observe(this.el.nativeElement);
    }
  }
}
