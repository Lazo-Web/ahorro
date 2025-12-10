'use client';

import React, { createContext, useContext, useCallback } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
} from 'firebase/firestore';
import type { Purchase, PantryItem, ShoppingListItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

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
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const purchasesQuery = useMemoFirebase(
    () =>
      user
        ? collection(firestore, 'users', user.uid, 'purchases')
        : null,
    [firestore, user]
  );
  const { data: purchases, isLoading: purchasesLoading } =
    useCollection<Purchase>(purchasesQuery);

  const pantryQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'pantry') : null,
    [firestore, user]
  );
  const { data: pantry, isLoading: pantryLoading } =
    useCollection<PantryItem>(pantryQuery);

  const shoppingListQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'shoppingList') : null,
    [firestore, user]
  );
  const { data: shoppingList, isLoading: shoppingListLoading } =
    useCollection<ShoppingListItem>(shoppingListQuery);

  const isLoading = isUserLoading || purchasesLoading || pantryLoading || shoppingListLoading;

  const addShoppingListItem = useCallback(
    (name: string) => {
      if (!user || name.trim() === '') return;
      
      const existingShoppingItem = shoppingList?.find(
        shoppingItem => shoppingItem.name.toLowerCase() === name.toLowerCase()
      );
      if (existingShoppingItem) return;

      const colRef = collection(firestore, 'users', user.uid, 'shoppingList');
      addDocumentNonBlocking(colRef, { name, isCompleted: false, userId: user.uid });
    },
    [user, firestore, shoppingList]
  );

  const addPurchase = useCallback(
    async (item: Omit<Purchase, 'id' | 'userId'>) => {
      if (!user) return;

      const existingPantryItem = pantry?.find(
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
      
      const purchasesCol = collection(firestore, 'users', user.uid, 'purchases');
      const pantryCol = collection(firestore, 'users', user.uid, 'pantry');

      const newPurchaseRef = doc(purchasesCol);
      const newPantryRef = doc(pantryCol);

      const batch = writeBatch(firestore);

      const newPurchase: Purchase = {
        ...item,
        id: newPurchaseRef.id,
        userId: user.uid,
      };

      const newPantryItem: PantryItem = {
        id: newPantryRef.id,
        name: newPurchase.item,
        purchaseId: newPurchase.id,
        expiryDate: newPurchase.expiryDate,
        userId: user.uid,
      };

      batch.set(newPurchaseRef, newPurchase);
      batch.set(newPantryRef, newPantryItem);

      try {
        await batch.commit();
        toast({
            title: 'Item Added',
            description: `${item.item} has been added to your pantry and purchase history.`,
        });
      } catch (e) {
        console.error("Error adding purchase and pantry item:", e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the item. Please try again.',
        });
      }
    },
    [user, firestore, pantry, toast]
  );
  
  const removeFromPantry = useCallback(async (pantryItemId: string) => {
      if (!user) return;
      const itemToRemove = pantry?.find(item => item.id === pantryItemId);
      if (itemToRemove && !shoppingList?.some(li => li.name.toLowerCase() === itemToRemove.name.toLowerCase())) {
          addShoppingListItem(itemToRemove.name);
           toast({
              title: "Added to Shopping List",
              description: `${itemToRemove.name} has been added to your shopping list.`
          });
      }
      
      const docRef = doc(firestore, 'users', user.uid, 'pantry', pantryItemId);
      deleteDocumentNonBlocking(docRef);

    }, [user, firestore, pantry, shoppingList, toast, addShoppingListItem]
  );
  
  const toggleShoppingListItem = useCallback((itemId: string, isCompleted: boolean) => {
    if(!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'shoppingList', itemId);
    updateDocumentNonBlocking(docRef, { isCompleted: !isCompleted });
  }, [user, firestore]);


  const removeShoppingListItem = useCallback(
    (itemId: string) => {
      if (!user) return;
      const docRef = doc(firestore, 'users', user.uid, 'shoppingList', itemId);
      deleteDocumentNonBlocking(docRef);
    },
    [user, firestore]
  );

  const clearCompletedItems = useCallback(async () => {
    if (!user || !shoppingList) return;
    const batch = writeBatch(firestore);
    shoppingList.forEach(item => {
      if (item.isCompleted) {
        const docRef = doc(firestore, 'users', user.uid, 'shoppingList', item.id);
        batch.delete(docRef);
      }
    });
    await batch.commit();
  }, [user, firestore, shoppingList]);

  return (
    <AppContext.Provider
      value={{
        purchases: purchases || [],
        pantry: pantry || [],
        shoppingList: shoppingList || [],
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
