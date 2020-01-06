import { EContinent, IProduct } from '../state-model';

export function getStateNameForDepartament(id: number, continent: EContinent): string {
  return replaceSensitiveStateChar(continent)
    .concat('_')
    .concat(id.toString());
}
export function getStateNameForLine(id: number, product: IProduct): string {
  return replaceSensitiveStateChar(product.name)
    .concat('_')
    .concat(id.toString());
}

function replaceSensitiveStateChar(name: string): string {
  return name.replace(' ', '').replace('-', '_');
}
