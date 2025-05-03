import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class GlobalValidators {
// Validador personalizado para enteros y decimales
  static decimalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Si el campo está vacío, no hay error
      }
      const decimalRegex = /^\d+(\.\d{1,2})?$/; // Acepta enteros o decimales con hasta 2 decimales
      return decimalRegex.test(value) ? null : { invalidDecimal: true };
    };
  }
}
