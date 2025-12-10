'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Purchase, PantryItem, ShoppingListItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialPantry, initialPurchases, initialShoppingList } from '@/data/mock-data';

interface AppContextType {
  purchases: Purchase[];
  pantry: PantryItem[];
  shoppingList: ShoppingListItem[];
  isLoading: boolean;
  addPurchase: (item: Omit<Purchase, 'id' | 'userId'>) => void;
  removeFromPantry: (pantryItemId: string) => void;
  addShoppingListItem: (name: string) => void;
  toggleShoppingListItem: (itemId: string, isCompleted: boolean) => void;
  removeShoppingListItem: (itemId: string) => void;
  clearCompletedItems: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [pantry, setPantry] = useState<PantryItem[]>(initialPantry);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(initialShoppingList);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

   const addShoppingListItem = useCallback(
    (name: string) => {
      if (name.trim() === '') return;
      
      setShoppingList(prev => {
        const existing = prev.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existing) return prev;

        const newItem: ShoppingListItem = {
          id: Date.now().toString(),
          userId: 'local-user',
          name,
          isCompleted: false,
        };
        return [...prev, newItem];
      });
    },
    []
  );

  const removeFromPantry = useCallback((pantryItemId: string) => {
      let itemRemoved: PantryItem | undefined;
      setPantry(prev => {
        itemRemoved = prev.find(i => i.id === pantryItemId);
        return prev.filter(item => item.id !== pantryItemId);
      });
      
      if (itemRemoved) {
        const isAlreadyInShoppingList = shoppingList.some(li => li.name.toLowerCase() === itemRemoved!.name.toLowerCase());
        if (!isAlreadyInShoppingList) {
          addShoppingListItem(itemRemoved.name);
          toast({
              title: "Added to Shopping List",
              description: `${itemRemoved.name} has been added to your shopping list.`
          });
        }
      }
    }, [addShoppingListItem, toast, shoppingList]);

  const addPurchase = useCallback(
    (item: Omit<Purchase, 'id' | 'userId'>) => {
      const existingPantryItem = pantry.find(
        pantryItem => pantryItem.name.toLowerCase() === item.item.toLowerCase()
      );
      if (existingPantryItem) {
        toast({
          variant: 'destructive',
          title: 'Item already in pantry',
          description: `${item.item} is already in your pantry. Use it up before adding another one.`,
        });
        return;
      }

      const purchaseId = `purchase-${Date.now()}`;
      const newPurchase: Purchase = {
        ...item,
        id: purchaseId,
        userId: 'local-user',
        date: new Date().toISOString().split('T')[0],
      };

      const newPantryItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        userId: 'local-user',
        name: newPurchase.item,
        purchaseId: newPurchase.id,
        expiryDate: newPurchase.expiryDate,
      };

      setPurchases(prev => [...prev, newPurchase]);
      setPantry(prev => [...prev, newPantryItem]);
      
      toast({
        title: 'Item Added',
        description: `${item.item} has been added to your pantry and purchase history.`,
      });
    },
    [pantry, toast]
  );
  
  const toggleShoppingListItem = useCallback((itemId: string, isCompleted: boolean) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
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
        isLoading,
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
