import type { Purchase, PantryItem, ShoppingListItem } from '@/types';

export const initialPurchases: Purchase[] = [
  { id: '1', item: 'Leche', price: 1.2, date: '2024-07-20', supermarket: 'Mercadona', expiryDate: '2024-08-01' },
  { id: '2', item: 'Pan de molde', price: 0.9, date: '2024-07-20', supermarket: 'Mercadona', expiryDate: '2024-07-28' },
  { id: '3', item: 'Huevos (docena)', price: 2.5, date: '2024-07-18', supermarket: 'Carrefour', calories: 78, expiryDate: '2024-08-10' },
  { id: '4', item: 'Pechuga de pollo', price: 6.0, date: '2024-07-24', supermarket: 'Carrefour', calories: 165, expiryDate: '2024-07-27' },
  { id: '5', item: 'Manzanas', price: 1.5, date: '2024-07-15', supermarket: 'Lidl', calories: 52 },
];

export const initialPantry: PantryItem[] = [
  { id: 'p1', name: 'Leche', purchaseId: '1', expiryDate: '2024-08-01' },
  { id: 'p2', name: 'Pan de molde', purchaseId: '2', expiryDate: '2024-07-28' },
  { id: 'p3', name: 'Huevos (docena)', purchaseId: '3', expiryDate: '2024-08-10' },
  { id: 'p4', name: 'Pechuga de pollo', purchaseId: '4', expiryDate: '2024-07-27' },
  { id: 'p5', name: 'Manzanas', purchaseId: '5' },
];

export const initialShoppingList: ShoppingListItem[] = [
  { id: 's1', name: 'Pasta', isCompleted: false },
  { id: 's2', name: 'Salsa de tomate', isCompleted: false },
  { id: 's3', name: 'Queso rallado', isCompleted: true },
];

export const supermarkets = ['Mercadona', 'Carrefour', 'Lidl', 'Dia', 'Alcampo', 'Ahorramás', 'Otro'];
