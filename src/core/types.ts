export type CalcTypeId = "itemPrice" | "squareFeet" | "runningFeet";
export interface Rate { id: string; name: string; type: CalcTypeId; price: number; priceOnItem: number; specialType: string | null; categoryId: string; active: boolean; sortOrder: number }
export interface Category { id: string; name: string; sortOrder: number }
export interface Business { id: string; name: string; phone: string; address: string; currencySymbol: string }
export interface Settings { unit: string; areaDivisor: number; decimals: number; currency: string }
export interface RowInput { price: string; qty: string; height: string; width: string }
export interface Row { id: string; rateId: string; input: RowInput }
