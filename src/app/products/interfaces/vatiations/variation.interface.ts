export interface Variation {
  variationId:             number;
  variationName:           string;
  variationOptionEntities: VariationOptionEntity[];
}

export interface VariationOptionEntity {
  variationOptionId:    number;
  variationOptionValue: string;
}
