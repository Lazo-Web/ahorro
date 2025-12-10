export interface Purchase {
  id: string;
  item: string;
  price: number;
  date: string;
  supermarket: string;
}

export interface PantryItem {
  id: string;
  name: string;
  purchaseId: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  isCompleted: boolean;
}
