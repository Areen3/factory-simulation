export type TProductId = number;
export type TOfferId = string;
export type TOrderId = string;
export type TDepartamentId = string;
export type TLineProductionId = string;
export type TTick = number;

// REVIEW js example index type declaration
export interface IIndexStringType<TD> {
  [index: string]: TD;
}
export interface IIndexNumberType<TD> {
  [index: number]: TD;
}
