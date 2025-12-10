'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Purchase, PantryItem, ShoppingListItem } from '@/types';
import { initialPurchases, initialPantry, initialShoppingList } from '@/data/mock-data';

interface AppContextType {
  purchases: Purchase[];
  pantry: PantryItem[];
  shoppingList: ShoppingListItem[];
  addPurchase: (item: Omit<Purchase, 'id' | 'date'>) => void;
  removeFromPantry: (pantryItemId: string) => void;
  addShoppingListItem: (name: string) => void;
  toggleShoppingListItem: (itemId: string) => void;
  removeShoppingListItem: (itemId: string) => void;
  clearCompletedItems: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [pantry, setPantry] = useState<PantryItem[]>(initialPantry);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(initialShoppingList);

  const addPurchase = useCallback((item: Omit<Purchase, 'id' | 'date'>) => {
    const newPurchase: Purchase = {
      ...item,
      id: `purchase-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const newPantryItem: PantryItem = {
      id: `pantry-${Date.now()}`,
      name: newPurchase.item,
      purchaseId: newPurchase.id,
    };
    setPurchases(prev => [newPurchase, ...prev]);
    setPantry(prev => [newPantryItem, ...prev]);
  }, []);

  const removeFromPantry = useCallback((pantryItemId: string) => {
    setPantry(prev => prev.filter(item => item.id !== pantryItemId));
  }, []);

  const addShoppingListItem = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newItem: ShoppingListItem = {
      id: `sli-${Date.now()}`,
      name,
      isCompleted: false,
    };
    setShoppingList(prev => [...prev, newItem]);
  }, []);

  const toggleShoppingListItem = useCallback((itemId: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  }, []);

  const removeShoppingListItem = useCallback((itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  }, []);
  
  const clearCompletedItems = useCallback(() => {
    setShoppingList(prev => prev.filter(item => !item.isCompleted));
  }, []);

  return (
    <AppContext.Provider
      value={{
        purchases,
        pantry,
        shoppingList,
        addPurchase,
        removeFromPantry,
        addShoppingListItem,
        toggleShoppingListItem,
        removeShoppingListItem,
        clearCompletedItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
