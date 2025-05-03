import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySoles'
})

export class CurrencySolesPipe implements PipeTransform {
  transform(value: any): any {
    if (value == null || isNaN(value)) {
      return 'S/ 0.00';
    }
    return 'S/ ' + Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
