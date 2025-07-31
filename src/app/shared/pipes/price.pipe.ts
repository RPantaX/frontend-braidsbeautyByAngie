import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price'
})
export class PricePipe implements PipeTransform {

  transform(value: number | string, currency: string = 'PEN', includeSymbol: boolean = true): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '';
    }

    const formattedValue = numericValue.toFixed(2);

    if (includeSymbol) {
      switch (currency.toUpperCase()) {
        case 'PEN':
          return `S/ ${formattedValue}`;
        case 'USD':
          return `$ ${formattedValue}`;
        case 'EUR':
          return `€ ${formattedValue}`;
        default:
          return `${currency} ${formattedValue}`;
      }
    }

    return formattedValue;
  }
}
