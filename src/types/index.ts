export interface Purchase {
  id: string;
  userId: string;
  item: string;
  price: number;
  date: string;
  supermarket: string;
  expiryDate?: string;
  calories?: number;
}

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  purchaseId: string;
  expiryDate?: string;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  isCompleted: boolean;
}
