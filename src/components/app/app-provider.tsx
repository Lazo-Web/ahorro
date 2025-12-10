'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Purchase, PantryItem, ShoppingListItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as true to load from storage
  const { toast } = useToast();

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedPurchases = localStorage.getItem('purchases');
      const storedPantry = localStorage.getItem('pantry');
      const storedShoppingList = localStorage.getItem('shoppingList');

      if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
      if (storedPantry) setPantry(JSON.parse(storedPantry));
      if (storedShoppingList) setShoppingList(JSON.parse(storedShoppingList));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Could not load data",
        description: "There was an error reading your saved data.",
      });
    }
    setIsLoading(false);
  }, [toast]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('purchases', JSON.stringify(purchases));
      localStorage.setItem('pantry', JSON.stringify(pantry));
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    } catch (error) {
       console.error("Failed to save data to localStorage", error);
    }
  }, [purchases, pantry, shoppingList]);

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
        setShoppingList(prevShoppingList => {
          const isAlreadyInShoppingList = prevShoppingList.some(li => li.name.toLowerCase() === itemRemoved!.name.toLowerCase());
          if (!isAlreadyInShoppingList) {
            toast({
                title: "Added to Shopping List",
                description: `${itemRemoved.name} has been added to your shopping list.`
            });
            const newItem: ShoppingListItem = {
              id: Date.now().toString(),
              userId: 'local-user',
              name: itemRemoved.name,
              isCompleted: false,
            };
            return [...prevShoppingList, newItem];
          }
          return prevShoppingList;
        });
      }
    }, [toast]);

  const addPurchase = useCallback(
    (item: Omit<Purchase, 'id' | 'userId'>) => {
      
      setPantry(currentPantry => {
        const existingPantryItem = currentPantry.find(
          pantryItem => pantryItem.name.toLowerCase() === item.item.toLowerCase()
        );

        if (existingPantryItem) {
          toast({
            variant: 'destructive',
            title: 'Item already in pantry',
            description: `${item.item} is already in your pantry. Use it up before adding another one.`,
          });
          return currentPantry; // Return current pantry without changes
        }

        // If not in pantry, proceed to add
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

        setPurchases(prevPurchases => [...prevPurchases, newPurchase]);
        
        toast({
          title: 'Item Added',
          description: `${item.item} has been added to your pantry and purchase history.`,
        });

        return [...currentPantry, newPantryItem];
      });
    },
    [toast]
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
