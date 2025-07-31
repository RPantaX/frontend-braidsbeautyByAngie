import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount'
})
export class DiscountPipe implements PipeTransform {

  transform(
    originalPrice: number,
    discountRate: number,
    type: 'amount' | 'percentage' | 'final' = 'final'
  ): string | number {
    if (!originalPrice || !discountRate || discountRate <= 0) {
      return type === 'final' ? originalPrice : 0;
    }

    const discountAmount = originalPrice * discountRate;
    const finalPrice = originalPrice - discountAmount;

    switch (type) {
      case 'amount':
        return discountAmount;
      case 'percentage':
        return Math.round(discountRate * 100);
      case 'final':
      default:
        return finalPrice;
    }
  }
}
